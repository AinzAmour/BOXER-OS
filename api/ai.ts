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
            { role: 'system', content: systemPrompt || 'You are LIFE//OS AI, a tactical mentor for Body, Mind, and Tech mastery.' },
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
                  { text: `${systemPrompt || 'You are LIFE//OS AI, a tactical mentor.'}\n\nUser Question:\n${prompt}` },
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
  return res.status(200).json({
    reply:
      `[LIFE//OS AI Offline Mode]\n` +
      `System Analysis for Fighter (85kg, Day 0 Baseline):\n` +
      `- Training Focus: Phase 1 Beginner Boxing Fundamentals & Run-Fix Diagnostic.\n` +
      `- Tech Focus: Linux CLI & TCP/IP Networking Basics.\n` +
      `- Recommendation: Complete today's shadowboxing rounds and Wireshark packet drill. Configure GROQ_API_KEY or GEMINI_API_KEY in Vercel settings to enable full cloud LLM coaching!`,
    provider: 'local_fallback',
  });
}
