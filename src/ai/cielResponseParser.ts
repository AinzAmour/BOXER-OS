import { CielEnvelopeSchema, CielActionPayloadSchema, type CielAction } from './cielSchemas';
import { parseCielQuestion } from './cielQuestionParser';
import type { CielEnvelope } from '../types';

export interface ParsedCielEnvelopeResult {
  text: string;
  envelope: CielEnvelope | null;
  action: CielAction | null;
  validationError?: string;
}

export function parseCielResponseEnvelope(rawResponse: string): ParsedCielEnvelopeResult {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return {
      text: '',
      envelope: { protocol_version: '2.0', type: 'message', text: '' },
      action: null,
    };
  }

  const trimmed = rawResponse.trim();

  // Look for JSON block in markdown fenced format ```json ... ``` or raw JSON
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = jsonRegex.exec(trimmed);

  let jsonStr = '';
  let textBeforeJson = trimmed;

  if (match && match[1]) {
    jsonStr = match[1].trim();
    textBeforeJson = trimmed.substring(0, match.index).trim();
  } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    jsonStr = trimmed;
    textBeforeJson = '';
  }

  if (jsonStr) {
    try {
      const rawObj = JSON.parse(jsonStr);

      // 1. Check if rawObj matches Protocol v2.0 Envelope Schema directly
      const envelopeResult = CielEnvelopeSchema.safeParse(rawObj);
      if (envelopeResult.success) {
        const env = envelopeResult.data;
        let parsedAction: CielAction | null = null;

        if (env.type === 'action') {
          parsedAction = env.action as CielAction;
        }

        return {
          text: env.text || textBeforeJson || 'Processing...',
          envelope: env as CielEnvelope,
          action: parsedAction,
        };
      }

      // 2. Check if rawObj is a direct action payload (legacy/direct JSON output compatibility)
      const actionResult = CielActionPayloadSchema.safeParse(rawObj);
      if (actionResult.success && actionResult.data.action !== 'none') {
        const actionPayload = actionResult.data;
        const envText = textBeforeJson || (actionPayload.action === 'onboarding_complete' ? 'Profile confirmed. Initializing system...' : 'Action processed.');

        const actionEnv: CielEnvelope = {
          protocol_version: '2.0',
          type: 'action',
          text: envText,
          action: actionPayload,
        };

        return {
          text: envText,
          envelope: actionEnv,
          action: actionPayload,
        };
      }

      // 3. Check if rawObj is a question payload directly
      if (rawObj.type && ['single_select', 'multi_select', 'number', 'scale', 'text'].includes(rawObj.type) && rawObj.question) {
        const parsedQ = parseCielQuestion(rawObj, textBeforeJson);
        if (parsedQ.question) {
          const qEnv: CielEnvelope = {
            protocol_version: '2.0',
            type: 'question',
            text: textBeforeJson || parsedQ.question.question,
            question: parsedQ.question,
          };

          return {
            text: qEnv.text,
            envelope: qEnv,
            action: null,
          };
        }
      }

      // If JSON was present but didn't match any schema, log validation error
      const issues = envelopeResult.error ? envelopeResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') : 'Unrecognized JSON response format';
      return {
        text: textBeforeJson || trimmed,
        envelope: null,
        action: null,
        validationError: issues,
      };
    } catch (err) {
      return {
        text: textBeforeJson || trimmed,
        envelope: null,
        action: null,
        validationError: 'JSON syntax parse failure',
      };
    }
  }

  // Pure text message envelope fallback
  const messageEnv: CielEnvelope = {
    protocol_version: '2.0',
    type: 'message',
    text: trimmed,
  };

  return {
    text: trimmed,
    envelope: messageEnv,
    action: null,
  };
}

export function parseCielResponse(rawResponse: string) {
  const result = parseCielResponseEnvelope(rawResponse);
  return {
    text: result.text,
    action: result.action,
    validationError: result.validationError,
  };
}
