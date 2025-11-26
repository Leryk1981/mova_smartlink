# Contributing to Smartlink v1

Thank you for your interest in contributing to MOVA Smartlink!

## Development Setup

See [SETUP.md](./SETUP.md) for complete setup instructions.

Quick start:

```bash
npm install
cd packages/core-smartlink && npm run build
cd ../worker-smartlink && npm run dev  # Terminal 1
cd ../spa-admin && npm run dev          # Terminal 2
```

## Project Structure

```
mova_smartlink/
├── packages/
│   ├── core-smartlink/      # Pure TypeScript library
│   ├── worker-smartlink/    # Cloudflare Worker
│   └── spa-admin/           # React admin UI
├── schemas/                 # MOVA artifacts (ds, env, global, meta)
├── examples/                # Example instances
├── mova-core/              # MOVA 3.6.0 core references (read-only)
└── docs/                   # Specifications and guidelines
```

## Guidelines

### Code Style

- **Language**: All code, comments, and documentation in English
- **TypeScript**: Use strict mode, no `any` types
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: 
  - Variables/functions: `camelCase`
  - Types/Interfaces: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case.ts`

### Architecture Principles

1. **Core library** (`core-smartlink`):
   - Pure business logic
   - No HTTP or Cloudflare dependencies
   - No side effects (pure functions)
   - Fully unit tested

2. **Worker** (`worker-smartlink`):
   - Thin adapter layer
   - Request → Context → Core → Response
   - Keep handlers small and focused
   - Use utils for reusable logic

3. **SPA** (`spa-admin`):
   - Component-based architecture
   - Hooks for API integration
   - Separate styling (CSS modules or separate files)
   - Responsive design

### MOVA Artifacts

**Read the rules**: [docs/AI_RULES_SMARTLINK.md](./docs/AI_RULES_SMARTLINK.md)

Key points:
- **Schemas are source of truth** - not chat logs or comments
- **Don't modify MOVA core files** in `mova-core/` directory
- **Don't invent new prefixes** - use existing: `ds:`, `env:`, `role:`, `res:`
- **Validate changes** against MOVA core schemas

### Making Changes

#### 1. Core Library Changes

```bash
cd packages/core-smartlink

# Make changes to src/
# Add/update tests in src/*.test.ts

npm test        # Run tests
npm run build   # Build library
```

**Checklist:**
- [ ] Added/updated tests
- [ ] All tests pass
- [ ] Types are exported in `src/index.ts`
- [ ] No breaking changes to public API (or documented)

#### 2. Worker Changes

```bash
cd packages/worker-smartlink

# Make changes to src/

npm run dev     # Test locally
npm run lint    # Check types
```

**Checklist:**
- [ ] No hard-coded URLs or config
- [ ] Error handling in place
- [ ] CORS headers for SPA
- [ ] Logs for debugging

#### 3. SPA Changes

```bash
cd packages/spa-admin

# Make changes to src/

npm run dev     # Test in browser
npm run build   # Test production build
```

**Checklist:**
- [ ] Responsive design (mobile + desktop)
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Error states handled
- [ ] Loading states shown

#### 4. Schema Changes

**⚠️ Warning**: Schema changes are breaking changes!

Before modifying schemas:
1. Read [MOVA_CORE_3.6.0_CONTRACT.md](./mova-core/MOVA_CORE_3.6.0_CONTRACT.md)
2. Validate against core schemas
3. Update example instances
4. Update TypeScript types in core library
5. Add migration guide if needed

### Testing

Run all tests before submitting:

```bash
# Core library tests
cd packages/core-smartlink && npm test

# Type checking
cd packages/worker-smartlink && npm run lint
cd packages/spa-admin && npm run lint

# Manual E2E testing
# Follow TESTING.md
```

### Commit Messages

Use conventional commits format:

```
<type>(<scope>): <subject>

[optional body]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance (deps, config, etc.)

**Scopes:**
- `core`: Core library
- `worker`: Worker package
- `spa`: SPA package
- `schemas`: MOVA artifacts
- `docs`: Documentation

**Examples:**

```bash
feat(core): add support for regex patterns in conditions
fix(worker): handle missing cf.country gracefully
docs(setup): add troubleshooting section
refactor(spa): extract RuleEditor into separate components
test(core): add tests for array condition matching
chore(deps): update wrangler to 3.84.1
```

### Pull Request Process

1. **Fork** the repository
2. **Create branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make changes** following guidelines above
4. **Test thoroughly** (see TESTING.md)
5. **Commit** with conventional commits
6. **Push** to your fork
7. **Open PR** with:
   - Clear title (conventional commit format)
   - Description of changes
   - Link to related issues
   - Screenshots (for UI changes)
   - Testing checklist

### Code Review

PRs will be reviewed for:
- ✅ Code quality and style
- ✅ Test coverage
- ✅ Architecture alignment
- ✅ MOVA compliance
- ✅ Documentation updates
- ✅ No breaking changes (or documented)

## Feature Requests

Have an idea? Open an issue with:

1. **Use case**: What problem does it solve?
2. **Proposal**: How should it work?
3. **Alternatives**: What other solutions did you consider?
4. **Impact**: Breaking change? New dependency?

## Bug Reports

Found a bug? Open an issue with:

1. **Description**: What's wrong?
2. **Steps to reproduce**: How to trigger it?
3. **Expected behavior**: What should happen?
4. **Actual behavior**: What actually happens?
5. **Environment**: Node version, OS, browser, etc.
6. **Logs**: Error messages, stack traces

## Questions?

- 📖 Read [SMARTLINK_SPEC.md](./docs/SMARTLINK_SPEC.md) for architecture
- 🚀 Read [SETUP.md](./SETUP.md) for setup help
- 🧪 Read [TESTING.md](./TESTING.md) for testing guide
- 💬 Open a discussion for general questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉

