# Quiz Maker

A desktop app for tutors. Type a topic, pick a difficulty, and get a complete
multiple-choice quiz in seconds. Review it, fix anything you don't like, then
export two PDFs to print:

- **Student handout** — questions and options with a Name / Date line, no answers
- **Answer key** — a compact one-page list

Students never touch the app. There are no accounts, no logins, and nothing for
a student to sign into — you generate, you print, you hand out paper.

## What you can do

- **Generate** a quiz on any topic, 1–20 questions, easy / medium / hard, with a
  time limit printed on the handout.
- **Edit any question** — change the text, rewrite the options, move which one is
  correct.
- **Regenerate a single question** if one comes out weak, without touching the
  rest of the quiz.
- **Export** the handout and the answer key independently, any time, from either
  the quiz page or your library.
- **Keep a library** of every quiz you've made, searchable by topic or title.

Everything is stored in a single database file on your own machine.

## Install

Download the latest build from the [Releases page](../../releases/latest).

**macOS** — open the `.dmg` and drag Quiz Maker to Applications. Apple Silicon
only; the app is signed and notarized by Apple.

**Windows** — run the `.exe` installer. Windows will show a
*"Windows protected your PC"* warning, because the installer is not
code-signed — that requires a paid certificate this project does not have.
Choose **More info → Run anyway** to continue.

## Add your AI key

Quiz Maker generates questions with [DeepSeek](https://platform.deepseek.com).
**No key is bundled** — you use your own, and it stays on your machine.

1. Get an API key from DeepSeek.
2. Open Quiz Maker and click the gear icon in the top bar.
3. Paste the key and save.

Until a key is set, quiz generation reports that no key is configured. Nothing
else in the app needs one — your existing quizzes, edits and PDF exports all
work offline.

Your key is stored in the app's own settings file on your computer. It is never
sent anywhere except to DeepSeek when you generate a question, and the app never
displays it back to you once saved.

## Where your data lives

| | |
|---|---|
| macOS | `~/Library/Application Support/Quiz Maker/quiz-maker.db` |
| Windows | `%APPDATA%\Quiz Maker\quiz-maker.db` |

One SQLite file holding your quizzes and questions. Back it up by copying it.
There is no cloud sync, no telemetry, and no account.

## Build from source

Requires Node.js 20+ and npm.

```bash
npm install
cd frontend && npm install && cd ..
npx prisma migrate dev     # first-time database setup
npm run dev                # Vite dev server + Electron
```

To package installers:

```bash
npm run build -- --mac           # macOS installer, for the type of Mac you build on
npm run build -- --win --x64     # Windows installer, 64-bit
```

`npm run build` regenerates the database client, removes the build machine's
folder paths from it, prepares the starting database and builds the interface
before packaging. It stops if any folder path would ship inside the app.

Signing is not configured in this repository — builds come out unsigned unless
you supply your own certificate.

## Built with

Electron · React 19 · Vite · Tailwind CSS · Radix UI · Framer Motion ·
Prisma · SQLite · DeepSeek

## Licence

MIT — see [LICENSE](LICENSE).

The bundled Inter typeface is licensed separately under the SIL Open Font
License 1.1 — see [THIRD_PARTY_LICENSES](THIRD_PARTY_LICENSES).

Copyright (c) 2026 Nav Virdi — Liberated.Info
