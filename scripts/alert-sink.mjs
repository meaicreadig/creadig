#!/usr/bin/env node
/**
 * Ein Alarm-Empfaenger zum Ausprobieren.
 *
 * Zwei Betriebsarten, weil man zwei Dinge wissen will:
 *
 *   --mode echo     nimmt an, gibt die Nutzlast aus, antwortet 200.
 *                   Zeigt, WAS hinausginge — und ob ueberhaupt etwas geht.
 *   --mode silent   nimmt an und antwortet nie.
 *                   Prueft, ob die Frist im Meldeweg wirklich greift; ohne
 *                   sie haengt der Vorgang, dessen Ausfall gemeldet werden
 *                   soll.
 *
 * Damit laesst sich der Meldeweg vollstaendig pruefen, ohne dass ein echter
 * Empfaenger eine Testmeldung bekommt.
 *
 *   node scripts/alert-sink.mjs --mode echo &
 *   ALERT_WEBHOOK_URL=http://127.0.0.1:4999/hook npm run dev
 */
import { createServer } from "node:http"

const args = process.argv.slice(2)
const modus = args.includes("--mode") ? args[args.indexOf("--mode") + 1] : "echo"
const port = Number(args.includes("--port") ? args[args.indexOf("--port") + 1] : 4999)

createServer((req, res) => {
  let roh = ""
  req.on("data", (c) => (roh += c))
  req.on("end", () => {
    if (modus === "silent") return // nie antworten — die Frist muss greifen
    console.log(`[empfaenger] ${new Date().toISOString()} ${roh.slice(0, 400)}`)
    if (modus === "4xx") { res.writeHead(404).end("nicht da"); return }
    if (modus === "5xx") { res.writeHead(500).end("kaputt"); return }
    res.writeHead(200, { "Content-Type": "application/json" }).end('{"ok":true}')
  })
}).listen(port, () => console.log(`Alarm-Empfaenger (${modus}) auf http://127.0.0.1:${port}/hook`))
