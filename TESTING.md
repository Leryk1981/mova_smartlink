# Testing Guide - Smartlink v1

Complete manual and automated testing instructions.

## Automated Tests

### Core Library Tests

```bash
cd packages/core-smartlink
npm test
```

**What's tested:**
- ✅ Rule matching logic (country, device, UTM)
- ✅ Case-insensitive matching
- ✅ Array conditions (e.g., country: ["DE", "AT", "CH"])
- ✅ Priority-based rule ordering
- ✅ Fallback behavior
- ✅ AND logic (all conditions must match)
- ✅ Partial UTM matching (fails if not all required params present)

**Expected output:**
All tests should pass. Example:

```
✔ evaluate: DE + mobile + TikTok matches rule_1
✔ evaluate: email + spring_2026 campaign matches rule_2
✔ evaluate: DE + desktop matches rule_3
...
✔ 12 tests passed
```

## Manual E2E Testing

### Prerequisites

- Worker running on `http://localhost:8787`
- SPA running on `http://localhost:3000`
- Example data loaded in KV (see SETUP.md)

### Test 1: View existing smartlink

**Steps:**
1. Open SPA at `http://localhost:3000`
2. Link ID field should show `spring_sale_2026`
3. Click on **Editor** tab

**Expected:**
- Purpose field shows: "Spring sale 2026..."
- Status shows: `draft` or `active`
- Context shape has 4 items checked
- 3 rules are visible in rules list
- Fallback target is set

**If fails:**
- Verify Worker is running
- Check KV has data: `curl http://localhost:8787/api/smartlinks/spring_sale_2026`
- Check browser console for errors

---

### Test 2: Edit rule and save

**Steps:**
1. In Editor tab, expand first rule (de_tiktok_mobile)
2. Change Target URL to: `https://example.de/TEST-MOBILE-FUNNEL`
3. Change Label to: `test_mobile_funnel`
4. Click "Save Changes" button

**Expected:**
- Green success message appears: "✓ Saved successfully!"
- Version number increments at bottom
- Updated timestamp changes

**Verify persistence:**
```bash
curl http://localhost:8787/api/smartlinks/spring_sale_2026 | jq '.rules[0]'
```

Should show new target and label.

---

### Test 3: Test rule matching (Test Panel)

**Steps:**
1. Click on **Test** tab
2. Set context:
   - Country: `DE`
   - Device: `mobile`
   - UTM Source: `tiktok`
3. Click "Run Test"

**Expected:**
- Result shows:
  - Matched Branch: `test_mobile_funnel` (your new label)
  - Rule Index: `0`
  - Target URL: `https://example.de/TEST-MOBILE-FUNNEL`

**Verify via curl:**
```bash
curl "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok&debug=1" \
  -H "CF-IPCountry: DE" \
  -H "User-Agent: Mozilla/5.0 (iPhone)"
```

Should return JSON with matching decision.

---

### Test 4: Test fallback

**Steps:**
1. In Test tab, change context:
   - Country: `FR` (France - no rules match)
   - Device: `desktop`
   - UTM Source: `` (empty)
2. Click "Run Test"

**Expected:**
- Matched Branch: `fallback`
- Rule Index: `-1`
- Target URL: matches `fallback_target` from config

---

### Test 5: Add new rule

**Steps:**
1. Go to Editor tab
2. Scroll to bottom of rules list
3. Click "+ Add Rule" button
4. Expand new rule
5. Fill in:
   - Label: `us_desktop`
   - Target: `https://example.com/us-landing`
   - Click "+ Add Country"
   - Country: `US`
   - Click "+ Add Device"
   - Device: `desktop`
6. Click "Save Changes"

**Expected:**
- New rule appears in list
- Success message shows

**Test new rule:**
1. Go to Test tab
2. Set Country: `US`, Device: `desktop`
3. Run Test
4. Should match new rule: `us_desktop`

---

### Test 6: Rule ordering and priority

**Steps:**
1. In Editor, expand first rule
2. Set Priority to: `100`
3. Expand second rule  
4. Set Priority to: `10`
5. Save

**Expected:**
- Rules are still in same visual order
- But evaluation should now prioritize rule 2 over rule 1

**Test:**
1. Create context that matches both rules
2. Rule with priority `10` should win over priority `100`
3. (Lower number = higher priority)

---

### Test 7: Test real redirect (no debug mode)

**Steps:**
1. In Test panel, copy Public URL
2. Open in new browser tab or:

```bash
curl -I "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok"
```

**Expected:**
- Returns `HTTP/1.1 302 Found`
- `Location:` header points to target URL
- Browser redirects automatically

---

### Test 8: Multiple conditions (AND logic)

