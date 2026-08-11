# LIFE//OS v1.0.0

<p align="center">
  <img src="public/favicon.svg" width="80" alt="LIFE//OS Logo" />
</p>

<h3 align="center">
  <b>LIFE//OS</b> — Personal Development & Skill Mastery Operating System
</h3>

<p align="center">
  <i>Offline-first Progressive Web Application for personal mastery across <b>BODY</b> (Boxing, Calisthenics, Running, Halal Nutrition), <b>MIND</b> (Study, Focus, Learning), and <b>TECH</b> (Cybersecurity, Linux, Networking, Web Security) — powered by a Personal Skill Graph, Adaptive Assessment Engine, and Serverless AI Executive Assistant (Groq + Gemini).</i>
</p>

<p align="center">
  <a href="https://boxer-os.vercel.app"><b>Live App Demo</b></a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-core-modules">Core Modules</a> •
  <a href="#-database-schema">Database Schema</a> •
  <a href="#-getting-started">Getting Started</a>
</p>

> **Note on URL Continuity**: This project was evolved from **BOXER//OS v0.1.0** into **LIFE//OS v1.0.0**. The repository name (`BOXER-OS`) and Vercel domain (`boxer-os.vercel.app`) are preserved for deployment and URL continuity.

---

## 🚀 System Evolution (BOXER//OS → LIFE//OS)

Originally launched as a combat fitness HUD, **LIFE//OS v1.0.0** expands boxing and fitness into major sub-modules within an all-encompassing personal progression operating system:

```
                                    LIFE//OS v1.0
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
      BODY                              MIND                             TECH
   ┌────┴────┐                      ┌────┴────┐                      ┌────┴────┐
 Boxing    Fitness               Learning   Knowledge             Linux     Web
 Calisthenics Running             Study     Reading               Networking Security
 Nutrition                       Memory    Research              DFIR      SOC
```

---

## 🏗️ Architecture

```
                  Windows / Android Browser & Installed PWA
                                    │
                       React 18 + TypeScript + Vite
                                    │
                           Tailwind CSS v4
                                    │
             ┌──────────────────────┴──────────────────────┐
             │                                             │
      IndexedDB (Dexie.js v2)                      LIFE//OS AI Router
   ─ immediate read/write ─                      ─ Vercel Serverless ─
   ─ offline-first source ─                                │
             │                                    AI Provider Manager
       Sync Manager                                ┌───────┴───────┐
             │                                     │               │
     Supabase PostgreSQL                         Groq           Gemini
   (RLS: auth.uid() = user_id)                (Primary)       (Fallback)
```

---

## ⚡ Core Modules & Features

### 🤖 1. Private AI Executive Assistant & Scheduler (`AICoachPage.tsx`)
- **Real-Time Clock & Energy Context**: Recognizes the current local time of day (e.g. 7:42 PM) and user energy state.
- **Adaptive Rescheduling**: If it is late at night, the assistant refrains from prescribing heavy outdoor workouts, asks interactive check-in questions ("What time are you sleeping tonight?", "Do you want to shift your 3 shadowboxing rounds to 8:00 AM tomorrow?"), and generates an adapted evening time-blocked plan.
- **One-Click Quest Sync**: Converts suggested AI schedule tasks into live Dexie Daily Quests in the Command Center with a single click.
- **4 Dedicated Mentors**:
  - **Private Assistant**: Executive daily planning, time-blocking, and schedule adjustments.
  - **Cyber Mentor**: Linux, TCP/IP, Wireshark, DFIR, SOC & Web Security.
  - **Boxing Coach**: Stance, Guard, 1-6 Punches & Combo Drills.
  - **Fitness Coach**: Calisthenics, Run-Fix Observations & Fat Loss.

### 👑 2. Solo-Leveling Command Center Dashboard (`DashboardPage.tsx`)
- **Fighter Rank & XP System**: Visual level indicator (`LVL 1 - AINZ`) and animated XP progress bar.
- **Domain Status Cards**: Real-time summary scores for **BODY**, **MIND**, and **TECH** domains.
- **Daily Multi-Skill Missions**: Quests linked to target skill nodes that grant XP upon completion.
- **Quick Module Launchers**: Instant launchers for Boxing Engine, Round Timer, Run-Fix, and AI Assistant.

### 🕸️ 3. Personal Skill Graph Engine (`SkillGraphPage.tsx`)
- **Multi-Metric Tracking**: Tracks **Knowledge %**, **Practical Ability %**, **Experience %**, and **Confidence Level** (`LOW`, `MEDIUM`, `HIGH`) per skill node.
- **State Transitions**: `UNKNOWN` → `DISCOVERED` → `TRAINING` → `PRACTICING` → `PROFICIENT` → `MASTERED` → `ADVANCED`.
- **Domain Skill Trees**:
  - **BODY**: Boxing (Stance, Guard, Punches 1-6), Calisthenics (Push-ups, Pull-ups), Running (Brisk Walk).
  - **MIND**: Deep Work Focus, Active Recall & Spaced Repetition.
  - **TECH**: Linux CLI & Navigation, TCP/IP & OSI Fundamentals, Wireshark Packet Analysis, Web Security.

### 🧠 4. Adaptive Assessment Engine (`AdaptiveAssessmentPage.tsx`)
- **Adaptive Question Router**: Evaluates domain knowledge and propagates evaluation scores down to individual skill nodes in IndexedDB.
- **No False Claims**: Unencountered skills remain `UNKNOWN` rather than defaulting to "Beginner".
- **Prerequisite Enforcement**: Skill unlocks require verifiable performance evidence.

