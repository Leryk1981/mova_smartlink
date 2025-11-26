# @mova/spa-admin

Admin SPA for managing Smartlink configurations.

## Overview

React-based admin interface for editing SmartlinkCore rules.

**Features:**
- 📝 Visual editor for smartlink rules
- 🧪 Test panel to simulate context and see which rule matches
- 🎨 Modern, responsive UI
- ⚡ Fast development with Vite + HMR

## Setup

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

App will be available at `http://localhost:3000`

### Build for production

```bash
npm run build
```

Output will be in `dist/` folder, ready to deploy to Cloudflare Pages.

## Development

### Proxy setup

The dev server proxies API requests to the Worker:

```typescript
proxy: {
  '/api': 'http://localhost:8787',  // Worker API
  '/s': 'http://localhost:8787',    // Public smartlink URLs
}
```

Make sure the Worker is running on port 8787 before starting the SPA.

### Project structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Root component
├── components/
│   ├── SmartlinkEditor.tsx  # Main editor component
│   ├── RulesEditor.tsx      # Rules table editor
│   └── TestPanel.tsx        # Test/debug panel
├── hooks/
│   └── useSmartlink.ts      # API hook for CRUD
└── styles/
    ├── global.css           # Global styles
    ├── App.css              # App layout
    ├── SmartlinkEditor.css  # Editor styles
    ├── RulesEditor.css      # Rules table
    └── TestPanel.css        # Test panel
```

## Usage

### 1. Enter Link ID

At the top of the page, enter the `link_id` you want to edit (e.g., `spring_sale_2026`).

### 2. Edit in Editor tab

- **Basic Info**: Set purpose, status, and fallback URL
- **Context Shape**: Check which context fields your rules use
- **Routing Rules**: Add/edit/delete rules
  - Each rule has conditions (`when`) and a target URL
  - Rules are evaluated in order (first match wins)
  - Use `priority` field to override order
  - Conditions support single values or comma-separated arrays

### 3. Test in Test tab

- Fill in test context (country, device, UTM params)
- Click "Run Test" to see which rule would match
- Result shows matched branch, rule index, and target URL
- Copy public URL to test real redirects

### 4. Save

Click "Save Changes" to persist to Worker's KV storage.

## Deployment to Cloudflare Pages

### Option 1: CLI

```bash
npm run build
npx wrangler pages deploy dist --project-name=smartlink-admin
```

### Option 2: GitHub integration

1. Connect your GitHub repo to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `packages/spa-admin/dist`
4. Deploy automatically on push

## License

MIT

