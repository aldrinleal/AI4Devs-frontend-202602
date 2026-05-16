# CLAUDE.md — agent collaboration notes for this repo

## Staging policy

**Before every `git add` / staging operation, refresh `prompts/prompts-iniciales.md`
and stage it together with the rest of the change.**

Concrete steps:

1. Regenerate the prompts log:

   ```bash
   ~/bin/list-prompts.py > prompts/prompts-iniciales.md
   ```

2. Stage it alongside whatever else you are about to commit:

   ```bash
   git add prompts/prompts-iniciales.md <other files>
   ```

3. Then commit as usual.

Rationale: the `prompts-iniciales.md` file is the audit trail required by the
exercise (see the AI4Devs-frontend brief). Regenerating it before each stage
keeps it in sync with the conversation history and avoids "I forgot to update
the prompts file" diffs after the fact.

## Conventions

- Frontend lives in `frontend/` (Create React App + TypeScript).
- Drag-and-drop uses `@hello-pangea/dnd` (React 18 compatible fork of
  `react-beautiful-dnd`).
- API base URL is read from `REACT_APP_API_BASE_URL` (see `frontend/.env`).
- Branch for the exercise entregable: `frontend-iniciales-al`.
- PR target: upstream `LIDR-academy/AI4Devs-frontend-202602` against `main`.
