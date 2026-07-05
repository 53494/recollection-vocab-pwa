export interface AIWordCheck {
  word: string;
  correctSpelling: string;
  synonyms: string[];
  usedInAnswer: boolean;
  correctlySpelled: boolean;
  note: string;
}

export interface AIGrammarIssue {
  original: string;
  correction: string;
  explanation: string;
}

export interface AICollocationIssue {
  original: string;
  correction: string;
  explanation: string;
}

export interface AIIdiomHighlight {
  expression: string;
  meaning: string;
  usage: string;
}

export interface AIFeedback {
  overallAssessment: string;
  targetWordCorrect: boolean;
  targetWordUsed: string;
  unrememberedWords: AIWordCheck[];
  grammarIssues: AIGrammarIssue[];
  collocationIssues: AICollocationIssue[];
  originalSentence: {
    english: string;
    idiomaticExpressions: AIIdiomHighlight[];
  };
  suggestedAccumulation: {
    expression: string;
    contextSentence: string;
    chineseTranslation: string;
  } | null;
  score: number;
}
