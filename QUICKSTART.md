# 🚀 Quickstart - Get Running in 5 Minutes

Fastest way to get MOVA Smartlink v1 running locally.

## Prerequisites

✅ Node.js >= 18  
✅ npm >= 9  
✅ Terminal access

## Step 1: Install (1 min)

```bash
npm install
```

## Step 2: Build Core (30 sec)

```bash
cd packages/core-smartlink
npm run build
cd ../..
```

## Step 3: Setup Worker KV (1 min)

```bash
cd packages/worker-smartlink

# Create KV namespace for local dev
npx wrangler kv:namespace create "KV_SMARTLINK_RULES" --preview

# Copy the preview_id from output and update wrangler.toml
# Replace "your_preview_kv_namespace_id_here" with the actual ID
```

Edit `packages/worker-smartlink/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV_SMARTLINK_RULES"
id = "your_kv_namespace_id_here"
preview_id = "PASTE_YOUR_PREVIEW_ID_HERE"  # ← Change this line
```

## Step 4: Load Example Data (30 sec)

**Option A: Using wrangler CLI (if you have jq)**

```bash
npx wrangler kv:key put \
  --binding=KV_SMARTLINK_RULES \
  --local \
  "link:spring_sale_2026" \
  "$(cat ../../examples/ecommerce/smartlink_rules.spring_sale_2026.json | jq -c '{core: ., updated_at: now|todate}')"
```

**Option B: Via Worker API (simpler)**

First start Worker (next step), then:

```bash
curl -X PUT http://localhost:8787/api/smartlinks/spring_sale_2026 \
  -H "Content-Type: application/json" \
  -d @../../examples/ecommerce/smartlink_rules.spring_sale_2026.json
```

## Step 5: Start Servers (1 min)

**Terminal 1: Start Worker**

```bash
cd packages/worker-smartlink
npm run dev
```

Wait for: `⛅️ wrangler ... Ready on http://localhost:8787`

**Terminal 2: Start SPA**

```bash
cd packages/spa-admin
npm run dev
```

Wait for: `Local: http://localhost:3000`

## Step 6: Test It! (1 min)

### Test Worker API

```bash
# Get smartlink config
curl http://localhost:8787/api/smartlinks/spring_sale_2026

# Test redirect in debug mode
curl "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok&debug=1"
```

### Test SPA

1. Open browser: `http://localhost:3000`
2. You should see "Smartlink Admin" page
3. Link ID should be: `spring_sale_2026`
4. Click **Editor** tab → See 3 rules loaded
5. Click **Test** tab → Try different contexts

### Test End-to-End

1. In SPA, go to **Editor** tab
2. Expand first rule
3. Change target to: `https://example.de/NEW-TARGET`
4. Click "Save Changes"
5. Go to **Test** tab
6. Set: Country=`DE`, Device=`mobile`, UTM Source=`tiktok`
7. Click "Run Test"
8. Should show your new target: `https://example.de/NEW-TARGET`

## ✅ Success!

You now have:
- ✅ Worker running on port 8787
- ✅ SPA running on port 3000
- ✅ Example smartlink loaded
- ✅ Full edit → test → redirect flow working

## Next Steps

- 📖 Read [SETUP.md](./SETUP.md) for complete guide
- 🧪 Read [TESTING.md](./TESTING.md) for testing scenarios
- 📚 Read [README.md](./README.md) for architecture
- 💻 Read [COMMANDS.md](./COMMANDS.md) for command reference

## Troubleshooting

### "Cannot find module '@mova/core-smartlink'"

```bash
cd packages/core-smartlink
npm run build
```

### Worker returns 404 for everything

- Check `wrangler dev` is running without errors
- Check you updated `preview_id` in `wrangler.toml`

### SPA shows "Smartlink not found"

- Make sure you loaded example data (Step 4, Option B)
- Check Worker API works: `curl http://localhost:8787/api/smartlinks/spring_sale_2026`

### SPA can't connect to Worker

- Verify Worker is on port 8787
- Check browser console for CORS errors
- Try: `curl http://localhost:8787/s/test` (should return 404, proving Worker responds)

### Other issues

See full [SETUP.md](./SETUP.md) troubleshooting section.

---

**Time: ~5 minutes | Difficulty: Easy | Status: Production Ready**

