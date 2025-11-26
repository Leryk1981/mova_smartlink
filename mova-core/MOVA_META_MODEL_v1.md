# MOVA Meta-Model v1.0

Status: draft  
Target MOVA core: 3.6.x  
Author: Sergii-Miasoiedov (MOVA)  

> UA: Це «перший поверх» — опис того, які є об’єкти в MOVA (envelope, global, data schema, instance, template set) і як вони пов’язані між собою. Не про конкретні JSON-файли, а про модель у голові.

---

## 1. Purpose & scope

This meta-model defines the **core conceptual building blocks** of MOVA:

- what kinds of artifacts exist (envelopes, global catalogs, data schemas, instances, template sets);
- how they reference each other (id namespaces `env:`, `ds:`, `role:`, `res:`, `st:`);
- how a runtime should see a MOVA workflow at a high level (inputs, steps, schemas, catalogs).

The meta-model sits **above** individual JSON Schemas and envelopes and is designed to be stable for the whole 3.6.x line. Concrete schemas such as:

- the envelope core schema 3.6.0 :contentReference[oaicite:0]{index=0}  
- the global catalogs schema 3.6.0 :contentReference[oaicite:1]{index=1}  

are *implementations* of this meta-model for validation.

> UA: Мета — зафіксувати «словник» і зв’язки. Самі JSON-схеми envelope.3.6.0 і global.3.6.0 — це вже технічна реалізація цієї моделі.

---

## 2. Identifier namespaces

MOVA uses explicit, prefix-based identifiers to avoid ambiguity and to make references machine-friendly.

### 2.1 Core prefixes

- `env:` — **envelope identifiers**  
  Example: `env:personal_profile_to_buergergeld_v1` :contentReference[oaicite:2]{index=2}  

- `ds:` — **data schema identifiers** (JSON Schema)  
  Examples: `ds:personal_profile_v1_de`, `ds:buergergeld_antrag_v1`   

- `role:` — **role identifiers** in the global catalog (who executes a step) :contentReference[oaicite:4]{index=4}  

- `res:` — **resource identifiers** in the global catalog (what a step uses: HTTP endpoint, queue, bucket, document, etc.) :contentReference[oaicite:5]{index=5}  

- `st:` — **state identifiers** in the global catalog (business states for workflows) :contentReference[oaicite:6]{index=6}  

Additionally:

- event names are simple strings (e.g. `routing.decided`, `buergergeld.draft.created`) tied to envelopes via `emit_event` steps   
- categories for envelopes are free-form strings used for routing and permission (e.g. `social`, `logistics_routing`, `data_mapping`).   

> UA: Префікси — це «номенклатура». Будь-який id без префікса — підозрілий. У 3.6.x в ядро заходять тільки ці п’ять: env, ds, role, res, st.

---

## 3. Primary artifact types

### 3.1 Data Schema (JSON Schema, `ds:*`)

A **data schema** is a JSON Schema document that describes the structure and constraints of a data object. It is:

- authored and versioned independently from envelopes;
- registered in the global catalog under `dataSchemas[]` with an id `ds:...` and a `schema_uri` pointing to the JSON Schema file. :contentReference[oaicite:9]{index=9}  

Examples of data schemas:

- `ds:personal_profile_v1_de` — extended personal profile for a person living in Germany   
- `ds:buergergeld_antrag_v1` — internal representation of a Bürgergeld application.   

> UA: Data schema = «форма даних», описана через JSON Schema. Вона не знає нічого про кроки, тільки про структуру.

---

### 3.2 Envelope (`env:*`)

An **envelope** is an executable workflow definition. It:

- has a core set of required properties: `mova_version`, `envelope_id`, `category`, `title`, `summary`, `plan`; :contentReference[oaicite:12]{index=12}  
- may contain an initial `context` object with free-form input data;
- contains a `plan.steps[]` array with ordered steps; each step has:
  - `id` (unique within the envelope),
  - `verb` (built-in or `plugin:...`),
  - optional `with` parameters,
  - optional links to the global catalog:
    - `actorRoleId` (`role:*`),
    - `resourceId` (`res:*`),
    - `inputDataSchemaId`, `outputDataSchemaId` (`ds:*`),
    - `stateFrom`, `stateTo` (`st:*`).   

