// i18n-ready dictionary. DE ist primär, TR ist gleichwertig.
// Alle Inhalte sind echt. Keine erfundenen Zahlen, Zitate oder Auszeichnungen.

export type Locale = "de" | "tr"

export const WHATSAPP_NUMBER = "+41 76 504 58 79"
export const WHATSAPP_LINK =
  "https://wa.me/41765045879?text=" +
  encodeURIComponent("Guten Tag creaDIG, ich interessiere mich für ein Projekt.")

export const dictionary = {
  de: {
    /*
     * Verteiler-Startseite (PHASE A, Master-Prompt 4 §4).
     *
     * Die Startseite erklaert nicht mehr alles selbst. Jede Sektion reisst an
     * und fuehrt tiefer — grosse Website heisst nicht lange Homepage. Die
     * Texte hier sind Anreisser; die Ausfuehrung steht auf der Unterseite,
     * auf die verlinkt wird.
     */
    home: {
      statement: {
        eyebrow: "creaDIG in einem Satz",
        title: "Wir erfinden Systeme, bauen sie selbst und halten sie im Betrieb.",
        body: "Von der Marke über den digitalen Auftritt und den laufenden Betrieb bis zur Automatisierung und zur künstlichen Intelligenz. Fünf Ebenen, die aufeinander aufbauen — und vier eigene Produkte, an denen wir sie selbst erprobt haben.",
        cta: "Über das Unternehmen",
      },
      work: {
        eyebrow: "Ausgewählte Arbeiten",
        title: "Erst zeigen. Dann reden.",
        cta: "Alle Arbeiten",
      },
      capabilities: {
        eyebrow: "Leistungen",
        title: "Fünf Ebenen, ein Haus.",
        lead: "Jede Ebene trägt die nächste. Sie können auf jeder einsteigen — und auf jeder aufhören.",
        cta: "Alle Leistungen",
      },
      products: {
        cta: "Alle Produkte",
      },
      proof: {
        label: "Nachweisbar",
        cta: "Nachweise prüfen",
      },
      company: {
        eyebrow: "Das Unternehmen",
        title: "Osnabrück. Seit 2017.",
        body: "Sitz im ICO InnovationsCentrum, gegründet 2017, geführt von Muhammed Emin Akyol — mit einem spezialisierten Netzwerk im DACH-Raum.",
        cta: "Mehr über uns",
      },
      insights: {
        eyebrow: "Insights",
        title: "Notizen aus dem Bau.",
        cta: "Alle Notizen",
      },
    },
    /*
     * System-Notes (PHASE A — Geruest).
     *
     * `empty` ist der wichtigste Schluessel hier: Solange nichts
     * veroeffentlicht ist, sagt die Seite das in einem Satz — statt drei
     * erfundene Beispielartikel zu zeigen, die jeder als Fassade erkennt.
     */
    insightsPage: {
      eyebrow: "Insights",
      title: "Notizen aus dem Bau.",
      lead: "Kein Blog. Notizen aus dem Betrieb: warum eine Entscheidung so und nicht anders gefallen ist, was ein System im Alltag gelehrt hat, welche Annahme sich als falsch herausgestellt hat.",
      metaTitle: "Insights — System-Notes von creaDIG",
      metaDescription:
        "Notizen aus dem Bau eigener Systeme: Entscheidungen, Erfahrungen aus dem Betrieb und was sich als falsch herausgestellt hat.",
      emptyTitle: "Noch nichts veröffentlicht.",
      emptyBody:
        "Die erste Notiz steht noch aus. Wir schreiben hier erst, wenn ein System lange genug gelaufen ist, dass sich etwas daraus lernen lässt — bis dahin bleibt die Seite leer, statt sich mit Beispieltexten zu füllen.",
      emptyCtaProducts: "Was wir gebaut haben",
      emptyCtaWorks: "Zur Werkschau",
      readLabel: "Lesen",
    },
    /*
     * Kontaktseite (PHASE A, Master-Prompt 4 §7).
     *
     * Der Kontakt war bisher ein Formular plus „Termin in 20 Minuten". Das
     * bedient genau eine Absicht — die von jemandem, der schon entschieden
     * hat. Die drei anderen Absichten (erst schauen, erst pruefen, erst
     * fragen) hatten keinen Weg. Hier stehen alle vier.
     */
    kontaktPage: {
      eyebrow: "Kontakt",
      title: "Wählen Sie den Weg, der passt.",
      lead: "Nicht jede Anfrage beginnt mit einem Termin. Manche beginnen mit einem Blick auf das, was wir gebaut haben — auch das ist ein Weg zu uns. Beratung auf Deutsch und Türkisch.",
      metaTitle: "Kontakt — creaDIG Osnabrück",
      metaDescription:
        "creaDIG erreichen: per WhatsApp, E-Mail, kostenloser Erstberatung oder direkt über unsere Arbeiten. ICO InnovationsCentrum Osnabrück, Beratung auf Deutsch und Türkisch.",
      intentsLabel: "Womit möchten Sie anfangen?",
      intents: {
        talk: {
          name: "Projekt besprechen",
          what: "Schreiben Sie in eigenen Worten, worum es geht — per WhatsApp oder über das Formular unten.",
          cta: "Zum Formular",
        },
        appointment: {
          name: "Termin vereinbaren",
          what: "Zwanzig Minuten Erstgespräch, kostenlos und unverbindlich. Vier Schritte, dann steht die Anfrage.",
          cta: "Termin anfragen",
        },
        products: {
          name: "Produkte ansehen",
          what: "Vier eigene Systeme, die wir gebaut haben und selbst betreiben. Der schnellste Weg zu einem Urteil über uns.",
          cta: "Zu den Produkten",
        },
        works: {
          name: "Arbeiten ansehen",
          what: "Eigene Produkte und Kundenwerk, getrennt ausgewiesen. Ausführliche Fallbeschreibungen folgen mit den Freigaben.",
          cta: "Zur Werkschau",
        },
      },
      mailLabel: "E-Mail",
      mailNote: "Für Unterlagen, Angebote und alles Schriftliche.",
    },
    /*
     * Unternehmensseite (PHASE A).
     *
     * Sie buendelt, was bisher als „Ueber uns", Logo-Wand, Standort und
     * Zertifizierungen ueber die Startseite verteilt lag. Keine neue
     * Behauptung — dieselben Angaben, endlich an einem Ort mit eigener
     * Adresse. Die Ueberschrift ist die Haltung aus dem Entwurf R1.
     */
    unternehmenPage: {
      eyebrow: "Unternehmen",
      title: "Erfinden, bauen, betreiben.",
      lead: "creaDIG ist keine Agentur, die ein Projekt abliefert und verschwindet. Wir sind ein Haus, das eigene Produkte erfindet, sie selbst baut und im Betrieb hält — von der Marke über die Software bis zur künstlichen Intelligenz.",
      statement: "Was wir für Kunden entwickeln, betreiben wir für uns selbst. Diese Substanz unterscheidet ein System-Haus von einer Präsentation.",
      metaTitle: "Unternehmen — System-Haus aus Osnabrück, seit 2017",
      metaDescription:
        "creaDIG: System-Haus im ICO InnovationsCentrum Osnabrück, gegründet 2017. Gründer, Netzwerk, Schwerpunkte, Standort und nachprüfbare Zertifizierungen.",
    },
    /*
     * Arbeiten-Ebene (PHASE A): Werkschau als eigene Route + Detailseiten.
     *
     * Die Detailseiten tragen nur, was in `site-data` belegt ist. Eine tiefe
     * Case-Study (Ausgangslage -> Loesung -> Ergebnis) erscheint zusaetzlich,
     * sobald der Kunde sie freigegeben hat — vorher nicht.
     */
    arbeitenPage: {
      eyebrow: "Arbeiten",
      title: "Gebaut. Und betrieben.",
      lead: "Vier eigene Produkte, die wir selbst erfunden und gebaut haben — dazu Kundenwerk aus Deutschland und der Schweiz. Getrennt ausgewiesen, damit klar ist, was uns gehört.",
      metaTitle: "Arbeiten — eigene Produkte und Kundenwerk",
      metaDescription:
        "Die Werkschau von creaDIG: vier eigene Produkte und Kundenwerk aus Deutschland und der Schweiz. Getrennt ausgewiesen — eigene Systeme und Auftragsarbeit sind nicht dasselbe.",
    },
    arbeitPage: {
      breadcrumb: "Arbeiten",
      kindLabel: "Art",
      sectorLabel: "Branche",
      regionLabel: "Region",
      statusLabel: "Stand",
      builtLabel: "Was wir gebaut haben",
      whatLabel: "Worum es geht",
      backLabel: "Alle Arbeiten",
      /*
       * Steht auf jeder Kundenwerk-Seite, solange keine schriftliche Freigabe
       * fuer eine ausfuehrliche Fallbeschreibung vorliegt. Bewusst als Grund
       * formuliert, nicht als „demnaechst" — es ist eine Haltung, kein Rueckstand.
       */
      caseGatedNote:
        "Eine ausführliche Fallbeschreibung mit Ausgangslage, Lösung und Ergebnis veröffentlichen wir nur mit schriftlicher Freigabe des Kunden. Liegt sie vor, steht sie hier.",
      ctaTitle: "Ähnliche Ausgangslage in Ihrem Betrieb?",
      ctaBody: "Zwanzig Minuten, kostenlos und unverbindlich. Wir sehen uns den Betrieb an und sagen ehrlich, ob wir helfen können.",
      ctaPrimary: "Projekt starten",
      ctaSecondary: "Alle Arbeiten",
    },
    /*
     * Produkt-Ebene (PHASE A): Uebersicht + eine Seite je Produkt.
     *
     * Der staerkste Beweis des Hauses — keine Agentur baut eigene Software.
     * Alle Angaben kommen aus `site-data.productWorks`; hier stehen nur die
     * Beschriftungen drumherum.
     */
    produktePage: {
      eyebrow: "Produkte",
      title: "Vier Produkte, die wir selbst betreiben.",
      lead: "Keine Ankündigungen, keine Konzeptfolien. Jedes dieser Produkte hat creaDIG von Grund auf gebaut — und setzt es im eigenen Tagesgeschäft ein.",
      metaTitle: "Eigene Produkte — meAI, fibero, CASSAMEA, meahv",
      metaDescription:
        "Die vier eigenen Produkte von creaDIG: meAI (KI-Business-Betriebssystem), fibero (Glasfaser-Operations), CASSAMEA (Gastro-Kasse, Schweiz) und meahv (Hausverwaltung).",
      builtLabel: "Was wir gebaut haben",
      sectorLabel: "Sektor",
      statusLabel: "Stand",
      regionLabel: "Markt",
      openLabel: "Produkt ansehen",
      liveLabel: "Live öffnen",
      clientWorkTitle: "Was wir für andere gebaut haben.",
      clientWorkNote: "Ausdrücklich kein eigenes Produkt — Arbeiten für Auftraggeber.",
      clientWorkCta: "Zur Werkschau",
    },
    produktPage: {
      breadcrumb: "Produkte",
      builtLabel: "Was wir gebaut haben",
      blocksLabel: "Bausteine",
      blocksTitle: "Selbst gebaut, Baustein für Baustein.",
      sectorLabel: "Sektor",
      statusLabel: "Stand",
      regionLabel: "Markt",
      liveLabel: "Live öffnen",
      backLabel: "Alle Produkte",
      /* Einordnung: wo das Produkt im Haus steht und was dazu passt. */
      systemLabel: "Einordnung im System",
      systemBody:
        "Jedes eigene Produkt sitzt auf einer der fünf Ebenen — und dieselbe Ebene bieten wir als Leistung an. Was wir hier gebaut haben, bauen wir auch für Ihren Betrieb.",
      layerLabel: "Ebene",
      servicesLabel: "Passende Leistungen",
      layerCta: "Ebene ansehen",
      /*
       * Der Kontext-Block nennt, was im selben Feld unter demselben Dach
       * laeuft. Bewusst als Angabe formuliert, nicht als Herleitung: „daraus
       * ist das Produkt entstanden" hat niemand belegt.
       */
      houseContextLabel: "Im selben Haus",
      houseContextNote:
        "Wir bauen nicht nur für dieses Feld — wir arbeiten selbst darin. Das ist der Grund, warum wir die Fragen kennen, bevor sie gestellt werden.",
      /* Owner-Text, heute leer — die Sektion rendert dann gar nicht. */
      storyLabel: "Warum wir es gebaut haben",
      nextLabel: "Nächstes Produkt",
      prevLabel: "Vorheriges Produkt",
      /*
       * Steht NUR, solange keine echten Screenshots im Repo liegen. Es ist
       * kein Platzhalter fuer ein Bild — es ist die ehrliche Auskunft,
       * warum hier keins steht. Ein Deko-Laptop waere die Alternative, und
       * die ist gesperrt.
       */
      screensPending:
        "Oberflächen zeigen wir erst, wenn wir echte Aufnahmen aus dem laufenden System zeigen können. Bis dahin steht hier, was gebaut ist — und nicht ein Bild, das etwas anderes behauptet.",
      screensLabel: "Aus dem laufenden System",
      ctaTitle: "Passt das zu Ihrem Betrieb?",
      ctaBody: "Zwanzig Minuten, kostenlos und unverbindlich. Wir sehen uns den Betrieb an und sagen ehrlich, ob wir helfen können.",
      ctaPrimary: "Projekt starten",
      ctaSecondary: "Alle Produkte",
    },
    /*
     * Uebersichtsseite /leistungen (PHASE A).
     *
     * Sie erfindet nichts: Die fuenf Ebenen, der Ablauf, die Pakete und der
     * Foerderhinweis stehen alle schon im Woerterbuch. Neu ist nur, dass sie
     * eine eigene Adresse haben — die Startseite reisst an, hier steht es.
     */
    leistungenPage: {
      eyebrow: "Leistungen",
      title: "Fünf Ebenen, aufeinander gebaut.",
      lead: "Marke, Auftritt, Betrieb, Automatisierung, Intelligenz. Jede Ebene trägt die nächste — nicht nebeneinander, sondern als System. Was wir für unsere eigenen Produkte gebaut haben, bringen wir in Ihren Alltag.",
      metaTitle: "Leistungen — von der Marke bis zur KI",
      metaDescription:
        "Die fünf Ebenen von creaDIG: Marke, digitaler Auftritt, Operations, Automatisierung und KI. Für Handwerk und Mittelstand, Schwerpunkt Deutschland — auf Deutsch und Türkisch.",
      pricingLabel: "Preise",
      pricingNote:
        "Standard-Produkte sind transparent bepreist. Systementwicklung rechnen wir individuell ab — nach Umfang, nicht nach Stunden.",
    },
    nav: {
      home: "Startseite",
      leistungen: "Leistungen",
      produkte: "Produkte",
      arbeiten: "Arbeiten",
      unternehmen: "Unternehmen",
      insights: "Insights",
      ueber: "Über uns",
      pakete: "Pakete",
      kontakt: "Kontakt",
      zertifikate: "Zertifizierungen",
      cta: "Projekt starten",
      menu: "Menü öffnen",
      close: "Menü schließen",
      menuTitle: "Navigation",
      theme: "Erscheinungsbild wechseln",
      language: "Sprache wechseln",
    },
    hero: {
      eyebrow: "System-Haus · seit 2017 · Deutschland & Schweiz",
      headlineLine1: "Wir bauen,",
      headlineLine2: "was andere",
      headlineLine3: "nicht sehen.",
      /*
       * Glasklare Subline (§4.1): Vorher stand hier ein Markenbild („das Dach
       * ueber unseren Systemen"). Schoen — aber wer creaDIG nicht kennt, weiss
       * danach immer noch nicht, was gemacht wird. Der Satz nennt jetzt die
       * vier Dinge beim Namen; die Haltung traegt die Headline darueber.
       */
      subline:
        "creaDIG entwickelt Marken, digitale Systeme, Automatisierung und eigene Softwareprodukte — für Handwerk und Mittelstand in Deutschland.",
      ctaPrimary: "Projekt starten",
      ctaSecondary: "Unsere Arbeit",
      location: "Osnabrück · DE & CH",
      scroll: "Scrollen",
    },
    impact: {
      eyebrow: "Das Fundament",
      title: "Kein Konzept. Ein laufender Betrieb.",
      /*
       * VIS-5: getrennt nach zaehlbar und nicht zaehlbar. „Märkte" und
       * „Spannweite" haben deshalb ein eigenes `value` — einen Satzanfang,
       * keine Pseudo-Kennzahl wie vorher „DE / CH" und „A–Z".
       */
      figures: {
        since: { label: "Seit", detail: "Aus der Agentur zum System-Haus gewachsen." },
        products: { label: "Eigene Produkte", detail: "meAI, fibero, CASSAMEA, meahv — selbst gebaut." },
      },
      facts: {
        regions: {
          label: "Märkte",
          value: "Deutschland & Schweiz",
          detail: "Beraten und gebaut auf Deutsch und Türkisch.",
        },
        scope: {
          label: "Spannweite",
          value: "Von der Marke bis zur KI",
          detail: "Fünf Ebenen, ein Haus.",
        },
      },
      note: "Systeme im Tagesbetrieb — nicht in der Präsentation.",
    },
    logos: {
      eyebrow: "Ökosystem",
      title: "Was unter dem Dach läuft",
      ownProducts: "Eigene Produkte",
      clients: "Kunden",
      brands: "Marken in unserem Arbeitsumfeld",
      note: "Namensnennung dient allein der Einordnung unserer Arbeit. Freigaben stehen aus; eine Kunden-, Geschäfts- oder Partnerbeziehung wird damit nicht behauptet.",
    },
    portfolio: {
      eyebrow: "Werkschau",
      title: "Gebaut. Und betrieben.",
      lead: "Vier eigene Produkte, die wir selbst erfunden und gebaut haben — dazu Kundenwerk aus Deutschland und der Schweiz. Getrennt ausgewiesen, damit klar ist, was uns gehört.",
      built: "Was wir gebaut haben",
      products: "Eigene Produkte",
      productsNote: "Selbst erfunden, selbst gebaut, selbst betrieben.",
      clientWork: "Kundenwerk",
      clientWorkNote: "Dienstleistung für Auftraggeber — kein eigenes Produkt.",
      more: "Außerdem unter dem Dach",
      viewLive: "Live ansehen",
      mockupNote: "Abbildungen sind illustrative Mockups, keine Screenshots.",
      // Register-Ansicht (B2)
      viewLabel: "Ansicht",
      viewCards: "Karten",
      viewRegistry: "Register",
      colProject: "Projekt",
      colSector: "Branche",
      colRegion: "Region",
      registryNote: "Dieselben Projekte, dicht gelistet. Jahreszahlen ergänzen wir, sobald sie belegt sind — geschätzte Jahre stehen hier nicht.",
    },
    cases: {
      eyebrow: "Kundenfälle",
      title: "Was sich danach geändert hat.",
      lead: "Jeder Fall in derselben Reihenfolge: Ausgangslage, was wir gebaut haben, was daraus geworden ist. Nur mit schriftlicher Freigabe des Kunden — ohne Freigabe steht hier nichts.",
      problem: "Ausgangslage",
      solution: "Was wir gebaut haben",
      result: "Was daraus wurde",
    },
    reviews: {
      eyebrow: "Bewertungen",
      title: "Was Kunden geschrieben haben.",
      lead: "Im Originalwortlaut, mit Name und Datum. Wir übersetzen keine Bewertungen — ein übersetzter Satz ist ein Satz, den der Mensch so nie geschrieben hat.",
      verify: "Bei Google nachlesen",
      sourceGoogle: "Google-Bewertung",
      sourceClient: "Direkt an uns",
      ofFive: "von 5",
      countOne: "Bewertung",
      countMany: "Bewertungen",
    },
    faq: {
      eyebrow: "Häufige Fragen",
      title: "Was Interessenten zuerst fragen.",
      lead: "Sechs Fragen, die im Erstgespräch fast immer kommen — hier vorab beantwortet. Alle Antworten entsprechen dem, was auch am Telefon gesagt wird.",
      more: "Ihre Frage steht nicht dabei?",
      moreCta: "Direkt fragen",
      items: [
        {
          q: "Was kostet ein Auftritt bei creaDIG?",
          a: "Das Website-Paket kostet 2.400 € netto als Referenzpreis für die ersten zwei Betriebe, danach 3.900 € netto. Die laufende Betreuung kostet 149 € netto im Monat. Alle Preise zzgl. 19 % USt., Festpreis für den vereinbarten Umfang.",
        },
        {
          q: "Wie läuft ein Projekt ab?",
          a: "In drei Schritten: verstehen, bauen, betreiben. Wir sehen uns den Betrieb an, bauen das System und betreiben es anschließend weiter.",
        },
        {
          q: "Was ist meAI?",
          a: "meAI ist unser KI-Business-Betriebssystem — es bündelt Zahlen, Aufgaben und Dokumente und bereitet Entscheidungen vor. Live unter meai.run.",
        },
        {
          q: "Arbeiten Sie auch in der Schweiz?",
          a: "Ja. Unser Sitz ist das ICO InnovationsCentrum Osnabrück; die Schweiz betreuen wir als Markt. CASSAMEA ist speziell für die schweizerische Gastronomie gebaut.",
        },
        {
          q: "Sprechen Sie Türkisch?",
          a: "Ja. Beratung, Unterlagen und laufende Betreuung gibt es auf Deutsch und auf Türkisch — auf Wunsch komplett über WhatsApp.",
        },
      ],
    },
    servicePage: {
      breadcrumbHome: "Startseite",
      breadcrumbServices: "Leistungen",
      includesLabel: "Was dazugehört",
      forWhomLabel: "Für wen",
      layerLabel: "Ebene im System",
      processLabel: "So läuft es",
      packagesLabel: "In diesen Paketen enthalten",
      packagesCta: "Pakete und Preise ansehen",
      worksLabel: "Arbeiten dazu",
      worksCta: "Ganze Werkschau ansehen",
      ctaTitle: "Passt das zu Ihrem Betrieb?",
      ctaBody: "Zwanzig Minuten, kostenlos und unverbindlich. Wir sehen uns den Betrieb an und sagen ehrlich, ob wir helfen können.",
      ctaPrimary: "Kostenlose Erstberatung",
      ctaSecondary: "Per WhatsApp fragen",
    },
    services: {
      eyebrow: "Leistungen",
      title: "Fünf Ebenen. Ein System.",
      lead: "Wir arbeiten von A bis Z — vom ersten Logo bis zum eigenen KI-System. Jede Ebene baut auf der darunter auf.",
      forWhom: "Für wen",
      // Einstiegs-Chips ueber der Pyramide: die Vokabel, nach der gesucht wird.
      entryLabel: "Einstieg",
      layers: {
        identity: {
          name: "Identity",
          what: "Marke, Name, Logo, Auftritt — das Fundament, auf dem alles steht.",
          who: "Gründer, neue Betriebe, Handwerk vor dem ersten Auftritt.",
        },
        digital: {
          name: "Digital",
          what: "Website, Shop, Landingpages — sichtbar, schnell, auffindbar.",
          who: "Bäckerei, Praxis, Restaurant, Handwerksbetrieb.",
        },
        operations: {
          name: "Operations",
          what: "Kasse, Planung, Abrechnung, Verwaltung — der Betrieb im System.",
          who: "Gastronomie, Außendienst, Verwaltung, Dienstleister.",
        },
        automation: {
          name: "Automation",
          what: "Wiederkehrende Arbeit übernimmt das System, nicht der Mensch.",
          who: "Betriebe mit 6–20 Mitarbeitern und wachsendem Papierberg.",
        },
        intelligence: {
          name: "Intelligence · meAI",
          what: "Ein KI-System, das mitdenkt, vorbereitet und den Überblick behält.",
          who: "Etablierte Betriebe, die Entscheidungen schneller treffen wollen.",
        },
      },
    },
    /*
     * Produkt-Uebersicht (B3) — die vier eigenen Produkte gleichwertig,
     * bevor meAI als Flaggschiff seinen eigenen Deep-Dive bekommt.
     */
    houseProducts: {
      eyebrow: "Unter dem Dach",
      title: "Vier eigene Produkte.",
      lead: "Selbst erfunden, selbst gebaut, selbst betrieben. Hier stehen sie gleichwertig nebeneinander — der Deep-Dive zum Flaggschiff meAI folgt direkt darunter.",
      statusLabel: "Stand",
      openLabel: "Öffnen",
    },
    meai: {
      eyebrow: "Flagship · meai.run",
      title: "Ihr unsichtbarer Geschäftsführer.",
      lead: "meAI ist unser KI-Business-Betriebssystem. Es liest den Betrieb, bereitet Entscheidungen vor und hält zusammen, was sonst in Köpfen und Zetteln verteilt liegt.",
      dna: "Die seltene Doppel-DNA: Wir bauen das KI-System nicht nur — wir führen unseren eigenen Betrieb damit. Was meAI kann, ist an unserem eigenen Alltag erprobt, bevor es zu einem Kunden kommt.",
      cta: "meai.run öffnen",
      capabilities: {
        overview: {
          name: "Überblick",
          what: "Zahlen, Aufgaben und Termine an einem Ort, immer aktuell.",
        },
        tasks: {
          name: "Priorisierung",
          what: "Das System sagt, was heute zuerst dran ist — und warum.",
        },
        documents: {
          name: "Dokumente",
          what: "Rechnungen und Belege werden gelesen, sortiert und zugeordnet.",
        },
        decisions: {
          name: "Entscheidungen",
          what: "Vorbereitete Optionen statt leerer Tabellen.",
        },
      },
    },
    process: {
      eyebrow: "Wie wir arbeiten",
      title: "Verstehen. Bauen. Betreiben.",
      bridge: "creaDIG baut das System — das System betreibt sich — Sie behalten den Überblick.",
      steps: {
        understand: {
          name: "Verstehen",
          what: "Wir sehen uns den Betrieb an, bevor wir eine Zeile bauen. Wo geht Zeit verloren, was blockiert, was ist unsichtbar?",
        },
        build: {
          name: "Bauen",
          what: "Marke, Oberfläche, Logik, Automatisierung — als ein zusammenhängendes System, nicht als Sammlung von Werkzeugen.",
        },
        operate: {
          name: "Betreiben",
          what: "Wir übergeben nicht und verschwinden. Wir betreiben, überwachen und entwickeln weiter.",
        },
      },
      /*
       * Die vier operativen Schritte (B4). Die drei Schritte darueber sind
       * Haltung; das hier ist der Ablauf, den jemand erlebt, der heute
       * schreibt. Alle Angaben decken sich mit dem, was auch am Telefon
       * gesagt wird — inklusive der 24 Stunden.
       */
      opsEyebrow: "Vom ersten Kontakt an",
      opsSteps: {
        request: {
          name: "Anfrage",
          what: "Sie schreiben uns — per WhatsApp, über das Formular oder direkt mit einem Terminwunsch. Wir melden uns in der Regel innerhalb von 24 Stunden.",
        },
        analysis: {
          name: "Analyse",
          what: "Zwanzig Minuten Erstgespräch, kostenlos. Wir sehen uns den Betrieb an und sagen, was wir bauen würden — und was nicht.",
        },
        offer: {
          name: "Angebot",
          what: "Ein festes Angebot mit Umfang, Preis und Zeitrahmen. Keine Stundenzettel, keine Nachforderungen.",
        },
        operate: {
          name: "Betrieb",
          what: "Nach dem Start bleiben wir dran: betreiben, überwachen, weiterentwickeln — solange Sie wollen.",
        },
      },
    },
    about: {
      eyebrow: "Über uns",
      title: "Ein Haus, das wächst.",
      founderLabel: "Gründer",
      founder: "Muhammed Emin Akyol",
      body1:
        "creaDIG startete 2017 als Agentur. Aus Aufträgen wurden Produkte, aus Produkten ein System-Haus — heute laufen unter dem Dach vier eigene Systeme und die Betreuung der Betriebe, für die wir sie gebaut haben.",
      body2:
        "Wir arbeiten mit einem spezialisierten Netzwerk aus Entwicklern, Textern und Strategen im DACH-Raum. Das Team wächst; die nächsten Stellen sind in Vorbereitung.",
      nicheLabel: "Schwerpunkte",
      niches: [
        "Handwerk mit 6–20 Mitarbeitern — Schwerpunkt Deutschland",
        "Kleine und mittlere Betriebe ohne eigene IT-Abteilung",
        "Gastronomie in Deutschland und der Schweiz",
      ],
      /*
       * „Schwerpunkte" heisst Schwerpunkte, nicht Zulassungsbedingung. Ohne
       * diesen Satz liest eine Liste aus drei Branchen sich fuer jeden
       * vierten Betrieb wie eine Absage — und genau das ist sie nicht.
       */
      nicheOpen:
        "Das sind Schwerpunkte, keine Bedingungen. Wir arbeiten mit Unternehmen jeder Branche und Größe — auf Deutsch und auf Türkisch.",
      locationsLabel: "Sitz",
      marketsLabel: "Märkte",
      honesty:
        "Wir nennen keine erfundenen Mitarbeiter- oder Umsatzzahlen. Unser Beweis ist gebaute Arbeit.",
    },
    location: {
      eyebrow: "Unser Sitz",
      note: "Sie finden uns im InnovationsCentrum Osnabrück. Termine nach Vereinbarung — persönlich, per Video oder über WhatsApp.",
      mapLink: "Auf der Karte ansehen",
      photoAlt:
        "Das ICO InnovationsCentrum Osnabrück an der Albert-Einstein-Straße 1 — Sitz von creaDIG",
    },
    packages: {
      eyebrow: "Angebot",
      title: "Ihr erster Schritt mit creaDIG.",
      lead: "Ein Festpreis, offen benannt. Sie sehen vorher, was Sie zahlen — kein Riba, keine versteckten Posten.",
      forWhom: "Für wen",
      recommended: "Unsere Empfehlung",
      tierLabel: "Angebot",
      /*
       * Der Referenzpreis wird offen als solcher benannt — samt Regelpreis
       * daneben. Ein Nachlass, den der Kunde erst bei der zweiten Rechnung
       * bemerkt, ist kein Entgegenkommen, sondern eine Ueberraschung.
       */
      referenceNote:
        "Referenzpreis für die ersten zwei Betriebe — als Gegenleistung für ein Zitat, die Nennung als Referenz und zwei Fotos. Ab dem dritten Betrieb gilt der Regelpreis.",
      regularLabel: "Regelpreis",
      netNote: "Alle Preise netto, zzgl. 19 % USt.",
      retainerEyebrow: "Laufende Betreuung",
      retainerTitle: "Betrieb statt Uebergabe.",
      retainerFrom: "ab",
      retainerCta: "Betreuung anfragen",
      once: "einmalig · Festpreis",
      monthly: "/ Monat",
      items: {
        website: {
          name: "Website-Paket Handwerk",
          who: "Für Handwerksbetriebe und kleine Unternehmen",
          outcome: "In vier Wochen online — mit Anfragen und Bewerbungen",
          includes: [
            "Website, gebaut für Anfragen — nicht als Broschüre",
            "Karriere-Unterseite für Bewerber",
            "Google-Unternehmensprofil eingerichtet",
            "Anfrageformular, das wirklich zustellt",
            "Texte — geschrieben, nicht als Hausaufgabe zurückgegeben",
            "Fotoauswahl und Bildaufbereitung",
          ],
          note: "Festpreis für den vereinbarten Umfang. Fester Livetermin: vier Wochen ab Materialeingang. 50 % bei Start, 50 % bei Ihrer Freigabe. Seite und Zugänge gehören Ihnen ab Tag eins.",
          cta: "Projekt anfragen",
        },
      },
    },
    certs: {
      eyebrow: "Zertifizierungen & Mitgliedschaften",
      title: "Geprüft. Zugelassen. Eingetragen.",
      lead: "Vier Nachweise, die man nachschlagen kann. Keine selbst vergebenen Siegel, keine gekauften Auszeichnungen.",
      verify: "Zur offiziellen Stelle",
      note: "Alle Einträge sind bei den genannten Stellen überprüfbar.",
      items: {
        bafa: { label: "zugelassener Unternehmensberater des", note: "Berater-ID: #190949" },
        iuk: { label: "Mitglied beim", note: "" },
        avpq: { label: "eingetragen in das", note: "" },
        agd: { label: "Mitglied bei der", note: "" },
      },
    },
    contact: {
      eyebrow: "Kontakt",
      title: "In 20 Minuten unverbindlich.",
      lead: "Deutsch und Türkisch. Wählen Sie den Weg, der Ihnen am schnellsten passt.",
      nameLabel: "Name",
      namePlaceholder: "Ihr Name",
      businessLabel: "Betrieb",
      businessPlaceholder: "Firma oder Branche",
      messageLabel: "Worum geht es?",
      messagePlaceholder: "Kurz in eigenen Worten — ein bis zwei Sätze genügen.",
      errRequired: "Bitte Name und ein paar Worte zum Anliegen ergänzen.",
      submitWhatsapp: "Per WhatsApp senden",
      submitEmail: "Per E-Mail senden",
      whatsappTitle: "WhatsApp",
      whatsappNote: "Schnellste Antwort, DE & TR.",
      appointmentTitle: "Kostenlose Erstberatung",
      appointmentNote: "20 Minuten, per Video. Kostenlos und unverbindlich.",
      appointmentValue:
        "Wir sehen uns Ihren Betrieb an und sagen Ihnen, was wir bauen würden — und was nicht. Auch dann, wenn die Antwort „noch nicht“ lautet.",
      appointmentCta: "Termin anfragen",
      locationsLabel: "Sitz",
      marketsLabel: "Märkte",
      // Einwilligung vor der Uebergabe an WhatsApp/E-Mail (Art. 6 Abs. 1 lit. a DSGVO).
      privacyConsentPrefix: "Ich habe die",
      privacyConsentLink: "Datenschutzerklärung",
      privacyConsentSuffix:
        "gelesen und bin damit einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden.",
      errPrivacy: "Bitte bestätigen Sie die Datenschutzerklärung.",
      handoffNote:
        "Beim Absenden öffnet sich WhatsApp beziehungsweise Ihr E-Mail-Programm mit der fertigen Nachricht — versendet wird erst, wenn Sie es dort bestätigen.",
      /*
       * UX-2: Nach dem Klick stand bisher NICHTS. Wer einen Popup-Blocker
       * hatte, sah keinen Unterschied zwischen "hat funktioniert" und "ist
       * gar nichts passiert" — und wer WhatsApp geoeffnet bekam, konnte
       * glauben, die Anfrage sei damit raus. Beide Zustaende stehen jetzt
       * da, und der Erfolgstext sagt ausdruecklich, dass noch ein Schritt
       * fehlt. "Anfrage steht." waere hier eine Luege.
       */
      handoffTitle: "Fast geschafft — ein Schritt fehlt noch.",
      handoffWhatsapp:
        "WhatsApp ist mit Ihrer fertigen Nachricht geöffnet. Bei uns ist sie erst, wenn Sie dort auf Senden tippen.",
      handoffMail:
        "Ihr E-Mail-Programm ist mit der fertigen Nachricht geöffnet. Bei uns ist sie erst, wenn Sie dort auf Senden klicken.",
      handoffRetry: "Nichts passiert? Hier noch einmal öffnen.",
      errBlocked:
        "Ihr Browser hat das Fenster blockiert. Öffnen Sie WhatsApp bitte über den Link darunter — oder schreiben Sie direkt an",
    },
    /*
     * Abschluss-Band (B1) — der letzte Block vor dem Footer.
     * Die Seite endete bisher mitten im Kontaktformular; wer nicht ausfuellen
     * wollte, fiel in den Footer. Ein schmales Band fasst zusammen und laesst
     * genau zwei Wege offen: sprechen oder erst weiterschauen.
     */
    closing: {
      eyebrow: "Nächster Schritt",
      title: "Sie führen den Betrieb. Wir bauen das System dahinter.",
      lead: "Zwanzig Minuten, kostenlos und unverbindlich. Wir sehen uns den Betrieb an und sagen ehrlich, ob wir helfen können.",
      ctaPrimary: "Projekt starten",
      ctaSecondary: "Arbeiten ansehen",
    },
    termin: {
      back: "Zurück zur Seite",
      eyebrow: "Kostenlose Erstberatung",
      title: "In vier Schritten zum Gespräch.",
      lead: "Wunschtermin wählen, Angaben ergänzen — die Anfrage geht als fertige Nachricht an unser WhatsApp. Kein Konto, keine Wartezeit.",
      stepOf: "Schritt",
      next: "Weiter",
      prev: "Zurück",
      step1: {
        title: "Worum geht es?",
        lead: "Wählen Sie die Art des Gesprächs.",
        vgName: "Kostenlose Erstberatung",
        vgDesc: "20 Minuten, unverbindlich. Wir hören zu und sagen ehrlich, ob wir helfen können.",
        vgMeta: "kostenlos · 20 Min.",
        arName: "Systemgespräch",
        arDesc: "Tiefer Blick auf Operations, Automation und meAI — für Betriebe mit konkretem Vorhaben.",
        arMeta: "ausführlich · 45 Min.",
      },
      step2: {
        title: "Wunschtermin",
        lead: "Hervorgehobene Tage sind unsere bevorzugten Gesprächstage. Andere Tage sind auf Anfrage möglich.",
        timeTitle: "Uhrzeit",
        timeLead: "Alle Zeiten in MEZ.",
        preferred: "bevorzugt",
        today: "heute",
        errDate: "Bitte wählen Sie ein Datum.",
        errTime: "Bitte wählen Sie eine Uhrzeit.",
      },
      step3: {
        title: "Ihre Angaben",
        lead: "Pflichtfelder sind mit * markiert.",
        name: "Name",
        phone: "Telefon",
        email: "E-Mail",
        org: "Unternehmen",
        city: "Stadt / Region",
        interest: "Interesse",
        size: "Unternehmensgröße",
        note: "Nachricht",
        notePlaceholder: "Kurz in eigenen Worten — ein bis zwei Sätze genügen.",
        langLabel: "Sprache des Gesprächs",
        langDe: "Deutsch",
        langTr: "Türkisch",
        langBoth: "Deutsch + Türkisch",
        choose: "Bitte wählen",
        errRequired: "Bitte füllen Sie die Pflichtfelder korrekt aus.",
        errEmail: "Bitte eine gültige E-Mail-Adresse angeben.",
        interests: ["Website-Paket Handwerk", "Laufende Betreuung — 149 € / Monat", "Etwas anderes — Marke, Software oder Automatisierung", "Noch unklar"],
        sizes: ["1–4 Mitarbeiter", "5–15 Mitarbeiter", "16–30 Mitarbeiter", "über 30 Mitarbeiter"],
      },
      step4: {
        title: "Prüfen und senden",
        lead: "Wir öffnen WhatsApp mit einer fertig formulierten Nachricht. Sie senden sie selbst ab — nichts wird ohne Ihr Zutun verschickt.",
        send: "Per WhatsApp senden",
        typeLabel: "Terminart",
        dateLabel: "Wunschtermin",
        timeLabel: "Uhrzeit",
        langLabel: "Sprache",
      },
      done: {
        title: "Anfrage steht.",
        lead: "Sobald Sie die Nachricht in WhatsApp abgeschickt haben, melden wir uns — in der Regel innerhalb von 24 Stunden.",
        reply: "Antwort meist innerhalb von 24 Stunden",
        home: "Zurück zur Startseite",
        again: "Weiteren Termin anfragen",
      },
      waTitle: "creaDIG — Terminanfrage",
      waType: "Art",
      waDate: "Wunschtermin",
      waTime: "Uhrzeit",
      waName: "Name",
      waOrg: "Unternehmen",
      waCity: "Stadt",
      waPhone: "Telefon",
      waInterest: "Interesse",
      waSize: "Größe",
      waLang: "Sprache",
      waNote: "Nachricht",
      months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
      days: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
    },
    legal: {
      imprintTitle: "Impressum",
      privacyTitle: "Datenschutz",
      back: "Zurück zur Seite",
      providerLabel: "Anbieter (§ 5 DDG)",
      addressLabel: "Anschrift",
      sameAddress: "Anschrift wie oben",
      formalLabel: "Rechtliche Angaben",
      legalFormLabel: "Rechtsform",
      vatLabel: "Umsatzsteuer",
      smallBusinessNote:
        "Kleinunternehmer nach § 19 UStG — es wird keine Umsatzsteuer berechnet.",
      mstvLabel: "Verantwortlicher nach § 18 Abs. 2 MStV",
      placeholderMark: "Platzhalter — wird vor dem Livegang ersetzt",
      taxStatusPending: "Umsatzsteuer-Status noch nicht freigegeben.",
      phoneLabel: "Telefon",
      phonePending: "Deutsche Rufnummer folgt.",
      pending: "Noch zu bestätigen",
      pendingNote: "Zwei Angaben stehen noch aus und sind oben als Platzhalter gekennzeichnet: der Umsatzsteuer-Status (Identifikationsnummer nach § 27 a UStG oder Hinweis auf die Kleinunternehmerregelung nach § 19 UStG) und die deutsche Rufnummer. Beide ergänzen wir, sobald der Inhaber sie freigegeben hat. Anbieter, Anschrift, Rechtsform, Verantwortlicher nach § 18 Abs. 2 MStV und die Kontaktwege oben gelten bereits verbindlich.",
      responsible: "Verantwortlich für den Inhalt",
      contactLabel: "Kontakt",
      privacyIntro: "Diese Seite ist bewusst schlank gebaut: Wir setzen kein Tracking, keine Werbe-Cookies und keine Analyse-Dienste ein.",
      privacyPoints: [
        {
          title: "Server-Logs",
          body: "Beim Aufruf der Seite verarbeitet unser Hoster Vercel Inc. (USA) technisch notwendige Daten wie IP-Adresse, Zeitpunkt und aufgerufene Ressource. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO — ohne diese Verarbeitung lässt sich die Seite weder ausliefern noch gegen Missbrauch absichern. Mit Vercel besteht ein Vertrag über die Auftragsverarbeitung nach Art. 28 DSGVO.",
        },
        {
          title: "Hosting und Übermittlung in Drittländer",
          body: "Diese Seite ist vollständig statisch und wird über das weltweite Content-Delivery-Netz von Vercel ausgeliefert — jeweils vom nächstgelegenen Standort. Eine Verarbeitung von Zugriffsdaten außerhalb der EU, insbesondere in den USA, ist deshalb nicht ausgeschlossen. Abgesichert ist sie über den Auftragsverarbeitungsvertrag mit Vercel Inc. einschließlich der EU-Standardvertragsklauseln nach Art. 46 Abs. 2 lit. c DSGVO. Weitere Übermittlungen finden nicht statt: Wir binden keine Analyse-, Karten- oder Werbedienste ein und liefern alle Schriften lokal aus. Nutzen Sie den Kontaktweg über WhatsApp, gelten dafür zusätzlich die Bedingungen von Meta Platforms Ireland Ltd.",
        },
        {
          title: "Kontaktformular und Termin",
          body: "Ihre Angaben werden nicht auf unserem Server gespeichert. Sie werden ausschließlich im Browser zu einer WhatsApp-Nachricht zusammengesetzt, die Sie selbst absenden. Damit gelten für den Versand die Bedingungen von WhatsApp (Meta Platforms Ireland Ltd.).",
        },
        {
          title: "Schriften",
          body: "Poppins und JetBrains Mono werden zusammen mit der Seite lokal ausgeliefert. Es besteht keine Verbindung zu Google Fonts; Ihre IP-Adresse wird dafür an keinen Dritten übermittelt.",
        },
        {
          title: "Einwilligung und lokale Speicherung",
          body: "Ihre Entscheidung aus dem Einwilligungs-Banner speichern wir im lokalen Speicher Ihres Browsers (Schlüssel „creadig_consent“). Nur mit Ihrer Einwilligung merken wir uns zusätzlich die Sprachwahl und das Erscheinungsbild; ohne Einwilligung gelten diese Einstellungen nur für die laufende Sitzung. Es werden dabei keine Daten an Dritte übermittelt. Ihre Wahl können Sie jederzeit unter „Cookie-Einstellungen“ anpassen oder widerrufen — beim Widerruf entfernen wir die betroffenen Einträge sofort.",
        },
        {
          title: "Ihre Rechte",
          body: "Sie haben jederzeit das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Eine Nachricht an die unten genannte Adresse genügt. Unabhängig davon steht Ihnen das Recht zu, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO) — für unseren Sitz ist die Landesbeauftragte für den Datenschutz Niedersachsen zuständig.",
        },
      ],
      privacyNote: "Diese Fassung wird mit den vollständigen Firmendaten juristisch final geprüft.",
    },
    consent: {
      title: "Ihre Einwilligung",
      intro:
        "Diese Seite speichert nur, was sie zum Funktionieren braucht — und was Sie erlauben. Für alles, was nicht technisch notwendig ist, brauchen wir Ihre Einwilligung.",
      minors:
        "Sind Sie unter 16 Jahre alt, holen Sie bitte die Zustimmung Ihrer Erziehungsberechtigten ein, bevor Sie nicht notwendige Funktionen erlauben.",
      privacyPrefix: "Einzelheiten stehen in unserer",
      privacyLink: "Datenschutzerklärung",
      revoke:
        "Ihre Wahl können Sie jederzeit über „Cookie-Einstellungen“ im Footer anpassen oder widerrufen.",
      acceptAll: "Alle akzeptieren",
      essentialOnly: "Nur essenzielle akzeptieren",
      customize: "Individuelle Datenschutz-Präferenzen",
      save: "Auswahl speichern",
      alwaysActive: "Immer aktiv",
      notInUse: "Derzeit nicht im Einsatz",
      settingsLabel: "Cookie-Einstellungen",
      settingsTitle: "Datenschutz-Präferenzen",
      close: "Schließen",
      categories: {
        essential: {
          name: "Essenziell",
          body: "Speichert allein Ihre Entscheidung aus diesem Banner, damit wir nicht bei jedem Aufruf erneut fragen müssen. Ohne diese Speicherung funktioniert die Einwilligung selbst nicht.",
        },
        functional: {
          name: "Komfort",
          body: "Merkt sich Ihre Sprachwahl (Deutsch/Türkisch) und das Erscheinungsbild (hell/dunkel). Ohne Einwilligung gilt Ihre Wahl nur für die laufende Sitzung.",
        },
        statistics: {
          name: "Reichweitenmessung",
          body: "Wir setzen derzeit keinen Analyse- oder Tracking-Dienst ein. Ihre Entscheidung wird gespeichert und gilt, falls sich das künftig ändert.",
        },
      },
    },
    footer: {
      tagline: "System-Haus für Marke, Web, Operations, Automation und KI.",
      productsLabel: "Produkte",
      navLabel: "Seite",
      legalLabel: "Rechtliches",
      imprint: "Impressum",
      privacy: "Datenschutz",
      socialLabel: "Social",
      rights: "Alle Rechte vorbehalten.",
    },
  },

  tr: {
    home: {
      statement: {
        eyebrow: "Tek cümlede creaDIG",
        title: "Sistemleri biz icat eder, kendimiz kurar ve işler hâlde tutarız.",
        body: "Markadan dijital görünüme, günlük işletmeden otomasyona ve yapay zekâya kadar. Üst üste kurulan beş katman — ve bunları kendimiz üzerinde denediğimiz dört kendi ürün.",
        cta: "Şirket hakkında",
      },
      work: {
        eyebrow: "Seçilmiş işler",
        title: "Önce göster. Sonra konuş.",
        cta: "Tüm işler",
      },
      capabilities: {
        eyebrow: "Hizmetler",
        title: "Beş katman, tek çatı.",
        lead: "Her katman bir sonrakini taşır. İstediğiniz katmanda başlayabilir, istediğiniz katmanda durabilirsiniz.",
        cta: "Tüm hizmetler",
      },
      products: {
        cta: "Tüm ürünler",
      },
      proof: {
        label: "Doğrulanabilir",
        cta: "Belgeleri gör",
      },
      company: {
        eyebrow: "Şirket",
        title: "Osnabrück. 2017'den beri.",
        body: "Merkez ICO InnovationsCentrum, 2017'de kuruldu, Muhammed Emin Akyol yönetiminde — DACH bölgesinde uzman bir ağla birlikte.",
        cta: "Hakkımızda daha fazlası",
      },
      insights: {
        eyebrow: "Insights",
        title: "Kurma sürecinden notlar.",
        cta: "Tüm notlar",
      },
    },
    insightsPage: {
      eyebrow: "Insights",
      title: "Kurma sürecinden notlar.",
      lead: "Blog değil. İşletmeden notlar: bir kararın neden böyle alındığı, bir sistemin günlük kullanımda ne öğrettiği, hangi varsayımın yanlış çıktığı.",
      metaTitle: "Insights — creaDIG sistem notları",
      metaDescription:
        "Kendi sistemlerimizi kurarken tutulan notlar: kararlar, işletme deneyimleri ve yanlış çıkan varsayımlar.",
      emptyTitle: "Henüz bir yazı yok.",
      emptyBody:
        "İlk not henüz yazılmadı. Buraya ancak bir sistem, kendisinden bir şey öğrenilecek kadar uzun süre çalıştığında yazarız — o zamana kadar sayfa örnek metinlerle dolmak yerine boş kalır.",
      emptyCtaProducts: "Ne inşa ettik",
      emptyCtaWorks: "Seçkiye git",
      readLabel: "Oku",
    },
    kontaktPage: {
      eyebrow: "İletişim",
      title: "Size uyan yolu seçin.",
      lead: "Her başvuru bir randevuyla başlamaz. Bazıları neyi kurduğumuza bakmakla başlar — o da bize giden bir yoldur. Danışmanlık Almanca ve Türkçe.",
      metaTitle: "İletişim — creaDIG Osnabrück",
      metaDescription:
        "creaDIG'e ulaşın: WhatsApp, e-posta, ücretsiz ilk görüşme veya doğrudan işlerimiz üzerinden. ICO InnovationsCentrum Osnabrück, Almanca ve Türkçe danışmanlık.",
      intentsLabel: "Neyle başlamak istersiniz?",
      intents: {
        talk: {
          name: "Projeyi konuşmak",
          what: "Konuyu kendi cümlelerinizle yazın — WhatsApp'tan veya aşağıdaki formdan.",
          cta: "Forma git",
        },
        appointment: {
          name: "Randevu almak",
          what: "Yirmi dakikalık ilk görüşme, ücretsiz ve bağlayıcı değil. Dört adım, sonra talep hazır.",
          cta: "Randevu iste",
        },
        products: {
          name: "Ürünlere bakmak",
          what: "Kurduğumuz ve kendimiz işlettiğimiz dört sistem. Hakkımızda karar vermenin en hızlı yolu.",
          cta: "Ürünlere git",
        },
        works: {
          name: "İşlere bakmak",
          what: "Kendi ürünlerimiz ve müşteri işleri, ayrı gösterilir. Ayrıntılı vaka anlatımları onaylarla birlikte gelir.",
          cta: "Seçkiye git",
        },
      },
      mailLabel: "E-posta",
      mailNote: "Belgeler, teklifler ve yazılı her şey için.",
    },
    unternehmenPage: {
      eyebrow: "Şirket",
      title: "İcat etmek, kurmak, işletmek.",
      lead: "creaDIG, bir projeyi teslim edip kaybolan bir ajans değildir. Kendi ürünlerini icat eden, onları kendi kuran ve işler hâlde tutan bir evdir — markadan yazılıma, yazılımdan yapay zekâya.",
      statement: "Müşteriler için geliştirdiğimizi kendimiz için de işletiriz. Bir sistem evini bir sunumdan ayıran şey bu sağlamlıktır.",
      metaTitle: "Şirket — Osnabrück'ten sistem evi, 2017'den beri",
      metaDescription:
        "creaDIG: Osnabrück ICO InnovationsCentrum'da sistem evi, 2017'de kuruldu. Kurucu, ağ, odak alanları, merkez ve doğrulanabilir sertifikalar.",
    },
    arbeitenPage: {
      eyebrow: "İşler",
      title: "Kuruldu. Ve işletiliyor.",
      lead: "Kendi icat edip kurduğumuz dört ürün — ayrıca Almanya ve İsviçre'den müşteri işleri. Neyin bize ait olduğu açık olsun diye ayrı gösteriliyor.",
      metaTitle: "İşler — kendi ürünlerimiz ve müşteri işleri",
      metaDescription:
        "creaDIG seçkisi: dört kendi ürün ve Almanya ile İsviçre'den müşteri işleri. Ayrı gösterilir — kendi sistemlerimiz ile sipariş işleri aynı şey değildir.",
    },
    arbeitPage: {
      breadcrumb: "İşler",
      kindLabel: "Tür",
      sectorLabel: "Sektör",
      regionLabel: "Bölge",
      statusLabel: "Durum",
      builtLabel: "Ne inşa ettik",
      whatLabel: "Konu ne",
      backLabel: "Tüm işler",
      caseGatedNote:
        "Başlangıç durumu, çözüm ve sonucu içeren ayrıntılı bir vaka anlatımını yalnızca müşterinin yazılı onayıyla yayımlarız. Onay geldiğinde burada yer alır.",
      ctaTitle: "İşletmenizde de benzer bir durum mu var?",
      ctaBody: "Yirmi dakika, ücretsiz ve bağlayıcı değil. İşletmenize bakar ve yardımcı olup olamayacağımızı dürüstçe söyleriz.",
      ctaPrimary: "Projeye başla",
      ctaSecondary: "Tüm işler",
    },
    produktePage: {
      eyebrow: "Ürünler",
      title: "Kendi işlettiğimiz dört ürün.",
      lead: "Duyuru yok, konsept slaytı yok. Bu ürünlerin her birini creaDIG sıfırdan kurdu — ve kendi günlük işinde kullanıyor.",
      metaTitle: "Kendi ürünlerimiz — meAI, fibero, CASSAMEA, meahv",
      metaDescription:
        "creaDIG'in dört kendi ürünü: meAI (yapay zekâ tabanlı iş işletim sistemi), fibero (fiber operasyonu), CASSAMEA (İsviçre için gastronomi kasası) ve meahv (bina yönetimi).",
      builtLabel: "Ne inşa ettik",
      sectorLabel: "Sektör",
      statusLabel: "Durum",
      regionLabel: "Pazar",
      openLabel: "Ürünü gör",
      liveLabel: "Canlı aç",
      clientWorkTitle: "Başkaları için ne inşa ettik.",
      clientWorkNote: "Açıkça kendi ürünümüz değil — iş verenler için yapılan işler.",
      clientWorkCta: "Seçkiye git",
    },
    produktPage: {
      breadcrumb: "Ürünler",
      builtLabel: "Ne inşa ettik",
      blocksLabel: "Yapı taşları",
      blocksTitle: "Taş taş, kendimiz kurduk.",
      sectorLabel: "Sektör",
      statusLabel: "Durum",
      regionLabel: "Pazar",
      liveLabel: "Canlı aç",
      backLabel: "Tüm ürünler",
      systemLabel: "Sistemdeki yeri",
      systemBody:
        "Kendi ürünlerimizin her biri beş katmandan birinde durur — ve aynı katmanı hizmet olarak da sunarız. Burada kurduğumuzu sizin işletmeniz için de kurarız.",
      layerLabel: "Katman",
      servicesLabel: "İlgili hizmetler",
      layerCta: "Katmanı gör",
      houseContextLabel: "Aynı çatı altında",
      houseContextNote:
        "Bu alan için yalnızca kurmuyoruz — kendimiz de içinde çalışıyoruz. Soruları sorulmadan bilmemizin sebebi bu.",
      storyLabel: "Neden kurduk",
      nextLabel: "Sonraki ürün",
      prevLabel: "Önceki ürün",
      screensPending:
        "Arayüzleri ancak çalışan sistemden gerçek görüntüler gösterebildiğimizde paylaşırız. O zamana kadar burada ne kurulduğu yazar — başka bir şey iddia eden bir görsel değil.",
      screensLabel: "Çalışan sistemden",
      ctaTitle: "Bu sizin işletmenize uyar mı?",
      ctaBody: "Yirmi dakika, ücretsiz ve bağlayıcı değil. İşletmenize bakar ve yardımcı olup olamayacağımızı dürüstçe söyleriz.",
      ctaPrimary: "Projeye başla",
      ctaSecondary: "Tüm ürünler",
    },
    leistungenPage: {
      eyebrow: "Hizmetler",
      title: "Beş katman, üst üste kuruldu.",
      lead: "Marka, dijital görünüm, operasyon, otomasyon, zekâ. Her katman bir sonrakini taşır — yan yana değil, bir sistem olarak. Kendi ürünlerimiz için kurduğumuzu sizin günlük işinize taşırız.",
      metaTitle: "Hizmetler — markadan yapay zekâya",
      metaDescription:
        "creaDIG'in beş katmanı: marka, dijital görünüm, operasyon, otomasyon ve yapay zekâ. Almanya ve İsviçre'deki küçük ve orta ölçekli işletmeler için — Almanca ve Türkçe.",
      pricingLabel: "Fiyatlar",
      pricingNote:
        "Standart ürünlerin fiyatı şeffaftır. Sistem geliştirmeyi kapsama göre ayrıca hesaplarız — saate göre değil.",
    },
    nav: {
      home: "Ana sayfa",
      leistungen: "Hizmetler",
      produkte: "Ürünler",
      arbeiten: "İşler",
      unternehmen: "Şirket",
      insights: "Insights",
      ueber: "Hakkımızda",
      pakete: "Paketler",
      kontakt: "İletişim",
      zertifikate: "Sertifikalar",
      cta: "Projeye başla",
      menu: "Menüyü aç",
      close: "Menüyü kapat",
      menuTitle: "Gezinme",
      theme: "Görünümü değiştir",
      language: "Dili değiştir",
    },
    hero: {
      eyebrow: "Sistem evi · 2017'den beri · Almanya & İsviçre",
      headlineLine1: "Başkalarının",
      headlineLine2: "görmediğini",
      headlineLine3: "inşa ediyoruz.",
      subline:
        "creaDIG; Almanya'daki zanaat işletmeleri ve KOBİ'ler için marka, dijital sistemler, otomasyon ve kendi yazılım ürünlerini geliştirir.",
      ctaPrimary: "Projeye başla",
      ctaSecondary: "İşlerimiz",
      location: "Osnabrück · DE & CH",
      scroll: "Kaydır",
    },
    impact: {
      eyebrow: "Temel",
      title: "Konsept değil. İşleyen bir yapı.",
      figures: {
        since: { label: "Beri", detail: "Ajanstan sistem evine büyüdük." },
        products: { label: "Kendi ürünlerimiz", detail: "meAI, fibero, CASSAMEA, meahv — kendimiz kurduk." },
      },
      facts: {
        regions: {
          label: "Pazarlar",
          value: "Almanya ve İsviçre",
          detail: "Almanca ve Türkçe danışıyor ve kuruyoruz.",
        },
        scope: {
          label: "Kapsam",
          value: "Markadan yapay zekâya",
          detail: "Beş katman, tek çatı.",
        },
      },
      note: "Sistemler günlük kullanımda — sunumda değil.",
    },
    logos: {
      eyebrow: "Ekosistem",
      title: "Çatının altında ne var",
      ownProducts: "Kendi ürünlerimiz",
      clients: "Müşteriler",
      brands: "Çalışma çevremizdeki markalar",
      note: "İsimler yalnızca çalışmamızı konumlandırmak için anılmıştır. Onaylar beklemededir; bu bir müşteri, iş veya ortaklık ilişkisi iddiası değildir.",
    },
    portfolio: {
      eyebrow: "Seçki",
      title: "Kuruldu. Ve işletiliyor.",
      lead: "Kendi icat edip kurduğumuz dört ürün — ayrıca Almanya ve İsviçre'den müşteri işleri. Neyin bize ait olduğu açık olsun diye ayrı gösteriliyor.",
      built: "Ne inşa ettik",
      products: "Kendi ürünlerimiz",
      productsNote: "Kendimiz icat ettik, kendimiz kurduk, kendimiz işletiyoruz.",
      clientWork: "Müşteri işleri",
      clientWorkNote: "İş verenler için hizmet — kendi ürünümüz değil.",
      more: "Çatı altında ayrıca",
      viewLive: "Canlı gör",
      mockupNote: "Görseller açıklayıcı maketlerdir, ekran görüntüsü değildir.",
      viewLabel: "Görünüm",
      viewCards: "Kartlar",
      viewRegistry: "Sicil",
      colProject: "Proje",
      colSector: "Sektör",
      colRegion: "Bölge",
      registryNote: "Aynı projeler, sıkı bir liste hâlinde. Yıl bilgilerini belgelendiğinde ekleriz — tahmini yıllar burada yer almaz.",
    },
    cases: {
      eyebrow: "Müşteri örnekleri",
      title: "Sonrasında ne değişti.",
      lead: "Her örnek aynı sırayla: başlangıç durumu, ne inşa ettiğimiz, ortaya ne çıktığı. Yalnızca müşterinin yazılı onayıyla — onay yoksa burada bir şey yazmaz.",
      problem: "Başlangıç durumu",
      solution: "Ne inşa ettik",
      result: "Ortaya ne çıktı",
    },
    reviews: {
      eyebrow: "Değerlendirmeler",
      title: "Müşteriler ne yazdı.",
      lead: "Özgün haliyle, isim ve tarihle. Değerlendirmeleri çevirmiyoruz — çevrilmiş bir cümle, o kişinin hiç yazmadığı bir cümledir.",
      verify: "Google'da oku",
      sourceGoogle: "Google değerlendirmesi",
      sourceClient: "Doğrudan bize",
      ofFive: "/ 5",
      countOne: "değerlendirme",
      countMany: "değerlendirme",
    },
    faq: {
      eyebrow: "Sık sorulan sorular",
      title: "İlgilenenlerin ilk sorduğu şeyler.",
      lead: "İlk görüşmede neredeyse her zaman gelen altı soru — burada önceden yanıtlandı. Tüm yanıtlar telefonda söylenenle aynıdır.",
      more: "Sorunuz burada yok mu?",
      moreCta: "Doğrudan sorun",
      items: [
        {
          q: "creaDIG ile bir kimlik ne kadar?",
          a: "Web sitesi paketi, ilk iki işletme için referans fiyatı olarak 2.400 € net, sonrasında 3.900 € nettir. Sürekli destek aylık 149 € nettir. Tüm fiyatlar %19 KDV hariçtir; kararlaştırılan kapsam için sabit fiyattır.",
        },
        {
          q: "Proje nasıl ilerler?",
          a: "Üç adımda: anlamak, kurmak, işletmek. İşletmeye bakar, sistemi kurar ve ardından işletmeye devam ederiz.",
        },
        {
          q: "meAI nedir?",
          a: "meAI, yapay zekâ tabanlı iş işletim sistemimizdir — sayıları, görevleri ve belgeleri toplar, kararları hazırlar. meai.run adresinde canlı.",
        },
        {
          q: "İsviçre'de de çalışıyor musunuz?",
          a: "Evet. Merkezimiz Osnabrück'teki ICO InnovationsCentrum; İsviçre'ye pazar olarak hizmet veriyoruz. CASSAMEA özellikle İsviçre gastronomisi için kuruldu.",
        },
        {
          q: "Türkçe konuşuyor musunuz?",
          a: "Evet. Danışmanlık, belgeler ve sürekli destek Almanca ve Türkçe verilir — istenirse tamamen WhatsApp üzerinden.",
        },
      ],
    },
    servicePage: {
      breadcrumbHome: "Ana sayfa",
      breadcrumbServices: "Hizmetler",
      includesLabel: "Neler dahil",
      forWhomLabel: "Kimler için",
      layerLabel: "Sistemdeki kademe",
      processLabel: "Nasıl ilerler",
      packagesLabel: "Şu paketlere dahil",
      packagesCta: "Paketleri ve fiyatları gör",
      worksLabel: "İlgili işler",
      worksCta: "Tüm seçkiyi gör",
      ctaTitle: "İşletmenize uygun mu?",
      ctaBody: "Yirmi dakika, ücretsiz ve bağlayıcı değil. İşletmeye bakar ve yardımcı olabilir miyiz, dürüstçe söyleriz.",
      ctaPrimary: "Ücretsiz ilk görüşme",
      ctaSecondary: "WhatsApp'tan sorun",
    },
    services: {
      eyebrow: "Hizmetler",
      title: "Beş katman. Tek sistem.",
      lead: "A'dan Z'ye çalışıyoruz — ilk logodan kendi yapay zekâ sistemine kadar. Her katman altındakinin üzerine kurulur.",
      forWhom: "Kimler için",
      entryLabel: "Başlangıç",
      layers: {
        identity: {
          name: "Identity",
          what: "Marka, isim, logo, görünüm — her şeyin durduğu temel.",
          who: "Girişimciler, yeni işletmeler, ilk kimliğini arayan esnaf.",
        },
        digital: {
          name: "Digital",
          what: "Web sitesi, mağaza, açılış sayfaları — görünür, hızlı, bulunabilir.",
          who: "Fırın, klinik, restoran, esnaf işletmesi.",
        },
        operations: {
          name: "Operations",
          what: "Kasa, planlama, faturalama, yönetim — işleyiş sistem içinde.",
          who: "Gastronomi, saha ekipleri, yönetim, hizmet sağlayıcılar.",
        },
        automation: {
          name: "Automation",
          what: "Tekrar eden işi insan değil, sistem üstlenir.",
          who: "6–20 çalışanı ve büyüyen evrak yükü olan işletmeler.",
        },
        intelligence: {
          name: "Intelligence · meAI",
          what: "Düşünen, hazırlayan ve genel görünümü koruyan bir yapay zekâ sistemi.",
          who: "Daha hızlı karar almak isteyen yerleşik işletmeler.",
        },
      },
    },
    houseProducts: {
      eyebrow: "Çatının altında",
      title: "Dört kendi ürünümüz.",
      lead: "Kendimiz icat ettik, kendimiz kurduk, kendimiz işletiyoruz. Burada eşit ağırlıkta yan yana duruyorlar — amiral gemisi meAI'ın ayrıntılı bölümü hemen aşağıda.",
      statusLabel: "Durum",
      openLabel: "Aç",
    },
    meai: {
      eyebrow: "Amiral gemisi · meai.run",
      title: "Görünmeyen genel müdürünüz.",
      lead: "meAI, yapay zekâ tabanlı iş işletim sistemimizdir. İşletmeyi okur, kararları hazırlar ve kafalarda ile kâğıtlarda dağılan her şeyi bir arada tutar.",
      dna: "Ender bir çifte DNA: Yapay zekâ sistemini yalnızca kurmuyoruz — kendi işletmemizi onunla yönetiyoruz. meAI'ın yaptığı her şey, bir müşteriye gitmeden önce kendi günlük işimizde sınanıyor.",
      cta: "meai.run'ı aç",
      capabilities: {
        overview: {
          name: "Genel görünüm",
          what: "Sayılar, görevler ve randevular tek yerde, her zaman güncel.",
        },
        tasks: {
          name: "Önceliklendirme",
          what: "Sistem bugün önce neyin yapılacağını söyler — ve nedenini.",
        },
        documents: {
          name: "Belgeler",
          what: "Faturalar ve fişler okunur, sıralanır ve eşleştirilir.",
        },
        decisions: {
          name: "Kararlar",
          what: "Boş tablolar yerine hazırlanmış seçenekler.",
        },
      },
    },
    process: {
      eyebrow: "Nasıl çalışıyoruz",
      title: "Anlamak. Kurmak. İşletmek.",
      bridge: "creaDIG sistemi kurar — sistem kendini işletir — siz genel görünümü korursunuz.",
      steps: {
        understand: {
          name: "Anlamak",
          what: "Tek satır yazmadan önce işletmeye bakıyoruz. Zaman nerede kayboluyor, ne tıkanıyor, ne görünmüyor?",
        },
        build: {
          name: "Kurmak",
          what: "Marka, arayüz, mantık, otomasyon — araç yığını değil, bütünlüklü tek sistem.",
        },
        operate: {
          name: "İşletmek",
          what: "Teslim edip kaybolmuyoruz. İşletiyor, izliyor ve geliştirmeye devam ediyoruz.",
        },
      },
      opsEyebrow: "İlk temastan itibaren",
      opsSteps: {
        request: {
          name: "Talep",
          what: "Bize yazarsınız — WhatsApp'tan, form üzerinden ya da doğrudan bir randevu talebiyle. Genellikle 24 saat içinde döneriz.",
        },
        analysis: {
          name: "Analiz",
          what: "Yirmi dakikalık ilk görüşme, ücretsiz. İşletmeye bakar; neyi kurardık, neyi kurmazdık açıkça söyleriz.",
        },
        offer: {
          name: "Teklif",
          what: "Kapsamı, fiyatı ve süresi belli sabit bir teklif. Saat çizelgesi yok, sonradan ek talep yok.",
        },
        operate: {
          name: "İşletme",
          what: "Başlangıçtan sonra da yanınızdayız: işletir, izler, geliştiririz — siz istediğiniz sürece.",
        },
      },
    },
    about: {
      eyebrow: "Hakkımızda",
      title: "Büyüyen bir çatı.",
      founderLabel: "Kurucu",
      founder: "Muhammed Emin Akyol",
      body1:
        "creaDIG 2017'de ajans olarak başladı. İşlerden ürünler, ürünlerden bir sistem evi doğdu — bugün bu çatı altında dört kendi sistemimiz ve onları kurduğumuz işletmelerin bakımı yürüyor.",
      body2:
        "DACH bölgesinde geliştirici, metin yazarı ve stratejistlerden oluşan uzman bir ağ ile çalışıyoruz. Ekip büyüyor; yeni pozisyonlar hazırlanıyor.",
      nicheLabel: "Odak alanları",
      niches: [
        "6–20 çalışanlı zanaat işletmeleri — ağırlıkla Almanya",
        "Kendi BT birimi olmayan küçük ve orta ölçekli işletmeler",
        "Almanya ve İsviçre'de gastronomi",
      ],
      nicheOpen:
        "Bunlar ağırlık noktalarımız, koşul değil. Her sektörden ve her büyüklükten işletmeyle çalışıyoruz — Almanca ve Türkçe.",
      locationsLabel: "Merkez",
      marketsLabel: "Pazarlar",
      honesty: "Uydurma çalışan veya ciro sayıları vermiyoruz. Kanıtımız yaptığımız işlerdir.",
    },
    location: {
      eyebrow: "Merkezimiz",
      note: "Bizi Osnabrück InnovationsCentrum'da bulabilirsiniz. Randevular önceden anlaşmayla — yüz yüze, görüntülü ya da WhatsApp üzerinden.",
      mapLink: "Haritada görüntüle",
      photoAlt:
        "Albert-Einstein-Straße 1'deki ICO InnovationsCentrum Osnabrück — creaDIG'in merkezi",
    },
    packages: {
      eyebrow: "Teklif",
      title: "creaDIG ile ilk adımınız.",
      lead: "Açıkça belirtilmiş tek bir sabit fiyat. Ne ödeyeceğinizi önceden görürsünüz — riba yok, gizli kalem yok.",
      forWhom: "Kimler için",
      recommended: "Önerimiz",
      tierLabel: "Teklif",
      referenceNote:
        "İlk iki işletme için referans fiyatı — karşılığında bir görüş cümlesi, referans olarak anılma ve iki fotoğraf. Üçüncü işletmeden itibaren normal fiyat geçerlidir.",
      regularLabel: "Normal fiyat",
      netNote: "Tüm fiyatlar nettir, %19 KDV hariç.",
      retainerEyebrow: "Sürekli destek",
      retainerTitle: "Teslim değil, işletme.",
      retainerFrom: "aylık",
      retainerCta: "Destek talep et",
      once: "tek seferlik · sabit fiyat",
      monthly: "/ ay",
      items: {
        website: {
          name: "Zanaat Web Sitesi Paketi",
          who: "Zanaat işletmeleri ve küçük şirketler için",
          outcome: "Dört haftada yayında — talepler ve başvurularla",
          includes: [
            "Broşür değil, talep getirsin diye kurulan web sitesi",
            "Başvuru sahipleri için kariyer alt sayfası",
            "Google işletme profili kurulumu",
            "Gerçekten ulaşan talep formu",
            "Metinler — size ödev olarak geri verilmez, biz yazarız",
            "Fotoğraf seçimi ve görsel hazırlığı",
          ],
          note: "Kararlaştırılan kapsam için sabit fiyat. Sabit yayın tarihi: malzeme ulaştıktan sonra dört hafta. Başlangıçta %50, onayınızda %50. Site ve tüm erişimler ilk günden itibaren sizindir.",
          cta: "Proje talebi gönder",
        },
      },
    },
    certs: {
      eyebrow: "Sertifikalar & üyelikler",
      title: "Denetlenmiş. Yetkili. Kayıtlı.",
      lead: "Doğrulanabilir dört belge. Kendi verdiğimiz rozetler yok, satın alınmış ödüller yok.",
      verify: "Resmî kuruma git",
      note: "Tüm kayıtlar adı geçen kurumlardan doğrulanabilir.",
      items: {
        bafa: { label: "Onaylı danışmanı olduğumuz kurum", note: "Danışman kimliği: #190949" },
        iuk: { label: "Üyesi olduğumuz ağ", note: "" },
        avpq: { label: "Kayıtlı olduğumuz resmî sicil", note: "" },
        agd: { label: "Üyesi olduğumuz birlik", note: "" },
      },
    },

    contact: {
      eyebrow: "İletişim",
      title: "20 dakikada, bağlayıcı olmadan.",
      lead: "Almanca ve Türkçe. Size en hızlı gelen yolu seçin.",
      nameLabel: "İsim",
      namePlaceholder: "Adınız",
      businessLabel: "İşletme",
      businessPlaceholder: "Firma veya sektör",
      messageLabel: "Konu nedir?",
      messagePlaceholder: "Kendi cümlelerinizle kısaca — bir iki cümle yeterli.",
      errRequired: "Lütfen adınızı ve konuyla ilgili birkaç kelime ekleyin.",
      submitWhatsapp: "WhatsApp ile gönder",
      submitEmail: "E-posta ile gönder",
      whatsappTitle: "WhatsApp",
      whatsappNote: "En hızlı yanıt, DE & TR.",
      appointmentTitle: "Ücretsiz ilk görüşme",
      appointmentNote: "20 dakika, görüntülü. Ücretsiz ve bağlayıcı değil.",
      appointmentValue:
        "İşletmenize bakar ve ne inşa edeceğimizi söyleriz — neyi inşa etmeyeceğimizi de. Cevap „henüz değil“ olsa bile.",
      appointmentCta: "Randevu talep et",
      locationsLabel: "Merkez",
      marketsLabel: "Pazarlar",
      privacyConsentPrefix: "",
      privacyConsentLink: "Gizlilik politikasını",
      privacyConsentSuffix:
        "okudum ve bilgilerimin talebimin işlenmesi amacıyla kullanılmasını kabul ediyorum.",
      errPrivacy: "Lütfen gizlilik politikasını onaylayın.",
      handoffNote:
        "Gönderdiğinizde WhatsApp veya e-posta programınız hazır mesajla açılır — gönderim ancak orada onayladığınızda gerçekleşir.",
      handoffTitle: "Neredeyse tamam — bir adım kaldı.",
      handoffWhatsapp:
        "WhatsApp hazır mesajınızla açıldı. Mesaj bize ancak orada Gönder'e dokunduğunuzda ulaşır.",
      handoffMail:
        "E-posta programınız hazır mesajla açıldı. Mesaj bize ancak orada Gönder'e tıkladığınızda ulaşır.",
      handoffRetry: "Bir şey olmadı mı? Buradan tekrar açın.",
      errBlocked:
        "Tarayıcınız pencereyi engelledi. WhatsApp'ı lütfen aşağıdaki bağlantıdan açın — ya da doğrudan şu adrese yazın:",
    },
    closing: {
      eyebrow: "Sonraki adım",
      title: "İşletmeyi siz yönetirsiniz. Arkasındaki sistemi biz kurarız.",
      lead: "Yirmi dakika, ücretsiz ve bağlayıcı değil. İşletmeye bakar ve yardımcı olabilir miyiz, dürüstçe söyleriz.",
      ctaPrimary: "Projeye başla",
      ctaSecondary: "İşleri gör",
    },
    termin: {
      back: "Sayfaya dön",
      eyebrow: "Ücretsiz ilk görüşme",
      title: "Dört adımda görüşmeye.",
      lead: "Tarihi seçin, bilgileri tamamlayın — talep hazır bir mesaj olarak WhatsApp'ımıza gider. Hesap yok, bekleme yok.",
      stepOf: "Adım",
      next: "Devam",
      prev: "Geri",
      step1: {
        title: "Konu nedir?",
        lead: "Görüşme türünü seçin.",
        vgName: "Ücretsiz ön görüşme",
        vgDesc: "20 dakika, bağlayıcı değil. Dinleriz ve yardımcı olup olamayacağımızı dürüstçe söyleriz.",
        vgMeta: "ücretsiz · 20 dk.",
        arName: "Sistem görüşmesi",
        arDesc: "Operasyon, otomasyon ve meAI'ye derin bakış — somut planı olan işletmeler için.",
        arMeta: "ayrıntılı · 45 dk.",
      },
      step2: {
        title: "Tercih ettiğiniz tarih",
        lead: "Vurgulanan günler tercih ettiğimiz görüşme günleridir. Diğer günler talep üzerine mümkündür.",
        timeTitle: "Saat",
        timeLead: "Tüm saatler Orta Avrupa saatidir.",
        preferred: "tercihli",
        today: "bugün",
        errDate: "Lütfen bir tarih seçin.",
        errTime: "Lütfen bir saat seçin.",
      },
      step3: {
        title: "Bilgileriniz",
        lead: "Zorunlu alanlar * ile işaretlidir.",
        name: "Ad Soyad",
        phone: "Telefon",
        email: "E-posta",
        org: "Şirket",
        city: "Şehir / Bölge",
        interest: "İlgi alanı",
        size: "Şirket büyüklüğü",
        note: "Mesaj",
        notePlaceholder: "Kendi cümlelerinizle kısaca — bir iki cümle yeterli.",
        langLabel: "Görüşme dili",
        langDe: "Almanca",
        langTr: "Türkçe",
        langBoth: "Almanca + Türkçe",
        choose: "Lütfen seçin",
        errRequired: "Lütfen zorunlu alanları doğru doldurun.",
        errEmail: "Lütfen geçerli bir e-posta adresi girin.",
        interests: ["Zanaat Web Sitesi Paketi", "Sürekli destek — aylık 149 €", "Başka bir şey — marka, yazılım veya otomasyon", "Henüz belirsiz"],
        sizes: ["1–4 çalışan", "5–15 çalışan", "16–30 çalışan", "30'dan fazla çalışan"],
      },
      step4: {
        title: "Kontrol edin ve gönderin",
        lead: "WhatsApp'ı hazır yazılmış bir mesajla açıyoruz. Gönderme işlemini siz yaparsınız — sizin onayınız olmadan hiçbir şey gitmez.",
        send: "WhatsApp ile gönder",
        typeLabel: "Randevu türü",
        dateLabel: "Tarih",
        timeLabel: "Saat",
        langLabel: "Dil",
      },
      done: {
        title: "Talep hazır.",
        lead: "Mesajı WhatsApp'ta gönderdiğiniz anda size dönüş yaparız — genellikle 24 saat içinde.",
        reply: "Yanıt genellikle 24 saat içinde",
        home: "Ana sayfaya dön",
        again: "Yeni randevu talep et",
      },
      waTitle: "creaDIG — Randevu talebi",
      waType: "Tür",
      waDate: "Tarih",
      waTime: "Saat",
      waName: "Ad Soyad",
      waOrg: "Şirket",
      waCity: "Şehir",
      waPhone: "Telefon",
      waInterest: "İlgi",
      waSize: "Büyüklük",
      waLang: "Dil",
      waNote: "Mesaj",
      months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
      days: ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"],
    },
    legal: {
      imprintTitle: "Künye",
      privacyTitle: "Gizlilik",
      back: "Sayfaya dön",
      providerLabel: "Sağlayıcı (§ 5 DDG)",
      addressLabel: "Adres",
      sameAddress: "Adres yukarıdaki gibidir",
      formalLabel: "Resmî bilgiler",
      legalFormLabel: "Şirket türü",
      vatLabel: "Katma değer vergisi",
      smallBusinessNote:
        "§ 19 UStG uyarınca küçük işletme — katma değer vergisi hesaplanmaz.",
      mstvLabel: "§ 18/2 MStV uyarınca sorumlu",
      placeholderMark: "Yer tutucu — yayına almadan önce değiştirilecek",
      taxStatusPending: "KDV durumu henüz onaylanmadı.",
      phoneLabel: "Telefon",
      phonePending: "Almanya telefon numarası eklenecek.",
      pending: "Onay bekleyen bilgiler",
      pendingNote: "İki bilgi henüz eksik ve yukarıda yer tutucu olarak işaretlendi: KDV durumu (§ 27 a UStG uyarınca vergi kimlik numarası ya da § 19 UStG küçük işletme düzenlemesine ilişkin not) ve Almanya telefon numarası. İkisini de şirket sahibi onayladığı anda ekleyeceğiz. Yukarıdaki sağlayıcı, adres, şirket türü, § 18/2 MStV uyarınca sorumlu ve iletişim yolları şimdiden bağlayıcıdır.",
      responsible: "İçerikten sorumlu",
      contactLabel: "İletişim",
      privacyIntro: "Bu sayfa bilinçli olarak sade kuruldu: izleme, reklam çerezi veya analiz hizmeti kullanmıyoruz.",
      privacyPoints: [
        {
          title: "Sunucu kayıtları",
          body: "Sayfa çağrıldığında sağlayıcımız Vercel Inc. (ABD) IP adresi, zaman ve çağrılan kaynak gibi teknik olarak gerekli verileri işler. Hukuki dayanak GDPR Md. 6/1-f'dir — bu işleme olmadan sayfa ne sunulabilir ne de kötüye kullanıma karşı korunabilir. Vercel ile GDPR Md. 28 uyarınca bir veri işleyen sözleşmesi mevcuttur.",
        },
        {
          title: "Barındırma ve üçüncü ülkelere aktarım",
          body: "Bu sayfa tamamen statiktir ve Vercel'in dünya çapındaki içerik dağıtım ağı üzerinden, her seferinde en yakın konumdan sunulur. Bu nedenle erişim verilerinin AB dışında, özellikle ABD'de işlenmesi ihtimali bulunur. Bu durum, Vercel Inc. ile yapılan veri işleyen sözleşmesi ve GDPR Md. 46/2-c uyarınca AB standart sözleşme maddeleriyle güvence altına alınmıştır. Bunun dışında aktarım yapılmaz: analiz, harita veya reklam hizmeti kullanmıyoruz ve tüm yazı tiplerini yerel olarak sunuyoruz. İletişim için WhatsApp'ı kullanırsanız, ek olarak Meta Platforms Ireland Ltd. koşulları geçerlidir.",
        },
        {
          title: "İletişim formu ve randevu",
          body: "Bilgileriniz sunucumuzda saklanmaz. Yalnızca tarayıcınızda, sizin gönderdiğiniz bir WhatsApp mesajına dönüştürülür. Gönderim için WhatsApp (Meta Platforms Ireland Ltd.) koşulları geçerlidir.",
        },
        {
          title: "Yazı tipleri",
          body: "Poppins ve JetBrains Mono sayfayla birlikte yerel olarak sunulur. Google Fonts ile bağlantı kurulmaz; bu nedenle IP adresiniz üçüncü bir tarafa iletilmez.",
        },
        {
          title: "Onay ve yerel kayıt",
          body: "Onay penceresindeki kararınızı tarayıcınızın yerel deposunda saklıyoruz („creadig_consent“ anahtarı). Yalnızca onayınızla ek olarak dil seçiminizi ve görünümü hatırlıyoruz; onay yoksa bu ayarlar sadece açık oturum için geçerlidir. Bu sırada üçüncü taraflara hiçbir veri aktarılmaz. Seçiminizi istediğiniz zaman „Çerez ayarları“ üzerinden değiştirebilir veya geri alabilirsiniz — geri aldığınızda ilgili kayıtları anında sileriz.",
        },
        {
          title: "Haklarınız",
          body: "Her zaman bilgi alma (GDPR Md. 15), düzeltme (Md. 16), silme (Md. 17), işlemenin kısıtlanması (Md. 18), veri taşınabilirliği (Md. 20) ve itiraz (Md. 21) hakkına sahipsiniz. Aşağıdaki adrese bir mesaj yeterlidir. Bundan bağımsız olarak, bir veri koruma denetim otoritesine şikâyette bulunma hakkınız da vardır (GDPR Md. 77) — merkezimiz için yetkili otorite Aşağı Saksonya Veri Koruma Görevlisi'dir (Landesbeauftragte für den Datenschutz Niedersachsen).",
        },
      ],
      privacyNote: "Bu metin, şirket bilgileri tamamlandığında hukuken son kez kontrol edilecektir.",
    },
    consent: {
      title: "Onayınız",
      intro:
        "Bu site yalnızca çalışmak için gerekeni ve sizin izin verdiğinizi saklar. Teknik olarak zorunlu olmayan her şey için onayınıza ihtiyacımız var.",
      minors:
        "16 yaşından küçükseniz, zorunlu olmayan işlevlere izin vermeden önce lütfen veli veya vasinizin onayını alın.",
      privacyPrefix: "Ayrıntılar",
      privacyLink: "gizlilik metnimizde",
      revoke:
        "Seçiminizi istediğiniz zaman alt bilgideki „Çerez ayarları“ üzerinden değiştirebilir veya geri alabilirsiniz.",
      acceptAll: "Tümünü kabul et",
      essentialOnly: "Yalnızca zorunlu olanlar",
      customize: "Kişisel gizlilik tercihleri",
      save: "Seçimi kaydet",
      alwaysActive: "Her zaman etkin",
      notInUse: "Şu anda kullanılmıyor",
      settingsLabel: "Çerez ayarları",
      settingsTitle: "Gizlilik tercihleri",
      close: "Kapat",
      categories: {
        essential: {
          name: "Zorunlu",
          body: "Yalnızca bu penceredeki kararınızı saklar, böylece her ziyarette yeniden sormak zorunda kalmayız. Bu kayıt olmadan onay mekanizması çalışmaz.",
        },
        functional: {
          name: "Konfor",
          body: "Dil seçiminizi (Almanca/Türkçe) ve görünümü (açık/koyu) hatırlar. Onay olmadan seçiminiz yalnızca bu oturum için geçerlidir.",
        },
        statistics: {
          name: "Erişim ölçümü",
          body: "Şu anda hiçbir analiz veya izleme hizmeti kullanmıyoruz. Kararınız yine de kaydedilir ve ileride bu değişirse geçerli olur.",
        },
      },
    },
    footer: {
      tagline: "Marka, web, operations, automation ve yapay zekâ için sistem evi.",
      productsLabel: "Ürünler",
      navLabel: "Sayfa",
      legalLabel: "Yasal",
      imprint: "Künye",
      privacy: "Gizlilik",
      socialLabel: "Sosyal",
      rights: "Tüm hakları saklıdır.",
    },
  },
} as const

export type Dictionary = (typeof dictionary)["de"]
