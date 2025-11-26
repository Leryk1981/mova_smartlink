# Troubleshooting Guide - Interface Issues

## Problem: "Failed to load resource: 404" or blank page

### Quick Fix (Try this first!)

1. **Stop ALL dev servers:**
   ```bash
   # Windows PowerShell
   Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Use the start script:**
   ```bash
   # Double-click this file:
   START_DEV_SERVERS.bat
   ```

3. **Wait 15 seconds** for both servers to start

4. **Open browser:**
   ```
   http://localhost:3000
   ```

5. **Hard refresh:** Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)

---

## If Quick Fix Doesn't Work

### Step 1: Check Ports

Open PowerShell and run:
```powershell
Test-NetConnection localhost -Port 8787 -InformationLevel Quiet
Test-NetConnection localhost -Port 3000 -InformationLevel Quiet
```

Both should return `True`. If not:
- Port 8787 (Worker) is not running → Restart Worker
- Port 3000 (SPA) is not running → Restart SPA

### Step 2: Check Browser Console

1. Open browser Developer Tools: Press `F12`
2. Go to **Console** tab
3. Look for errors (in red)

**Common errors and fixes:**

#### Error: "Failed to load resource: favicon.ico"
✅ **Fix**: This is harmless, just a missing icon. Ignore it.

#### Error: "Failed to load module /src/main.tsx"
❌ **Problem**: Vite can't find the source files

**Fix**:
```bash
cd packages/spa-admin
# Clear Vite cache
Remove-Item node_modules\.vite -Recurse -Force -ErrorAction SilentlyContinue
# Restart SPA
npm run dev
```

#### Error: "Cannot find module '@mova/core-smartlink'"
❌ **Problem**: Core library not built

**Fix**:
```bash
cd packages/core-smartlink
npm run build
# Then restart SPA
cd ../spa-admin
npm run dev
```

### Step 3: Manual Start (Step by step)

**Terminal 1 - Worker:**
```bash
cd d:\Projects_Clean\mova_smartlink\packages\worker-smartlink
npm run dev
```

Wait for: `Ready on http://127.0.0.1:8787`

**Terminal 2 - SPA:**
```bash
cd d:\Projects_Clean\mova_smartlink\packages\spa-admin
npm run dev
```

Wait for: `Local: http://localhost:3000/`

### Step 4: Verify Servers Respond

**Test Worker:**
```bash
curl http://localhost:8787/api/smartlinks/test
```
Expected: JSON with error "Not Found" (this is correct!)

**Test SPA:**
```bash
curl http://localhost:3000
```
Expected: HTML with "Smartlink Admin"

---

## Common Issues

### Issue: "Port 3000 is in use, trying another one..."

**Problem**: Another process is using port 3000

**Fix**:
```powershell
# Find what's using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or use different port:
cd packages/spa-admin
npm run dev -- --port 3001
# Then open http://localhost:3001
```

### Issue: Blank white page, no errors

**Problem**: React app not mounting

**Check**:
1. Open DevTools → Elements tab
2. Look for `<div id="root">` - should have content inside
3. If empty, React didn't mount

**Fix**:
```bash
cd packages/core-smartlink
npm run build

cd ../spa-admin
# Clear cache
Remove-Item node_modules\.vite -Recurse -Force
npm run dev
```

### Issue: "content-script.js" errors

**Problem**: Browser extension interfering

**Fix**: These are from browser extensions (React DevTools, etc.). They're harmless. Ignore them.

---

## Nuclear Option: Fresh Start

If nothing works:

```bash
# 1. Stop everything
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Clean install
cd d:\Projects_Clean\mova_smartlink
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install

# 3. Build core
cd packages/core-smartlink
npm run build

# 4. Start Worker
cd ../worker-smartlink
npm run dev
# → Wait for "Ready on http://127.0.0.1:8787"

# 5. Start SPA (new terminal)
cd ../spa-admin
npm run dev
# → Wait for "Local: http://localhost:3000/"

# 6. Open browser
start http://localhost:3000
```

---

## Still Not Working?

### Collect Information:

1. **Check Node version:**
   ```bash
   node --version  # Should be >= 18
   ```

2. **Check npm version:**
   ```bash
   npm --version  # Should be >= 9
   ```

3. **Check terminal output:**
   - Look for any ERROR messages in Worker terminal
   - Look for any ERROR messages in SPA terminal
   - Copy the full error

4. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Screenshot any red errors

5. **Check network tab:**
   - Press F12 → Network tab
   - Refresh page
   - Look for failed requests (in red)
   - Note which files failed to load

---

## Expected Behavior

When working correctly, you should see:

**Worker Terminal:**
```
✓ Ready on http://127.0.0.1:8787
```

**SPA Terminal:**
```
VITE v5.4.21  ready in 576 ms

➜  Local:   http://localhost:3000/
```

**Browser:**
- Page loads in ~1 second
- Shows "⚡ Smartlink Admin" header
- Shows tabs: "📝 Editor" and "🧪 Test"
- No red errors in console (F12)

**Browser Console (F12):**
```
Download the React DevTools...  ← This is OK, just info
```

No other errors!

---

## Quick Tests

```bash
# Test 1: Check ports
Test-NetConnection localhost -Port 8787 -InformationLevel Quiet  # Should be True
Test-NetConnection localhost -Port 3000 -InformationLevel Quiet   # Should be True

# Test 2: Check Worker responds
curl http://localhost:8787/api/smartlinks/test  # Should return JSON

# Test 3: Check SPA responds  
curl http://localhost:3000  # Should return HTML

# Test 4: Check if SPA page loads completely
curl http://localhost:3000 | Select-String "Smartlink Admin"  # Should find it
```

All tests should pass!

---

## Additional Help

- 📖 **Setup Guide**: `SETUP.md`
- 🚀 **Quick Start**: `QUICKSTART.md`
- 💻 **Commands**: `COMMANDS.md`
- 🐛 **Build Report**: `BUILD_AND_TEST_REPORT.md`

