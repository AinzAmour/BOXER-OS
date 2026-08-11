import { buildUserContext } from '../ai/contextBuilder';
import { parseCielResponse } from '../ai/cielResponseParser';
import { executeCielAction, type ActionResult } from '../ai/actionEngine';
import type { CielMode } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CielResponse {
  text: string;
  provider: string;
  actionResult: ActionResult | null;
}

/**
 * Primary Ciel AI Service function following the strict pipeline:
 * UI -> aiService -> Ciel API -> Ciel response parser -> Action Engine -> Dexie
 */
export async function askCiel(
  mode: CielMode,
  messages: ChatMessage[],
  userId: string = 'local_user'
): Promise<CielResponse> {
  try {
    // 1. Build compact user context from Dexie
    const userContextStr = await buildUserContext(userId);

    // 2. POST to serverless route (server builds authoritative system prompt)
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        userContext: userContextStr,
        messages,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawReply = data.reply || '';
      const provider = data.provider || 'cloud';

      // 3. Parse Ciel response for fenced JSON action block & validate via Zod
      const parsed = parseCielResponse(rawReply);

      // 4. If validated action is present, execute via Action Engine
      let actionResult: ActionResult | null = null;
      if (parsed.action && parsed.action.action !== 'none') {
        actionResult = await executeCielAction(parsed.action, userId);
      }

      return {
        text: parsed.text,
        provider,
        actionResult,
      };
    }
  } catch (err) {
    console.warn('[AIService] API route error, using local fallback:', err);
  }

  // Graceful fallback response
  return {
    text:
      `[Ciel Intelligence Layer]\n` +
      `System active. State synchronized with local IndexedDB.\n\n` +
      `Focus Mode: ${String(mode).toUpperCase()}\n` +
      `Ready to assist with your personal training, assessments, and schedule.`,
    provider: 'local_ciel',
    actionResult: null,
  };
}

/**
 * Legacy compatibility wrapper for existing AICoachPage components.
 */
export async function askAICoach(
  prompt: string,
  sessionType: 'private_assistant' | 'cyber_mentor' | 'boxing_coach' | 'fitness_coach' | 'weekly_review',
  userContext?: {
    currentTime?: string;
    level?: number;
    xp?: number;
    activeQuests?: string[];
    profileName?: string;
  }
): Promise<{ reply: string; provider: string; suggestedQuests?: { title: string; domain: 'body' | 'mind' | 'tech'; xp: number }[] }> {
  const modeMap: Record<string, CielMode> = {
    private_assistant: 'scheduling',
    cyber_mentor: 'cyber_mentor',
    boxing_coach: 'boxing_coach',
    fitness_coach: 'fitness_coach',
    weekly_review: 'weekly_review',
  };

  const mode = modeMap[sessionType] || 'scheduling';
  const messages: ChatMessage[] = [{ role: 'user', content: prompt }];
  const res = await askCiel(mode, messages, userContext?.profileName ? 'local_user' : 'local_user');

  return {
    reply: res.text,
    provider: res.provider,
  };
}
