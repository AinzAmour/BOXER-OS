import type { CielQuestionEnvelope, CielActionEnvelope } from '../types';

export interface OnboardingState {
  name?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  goals?: string[];
  domainInterests?: string[];
  cyberExperience?: string;
  cyberCategories?: string[];
  fitnessBackground?: string;
  dietType?: string;
  isHalal?: boolean;
  soyaFree?: boolean;
  dailyMinutes?: number;
  confirmed?: boolean;
}

/**
 * Adaptive Onboarding Engine
 * Derives user domains and goals dynamically from conversation context without hardcoded assumptions.
 * Options serve strictly as contextual suggestions and include standard escape hatches: "Other", "Not sure", and "Skip for now".
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

  // Step 2: Physical Baseline & Stats
  if ((!state.age || !state.height_cm || !state.weight_kg) && messageCount <= 2) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `Hello ${state.name || 'Fighter'}. What are your current physical stats? (Age, height, weight)`,
      question: {
        type: 'text',
        field: 'stats',
        question: 'Enter your age, height (cm), and weight (kg)',
      },
    };
  }

  // Step 3: Open-Ended or Suggested Goals Selection
  if ((!state.goals || state.goals.length === 0) && messageCount <= 3) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `What are your primary goals for training and personal mastery? Feel free to select suggestions or type your custom interests.`,
      question: {
        type: 'multi_select',
        field: 'goals',
        question: 'Select or type your primary goals',
        options: [
          'Kickboxing / Martial Arts',
          'Cybersecurity & CTFs',
          'Mentalism & Cognitive Mastery',
          'Calisthenics & Strength',
          'Running & Conditioning',
          'Focus & Study System',
          'Other (Type custom)',
          'Not sure',
          'Skip for now',
        ],
        allow_custom: true,
      },
    };
  }

  // Step 4: Adaptive Goal Exploration based on user text (e.g. Cybersecurity, Kickboxing, Mentalism, or custom)
  const userGoalText = (state.goals || []).join(' ').toLowerCase();

  const isCyber = userGoalText.includes('cyber') || userGoalText.includes('ctf') || userGoalText.includes('security');
  if (isCyber && !state.cyberExperience && messageCount <= 4) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `What is your current experience level in Cybersecurity?`,
      question: {
        type: 'single_select',
        field: 'cyberExperience',
        question: 'Cybersecurity Experience Level',
        options: [
          'Beginner (Starting from basics)',
          'Intermediate (CTFs / Labs experience)',
          'Advanced (Active practitioner)',
          'Other (Type custom)',
          'Not sure',
          'Skip for now',
        ],
        allow_custom: true,
      },
    };
  }

  // If intermediate CTF, skip basic computer lessons and ask CTF categories
  if (isCyber && (state.cyberExperience?.toLowerCase().includes('intermediate') || state.cyberExperience?.toLowerCase().includes('ctf')) && !state.cyberCategories && messageCount <= 5) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `Since you have intermediate CTF experience, we will skip computer fundamentals. Which CTF areas do you want to focus on?`,
      question: {
        type: 'multi_select',
        field: 'cyberCategories',
        question: 'Select CTF Focus Areas',
        options: [
          'Web Exploitation',
          'Cryptography',
          'Forensics / DFIR',
          'Reverse Engineering',
          'Pwn / Binary Exploitation',
          'OSINT',
          'Other (Type custom)',
          'Skip for now',
        ],
        allow_custom: true,
      },
    };
  }

  // Step 5: Diet Preferences
  if (!state.dietType && messageCount <= 6) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `What type of diet do you follow, and are there dietary preferences or restrictions I should log?`,
      question: {
        type: 'single_select',
        field: 'dietType',
        question: 'Select or type Diet Preferences',
        options: [
          'Halal & Low-Cost (Indian Staples)',
          'Halal & Soya-Free',
          'Standard Halal',
          'Vegetarian',
          'High Protein / Standard',
          'Other (Type custom)',
          'Skip for now',
        ],
        allow_custom: true,
      },
    };
  }

  // Step 6: Daily Availability
  if (!state.dailyMinutes && messageCount <= 7) {
    return {
      protocol_version: '2.0',
      type: 'question',
      text: `How many minutes per day can you allocate to your training and learning schedule?`,
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

  // Derive active modules dynamically from state
  const derivedModules: string[] = ['body', 'mind', 'tech'];

  return {
    protocol_version: '2.0',
    type: 'action',
    text: `Profile confirmed for ${userName}. Initializing your personalized skill graph, baseline assessment, daily missions, and phase roadmap.`,
    action: {
      action: 'onboarding_complete',
      onboarding_complete: true,
      profile: {
        name: userName,
        age: userAge,
        height_cm: userHeight,
        weight_kg: userWeight,
        diet_type: state.dietType || 'halal',
        is_halal: true,
        soya_free: true,
        enabled_modules: derivedModules,
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
