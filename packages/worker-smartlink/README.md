# @mova/worker-smartlink

Cloudflare Worker for Smartlink edge routing.

## Overview

This worker provides:

- **Public endpoint**: `GET /s/:linkId` - Evaluates rules and redirects users
- **Admin API**: CRUD operations for SmartlinkCore configurations
- **Debug mode**: Add `?debug=1` to see evaluation details instead of redirect

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create KV namespace

```bash
# Production KV
wrangler kv:namespace create "KV_SMARTLINK_RULES"

# Preview KV (for development)
wrangler kv:namespace create "KV_SMARTLINK_RULES" --preview
```

Copy the IDs and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV_SMARTLINK_RULES"
id = "your_production_id"
preview_id = "your_preview_id"
```

### 3. Run locally

```bash
npm run dev
```

Worker will be available at `http://localhost:8787`

### 4. Deploy

```bash
npm run deploy
```

## API Endpoints

### Public: Smartlink redirect

```
GET /s/:linkId
```

**Parameters:**
- `linkId` - Smartlink identifier

**Query params:**
- `debug=1` - Return JSON debug info instead of redirect
- `utm_source`, `utm_campaign`, etc. - UTM parameters for routing

**Response:**
- `302` redirect to target URL
- OR `200` JSON with debug info if `?debug=1`

**Example:**

```bash
# Normal redirect
curl -I "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok"

# Debug mode
curl "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok&debug=1"
```

### Admin: Get smartlink config

```
GET /api/smartlinks/:linkId
```

**Response:** `200` JSON with SmartlinkCore

**Example:**

```bash
curl "http://localhost:8787/api/smartlinks/spring_sale_2026"
```

### Admin: Update smartlink config

```
PUT /api/smartlinks/:linkId
Content-Type: application/json
```

**Body:** SmartlinkCore JSON (must match `ds:smartlink_rules_v1`)

**Response:** `200` JSON with updated SmartlinkCore

**Example:**

```bash
curl -X PUT "http://localhost:8787/api/smartlinks/spring_sale_2026" \
  -H "Content-Type: application/json" \
  -d @examples/ecommerce/smartlink_rules.spring_sale_2026.json
```

### Admin: Delete smartlink config

```
DELETE /api/smartlinks/:linkId
```

**Response:** `200` JSON with success message

## Context Normalization

The worker extracts context from HTTP request:

| Context Field | Source |
|---------------|--------|
| `country` | `request.cf.country` (Cloudflare property) |
| `lang` | `Accept-Language` header (first language) |
| `device` | `User-Agent` header (mobile/tablet/desktop) |
| `utm.*` | URL query parameters (`utm_source`, etc.) |

## Development

### Test with example data

1. Load example smartlink to KV:

```bash
# Using wrangler CLI
wrangler kv:key put --binding=KV_SMARTLINK_RULES \
  "link:spring_sale_2026" \
  "$(cat ../../examples/ecommerce/smartlink_rules.spring_sale_2026.json | jq -c '{core: ., updated_at: now|todate}')"
```

2. Test redirect:

```bash
# German mobile TikTok user -> DE mobile funnel
curl -I "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok" \
  -H "CF-IPCountry: DE" \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"

# Should redirect to: https://example.de/spring/mobile-funnel
```

### Project structure

```
src/
├── index.ts           # Main entry point
├── router.ts          # URL routing
├── types.ts           # Worker-specific types
├── handlers/
│   ├── public.ts      # /s/:linkId handler
│   └── admin.ts       # /api/smartlinks/:linkId handlers
└── utils/
    ├── context.ts     # Context normalization
    ├── kv.ts          # KV operations
    └── response.ts    # HTTP response helpers
```

## License

MIT

