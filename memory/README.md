# memory/

Persistent project context for AI assistants and future maintainers.

These files exist so that any collaborator — especially an AI assistant starting cold — can reconstruct the full state of the project and continue without losing context.

## Files

| File | Purpose |
| --- | --- |
| [`MASTER_CONTEXT.md`](MASTER_CONTEXT.md) | The canonical overview. **Read this first.** |
| [`CURRENT_STATE.md`](CURRENT_STATE.md) | What phase we are in and what is happening now. |
| [`AI_HANDOFF.md`](AI_HANDOFF.md) | Rules and notes for handing off between work sessions. |
| [`DECISIONS.md`](DECISIONS.md) | Log of significant decisions and their rationale. |
| [`FEATURE_STATUS.md`](FEATURE_STATUS.md) | Status of each planned feature. |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Current architectural understanding. |
| [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md) | Known gaps, constraints, and open risks. |

## Rules

1. Always read `MASTER_CONTEXT.md` before starting work.
2. Always update `CURRENT_STATE.md` after significant work.
3. Always update `AI_HANDOFF.md` before ending a session.
4. Never remove documentation.
5. Never change architecture without recording the reason in `DECISIONS.md`.
6. Keep all documentation synchronized.

> Note: This is the *project's* memory, distinct from any individual tool's memory system.
