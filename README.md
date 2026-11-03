# Striver's A2Z DSA Sheet Tracker

A production-quality personal progress tracker and developer dashboard based on the complete Striver's A2Z DSA Sheet syllabus extracted directly from TakeUForward.

---

## 🚀 Key Highlights

- **Complete Verified Syllabus**: 453 problems across all 20 modules and 84 subtopics, strictly preserving original sequencing and Striver's tiers (`basic`, `core`, `pro`).
- **100% Direct Practice Links**:
  - **292 LeetCode problems** (direct problem URLs)
  - **128 GeeksforGeeks problems** (direct problem URLs)
  - **33 TakeUForward problems** (pattern printing & basic implementations)
  - **Zero unresolved links** and **Zero generic homepage redirects**.
- **GitHub-style Contribution Heatmap**: Full 12-month activity graph with 4 green intensity levels, year switcher, and hover tooltips showing exact problem names solved on each date.
- **Dynamic Streak Calculation**: Consecutive active days calculated using user-configured timezone (`Asia/Kolkata` by default), handling boundary conditions, weekend gaps, and status transitions without fake data.
- **Multi-Platform Direct Practice Button**: Opens verified problem page in a new tab without losing tracker state, with support for alternate platforms (e.g. LeetCode + GeeksforGeeks + TakeUForward).
- **Personal Notes & Bookmarks**: Save algorithmic approaches, time/space complexities, and edge cases. Star problems for revision.
- **Deep Analytics**: Module-wise completion gap analysis, difficulty breakdown (Easy/Medium/Hard), platform distribution, and productive-day velocity.
- **Full Data Portability**: Export progress as JSON, restore backups with ID validation, and reset progress with confirmation protection.
- **Dual Storage Architecture**: Runs 100% offline in browser local storage / IndexedDB right away, or synchronizes seamlessly with Supabase PostgreSQL (Row Level Security enabled).

---

## 📊 Dataset & Link Verification Report

| Metric | Value |
| :--- | :--- |
| **Total Modules (Steps)** | 20 Modules |
| **Total Subtopics** | 84 Subtopics |
| **Total Practice Problems** | 453 Problems |
| **Verified Direct Links** | 453 (100.0%) |
| **Unresolved Links** | 0 |
| **LeetCode Practice** | 292 problems (64.5%) |
| **GeeksforGeeks Practice** | 128 problems (28.3%) |
| **TakeUForward Practice** | 33 problems (7.3%) |
| **Difficulty Distribution** | 114 Easy • 296 Medium • 43 Hard |
| **Striver Tier Distribution** | 68 Basic • 277 Core • 108 Pro |

Full audit details are available in [`scripts/link-verification/LINK_VERIFICATION_REPORT.md`](scripts/link-verification/LINK_VERIFICATION_REPORT.md).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **Build Tool**: Vite 6
- **Testing**: Vitest
- **Backend / Database (Optional)**: Supabase, PostgreSQL, Row Level Security (RLS)
- **Local Fallback**: LocalStorage + IndexedDB modular abstraction

---

## 🏃 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🗄️ Supabase Cloud Database Setup (Optional)

If you wish to synchronize your progress permanently across multiple devices using Supabase:

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run the migration script located at:
   `supabase/migrations/20261102000000_init_schema_and_seed.sql`
   *(This creates `modules`, `subtopics`, `problems`, `user_progress` with Row Level Security and seeds the problem database).*
4. Copy your project URL and anon public key into a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Restart Vite (`npm run dev`). The tracker will automatically connect and sync your guest progress to your authenticated account!

---

## 📁 Project Structure

```
├── public/
├── scripts/
│   ├── data-extraction/        # Raw extraction and dataset building scripts
│   └── link-verification/      # Verification reports & JSON logs
├── src/
│   ├── __tests__/              # Vitest automated test suite
│   ├── components/
│   │   ├── auth/               # Sign In / Sign Up modal
│   │   ├── analytics/          # Analytics overview & charts
│   │   ├── dashboard/          # StatsCards, ContributionHeatmap, ContinueLearning, POTD
│   │   ├── layout/             # AppLayout, Sidebar, Navbar
│   │   ├── problems/           # ProblemCard, ProblemFilters, ExternalLinkMenu, NotesModal
│   │   ├── sheet/              # ModuleAccordion with subtopics & progress
│   │   └── ui/                 # Reusable Button, Badge, Modal, Input
│   ├── context/                # AuthContext, ProgressContext, ThemeContext
│   ├── data/                   # Canonical striver_dataset.json (453 problems)
│   ├── pages/                  # Dashboard, Sheet, AllProblems, Revision, Analytics, Settings
│   ├── services/               # datasetService, storage, supabase, backupService
│   ├── types/                  # TypeScript interfaces (dataset, user, stats)
│   └── utils/                  # cn, dateUtils (timezone-aware streaks & heatmaps)
├── supabase/
│   └── migrations/             # Schema, RLS policies, and seed SQL
├── .env.example
├── package.json
└── vite.config.ts
```


---

## Windows setup (clean install)

Do not copy or reuse the `node_modules` folder from another operating system or computer.

1. Install the current Node.js LTS version (Node 20 or newer).
2. Extract this project folder.
3. Open PowerShell in the folder that contains `package.json`.
4. Run:

```powershell
npm ci
npm run dev
```

5. Open the exact local URL printed by Vite in the terminal (usually `http://localhost:3000`).

If `npm ci` fails because the lockfile or optional platform packages are corrupted, run:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
npm run dev
```

## Deploy to Vercel

This project includes `vercel.json` configured for a Vite production build.

1. Push the project to a GitHub repository (do not upload `node_modules`, `dist`, or `.env`).
2. In Vercel, choose **Add New → Project**, import the GitHub repository, and deploy.
3. Vercel should use `npm run build` and publish the `dist` directory.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Vercel **Project → Settings → Environment Variables** if cloud sync is required. Redeploy after adding them.

Without Supabase credentials, the app uses browser-local storage. Progress will remain in that browser on that device, but will not automatically sync between devices or browsers.
