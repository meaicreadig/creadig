# creaDIG

Landing page for [creaDIG](https://creadig.vercel.app) — Business Architecture & Operations (DACH).

## Stack

| File | Role |
|------|------|
| `index.html` | Main page, theme CSS, sections |
| `app-lang.js` | 5-language i18n (DE default) |
| `creadig-dynamic.js` | MEAI terminal copy |
| `creadig-motion.js` | Scroll / hover motion (Faz 1) |

## Cursor — UI/UX Pro Max (Faz 2)

Installed via [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill):

```bash
npm install -g uipro-cli
uipro init --ai cursor    # in repo root
uipro update              # refresh skill data
```

- Skill: `.cursor/skills/ui-ux-pro-max/`
- Design system: `design-system/creadig/MASTER.md`
- Project rules: `.cursor/rules/creadig-site.mdc`

After install, restart Cursor. Example prompt: *“Review hero section UX against creaDIG design system — keep all copy.”*

## Deploy

Static site. Deployed via Vercel from this repository.
