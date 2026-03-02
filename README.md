# designskill AI

> Extract design systems from any website and export them as Claude skills — colors, typography, spacing, ready in seconds.

🌐 **Live App:** [designskill.co](https://designskill.co)

---

## What is designskill AI?

designskill AI is an open-source web application that uses AI-powered browser automation to extract design systems from any public website. The extracted design tokens — colors, typography, spacing, and more — are packaged into a Claude skill (a Markdown `.md` file) that you can drop directly into Claude Projects to give Claude deep context about a brand's visual language.

### How it works

1. **Extract** — Paste any website URL. Puppeteer visits the page, captures a screenshot, and scrapes all CSS design tokens.
2. **Analyze** — The raw tokens are normalized (colors named, scales identified, fonts catalogued) and structured into a design system JSON.
3. **Export** — The design system is serialized into a ready-to-use Claude skill `.md` file.
4. **Share** — Extractions can be kept private or published to the public gallery for the community to reuse.

---

## Features

- 🎨 **Automated design token extraction** — colors, typography, spacing, borders, shadows, and more
- 🤖 **Claude skill export** — generates a structured `.md` file ready for Claude Projects
- 🗂️ **Public gallery** — browse and reuse design systems extracted from popular websites
- 🔐 **Authentication** — sign up with email/password or GitHub OAuth
- 🌍 **Visibility control** — make extractions public or keep them private
- 🐳 **Docker-ready** — ships with a Dockerfile and Render deployment config
- 🗄️ **PostgreSQL + Prisma** — robust data layer with a clean schema

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth | [Auth.js v5](https://authjs.dev) (next-auth) |
| ORM | [Prisma 6](https://prisma.io) |
| Database | PostgreSQL |
| Scraping | [Puppeteer 24](https://pptr.dev) |
| Color utils | culori, color-namer |
| Deployment | Docker + [Render](https://render.com) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or hosted)
- GitHub OAuth app (optional, for GitHub login)
- Chromium/Chrome installed (for Puppeteer)

### 1. Clone the repository

```bash
git clone https://github.com/anooppattern/designskill-ai.git
cd designskill-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/designskill"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"   # generate with: openssl rand -base64 32

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Puppeteer (optional, defaults to bundled Chromium)
CHROMIUM_EXECUTABLE_PATH="/usr/bin/chromium"
```

### 4. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
designskill-ai/
├── prisma/
│   └── schema.prisma        # Database schema (User, DesignSystemExtraction)
├── src/
│   ├── app/                 # Next.js App Router pages and API routes
│   ├── components/          # Reusable UI components
│   └── lib/                 # Utilities: auth, db, extraction logic
├── public/                  # Static assets
├── Dockerfile               # Docker build config
├── render.yaml              # Render deployment config
└── package.json
```

---

## Deployment

### Deploy to Render (recommended)

The repo includes a `render.yaml` blueprint. Follow these steps:

1. Fork this repository
2. Create a new Render account at [render.com](https://render.com)
3. Click **New > Blueprint** and connect your fork
4. Render will automatically provision a PostgreSQL database and web service
5. Add your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the Render dashboard

### Deploy with Docker

```bash
docker build -t designskill-ai .
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="..." \
  designskill-ai
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | Full URL of your deployment |
| `NEXTAUTH_SECRET` | ✅ | Random secret for session encryption |
| `GITHUB_CLIENT_ID` | ⬜ | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | ⬜ | GitHub OAuth App client secret |
| `CHROMIUM_EXECUTABLE_PATH` | ⬜ | Path to Chromium binary (Docker: `/usr/bin/chromium`) |

---

## Database Schema

The core data model is the `DesignSystemExtraction`:

```
DesignSystemExtraction
├── url / normalizedUrl    — source website
├── siteName               — extracted site name
├── faviconUrl             — site favicon
├── screenshotUrl          — full-page screenshot
├── designSystem (JSON)    — structured design tokens
├── claudeMd (Text)        — exported Claude skill content
├── skillName / fileName   — skill metadata
└── visibility             — PUBLIC or PRIVATE
```

---

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests if applicable
4. Commit with a descriptive message: `git commit -m 'feat: add my feature'`
5. Push to your fork: `git push origin feature/my-feature`
6. Open a Pull Request

Please open an issue first for major changes so we can discuss the approach.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

Built with [Next.js](https://nextjs.org), [Puppeteer](https://pptr.dev), [Prisma](https://prisma.io), and [Auth.js](https://authjs.dev). Powered by [Claude](https://claude.ai) from Anthropic.
