/**
 * HMAC-SHA-256 — eine Quelle, zwei Nutzer.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE DATEI ENTSTANDEN IST
 * Diese vier Funktionen lagen bis MP-G privat in `lib/lead-guard.ts`. Das war
 * richtig, solange es genau einen Nutzer gab. Mit der Admin-Sitzung kommt ein
 * zweiter — und die naheliegende Bewegung wäre gewesen, sie dort noch einmal
 * zu schreiben.
 *
 * Genau das darf bei Krypto nicht passieren. Zwei Implementierungen desselben
 * Verfahrens laufen auseinander, und die schwächere von beiden entscheidet.
 * Der zeitkonstante Vergleich unten ist dafür das beste Beispiel: Wer ihn beim
 * zweiten Mal als `a === b` schreibt, verrät über die Antwortzeit, wie weit
 * eine geratene Signatur stimmt — und niemand sieht es dem Code an.
 *
 * Verhalten unverändert gegenüber der Fassung in `lead-guard.ts`. Es ist ein
 * Umzug, keine Neufassung.
 *
 * Web-Crypto, kein Node-`crypto`: läuft damit auch in der Edge-Laufzeit —
 * `middleware.ts` braucht das.
 */

const encoder = new TextEncoder()

/**
 * Importierte Schlüssel werden zwischengespeichert: Der Import ist der teure
 * Teil, und derselbe Wert kommt bei jeder Anfrage wieder.
 */
const keyCache = new Map<string, Promise<CryptoKey>>()

function hmacKey(value: string): Promise<CryptoKey> {
  let cached = keyCache.get(value)
  if (!cached) {
    cached = crypto.subtle.importKey(
      "raw",
      encoder.encode(value),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )
    keyCache.set(value, cached)
  }
  return cached
}

export function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export async function sign(message: string, value: string): Promise<string> {
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(value), encoder.encode(message))
  return toBase64Url(signature)
}

/** Vergleich ohne Laufzeit-Unterschied — sonst verrät die Antwortzeit die Signatur. */
export function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
