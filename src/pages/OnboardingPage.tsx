import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { askCiel, type ChatMessage } from '../services/aiService';

interface OnboardingPageProps {
  userId: string;
  onComplete: () => void;
}

export function OnboardingPage({ userId, onComplete }: OnboardingPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Send initial Ciel greeting on mount
  useEffect(() => {
    let isMounted = true;

    async function startOnboarding() {
      setLoading(true);
      const initialPrompt: ChatMessage[] = [
        {
          role: 'user',
          content: 'Hello, I am ready to set up my LIFE//OS profile.',
        },
      ];

      const res = await askCiel('onboarding', initialPrompt, userId);
      if (isMounted) {
        setMessages([
          {
            role: 'assistant',
            content: res.text || "Welcome to LIFE//OS. I'm Ciel — the intelligence layer behind your system. What should I call you?",
          },
        ]);
        setLoading(false);
      }
    }

    startOnboarding().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setStatusMessage(null);

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userText },
    ];

    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await askCiel('onboarding', updatedMessages, userId);

      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: res.text },
      ]);

      if (res.actionResult) {
        if (res.actionResult.success && res.actionResult.action_type === 'onboarding_complete') {
          setStatusMessage('✓ Profile created successfully! Initializing LIFE//OS...');
          setTimeout(() => {
            onComplete();
          }, 1500);
        } else if (res.actionResult.success) {
          setStatusMessage(`✓ Applied: ${res.actionResult.action_type}`);
        }
      }
    } catch (err) {
      console.error('Onboarding message error:', err);
      setStatusMessage('Connection warning. Retrying response...');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary flex flex-col justify-between">
      {/* Onboarding Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8 py-4 border-b border-border-subtle bg-bg-primary/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-red flex items-center justify-center glow-red">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none flex items-center gap-2">
              CIEL <span className="text-accent-red">//</span> ONBOARDING
            </h1>
            <p className="text-[0.6875rem] font-mono text-text-muted mt-0.5">
              Personal Operating System Initialization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 text-[0.625rem] py-0.5 px-2">
            <Sparkles size={10} className="mr-1 inline" /> AI INTERVIEW MODE
          </span>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-accent-red/20 border border-accent-red/30 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-accent-red" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent-red text-white font-medium shadow-md'
                    : 'bg-bg-card border border-border-subtle text-text-primary'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-accent-red/20 border border-accent-red/30 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-accent-red animate-pulse" />
              </div>
              <div className="bg-bg-card border border-border-subtle rounded-2xl px-4 py-2.5 text-xs text-text-muted font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-ping" />
                Ciel is processing your response...
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-accent-green/10 border border-accent-green/30 text-accent-green text-xs font-mono flex items-center gap-2">
              <CheckCircle2 size={14} />
              {statusMessage}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      <footer className="sticky bottom-0 z-40 bg-bg-primary/95 border-t border-border-subtle p-4 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-3xl w-full mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response to Ciel..."
            disabled={loading}
            className="flex-1 bg-bg-card border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-active transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-xl bg-accent-red hover:bg-accent-red/90 text-white font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="text-[0.625rem] text-center text-text-muted font-mono mt-2 flex items-center justify-center gap-1">
          <ShieldAlert size={10} className="text-accent-gold" />
          Ciel validates all data via Action Engine before saving to your profile.
        </p>
      </footer>
    </div>
  );
}
