import { redirect } from "next/navigation"

/**
 * ADM-01 (17.09.2026) — das Cockpit ist in der Übersicht und unter System aufgegangen.
 *
 * Zwei Owner-Startflächen mit überlappender Frage waren eine zu viel: Die
 * Übersicht (`/admin`) sagt, was heute zu tun ist; die Lage-Register
 * („Wie es steht“, „Was daraus folgt“) stehen unter System. Diese Adresse
 * bleibt als Umleitung, damit gemerkte Links nicht ins Leere führen
 * (Routen-Karte im Ledger, A4). Die Rollen-Freigabe (nur Owner) gilt weiter,
 * weil die Middleware vor dieser Umleitung prüft.
 */
export default function CockpitUmleitung() {
  redirect("/admin/material#lage")
}
