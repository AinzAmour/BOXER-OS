# BOXER//OS v0.1.0

<p align="center">
  <img src="public/manifest.json" width="80" alt="BOXER//OS Logo" />
</p>

<h3 align="center">
  <b>BOXER//OS</b> — Tactical Boxing Fitness, Diagnostics & Training PWA
</h3>

<p align="center">
  <i>Offline-first Progressive Web Application for baseline tracking, running difficulty diagnosis, boxing training, audio round timing, and low-cost Indian Halal nutrition — synchronized across Windows and Android.</i>
</p>

<p align="center">
  <a href="https://boxer-os.vercel.app"><b>Live App Demo</b></a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-database-schema">Database Schema</a> •
  <a href="#-getting-started">Getting Started</a>
</p>

---

## 🥊 Overview

**BOXER//OS** is a high-performance, dark-tactical Progressive Web Application built specifically to structure and track a fighter's fitness progression. It replaces generic workout trackers with a dedicated combat OS HUD that manages:

1. **Immutable Baseline Entry #0**: Locked Day 0 performance metrics with automated trend diffs on all subsequent retests.
2. **Run-Fix Diagnostics**: Structured observation logging (RPE, pain score, pain location, symptoms, footwear, coach reflections) with observational pattern detection.
3. **Boxing Technique & Drill Engine**: Stance, guard, footwork, punch numbering (1–6), combo library, and a random combination generator.
4. **Synthesized Round Timer**: Web Audio API programmatically generated boxing bell chimes (3:00 work / 1:00 rest / 10s warning) with visual progress ring.
5. **Nutrition Hub (Indian, Halal, Soya-Free)**: Budget-friendly Indian Halal food directory, daily protein/calorie logging, and configurable target macros.
6. **Phase Progression Roadmap**: Objective performance checklists across 4 fight training phases.
7. **Fighter Access Gateway**: Supabase Auth & Google OAuth login with "Remember Me" device session persistence and offline fallback.

---

## 🏗️ Architecture

```
                         BOXER//OS
                             │
                 React 18 + TypeScript + Vite
                             │
                    Tailwind CSS v4 + PWA
                             │
              ┌──────────────┴──────────────┐
              │                             │
          Windows                        Android
        Desktop PWA                    Mobile PWA
              │                             │
              └──────────────┬──────────────┘
                             │
                      IndexedDB (Dexie.js)
                      ─ immediate local store ─
                      ─ offline-first source ─
                             │
                   Sync Manager & Queue
                             │
                    HTTPS / Supabase Client
                             │
                 Supabase Cloud Service
            ┌────────────────┴────────────────┐
            │                                 │
      Supabase Auth                     PostgreSQL DB
  (Email + Google OAuth)              (Row Level Security)
            │                                 │
            └────────────────┬────────────────┘
                             │
                     Vercel Deployment
```

---

## ⚡ Key Features

### 📊 1. Baseline Entry #0 & Retest System
- **Immutable Entry #0**: Locks Day 0 physical baseline stats (Height, Weight, Body Fat %, Waist, Push-ups, Squats, Pull-ups, Plank, Jump rope, Walk, Jog).
- **Retest Tracking**: Log timestamped retests over time.
- **Automated Diff Badges**: Displays visual indicators (`+5`, `-2 kg`) comparing current retest metrics against Day 0.

### 🏃 2. "Run-Fix" Running Diagnostic Investigation
- **Structured Attempt Logging**: Captures Duration, Distance, Surface (Tarmac, Grass, Track, Treadmill, Dirt), Footwear, Pace, Breathing RPE (1-10), Leg Fatigue RPE (1-10), and Pain Score (0-10).
- **Pain Location & Symptoms**: Interactive tags for Shin, Knee, Ankle, Foot, Hip, Back, Breathlessness, Tightness, etc.
- **Coach Notes**: Qualitative reflections ("How did this feel?", "What stopped you?", "Anything unusual?").
- **Observational Safety Rules**: Pattern recognition engine strictly uses observational language (e.g., *"Shin discomfort appeared in 3 of your last 4 attempts"*) rather than diagnostic claims.

