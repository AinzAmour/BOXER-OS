import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Award, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { db } from '../db/dexie';

interface Question {
  id: string;
  domain: string;
  category: string;
  targetSkillId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q_tcp_1',
    domain: 'tech',
    category: 'networking',
    targetSkillId: 'skill_tech_networking',
    question: 'In the TCP 3-way handshake, what is the sequence of flags sent between client and server?',
    options: ['SYN → ACK → SYN-ACK', 'SYN → SYN-ACK → ACK', 'ACK → SYN → SYN-ACK', 'FIN → ACK → FIN-ACK'],
    correctIndex: 1,
    explanation: 'Client sends SYN, Server responds with SYN-ACK, Client completes with ACK.',
  },
  {
    id: 'q_wire_1',
    domain: 'tech',
    category: 'networking',
    targetSkillId: 'skill_tech_wireshark',
    question: 'Which Wireshark display filter isolates all DNS traffic to a specific IP address 192.168.1.50?',
    options: ['ip.addr == 192.168.1.50 and dns', 'dns.port == 53 and ip == 192.168.1.50', 'filter.dns && ip.src', 'udp.port == 53'],
    correctIndex: 0,
    explanation: 'ip.addr == 192.168.1.50 and dns filters packets matching the IP address and DNS protocol.',
  },
  {
    id: 'q_box_1',
    domain: 'body',
    category: 'boxing',
    targetSkillId: 'skill_box_stance',
    question: 'In orthodox stance, what is the correct distribution of body weight and guard position?',
    options: ['70% weight on lead leg, hands low', '50/50 weight balance, lead foot at ~45°, hands high, chin tucked', '80% weight on rear leg, elbows wide', 'Weight on toes, hands by hips'],
    correctIndex: 1,
    explanation: 'Balanced 50/50 weight distribution enables rapid footwork in all directions while hands protect the chin.',
  },
];

export function AdaptiveAssessmentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = SAMPLE_QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = async () => {
    // Propagate score to skill in Dexie DB
    if (selectedOption === currentQ.correctIndex) {
      const skill = await db.skills.get(currentQ.targetSkillId);
      if (skill) {
        await db.skills.update(currentQ.targetSkillId, {
          knowledge_pct: Math.min(100, skill.knowledge_pct + 10),
          practical_pct: Math.min(100, skill.practical_pct + 5),
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (currentIndex + 1 < SAMPLE_QUESTIONS.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsFinished(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <HelpCircle size={20} className="text-accent-purple" />
        <h2 className="text-lg font-bold">Adaptive Assessment Engine</h2>
      </div>

      {!isFinished ? (
        <div className="glass-card p-6 space-y-6 border border-border-default">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-mono uppercase">
              Question {currentIndex + 1} of {SAMPLE_QUESTIONS.length}
            </span>
            <span className="badge bg-accent-purple/15 text-accent-purple">
              {currentQ.category.toUpperCase()}
            </span>
          </div>

          {/* Question text */}
          <h3 className="text-base font-bold text-text-primary leading-snug">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              let btnStyle = 'bg-bg-secondary text-text-secondary border-border-default hover:border-border-active';
              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  btnStyle = 'bg-status-success/20 text-status-success border-status-success/40';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-accent-red/20 text-accent-red border-accent-red/40';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && idx === currentQ.correctIndex && <CheckCircle2 size={16} className="text-status-success flex-shrink-0" />}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle size={16} className="text-accent-red flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="glass-card p-4 border-l-2 border-l-accent-cyan text-xs text-text-secondary">
              <span className="font-semibold text-accent-cyan">Explanation:</span> {currentQ.explanation}
            </div>
          )}

          {isAnswered && (
            <button onClick={handleNext} className="btn btn-primary w-full text-xs py-3 flex items-center justify-center gap-2">
              Next Question <ArrowRight size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-gold/15 text-accent-gold flex items-center justify-center mx-auto glow-gold">
            <Award size={24} />
          </div>
          <h3 className="text-lg font-bold">Assessment Complete</h3>
          <p className="text-xs text-text-secondary">
            Score: <span className="stat-number text-accent-cyan text-base">{correctCount}/{SAMPLE_QUESTIONS.length}</span> (
            {Math.round((correctCount / SAMPLE_QUESTIONS.length) * 100)}%)
          </p>
          <p className="text-xs text-text-muted">
            Evaluation scores have been propagated down to your Personal Skill Graph nodes!
          </p>
          <button onClick={handleReset} className="btn btn-secondary text-xs">
            <RotateCcw size={14} /> Retake Assessment
          </button>
        </div>
      )}
    </div>
  );
}
