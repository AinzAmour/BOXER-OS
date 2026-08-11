import { useState, useEffect } from 'react';
import { Bot, Send, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { askCiel, type ChatMessage } from '../services/aiService';
import { parseCielResponseEnvelope } from '../ai/cielResponseParser';
import { validateQuestionAnswer } from '../ai/cielQuestionSchemas';
import { getNextOnboardingStep, type OnboardingState } from '../ai/onboardingEngine';
import type { CielQuestion } from '../types';

interface OnboardingPageProps {
  userId: string;
  onComplete: () => void;
}

export function OnboardingPage({ userId, onComplete }: OnboardingPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<CielQuestion | null>(null);
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const [scaleValue, setScaleValue] = useState<number>(60);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initInterview() {
      setLoading(true);
      const initialStep = getNextOnboardingStep({}, 1);

      if (initialStep.type === 'question') {
        const welcomeText = initialStep.text;
        if (isMounted) {
          setMessages([{ role: 'assistant', content: welcomeText }]);
          setActiveQuestion(initialStep.question);
        }
      } else {
        const res = await askCiel('onboarding', [{ role: 'user', content: 'Initialize onboarding' }], userId);
        if (isMounted) {
          setMessages([{ role: 'assistant', content: res.text }]);
        }
      }
      setLoading(false);
    }

    initInterview().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleUserAnswer = async (answerValue: string | number | string[]) => {
    if (loading) return;

    // Validate answer if active question exists
    if (activeQuestion) {
      const valRes = validateQuestionAnswer(activeQuestion, answerValue);
      if (!valRes.valid) {
        setStatusMessage(`⚠️ ${valRes.error || 'Invalid answer'}`);
        return;
      }
    }

    setStatusMessage(null);
    const displayText = Array.isArray(answerValue) ? answerValue.join(', ') : String(answerValue);

    // Optimistic UI Update: Render user choice immediately in chat stream
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: displayText },
    ];
    setMessages(updatedMessages);
    setInput('');
    setCustomInput('');
    setShowCustomInput(false);
    setMultiSelectValues([]);
    setActiveQuestion(null);
    setLoading(true);

    // Update internal state
    const nextState: OnboardingState = { ...onboardingState };
    if (activeQuestion?.field === 'name') nextState.name = String(answerValue);
    if (activeQuestion?.field === 'goals') nextState.goals = Array.isArray(answerValue) ? answerValue : [String(answerValue)];
    if (activeQuestion?.field === 'cyberExperience') nextState.cyberExperience = String(answerValue);
    if (activeQuestion?.field === 'cyberCategories') nextState.cyberCategories = Array.isArray(answerValue) ? answerValue : [String(answerValue)];
    if (activeQuestion?.field === 'dietType') nextState.dietType = String(answerValue);
    if (activeQuestion?.field === 'dailyMinutes') nextState.dailyMinutes = Number(answerValue);

    // Parse stats if user typed text stats (e.g., "21, 178cm, 85kg")
    if (activeQuestion?.field === 'stats') {
      const nums = String(answerValue).match(/\d+(\.\d+)?/g);
      if (nums && nums.length >= 3) {
        nextState.age = Number(nums[0]);
        nextState.height_cm = Number(nums[1]);
        nextState.weight_kg = Number(nums[2]);
      } else if (nums && nums.length >= 1) {
        nextState.age = Number(nums[0]);
      }
    }

    setOnboardingState(nextState);

    try {
      // Call Ciel Service (calls Gateway /api/ai)
      const res = await askCiel('onboarding', updatedMessages, userId);
      const parsed = parseCielResponseEnvelope(res.text);

      if (parsed.envelope?.type === 'question') {
        const qEnv = parsed.envelope;
        setMessages([...updatedMessages, { role: 'assistant', content: qEnv.text }]);
        setActiveQuestion(qEnv.question);
        if (qEnv.question.type === 'scale') {
          setScaleValue(qEnv.question.min ?? 60);
        }
      } else if (parsed.envelope?.type === 'action' || res.actionResult) {
        setMessages([...updatedMessages, { role: 'assistant', content: res.text }]);
        if (res.actionResult?.success) {
          setStatusMessage('✓ Profile initialized successfully! Redirecting to Command Center...');
          setTimeout(() => {
            onComplete();
          }, 1200);
        }
      } else {
        // Fallback local onboarding step if server returns fallback text
        const localNext = getNextOnboardingStep(nextState, updatedMessages.filter((m) => m.role === 'user').length + 1);
        if (localNext.type === 'question') {
          setMessages([...updatedMessages, { role: 'assistant', content: localNext.text }]);
          setActiveQuestion(localNext.question);
        } else {
          setMessages([...updatedMessages, { role: 'assistant', content: localNext.text }]);
          // Execute complete action via local Ciel engine
          const execRes = await askCiel('onboarding', [...updatedMessages, { role: 'user', content: 'confirm' }], userId);
          if (execRes.actionResult?.success) {
            setStatusMessage('✓ Profile initialized successfully! Redirecting...');
            setTimeout(() => {
              onComplete();
            }, 1200);
          }
        }
      }
    } catch (err) {
      console.error('Onboarding stream error:', err);
      setStatusMessage('Connection warning. Retrying response...');
    } finally {
      setLoading(false);
    }
  };

  const toggleMultiSelectOption = (opt: string) => {
    if (opt.toLowerCase().includes('other')) {
      setShowCustomInput(true);
      return;
    }
    if (multiSelectValues.includes(opt)) {
      setMultiSelectValues(multiSelectValues.filter((o) => o !== opt));
    } else {
      setMultiSelectValues([...multiSelectValues, opt]);
    }
  };

  const submitCustomInput = () => {
    if (!customInput.trim()) return;
    if (activeQuestion?.type === 'multi_select') {
      const combined = [...multiSelectValues, customInput.trim()];
      handleUserAnswer(combined);
    } else {
      handleUserAnswer(customInput.trim());
    }
  };

  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary flex flex-col justify-between">
      {/* Header */}
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
              Adaptive Dynamic Interview • Envelope v2.0
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-accent-red animate-ping" />
          <span>ADAPTIVE INTERVIEW MODE</span>
        </div>
      </header>

      {/* Main Conversation Log */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 lg:p-6 space-y-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-accent-red/20 border border-accent-red/30 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} className="text-accent-red" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent-red text-white font-medium shadow-lg'
                  : 'bg-bg-card border border-border-subtle text-text-primary'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center shrink-0 mt-1">
                <User size={16} className="text-text-muted" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-accent-red/20 border border-accent-red/30 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-accent-red" />
            </div>
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 text-xs font-mono text-text-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-red animate-ping" />
              <span>Ciel is formulating dynamic question response...</span>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-mono text-center">
            {statusMessage}
          </div>
        )}
      </main>

      {/* Dynamic Interactive Input Panel */}
      <footer className="sticky bottom-0 z-40 border-t border-border-subtle bg-bg-primary/95 backdrop-blur-md p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Custom Write-in Field when "Other" is selected */}
          {showCustomInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitCustomInput()}
                placeholder="Type your custom goal, domain, or answer..."
                className="flex-1 px-4 py-3 rounded-xl bg-bg-card border border-accent-red text-sm focus:outline-none"
                autoFocus
              />
              <button
                onClick={submitCustomInput}
                disabled={!customInput.trim()}
                className="px-5 py-3 rounded-xl bg-accent-red text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40"
              >
                Submit Custom Answer
              </button>
              <button
                onClick={() => setShowCustomInput(false)}
                className="px-3 py-3 rounded-xl bg-bg-surface border border-border-subtle text-xs text-text-muted"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {/* Dynamic Single Select Chips */}
              {activeQuestion?.type === 'single_select' && activeQuestion.options && (
                <div className="space-y-2">
                  <p className="text-xs font-mono text-text-muted uppercase tracking-wider">{activeQuestion.question}</p>
                  <div className="flex flex-wrap gap-2">
                    {activeQuestion.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          if (opt.toLowerCase().includes('other')) {
                            setShowCustomInput(true);
                          } else {
                            handleUserAnswer(opt);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-red hover:text-accent-red text-xs font-medium transition-all flex items-center gap-1.5"
                      >
                        <span>{opt}</span>
                        <ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Multi Select Checkbox Chips */}
              {activeQuestion?.type === 'multi_select' && activeQuestion.options && (
                <div className="space-y-2">
                  <p className="text-xs font-mono text-text-muted uppercase tracking-wider">{activeQuestion.question}</p>
                  <div className="flex flex-wrap gap-2">
                    {activeQuestion.options.map((opt) => {
                      const isSelected = multiSelectValues.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleMultiSelectOption(opt)}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-accent-red text-white border-accent-red glow-red'
                              : 'bg-bg-card border-border-subtle text-text-secondary hover:border-border-strong'
                          }`}
                        >
                          <CheckCircle2 size={14} className={isSelected ? 'text-white' : 'text-text-muted'} />
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    disabled={multiSelectValues.length === 0}
                    onClick={() => handleUserAnswer(multiSelectValues)}
                    className="w-full py-2.5 rounded-xl bg-accent-red text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Confirm {multiSelectValues.length} Selections</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Dynamic Scale Range Slider */}
              {activeQuestion?.type === 'scale' && (
                <div className="space-y-3 bg-bg-card p-4 rounded-xl border border-border-subtle">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-text-muted">{activeQuestion.question}</span>
                    <span className="text-accent-red font-bold text-base">{scaleValue} Mins/Day</span>
                  </div>
                  <input
                    type="range"
                    min={activeQuestion.min ?? 30}
                    max={activeQuestion.max ?? 180}
                    step={activeQuestion.step ?? 15}
                    value={scaleValue}
                    onChange={(e) => setScaleValue(Number(e.target.value))}
                    className="w-full accent-accent-red"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUserAnswer(scaleValue)}
                      className="flex-1 py-2.5 rounded-xl bg-accent-red text-white text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Set Availability: {scaleValue} Mins
                    </button>
                    <button
                      onClick={() => handleUserAnswer('Skip for now')}
                      className="px-4 py-2.5 rounded-xl bg-bg-surface border border-border-subtle text-xs text-text-muted hover:text-text-primary"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {/* Standard Open-Ended Text or Number Input */}
              {(!activeQuestion || activeQuestion.type === 'text' || activeQuestion.type === 'number') && (
                <div className="flex gap-2">
                  <input
                    type={activeQuestion?.type === 'number' ? 'number' : 'text'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUserAnswer(input)}
                    placeholder={activeQuestion?.question || 'Type your response to Ciel...'}
                    className="flex-1 px-4 py-3 rounded-xl bg-bg-card border border-border-subtle text-sm focus:outline-none focus:border-accent-red transition-all"
                  />
                  <button
                    onClick={() => handleUserAnswer(input)}
                    disabled={!input.trim() || loading}
                    className="px-5 py-3 rounded-xl bg-accent-red text-white hover:bg-accent-red/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
