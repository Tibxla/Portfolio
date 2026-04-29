# AGENTS.md

## Project

This repository is a static GitHub Pages portfolio for Thibaud Thomas-Lamotte.

The site is intentionally simple:

- `index.html` contains the page content and structure.
- `styles.css` contains the visual system and responsive layout.
- `js/` contains the existing background, physics, and UI interactions.
- `assets/` can contain static public files such as the downloadable CV.

Do not add a build step unless the user explicitly asks for a larger technical migration.

## Workflow

- Use PowerShell commands on Windows.
- Use `.worktrees/` for isolated implementation branches.
- Keep `.worktrees/` ignored and never commit worktree contents.
- Prefer focused commits after each coherent implementation step.
- Use `apply_patch` for manual file edits.
- Do not expose private repository links. In particular, Edifig is a private repository and must not link to GitHub from the public portfolio.

## Verification

For portfolio content changes, run:

```powershell
node tools/check-portfolio-content.mjs
git diff --check
```

For visual changes, open `index.html` locally and check desktop and mobile layouts.
