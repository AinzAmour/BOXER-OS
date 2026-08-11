# LIFE//OS v2.0.0 — Ciel Intelligence Layer

<p align="center">
  <img src="public/favicon.svg" width="80" alt="LIFE//OS Logo" />
</p>

<h3 align="center">
  <b>LIFE//OS</b> — AI-First Personal Mastery & Skill Operating System
</h3>

<p align="center">
  <i>AI-first Progressive Web Application for personal development across <b>BODY</b> (Boxing, Calisthenics, Running, Halal Nutrition), <b>MIND</b> (Study, Focus, Memory), and <b>TECH</b> (Cybersecurity, Linux, Networking, Web Security) — driven by Ciel, Zod Action Engine, Personal Skill Graph, and Serverless AI Gateway (Groq + Gemini).</i>
</p>

<p align="center">
  <a href="https://boxer-os.vercel.app"><b>Live App Demo</b></a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-ciel-ai-pipeline">Ciel AI Pipeline</a> •
  <a href="#-core-modules">Core Modules</a> •
  <a href="#-database-schema">Database Schema</a> •
  <a href="#-getting-started">Getting Started</a>
</p>

> **Note on URL Continuity**: This project evolved from **BOXER//OS v0.1.0** → **LIFE//OS v1.0.0** → **LIFE//OS v2.0.0**. The repository name (`BOXER-OS`) and Vercel domain (`boxer-os.vercel.app`) are preserved for live deployment continuity.

---

## 🚀 System Evolution (v2.0.0 Ciel Intelligence Layer)

In **LIFE//OS v2.0.0**, the application shifted from hardcoded baseline profiles into a **pure AI-first system**.

**Ciel** (the intelligence layer) interviews new users, builds personalized profiles, evaluates skill evidence, creates daily quests, and manages schedule adaptations — while the **Action Engine** enforces business rules, UUID ownership, and Zod validation.

```
                         ┌─────────────┐
                         │    CIEL     │
                         │ Intelligence│
                         └──────┬──────┘
                                │
                         proposes actions
                                │
                                ▼
                       ┌────────────────┐
                       │ ZOD VALIDATOR  │
                       └───────┬────────┘
                               │
                               ▼
                       ┌────────────────┐
                       │ ACTION ENGINE  │
                       │                │
                       │ permissions    │
                       │ business rules │
                       │ ID generation  │
                       │ skill matching │
                       │ evidence eval  │
                       └───────┬────────┘
                               │
                               ▼
                         ┌──────────┐
                         │  DEXIE   │
                         │ user DB  │
                         └────┬─────┘
                              │
                    live reactive queries
                              │
                              ▼
                         ┌──────────┐
                         │ REACT UI │
                         └──────────┘
```

**Ciel is the brain. The Action Engine is the immune system. Dexie is the memory. React is the body.**

---

## 🏗️ Ciel AI Pipeline & Safety Rules

1. **Server-Owned Prompts (`api/ai.ts` & `api/cielPrompts.ts`)**:
   - The browser sends `{ mode, userContext, messages }`. The server constructs the authoritative system prompt so client tampering cannot bypass rules or force fake XP.
2. **User-Scoped Database Records**:
   - `profile_default` replaced with authenticated `userId` lookups (`db.profiles.where('user_id').equals(userId)`).
3. **UUID Ownership**:
   - The Action Engine generates all record UUIDs (`crypto.randomUUID()`). Ciel proposes skill/quest names and descriptions, never raw database keys.
4. **Evidence-Based Skill Progression (`record_evidence`)**:
   - Ciel proposes evidence (`self_reported`, `observed`, `assessed`), and the Action Engine enforces progression caps (e.g. `self_reported` max state is `discovered`).
5. **Skill Name Resolution**:
   - Action Engine normalizes names (`trim()` + `toLowerCase()`) to match existing skill IDs before creating duplicates.
6. **Modular Page Visibility (`enabled_modules`)**:
   - Modules (`boxing`, `cyber`, `fitness`, etc.) are enabled/disabled on the profile based on onboarding preferences. Disabled modules are hidden from sidebar navigation, but can be re-enabled at any time.

---

## ⚡ Core Modules & Features

### 🤖 1. Ciel Conversational Onboarding (`OnboardingPage.tsx`)
- **Single-Question Flow**: Ciel conducts a 9-step conversational interview asking about goals, physical ability, constraints, schedule, and domain interests.
- **Summary Confirmation**: Ciel presents a profile summary card for user confirmation before executing database writes.
- **Action Engine Execution**: Generates profile, baseline assessment, initial skills, daily quests, nutrition targets, and phase roadmap in IndexedDB.

### 👑 2. Solo-Leveling Command Center Dashboard (`DashboardPage.tsx`)
- **Fighter Rank & XP System**: Visual level indicator (`LVL 1`) and animated XP progress bar.
- **Domain Status Cards**: Real-time summary skill counts for **BODY**, **MIND**, and **TECH** domains.
- **Daily Multi-Skill Missions**: Quests linked to target skill nodes that grant XP upon completion.
- **Quick Module Launchers**: Instant launchers for Boxing Engine, Round Timer, Run-Fix, and AI Assistant.

