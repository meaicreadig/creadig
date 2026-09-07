/**
 * ==========================================================================
 * G12 · DIE REALE KOHORTE
 * ==========================================================================
 *
 * Sechs echte Organisationen, oeffentlich recherchiert am 06.09.2026. Keine
 * Fixtures, keine erfundenen Firmen, keine erfundenen Zahlen. Jeder Satz
 * unter `claim` ist eine BEOBACHTUNG mit Fundstelle — nicht ihre Deutung.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE SECHS
 *
 * Nicht, weil sie ein gutes Ergebnis versprechen. Sondern weil sie
 * unterschiedliche Ergebnisse ERZWINGEN:
 *
 *   Volmer     Handwerk, aber nur EIN belegtes Betriebssignal
 *              -> beweist, dass Handwerk nicht automatisch passt
 *   Osnadach   Handwerk mit DREI belegten Signalen
 *              -> gibt der Handwerk-Hypothese eine faire Chance
 *   Diakonie   kein Handwerk, zwei Signale
 *              -> beweist, dass die Branche nicht filtert
 *   BECHER     belegter oeffentlicher Anlass, Passung unklar
 *              -> trennt Anlass von Passung
 *   Perltex    gleicher Betriebszustand, aber Schweiz
 *              -> Bedienbarkeit schlaegt Passung
 *   ASA        bereits Bestandskunde, oeffentlich wiedergefunden
 *              -> Dublettenschutz und „kein zweites Firmenmodell"
 *
 * ---------------------------------------------------------------------------
 * PERSONENDATEN — WAS HIER ABSICHTLICH NICHT STEHT
 *
 * Drei der sechs Betriebe nennen oeffentlich eine verantwortliche Person
 * (Impressum, Website, Presse). Fuer die Kette zaehlt an einer Person genau
 * dreierlei: dass es sie gibt, welche ROLLE sie hat, und ob eine FUNDSTELLE
 * sie belegt. Der Name selbst traegt zur Pruefung nichts bei.
 *
 * Deshalb steht hier „Person A" und daneben die Fundstelle. Wer den Namen
 * braucht, findet ihn an der Fundstelle — er muss nicht in einem oeffentlichen
 * Repository dauerhaft mitlaufen. Keine Mailadresse, keine Telefonnummer,
 * keine Personenprofile.
 *
 * ---------------------------------------------------------------------------
 * QUELLENPOLITIK — WAS ABGERUFEN WURDE UND WAS NICHT
 *
 * Abgerufen wurden ausschliesslich die eigenen Websites der Betriebe und eine
 * Pressemitteilung auf der eigenen Website des Absenders. Beides ist in
 * `SOURCES` (lib/research.ts) als maschinell zulaessig gefuehrt.
 *
 * NICHT abgerufen wurden: Stellenportale, Branchenverzeichnisse,
 * Handelsregister, LinkedIn. Kein Personenprofil, keine Anmeldeschranke, kein
 * CAPTCHA, keine Nutzungsbedingung umgangen.
 *
 * Die Karriereseite von Volmer liegt auf der EIGENEN Domain des Betriebs und
 * wurde deshalb als `website` gefuehrt, nicht als `stellenanzeige` — siehe
 * den Befund dazu in `docs/sales/evidence-canon.md`.
 */

/** Tag der Recherche. Alle Beobachtungen stammen von diesem Tag, ausser wo anders vermerkt. */
export const ERHOBEN_AM = "2026-09-06T00:00:00Z"

