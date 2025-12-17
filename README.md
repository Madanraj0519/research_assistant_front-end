# Research Assistant - Chrome Extension

AI-powered research assistant, text summarization, and note-taking Chrome extension powered by Google Gemini.

## Features

- **AI Summarization**: Highlight text on any webpage and get instant AI-powered summaries
- **Context Menu Integration**: Right-click selected text to summarize
- **Floating Action Button**: Quick access to summarization on any webpage
- **Notes Management**: Save and organize your summaries and research notes
- **History Tracking**: Keep track of all your summarized content
- **Dark Mode**: Beautiful light and dark themes
- **Options Dashboard**: Full-featured dashboard in a separate tab

## Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API Key (free at [Google AI Studio](https://aistudio.google.com))

## Installation

### 1. Clone and Install Dependencies

```bash
cd research-assistant
npm install
```

### 2. Set Up Environment Variables (Optional)

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

> **Note**: You can also add your API key directly in the extension's Settings page after installation.

### 3. Build the Extension

```bash
npm run build
```

This will:
- Build the React app with Vite
- Bundle the content script
- Copy all assets to the `dist` folder

### 4. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist` folder from this project

## Development

### Run Development Server

For local development with hot reload:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (extension) |
| `npm run build:extension` | Full extension build |
| `npm run build:content` | Build content script only |
| `npm run type-check` | Run TypeScript type checking |

## Project Structure

```
research-assistant/
├── components/          # Reusable UI components
│   └── UI.tsx          # Button, Card, Input, Textarea
├── context/            # React context providers
│   └── StoreContext.tsx # Global state management
├── pages/              # Page components
│   ├── Home.tsx        # Main summarization page
│   ├── Notes.tsx       # Notes list
│   ├── NoteEditor.tsx  # Note editor
│   ├── History.tsx     # Summary history
│   ├── Settings.tsx    # Extension settings
│   └── Login.tsx       # Login page
├── public/             # Static assets
│   └── icon*.svg       # Extension icons
├── scripts/            # Build scripts
│   ├── copy-assets.js  # Asset copying
│   └── generate-icons.js # Icon generation
├── services/           # API services
│   └── geminiService.ts # Gemini AI integration
├── App.tsx             # Main app component
├── index.tsx           # Entry point
├── index.html          # HTML template
├── index.css           # Global styles (Tailwind)
├── content.ts          # Content script for pages
├── background.js       # Extension service worker
├── manifest.json       # Chrome extension manifest
├── types.ts            # TypeScript types
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Usage

### Popup Mode
Click the extension icon in Chrome toolbar to open the popup:
- Paste text directly to summarize
- View recent summaries
- Quick access to notes

### Context Menu
1. Select text on any webpage
2. Right-click and choose "Summarize with Research Assistant"
3. Open the extension popup to see your summary

### Floating Button
1. Select text on any webpage
2. A floating "Summarize" button appears
3. Click it to send text to the extension

### Options Dashboard
Click "Full Dashboard" in Settings or right-click the extension icon and select "Options" for:
- Full-screen notes management
- Complete history view
- Detailed settings

## Configuration

### API Key Setup

1. Get a free API key at [Google AI Studio](https://aistudio.google.com)
2. Open the extension and go to Settings
3. Paste your API key and click Save

### Theme

Toggle between light and dark mode in Settings.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **Google Generative AI** - AI summarization

## Troubleshooting

### Extension not loading
- Make sure you're loading the `dist` folder, not the project root
- Check for errors in `chrome://extensions`

### API errors
- Verify your API key is correct
- Check your API quota at Google AI Studio
- Ensure you have internet connectivity

### Content script not working
- Refresh the page after installing/updating the extension
- Check if the site allows content scripts

## License

MIT License - feel free to use and modify for your own projects.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with React + Vite + Tailwind CSS + Google Gemini AI
