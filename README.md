# Chat Recall

A privacy-first tool to view and search your AI coding assistant chat history. Browse conversations from Claude Code and Cursor in one unified interface.

## Offline First

**Your data never leaves your machine.** Week Work reads directly from local chat history files stored on your computer. There are no external API calls, no cloud sync, and no data collection. Everything runs locally.

## Features

- **Unified View** - See all your Claude Code and Cursor conversations in one place
- **Search** - Find conversations by keyword across all your chat history
- **Weekly Summary** - Review what you worked on each week, organized by project and day
- **Filter by Source** - Toggle between Claude Code, Cursor, or view both
- **Project Grouping** - Chats are automatically organized by project

## Requirements

- Node.js 18+
- pnpm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/icyJoseph/week-work.git
   cd week-work
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the application:
   ```bash
   pnpm build
   ```

## Usage

Start the server:

```bash
pnpm start
```

Open your browser to [http://localhost:3000](http://localhost:3000)

## Development

For development with hot reloading:

```bash
pnpm dev
```

The dev server runs on port 3000 with fast refresh enabled.

## Data Sources

Week Work reads from the standard data locations used by each tool:

| Tool | Location |
|------|----------|
| Claude Code | `~/.claude/projects/` |
| Cursor | Platform-specific Application Support directory |

No configuration needed - if you have chat history, Week Work will find it.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe codebase
- **MUI** - Material UI components
- **better-sqlite3** - SQLite for reading Cursor data

## Privacy

- All processing happens locally on your machine
- No data is transmitted anywhere
- No analytics or telemetry
- Server Components fetch data on your local machine only

## License

MIT
