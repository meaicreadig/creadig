#!/usr/bin/env node
/**
 * Der Deploy-Befehl.
 *
 * ---------------------------------------------------------------------------
 * WAS AM 05./06.09.2026 PASSIERT IST
 * Acht Produktions-Deployments in zwei Tagen, keines davon vom Eigentuemer
 * ausgeloest. Die Deployment-Liste zeigt zwei Wege:
 *
 *   actor: "cursor-cli", gitDirty: "1"   -> jemand rief `vercel --prod`
 *   action: "promote"                    -> jemand befoerderte eine Vorschau
 *
 * Beide sind bewusste Handlungen. Keine davon war eine Freigabe.
 *
 * ---------------------------------------------------------------------------
 * WAS EIN PUSH TUT — UND WAS NICHT
 * Wichtig fuer das Verstaendnis: Ein Push auf den Zweig erzeugt eine
 * VORSCHAU (`target: null`), nicht Produktion. Nachgewiesen an sechs
 * Deployments mit `repoPushedAt` und ohne `target`. Produktion verlangt
 * immer einen zweiten, ausdruecklichen Schritt.
 *
 * Deshalb sperrt dieses Haus Pushes NICHT. Eine Sperre gegen etwas
 * Harmloses erzieht nur dazu, Sperren zu umgehen.
 *
 * ---------------------------------------------------------------------------
 * WAS DIESER BEFEHL LEISTET — UND WAS NICHT
 * Er ist der VORGESEHENE Weg und macht die Absicht zur Bedingung. Er kann
 * nicht verhindern, dass jemand `vercel --prod` direkt tippt; ein global
 * installiertes Programm laesst sich von hier aus nicht abfangen. Was er
 * beseitigt, ist das versehentliche Deployment aus dem gewohnten Ablauf
 * heraus — und das war der Fall, der eingetreten ist.
 *
 * Der Rest steht in `docs/ops/production-deployment-control.md` als
 * Owner-Entscheidung, nicht als geloestes Problem.
 */
import { spawnSync } from "node:child_process"

const produktion = process.argv.includes("--production")
const ZUSTIMMUNG = "ja-ich-deploye-produktion"

if (!produktion) {
  console.log("\n  Vorschau-Deployment. Produktion bleibt unberuehrt.\n")
  const r = spawnSync("vercel", ["deploy"], { stdio: "inherit" })
  process.exit(r.status ?? 1)
}

if (process.env.CREADIG_DEPLOY_PRODUCTION !== ZUSTIMMUNG) {
  console.error(
    `\n  ABGEBROCHEN — Produktions-Deployment ohne Freigabe.\n\n` +
    `  creadig.de bedient echte Kunden. Ein Deployment dorthin ist eine\n` +
    `  Entscheidung des Eigentuemers, kein Schritt in einem Arbeitsablauf.\n\n` +
    `  Wenn die Freigabe vorliegt:\n` +
    `    CREADIG_DEPLOY_PRODUCTION=${ZUSTIMMUNG} npm run deploy:production\n\n` +
    `  Vorher gefahrlos ausprobieren:\n` +
    `    npm run deploy:preview\n`,
  )
  process.exit(3)
}

console.log("\n  Freigabe liegt vor. Produktions-Deployment laeuft.\n")
const r = spawnSync("vercel", ["deploy", "--prod"], { stdio: "inherit" })
process.exit(r.status ?? 1)
