# MOVA Core 3.6.0 Contract

Status: CORE / Frozen for 3.6.x  
Applies to: MOVA 3.6.0 and all compatible 3.6.x releases  
Author: Sergii-Miasoiedov (MOVA)  

> UA: Це формальний «хребет» для MOVA 3.6.x. Те, що тут описано, ми вважаємо стабільним контрактом ядра. Усе інше (домени, інструменти, шаблони) має підлаштовуватись під нього, а не навпаки.

---

## 1. Purpose and scope

This document defines the **stable core contract** for the MOVA 3.6.x line:

- which artifacts belong to the **MOVA Core**;
- which parts of their structure and semantics are **frozen** for 3.6.x;
- which kinds of changes are allowed within 3.6.x;
- what kind of changes require a new major version (4.0+).

The contract is intentionally **narrow**: it covers only the parts that must remain stable so that domains (social, e-commerce, logistics) and tools (Workbench, PWA, CLI, runtimes) can evolve independently **without semantic drift**.

> UA: Тут ми фіксуємо саме те, що «не можна ламати» в 3.6.x. Все інше — підлягає еволюції.

---

## 2. Core artifacts covered by this contract

The MOVA 3.6.0 core consists of the following artifacts:

1. **Identifier namespaces**
   - `env:` — envelopes (workflows, scenarios).
   - `ds:` — data schemas (JSON Schema definitions of data).
   - `role:` — actor roles.
   - `res:` — resources.
   - `st:` — business and technical states.

2. **Meta-Model 3.6.0**
   - Schema: `meta-model.3.6.0.schema.json`.
   - Instance: `meta-model.3.6.0.json`.

3. **Global Catalog Core 3.6.0**
   - Schema: `global.3.6.0.schema.json`.
   - Instance: `global.core.3.6.0.json`.

4. **Core Verbs Registry 3.6.0**
   - Registry: `verbs.core.3.6.0.json`.

5. **Envelope Core 3.6.0**
   - Schema: `envelope.3.6.0.schema.json`.

All other artifacts (domain-specific globals, domain schemas, template sets, tools, runtimes) are **clients** of this core and must treat it as an external, stable contract.

> UA: Meta-Model, Global, Verbs, Envelope — це чотири опорні блоки. Всі «social/smartlink/logistics» та Workbench — лише клієнти цих блоків.

---

## 3. Identifier namespaces

### 3.1 Fixed prefixes

The following identifier prefixes are **reserved and frozen** for 3.6.x:

- `env:` — envelopes  
- `ds:` — data schemas  
- `role:` — roles  
- `res:` — resources  
- `st:` — states  

**Contract guarantees:**

- Prefix names **will not change** in 3.6.x.
- The meaning of each prefix **will not be repurposed**.
- All core schemas and tools MUST treat ids without a known prefix as **suspicious** or **out of core**.

> UA: Будь-яке `id` без префікса — кандидат у помилку. Нові префікси можливі тільки в 4.0 або як чітко окрема зона (наприклад, в extensions).

---

## 4. Meta-Model 3.6.0

The meta-model defines **which artifact kinds exist** and how they relate to identifier prefixes.

- Schema: `meta-model.3.6.0.schema.json`
- Instance: `meta-model.3.6.0.json`

Core artifact kinds:

- `data_schema`
- `envelope`
- `global_catalog`
- `instance`
- `template_set`

**Contract guarantees:**

- This set of artifact kinds is **fixed for 3.6.x**.  
  New artifact kinds require a new major line (4.x) or an explicitly versioned extension to the meta-model.
- The mapping between artifact kinds and prefixes (e.g., `envelope` → `env:`, `data_schema` → `ds:`) **will not change** in 3.6.x.
- Tools that use the meta-model as their source of truth can rely on:
  - the presence of these artifact kinds;
  - the presence of core prefixes;
  - the basic relationships (e.g., envelopes may reference `ds`, `role`, `res`, `st`).

> UA: Meta-Model — це «словник про словник». Ми не додаємо сюди нові базові сутності в рамках 3.6.x, лише можемо розширювати опис існуючих (наприклад, новими полями в extensions).

---

## 5. Global Catalog Core 3.6.0

### 5.1 Schema contract

- Schema: `global.3.6.0.schema.json`.
- Top-level properties (besides `@context`) are:
  - `mova_version`
  - `roles[]`
  - `resources[]`
  - `dataSchemas[]`
  - `states[]`
  - `extensions`

**Contract guarantees:**

