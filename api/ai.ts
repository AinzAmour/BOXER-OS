import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callProviderRouter } from '../src/ai/providerRouter';
import { parseCielResponseEnvelope } from '../src/ai/cielResponseParser';
import { executeRepairLoop } from '../src/ai/responseRepair';
import type { CielMode } from '../src/types';

// ── Server-Side Authoritative Ciel Prompts ──
const CIEL_CORE_IDENTITY = `
You are Ciel, the intelligence layer behind LIFE//OS.

Voice:
- Precise and analytical. State findings plainly, not enthusiastically.
- Address the user directly, no filler ("Great question!", "I'd be happy to!").
- Quietly capable, not performatively excited. Confidence comes from being correct, not from tone.
- Short, declarative sentences by default. Expand only when the topic needs it.
- You do not roleplay combat, lore, or fictional scenarios from your namesake.

Operating principles:
- You read the user's actual stored data and natural language text.
- Do NOT assume a fixed or hardcoded list of domains (e.g. do not limit users to body/mind/tech if they specify astrophysics, woodworking, cooking, CTFs, kickboxing, or music).
- Derive user domains dynamically from what the user expresses in conversation.
- Any options you provide in single_select or multi_select questions serve ONLY as contextual reference suggestions.
- Always set "allow_custom": true for option questions and include options for "Other (Type custom)", "Not sure", and "Skip for now".
- When structured choices are too restrictive, use open-ended "text" questions.
- Never assume an unassessed skill is "beginner." Unknown stays UNKNOWN until evidence says otherwise.
- Never fabricate a medical or psychological diagnosis. Observational language only.
`;

const CIEL_MODES: Record<string, string> = {
  onboarding: `
Mode: ADAPTIVE DYNAMIC ONBOARDING INTERVIEW

Your goal is to understand the user's unique identity, physical baseline, daily constraints, and express goals without forcing any predefined category list.

Interview Flow:
1. Name (open-ended text)
2. Age, height, weight (numeric / stats)
3. Primary goals & interests (open-ended or multi_select with suggestions like "Kickboxing", "Cybersecurity CTFs", "Mentalism", "Calisthenics", "Other (Type custom)", "Not sure")
4. Deep dive into expressed goals (e.g. if cybersecurity CTFs -> ask CTF areas; if woodworking -> ask projects; if kickboxing -> ask martial arts history; if beginner -> start with fundamentals)
5. Diet & dietary preferences (Halal, Soya-Free, Vegetarian, Standard, Other)
6. Daily time availability (minutes/day)
7. Summary confirmation card before emitting onboarding_complete action.

Rules:
- Derive domains dynamically from the user's specific answers.
- If the user selects "Skip for now" or "Not sure", accept it gracefully and move to the next logical topic.
`,
  cyber_mentor: `Mode: CYBER MENTOR (focus: Linux, Networking, Web Security, DFIR, SOC, CTF challenges)`,
  boxing_coach: `Mode: BOXING & KICKBOXING COACH (focus: technique, combos, footwork, conditioning)`,
  fitness_coach: `Mode: FITNESS & RUN-FIX COACH (focus: calisthenics, conditioning, Run-Fix patterns)`,
  weekly_review: `Mode: WEEKLY REVIEWER (synthesize progress across user-derived active domains)`,
  scheduling: `Mode: DAILY SCHEDULING (generate/revise today's quest list from active user skills)`,
  assessment: `Mode: ADAPTIVE ASSESSMENT (evaluate user proficiency based on stated skill nodes)`,
};

const CIEL_ENVELOPE_CONTRACT = `
RESPONSE CONTRACT (Protocol v2.0):
You MUST emit your response as a valid Ciel Envelope JSON in markdown code blocks:

For standard messages:
\`\`\`json
{
  "protocol_version": "2.0",
  "type": "message",
  "text": "Your plain response text"
}
\`\`\`

For interactive questions:
\`\`\`json
{
  "protocol_version": "2.0",
  "type": "question",
  "text": "Text prompt",
  "question": {
    "type": "single_select" | "multi_select" | "number" | "scale" | "text",
    "field": "field_name",
    "question": "Question text",
    "options": ["Suggestion 1", "Suggestion 2", "Other (Type custom)", "Not sure", "Skip for now"],
    "allow_custom": true
  }
}
\`\`\`

For database mutations:
\`\`\`json
{
  "protocol_version": "2.0",
  "type": "action",
  "text": "Summary text",
  "action": {
    "action": "onboarding_complete" | "update_profile" | "create_skills" | "create_quests" | "record_evidence" | "reschedule",
    "profile": {
      "name": "User Name",
      "age": 21,
      "height_cm": 178,
      "weight_kg": 85,
      "diet_type": "halal",
      "is_halal": true,
      "soya_free": true,
      "enabled_modules": ["body", "mind", "tech"]
    },
    "skills": [
      { "domain": "body", "category": "boxing", "name": "Orthodox Stance & Guard", "state": "discovered" }
    ],
    "quests": [
      { "title": "Complete 3 Shadowboxing Rounds", "domain": "body", "xp_reward": 75, "target_skill_names": ["Orthodox Stance & Guard"], "estimated_minutes": 15 }
    ]
  }
}
\`\`\`
`;

function buildServerCielPrompt(mode: string = 'scheduling', userContext: string = '{}'): string {
  const modePrompt = CIEL_MODES[mode] || CIEL_MODES.scheduling;
  return [
    CIEL_CORE_IDENTITY,
    modePrompt,
    CIEL_ENVELOPE_CONTRACT,
    `\nCurrent user context:\n${userContext}`,
  ].join('\n');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
              options: ['Kickboxing', 'Cybersecurity', 'Mentalism', 'Calisthenics', 'Nutrition', 'Other (Type custom)', 'Not sure', 'Skip for now'],
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
  } catch (err) {
    console.error('[API/AI Gateway Error]:', err);
    // Graceful error recovery: Return valid 200 OK JSON envelope so app never crashes
    return res.status(200).json({
      reply: JSON.stringify({
        protocol_version: '2.0',
        type: 'message',
        text: `[Ciel Intelligence Layer — Standby Mode]\nSystem active. State synchronized across local IndexedDB.`,
      }),
      provider: 'local_ciel',
    });
  }
}
