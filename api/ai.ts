import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemPrompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  const defaultSystemPrompt =
    systemPrompt ||
    'You are the LIFE//OS Private Executive Assistant & Scheduler. Provide structured, time-blocked daily plans, ask interactive check-in questions, and adapt training based on the user’s current local time.';

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
          messages: [
            { role: 'system', content: defaultSystemPrompt },
            { role: 'user', content: prompt },
          ],
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
                  { text: `${defaultSystemPrompt}\n\nUser Question:\n${prompt}` },
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

  // 3. Graceful Fallback Response if keys aren't configured yet
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return res.status(200).json({
    reply:
      `[LIFE//OS Private Executive Assistant]\n` +
      `Good evening! It is currently ${nowTime}.\n\n` +
      `Since it's late in the day, let's adapt your schedule so you don't overfatigue:\n\n` +
      `🕒 **Evening Schedule Plan (${nowTime} – Sleep)**:\n` +
      `• 15 mins: Light Linux CLI & Wireshark Concept Review (MIND/TECH)\n` +
      `• 10 mins: Mobility & Leg Stretch for Run-Fix Recovery (BODY)\n` +
      `• 5 mins: Set tomorrow's morning training alarm\n\n` +
      `❓ **Quick Assistant Check-in**:\n` +
      `1. What time are you planning to sleep tonight?\n` +
      `2. Would you like me to schedule your 3 shadowboxing rounds for 8:00 AM tomorrow morning?`,
    provider: 'local_assistant',
  });
}
