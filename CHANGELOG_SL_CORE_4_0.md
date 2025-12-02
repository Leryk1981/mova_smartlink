# Changelog — Task SL-CORE-4.0

## [2.0.0] - 2025-12-02

### Added — MOVA 4.0.0 Migration

#### Data Schemas (ds.*)
- `ds.smartlink_config_v1.schema.json` — SmartLink configuration with targets, conditions, and metadata
- `ds.smartlink_click_context_v1.schema.json` — Normalized click context (country, device, UTM, etc.)
- `ds.smartlink_resolution_result_v1.schema.json` — Routing decision result with outcome and metrics
- `ds.smartlink_stats_query_v1.schema.json` — Statistics query parameters with filtering and grouping
- `ds.smartlink_stats_report_v1.schema.json` — Statistics report with summary and detailed rows

#### Envelopes (env.*)
- `env.smartlink_resolve_v1.schema.json` — Speech-act for click resolution (verb: route)
- `env.smartlink_stats_get_v1.schema.json` — Speech-act for statistics retrieval (verb: get)

#### Genetic Layer
- `ds.episode_smartlink_resolution_v1.schema.json` — Episode recording with metrics, quality signals, and analysis

#### Examples
- `smartlink_config.spring_sale_2026.json` — Real-world Spring 2026 campaign configuration
- `click_context.example.json` — TikTok mobile click from Germany
- `resolution_result.example.json` — Successful resolution result
- `env.smartlink_resolve.example.json` — Complete envelope with request/response
- `episode.smartlink_resolution.example.json` — Complete episode with metrics and analysis
- `stats_query.example.json` — Statistics query for March 2026
- `stats_report.example.json` — Statistics report with aggregated data

#### Documentation
- `mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md` — Complete MOVA 4.0 specification (519 lines)
- `mova4-smartlink/README.md` — MOVA 4.0 package overview
- `legacy/README.md` — Legacy archive documentation
- `TASK_SL_CORE_4_0_REPORT.md` — Detailed migration report
- `CHANGELOG_SL_CORE_4_0.md` — This changelog

#### Structure
- `mova4-smartlink/` folder — MOVA 4.0 artifacts (active development)
- `legacy/` folder — MOVA 3.6 artifacts (archived)

### Changed

#### Updated Documentation
- `docs/AI_RULES_SMARTLINK.md` — Completely rewritten for MOVA 4.0 (551 lines)
  - New schema compliance rules
  - Envelope handling guidelines
  - Episode recording instructions
  - Code generation rules
  - Quick reference section
  
- `docs/TASKS_SMARTLINK_V1.md` — Updated with Task SL-CORE-4.0 (183 lines)
  - Complete deliverables list
  - Migration details
  - Next implementation steps
  
- `README.md` — Rewritten for MOVA 4.0 architecture (330 lines)
  - Updated architecture overview
  - New structure description
  - MOVA 4.0 artifacts section
  - Migration history

### Deprecated

#### Legacy MOVA 3.6 Artifacts (Archived in legacy/)
- `schemas/ds.smartlink_rules_v1.schema.json` — Replaced by ds.smartlink_config_v1
- `schemas/env.smartlink_default_v1.json` — Replaced by env.smartlink_resolve_v1
- `mova-core/` — MOVA 3.6.0 core specs
- `examples/ecommerce/smartlink_rules.spring_sale_2026.json` — Migrated to new format

**Note:** Legacy artifacts remain available in `legacy/` folder but should not be used for new development.

### Breaking Changes

This is a major version upgrade with breaking changes to the data model:

#### Schema Changes
1. **Configuration Schema**
   - Old: `ds.smartlink_rules_v1` with embedded rules array
   - New: `ds.smartlink_config_v1` with structured targets array
   - Migration required for existing configurations

2. **Envelope Structure**
   - Old: `env.smartlink_default_v1` with implied execution
   - New: `env.smartlink_resolve_v1` with declarative speech-act structure
   - Executors need to be updated to new envelope format

3. **Data Flow**
   - Old: Monolithic data flow
   - New: Separate schemas for input (click_context), output (resolution_result), config
   - Clear separation of concerns

#### Architecture Changes
1. **MOVA Layer**
   - Pure data and contracts (no execution logic)
   - Declarative envelopes (speech-acts)
   - Clear red boundaries for validation

2. **Genetic Layer**
   - New: Episode recording for pattern memory
   - Enables long-term learning and analysis

3. **Documentation**
   - MOVA 3.6 docs archived
   - New MOVA 4.0 specification

### Migration Path

For existing SmartLink deployments:

1. **Data Migration**
   - Convert `ds.smartlink_rules_v1` to `ds.smartlink_config_v1`
   - Map `rules[]` to `targets[]` with conditions
   - Extract `fallback_target` to `default_target_id`

2. **Executor Updates**
   - Update worker to use new schemas
   - Implement episode recording
   - Add validation at red boundaries

3. **Admin SPA Updates**
   - Update UI for new config structure
   - Add new fields (priority, time constraints)
   - Implement statistics viewer

See `mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md` Section 5 for detailed migration guide.

## Statistics

### Files Created: 18
- 8 schema files
- 7 example files
- 3 README files

### Files Updated: 3
- AI_RULES_SMARTLINK.md
- TASKS_SMARTLINK_V1.md
- README.md

### Total Lines: ~3,080
- Schemas: ~1,000 lines
- Examples: ~380 lines
- Documentation: ~1,700 lines

### Test Coverage
- All schemas follow JSON Schema 2020-12
- All examples validate against schemas
- Comprehensive real-world use cases

## Definition of Done ✅

- [x] All required schemas created (ds.* config, context, result, stats)
- [x] All required envelopes created (env.* resolve, stats_get)
- [x] Episode schema created (genetic layer)
- [x] Examples provided for all schemas
- [x] Examples validate successfully
- [x] Documentation updated (SPEC, AI_RULES, TASKS, README)
- [x] Legacy artifacts archived
- [x] Structure organized (mova4-smartlink/, legacy/)
- [x] MOVA 4.0 style compliance verified
- [x] No execution logic in MOVA layer

## References

### Task Information
- **Task ID:** SL-CORE-4.0
- **Status:** ✅ COMPLETED
- **Date:** 2025-12-02
- **Version:** MOVA 4.0.0

### Documentation
- Specification: `mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md`
- Report: `TASK_SL_CORE_4_0_REPORT.md`
- Tasks: `docs/TASKS_SMARTLINK_V1.md`

### MOVA Core References
- `mova_4_0_0_spec/docs/mova_4.0.0_core.md`
- `mova_4_0_0_spec/docs/mova_4.0.0_layers.md`
- `mova_4_0_0_spec/docs/mova_4.0.0_migration_from_3.6.md`

---

**Semantic Versioning Note:**  
This release uses MAJOR version bump (1.x → 2.0.0) due to breaking changes in data schemas and architecture.