**Steps:**
1. Test context with partial match:
   - Country: `DE` ✓
   - Device: `mobile` ✓
   - UTM Source: `` (empty) ✗

**Expected:**
- First rule requires ALL THREE (DE + mobile + tiktok)
- Should NOT match first rule
- Should fall through to third rule (DE only)
- Matched Branch: `de_default`

---

### Test 9: Array conditions

**Steps:**
1. Edit a rule to have multiple countries:
   - Country field: `DE,AT,CH` (comma-separated)
2. Save

**Test each:**
- Country `DE` → should match ✓
- Country `AT` → should match ✓
- Country `CH` → should match ✓
- Country `FR` → should NOT match ✗

---

### Test 10: Create new smartlink from scratch

**Steps:**
1. Change Link ID field to: `my_test_link`
2. Go to Editor tab
3. Should show error: "Smartlink not found"
4. Fill in required fields:
   - Purpose: "My test smartlink"
   - Status: `active`
   - Fallback Target: `https://example.com/fallback`
5. Click "Save Changes"

**Expected:**
- Success message appears
- New smartlink is created in KV

**Verify:**
```bash
curl http://localhost:8787/api/smartlinks/my_test_link
```

Should return your new smartlink.

---

## Testing Checklist

Copy this checklist when testing:

### Core Library
- [ ] All unit tests pass (`npm test`)

### Worker API
- [ ] GET `/api/smartlinks/:linkId` returns correct JSON
- [ ] PUT `/api/smartlinks/:linkId` saves changes
- [ ] PUT validates `link_id` matches URL param
- [ ] GET `/s/:linkId` returns 302 redirect
- [ ] GET `/s/:linkId?debug=1` returns JSON
- [ ] Non-existent link returns 404

### SPA Editor
- [ ] Can load existing smartlink
- [ ] Can edit basic fields (purpose, status, fallback)
- [ ] Can toggle context shape checkboxes
- [ ] Can add/edit/delete rules
- [ ] Can reorder rules with up/down buttons
- [ ] Can add/remove conditions
- [ ] Can save changes successfully
- [ ] Shows success/error messages
- [ ] Shows version and timestamp

### SPA Test Panel
- [ ] Can set test context
- [ ] Can run test and see result
- [ ] Shows matched branch and rule index
- [ ] Shows final target URL
- [ ] Can copy public URL
- [ ] Handles errors gracefully

### Rule Evaluation
- [ ] Country matching works (case-insensitive)
- [ ] Device matching works
- [ ] UTM matching works (all params must match)
- [ ] Priority ordering works (lower = higher priority)
- [ ] Fallback works when no rules match
- [ ] Array conditions work (OR within field)
- [ ] AND logic works (all conditions in rule must match)

### Edge Cases
- [ ] Empty UTM doesn't break evaluation
- [ ] Missing fields in context don't break evaluation
- [ ] Invalid JSON returns proper error
- [ ] Archived smartlinks return proper status

## Performance Testing (Optional)

### Load test Worker

```bash
# Install Apache Bench or similar
ab -n 1000 -c 10 http://localhost:8787/s/spring_sale_2026?utm_source=test

# Should handle ~1000+ req/s on local machine
# On Cloudflare edge: 10,000+ req/s globally
```

### KV latency

```bash
# Test GET performance
time curl http://localhost:8787/api/smartlinks/spring_sale_2026

# Should be < 50ms local, < 100ms on edge
```

## Troubleshooting Tests

### Tests fail with "Cannot find module"

```bash
cd packages/core-smartlink
npm install
npm run build
```

### Worker returns 404 for all routes

- Check `wrangler dev` is running
- Check console logs for errors
- Verify routes in `src/index.ts`

### SPA can't load data

- Check Worker is running on port 8787
- Check browser Network tab for failed requests
- Verify proxy config in `vite.config.ts`

### Redirect doesn't work

- Check KV has data for that `link_id`
- Check Worker logs: `npx wrangler tail`
- Verify smartlink status is not `archived`

### Rule doesn't match expected context

- Use `?debug=1` to see evaluation details
- Check rule conditions are correctly formatted
- Verify context normalization (country, device, utm)
- Remember: ALL conditions in a rule must match (AND logic)

## Next Steps

After all tests pass:

1. ✅ Deploy to Cloudflare (see SETUP.md)
2. ✅ Set up monitoring and alerts
3. ✅ Add JSON Schema validation (Ajv)
4. ✅ Implement Queue for analytics events
5. ✅ Add authentication for admin panel
6. ✅ Create more example smartlinks
7. ✅ Build analytics dashboard

---

**Need help?** Check [SETUP.md](./SETUP.md) or [SMARTLINK_SPEC.md](./docs/SMARTLINK_SPEC.md)

