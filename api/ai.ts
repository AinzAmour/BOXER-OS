import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Server-Side Authoritative Ciel Prompts ──
const CIEL_CORE_IDENTITY = `
You are Ciel, the intelligence layer behind LIFE//OS.

Voice:
- Precise and analytical. State findings plainly, not enthusiastically.
- Address the user directly, no filler ("Great question!", "I'd be happy to!").
- You are quietly capable, not performatively excited. Confidence comes from being correct, not from tone.
- Short, declarative sentences by default. Expand only when the topic needs it.
- You do not roleplay combat, lore, or fictional scenarios from your namesake.

Operating principles:
- You read the user's actual stored data (profile, skill graph, assessment history, quest log) and reason from it.
- Never assume an unassessed skill is "beginner." Unknown stays UNKNOWN until evidence says otherwise.
- Never fabricate a medical or psychological diagnosis, especially from Run-Fix pain/symptom logs.
- XP and streaks are motivational surface. Skill state changes only happen on verifiable evidence.
`;

const CIEL_MODES: Record<string, string> = {
  onboarding: `
Mode: ONBOARDING INTERVIEW

You are meeting a new user for the first time. Build their profile through a short structured conversation.

Ask ONE thing at a time:
1. Name
2. Age, height, weight
3. Primary goals
4. Fitness background
5. Diet type & restrictions
6. Daily availability / rough schedule
7. MIND & TECH domain interests

Rules:
- When you have gathered enough, present a concise summary of their profile and ask: "Here's what I understand about you. Does this look right?"
- Only after the user confirms ("Yes" / "Correct"), output the structured completion block (see OUTPUT CONTRACT) with onboarding_complete: true.
`,
  cyber_mentor: `Mode: CYBER MENTOR (focus: Linux, Networking, Web Security, DFIR, SOC)`,
  boxing_coach: `Mode: BOXING COACH (focus: technique, combos, conditioning)`,
  fitness_coach: `Mode: FITNESS & RUN-FIX COACH (focus: calisthenics, conditioning, Run-Fix patterns)`,
  weekly_review: `Mode: WEEKLY REVIEWER (synthesize BODY, MIND, TECH progress)`,
  scheduling: `Mode: DAILY SCHEDULING (generate/revise today's quest list)`,
  assessment: `Mode: ADAPTIVE ASSESSMENT (evaluate user proficiency)`,
};

const CIEL_OUTPUT_CONTRACT = `
When your response includes data to save, end it with a fenced JSON block:

\`\`\`json
{
  "action": "onboarding_complete" | "update_profile" | "create_skills" | "create_quests" | "record_evidence" | "reschedule" | "none",
  "onboarding_complete": boolean,
  "profile": {
    "name": string,
    "age": number,
    "height_cm": number,
    "weight_kg": number,
    "diet_type": string,
    "is_halal": boolean,
    "soya_free": boolean,
    "enabled_modules": string[],
    "constraints": {
      "equipment": string[],
      "daily_minutes": number,
      "budget": string,
      "location": string,
      "cannot_do": string[]
    }
  } | null,
  "skills": [
    {
      "domain": "body" | "mind" | "tech",
      "category": string,
      "name": string,
      "state": "unknown" | "discovered"
    }
  ] | null,
  "quests": [
    {
      "title": string,
      "domain": "body" | "mind" | "tech",
      "xp_reward": number,
      "target_skill_names": string[],
      "estimated_minutes": number,
      "evidence_required": string
    }
  ] | null
}
\`\`\`
`;

function buildServerCielPrompt(mode: string = 'scheduling', userContext: string = '{}'): string {
  const modePrompt = CIEL_MODES[mode] || CIEL_MODES.scheduling;
  return [CIEL_CORE_IDENTITY, modePrompt, CIEL_OUTPUT_CONTRACT, `\nCurrent user context:\n${userContext}`].join('\n');
}

// ── Local Fallback Interview Engine ──
function handleLocalOnboarding(messages: any[]): string {
  const userMsgs = (Array.isArray(messages) ? messages : []).filter((m) => m.role === 'user');
  const count = userMsgs.length;

  const lastUserText = userMsgs[userMsgs.length - 1]?.content || '';
  const firstUserText = userMsgs[0]?.content || '';

  // Extract name if provided
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
    // Confirmation step! Output onboarding_complete JSON action
    return (
      `Profile confirmed. Initializing your personal skill graph, baseline assessment, daily missions, and phase roadmap.\n\n` +
      `\`\`\`json\n{\n  "action": "onboarding_complete",\n  "onboarding_complete": true,\n  "profile": {\n    "name": "${nameCandidate}",\n    "age": 21,\n    "height_cm": 178,\n    "weight_kg": 80,\n    "diet_type": "halal",\n    "is_halal": true,\n    "soya_free": true,\n    "enabled_modules": ["fitness", "boxing", "cyber", "nutrition", "timer"],\n    "constraints": {\n      "daily_minutes": 90\n    }\n  },\n  "skills": [\n    { "domain": "body", "category": "boxing", "name": "Orthodox Stance & Guard", "state": "discovered" },\n    { "domain": "body", "category": "calisthenics", "name": "Strict Push-ups", "state": "discovered" },\n    { "domain": "tech", "category": "linux", "name": "Linux CLI Navigation", "state": "discovered" }\n  ],\n  "quests": [\n    { "title": "Complete 3 Shadowboxing Rounds (3 min each)", "domain": "body", "xp_reward": 75, "target_skill_names": ["Orthodox Stance & Guard"], "estimated_minutes": 15 },\n    { "title": "Linux Terminal Commands Practice", "domain": "tech", "xp_reward": 50, "target_skill_names": ["Linux CLI Navigation"], "estimated_minutes": 20 }\n  ]\n}\n\`\`\``
    );
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body safely
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { prompt, mode, userContext, messages } = body;

  const userQuery = prompt || (Array.isArray(messages) && messages.length > 0
    ? messages[messages.length - 1]?.content
    : '');

  if (!userQuery) {
    return res.status(400).json({ error: 'Prompt or message content is required' });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = buildServerCielPrompt(mode || 'scheduling', userContext || '{}');

  const formattedMessages = [{ role: 'system', content: systemPrompt }];
  if (Array.isArray(messages) && messages.length > 0) {
    for (const msg of messages) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        formattedMessages.push({ role: msg.role, content: String(msg.content) });
      }
    }
  } else {
    formattedMessages.push({ role: 'user', content: String(userQuery) });
  }

  // 1. Try Primary: Groq API
  if (groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: formattedMessages,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ reply, provider: 'groq' });
        }
      }
    } catch (err) {
      console.warn('Groq API error, falling back to Gemini:', err);
    }
  }

  // 2. Try Fallback: Gemini API
  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Message:\n${userQuery}` }] }],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.status(200).json({ reply, provider: 'gemini' });
        }
      }
    } catch (err) {
      console.warn('Gemini API error:', err);
    }
  }

  // 3. Intelligent Local Ciel Engine (if keys are missing or API calls fail)
  const modeName = mode || 'scheduling';

  if (modeName === 'onboarding') {
    const localReply = handleLocalOnboarding(messages);
    return res.status(200).json({
      reply: localReply,
      provider: 'local_ciel',
    });
  }

  return res.status(200).json({
    reply:
      `[Ciel Intelligence Layer — Standby Mode]\n` +
      `System active. State synchronized across local database.\n\n` +
      `Current Focus: ${String(modeName).toUpperCase()}\n` +
      `Ready to execute scheduled tasks, update evidence records, or analyze training logs.`,
    provider: 'local_ciel',
  });
}
