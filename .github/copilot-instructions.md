# Copilot instructions — system-design-guide

Purpose
- Provide repository-specific guidance for Copilot/Copilot CLI sessions to find build/test commands, understand architecture, and follow project conventions.

1) Build, test, and lint commands
- Prerequisites: Node.js 18+ (per README).
- Install deps: npm install
- Dev server (local): npm run dev  # opens Next.js app at http://localhost:3000
- Build (production): npm run build
- Start (production): npm start
- Static export: npm run export

- Tests: No test runner or test scripts are configured in package.json. If tests are added, prefer a single-test invocation pattern (example):
  - Jest: npx jest path/to/file.test.js -t "test name"
  - Vitest: npx vitest run path/to/file.test.js -- -t "test name"

- Lint: No linter configured. If ESLint is added, run a single file: npx eslint path/to/file.js

2) High-level architecture (big picture)
- Framework: Next.js (app/ router) — app/layout.jsx is the root layout and app/page.jsx is the home route.
- Single-page content-driven design: components/SystemDesignGuide.jsx contains the complete dataset (the `topics` array) that drives the site content and case studies.
- UI: React components render the topics array; styling is inline/zero-deps (no large CSS framework).
- Static assets: public/ (robots.txt, sitemap.xml, fonts) — hosting ready for Vercel.
- Build/deploy: standard Next.js build pipeline; README documents Vercel deployment.

3) Key conventions (repo-specific patterns)
- Content is data-first: add or edit content by modifying the `topics` array in components/SystemDesignGuide.jsx.
  - Each topic object follows a strict shape: id, category, icon, title, color, tagline, simple, concepts (array), use_cases (array), interview_tips.
  - Use camelCase for keys and kebab-case for `id` (ids are used as anchors/filters).
  - `category` values are canonical: HLD, LLD, FRAMEWORK (use these exact tokens).
- Concept objects must include a `tradeoffs` object with `pros` and `cons` arrays, a `when` string, and an `interview` string (used in interview tips UI).
- Case studies: use_cases entries should include company, title, problem, solution, tradeoff, takeaway.
- Keep content in JS objects (no external markdown files for topics). Avoid adding runtime data fetching — content is embedded.
- TypeScript types exist as devDependencies but the repo is JS-focused. If introducing TypeScript, keep types alongside components and update tsconfig/next config accordingly.

4) Files to check for changes
- components/SystemDesignGuide.jsx — primary content source
- app/layout.jsx, app/page.jsx — layout and routing
- public/ — static assets, sitemap, robots
- package.json — scripts, dependencies

5) Contribution / PR guidance for Copilot sessions
- For content-only changes: update components/SystemDesignGuide.jsx, run `npm run dev` and verify the homepage.
- For UI changes: include screenshots and test the site locally with `npm run dev`.
- Keep commits focused: content changes separate from layout/styling changes.

6) AI assistant / tooling files discovered
- No existing Copilot/Copilot-CLI helper files were found. If adding AI config, use these filenames:
  - .github/copilot-instructions.md (this file)
  - CLAUDE.md, AGENTS.md, .cursorrules, .windsurfrules, CONVENTIONS.md when applicable

---

If you want Copilot to perform repository edits automatically, prefer small, focused changes touching the `topics` array only.

