import { parseCielResponseEnvelope, type ParsedCielEnvelopeResult } from './cielResponseParser';
import type { CielMode, CielEnvelope } from '../types';

export interface RepairLoopResult {
  parsed: ParsedCielEnvelopeResult;
  attemptsUsed: number;
  repaired: boolean;
}

export const MAX_REPAIR_ATTEMPTS = 2;

/**
 * Constructs a minimal, targeted repair prompt to fix validation failures.
 * Excludes unnecessary historical context to minimize token usage.
 */
export function buildRepairPrompt(validationError: string, invalidSnippet: string): string {
  return [
    `CRITICAL PROTOCOL ERROR: Your previous response failed schema validation.`,
    `Validation Errors: ${validationError}`,
    `Invalid Response Snippet: ${invalidSnippet.substring(0, 300)}`,
    ``,
    `CORRECTION MANDATE:`,
    `Re-emit your response as a valid Ciel Protocol v2.0 JSON Envelope adhering strictly to one of:`,
    `1. Message: {"protocol_version": "2.0", "type": "message", "text": "your response"}`,
    `2. Question: {"protocol_version": "2.0", "type": "question", "text": "prompt", "question": {"type": "single_select|multi_select|number|scale|text", "field": "field_name", "question": "question_text", "options": ["opt1", "opt2"]}}`,
    `3. Action: {"protocol_version": "2.0", "type": "action", "text": "summary text", "action": {"action": "onboarding_complete|update_profile|create_skills|create_quests|record_evidence|reschedule", "profile": {...}, "skills": [...], "quests": [...]}}`,
    `Emit ONLY valid JSON.`,
  ].join('\n');
}

/**
 * Attempts to repair an invalid LLM response via up to MAX_REPAIR_ATTEMPTS generation calls.
 */
export async function executeRepairLoop(
  initialRawResponse: string,
  generateRepairFn: (repairPrompt: string) => Promise<string>,
  mode: CielMode
): Promise<RepairLoopResult> {
  let attempts = 1;
  let parsed = parseCielResponseEnvelope(initialRawResponse);

  if (!parsed.validationError || parsed.envelope !== null) {
    return { parsed, attemptsUsed: attempts, repaired: false };
  }

  while (attempts <= MAX_REPAIR_ATTEMPTS && parsed.validationError && parsed.envelope === null) {
    console.warn(`[ResponseRepair] Attempt ${attempts}/${MAX_REPAIR_ATTEMPTS} failed validation: ${parsed.validationError}. Requesting LLM repair...`);

    const repairPrompt = buildRepairPrompt(parsed.validationError, initialRawResponse);
    try {
      const repairedRaw = await generateRepairFn(repairPrompt);
      attempts++;
      parsed = parseCielResponseEnvelope(repairedRaw);

      if (parsed.envelope !== null) {
        console.log(`[ResponseRepair] Response successfully repaired on attempt ${attempts}`);
        return { parsed, attemptsUsed: attempts, repaired: true };
      }
    } catch (err) {
      console.error(`[ResponseRepair] Repair generation error on attempt ${attempts}:`, err);
      break;
    }
  }

  // Safe Conversational Fallback if repair attempts are exhausted
  console.warn(`[ResponseRepair] Repair attempts exhausted. Returning safe fallback response.`);
  const fallbackEnvelope: CielEnvelope = {
    protocol_version: '2.0',
    type: 'message',
    text:
      `[Ciel Intelligence Layer]\n` +
      `I processed your request, but the response envelope required refinement.\n\n` +
      `System active and synchronized in ${String(mode).toUpperCase()} mode. Please reconfirm your instruction.`,
  };

  return {
    parsed: {
      text: fallbackEnvelope.text,
      envelope: fallbackEnvelope,
      action: null,
      validationError: 'Validation repair loop exhausted',
    },
    attemptsUsed: attempts,
    repaired: false,
  };
}
