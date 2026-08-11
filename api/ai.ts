import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildServerCielPrompt } from './cielPrompts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, mode, userContext, messages } = req.body || {};

  const userQuery = prompt || (Array.isArray(messages) && messages.length > 0
    ? messages[messages.length - 1]?.content
    : '');

  if (!userQuery) {
    return res.status(400).json({ error: 'Prompt or message content is required' });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Build authoritative server system prompt based on mode + userContext
  const systemPrompt = buildServerCielPrompt(mode || 'scheduling', userContext || '{}');

  // Format message history for LLM
  const formattedMessages = [
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
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nUser Message:\n${userQuery}` },
                ],
              },
            ],
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

  // 3. Ciel Fallback Response if keys aren't configured yet
  const modeName = mode || 'scheduling';
  if (modeName === 'onboarding') {
    return res.status(200).json({
      reply:
        `Welcome to LIFE//OS. I am Ciel, the intelligence layer behind your personal system.\n\n` +
        `Let's build your profile. What should I call you?\n\n` +
        `\`\`\`json\n{\n  "action": "none"\n}\n\`\`\``,
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
