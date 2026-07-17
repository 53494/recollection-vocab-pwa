export type SpeechErrorCode = 'unsupported' | 'blocked' | 'voice-unavailable' | 'synthesis-failed';

export class SpeechPlaybackError extends Error {
  constructor(
    public code: SpeechErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'SpeechPlaybackError';
  }
}

interface SpeakOptions {
  lang?: string;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechPlaybackError) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let playbackId = 0;

function notifySpeechError(error: SpeechPlaybackError): void {
  window.dispatchEvent(new CustomEvent('recollection:speech-error', {
    detail: { message: error.message },
  }));
}

function getEnglishVoice(synth: SpeechSynthesis, lang: string): SpeechSynthesisVoice | undefined {
  const voices = synth.getVoices();
  const normalized = lang.toLowerCase();
  return voices.find((voice) => voice.lang.toLowerCase() === normalized)
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('en-'))
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('en'));
}

/**
 * 使用浏览器 Web Speech API 朗读英文。
 * 统一处理 voice 选择、连续点击取消竞态和静默失败提示。
 */
export function speakEnglish(text: string, options: SpeakOptions = {}): void {
  const content = text.trim();
  if (!content) return;

  if (
    typeof window.speechSynthesis === 'undefined'
    || typeof window.SpeechSynthesisUtterance === 'undefined'
  ) {
    const error = new SpeechPlaybackError('unsupported', '当前浏览器不支持语音朗读，请尝试使用最新版 Chrome。');
    options.onError?.(error);
    notifySpeechError(error);
    return;
  }

  const synth = window.speechSynthesis;
  const currentId = ++playbackId;
  const lang = options.lang ?? 'en-US';
  synth.cancel();

  // Chrome/Android 在 cancel 后立即 speak 偶尔会静默，延迟到下一轮任务再开始。
  window.setTimeout(() => {
    if (currentId !== playbackId) return;

    const utterance = new SpeechSynthesisUtterance(content);
    const voice = getEnglishVoice(synth, lang);
    utterance.lang = voice?.lang ?? lang;
    utterance.rate = options.rate ?? 0.85;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      if (currentId === playbackId) options.onStart?.();
    };
    utterance.onend = () => {
      if (currentId !== playbackId) return;
      activeUtterance = null;
      options.onEnd?.();
    };
    utterance.onerror = (event) => {
      if (currentId !== playbackId || event.error === 'canceled' || event.error === 'interrupted') return;
      activeUtterance = null;
      const blocked = event.error === 'not-allowed';
      const error = new SpeechPlaybackError(
        blocked ? 'blocked' : 'synthesis-failed',
        blocked
          ? '浏览器阻止了自动朗读，请点击喇叭按钮重试。'
          : '语音朗读失败，请检查设备媒体音量后重试。',
      );
      options.onError?.(error);
      notifySpeechError(error);
    };

    activeUtterance = utterance;
    synth.resume();
    synth.speak(utterance);
  }, 40);
}

export function stopSpeaking(): void {
  playbackId += 1;
  activeUtterance = null;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
