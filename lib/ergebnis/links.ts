/**
 * Herkunft an eigene Links hängen (Katman 3, 24.10.2026): Ohne utm-Angaben war
 * nie messbar, ob eine Anfrage von einem LinkedIn-Beitrag kam – die Karne sah
 * Läufe, aber keine Wirkung. Nur creadig.de-Links, nur wenn noch keine
 * utm-Angaben dran sind; Buchungslinks tragen ihre Herkunft schon im Token.
 */
export function markiereLinks(text: string, h: { quelle: string; medium: string; kampagne: string; inhalt?: string }): string {
  return text.replace(/https:\/\/(?:www\.)?creadig\.de(?:\/[^\s)<>"'\]]*)?/gi, (url) => {
    const ende = url.match(/[.,;:!?]+$/)?.[0] ?? ""
    const sauber = ende ? url.slice(0, -ende.length) : url
    if (/[?&]utm_/.test(sauber) || /\/termin\/buchen\//.test(sauber)) return url
    const p = new URLSearchParams({ utm_source: h.quelle, utm_medium: h.medium, utm_campaign: h.kampagne, ...(h.inhalt ? { utm_content: h.inhalt } : {}) })
    return `${sauber}${sauber.includes("?") ? "&" : "?"}${p.toString()}${ende}`
  })
}
