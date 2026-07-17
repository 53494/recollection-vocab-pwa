import { describe, expect, it } from 'vitest';
import { createWordFormsRegex, getWordForms, replaceWordForms } from './wordForms';

describe('getWordForms', () => {
  it('处理辅音字母加 y 的变形', () => {
    expect(getWordForms('accompany')).toEqual(expect.arrayContaining([
      'accompany',
      'accompanies',
      'accompanied',
      'accompanying',
    ]));
  });

  it('处理不发音 e 的变形', () => {
    expect(getWordForms('accommodate')).toEqual(expect.arrayContaining([
      'accommodate',
      'accommodates',
      'accommodated',
      'accommodating',
    ]));
  });

  it('处理短词的常见双写变形', () => {
    expect(getWordForms('stop')).toEqual(expect.arrayContaining([
      'stopped',
      'stopping',
    ]));
  });
});

describe('createWordFormsRegex', () => {
  it('忽略大小写并匹配标点旁的完整词', () => {
    const matches = 'Accompanied, she left. He accompanied her.'.match(createWordFormsRegex('accompany')!);
    expect(matches).toEqual(['Accompanied', 'accompanied']);
  });

  it('不会误匹配其他单词中的子串', () => {
    expect('unaccompanied accompaniment'.match(createWordFormsRegex('accompany')!)).toBeNull();
  });
});

describe('replaceWordForms', () => {
  it('挖空句子中的目标词变形', () => {
    expect(replaceWordForms(
      'She accompanied her mother to the hospital.',
      'accompany',
      '＿＿＿＿＿',
    )).toBe('She ＿＿＿＿＿ her mother to the hospital.');
  });
});
