#!/usr/bin/env node
// Startet den Chrome DevTools MCP-Server für Claude Code.
// https://github.com/ChromeDevTools/chrome-devtools-mcp
//
// Lokal (Mac, Windows, Linux mit Display): startet den installierten Chrome mit
// Fenster und eigenem Profil (~/.cache/chrome-devtools-mcp).
// Cloud-Session / Container (Linux ohne Display): headless, temporäres Profil,
// Playwright-Chromium unter /opt/pw-browsers, ohne Sandbox (läuft dort als root).
//
// Umgebungsvariablen (optional):
//   CHROME_DEVTOOLS_HEADLESS=1      headless erzwingen, auch lokal
//   CHROME_DEVTOOLS_CHROME=<pfad>   bestimmte Chrome-Binary verwenden
//   CHROME_DEVTOOLS_ARGS="…"        weitere Argumente für chrome-devtools-mcp,
//                                   z. B. "--viewport 1280x720 --slim"
//
// Wichtig: stdout gehört dem MCP-Protokoll. Eigene Ausgaben nur auf stderr.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const env = process.env;
const win = process.platform === "win32";

const noDisplay = process.platform === "linux" && !env.DISPLAY && !env.WAYLAND_DISPLAY;
const headless = env.CHROME_DEVTOOLS_HEADLESS === "1" || noDisplay;

const playwrightChrome = join(env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers", "chromium");
const chrome = env.CHROME_DEVTOOLS_CHROME || (existsSync(playwrightChrome) ? playwrightChrome : "");

const isRoot = typeof process.getuid === "function" && process.getuid() === 0;

const args = ["-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"];
if (headless) args.push("--headless", "--isolated", "--viewport", "1440x900");
if (chrome) args.push("--executablePath", chrome);
if (isRoot) args.push("--chrome-arg=--no-sandbox", "--chrome-arg=--disable-setuid-sandbox");
if (env.CHROME_DEVTOOLS_ARGS) args.push(...env.CHROME_DEVTOOLS_ARGS.split(/\s+/).filter(Boolean));

console.error(`[chrome-devtools-mcp] ${headless ? "headless" : "mit Fenster"}${chrome ? `, Chrome: ${chrome}` : ""}`);

const child = spawn(
  "npx",
  win ? args.map((a) => (/\s/.test(a) ? `"${a}"` : a)) : args,
  { stdio: "inherit", shell: win },
);

child.on("error", (err) => {
  console.error(`[chrome-devtools-mcp] Start fehlgeschlagen: ${err.message}`);
  process.exit(1);
});
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));

for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    try { child.kill(sig); } catch { child.kill(); }
  });
}
