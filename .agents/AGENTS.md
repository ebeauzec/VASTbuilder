# VASTbuilder Workspace Rules

## Git — Commit & Push on Every Change

**Every code change made in this workspace MUST be immediately committed and pushed to `https://github.com/ebeauzec/VASTbuilder` (main branch) before responding to the user.**

### Commit workflow (mandatory after every edit)

```
git add <changed files>
git commit -m "<type>: <concise description>\n\n<body>"
git push origin main
```

### Commit message format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

| Type | When to use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructure, no behaviour change |
| `style` | CSS / visual changes |
| `docs` | README, CHANGELOG, or comments only |
| `chore` | Version bumps, config, tooling |
| `perf` | Performance improvement |

Always include a body describing **what** changed and **why** — not just what the diff shows.

---

## Documentation — Update on Every Functional Change

### CHANGELOG.md (always)
- Add an entry under the correct version (`[Unreleased]` if mid-session, then close it on version bump).
- Group under `Added`, `Changed`, `Fixed`, `Removed`.
- Be specific: name the function, element ID, or panel affected.

### README.md (when features or UX change)
- Update the **Features** table if a new capability is added.
- Update the **Deliverables** section if document output changes.
- Update the **Architecture** section if file structure changes.
- Update the **Workflow** section if the user flow changes.
- Keep the version badge in sync with the current release.

### Version bumping (semver: MAJOR.MINOR.PATCH)
- **PATCH** (`x.x.1`) — bug fixes, non-breaking tweaks, documentation only.
- **MINOR** (`x.1.0`) — new features, new panels, new cascades, new generators.
- **MAJOR** (`2.0.0`) — complete rewrites, breaking changes to saved config format.
- Bump in: `index.html` (title, sidebar, modal, engine comment), `app.js` (console.log), `README.md` (badge).
- Tag the release: `git tag -a vX.Y.Z -m "description"` + `git push origin vX.Y.Z`.

---

## File locations

| File | Purpose |
|------|---------|
| `G:\My Drive\AntiGravity\VAST\index.html` | Main SPA — wizard panels + inline JS engine |
| `G:\My Drive\AntiGravity\VAST\app.js` | Business logic — sizing, generators, IndexedDB |
| `G:\My Drive\AntiGravity\VAST\styles.css` | Design system — dark glassmorphism |
| `G:\My Drive\AntiGravity\VAST\catalog.json` | Live product catalog — fetched by Update KB |
| `G:\My Drive\AntiGravity\VAST\README.md` | Project documentation |
| `G:\My Drive\AntiGravity\VAST\CHANGELOG.md` | Version history |

---

## JS style rules (index.html inline script)

- **No template literals** (backticks) in inline `<script>` blocks — use `out += '...'` concatenation.
- **No multiline JS string literals** — break into multiple `out +=` lines.
- Wrap all new functions in `try/catch` — never let a JS error break the UI.
- All new functions go in the inline `<script>` (not `app.js`) unless modifying existing app.js logic.
- Call `updateAll()` at the end of any function that changes form state.

---

## Coding standards

- Never add debug buttons, console.log spam, or test UI to the interface.
- Always update the `app.js?v=<timestamp>` cache buster after modifying `app.js`.
- Preserve all existing comments and docstrings unless explicitly replacing them.
- Run a Python verification script after every patch to confirm key function names exist.