Envelopes such as:

- `edge-routing-v1` (logistics routing) :contentReference[oaicite:14]{index=14}  
- `env:personal_profile_to_buergergeld_v1` (data mapping from profile to Bürgergeld draft) :contentReference[oaicite:15]{index=15}  

demonstrate how steps reference schemas and implement logic by composing verbs.

> UA: Envelope = сценарій. Містить план кроків, які виконуються по черзі / з розгалуженням. Кожен крок може знати, які дані очікує/повертає (через ds:*).

---

### 3.3 Global Catalog (MOVA Global 3.6.0)

The **global catalog** is a structured registry of reusable building blocks. It is a JSON document conforming to the global schema 3.6.0 and contains four main arrays: :contentReference[oaicite:16]{index=16}  

- `roles[]` — each role has:
  - `id: role:*`,
  - human-readable `name`,
  - optional `description`, `tags[]`.

- `resources[]` — each resource has:
  - `id: res:*`,
  - `name`,
  - optional `kind` (e.g. `http_endpoint`, `queue`),
  - optional `uri`,
  - optional `meta` for configuration.

- `dataSchemas[]` — each entry points to a JSON Schema:
  - `id: ds:*`,
  - `name`,
  - `schema_uri` (local path or URL),
  - optional `description`, `version`, `tags[]`.

- `states[]` — state catalog:
  - `id: st:*`,
  - `name`,
  - optional `group`, `description`, `tags[]`.

> UA: Global — це «довідник»: хто (roles), що (resources), які форми даних (dataSchemas) і які бізнес-статуси (states). Envelope ніколи не тягне JSON Schema напряму — тільки через `ds:*`.

---

### 3.4 Instance (data / event / run)

An **instance** is any concrete JSON document that:

- either conforms to a specific `ds:*` data schema (e.g. a filled personal profile or a Bürgergeld draft);   
- or represents a particular envelope run (input context, step-by-step trace, final result).

Instances live outside the core spec and are organized in project-level folders (e.g. `examples/social/*.json` in the Workbench repo).   

> UA: Instance = «конкретний заповнений JSON». Або заповнена форма, або лог виконання сценарію. Ядро не диктує структуру логів, але дані всередині можуть посилатися на ds:*.

---

### 3.5 Template Set (Schema / Envelope / Instance triple)

A **template set** is a minimal complete package for a domain task, consisting of three layers: :contentReference[oaicite:19]{index=19}  

1. one or more **data schemas** (`ds:*`);
2. one or more **envelopes** (`env:*`) operating on these schemas;
3. a small set of **instances** for demonstration and tests.

Examples:

- **Social / Bürgergeld pack**:  
  - `ds:personal_profile_v1_de`, `ds:buergergeld_antrag_v1`; :contentReference[oaicite:20]{index=20}  
  - `env:personal_profile_v1_de_store_v1`, `env:personal_profile_to_buergergeld_v1`;   
  - several profile and draft examples in `examples/social`.   

- **E-commerce / Smartlink pack**:  
  - Smartlink rule schema and catalog;   
  - `smartlink-default.mova.json` envelope;   
  - example links and catalogs in `examples/ecommerce`. :contentReference[oaicite:25]{index=25}  

> UA: «Правило трійки»: Schema + Envelope + Instance. Якщо немає хоча б одного рівня — це ще не повноцінний шаблон, а заготовка.

---

## 4. Execution model (envelope-centric)

At runtime, MOVA sees a workflow as the combination of:

- one **envelope** (`env:*`);
- one **global catalog** (roles/resources/dataSchemas/states);
- a concrete **input context** (instances and parameters);
- optional external connectors / plugins.

The runtime engine executes `plan.steps[]` in order, applying control-flow verbs (`if`, `switch`, `parallel`, `race`) and action verbs (`http_fetch`, `call`, `transform`, `emit_event`, etc.) as defined in the envelope core schema.   

Each step may:

