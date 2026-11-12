# PRODUCT.md — HOLO-NET Fleet Registry

## Purpose
A standalone, non-commercial software engineering and AI evaluation laboratory based on a fictional Star Wars logistics scenario. The public site must enable a visitor or technical recruiter to **actually try** planet/faction history, ship class data, simulated fleet balances, and a read-only Portuguese natural-language query without signup.

The project is NOT a KORA module, official Star Wars software, a military ERP, or evidence of production AI model training. Synthetic inventory quantities must always be identified as invented.

## User goals
1. Ask a natural-language question and receive a grounded, inspectable result in under three interactions.
2. Distinguish historic/lore facts from synthetic fleet counts and from insufficient evidence.
3. Inspect example source records with era, provenance, and caveats.
4. Explore stock and model details on phones and desktops.
5. For a local developer, run authentication, RBAC-scoped transfers and audit safely without publishing admin APIs.
6. Understand the architecture by reading focused guides outside source code; reproduce tests and discuss failures in interviews.

## Audience
- Engineering and AI internship reviewers evaluating functional demos, tests, and clarity.
- The project owner learning React/Redux, Node/Fastify, SQLite, query planning, tool calling, retrieval, evaluation, and security.
- Star Wars fans exploring time-sensitive fictional lore, with explicit Canon vs simulation labeling.

## Product truth and verified limitations
- Public GitHub Pages: browser-only read/query. A local Fastify/SQLite backend is required for authenticated administration and persistent state.
- Initial curated lore: 12 planets, 14 ship classes. The SWAPI expands catalogs but does NOT provide reliable territory control or complete historic alignment.
- Synthetic fleet: invented quantities, not franchise facts; key data invariants are checked by the API.
- Natural queries are rules-first. An optional loopback OpenAI-compatible LLM may choose five **read-only** tools; no real model inference has yet been benchmarked.
- Retrieval is lexical over curated lore, NOT embeddings, semantic RAG, or a trained neural model.
- Test suites: frontend, backend, and a finite 30-question curated evaluation; do not extrapolate evaluation accuracy to unseen questions.
- Existing code and tested route contracts must be preserved; documentation must not pretend unimplemented features exist.

## Product interface decisions
- Successful first viewport: the user can find the **natural-language input**, synthetic stock and clickable sector map immediately.
- Mode: **Operate** (a working console), with a secondary **Read** mode for lore provenance.
- A confident sci-fi feel: military holotable / command operations, precise hierarchy, not generic cyberpunk landing-page chrome.
- Keep Portuguese explanations and clear focus states. A11y and reduced-motion are mandatory.
- All navigation buttons and primary actions perform their named action.
- Preserve Star Wars fan attribution and external canonical source links. Do not embed copyrighted imagery without license.

## Non-goals for this sprint
- Full galactic lore encyclopedia or geographic map accuracy.
- Public login or hosting sensitive state on GitHub Pages.
- Stock modification by LLM or free-form natural language.
- Installing models, GPU toolchains, frameworks or new databases without first verifying local environment.
- Refactoring KORA, moving documentation to Notion, or creating another assistant.
