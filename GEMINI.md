# Gemini / Google AI Studio — existing repository work instructions

This repository is **Saiiru/starwarsplanets**; it is not a blank starter app.

1. Read `PRODUCT.md`, `DESIGN.md`, `docs/GOOGLE_AI_STUDIO_HANDOFF.md` and `docs/GENAI_ENGINEERING_SPRINT.md` before editing.
2. Preserve the React/Redux/Vite frontend; keep the Fastify/SQLite backend local and the `/api/v1/*` contracts.
3. Never invent data, invent Star Wars control history, hide incomplete implementation, or claim actual model inference where only mocks or rules exist.
4. Keep operational UI accessible on phones and desktops. The first viewport must show a working natural-language question, sector map and simulated inventory.
5. Do not expose passwords, SQLite files, .env, personal vault files or secrets. No outside model API calls unless explicitly approved.
6. Modify UI in a separate branch or return a diff; do not overwrite main without a review.
7. Run tests, evaluation, local preview and screenshot regression before requesting a merge.
8. Documentation/tutorials belong in docs, not extensive didactic code comments.

Further explicit editor task: `docs/GOOGLE_AI_STUDIO_HANDOFF.md`.
