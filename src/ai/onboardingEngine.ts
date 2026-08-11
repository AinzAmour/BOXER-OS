import type { CielQuestionEnvelope, CielActionEnvelope } from '../types';

export interface OnboardingState {
  name?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  goals?: string[];
  cyberExperience?: string;
  cyberCategories?: string[];
  mentalismFocus?: string;
  fitnessBackground?: string;
  dietType?: string;
  isHalal?: boolean;
  soyaFree?: boolean;
  dailyMinutes?: number;
  confirmed?: boolean;
}

/**
 * Adaptive Onboarding Engine
 * Evaluates known vs missing information to generate the next optimal question.
 * Adapts questions to user experience (e.g. skips computer basics if intermediate CTF user).
 */
export function getNextOnboardingStep(
  state: OnboardingState,
  messageCount: number
): CielQuestionEnvelope | CielActionEnvelope {
  // Step 1: Name
  if (!state.name && messageCount <= 1) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: 'Welcome to LIFE//OS. I am Ciel, the intelligence layer behind your personal system. What should I call you?',
      question: {
        type: 'text',
        field: 'name',
        question: 'What is your name?',
      },
    };
  }

  // Step 2: Stats (Age, Height, Weight)
  if ((!state.age || !state.height_cm || !state.weight_kg) && messageCount <= 2) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `Hello ${state.name || 'Fighter'}. What are your current physical stats?`,
      question: {
        type: 'number',
        field: 'age',
        question: 'Enter your age',
        min: 10,
        max: 120,
      },
    };
  }

  // Step 3: Goals Selection
  if ((!state.goals || state.goals.length === 0) && messageCount <= 3) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `What are your primary goals for personal growth and physical mastery?`,
      question: {
        type: 'multi_select',
        field: 'goals',
        question: 'Select your primary goals',
        options: ['Kickboxing', 'Cybersecurity', 'Mentalism', 'Calisthenics', 'Running', 'Focus & Memory'],
        allow_custom: true,
      },
    };
  }

  // Step 4: Cybersecurity Experience (Adaptive: Skip basics if intermediate/CTF)
  const isCyberGoal = state.goals?.some((g) => g.toLowerCase().includes('cyber'));
  if (isCyberGoal && !state.cyberExperience && messageCount <= 4) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `What is your current experience level in Cybersecurity?`,
      question: {
        type: 'single_select',
        field: 'cyberExperience',
        question: 'Cybersecurity Experience Level',
        options: ['Beginner (Learn basics)', 'Intermediate (Participated in CTFs/Labs)', 'Advanced (Active Practitioner)'],
        allow_custom: false,
      },
    };
  }

  if (isCyberGoal && state.cyberExperience?.includes('Intermediate') && !state.cyberCategories && messageCount <= 5) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `Since you have intermediate CTF experience, we will skip computer fundamentals. Which CTF categories do you want to focus on?`,
      question: {
        type: 'multi_select',
        field: 'cyberCategories',
        question: 'Select CTF Categories',
        options: ['Web Exploitation', 'Cryptography', 'Forensics / DFIR', 'Reverse Engineering', 'Pwn / Binary', 'OSINT'],
        allow_custom: true,
      },
    };
  }

  // Step 5: Diet Preferences
  if (!state.dietType && messageCount <= 6) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `What type of diet do you follow, and are there dietary preferences I should log?`,
      question: {
        type: 'single_select',
        field: 'dietType',
        question: 'Select Diet Type',
        options: ['Halal & Soya-Free', 'Standard Halal', 'Vegetarian', 'High Protein / Standard'],
        allow_custom: true,
      },
    };
  }

  // Step 6: Daily Schedule Availability
  if (!state.dailyMinutes && messageCount <= 7) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `How many minutes per day can you allocate to training and study sessions?`,
      question: {
        type: 'scale',
        field: 'dailyMinutes',
        question: 'Daily Minutes Available',
        min: 30,
        max: 180,
        step: 15,
      },
    };
  }

  // Step 7: Final Onboarding Completion Action Envelope
  const userName = state.name || 'Fighter';
  const userAge = state.age || 21;
  const userHeight = state.height_cm || 178;
  const userWeight = state.weight_kg || 80;

  return {
    protocol_version: '2.0',
    type: 'action',
    text: `Profile confirmed for ${userName}. Initializing your personal skill graph, baseline assessment, daily missions, and phase roadmap.`,
    action: {
      action: 'onboarding_complete',
      onboarding_complete: true,
      profile: {
        name: userName,
        age: userAge,
        height_cm: userHeight,
        weight_kg: userWeight,
        diet_type: state.dietType || 'halal',
        is_halal: state.isHalal ?? true,
        soya_free: state.soyaFree ?? true,
        enabled_modules: ['body', 'mind', 'tech'],
        constraints: {
          daily_minutes: state.dailyMinutes || 90,
        },
      },
      skills: [
        { domain: 'body', category: 'boxing', name: 'Orthodox Stance & Guard', state: 'discovered' },
        { domain: 'body', category: 'calisthenics', name: 'Strict Push-ups', state: 'discovered' },
        { domain: 'tech', category: 'linux', name: 'Linux CLI Navigation', state: 'discovered' },
        { domain: 'tech', category: 'web_security', name: 'SQL Injection Fundamentals', state: 'discovered' },
        { domain: 'mind', category: 'focus', name: 'Deep Work Focus', state: 'discovered' },
      ],
      quests: [
        { title: 'Complete 3 Shadowboxing Rounds (3 min each)', domain: 'body', xp_reward: 75, target_skill_names: ['Orthodox Stance & Guard'], estimated_minutes: 15 },
        { title: 'Linux Terminal & Web CTF Challenge', domain: 'tech', xp_reward: 75, target_skill_names: ['Linux CLI Navigation', 'SQL Injection Fundamentals'], estimated_minutes: 30 },
      ],
    },
  };
}
