# Facebook Automation - Frontend App

NextJS frontend application for Facebook Automation project.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Start development server
bun run dev
```

App runs on http://localhost:3000

## 📁 Structure

```
src/
├── components/   # React components
│   ├── ui/       # Shadcn UI components
│   └── ...       # Feature components
├── hooks/        # Custom React hooks
├── lib/          # Utilities & API client
├── types/        # TypeScript types
└── app/          # NextJS pages (App Router)
```

## 🛠️ Tech Stack

- **Framework**: NextJS 14+ (App Router)
- **UI**: Shadcn UI + Tailwind CSS
- **State**: React Query (TanStack Query)
- **Icons**: Lucide React
- **API Client**: Eden Treaty (@elysiajs/eden)

## 🎨 UI Components

This project uses Shadcn UI components. To add new components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

## 🧪 Testing

```bash
# Run all tests
bun test

# Run with watch mode
bun test --watch
```

## 📖 Documentation

See main [README.md](../README.md) for project overview.
