import { Bot, Send, Swords, Terminal, Dumbbell, Calendar, Sparkles, Clock, CalendarCheck, PlusCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import { askAICoach } from '../services/aiService';
import type { Quest } from '../types';

type AssistantMode = 'private_assistant' | 'cyber_mentor' | 'boxing_coach' | 'fitness_coach' | 'weekly_review';

const assistantModes: { id: AssistantMode; icon: typeof Bot; title: string; desc: string; color: string }[] = [
  { id: 'private_assistant', icon: Bot,      title: 'Private Assistant', desc: 'Interactive Daily Scheduler & Time-Block Planner', color: 'border-accent-red text-accent-red' },
  { id: 'cyber_mentor',      icon: Terminal, title: 'Cyber Mentor',      desc: 'Linux, TCP/IP, Wireshark, DFIR & Web Security',    color: 'border-accent-cyan text-accent-cyan' },
  { id: 'boxing_coach',      icon: Swords,   title: 'Boxing Coach',      desc: 'Stance, Guard, 1-6 Punches & Combo Drills',        color: 'border-accent-gold text-accent-gold' },
  { id: 'fitness_coach',     icon: Dumbbell, title: 'Fitness Coach',     desc: 'Calisthenics, Run-Fix Observations & Fat Loss',    color: 'border-status-success text-status-success' },
  { id: 'weekly_review',     icon: Calendar, title: 'Weekly Review',     desc: 'Synthesize progress across BODY, MIND & TECH',     color: 'border-accent-purple text-accent-purple' },
];

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  provider?: string;
  suggestedTasks?: string[];
}

export function AICoachPage() {
  const [activeMode, setActiveMode] = useState<AssistantMode>('private_assistant');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text:
        `Greetings Fighter! I am your LIFE//OS Private Executive Assistant.\n\n` +
        `I am here to manage your daily schedule, time-block your sessions, adapt your training to the current time of day, and answer any questions across Cyber, Boxing, and Fitness.\n\n` +
        `How can I assist your schedule today?`,
      provider: 'system',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedTasks, setAddedTasks] = useState<string[]>([]);

  // Live Dexie query for profile and quests
  const profile = useLiveQuery(async () => await db.profiles.get('profile_default'), []);
  const activeQuests = useLiveQuery(async () => await db.quests.where('is_completed').equals(0).toArray(), []) || [];

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || input;
    if (!textToSend.trim() || loading) return;

    if (!userPrompt) setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setLoading(true);

    try {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const res = await askAICoach(textToSend, activeMode, {
        currentTime: nowTime,
        level: profile?.level || 1,
        xp: profile?.xp || 150,
        activeQuests: activeQuests.map((q: Quest) => q.title),
        profileName: profile?.name || 'Mohammed Habibur Rahman',
      });

      // Extract sample tasks from response lines starting with • or -
      const extractedTasks = res.reply
        .split('\n')
        .filter((line) => line.trim().startsWith('•') || line.trim().startsWith('-'))
        .map((line) => line.replace(/^[•\-]\s*/, '').trim())
        .filter((t) => t.length > 5);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          provider: res.provider,
          suggestedTasks: extractedTasks.length > 0 ? extractedTasks : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error contacting AI assistant. Please check your connection.', provider: 'error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePushTaskToQuests = async (taskTitle: string) => {
    const now = new Date().toISOString();
    const questId = `quest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newQuest: Quest = {
      id: questId,
      user_id: 'local_user',
      title: taskTitle,
      domain: activeMode === 'cyber_mentor' ? 'tech' : activeMode === 'boxing_coach' || activeMode === 'fitness_coach' ? 'body' : 'mind',
      xp_reward: 50,
      is_completed: false,
      completed_at: null,
      target_skill_ids: [],
      created_at: now,
      updated_at: now,
      device_id: localStorage.getItem('boxer_os_device_id') || 'dev_local',
      deleted_at: null,
      sync_version: 1,
    };

    await db.quests.put(newQuest);
    setAddedTasks((prev) => [...prev, taskTitle]);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-accent-red" />
          <h2 className="text-lg font-bold">Private AI Executive Assistant</h2>
          <span className="badge bg-accent-red/15 text-accent-red text-[0.5625rem]">GROQ + GEMINI</span>
        </div>
        <div className="text-xs font-mono text-text-muted flex items-center gap-1">
          <Clock size={12} className="text-accent-gold" />
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Mode Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {assistantModes.map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`glass-card p-3 text-left border transition-all flex flex-col justify-between ${
                isActive
                  ? `${m.color} bg-bg-card shadow-md`
                  : 'border-border-default text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={18} className="mb-2" />
              <div>
                <div className="text-xs font-bold leading-tight">{m.title}</div>
                <div className="text-[0.5rem] opacity-70 line-clamp-2 mt-0.5">{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Quick Assistant Action Chips */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: "🕒 Reschedule Evening / Day", prompt: "Hey assistant, it's late in the day. Help me reschedule my remaining training and tasks so it suits my current time and energy." },
          { label: "📅 Generate Time-Blocked Plan", prompt: "Please generate a time-blocked schedule for me balancing Body, Mind, and Tech based on my baseline and current goals." },
          { label: "⚡ Interactive Check-in", prompt: "Ask me 3 quick interactive questions about my current time, sleep plan, and energy so we can customize my schedule." },
          { label: "🥊 Recommend Boxing Session", prompt: "Recommend an optimal shadowboxing drill and round breakdown for my next session." },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleSend(chip.prompt)}
            className="btn btn-secondary text-[0.6875rem] py-1.5 px-3 rounded-full hover:border-accent-cyan/40 hover:text-accent-cyan transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="glass-card p-5 space-y-4 min-h-[360px] flex flex-col justify-between">
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-accent-red/20 text-text-primary border border-accent-red/30 rounded-tr-none'
                    : 'bg-bg-secondary text-text-secondary border border-border-default rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.text}

                {/* Suggested Tasks Sync Buttons */}
                {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border-subtle space-y-2">
                    <div className="text-[0.625rem] font-bold text-accent-gold tracking-widest uppercase flex items-center gap-1">
                      <CalendarCheck size={12} /> Sync to Command Center Quests:
                    </div>
                    {msg.suggestedTasks.map((task, tIdx) => {
                      const isAdded = addedTasks.includes(task);
                      return (
                        <button
                          key={tIdx}
                          onClick={() => handlePushTaskToQuests(task)}
                          disabled={isAdded}
                          className={`w-full text-left p-2 rounded-lg text-[0.6875rem] font-mono flex items-center justify-between border transition-all ${
                            isAdded
                              ? 'bg-status-success/15 border-status-success/30 text-status-success'
                              : 'bg-bg-card hover:bg-bg-card/80 border-border-default text-text-primary'
                          }`}
                        >
                          <span className="truncate pr-2">{task}</span>
                          {isAdded ? (
                            <span className="flex items-center gap-1 text-[0.5625rem] text-status-success font-bold flex-shrink-0">
                              <CheckCircle size={12} /> Added
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[0.5625rem] text-accent-cyan font-bold flex-shrink-0">
                              <PlusCircle size={12} /> Add Quest
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {msg.provider && (
                <span className="text-[0.5rem] font-mono text-text-muted mt-1 px-1">
                  via {msg.provider.toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-text-muted animate-pulse">
              <Sparkles size={14} className="text-accent-red" />
              <span>AI Executive Assistant analyzing schedule & time context...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 pt-3 border-t border-border-subtle">
          <input
            type="text"
            className="input text-xs"
            placeholder={`Ask your Private Assistant (e.g. "It's 7 PM, what should I do tonight?")...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary text-xs px-4">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
