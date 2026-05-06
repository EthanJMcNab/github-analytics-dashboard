# GitHub Analytics Dashboard

A React dashboard for exploring public GitHub repositories through repository metadata, language usage, and commit activity trends.

The project focuses on turning raw GitHub REST API responses into clear, useful engineering signals. It is being developed methodically as a portfolio project, with future work planned around AI-assisted repository auditing.

## Features

- Search any public GitHub repository by `owner/repo`.
- View key repository metrics including stars, forks, open issues, watchers, language, license, size, and update dates.
- Inspect language usage with a chart and sortable-style data table.
- Review weekly commit activity across 12, 26, or 52 week ranges.
- See derived commit insights including total commits, average commits per week, peak activity, inactive weeks, and trend versus the previous period.
- Handles common API edge cases such as missing repositories, unavailable commit stats, and invalid API responses.

## Tech Stack

- React
- Vite
- JavaScript
- Recharts
- GitHub REST API

## Project Direction

The next major milestone is an AI audit layer that will review repository health and provide evidence-based suggestions for engineers. Planned work includes:

- extracting GitHub API access into a dedicated service layer
- introducing a server-side boundary for AI calls so API keys are never exposed in the browser
- generating a structured repository analytics snapshot for AI review
- presenting AI findings with severity, evidence, and actionable recommendations

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm

### Installation

```bash
git clone https://github.com/EthanJMcNab/github-analytics-dashboard.git
cd github-analytics-dashboard
npm install
npm run dev
```

### Optional GitHub Token

For local testing, create `.env.local` and add a low-privilege GitHub personal access token to raise GitHub REST API rate limits:

```bash
GITHUB_TOKEN=github_pat_your_token_here
```

The token is read by the Vite dev server and attached to proxied `/api/github` requests. Do not prefix it with `VITE_`; Vite exposes `VITE_` values to browser code. Restart `npm run dev` after changing `.env.local`.

### Useful Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Screenshots

### Repository Overview

![Repository overview](./assets/screenshots/repo-overview.png)

### Language Breakdown

![Language breakdown](./assets/screenshots/language-breakdown.png)

### Commit Activity

![Commit activity](./assets/screenshots/commit-activity.png)

## Author

Ethan J McNab
