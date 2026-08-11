import { CielActionSchema, type CielAction } from './cielSchemas';

export interface ParsedCielResponse {
  text: string;
  action: CielAction | null;
  validationError?: string;
}

export function parseCielResponse(rawResponse: string): ParsedCielResponse {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return { text: '', action: null };
  }

  // Regex to match fenced ```json ... ``` block at the end or within response
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = jsonRegex.exec(rawResponse);

  if (!match || !match[1]) {
    return {
      text: rawResponse.trim(),
      action: null,
    };
  }

  const jsonStr = match[1].trim();
  const textBeforeJson = rawResponse.substring(0, match.index).trim();

  try {
    const rawObj = JSON.parse(jsonStr);
    const result = CielActionSchema.safeParse(rawObj);

    if (result.success) {
      // Strips JSON block from text output so raw JSON is never rendered in chat UI
      const cleanText = textBeforeJson || (result.data.action === 'onboarding_complete' ? 'Profile confirmed. Initializing your personal system...' : 'Action processed successfully.');
      return {
        text: cleanText,
        action: result.data,
      };
    } else {
      console.warn('[CielResponseParser] Zod validation failed:', result.error.format());
      return {
        text: textBeforeJson || rawResponse.trim(),
        action: null,
        validationError: result.error.issues.map((e) => `${e.path.map(String).join('.')}: ${e.message}`).join(', '),
      };
    }
  } catch (err) {
    console.warn('[CielResponseParser] JSON parse error:', err);
    return {
      text: textBeforeJson || rawResponse.trim(),
      action: null,
      validationError: 'Invalid JSON block in response',
    };
  }
}
