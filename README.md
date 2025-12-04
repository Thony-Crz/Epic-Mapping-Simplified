# Epic-Mapping-Simplified

Example Mapping application built with SvelteKit - An offline, drag-and-drop tool for managing Example Mapping sessions with **hierarchical structure support**.

![Example Mapping in action](https://github.com/user-attachments/assets/a93da00a-c553-45cb-b661-cb7bc58dda88)

## Features

- 🎯 **Four Card Types**: Epic (purple), Rule (blue), Example (green), Question (red)
- 🔗 **Hierarchical Structure**: Link cards in a hierarchy (Epic → Rules → Examples/Questions)
- 📊 **Visual Indicators**: Parent links, children counts, and badges showing relationships
- ✏️ **Inline Editing**: Double-click any card to edit its content
- 🖱️ **Drag & Drop**: Move cards around using pointer events
- 💾 **Import/Export**: Save and load your mappings in two formats:
  - **Flat JSON**: Traditional format with all cards in a single array
  - **Nested JSON**: Hierarchical format preserving parent-child relationships
- 🔗 **Link Mode**: Interactive mode to create parent-child relationships between cards
- 🗑️ **Smart Deletion**: Deleting a parent card also removes its children
- 📱 **Offline First**: Works completely offline, no backend required
- 🎨 **Grid Background**: Visual grid for better organization
- ✅ **Fully Tested**: Comprehensive test coverage with Vitest

## Hierarchical Structure

The application supports a three-level hierarchy:

```
Epic (Purple)
  └── Rule (Blue)
        ├── Example (Green)
        └── Question (Red)
```

### Visual Indicators

- **Parent Badge**: Cards show their parent with format `↑ type: Parent Name`
- **Children Counts**: Parent cards display badges showing:
  - Epics: `2 📘` (rules), `3 ✅` (examples), `4 ❓` (questions)
  - Rules: `2 ✅` (examples), `3 ❓` (questions)
- **Unlink Button**: `⛓️‍💥` button to remove parent-child relationship

### Linking Cards

1. Click the **🔗 Link Cards** button in the toolbar
2. Click a **child card** (the card you want to link)
3. Click a **parent card** (the card to link to)
4. The relationship is created automatically with validation

**Hierarchy Rules:**
- Epic cards cannot have parents
- Rules can only be linked to Epics
- Examples and Questions can only be linked to Rules

## Export/Import Formats

### Nested JSON Format (v2.0.0)

Preserves the hierarchical structure. See [example-nested.json](./example-nested.json) for a complete example.

```json
{
  "version": "2.0.0",
  "epics": [
    {
      "id": "epic-uuid",
      "title": "Epic A",
      "rules": [
        {
          "id": "rule-uuid",
          "title": "Rule 1",
          "examples": [
            { "id": "ex-uuid", "text": "Example 1" }
          ],
          "questions": [
            { "id": "q-uuid", "text": "Question 1" }
          ]
        }
      ]
    }
  ]
}
```

### Flat JSON Format (v1.0.0)

Legacy format with all cards in a flat array:

```json
{
  "version": "1.0.0",
  "cards": [
    {
      "id": "1",
      "type": "epic",
      "content": "Epic 1",
      "position": { "x": 0, "y": 0 },
      "parentId": "optional-parent-id"
    }
  ]
}
```

### Import Validation

The nested import includes comprehensive validation:
- ✅ Checks for missing or invalid IDs
- ✅ Detects duplicate IDs across all entities
- ✅ Validates required fields (title, text)
- ✅ Ensures proper array structures
- ✅ Provides clear error messages for invalid data
- ✅ Prevents data corruption on import failures

## Screenshots

### Initial Interface
![Initial UI](https://github.com/user-attachments/assets/746e6beb-f826-498f-83a0-659a540c0f62)
*Clean toolbar with card creation buttons and import/export options*

### Hierarchical Structure Display
![Hierarchical Structure](https://github.com/user-attachments/assets/45c3d5fd-8b65-4a7f-a907-56d5e0d27b70)
*Cards showing parent relationships and children counts with badges*

### Link Mode
![Link Mode Active](https://github.com/user-attachments/assets/9683a22d-e375-47aa-88af-99c38e054a10)
*Interactive linking mode for creating parent-child relationships*

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

The app is configured for static deployment and supports multiple platforms:

### GitHub Pages

The app is configured for static deployment to GitHub Pages using GitHub Actions. Push to the `main` branch to automatically deploy.

The GitHub Actions workflow sets `GITHUB_PAGES=true` to ensure the correct base path is used.

### Vercel

The app can be deployed to Vercel with zero configuration:

1. **Import your repository** to Vercel
2. Vercel will automatically detect SvelteKit and use the correct settings
3. Deploy!

Alternatively, you can use the Vercel CLI:

```bash
# Install Vercel CLI
npm install --global vercel

# Deploy
vercel
```

The `vercel.json` configuration file is included for optimal deployment settings.

## Technologies

- **SvelteKit** - Web framework
- **TypeScript** - Type safety
- **Vitest** - Testing framework
- **@sveltejs/adapter-static** - Static site generation
- **GitHub Pages & Vercel** - Deployment platforms

## License

MIT License

© 2025 Anthony Criblez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