- These top-level properties will **not be renamed or removed** in 3.6.x.
- `@context` is **optional** and will remain optional in 3.6.x.
- `additionalProperties: false` at the top level will be preserved.
- Internal shapes of `role`, `resource`, `dataSchemaRef`, `state` MAY be extended by:
  - adding new **optional** fields;
  - extending `meta` and `extensions` objects.
- Required fields for these definitions **will not be removed or renamed**.

> UA: Global 3.6.0 – це стабільна форма. В 3.6.x можна додавати нові необов’язкові поля, але не ламати існуючу структуру та обов’язкові поля.

### 5.2 Core global instance

- Instance: `global.core.3.6.0.json`.

Core roles (ids and semantics are frozen):

- `role:system` — MOVA runtime and infrastructure.
- `role:template_author` — authors of schemas and envelopes.
- `role:operator` — operations and monitoring.
- `role:end_user` — final human users.
- `role:service_integration` — technical services acting as actors.

Core resources (ids and semantics are frozen):

- `res:runtime_default` — abstract execution environment.
- `res:queue_default` — abstract queue.
- `res:storage_default` — abstract storage bucket.
- `res:http_outbound_default` — abstract outbound HTTP capability.

Core states (ids and semantics are frozen):

- `st:draft`
- `st:pending`
- `st:active`
- `st:completed`
- `st:failed`
- `st:cancelled`

Core data schema registrations:

- `ds:envelope_core_v3_6_0` → `envelope.3.6.0.schema.json`
- `ds:global_core_v3_6_0` → `global.3.6.0.schema.json`
- `ds:meta_model_v1_0_0` → `meta-model.3.6.0.schema.json`

**Contract guarantees:**

- The **meaning** of these core `role:`, `res:`, `st:` ids will not change in 3.6.x.
- These ids will **not be reused** to mean something different.
- Domain-level globals (social, e-commerce, logistics, etc.) must **extend** this catalog, not override core ids.

> UA: Якщо в доменному global пакеті потрібно додати свій `role:case_worker`, це ок. Але `role:end_user` не можна раптом перетворити на «бот у Telegram».

---

## 6. Core Verbs Registry 3.6.0

- Registry: `verbs.core.3.6.0.json`.

Core verbs (names and high-level semantics are frozen):

- `http_fetch`
- `call`
- `if`
- `switch`
- `parallel`
- `race`
- `template`
- `transform`
- `assert`
- `emit_event`
- `log`
- `sleep`
- `call_envelope`
- `plugin:*` namespace (wildcard for extension verbs)

Each verb entry includes:

- `name`
- `kind` (`action`, `control`, `utility`, `extension`)
- `category` (namespaced string)
- `stability` (for 3.6.x core verbs: `stable`)
- `summary`, `description`, `notes`
- `with_contract`:
  - `required[]` field names
  - `fields{}` descriptions
  - `schema_source` pointer into `envelope.3.6.0.schema.json`

**Contract guarantees:**

- Verb names listed above will not be removed or renamed in 3.6.x.
- Their high-level semantics (what they intuitively do) are stable.
- Within 3.6.x it is allowed to:
  - add **new optional fields** to `with` schemas;
  - relax constraints in a backward-compatible way;
  - add **new verbs** (with new names) to the registry.
- Removing required `with` fields or changing their meaning in a breaking way requires a new major line (4.0+).

> UA: Важливо: в 3.6.x `http_fetch` не стане «локальним файловим читанням». Ми можемо додати йому, наприклад, новий необов’язковий параметр `retry_policy`, але не міняємо те, що він робить по суті.

---

## 7. Envelope Core 3.6.0

- Schema: `envelope.3.6.0.schema.json`.

At the top level an envelope contains, at minimum:

- `mova_version`
- `envelope_id` (id, typically `env:*`)
- `category`
- `title`
- `summary`
- `plan`:
  - `steps[]` — ordered steps
- optional `context`
- optional `extensions`

Each step contains, at minimum:

- `id` — unique within the envelope
- `verb` — name from the verbs registry or `plugin:*`
- optional `with` — parameters whose structure depends on `verb`
- optional references to globals:
  - `actorRoleId` (`role:*`)
  - `resourceId` (`res:*`)
  - `inputDataSchemaId`, `outputDataSchemaId` (`ds:*`)
  - `stateFrom`, `stateTo` (`st:*`)

**Contract guarantees:**

- The presence and purpose of top-level fields will not change in 3.6.x.
- The basic step structure (id, verb, with, references to globals) will not be broken or repurposed.
- Control-flow and action verbs from the core registry will remain compatible with the envelope schema.
- Within 3.6.x it is allowed to:
  - add new optional fields to envelopes and steps (typically under `extensions` or `meta`);
  - add new verbs with their own `with` contracts.

