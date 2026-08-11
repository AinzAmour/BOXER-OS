import { z } from 'zod';
import type { CielQuestion } from '../types';

export const CielQuestionSchema = z.object({
  type: z.enum(['text', 'single_select', 'multi_select', 'number', 'scale']),
  field: z.string().min(1).max(100),
  question: z.string().min(1).max(500),
  options: z.array(z.string()).nullish(),
  allow_custom: z.boolean().nullish(),
  min: z.coerce.number().nullish(),
  max: z.coerce.number().nullish(),
  step: z.coerce.number().nullish(),
});

export type CielQuestionProposal = z.infer<typeof CielQuestionSchema>;

/**
 * Validates a client-submitted answer against the server question definition.
 */
export function validateQuestionAnswer(
  question: CielQuestion,
  answer: string | number | string[]
): { valid: boolean; error?: string } {
  if (answer === undefined || answer === null || answer === '') {
    return { valid: false, error: 'Answer cannot be empty' };
  }

  switch (question.type) {
    case 'single_select': {
      const strVal = String(answer).trim();
      if (!question.options || question.options.length === 0) {
        return { valid: true };
      }
      if (question.options.includes(strVal)) {
        return { valid: true };
      }
      if (question.allow_custom) {
        return { valid: true };
      }
      return {
        valid: false,
        error: `Selected option "${strVal}" is not in available options`,
      };
    }

    case 'multi_select': {
      const arr = Array.isArray(answer) ? answer : [String(answer)];
      if (arr.length === 0) {
        return { valid: false, error: 'At least one option must be selected' };
      }
      if (!question.options || question.options.length === 0) {
        return { valid: true };
      }
      if (!question.allow_custom) {
        const invalidItem = arr.find((item) => !question.options!.includes(String(item)));
        if (invalidItem) {
          return {
            valid: false,
            error: `Option "${invalidItem}" is not a valid selection`,
          };
        }
      }
      return { valid: true };
    }

    case 'number': {
      const numVal = Number(answer);
      if (isNaN(numVal)) {
        return { valid: false, error: 'Answer must be a valid number' };
      }
      if (question.min !== undefined && question.min !== null && numVal < question.min) {
        return { valid: false, error: `Value must be at least ${question.min}` };
      }
      if (question.max !== undefined && question.max !== null && numVal > question.max) {
        return { valid: false, error: `Value must be at most ${question.max}` };
      }
      return { valid: true };
    }

    case 'scale': {
      const numVal = Number(answer);
      if (isNaN(numVal)) {
        return { valid: false, error: 'Scale answer must be a valid number' };
      }
      const min = question.min ?? 1;
      const max = question.max ?? 10;
      if (numVal < min || numVal > max) {
        return { valid: false, error: `Scale value must be between ${min} and ${max}` };
      }
      return { valid: true };
    }

    case 'text':
    default: {
      const strVal = String(answer).trim();
      if (strVal.length > 1000) {
        return { valid: false, error: 'Answer text exceeds maximum length' };
      }
      return { valid: true };
    }
  }
}
