import { buildUserContext } from '../ai/contextBuilder';
import { parseCielResponseEnvelope } from '../ai/cielResponseParser';
import { executeCielAction, type ActionResult } from '../ai/actionEngine';
import type { CielMode, CielEnvelope } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CielResponse {
  text: string;
  provider: string;
  actionResult: ActionResult | null;
  envelope: CielEnvelope | null;
}

function handleLocalOnboarding(messages: ChatMessage[]): string {
  const userMsgs = (Array.isArray(messages) ? messages : []).filter((m) => m.role === 'user');
  const count = userMsgs.length;

  let nameCandidate = 'Fighter';
  if (count >= 2) {
    const rawName = userMsgs[1]?.content || userMsgs[0]?.content || '';
    nameCandidate = rawName.replace(/^(im|i am|my name is|name is|call me)\s+/i, '').trim() || 'Fighter';
  }

  if (count <= 1) {
    return JSON.stringify({
      protocol_version: '2.0',
      type: 'question',
      text: `Welcome to LIFE//OS. I am Ciel, the intelligence layer behind your personal system. What should I call you?`,
      question: {
        type: 'text',
        field: 'name',
        question: 'What is your name?',
      },
    });
  } else if (count === 2) {
    return JSON.stringify({
      protocol_version: '2.0',
      type: 'question',
      text: `Hello ${nameCandidate}. What is your age, height, and weight?`,
      question: {
        type: 'number',
        field: 'age',
        question: 'Enter your age',
        min: 10,
        max: 120,
      },
    });
  } else if (count === 3) {
    return JSON.stringify({
      protocol_version: '2.0',
      type: 'question',
      text: `Understood. What are your primary goals for personal growth and training?`,
      question: {
        type: 'multi_select',
        field: 'goals',
        question: 'Select your primary goals',
        options: ['Kickboxing', 'Cybersecurity', 'Mentalism', 'Calisthenics', 'Nutrition'],
        allow_custom: true,
      },
    });
  } else {
    return JSON.stringify({
      protocol_version: '2.0',
      type: 'action',
      text: `Profile confirmed for ${nameCandidate}. Initializing your personal skill graph, baseline assessment, daily missions, and phase roadmap.`,
      action: {
        action: 'onboarding_complete',
        onboarding_complete: true,
        profile: {
          name: nameCandidate,
          age: 21,
          height_cm: 178,
          weight_kg: 80,
          diet_type: 'halal',
          is_halal: true,
          soya_free: true,
          enabled_modules: ['body', 'mind', 'tech'],
        },
        skills: [
          { domain: 'body', category: 'boxing', name: 'Orthodox Stance & Guard', state: 'discovered' },
          { domain: 'body', category: 'calisthenics', name: 'Strict Push-ups', state: 'discovered' },
          { domain: 'tech', category: 'linux', name: 'Linux CLI Navigation', state: 'discovered' },
        ],
        quests: [
          { title: 'Complete 3 Shadowboxing Rounds (3 min each)', domain: 'body', xp_reward: 75, target_skill_names: ['Orthodox Stance & Guard'], estimated_minutes: 15 },
          { title: 'Linux Terminal Commands Practice', domain: 'tech', xp_reward: 50, target_skill_names: ['Linux CLI Navigation'], estimated_minutes: 20 },
        ],
      },
    });
  }
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
  let rawReply = '';
  let provider = 'local_ciel';

  try {
    const userContextStr = await buildUserContext(userId);

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
      rawReply = data.reply || '';
      provider = data.provider || 'cloud';
    }
  } catch (err) {
    console.warn('[AIService] API route error, using local Ciel engine:', err);
  }

  // Fallback to local Ciel engine if API call did not yield a response
  if (!rawReply) {
    if (mode === 'onboarding') {
      rawReply = handleLocalOnboarding(messages);
    } else {
      rawReply = JSON.stringify({
        protocol_version: '2.0',
        type: 'message',
        text: `[Ciel Intelligence Layer — Standby Mode]\nSystem active. State synchronized with local IndexedDB.\nFocus Mode: ${String(mode).toUpperCase()}`,
      });
    }
  }

  // Parse response envelope & validate via Zod
  const parsed = parseCielResponseEnvelope(rawReply);

  // If validated action is present, execute via Action Engine
  let actionResult: ActionResult | null = null;
  if (parsed.action && parsed.action.action !== 'none') {
    actionResult = await executeCielAction(parsed.action, userId);
  }

  return {
    text: parsed.text,
    provider,
    actionResult,
    envelope: parsed.envelope,
  };
}

/**
 * Compatibility wrapper for AICoachPage components.
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
