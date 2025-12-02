# MOVA 4.0.0 — Migration from 3.6.x (Draft)

This document outlines how to conceptually migrate from the MOVA 3.6.x
family to MOVA 4.0.0.

> _Мета:_ зберегти все цінне з 3.6 (дані, конверти, глобальний словник),
> але прибрати з ядра все, що схоже на рантайм або UX‑DSL.

---

## 1. What stays

The following concepts from 3.6.x remain valid and are considered part
of MOVA 4.0.0:

- **Data schemas (`ds.*`)**  
  Domain‑level JSON Schemas describing profiles, configs, documents,
  episodes, etc.

- **Global dictionary**  
  Canonical:
  - verbs,
  - resource names (profile, package, config, ticket, message, …),
  - role names (user, system, executor, reviewer, …).

- **Envelopes (`env.*`)**  
  Envelopes as structured actions/events remain, but their role is now
  strictly **declarative** (no implied execution semantics).

- **Pattern memory idea**  
  Episodes as structured records of important steps of work are kept and
  aligned with MOVA 4.0.0 episode schemas.

---

## 2. What moves to periphery

The following items are no longer part of the **core language** in 4.0.0
and should be treated as peripheral frameworks or applications:

- Scenario DSLs that tried to encode control‑flow or orchestration
  directly inside MOVA artefacts.
- UX‑specific constructs (e.g. “one question per step” flows) in core
  schemas.
- Any “runner”, “engine” or “executor” logic described as part of MOVA
  itself.

These ideas may continue to live as separate projects:

- Workbench features,
- template marketplaces,
- orchestrators,
- UX guides,

but they are **not** part of the MOVA 4.0.0 core spec.

---

## 3. Migration strategy

### 3.1 Stabilise data schemas

1. Identify all `ds.*` schemas already in use (social, Smartlink,
   logistics, etc.).
2. For each schema:
   - assign a stable `$id` and version suffix (`*_v1`);
   - ensure JSON Schema 2020‑12 compliance;
   - move UX‑only hints/comments out to separate metadata if needed.

Result: a clean catalogue of MOVA 4.0.0 data types.

---

### 3.2 Re‑frame envelopes as declarative acts

1. List existing `env.*` envelopes.
2. For each envelope:
   - bind it explicitly to a canonical verb from Global;
   - clearly separate:
     - **who** initiates (role),
     - **who** executes (executor role),
     - **which data types** are inputs/outputs;
   - remove any implicit “runner” semantics (loops, branching, timeouts)
     from envelope definitions.

Result: envelopes become **pure contracts** between actors and executors.

---

### 3.3 Introduce MOVA filters at red boundaries

For each domain (e.g. Social Pack, Smartlink, Logistics):

1. Identify **red boundaries** where MOVA validation is mandatory:
   - writing to registries,
   - producing document packages,
   - recording long‑term episodes,
   - changing state of obligations (contracts, policies, subscriptions).
2. Implement validation at these points using MOVA schemas:
   - reject or quarantine any non‑conforming artefacts;
   - treat conforming artefacts as “official reality”.

Internal flows remain free to use ad‑hoc formats as needed.

---

### 3.4 Executors as first‑class citizens

Explicitly document executors for each important envelope family, e.g.:

- “`env.smartlink_route_decision_v1` is implemented by
   `cf_worker_smartlink_edge_v1`.”
- “`env.personal_profile_store_v1` is implemented by a Workbench command
   plus a storage adapter.”

MOVA 4.0.0 does not try to unify these executors — it only standardises
their **contracts**.

---

## 4. Deprecation notes

- Any 3.6.x artefact that mixes data description with control‑flow MAY be
  kept for reference but SHOULD NOT be extended further.
- New work SHOULD target MOVA 4.0.0 directly:
  - clean `ds.*` schemas;
  - declarative `env.*` envelopes bound to canonical verbs;
  - clear separation between MOVA (L2) and executors (L1).

Once key domains (e.g. Social Pack, Smartlink) are migrated, the 3.6.x
documents can be archived as historical background.
