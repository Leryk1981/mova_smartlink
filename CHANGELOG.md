# Changelog

All notable changes to MOVA Smartlink will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-11-28

### Added - UI v2 (TASK_SMARTLINK_UI_V2)

#### Hero/Onboarding Block
- **New Hero component** with onboarding for non-technical users
- Explains Smartlink concept without separate landing page
- 3 key features highlighted (country/device routing, time-limited campaigns, A/B testing)
- CTA button for create/save actions
- Fully responsive design (mobile, tablet, desktop)
- Modern gradient design with smooth animations

#### Restructured Rule Editor
- **5 logical blocks** for better UX:
  1. **Basic Info** (📋): Rule name and enabled toggle
  2. **Conditions** (🎯): When rules trigger (country, lang, device, UTM)
  3. **Target** (🔗): Destination URL
  4. **Time Schedule** (⏰): start_at / end_at datetime pickers
  5. **Priority & Traffic** (⚡): priority and weight fields

#### UI for v2 Fields
- **Enabled toggle**: Checkbox to pause rules without deleting
- **Time pickers**: `datetime-local` inputs for `start_at` and `end_at`
- **Priority input**: Numeric field with "lower = higher" explanation
- **Weight input**: Numeric field with A/B testing explanation

#### Help Texts & Tooltips
- Comprehensive help text for every field
- Inline tooltips explaining format and usage
- Example values in placeholders
- Hint blocks with use case scenarios
- Visual icons for each block type

#### Validation & UX
- Date validation: `end_at` must be after `start_at`
- Error highlighting for invalid dates
- Non-negative validation for `priority` and `weight`
- Optional field badges
- Color-coded blocks for visual separation
- Responsive grid layout (2-column on desktop, 1-column on mobile)

#### Improved Styling
- Color-coded blocks:
  - Conditions: Blue (#e3f2fd)
  - Target: Green (#e8f5e9)
  - Time: Orange (#fff3e0)
  - Traffic: Purple (#f3e5f5)
- Enhanced hover effects
- Better visual hierarchy
- Touch-friendly buttons (28-32px minimum)
- Smooth transitions and animations

### Changed
- **App.tsx**: Integrated Hero component in editor tab
- **SmartlinkEditor.tsx**: Added `triggerSave` prop for external save trigger
- **RulesEditor.tsx**: Complete rewrite with block-based structure
- **RulesEditor.css**: New block-based styling with responsive design

### Documentation
- `docs/SMARTLINK_UI_V2.md` - Comprehensive UI documentation
- `docs/TASK_SMARTLINK_UI_V2_REPORT.md` - Implementation report with testing checklist

### Backward Compatibility
- ✅ Old v1 configurations load without errors
- ✅ New fields show sensible defaults (`enabled: true`, empty dates)
- ✅ Saving old configs doesn't add unused v2 fields
- ✅ All existing functionality preserved

### Testing
- ✅ TypeScript compilation successful
- ✅ SPA builds without errors
- ✅ Manual testing checklist completed (20+ scenarios)
- ✅ Responsive design verified on mobile/tablet/desktop

---

## [2.0.0] - 2025-11-27

### Added - Smartlink Rules v2

#### Rule Lifecycle Management
- **`enabled` field**: Pause/resume rules without deleting them (`enabled: false`)
- **`start_at` field**: ISO 8601 timestamp for automatic rule activation
- **`end_at` field**: ISO 8601 timestamp for automatic rule deactivation
- Time-based rule filtering in `evaluate()` function

#### A/B Testing & Traffic Distribution
- **`weight` field**: Numeric weight for weighted random selection
- Weighted random algorithm for selecting between multiple matching rules
- Support for gradual rollouts (e.g., `weight: 1` vs `weight: 99` for 1% test traffic)
- `weight: 0` to exclude rules from A/B selection without disabling them

#### Priority Enhancements
- Default priority value `1000` for rules without explicit `priority`
- Consistent priority-based sorting across all evaluation paths
- Priority + weight combination support (priority sorts first, weight distributes within priority group)

#### Context Enhancements
- **`now` field** added to `SmartlinkContext` (ISO 8601 timestamp)
- Worker automatically includes `now` in every request context
- Support for custom `now` in tests for deterministic time-based testing

#### Examples & Documentation
- New example configuration: `examples/ecommerce/smartlink_rules.black_friday_2025.json`
- Comprehensive v2 documentation: `docs/SMARTLINK_V2_FEATURES.md`
- 8 new unit tests covering all v2 features (18 total tests)

### Changed
- **JSON Schema**: Updated `schemas/ds.smartlink_rules_v1.schema.json` with new optional fields
- **Core Types**: Enhanced `SmartlinkRule` and `SmartlinkContext` interfaces
- **Evaluation Logic**: Complete rewrite of `evaluate()` with multi-stage filtering and selection
- **Worker Context**: `normalizeContext()` now includes `now` timestamp

### Technical Details
- All changes are backward compatible - v1 configurations work without modifications
- No breaking changes to API endpoints or HTTP interfaces
- New fields are optional with sensible defaults
- Performance impact: negligible (O(1) time checks, O(n) weight selection)

### Testing
- ✅ All 18 unit tests passing
- ✅ CI pipeline (build + lint + test) passing
- ✅ Backward compatibility verified with existing examples

---

## [1.0.0] - 2025-11-25

### Added - Initial Release

#### Core Library (`@mova/core-smartlink`)
- Pure TypeScript evaluation engine
- Rule-based routing with AND-logic conditions
- Support for country, language, device, UTM parameters
- Priority-based rule sorting
- Case-insensitive matching
- Comprehensive test suite (10 tests)

#### Cloudflare Worker (`@mova/worker-smartlink`)
- Edge routing on Cloudflare Workers
- KV storage for Smartlink configurations
- Public routes: `/s/:linkId` (redirect), `/s/:linkId?debug=1` (debug)
- Admin API: CRUD operations for managing rules
- Context normalization (CF country, Accept-Language, User-Agent)
- UTM parameter extraction

#### Admin SPA (`@mova/spa-admin`)
- React-based rule editor
- Visual JSON editor with syntax highlighting
- Test panel for validating rules against contexts
- API integration with Worker
- Modern, responsive UI

#### MOVA Artifacts
- JSON Schema: `ds.smartlink_rules_v1.schema.json`
- Example configurations in `examples/ecommerce/`
- Global catalog entry
- Meta-model definitions

#### Infrastructure
- Monorepo structure with npm workspaces
- TypeScript across all packages
- Vite for SPA development
- Wrangler for Worker deployment
- GitHub Actions CI/CD workflows
- Comprehensive documentation

#### Documentation
- `README.md` - Project overview
- `SETUP.md` - Development setup guide
- `COMMANDS.md` - Command reference
- `docs/SMARTLINK_SPEC.md` - Technical specification
- `docs/TASKS_SMARTLINK_V1.md` - Implementation tasks
- `docs/AI_RULES_SMARTLINK.md` - AI development guidelines

### Repository Structure
```
mova_smartlink/
├── packages/
│   ├── core-smartlink/     # Pure TS evaluation
│   ├── worker-smartlink/   # Cloudflare Worker
│   └── spa-admin/          # React admin UI
├── schemas/                # JSON schemas
├── examples/               # Sample configurations
├── docs/                   # Documentation
└── .github/workflows/      # CI/CD
```

---

## Legend

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes

---

**GitHub Repository**: https://github.com/Leryk1981/mova_smartlink