export const KOHORTE = [
  {
    key: "volmer",
    name: "Wilhelm Volmer GmbH & Co. KG",
    website: "https://www.dachdecker-volmer.de",
    rolle: "A · Handwerk, priorisierte Hypothese",
    handwerk: true,
    discoveryWhy:
      "Suche nach Dachdeckerbetrieben im Band Osnabrueck — die G09-Naehe-Hypothese wird an priorisierten Handwerksbetrieben angetestet.",
    discoveryKind: "website",
    discoveryUrl: "https://www.dachdecker-volmer.de/",
    access: null,
    serviceable: true,
    person: null,
    evidence: [
      {
        kind: "signal",
        ref: "aussendienst",
        claim:
          "Leistungsseite nennt Steildach, Flachdachabdichtung, Fassaden-, Gauben- und Schornsteinbekleidung sowie Sturmschadenbeseitigung — die Arbeit findet am Objekt statt.",
        sourceUrl: "https://www.dachdecker-volmer.de/",
        sourceKind: "website",
      },
      {
        kind: "fact",
        ref: null,
        claim:
          "Karriereseite sucht Dachdeckergesellen, Dachdeckerhelfer und Auszubildende. Sie nennt kein Programm, kein Werkzeug und keinen Ablauf; als Weg steht nur „Senden Sie uns einfach Ihre Anfrage\" mit zwei Telefonnummern und einer Mailadresse.",
        sourceUrl: "https://www.dachdecker-volmer.de/karriere/",
        sourceKind: "website",
      },
    ],
    erwartet: {
      passung: "unklar",
      stopState: "beleg-fehlt",
      kontaktStand: "person-unbekannt",
      gedeckt: false,
      warum:
        "Ein Handwerksbetrieb mit genau einem belegten Signal. Genau der Fall, den ein branchenbasiertes Zielbild passend genannt haette.",
    },
  },

  {
    key: "osnadach",
    name: "Osnadach",
    website: "https://osnadach.de",
    rolle: "A · Handwerk mit belegtem Betriebszustand · D · Passung ohne Zugang",
    handwerk: true,
    discoveryWhy:
      "Dieselbe Suche wie bei Volmer. Der Betrieb faellt auf, weil das Impressum zwei Anschriften fuehrt.",
    discoveryKind: "website",
    discoveryUrl: "https://osnadach.de/impressum/",
    access: null,
    serviceable: true,
    person: {
      name: "Person A",
      role: "Inhaber",
      sourceUrl: "https://osnadach.de/impressum/",
      sourceKind: "impressum",
      relationship: "unbekannt",
    },
    evidence: [
      {
        kind: "signal",
        ref: "mehrere-standorte",
        claim:
          "Impressum nennt die Geschaeftsanschrift Hohe Linde 3 in 49124 Georgsmarienhuette und zusaetzlich „Lagerort seit August 2024: Toepferstrasse 37, 49170 Hagen a. TW\".",
        sourceUrl: "https://osnadach.de/impressum/",
        sourceKind: "website",
      },
      {
        kind: "signal",
        ref: "mehrere-standorte",
        claim:
          "Die Startseite fuehrt dieselben zwei Orte: Geschaeftsanschrift in Georgsmarienhuette, Ortsteil Kloster Oesede, und Lagerort Toepferstrasse 37 in Natrup-Hagen.",
        sourceUrl: "https://osnadach.de/",
        sourceKind: "website",
      },
      {
        kind: "signal",
        ref: "inhaber-als-schnittstelle",
        claim:
          "Das Impressum nennt genau eine verantwortliche Person und genau eine Mobilnummer als Kontaktweg. Keine Rollen-, Abteilungs- oder Vertretungsadresse.",
        sourceUrl: "https://osnadach.de/impressum/",
        sourceKind: "website",
      },
      {
        kind: "signal",
        ref: "koordination-ueber-chat",
        claim:
          "Die Startseite gibt dieselbe Mobilnummer mit dem Zusatz „auch whatsapp\" als Kontaktweg an, neben Mail und Formular.",
        sourceUrl: "https://osnadach.de/",
        sourceKind: "website",
      },
      {
        kind: "fact",
        ref: null,
        claim:
          "Als Einsatzgebiet nennt die Startseite Georgsmarienhuette und das Osnabruecker Umland sowie zusaetzlich den Kreis Lippe.",
        sourceUrl: "https://osnadach.de/",
        sourceKind: "website",
      },
    ],
    erwartet: {
      passung: "passend",
      stopState: "eingeordnet",
      kontaktStand: "zugang-offen",
      gedeckt: false,
      warum:
        "Passung steht auf drei belegten Signalen, die Person ist durch das Impressum belegt — und trotzdem gibt es keinen Weg hin. Kein gemeinsamer Dritter, kein Anlass. Genau hier hoert das System auf.",
    },
  },

  {
    key: "diakonie",
    name: "Diakonie Osnabrueck Stadt und Land · Ambulante Pflegedienste",
    website: "https://www.diakonie-os.de",
    rolle: "B · kein Handwerk, starke Betriebssignale",
    handwerk: false,
    discoveryWhy:
      "Gegenprobe zur Handwerk-Hypothese: ein Betriebszustand mit Aussendienst und mehreren Standorten, aber ohne jedes Gewerk.",
    discoveryKind: "website",
    discoveryUrl: "https://www.diakonie-os.de/angebote/senioren/ambulante-pflegedienste.html",
    access: null,
    serviceable: true,
    person: null,
    evidence: [
      {
        kind: "signal",
        ref: "mehrere-standorte",
        claim:
          "Die Uebersichtsseite listet fuenf eigenstaendige ambulante Dienste: Osnabruecker Land, Osnabrueck, Belm-Bissendorf, Melle und Barnstorf.",
        sourceUrl: "https://www.diakonie-os.de/angebote/senioren/ambulante-pflegedienste.html",
        sourceKind: "website",
      },
      {
        kind: "signal",
        ref: "aussendienst",
        claim:
          "Die Leistung wird in der Wohnung der Pflegebeduerftigen erbracht; die Seite stellt das Verbleiben in der vertrauten Umgebung als Zweck des Dienstes dar.",
        sourceUrl: "https://www.diakonie-os.de/angebote/senioren/ambulante-pflegedienste.html",
        sourceKind: "website",
      },
      {
        kind: "fact",
        ref: null,
        claim:
          "Die Uebersichtsseite nennt eine gemeinsame Telefonnummer und gemeinsame Sprechzeiten, aber keine Person und keine Durchwahl je Dienst.",
        sourceUrl: "https://www.diakonie-os.de/angebote/senioren/ambulante-pflegedienste.html",
        sourceKind: "website",
      },
    ],
    erwartet: {
      passung: "passend",
      stopState: "eingeordnet",
      kontaktStand: "person-unbekannt",
      gedeckt: false,
      warum:
        "Kein Gewerk, keine Handwerkskammer — und trotzdem passend. Die Branche hat nicht gefiltert. Was fehlt, ist ein Mensch.",
    },
  },

  {
    key: "becher",
    name: "BECHER Holzhandel · Standort Osnabrueck",
    website: "https://www.becher-holz.de",
    rolle: "E · belegter oeffentlicher Anlass",
    handwerk: false,
    discoveryWhy:
      "Presseauswertung: oeffentlich kommunizierte Standortveraenderung im Band Osnabrueck. Der Anlass wurde vom Betrieb selbst oeffentlich gemacht.",
    discoveryKind: "presse",
    discoveryUrl: "https://www.becher-holz.de/aktuelles-von-becher/becher-osnabrueck/",
    access: null,
    serviceable: true,
    person: {
      name: "Person B",
      role: "Geschaeftsleiter des Standorts",
      sourceUrl: "https://www.becher-holz.de/aktuelles-von-becher/becher-osnabrueck/",
      sourceKind: "presse",
      relationship: "unbekannt",
    },
    evidence: [
      {
        kind: "anlass",
        ref: null,
        claim:
          "Mitteilung vom 26.02.2026: Das bis dahin gemietete Grundstueck am Standort Hansastrasse, rund 10.000 Quadratmeter, wurde zum 16.12.2025 erworben; 21 Arbeitsplaetze werden als gesichert genannt, eine Erweiterung der Gartenausstellung ist angekuendigt.",
        sourceUrl: "https://www.becher-holz.de/aktuelles-von-becher/becher-osnabrueck/",
        sourceKind: "presse",
        observedAt: "2026-02-26T00:00:00Z",
      },
      {
        kind: "signal",
        ref: "mehrere-standorte",
        claim:
          "Die Mitteilung beschreibt Osnabrueck als einen Standort unter mehreren derselben Handelsgruppe.",
        sourceUrl: "https://www.becher-holz.de/aktuelles-von-becher/becher-osnabrueck/",
        sourceKind: "presse",
        observedAt: "2026-02-26T00:00:00Z",
      },
    ],
    erwartet: {
      passung: "unklar",
      stopState: "beleg-fehlt",
      kontaktStand: "zugang-offen",
      gedeckt: true,
      warum:
        "Der einzige Fall der Kohorte mit belegtem Anlass UND belegter Person. Eine Ansprache waere gedeckt — die Passung steht trotzdem auf einem einzigen Signal, und entschieden ist nichts.",
    },
  },

  {
    key: "perltex",
    name: "Perltex AG",
    website: "https://www.perltex-ag.ch",
    rolle: "C · Bedienbarkeit schlaegt Passung",
    handwerk: false,
    discoveryWhy:
      "Gegenprobe zur Bedienbarkeit: derselbe Betriebszustand wie im Zielgebiet, aber in der Schweiz — die Rechnungs- und Rechtslage dort klaert erst G35.",
    discoveryKind: "website",
    discoveryUrl: "https://www.perltex-ag.ch/",
    access: null,
    serviceable: false,
    person: {
      name: "Person C",
      role: "Geschaeftsfuehrer",
      sourceUrl: "https://www.perltex-ag.ch/",
      sourceKind: "website",
      relationship: "unbekannt",
    },
    evidence: [
      {
        kind: "signal",
        ref: "mehrere-standorte",
        claim:
          "Die Startseite nennt den Sitz Horwerstrasse 83 in 6005 Luzern und einen zweiten, gemeinsam gefuehrten Betrieb in Hergiswil (ehemals P. Hurschler AG).",
        sourceUrl: "https://www.perltex-ag.ch/",
        sourceKind: "website",
      },
      {
        kind: "signal",
        ref: "aussendienst",
        claim:
          "Bueroreinigung, Unterhalts- und Neubaureinigung sowie Glaspflege werden beim Kunden erbracht.",
        sourceUrl: "https://www.perltex-ag.ch/",
        sourceKind: "website",
      },
      {
        kind: "fact",
        ref: null,
        claim:
          "Dieselbe Seite nennt „rund 100 Mitarbeiterinnen und Mitarbeiter\" am Hauptstandort und an anderer Stelle „rund 80 Mitarbeitende\" ueber beide Standorte zusammen.",
        sourceUrl: "https://www.perltex-ag.ch/",
        sourceKind: "website",
      },
    ],
    erwartet: {
      passung: "passend",
      stopState: "zurueckgestellt",
      kontaktStand: "zugang-offen",
      gedeckt: false,
      warum:
        "Passend, belegte Person, und trotzdem Schluss: Wem creaDIG heute keine Rechnung stellen kann, den spricht es nicht an. Die Reihenfolge aus G10 haelt an einem echten Betrieb.",
    },
  },

  {
    key: "asa",
    name: "ASA Ambulanter Pflegedienst",
    website: "https://www.asa-pflege.de",
    rolle: "C/D · Bestandskunde, oeffentlich wiedergefunden",
    handwerk: false,
    bestandsdublette: true,
    discoveryWhy:
      "Oeffentliche Suche nach ambulanter Pflege in Osnabrueck. Der Treffer wurde vor dem Anlegen gegen den eigenen Bestand geprueft.",
    discoveryKind: "website",
    discoveryUrl: "https://www.asa-pflege.de/",
    access: "bestandskunde",
    serviceable: true,
    person: null,
    evidence: [
      {
        kind: "signal",
        ref: "aussendienst",
        claim:
          "Die Seite sagt, die Pflege werde in der Wohnung erbracht: Termine finden „im Buero oder auf Wunsch auch bei Ihnen zu Hause\" statt.",
        sourceUrl: "https://www.asa-pflege.de/",
        sourceKind: "website",
      },
      {
        kind: "fact",
        ref: null,
        claim:
          "Die Seite nennt die Anschrift Meller Landstrasse 50 in 49086 Osnabrueck und keine verantwortliche Person.",
        sourceUrl: "https://www.asa-pflege.de/",
        sourceKind: "website",
      },
    ],
    erwartet: {
      passung: "unklar",
      stopState: "beleg-fehlt",
      kontaktStand: "person-unbekannt",
      gedeckt: true,
      warum:
        "Ein bestehender Kunde, den die oeffentliche Recherche nicht als solchen erkannt haette — der Dublettenschutz erkennt ihn. Der Weg ist gedeckt, ein Mensch ist trotzdem nicht benannt.",
    },
  },
]
