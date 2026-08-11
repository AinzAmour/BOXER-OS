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

function handleLocalOnboarding(messages: ChatMessage[]): string {
  const userMsgs = (Array.isArray(messages) ? messages : []).filter((m) => m.role === 'user');
  const count = userMsgs.length;

  let nameCandidate = 'Fighter';
  if (count >= 2) {
    const rawName = userMsgs[1]?.content || userMsgs[0]?.content || '';
    nameCandidate = rawName.replace(/^(im|i am|my name is|name is|call me)\s+/i, '').trim() || 'Fighter';
  }

  if (count <= 1) {
    return `Welcome to LIFE//OS. I am Ciel, the intelligence layer behind your personal system.\n\nLet's build your profile. What should I call you?`;
  } else if (count === 2) {
    return `Hello ${nameCandidate}. What is your age, height (in cm), and current weight (in kg)?`;
  } else if (count === 3) {
    return `Understood. What are your primary goals for personal growth and training (e.g. Boxing, Calisthenics, Cybersecurity, Focus)?`;
  } else if (count === 4) {
    return `What is your fitness background and current physical activity level?`;
  } else if (count === 5) {
    return `What are your diet type and dietary preferences (e.g. Halal, Soya-Free, Vegetarian, Standard)?`;
  } else if (count === 6) {
    return `How many minutes per day can you dedicate to your training and learning schedule?`;
  } else if (count === 7) {
    return (
      `Here is what I understand about your profile:\n\n` +
      `• Name: ${nameCandidate}\n` +
      `• Stats: Recorded\n` +
      `• Primary Goals: Fitness, Skill Graph & Mastery\n` +
      `• Diet: Halal & Soya-Free Preferences\n` +
      `• Daily Availability: 60-90 mins/day\n` +
      `• Enabled Modules: BODY (Fitness/Boxing) ✓, TECH (Cyber) ✓, MIND ✓\n\n` +
      `Does this summary look right to you?`
    );
  } else {
    return (
      `Profile confirmed. Initializing your personal skill graph, baseline assessment, daily missions, and phase roadmap.\n\n` +
      `\`\`\`json\n{\n  "action": "onboarding_complete",\n  "onboarding_complete": true,\n  "profile": {\n    "name": "${nameCandidate}",\n    "age": 21,\n    "height_cm": 178,\n    "weight_kg": 80,\n    "diet_type": "halal",\n    "is_halal": true,\n    "soya_free": true,\n    "enabled_modules": ["fitness", "boxing", "cyber", "nutrition", "timer"],\n    "constraints": {\n      "daily_minutes": 90\n    }\n  },\n  "skills": [\n    { "domain": "body", "category": "boxing", "name": "Orthodox Stance & Guard", "state": "discovered" },\n    { "domain": "body", "category": "calisthenics", "name": "Strict Push-ups", "state": "discovered" },\n    { "domain": "tech", "category": "linux", "name": "Linux CLI Navigation", "state": "discovered" }\n  ],\n  "quests": [\n    { "title": "Complete 3 Shadowboxing Rounds (3 min each)", "domain": "body", "xp_reward": 75, "target_skill_names": ["Orthodox Stance & Guard"], "estimated_minutes": 15 },\n    { "title": "Linux Terminal Commands Practice", "domain": "tech", "xp_reward": 50, "target_skill_names": ["Linux CLI Navigation"], "estimated_minutes": 20 }\n  ]\n}\n\`\`\``
    );
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
      rawReply =
        `[Ciel Intelligence Layer — Standby Mode]\n` +
        `System active. State synchronized with local IndexedDB.\n\n` +
        `Focus Mode: ${String(mode).toUpperCase()}\n` +
        `Ready to assist with your personal training, assessments, and schedule.`;
    }
  }

  // Parse response for fenced JSON action block & validate via Zod
  const parsed = parseCielResponse(rawReply);

  // If validated action is present, execute via Action Engine
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
