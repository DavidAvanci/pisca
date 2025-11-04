# Twitch Chat Viewer

A React application built with TypeScript, React Query, and shadcn/ui that connects to Twitch and displays chat messages in real-time.

## Features

- 🔴 Real-time Twitch chat connection using `tmi.js`
- 💬 Live chat message display
- 🎨 Modern UI built with shadcn/ui components
- 📱 Responsive design
- 🔄 Auto-reconnect on connection loss
- 🎯 User badges (MOD, SUB) display
- 🎨 Colored usernames

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Usage

1. Enter a Twitch channel name (without the `#` prefix) in the input field
2. Click "Connect" or press Enter
3. Chat messages will appear in real-time below
4. Click "Disconnect" to stop receiving messages

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Query (TanStack Query)** - State management
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **tmi.js** - Twitch IRC client
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   └── ChatMessages.tsx  # Chat display components
├── hooks/
│   └── useTwitchChat.ts  # Twitch chat connection hook
├── types/
│   └── chat.ts      # TypeScript types
├── lib/
│   └── utils.ts     # Utility functions
├── App.tsx          # Main application component
└── main.tsx         # Entry point
```

## Notes

- The app connects to Twitch IRC anonymously (no authentication required)
- Messages are limited to the last 500 to prevent memory issues
- Channel names are case-insensitive and automatically normalized

## License

MIT

