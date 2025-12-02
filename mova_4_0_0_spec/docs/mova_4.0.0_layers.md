# MOVA 4.0.0 — Layer Model (Draft)

This document describes how MOVA 4.0.0 fits into a broader AI stack.

> _Ідея:_ чітко відділити шар MOVA (дані + дії + епізоди) від
> моделей, агентських стеків, інфраструктури та UX.

---

## 1. Overview

We distinguish four conceptual layers:

1. **Models & tools (L0)** — LLMs, embeddings, search, external APIs,
   databases, queues, etc.
2. **Executors (L1)** — agent frameworks, workers, state machines, scheduled
   jobs that call models and tools to actually do work.
3. **MOVA (L2)** — this specification:
   - data schemas (`ds.*`),
   - verbs,
   - envelopes (`env.*`),
   - episodes.
4. **UX / Applications (L3)** — user interfaces, workflows, product logic.

Only L2 is standardized by MOVA 4.0.0. All other layers are pluggable.

---

## 2. Layer 0 — Models & tools

Contents:

- foundation models (LLMs, vision, speech, etc.);
- retrieval, RAG, search indices;
- business APIs (payments, logistics, CRM, etc.);
- storages (SQL/NoSQL, KV, object stores).

MOVA does **not** define or constrain L0 implementations.

---

## 3. Layer 1 — Executors

Executors are any systems that:

- receive MOVA envelopes and/or data;
- interpret them as instructions;
- call models and tools (L0);
- produce new MOVA‑compatible artefacts as results.

Examples:

- a Cloudflare Worker implementing Smartlink routing;
- an agent graph orchestrating tools;
- a batch job that validates and publishes document packages.

Executors may have their own internal state formats and graphs —
MOVA does not prescribe them. MOVA only defines **agreements at the
boundaries**.

---

## 4. Layer 2 — MOVA

MOVA defines:

- **What data exists** — `ds.*` schemas;
- **What actions are allowed** — verbs;
- **How actions are encoded** — `env.*` envelopes;
- **How experience is recorded** — episode schemas.

MOVA 4.0.0 guarantees that:

- any executor that respects the schemas and envelopes can interoperate;
- long‑lived artefacts (configs, profiles, decisions, episodes) have
  stable structure, regardless of which models/tools produced them.

MOVA does **not** know:

- which model to call;
- which tool to use;
- how to schedule or scale execution.

---

## 5. Layer 3 — UX / Applications

UX and applications are free to:

- present MOVA‑based data in any form (forms, chats, dashboards, etc.);
- implement domain‑specific flows (wizards, multi‑step guides);
- provide human‑in‑the‑loop review and approvals.

MOVA only ensures that:

- when a UX flow claims “this profile is stored”, there is a
  `ds.*`‑compatible record;
- when an app claims “this package is ready to submit”, there is a
  validated `env.*` (e.g. `env.doc_package_submit_v1`).

UX details (step‑by‑step questions, hints, explanations) are part
of L3, not L2.

---

## 6. Red / Yellow / Green zones

It is often useful to classify where MOVA is **mandatory**, **recommended**,
or **not needed**:

- 🔴 **Red (mandatory MOVA)**  
  - boundaries where data become official:
    - registry writes,
    - document packages,
    - state changes for contracts/policies,
    - genetic memory episodes.  
  - Only MOVA‑valid artefacts may cross.

- 🟡 **Yellow (recommended MOVA)**  
  - internal aggregates, recurring reports, semi‑stable configs.  
  - MOVA schemas bring stability and comparability over time,
    but systems MAY temporarily diverge during exploration.

- 🟢 **Green (no MOVA)**  
  - free‑form exploration, drafts, experiments, temporary caches.  
  - For these flows MOVA would add friction with little benefit.

This zoning prevents over‑using MOVA where its schema tax would
outweigh its benefits.
