# creaDIG

Landing page for [creaDIG](https://creadig.vercel.app) — Business Architecture & Operations (DACH).

## Stack

| File | Role |
|------|------|
| `index.html` | Main page, theme CSS, sections |
| `app-lang.js` | 5-language i18n (DE default) |
| `creadig-dynamic.js` | MEAI terminal copy |
| `creadig-motion.js` | Scroll / hover motion (Faz 1) |
| `creadig-faz3.css` / `creadig-faz3.js` | Premium UI layer — 21st.dev style (Faz 3) |

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

## MCP servers (Claude Code & Cursor)

Project-scoped MCP config: `.mcp.json` (Claude Code) and `.cursor/mcp.json` (Cursor). Both start the servers on demand via `npx` — nothing to install globally (Node ≥ 22.12 required by chrome-devtools-mcp).

| Server | Package | What the agent gets |
|--------|---------|---------------------|
| `context7` | `@upstash/context7-mcp` (4.x) | Up-to-date library docs & code examples — tools `resolve-library-id`, `query-docs`. Say “use context7” or name the library. |
| `chrome-devtools` | `chrome-devtools-mcp` (1.x, Google) | Drives a real Chrome: navigate, snapshot, screenshot, console, network, performance trace, Lighthouse — 30 tools. |

**First run.** Claude Code asks once to approve the project's MCP servers → approve, then check with `/mcp`. Cursor: Settings → MCP → enable both.

**Context7 API key (optional, higher rate limits).** Export `CONTEXT7_API_KEY` in your shell — the server picks it up automatically. Never commit the key.

**Chrome DevTools notes.** Default = your installed stable Chrome with a persistent profile in `~/.cache/chrome-devtools-mcp/`. Useful flags: `--isolated` (throwaway profile), `--headless` (no window), `--no-usage-statistics` (opt out of Google telemetry), `--viewport 1280x800`. Local site check: `node .claude/static-server.mjs`, then ask the agent to open `http://localhost:8910`.

**Claude Code on the web (cloud container).** Chrome DevTools works with the preinstalled Chromium — verified with:

```bash
npx -y chrome-devtools-mcp@latest --headless --isolated \
  --executable-path /opt/pw-browsers/chromium \
  --chrome-arg=--no-sandbox --chrome-arg=--disable-setuid-sandbox --chrome-arg=--disable-dev-shm-usage
```

Context7 needs outbound access to `context7.com` and `mcp.context7.com`; add both to the environment's allowed domains (cloud environment menu → Edit → Network access), otherwise lookups fail with `fetch failed`.