### 🥊 3. Boxing Engine & Combo Generator
- **Fundamental Skill Guide**: Stance, Guard, Footwork, 1-6 Punch Numbering (1: Jab, 2: Cross, 3: Lead Hook, 4: Rear Hook, 5: Lead Uppercut, 6: Rear Uppercut, Slips, Weaves).
- **Combo Library**: Preset technical combination drills.
- **Dynamic Combo Generator**: Programmatically generates random punch-slip combinations for shadowboxing rounds.

### ⏱️ 4. Audio Synth Boxing Round Timer
- **Web Audio API**: Synthesizes authentic boxing bell rings (work bell, rest bell, 10s warning chime) without requiring external audio files.
- **Visual Progress Ring**: Dynamic color transitions (Red = Work, Teal = Rest, Gold = Warning, Success Green = Complete).
- **Custom Presets**: Configurable work time, rest time, warning interval, and total rounds.

### 🍛 5. Halal Indian Nutrition Tracker
- **Soya-Free Food Directory**: Seeded with low-cost Indian Halal staples (Eggs, Chicken, Dal, Chana, Rajma, Milk, Curd/Dahi, Paneer, Peanuts, Rice, Roti, Oats, Potato, Banana, Veggies).
- **Configurable Macro Targets**: Adjustable protein and calorie goals labeled with clear starting guidance.

### 🏆 6. Phase Progression Roadmap
- **Phase 1**: Beginner Fitness (Fat loss + calisthenics + boxing mechanics).
- **Phase 2**: Recreational Boxer (Sparring readiness + conditioning).
- **Phase 3**: Serious Training (Fight IQ + advanced defense).
- **Phase 4**: Long-Term "D" Goal.
- **Objective Readiness Checklists**: Milestone criteria that must be satisfied to advance phases.

### 🔐 7. Fighter Access & Session Protection
- **Email/Password & Google OAuth**: Seamless login options.
- **"Remember Me" Persistence**: Stores encrypted session keys locally to prevent repetitive logins on personal devices.
- **Service Worker v2**: Network-First PWA strategy ensuring fresh Vercel updates load immediately without stale cache locks.

---

## 🗄️ Database Schema

The database consists of 10 primary PostgreSQL tables configured with **Row Level Security (RLS)**:

```sql
profiles (id, user_id, name, age, height_cm, weight_kg, body_fat_pct, waist_inches, diet_type, is_halal, soya_free)
assessments (id, user_id, entry_number, is_baseline, weight_kg, body_fat_pct, waist_inches, pushups, squats, pullups, plank_seconds, jump_rope_seconds, walking_minutes, jogging_minutes, running_status, coach_notes)
running_attempts (id, user_id, duration_minutes, distance_km, surface, footwear, pace, breathing_rpe, leg_fatigue_rpe, pain_score, pain_locations[], symptoms[], coach_feel, coach_stopped, coach_unusual)
boxing_sessions (id, user_id, session_type, duration_minutes, rounds_completed, combos_practiced[], skills_worked[], intensity_rpe, coach_notes)
boxing_skills (id, user_id, skill_name, category, proficiency, notes)
timer_presets (id, user_id, name, work_seconds, rest_seconds, warning_seconds, total_rounds, is_default)
nutrition_foods (id, user_id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, is_halal, is_low_cost, is_default)
nutrition_logs (id, user_id, log_date, food_id, food_name, quantity_grams, calories, protein, meal_type)
nutrition_targets (id, user_id, calories_target, protein_target, label)
phase_progress (id, user_id, phase_number, phase_name, status, criteria JSONB, unlocked_at, completed_at)
```

The SQL migration file is available at [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).

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
   VITE_SUPABASE_URL=https://dwlwcabszyvszlgeicek.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📱 PWA Mobile Installation (Android & iOS)

1. Open `https://boxer-os.vercel.app` in **Chrome** (Android) or **Safari** (iOS).
2. **Android**: Tap the three dots (`⋮`) in the top right → select **Add to Home screen** / **Install app**.
3. **iOS**: Tap the **Share** icon → select **Add to Home Screen**.
4. Launch **BOXER//OS** as a standalone application directly from your phone's app drawer!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
