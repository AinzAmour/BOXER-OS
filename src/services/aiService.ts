export async function askAICoach(
  prompt: string,
  sessionType: 'cyber_mentor' | 'boxing_coach' | 'fitness_coach' | 'weekly_review'
): Promise<{ reply: string; provider: string }> {
  try {
    const systemPrompts: Record<string, string> = {
      cyber_mentor:
        'You are the LIFE//OS Cyber Mentor. You assist in Linux, TCP/IP networking, Wireshark, DFIR, SOC analysis, and web security. Explain clearly and pinpoint knowledge gaps.',
      boxing_coach:
        'You are the LIFE//OS Boxing Coach. You analyze shadowboxing drills, footwork, punch numbering (1-6), guard balance, and round timer performance for a beginner fitness boxer.',
      fitness_coach:
        'You are the LIFE//OS Fitness & Run-Fix Coach. You analyze calisthenics (push-ups, pull-ups, plank) and running attempt observations (RPE, pain score, surface, footwear) using strictly non-diagnostic language.',
      weekly_review:
        'You are the LIFE//OS Weekly Mastery Reviewer. Synthesize training consistency, skill progress across BODY, MIND, and TECH, and generate next week actionable missions.',
    };

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        systemPrompt: systemPrompts[sessionType] || systemPrompts.cyber_mentor,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API route call error, using local fallback:', err);
  }

  return {
    reply:
      `[LIFE//OS Tactical Response]\n` +
      `Focus on baseline progression: 5 strict pull-ups, 15 push-ups, Orthodox guard maintenance, and Wireshark capture filtering drills. Complete today's daily missions on the Command Center!`,
    provider: 'local_fallback',
  };
}