> UA: Envelope — це «рецепт». Структура рецепта в 3.6.x не змінюється. Ми можемо додати приправу, але не забрати «список кроків» або змінити сенс `verb`.

---

## 8. JSON-LD semantics

JSON-LD support in MOVA 3.6.x is **optional and non-invasive**:

- `@context` is allowed on the **global catalog** top level.
- The core contract does **not** require any runtime or tool to understand JSON-LD in order to execute envelopes.
- JSON-LD contexts for MOVA core (e.g., `https://mova.org/context/global.core.3.6.0.jsonld`, `https://mova.org/context/verbs.core.3.6.0.jsonld`) can evolve **independently** as long as:
  - they do not contradict the JSON structure defined in the core schemas;
  - they preserve the mapping of core ids (`role:system`, `res:runtime_default`, `st:draft`, etc.).

**Contract guarantees:**

- No 3.6.x release will make JSON-LD mandatory for basic execution.
- JSON-LD is a **semantic enhancement layer**, not a dependency for the core runtime semantics.

> UA: Global може мати `@context`, але 3.6.x не змушує нікого вміти JSON-LD. Це «надбудова для семантики», а не обов’язковий компонент виконання.

---

## 9. Allowed vs. forbidden changes in 3.6.x

### 9.1 Allowed (non-breaking) within 3.6.x

The following changes are explicitly allowed within the 3.6.x line:

- Adding **new verbs** to `verbs.core.3.6.0.json` with new names.
- Adding **new optional properties** to:
  - global catalog entries (`role`, `resource`, `dataSchemaRef`, `state`);
  - envelope top-level and step-level objects (preferably under `extensions`/`meta`).
- Adding new domain-specific globals:
  - new `role:*`, `res:*`, `st:*` ids that do not conflict with core ids.
- Adding new `ds:*` schemas and template sets.
- Extending JSON-LD contexts with additional terms and mappings as long as they remain compatible with the core JSON structure.

### 9.2 Forbidden (would require 4.0+)

The following changes are considered **breaking** and require a new major version:

- Renaming or repurposing any of the five core identifier prefixes (`env`, `ds`, `role`, `res`, `st`).
- Removing or renaming any core artifact kind in the meta-model.
- Changing the high-level semantics of any core verb (`http_fetch`, `call`, `if`, etc.).
- Removing or renaming core verbs without clear deprecation and a new major line.
- Changing the meaning of core roles/resources/states defined in `global.core.3.6.0.json`.
- Removing or renaming required properties in the core schemas (`meta-model`, `global`, `envelope`).
- Making JSON-LD required for core runtime behavior.

> UA: Якщо хочеться радикально змінити структуру envelope або переосмислити `res:runtime_default`, це вже не 3.6.1, а нова лінійка 4.0.

---

## 10. Responsibilities of domains and tools

### 10.1 Domain packs (social, e-commerce, logistics)

Domain template sets MUST:

- treat MOVA Core 3.6.0 as an external contract;
- extend `global.core.3.6.0.json` with additional `role/res/st` ids instead of redefining core ones;
- define their own `ds:*` and `env:*` artifacts in a way that is structurally compatible with the core schemas;
- avoid introducing incompatible or conflicting meanings for core ids.

### 10.2 Tools and runtimes (Workbench, PWA, CLI, engines)

Tools and runtimes SHOULD:

- validate core artifacts against the corresponding schemas;
- treat unknown prefixes and IDs as **non-core** and handle them conservatively;
- use `meta-model.3.6.0.json`, `global.core.3.6.0.json` and `verbs.core.3.6.0.json` as their **source of truth** for introspection and UX;
- handle future 3.6.x additions (new verbs, new globals) in a forward-compatible way.

> UA: Інструменти не мають «вигадувати свою власну MOVA». Вони мають читати ядро як контракт і підлаштовувати UX/валидацію під нього.

---

## 11. Summary

MOVA Core 3.6.0 establishes a **stable semantic spine**:

- artifact kinds and identifier prefixes are fixed;
- the global catalog shape and core entries are fixed;
- the core verbs and their high-level behavior are fixed;
- the envelope structure and its relation to globals and verbs are fixed;
- JSON-LD має окремий, добровільний коридор.

Within this spine, domains and tools are free to grow and evolve.  
Breaking it requires a new major line, not an incremental 3.6.x patch.

> UA: Підсумок простий: 3.6.0 — це точка, від якої ми можемо сміливо будувати все інше, не боячись, що завтра доведеться міняти фундамент.
