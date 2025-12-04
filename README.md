# Epic-Mapping-Simplified

Example Mapping application built with SvelteKit - An offline, drag-and-drop tool for managing Example Mapping sessions.

![Example Mapping in action](https://github.com/user-attachments/assets/a93da00a-c553-45cb-b661-cb7bc58dda88)

## Features

- 🎯 **Four Card Types**: Epic (purple), Rule (blue), Example (green), Question (red)
- ✏️ **Inline Editing**: Double-click any card to edit its content
- 🖱️ **Drag & Drop**: Move cards around using pointer events
- 💾 **Import/Export**: Save and load your mappings as JSON files
- 🗑️ **Card Deletion**: Remove cards with a single click
- 📱 **Offline First**: Works completely offline, no backend required
- 🎨 **Grid Background**: Visual grid for better organization
- ✅ **Fully Tested**: Comprehensive test coverage with Vitest

## Architecture

The application follows a modular structure for easy extension:

```
src/
├── lib/
│   ├── components/      # Svelte components
│   │   ├── Card.svelte
│   │   ├── Grid.svelte
│   │   └── Toolbar.svelte
│   ├── stores/          # State management
│   │   └── cards.ts
│   ├── services/        # Business logic
│   │   └── jsonService.ts
│   └── types.ts         # TypeScript types
└── routes/              # SvelteKit routes
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building for Production

```bash
npm run build
```

You can preview the production build with `npm run preview`.

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

## Deployment

The app is configured for static deployment to GitHub Pages using GitHub Actions. Push to the `main` branch to automatically deploy.

## Technologies

- **SvelteKit** - Web framework
- **TypeScript** - Type safety
- **Vitest** - Testing framework
- **@sveltejs/adapter-static** - Static site generation
- **GitHub Pages** - Deployment

## License

MIT