### 🕸️ 3. Personal Skill Graph Engine (`SkillGraphPage.tsx`)
- **Multi-Metric Tracking**: Tracks **Knowledge %**, **Practical Ability %**, **Experience %**, and **Confidence Level** (`LOW`, `MEDIUM`, `HIGH`) per skill node.
- **State Transitions**: `UNKNOWN` → `DISCOVERED` → `TRAINING` → `PRACTICING` → `PROFICIENT` → `MASTERED` → `ADVANCED`.

### 🧠 4. Adaptive Assessment Engine (`AdaptiveAssessmentPage.tsx`)
- **Dynamic Question Router**: Evaluates domain knowledge and sends evaluation evidence through the Action Engine to update skill graph nodes in IndexedDB.

### 🏃 5. "Run-Fix" Running Diagnostics (`RunFixPage.tsx`)
- **Structured Attempt Logger**: Tracks RPE, Pain Score, Pain Location (Shin, Knee, Ankle, Foot, Hip, Back), Symptoms, Surface, and Footwear using non-diagnostic language.

### 🥊 6. Boxing Engine & Audio Synth Round Timer (`BoxingPage.tsx` & `TimerPage.tsx`)
- **Technique Guide & Combo Generator**: Stance, Guard, 1-6 Punch Numbering, and dynamic shadowboxing generator.
- **Synthesized Round Timer**: Web Audio API generated boxing bell rings (3:00 work / 1:00 rest / 10s warning).

### 🍛 7. Halal Indian Nutrition Hub (`NutritionPage.tsx`)
- **Universal Reference Food Database**: 16 low-cost Indian Halal staples (Eggs, Chicken, Dal, Chana, Rajma, Milk, Curd, Paneer, Peanuts, Rice, Roti, Oats).
- **User Nutrition Targets**: Personalized calorie and protein target goals created during onboarding.

---

## 🗄️ Database Schema & Offline Sync

The database consists of 16 IndexedDB Dexie tables (v3 schema) backed by Supabase PostgreSQL:

```sql
profiles (id, user_id, name, age, height_cm, weight_kg, body_fat_pct, waist_inches, diet_type, is_halal, soya_free, level, xp, constraints JSONB, enabled_modules[], device_id, deleted_at, sync_version)
assessments (id, user_id, entry_number, is_baseline, weight_kg, body_fat_pct, waist_inches, pushups, squats, pullups, plank_seconds, jump_rope_seconds, walking_minutes, jogging_minutes, running_status, coach_notes, device_id, deleted_at, sync_version)
running_attempts (id, user_id, duration_minutes, distance_km, surface, footwear, pace, breathing_rpe, leg_fatigue_rpe, pain_score, pain_locations[], symptoms[], coach_feel, coach_stopped, coach_unusual, device_id, deleted_at, sync_version)
boxing_sessions (id, user_id, session_type, duration_minutes, rounds_completed, combos_practiced[], skills_worked[], intensity_rpe, coach_notes, device_id, deleted_at, sync_version)
boxing_skills (id, user_id, skill_name, category, proficiency, notes, device_id, deleted_at, sync_version)
timer_presets (id, user_id, name, work_seconds, rest_seconds, warning_seconds, total_rounds, is_default, device_id, deleted_at, sync_version)
nutrition_foods (id, user_id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_halal, is_low_cost, is_default, device_id, deleted_at, sync_version)
nutrition_logs (id, user_id, log_date, food_id, food_name, quantity_grams, calories, protein, meal_type, device_id, deleted_at, sync_version)
nutrition_targets (id, user_id, calories_target, protein_target, label, device_id, deleted_at, sync_version)
phase_progress (id, user_id, phase_number, phase_name, status, criteria JSONB, unlocked_at, completed_at, device_id, deleted_at, sync_version)
skills (id, user_id, domain, category, name, state, knowledge_pct, practical_pct, experience_pct, confidence, parent_skill_id, notes, evidence JSONB, device_id, deleted_at, sync_version)
skill_prerequisites (id, skill_id, prerequisite_skill_id, required_practical_pct)
knowledge_assessments (id, user_id, domain, category, evaluated_skill_ids[], score_pct, summary, gaps_identified[], device_id, deleted_at, sync_version)
quests (id, user_id, title, domain, xp_reward, is_completed, completed_at, target_skill_ids[], estimated_minutes, evidence_required, device_id, deleted_at, sync_version)
ai_sessions (id, user_id, session_type, prompt_summary, ai_response, provider_used, device_id, deleted_at, sync_version)
ai_actions (id, user_id, session_id, action_type, proposed_data, validation_result, records_created[], device_id, deleted_at, sync_version)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Local Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/AinzAmour/BOXER-OS.git
   cd BOXER-OS
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env.local` in root:
   ```env
   VITE_SUPABASE_URL=https://<your-supabase-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configure Serverless AI Keys (Vercel Project Settings)**:
   Set under **Vercel → Settings → Environment Variables** (server-side only):
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key
   GEMINI_API_KEY=AIzaSy_your_gemini_api_key
   ```

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```

6. **Build & Verify**:
   ```bash
   npm run build
   ```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