- read and write from the shared context/state;
- validate input or output against a `ds:*` schema (through `inputDataSchemaId` / `outputDataSchemaId`);
- emit events with structured payloads (which themselves may conform to `ds:*` schemas).

> UA: Двигун не вигадує логіку — він лише виконує кроки, описані в envelope. Уся «магія» — це комбінація verbs + dataSchemas + resources.

---

## 5. Versioning & compatibility

### 5.1 MOVA core version (`mova_version`)

Both envelopes and the global catalog explicitly specify a `mova_version` field constrained to the 3.6.x line.   

- A runtime may refuse to execute envelopes with a mismatched major/minor version.
- Patch versions (3.6.0 → 3.6.1) should be backward-compatible at the meta-model level.

### 5.2 Data schema versions

Data schemas (`ds:*`) carry their *own* versions, independent from `mova_version`. They can be:

- expressed implicitly in the id (e.g. `ds:personal_profile_v1_de`);   
- or explicitly via a `version` field in `dataSchemas[]` entries in the global catalog. :contentReference[oaicite:29]{index=29}  

### 5.3 Template set versions

Template sets can maintain a separate `version` field (e.g. in a local catalog such as `schemas_catalog/index.json` in the Workbench repo).   

> UA: Ідея: ядро (3.6.x) задає «мову і граматику». Кожен ds:* і кожен template set живе за своїм semver, але повинен бути сумісним з конкретною лінійкою MOVA.

---

## 6. Domains & layering

The meta-model is **domain-agnostic**: it does not care whether data is social, e-commerce, or logistics. Domain separation happens at the template-set level and in repository layout, for example:   

- `social` — personal profiles, Bürgergeld, social benefits;
- `ecommerce` — smart links, product catalogs, orders;
- `logistics` — edge routing, shipping rules.

The same core artifacts (envelope, data schema, global catalog, instances) are reused across domains.

> UA: Домени (social / ecommerce / logistics) — це просто папки та теги, а не нові сутності в ядрі. Мета-модель нічого не знає про «Bürgergeld» як про особливий кейс.

---

## 7. JSON-LD semantics (reserved lane)

The meta-model anticipates that **semantic annotations** may be added via JSON-LD:

- Data schemas (`ds:*`) may expose an `@context` and map internal fields to public vocabularies.
- The global catalog may provide a top-level JSON-LD `@context` for roles, resources, states and schemas, built on top of the 3.6.0 model.   

This layer is optional and does not change the structure of envelopes or the execution model. It is reserved for later phases (e.g., DPP / compliance templates, inter-system interoperability).

> UA: Тут лише «заброньоване місце». Сам MOVA 3.6.0 працює без JSON-LD, але ми одразу залишаємо коридор для семантичних контекстів.

---

## 8. Non-goals of the meta-model

The following topics are intentionally **out of scope** for Meta-Model v1.0:

- detailed error model and retry semantics (beyond simple `retry_policy` on steps);   
- concrete connector formats for external vendors (Google, OpenAI, etc.);
- storage and transport details (Cloudflare Workers, queues, KV, D1, etc.);
- sandbox / orchestration wiring in specific tools (e.g., MOVA Workbench, Docker sandbox).   

These aspects are handled by **profiles, runtimes, and tools** that sit on top of this meta-model.

> UA: Цей файл не про Cloudflare, не про Pub/Sub і не про VS Code. Він тільки про «мову» і «алфавіт», яким описуються сценарії.

---

## 9. Summary

In the MOVA meta-model:

- **Data schemas (`ds:*`)** describe the shape of data.  
- **Envelopes (`env:*`)** describe how data is processed over time.  
- **Global catalogs** define shared roles, resources, schemas and states.  
- **Instances** are real-world JSON documents that conform to schemas and/or represent workflow runs.  
- **Template sets** are publishable packages that bundle schema + envelope + instances for a concrete domain task.

Everything else — connectors, runtimes, editors, marketplaces — is built **on top of** this model and must respect its identifier conventions and separation of concerns.

> UA: Якщо коротко: це те, що «ніколи не повинно ламатися». Усе інше може змінюватися, але ці сутності й префікси залишаються опорою.