### 📊 5. Baseline Entry #0 & Retests (`AssessmentsPage.tsx`)
- **Immutable Entry #0**: Locks Day 0 physical baseline stats.
- **Retest Tracking**: Timestamped retests logged directly to IndexedDB Dexie with automated diff badges (`+5`, `-2 kg`).

### 🏃 6. "Run-Fix" Running Diagnostics (`RunFixPage.tsx`)
- **Structured Attempt Logger**: Tracks RPE, Pain Score, Pain Location (Shin, Knee, Ankle, Foot, Hip, Back), Symptoms, Surface, and Footwear.
- **Observational Safety Rules**: Pattern detection engine uses strictly non-diagnostic language.

### 🥊 7. Boxing Engine & Audio Synth Round Timer (`BoxingPage.tsx` & `TimerPage.tsx`)
- **Technique Guide & Combo Generator**: Stance, Guard, 1-6 Punch Numbering, and dynamic shadowboxing generator.
- **Synthesized Round Timer**: Web Audio API generated boxing bell rings (3:00 work / 1:00 rest / 10s warning).

### 🍛 8. Halal Indian Nutrition Hub (`NutritionPage.tsx`)
- **Soya-Free Directory**: Low-cost Indian Halal staples (Eggs, Chicken, Dal, Chana, Rajma, Milk, Curd, Paneer, Peanuts, Rice, Roti, Oats).
- **Daily Macro Log**: Live Dexie persistence tracking daily protein and calorie totals against configurable targets.

### 🔐 9. Fighter Access & Service Worker v2 (`AuthPage.tsx` & `sw.js`)
- **Email & Google OAuth**: Fast login options with "Remember Me" device session locking.
- **Service Worker v2**: Network-First PWA caching strategy eliminating stale page locks on Android & Windows page reloads.

---

## 🗄️ Database Schema & Offline Sync Convention

The database consists of 15 PostgreSQL & Dexie.js tables configured with **Row Level Security (RLS)**:

> **Offline-First Metadata Note**: Every record includes `sync_version` (incrementing integer for last-write-wins resolution), `device_id` (originating client UUID), and `deleted_at` (soft deletion timestamp for offline sync propagation).

```sql
profiles (id, user_id, name, age, height_cm, weight_kg, body_fat_pct, waist_inches, diet_type, is_halal, soya_free, level, xp, device_id, deleted_at, sync_version)
assessments (id, user_id, entry_number, is_baseline, weight_kg, body_fat_pct, waist_inches, pushups, squats, pullups, plank_seconds, jump_rope_seconds, walking_minutes, jogging_minutes, running_status, coach_notes, device_id, deleted_at, sync_version)
running_attempts (id, user_id, duration_minutes, distance_km, surface, footwear, pace, breathing_rpe, leg_fatigue_rpe, pain_score, pain_locations[], symptoms[], coach_feel, coach_stopped, coach_unusual, device_id, deleted_at, sync_version)
boxing_sessions (id, user_id, session_type, duration_minutes, rounds_completed, combos_practiced[], skills_worked[], intensity_rpe, coach_notes, device_id, deleted_at, sync_version)
boxing_skills (id, user_id, skill_name, category, proficiency, notes, device_id, deleted_at, sync_version)
timer_presets (id, user_id, name, work_seconds, rest_seconds, warning_seconds, total_rounds, is_default, device_id, deleted_at, sync_version)
nutrition_foods (id, user_id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_halal, is_low_cost, is_default, device_id, deleted_at, sync_version)
nutrition_logs (id, user_id, log_date, food_id, food_name, quantity_grams, calories, protein, meal_type, device_id, deleted_at, sync_version)
nutrition_targets (id, user_id, calories_target, protein_target, label, device_id, deleted_at, sync_version)
phase_progress (id, user_id, phase_number, phase_name, status, criteria JSONB, unlocked_at, completed_at, device_id, deleted_at, sync_version)
skills (id, user_id, domain, category, name, state, knowledge_pct, practical_pct, experience_pct, confidence, parent_skill_id, notes, device_id, deleted_at, sync_version)
skill_prerequisites (id, skill_id, prerequisite_skill_id, required_practical_pct)
knowledge_assessments (id, user_id, domain, category, evaluated_skill_ids[], score_pct, summary, gaps_identified[], device_id, deleted_at, sync_version)
quests (id, user_id, title, domain, xp_reward, is_completed, completed_at, target_skill_ids[], device_id, deleted_at, sync_version)
ai_sessions (id, user_id, session_type, prompt_summary, ai_response, provider_used, device_id, deleted_at, sync_version)
```

SQL Migrations:
- [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
- [`supabase/migrations/002_life_os_expansion.sql`](supabase/migrations/002_life_os_expansion.sql)

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
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://<your-supabase-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configure Serverless AI Keys (Vercel Project Settings)**:
   Add these environment variables under **Vercel → Settings → Environment Variables** (do NOT add to `.env.local` to keep keys 100% server-side):
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key
   GEMINI_API_KEY=AIzaSy_your_gemini_api_key
   ```

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

6. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📱 PWA Mobile Installation (Android & iOS)

1. Open `https://boxer-os.vercel.app` in **Chrome** (Android) or **Safari** (iOS).
2. **Android**: Tap the three dots (`⋮`) in top right → select **Add to Home screen** / **Install app**.
3. **iOS**: Tap the **Share** icon → select **Add to Home Screen**.
4. Launch **LIFE//OS** as a standalone application directly from your phone's home screen!

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
