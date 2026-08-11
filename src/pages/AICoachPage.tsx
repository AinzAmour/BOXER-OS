import { Bot, Send, Swords, Terminal, Dumbbell, Calendar, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { askAICoach } from '../services/aiService';

type MentorType = 'cyber_mentor' | 'boxing_coach' | 'fitness_coach' | 'weekly_review';

const mentors: { id: MentorType; icon: typeof Bot; title: string; desc: string; color: string }[] = [
  { id: 'cyber_mentor',  icon: Terminal, title: 'Cyber Mentor',  desc: 'Linux, TCP/IP, Wireshark, DFIR & Web Security', color: 'border-accent-cyan text-accent-cyan' },
  { id: 'boxing_coach',  icon: Swords,   title: 'Boxing Coach',  desc: 'Stance, Guard, 1-6 Punches & Combo Drills',     color: 'border-accent-red text-accent-red' },
  { id: 'fitness_coach', icon: Dumbbell, title: 'Fitness Coach', desc: 'Calisthenics, Run-Fix Observations & Fat Loss', color: 'border-accent-gold text-accent-gold' },
  { id: 'weekly_review', icon: Calendar, title: 'Weekly Review', desc: 'Synthesize progress across BODY, MIND & TECH', color: 'border-accent-purple text-accent-purple' },
];

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  provider?: string;
}

export function AICoachPage() {
  const [activeMentor, setActiveMentor] = useState<MentorType>('cyber_mentor');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Greetings Fighter. I am your LIFE//OS AI Mentor. Select a domain below and ask any question regarding Cyber, Boxing, Fitness, or Learning!',
      provider: 'system',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await askAICoach(userText, activeMentor);
      setMessages((prev) => [...prev, { sender: 'ai', text: res.reply, provider: res.provider }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error contacting AI mentor service. Check connection.', provider: 'error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bot size={20} className="text-accent-purple" />
        <h2 className="text-lg font-bold">LIFE//OS AI Mentor</h2>
        <span className="badge bg-accent-purple/15 text-accent-purple text-[0.5625rem]">GROQ + GEMINI</span>
      </div>

      {/* Mentor Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {mentors.map((m) => {
          const Icon = m.icon;
          const isActive = activeMentor === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMentor(m.id)}
              className={`glass-card p-3 text-left border transition-all flex flex-col justify-between ${
                isActive
                  ? `${m.color} bg-bg-card shadow-md`
                  : 'border-border-default text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={18} className="mb-2" />
              <div>
                <div className="text-xs font-bold">{m.title}</div>
                <div className="text-[0.5625rem] opacity-70 line-clamp-2 mt-0.5">{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat Window */}
      <div className="glass-card p-5 space-y-4 min-h-[320px] flex flex-col justify-between">
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-accent-red/20 text-text-primary border border-accent-red/30 rounded-tr-none'
                    : 'bg-bg-secondary text-text-secondary border border-border-default rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.text}
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
              <Sparkles size={14} className="text-accent-purple" />
              <span>AI Mentor analyzing context...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-border-subtle">
          <input
            type="text"
            className="input text-xs"
            placeholder={`Ask ${mentors.find((m) => m.id === activeMentor)?.title}...`}
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
