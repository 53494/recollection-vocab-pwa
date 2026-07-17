import { useEffect, useState } from 'react';

export function SpeechErrorToast() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    let timer: number | undefined;
    const handleError = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      setMessage(detail?.message || '语音朗读失败，请稍后重试。');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(''), 4000);
    };

    window.addEventListener('recollection:speech-error', handleError);
    return () => {
      window.removeEventListener('recollection:speech-error', handleError);
      window.clearTimeout(timer);
    };
  }, []);

  if (!message) return null;

  return (
    <div role="alert" className="fixed top-14 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700 shadow-sm">
      {message}
    </div>
  );
}
