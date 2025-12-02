# MOVA 4.0.0 — Core Specification (Draft)

> Canonical language: **English**.  
> Comments and examples MAY be bilingual (English + Ukrainian) for authoring convenience.

## 1. Scope

MOVA 4.0.0 defines a **data‑first contract language** for AI‑era systems.  
MOVA **does not execute** anything. It specifies:

- which **data structures** exist in a given MOVA universe;
- which **operations (verbs)** are allowed over these data;
- which **envelopes** encode concrete actions and events;
- how **episodes** of work are captured as structured records.

Execution (agents, workers, tools, UX) is always external to MOVA.

---

## 2. Core principles

1. **MOVA never executes**  
   MOVA contains no imperative code, control‑flow or runtime. It only defines
   data, allowed operations and validation rules.

2. **Everything is data**  
   All meaningful artefacts (profiles, configs, decisions, episodes, etc.)
   are expressed as typed JSON documents that conform to MOVA data schemas
   (`ds.*`).

3. **Verbs are declarative operators**  
   MOVA defines a small, canonical set of verbs (e.g. `create`, `update`,
   `validate`, `route`, `record`, `aggregate`, `explain`). Verbs describe
   *what kind of operation* is being performed over data, not *how* it is
   implemented.

4. **Envelopes are speech‑acts (sentences)**  
   Each envelope (`env.*`) represents one concrete action or event:
   - which verb is used;
   - over which data types;
   - by/for which roles.

   Envelopes are the interface boundary between MOVA and executors.

5. **MOVA as contract + filter, not orchestrator**  
   MOVA is not required to cover an entire scenario end‑to‑end.
   Instead, MOVA stands at **red boundaries** of a system — points where
   data cross from “internal processing” into “external reality”
   (registries, documents, obligations, long‑term memory).
   Only 100% valid MOVA artefacts may cross these boundaries.

6. **Episodes as unit of experience**  
   Systems MAY capture important steps of work as **episodes**
   (pattern‑memory records). Episodes are typed data (`ds.pattern_memory_*`)
   describing:
   - input context;
   - actions performed (envelopes);
   - resulting data;
   - quality / outcome signals.

   This enables long‑term analysis and evolution without coupling to any
   particular agent stack or model.

---

## 3. Core primitives

### 3.1 Data schemas (`ds.*`)

A **data schema** (`ds.*`) defines the structure and invariants of one
domain data type. Technically this is a JSON Schema 2020‑12 document with:

- stable `$id` and `title`;
- explicit `type`, `properties`, `required` and `additionalProperties`;
- optional semantic metadata (descriptions, enums, formats, examples).

Examples of MOVA data types:

- `ds.smartlink_config_v1`
- `ds.smartlink_route_decision_v1`
- `ds.personal_profile_v1_de`
- `ds.pattern_memory_episode_smartlink_v1`

MOVA 4.0.0 **standardises the way these data types are named, versioned and
validated**, but does not prescribe any particular business domain.

---

### 3.2 Verbs

A **verb** is a canonical operation over data. MOVA 4.0.0 defines a finite
verb set (examples, non‑exhaustive):

- `create` — introduce a new data record;
- `update` — change an existing record;
- `delete` — remove or deactivate a record;
- `get` / `list` / `search` — read access;
- `validate` — check data against rules;
- `route` — choose among targets based on data and context;
- `record` — append an episode/observation to memory;
- `aggregate` — compute summaries / metrics;
- `explain` — produce a structured explanation.

Verbs live in the **Global** dictionary and are reused across domains.

> _Коментар українською:_ дієслова в MOVA — це не функції і не методи,
> а саме «типи дій», якими потім користуються конверти.

---

### 3.3 Envelopes (`env.*`)

An **envelope** is a concrete speech‑act: “someone does something with some
data for some purpose”.

Minimal envelope structure:

- `envelope_id` — stable identifier (e.g. `env.smartlink_route_decision_v1`);
- `verb` — one of the canonical verbs (`route`, `validate`, `record`, …);
- `roles` — who initiates, who receives, who executes (when applicable);
- `data` — references to one or more `ds.*` schemas (input, output, context);
- `meta` — correlation ids, timestamps, trace info, etc.

Technically, envelope definitions are also JSON Schemas that **bind**:

- verbs → data types → roles → expected structure of a single act.

Executors (agents, workers) read these envelopes and implement the actual
behaviour.

---

### 3.4 Episodes

An **episode** is a structured record of one important step of work.
Example fields:

- `episode_id` — unique id;
- `envelope_id` — which envelope/action was performed;
- `input` — data before the action;
- `output` — data after the action;
- `context` — model, tools, config hashes, environment;
- `signals` — quality metrics, human feedback, business outcome.

Episodes are expressed as `ds.pattern_memory_episode_*` schemas and may be
aggregated into higher‑level analytics.

---

## 4. Validation and filtering

MOVA 4.0.0 assumes JSON Schema 2020‑12 validation for all `ds.*` and `env.*`
documents.

Typical usage:

- **Input filter** — only data matching `ds.*` is allowed to enter a
  critical process (e.g. Smartlink config, social profile, contract draft).
- **Output filter** — only data matching `ds.*`/`env.*` is allowed to be
  persisted to registries, sent to authorities, or recorded as episodes.

If validation fails, executors MUST treat the artefact as:
- a draft,
- an error,
- or a non‑committed attempt.

MOVA itself does not define recovery logic — this is the executor’s job.

---

## 5. Versioning

- MOVA core version is `4.0.0` (this document).  
- Individual schemas and envelopes use semantic suffixes:
  - `*_v1`, `*_v2` for breaking changes;
  - patch changes SHOULD be backwards compatible or handled at executor
    level.

Migration guidelines from 3.6.x are provided in
`mova_4.0.0_migration_from_3.6.md`.
