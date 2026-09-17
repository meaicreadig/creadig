/**
 * ADM-01 · Admin-Texte DEUTSCH — die Quelle.
 *
 * `tr.ts` ist gegen den TYP dieser Datei geschrieben: Fehlt dort ein Schlüssel
 * oder hat er eine andere Form, baut das Projekt nicht. Jede neue Admin-
 * Beschriftung entsteht HIER und DORT im selben Commit.
 *
 * Regeln: Geschäftssprache zuerst, Technik nur in der Systemdiagnose. Keine
 * Gate-Nummern, keine Paragraphen, keine Dateinamen.
 */
export const de = {
  sprache: {
    name: "Deutsch",
    kurz: "DE",
    umschalterLabel: "Sprache der Oberfläche",
    hinweis: "Ändert nur die Oberfläche — keine Kundenkommunikation.",
  },
  shell: {
    produkt: "Control Center",
    springen: "Zur Arbeitsfläche springen",
    navLabel: "Hauptnavigation",
    menueOeffnen: "Menü öffnen",
    menueSchliessen: "Menü schließen",
    abmelden: "Abmelden",
    abmeldenLaeuft: "Wird abgemeldet …",
  },
  nav: {
    uebersicht: { label: "Übersicht", hint: "Was heute zählt" },
    anfragen: { label: "Anfragen", hint: "Eingang, Qualifizierung, nächster Schritt" },
    kunden: { label: "Kunden & Kontakte", hint: "Organisationen, Personen, Historie" },
    vertrieb: { label: "Vertrieb", hint: "Chancen, Pipeline, Recherche, Verlust" },
    nachweise: { label: "Nachweise & Freigaben", hint: "Was als Nächstes beweisbar wird" },
    system: { label: "System", hint: "Einrichtung, Material, Diagnose" },
  },
  login: {
    titel: "Anmeldung",
    passwort: "Passwort",
    anmelden: "Anmelden",
    pruefen: "Wird geprüft …",
    weiter: "Angemeldet — Übersicht wird geladen …",
    abgelaufen: "Die Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
    widerrufen: "Diese Sitzung wurde abgemeldet. Bitte melden Sie sich erneut an.",
    fehler: {
      ungueltig: "Anmeldung nicht möglich.",
      "zu-viele": "Zu viele Versuche. Bitte später erneut probieren.",
      "nicht-eingerichtet": "Nicht eingerichtet.",
      zeitueberschreitung: "Der Server hat nicht rechtzeitig geantwortet. Bitte erneut versuchen.",
      offline: "Keine Internetverbindung. Bitte Verbindung prüfen und erneut versuchen.",
      stoerung: "Der Server ist gerade gestört. Bitte in einem Moment erneut versuchen.",
    },
  },
  nichtGefunden: {
    titel: "Nicht gefunden",
    hinweisTitel: "Diese Adresse gibt es hier nicht",
    hinweis: "Die Datenquelle hat geantwortet — zu dieser Kennung liegt nur nichts vor. Möglich ist ein alter Link, eine getippte Kennung oder ein Datensatz, den es nicht mehr gibt.",
    zurUebersicht: "Zur Übersicht",
  },
  speicher: {
    nichtEingerichtetTitel: (bereich: string) => `${bereich}: Datenbank nicht eingerichtet`,
    nichtEingerichtetText: (inhalt: string) =>
      `${inhalt} liegen in der Kunden- und Anfragedatenbank. Sie ist für diese Umgebung noch nicht eingerichtet. Das ist keine leere Liste, sondern eine fehlende Verbindung — Einrichtung unter System.`,
    nichtErreichbarTitel: (bereich: string) => `${bereich}: Datenbank gerade nicht erreichbar`,
    nichtErreichbarText: (inhalt: string) =>
      `${inhalt} liegen in der Kunden- und Anfragedatenbank. Sie ist eingerichtet, hat aber gerade nicht geantwortet. Das ist keine leere Liste, sondern eine Störung — nichts wurde gelöscht.`,
    erneutLaden: "Erneut laden",
    inhaltVertrieb: "Anfragen, Kontakte und Verkaufschancen",
    inhaltKunden: "Organisationen, Standorte und Ansprechpartner",
  },
}
