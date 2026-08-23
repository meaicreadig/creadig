import { HomeRoute } from "@/app/_routes/home"

/**
 * Türkische Startseite. Dieselbe Quelle wie `/` — die Sprache kommt aus dem
 * Layout dieser Routen-Gruppe, nicht aus dem Inhalt.
 */
export default function Page() {
  return <HomeRoute />
}
