import { AsyncLocalStorage } from "node:async_hooks"

/**
 * Wer ruft gerade das Modell? (Katman 5, 24.10.2026)
 *
 * Das Firmengedächtnis hängt sich als Middleware an JEDEN Modellaufruf
 * (instrumentation.ts) – dafür muss es wissen, für welchen Agenten der Text
 * entsteht. `fuehreAgentAus`, der Chat und der Motor setzen das hier.
 *
 * Der Speicher liegt auf globalThis: instrumentation.ts und die Routen können
 * in getrennten Bündeln landen, sie müssen trotzdem denselben sehen.
 */
type Kontext = { agent: string; ohne?: boolean }

const g = globalThis as typeof globalThis & { __creadigLernKontext?: AsyncLocalStorage<Kontext> }
const speicher = (g.__creadigLernKontext ??= new AsyncLocalStorage<Kontext>())

export const aktuellerKontext = (): Kontext | undefined => speicher.getStore()

export function mitAgent<T>(agent: string, fn: () => Promise<T>): Promise<T> {
  return speicher.run({ agent }, fn)
}

/** Für Aufrufe, die das Gedächtnis selbst bauen oder nur einordnen – sonst lernt es aus sich selbst. */
export function ohneGedaechtnis<T>(fn: () => Promise<T>): Promise<T> {
  return speicher.run({ agent: aktuellerKontext()?.agent ?? "", ohne: true }, fn)
}
