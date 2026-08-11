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
  try {
    const nowStr = userContext?.currentTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const profileName = userContext?.profileName || 'Mohammed Habibur Rahman';

    const systemPrompts: Record<string, string> = {
      private_assistant: `You are the LIFE//OS Private Executive Assistant & Adaptive Scheduler for ${profileName}.
Current local time is ${nowStr}.
User background: 21yo, 85kg, 5'10", baseline: 15 push-ups, 5 pull-ups, jump rope >1min, currently investigating running difficulty in Run-Fix.
Your core job:
1. Act as a proactive, intelligent private assistant for DAILY PLANNING, TIME-BLOCKING, and RESCHEDULING.
2. Respect the current time of day (${nowStr}). If it is evening/night (after 7 PM), do NOT force heavy outdoor workouts. Instead, proactively ask 2-3 interactive questions (e.g. "What time are you sleeping tonight?", "How is your energy level right now 1-10?") and propose light evening tasks (e.g. 15-min theory, stretching, mental review, setting tomorrow's schedule).
3. Offer to reschedule heavy training (shadowboxing, pull-ups, running) to optimal time blocks tomorrow.
4. Keep your tone supportive, structured, tactical, and interactive.
5. End your responses with a clear, time-blocked daily schedule and suggest 2-3 specific actionable tasks.`,

      cyber_mentor: `You are the LIFE//OS Cyber Mentor for ${profileName}. Current time: ${nowStr}. Assist in Linux CLI, TCP/IP networking, Wireshark, DFIR, SOC analysis, and web security. Explain clearly and pinpoint knowledge gaps. Adapt recommendations based on current time of day (${nowStr}).`,

      boxing_coach: `You are the LIFE//OS Boxing Coach for ${profileName}. Current time: ${nowStr}. Analyze shadowboxing drills, footwork, punch numbering (1-6), guard balance, and round timer performance for a beginner fitness boxer. Adjust intensity if it is late at night (${nowStr}).`,

      fitness_coach: `You are the LIFE//OS Fitness & Run-Fix Coach for ${profileName}. Current time: ${nowStr}. Analyze calisthenics (push-ups, pull-ups, plank) and running attempt observations (RPE, pain score, surface, footwear) using strictly non-diagnostic language.`,

      weekly_review: `You are the LIFE//OS Weekly Mastery Reviewer for ${profileName}. Current time: ${nowStr}. Synthesize training consistency, skill progress across BODY, MIND, and TECH, and generate next week actionable missions.`,
    };

    const fullPrompt = `[Context: Current Time is ${nowStr}. User Rank: Level ${userContext?.level || 1} (${userContext?.xp || 150} XP). Active Quests: ${userContext?.activeQuests?.join(', ') || 'None'}]\n\nUser Message: ${prompt}`;

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: fullPrompt,
        systemPrompt: systemPrompts[sessionType] || systemPrompts.private_assistant,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('API route call error, using local fallback:', err);
  }

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
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
  };
}
