# SmartLink Landing Page

**Status:** Production-ready  
**Version:** 1.0.0 (MOVA 4.0)  
**Tech:** React + TypeScript + Vite

## Overview

Одностраничный лендинг для SmartLink — внешний пользовательский интерфейс, который:

- Объясняет, что такое SmartLink и зачем он нужен
- Даёт живое демо через интерактивный компонент DemoResolve
- Показывает технические детали для технической аудитории
- Ничего не требует для старта (только браузер)

## Quick Start

### 1. Install dependencies

```bash
cd apps/smartlink-landing
npm install
```

### 2. Configure Worker URL

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# For local development
VITE_WORKER_URL=http://localhost:8787

# For production
# VITE_WORKER_URL=https://your-worker.workers.dev
```

### 3. Run dev server

```bash
npm run dev
```

Open: http://localhost:5174

### 4. Test Demo

1. Scroll to "Попробуй прямо сейчас"
2. Select smartlink config (e.g., `spring_sale_2026`)
3. Choose click parameters (country, device, UTM)
4. Click "Смоделировать переход"
5. See the result from Worker

**Important:** Worker must be running for Demo to work!

```bash
# In separate terminal
cd packages/worker-smartlink
npm run dev
```

## Build for Production

```bash
npm run build
```

Output: `dist/` folder with static files.

## Deploy to Cloudflare Pages

### Option 1: Manual Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name=smartlink-landing
```

### Option 2: GitHub Actions (Automatic)

Create `.github/workflows/deploy-landing.yml`:

```yaml
name: Deploy Landing

on:
  push:
    branches:
      - main
    paths:
      - 'apps/smartlink-landing/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd apps/smartlink-landing
          npm ci
      
      - name: Build
        run: |
          cd apps/smartlink-landing
          npm run build
        env:
          VITE_WORKER_URL: ${{ secrets.WORKER_URL }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: smartlink-landing
          directory: apps/smartlink-landing/dist
```

**Required secrets:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `WORKER_URL` (production worker URL)

### Option 3: Cloudflare Pages Git Integration

1. Go to Cloudflare Dashboard → Pages
2. Connect GitHub repository
3. Configure build:
   - **Build command:** `cd apps/smartlink-landing && npm install && npm run build`
   - **Build output directory:** `apps/smartlink-landing/dist`
   - **Root directory:** `/`
4. Set environment variable:
   - `VITE_WORKER_URL=https://your-worker.workers.dev`

## Project Structure

```
apps/smartlink-landing/
├── src/
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   ├── components/
│   │   ├── Hero.tsx            # Hero section
│   │   ├── ProblemSection.tsx  # Pain points
│   │   ├── HowItWorks.tsx      # 3-step explanation
│   │   ├── DemoResolve.tsx     # Interactive demo
│   │   ├── TechSection.tsx     # Technical details
│   │   └── Footer.tsx          # CTA and links
│   ├── api/
│   │   └── smartlinkApi.ts     # Worker API wrapper
│   └── styles/
│       └── main.css            # All styles (mobile-first)
├── public/
│   ├── favicon.svg             # Icon
│   └── manifest.webmanifest    # PWA manifest
├── index.html
├── package.json
├── vite.config.ts
└── README.md                   # This file
```

## Features

### Hero Section
- Clear value proposition
- Call-to-action (scroll to demo)
- Visual badges (MOVA 4.0, Edge-first, Open Schema)

### Problem Section
- 4 pain points SmartLink solves
- Simple cards with icons

### How It Works
- 3-step explanation
- Technical note for developers

### Demo Resolve (Interactive)
- Select smartlink config
- Set click parameters (country, device, UTM)
- Real API call to Worker
- Display result with outcome, URL, latency

### Tech Section
- MOVA 4.0 explanation
- Self-hosted benefits
- Links to docs and GitHub

### Footer
- CTA for early adopters
- Links to documentation
- Version info

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_WORKER_URL` | Worker base URL for API calls | `http://localhost:8787` |

## API Integration

Landing page communicates with Worker via `POST /smartlink/resolve` endpoint.

**Request format:** `env.smartlink_resolve_v1` envelope

```typescript
{
  envelope_id: 'env.smartlink_resolve_v1',
  verb: 'route',
  roles: { requester: 'smartlink-landing', executor: 'smartlink-worker' },
  payload: {
    input: {
      smartlink_id: 'spring_sale_2026',
      timestamp: '2025-12-02T10:00:00Z',
      country: 'DE',
      device: 'mobile',
      utm: { source: 'tiktok' }
    }
  }
}
```

**Response:** Same envelope with `output` field populated.

See `src/api/smartlinkApi.ts` for implementation details.

## Responsive Design

Mobile-first CSS:
- Breakpoint: 768px
- Grid layouts adapt to screen size
- Touch-friendly buttons (min 44x44px)
- Readable typography (clamp for fluid sizing)

## PWA Support

Basic PWA manifest included (`public/manifest.webmanifest`):
- Name, icons, theme color
- Can be installed to homescreen
- Offline support: not implemented (landing is simple enough)

## Performance

- No heavy dependencies (only React)
- CSS bundled in build
- Vite for fast dev + optimized production build
- Tree-shaking enabled

## Browser Support

- Modern browsers (ES2020+)
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

## Troubleshooting

### Demo не работает / Worker errors

**Проблема:** `HTTP 404` или `Failed to fetch`

**Решение:**
1. Проверь, что Worker запущен:
   ```bash
   cd packages/worker-smartlink
   npm run dev
   ```
2. Проверь `.env` файл:
   ```env
   VITE_WORKER_URL=http://localhost:8787
   ```
3. Открой `http://localhost:8787` напрямую — должен вернуть 404 (это нормально, если нет root route)

### CORS errors

**Проблема:** Browser blocks requests to Worker

**Решение:** Worker already handles CORS (see `packages/worker-smartlink/src/index.ts`). If issues persist, check Worker logs.

### Build fails

**Проблема:** TypeScript errors during build

**Решение:**
```bash
npm run lint  # Check for TypeScript issues
npm run build # Try again
```

## Next Steps

### Completed ✅
- Hero, Problem, HowItWorks, TechSection
- Interactive DemoResolve
- Responsive design
- PWA manifest
- README

### Future Enhancements (Optional)
- Add more demo configs
- Show episode details (genetic layer)
- Add config editor (visual JSON builder)
- Real-time stats dashboard
- Dark mode toggle
- i18n (multilingual)

## References

- [SmartLink 4.0 Specification](../../mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md)
- [Worker MOVA 4.0 Guide](../../packages/worker-smartlink/README_MOVA4.md)
- [Core Library](../../packages/core-smartlink/README.md)
- [Tasks & Progress](../../docs/TASKS_SMARTLINK_V1.md)

## License

MIT

---

**Task:** SL-UE-LANDING-4.0 ✅  
**Status:** Production-ready  
**Date:** 2025-12-02
