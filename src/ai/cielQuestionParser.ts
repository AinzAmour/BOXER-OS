import { CielQuestionSchema } from './cielQuestionSchemas';
import type { CielQuestion } from '../types';

export interface ParsedCielQuestion {
  question: CielQuestion | null;
  text: string;
  error?: string;
}

export function parseCielQuestion(rawObj: unknown, textContext: string = ''): ParsedCielQuestion {
  if (!rawObj || typeof rawObj !== 'object') {
    return { question: null, text: textContext, error: 'Question object missing' };
  }

  const result = CielQuestionSchema.safeParse(rawObj);

  if (result.success) {
    const q = result.data;
    const formattedQuestion: CielQuestion = {
      type: q.type,
      field: q.field,
      question: q.question,
      options: q.options || undefined,
      allow_custom: q.allow_custom || undefined,
      min: q.min ?? undefined,
      max: q.max ?? undefined,
      step: q.step ?? undefined,
    };

    return {
      question: formattedQuestion,
      text: textContext || q.question,
    };
  }

  return {
    question: null,
    text: textContext,
    error: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
  };
}
