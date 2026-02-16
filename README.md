# DeckIQ

AI-powered flashcard generator for smarter studying. Create, study, and master any topic with intelligent flashcards generated in seconds.

## Features

- **AI Flashcard Generation** — Enter any topic and get study-ready flashcards instantly
- **Smart Study Sessions** — Track progress and mastery across your decks
- **Organized by Category** — Browse pre-built categories or create custom decks
- **Beautiful UI** — Clean, modern interface designed for focused studying
- **Cross-Platform** — iOS, Android, and web support

## Tech Stack

- **React Native** + **Expo** (SDK 54)
- **Expo Router** — File-based navigation
- **TypeScript** — Type-safe codebase
- **React Query** — Server state management
- **Zustand** — Client state management
- **Zod** — Schema validation for AI-generated content
- **Lucide Icons** — Beautiful, consistent iconography

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/texas0418/DeckIQ.git
cd DeckIQ

# Install dependencies
bun install

# Configure your AI provider (see Configuration below)
cp .env.example .env
```

### Configuration

DeckIQ uses an AI API for flashcard generation. Create a `.env` file in the project root:

```env
EXPO_PUBLIC_AI_API_URL=https://api.openai.com/v1/chat/completions
EXPO_PUBLIC_AI_API_KEY=your-api-key-here
EXPO_PUBLIC_AI_MODEL=gpt-4o-mini
```

Supports any OpenAI-compatible API endpoint.

### Running the App

```bash
# Start the dev server
bun run start

# iOS Simulator
bun run ios

# Android Emulator
bun run android

# Web browser
bun run start:web

# With tunnel (for testing on physical devices over different networks)
bun run start:tunnel
```

## Project Structure

```
├── app/                    # Screens (Expo Router file-based routing)
│   ├── (tabs)/            # Tab navigation
│   │   ├── create/        # AI flashcard generator
│   │   └── ...            # Other tabs
│   ├── deck/              # Deck detail screens
│   ├── study/             # Study session screens
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Modal screen
├── components/            # Reusable UI components
├── constants/             # Colors and theme config
├── contexts/              # React context providers
├── lib/                   # Utilities (AI client, etc.)
├── mocks/                 # Sample data and categories
├── types/                 # TypeScript type definitions
└── assets/                # Images and static assets
```

## Deployment

### App Store (iOS)

```bash
bun install -g @expo/eas-cli
eas build:configure
eas build --platform ios
eas submit --platform ios
```

### Google Play (Android)

```bash
eas build --platform android
eas submit --platform android
```

See [Expo deployment docs](https://docs.expo.dev/submit/introduction/) for detailed instructions.

## License

MIT
