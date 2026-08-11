import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildServerCielPrompt } from './cielPrompts';
import { callProviderRouter } from '../src/ai/providerRouter';
import { parseCielResponseEnvelope } from '../src/ai/cielResponseParser';
import { executeRepairLoop } from '../src/ai/responseRepair';
import type { CielMode } from '../src/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body safely
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { prompt, mode, userContext, messages } = body;

  const modeName: CielMode = (mode as CielMode) || 'scheduling';
  const userQuery = prompt || (Array.isArray(messages) && messages.length > 0
    ? messages[messages.length - 1]?.content
    : '');

  if (!userQuery) {
    return res.status(400).json({ error: 'Prompt or message content is required' });
  }

  // 1. Build server-owned authoritative Ciel system prompt
  const systemPrompt = buildServerCielPrompt(modeName, userContext || '{}');

  // 2. Format conversation messages for LLM provider
  const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  if (Array.isArray(messages) && messages.length > 0) {
    for (const msg of messages) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        formattedMessages.push({ role: msg.role, content: String(msg.content) });
      }
    }
  } else {
    formattedMessages.push({ role: 'user', content: String(userQuery) });
  }

  // 3. Call Provider Router (Groq -> Gemini -> Local Fallback)
  const providerRes = await callProviderRouter({
    systemPrompt,
    formattedMessages,
    userQuery,
  });

  // 4. Validate & Repair Loop (Max 2 retries if Zod schema validation fails)
  let finalEnvelopeText = providerRes.rawResponse;
  let finalProvider = providerRes.providerUsed;

  if (providerRes.rawResponse) {
    const repairResult = await executeRepairLoop(
      providerRes.rawResponse,
      async (repairPrompt: string) => {
        const repairMessages = [
          ...formattedMessages,
          { role: 'assistant' as const, content: providerRes.rawResponse },
          { role: 'user' as const, content: repairPrompt },
        ];
        const repairCall = await callProviderRouter({
          systemPrompt,
          formattedMessages: repairMessages,
          userQuery: repairPrompt,
        });
        return repairCall.rawResponse;
      },
      modeName
    );

    const parsedEnv = repairResult.parsed;
    if (parsedEnv.envelope) {
      finalEnvelopeText = JSON.stringify(parsedEnv.envelope);
    } else {
      finalEnvelopeText = parsedEnv.text;
    }
  }

  // If no raw response was generated, use Local Ciel Engine
  if (!finalEnvelopeText) {
    finalProvider = 'local_ciel';
    if (modeName === 'onboarding') {
      const userCount = (Array.isArray(messages) ? messages : []).filter((m) => m.role === 'user').length;
      let nameCandidate = 'Fighter';
      if (userCount >= 2) {
        const rawName = messages[1]?.content || messages[0]?.content || '';
        nameCandidate = String(rawName).replace(/^(im|i am|my name is|name is|call me)\s+/i, '').trim() || 'Fighter';
      }

      if (userCount <= 1) {
        finalEnvelopeText = JSON.stringify({
          protocol_version: '2.0',
          type: 'question',
          text: `Welcome to LIFE//OS. I am Ciel, the intelligence layer behind your personal system. What should I call you?`,
          question: {
            type: 'text',
            field: 'name',
            question: 'What is your name?',
          },
        });
      } else if (userCount === 2) {
        finalEnvelopeText = JSON.stringify({
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
      } else if (userCount === 3) {
        finalEnvelopeText = JSON.stringify({
          protocol_version: '2.0',
          type: 'question',
          text: `Got it. What are your primary goals for personal mastery?`,
          question: {
            type: 'multi_select',
            field: 'goals',
            question: 'Select your primary goals',
            options: ['Kickboxing', 'Cybersecurity', 'Mentalism', 'Calisthenics', 'Nutrition'],
            allow_custom: true,
          },
        });
      } else {
        finalEnvelopeText = JSON.stringify({
          protocol_version: '2.0',
          type: 'action',
          text: `Profile confirmed. Initializing your personal skill graph, baseline assessment, daily missions, and phase roadmap.`,
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
    } else {
      finalEnvelopeText = JSON.stringify({
        protocol_version: '2.0',
        type: 'message',
        text: `[Ciel Intelligence Layer — Standby Mode]\nSystem active in ${String(modeName).toUpperCase()} mode. State synchronized across local database.`,
      });
    }
  }

  return res.status(200).json({
    reply: finalEnvelopeText,
    provider: finalProvider,
  });
}
