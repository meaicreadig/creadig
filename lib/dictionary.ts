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
     * GROW-1 — die Kopfdaten der Seite, jetzt zweisprachig.
     *
     * Sie standen bis hierher fest verdrahtet im Layout, auf Deutsch. Solange
     * es nur eine Adresse gab, war das kein Widerspruch; seit `/tr/…` eine
     * eigene Seite ist, waere ein deutscher <title> ueber tuerkischem Inhalt
     * genau das Signal, das Google dazu bringt, die tuerkische Fassung als
     * Dublette auszusortieren.
     */
    meta: {
      siteTitle: "creaDIG — System-Haus für Marke, Web und KI",
      siteDescription:
        "creaDIG ist das Dach über eigenen Systemen — von Marke bis KI. Wir bauen sie. Und wir betreiben sie. System-Haus für Deutschland, Österreich und die Schweiz.",
      ogTitle: "creaDIG — Wir bauen, was andere nicht sehen.",
      ogDescription:
        "System-Haus seit 2017. Eigene Produkte, echte Kunden, KI-Systeme, die wir bauen und betreiben. Deutschland, Österreich, Schweiz.",
      organizationDescription:
        "System-Haus für Marke, Web, Operations, Automation und KI. Eigene Produkte: meAI, fibero, CASSAMEA, meahv.",
      /** Erster Eintrag jeder Brotkrume in den strukturierten Daten. */
      breadcrumbHome: "Startseite",
      /* T-1 — Alt-Text des Vorschaubildes. Er stand nur in
         app/_routes/og-image.tsx; von dort kann ihn der Kopfdaten-Helfer
         nicht holen, ohne `fs` und `next/og` in jede Seite zu ziehen. */
      ogImageAlt: "creaDIG — System-Haus für Marke, Web und KI",
    },
    /*
     * DIE KATEGORIE IN EINEM SATZ (KIZILELMA §10.1).
     *
     * Die Tiefen-Analyse hat die eine Frage benannt, die die Seite bisher
     * nicht beantwortet hat: Was IST das hier? Digitalagentur, IT-Systemhaus,
     * KI-Bude? Wer die Kategorie nicht selbst setzt, wird in die naechstbeste
     * einsortiert — und das ist bei uns immer die kleinere.
     *
     * Der Satz sagt zuerst, was wir NICHT sind, und erst dann, was wir sind.
     * Diese Reihenfolge ist Absicht: „System-Haus" allein liest jeder als
     * „IT-Systemhaus" und erwartet dann Serverwartung, Lizenzen und einen
     * Helpdesk. Die Verneinung raeumt genau diese Erwartung ab, bevor sie
     * entsteht.
     *
     * Er steht an zwei Stellen und nur dort: im Kopf von /leistungen (was
     * wir tun) und im Kopf von /unternehmen (wer das tut). Ein Satz, den man
     * ueberall liest, ist ein Slogan; drei Marken-Saetze hat das Haus schon.
     */
    brand: {
      categoryLabel: "Kategorie",
      category: "Kein klassisches IT-Systemhaus. Ein System-Haus für digitale Betriebe.",
    },
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
        title: "Fünf Ebenen. Ein System.",
        lead: "Jede Ebene trägt die nächste. Sie können auf jeder einsteigen — und auf jeder aufhören.",
        cta: "Alle Leistungen",
      },
      products: {
        cta: "Alle Produkte",
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
      /* BF-A9 — die Detailseite. Sie kam erst mit dem ersten Text, der
         laenger ist als ein Anreisser. */
      publishedLabel: "Veröffentlicht",
      sourcesLabel: "Zum Nachschlagen",
      sourceStatement: "Erklärung zur Barrierefreiheit dieser Seite",
      sourceService: "Barrierefreiheit als Leistung",
      backCta: "Alle Notizen",
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
      title: "Das Haus hinter den Systemen.",
      lead: "creaDIG ist keine Agentur, die ein Projekt abliefert und verschwindet. Wir sind ein Haus, das eigene Produkte erfindet, sie selbst baut und im Betrieb hält — von der Marke über die Software bis zur künstlichen Intelligenz.",
      statement: "Was wir für Kunden entwickeln, betreiben wir für uns selbst. Diese Substanz unterscheidet ein System-Haus von einer Präsentation.",
      metaTitle: "Unternehmen — System-Haus aus Osnabrück, seit 2017",
      metaDescription:
        "creaDIG: System-Haus im ICO InnovationsCentrum Osnabrück, gegründet 2017. Gründer, Arbeitsmodell, Schwerpunkte und Standort — ein Dach, fünf Ebenen, vier eigene Produkte.",
      /*
       * Die drei Etappen des Hauses (KIZILELMA §7: „Das Dach zuerst — gross,
       * als Ursprung; die Produkte als sein Werk").
       *
       * NUR ZWEI ZEITANGABEN, und beide sind belegt: 2017 als Gruendungsjahr
       * (vom Inhaber bestaetigt) und „heute". Die mittlere Etappe traegt
       * bewusst KEINE Jahreszahl — wann aus Auftraegen Produkte wurden, ist
       * nirgends belegt, und `Work.year` steht aus genau demselben Grund
       * ueberall auf `null`. Eine geschaetzte Jahreszahl waere eine erfundene
       * Angabe.
       */
      chapters: {
        label: "Der Weg",
        title: "Ein Haus entsteht nicht als Ankündigung.",
        items: [
          {
            year: "2017",
            title: "Der Anfang",
            body: "Gegründet in Osnabrück — als Agentur. Marke, Auftritt, einzelne Aufträge. Alles, was danach kam, ist daraus entstanden und nicht daneben.",
          },
          {
            year: null,
            title: "Aus Aufträgen wurden Produkte",
            body: "Was in Projekten immer wiederkehrte, haben wir gebaut statt jedes Mal neu zu lösen. Vier eigene Systeme: meAI, fibero, CASSAMEA, meahv — erfunden, gebaut und selbst betrieben.",
          },
          {
            year: "heute",
            title: "Das Haus",
            body: "Sitz im ICO InnovationsCentrum Osnabrück. Eigene Produkte im Betrieb, Kundenarbeit in Deutschland und der Schweiz — und dieselbe Hand, die baut, geht danach ans Telefon.",
          },
        ],
      },
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
      /*
       * S-2 — „Produkte" liest sich wie ein Katalog. Der Vorspann sagt jetzt
       * im ersten Satz, was die Seite wirklich ist: ein Beleg, kein Regal.
       */
      eyebrow: "Beweis, kein Katalog",
      title: "Vier Produkte, die wir selbst betreiben.",
      lead: "Diese Seite verkauft nichts davon. Sie steht hier, weil sie belegt, was wir über uns sagen: Jedes dieser Systeme hat creaDIG von Grund auf gebaut — und setzt es im eigenen Tagesgeschäft ein. Was wir für Sie bauen, steht unter Leistungen.",
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
      interest: {
        eyebrow: "Nachfrage",
        title: "Sagen wir Ihnen Bescheid?",
        body: "Wenn {product} für Ihren Betrieb interessant ist: Adresse hinterlassen, und wir melden uns, sobald es so weit ist. Kein Newsletter, keine Werbung — eine Nachricht zu diesem Produkt.",
        emailLabel: "E-Mail",
        emailPlaceholder: "damit wir Sie erreichen",
        nameLabel: "Name (optional)",
        namePlaceholder: "wie dürfen wir Sie ansprechen?",
        submit: "Bescheid geben lassen",
        sentTitle: "Notiert.",
        sentBody: "Wir melden uns, sobald es zu diesem Produkt etwas zu sagen gibt. Eine Bestätigung liegt in Ihrem Postfach.",
        /* Der Endpunkt verlangt ein Telefonfeld — hier gibt es keins, und das
           steht dann auch so in der Mail statt einer erfundenen Nummer. */
        phoneOmitted: "nicht angegeben (Produkt-Nachfrage)",
        messageTemplate: "Nachfrage zum Produkt {product} — bitte Bescheid geben, sobald es verfügbar ist.",
      },
      breadcrumb: "Produkte",
      /*
       * V2-4b — die Beschriftungen der Produkt-Tiefe (KIZILELMA §10.5).
       *
       * Die Inhalte dazu liegen in `productWorlds` und sind alle `null`: Was
       * ein Produkt loesen soll, worauf es wettet, wie es innen aussieht und
       * was der Betrieb gelehrt hat, weiss genau eine Person. Die Labels
       * stehen hier trotzdem — damit der Owner Text in eine Struktur
       * schreiben kann und nicht die Struktur mitliefern muss.
       */
      problemLabel: "Wofür es gebaut wurde",
      thesisLabel: "Die These",
      functionsLabel: "Was es kann",
      architectureLabel: "System & Architektur",
      operationsLabel: "Wie es betrieben wird",
      learningsLabel: "Was der Betrieb gelehrt hat",
      /*
       * Der Zustands-Badge. Er wird aus `live` und der oeffentlichen
       * Adresse abgeleitet und nicht gepflegt — ein drittes Feld neben
       * `live` und `outcome` waere die zweite Wahrheit (siehe
       * `productStatus` in site-data).
       */
      statusBadge: {
        live: "Live",
        beta: "Private Beta",
        aufbau: "Im Aufbau",
        intern: "Im eigenen Betrieb",
      },
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
      title: "Fünf Ebenen. Ein System.",
      lead: "Marke, Auftritt, Betrieb, Automatisierung, Intelligenz. Jede Ebene trägt die nächste — nicht nebeneinander, sondern als System. Was wir für unsere eigenen Produkte gebaut haben, bringen wir in Ihren Alltag.",
      metaTitle: "Leistungen — von der Marke bis zur KI",
      metaDescription:
        "Die fünf Ebenen von creaDIG: Marke, digitaler Auftritt, Operations, Automatisierung und KI. Für Unternehmen in Deutschland, Österreich und der Schweiz — auf Deutsch und Türkisch.",
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
      /*
       * S-2 — die Menuewoerter sagen nicht, was dahinterliegt.
       *
       * „Produkte" liest sich wie ein Katalog: vier Dinge, die man kaufen
       * kann. Das ist falsch und kostet doppelt — wer einkaufen will, findet
       * keinen Preis, und wer einen Beleg fuer unsere Arbeit sucht, klickt
       * gar nicht erst hin. Dabei sind die vier Systeme genau das: der
       * Beweis, dass wir bauen und betreiben, was wir verkaufen.
       *
       * Diese Halbsaetze stehen im Menue unter dem Wort. Sie beschreiben,
       * nicht bewerben.
       */
      hints: {
        leistungen: "Was wir für Sie bauen",
        produkte: "Was wir selbst gebaut haben und betreiben — der Beweis, kein Katalog",
        arbeiten: "Ausgeführte Projekte, mit Namen",
        unternehmen: "Wer dahintersteht und wie wir arbeiten",
        insights: "Fachtexte aus dem laufenden Betrieb",
        kontakt: "Vier Wege zum Gespräch",
      },
      ueber: "Über uns",
      pakete: "Pakete",
      kontakt: "Kontakt",
      cta: "Projekt starten",
      menu: "Menü öffnen",
      close: "Menü schließen",
      menuTitle: "Navigation",
      theme: "Erscheinungsbild wechseln",
      language: "Sprache wechseln",
      /*
       * BF-A3 / F5 — die Sprungmarke.
       *
       * Wer nur mit der Tastatur arbeitet, durchquerte bisher acht Stationen
       * (Logo, vier Menuepunkte, Sprache, Erscheinungsbild, WhatsApp), bevor
       * er im Inhalt ankam — auf JEDER Seite erneut. WCAG 2.4.1 verlangt
       * genau dafuer einen Weg vorbei.
       */
      skipToContent: "Zum Inhalt springen",
    },
    hero: {
      eyebrow: "System-Haus · seit 2017 · Deutschland · Österreich · Schweiz",
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
        "creaDIG entwickelt Marken, digitale Systeme, Automatisierung und eigene Softwareprodukte — für Unternehmen in Deutschland, Österreich und der Schweiz.",
      ctaPrimary: "Projekt starten",
      ctaSecondary: "Unsere Arbeit",
      location: "Osnabrück · DACH",
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
        /*
         * V2-4c — drei Gefaesse, heute leer.
         *
         * Der Wert steht in `site-data.impactFigures` auf `null`, deshalb
         * erscheint keine dieser Kacheln. Die Beschriftungen liegen hier,
         * damit der Owner nur eine Zahl nachtragen muss und nicht auch noch
         * ueberlegen, wie sie heisst. Wer eine fuellt, muss sie belegen
         * koennen — „ungefaehr 40" ist keine Zahl, sondern ein Gefuehl mit
         * Ziffern.
         */
        systems: {
          label: "Produktive Systeme",
          detail: "Systeme, die heute im Tagesbetrieb eines Betriebs laufen.",
        },
        automated: {
          label: "Automatisierte Vorgänge",
          detail: "Schritte, die vorher jemand von Hand gemacht hat.",
        },
        operatingYears: {
          label: "Jahre im Betrieb",
          detail: "Gerechnet ab dem ersten System, das wir übergeben und behalten haben.",
        },
      },
      facts: {
        regions: {
          label: "Märkte",
          value: "Deutschland, Österreich & Schweiz",
          detail: "Beraten und gebaut auf Deutsch und Türkisch.",
        },
        scope: {
          label: "Spannweite",
          value: "Von der Marke bis zur KI",
          detail: "Fünf Ebenen. Ein System.",
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
      /*
       * V2-1c — die Art eines Werks als Etikett, in der Sprache der Seite.
       *
       * `Work.kind` bleibt in den Daten ein deutscher Schluessel („Produkt" /
       * „Kundenwerk"), weil daran Logik haengt (Adresse, Gruppierung,
       * Register). Was der Besucher liest, kommt jetzt von hier — sonst stand
       * auf /tr im Badge „Kundenwerk" ueber einer sonst tuerkischen Karte.
       */
      kindProduct: "Produkt",
      kindClientWork: "Kundenwerk",
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
    /*
     * V2-4 — DER FALL HAT ACHT KAPITEL STATT DREI.
     *
     * „Problem, Loesung, Ergebnis" ist die Kurzform, mit der Agenturen ihre
     * Referenzen fuellen. Sie beantwortet die entscheidende Frage nicht:
     * Was war unser Anteil daran? Und was ist heute, ein Jahr spaeter?
     *
     * Die Reihenfolge ist die Aussage. Erst der Betrieb, wie er war, dann
     * sein Problem, dann sein Ziel — und erst DANACH kommen wir vor. Wer mit
     * „unsere Rolle" anfaengt, schreibt eine Selbstdarstellung mit
     * Kundennamen.
     */
    cases: {
      eyebrow: "Kundenfälle",
      title: "Was sich danach geändert hat.",
      lead: "Jeder Fall in derselben Reihenfolge: wie der Betrieb dastand, was ihn aufgehalten hat, was er erreichen wollte — und erst dann, was wir daran hatten. Nur mit schriftlicher Freigabe des Kunden; ohne Freigabe steht hier nichts.",
      chapters: {
        start: "Ausgangslage",
        problem: "Das Problem",
        goal: "Das Ziel",
        role: "Unsere Rolle",
        system: "Das System",
        delivery: "Umsetzung",
        result: "Ergebnis",
        today: "Heute",
      },
      metricsLabel: "Kennzahlen",
      /* Ohne Quelle keine Zahl. Ziffern glaubt man schneller als Saetze —
         deshalb werden sie hier strenger behandelt und nicht lockerer. */
      sourceLabel: "Quelle",
      voiceLabel: "Kundenstimme",
    },
    reviews: {
      eyebrow: "Bewertungen",
      title: "Was Kunden geschrieben haben.",
      lead: "Im Originalwortlaut, mit Name und Datum. Wir übersetzen keine Bewertungen — ein übersetzter Satz ist ein Satz, den der Mensch so nie geschrieben hat.",
      verify: "Bei Google nachlesen",
      projectLabel: "Projekt",
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
      /*
       * BF-A6 — die Grenze der eigenen Leistung, als eigener Abschnitt.
       *
       * Sie erscheint nur auf Seiten, die `boundary` fuehren (heute:
       * Barrierefreiheit). Wer eine Pruefung verkauft, muss sagen, wo sie
       * aufhoert — sonst kauft der Kunde eine Rechtsfolge, die niemand
       * zugesagt hat, und misst uns spaeter daran.
       */
      boundaryLabel: "Was wir tun — und was nicht",
      boundaryWeLabel: "Das sagen wir zu",
      boundaryNotWeLabel: "Das sagen wir nicht zu",
      ownProofLabel: "Am eigenen Objekt geprüft",
      /*
       * BF-A10 — die Etiketten der Preisleiter.
       *
       * „Angebot nach der Pruefung" ist der wichtigste der drei: Ohne ihn
       * liest jeder die Spanne als Preis, und wer 2.000 gelesen hat, hoert
       * 3.400 als Aufschlag — auch wenn 3.400 der ehrliche Aufwand ist.
       */
      priceLadderLabel: "Was es kostet",
      priceFixed: "Festpreis",
      priceOffer: "Angebot nach der Prüfung",
      priceMonthly: "je Monat",
      ctaTitle: "Passt das zu Ihrem Betrieb?",
      ctaBody: "Zwanzig Minuten, kostenlos und unverbindlich. Wir sehen uns den Betrieb an und sagen ehrlich, ob wir helfen können.",
      ctaPrimary: "Kostenlose Erstberatung",
      ctaSecondary: "Per WhatsApp fragen",
    },
    /*
     * BF-A8 — der Kurz-Check.
     *
     * ---------------------------------------------------------------------
     * WARUM HIER KEIN SCANNER STEHT
     * Ein Knopf, der eine fremde Seite automatisch prueft und eine Ampel
     * ausgibt, waere in zwei Tagen gebaut und der beste Koeder der Seite.
     * Er ist trotzdem nicht da: Ein Automat erzeugt Ergebnisse, fuer die
     * niemand geradesteht — dieselbe Zusage, die ein Overlay macht, und die
     * Abgrenzung zum Overlay ist das Angebot. Wer eine Ampel verkauft, kann
     * nicht erklaeren, warum die Ampel des Nachbarn nichts taugt.
     *
     * Stattdessen: ein Feld, eine Adresse, ein Mensch, der hinsieht. Das
     * dauert zwei Werktage statt zwei Sekunden, und genau das steht auch da.
     *
     * Die uebrigen Feldbeschriftungen kommen aus `contact` — dasselbe
     * Formular, ein Feld mehr. Zwei Woerterbuecher fuer dieselbe Zeile waeren
     * zwei Stellen, an denen sie auseinanderlaufen kann.
     */
    quickCheck: {
      eyebrow: "Kurz-Check",
      title: "Drei Punkte zu Ihrer Seite. Kostenlos.",
      lead: "Sie geben uns die Adresse, wir sehen uns die Seite an — von Hand, mit Tastatur und Screenreader. Sie bekommen drei konkrete Punkte: was uns aufgefallen ist, wo es steht, was es für Ihre Besucher bedeutet.",
      siteLabel: "Website-Adresse",
      sitePlaceholder: "meinbetrieb.de",
      errSite: "Bitte geben Sie die Adresse Ihrer Website an — ohne sie können wir nichts ansehen.",
      messageLabel: "Etwas, das wir wissen sollten?",
      messagePlaceholder: "Optional. Zum Beispiel: der Shop, die Terminbuchung, eine Rückmeldung eines Kunden.",
      submit: "Kurz-Check anfragen",
      sentTitle: "Angekommen.",
      sentBody:
        "Wir sehen uns Ihre Seite an und melden uns mit drei konkreten Punkten — kostenlos und unverbindlich.",
      limitTitle: "Was der Kurz-Check nicht ist",
      limitBody:
        "Er zeigt drei Punkte, nicht alle. Er ist keine vollständige Prüfung nach WCAG 2.1 AA — die ist Handarbeit und dauert länger als ein Blick. Und er ist keine rechtliche Bewertung.",
      humanNote:
        "Kein automatischer Scanner: Ein Mensch sieht sich die Seite an. Deshalb dauert es zwei Werktage und nicht zwei Sekunden.",
    },
    /*
     * V2-4d — DAS HAUS ALS EIN BILD (KIZILELMA §10.6).
     *
     * Die Seite erklaert die Struktur des Hauses an vier Orten: fuenf Ebenen
     * auf /leistungen, vier Produkte auf /produkte, der Betrieb als eigene
     * Sektion, das Dach in Saetzen auf /unternehmen. Wer alle vier gelesen
     * hat, versteht es. Wer eine Seite ansieht, nicht.
     *
     * Dieses Diagramm ist die eine Ansicht, die alles zugleich zeigt: Dach →
     * fuenf Ebenen → quer darunter der Betrieb → vier Produkte, jedes an der
     * Ebene, auf der es sitzt.
     *
     * Es braucht kein Material vom Owner — es zeigt nur, was ohnehin in den
     * Daten steht (`serviceLayers`, `productWorks`, `productWorlds`). Genau
     * deshalb kann es hier stehen, waehrend Fotos und Screens noch fehlen.
     */
    architecture: {
      eyebrow: "Das Haus",
      title: "Ein Dach, fünf Ebenen, vier Produkte.",
      lead: "Das ganze Unternehmen in einer Ansicht: oben das Dach, darunter die fünf Ebenen, quer darunter der Betrieb — und unten die vier eigenen Produkte, jedes an der Ebene, auf der es sitzt.",
      roofLabel: "Das Dach",
      roofNote: "System-Haus, Osnabrück, seit 2017",
      layersLabel: "Fünf Ebenen",
      operateLabel: "Quer darunter",
      operateNote: "Hosting · Monitoring · Updates · Security · Backups · Support · Weiterentwicklung",
      productsLabel: "Vier eigene Produkte",
      onLayer: "auf Ebene",
      caption:
        "Kein Organigramm und keine Marktübersicht — die Ordnung des eigenen Hauses. Jede Ebene bieten wir als Leistung an; jedes Produkt ist der Beleg, dass wir sie selbst gebaut haben.",
    },
    services: {
      eyebrow: "Leistungen",
      title: "Fünf Ebenen. Ein System.",
      lead: "Wir arbeiten von A bis Z — vom ersten Logo bis zum eigenen KI-System. Jede Ebene baut auf der darunter auf.",
      forWhom: "Für wen",
      // Einstiegs-Chips ueber der Pyramide: die Vokabel, nach der gesucht wird.
      entryLabel: "Einstieg",
      /*
       * V2-2 — DIE EBENEN WAREN KATEGORIE-SPRACHE, KEINE LEISTUNG.
       *
       * Owner-Kritik, wörtlich: „nur oberflächlich". Sie war berechtigt. Eine
       * Ebene bestand aus drei Zeilen — Name, ein Satz, „für wen". Das
       * beantwortet, in welche Schublade etwas gehört, aber nicht die zwei
       * Fragen, mit denen jemand hier ankommt: Ist das mein Problem? Und was
       * habe ich hinterher?
       *
       * Deshalb je Ebene drei Abschnitte in immer derselben Reihenfolge —
       * Ausgangslage, was wir bauen, was danach anders ist — und darunter die
       * Vokabeln, nach denen tatsächlich gesucht wird. „Operations" sucht
       * niemand; „CRM" und „Auftragsmanagement" schon.
       *
       * MARKENSPRACHE OBEN, CAPABILITY-SPRACHE DARUNTER. Nicht umgekehrt: Ein
       * Haus, das mit „CRM · Dashboards · APIs" aufmacht, ist ein Dienstleister
       * mit Liste. Die Liste steht darunter, wo sie hingehört — und löst
       * zugleich das SEO-Problem, das die Ebenen-Namen erzeugt haben.
       *
       * WAS HIER NICHT STEHT: keine Zahl, keine Frist, kein Ergebnisversprechen
       * mit Prozentzeichen, und keine Leistung, die das Haus nicht erbringt.
       * Kein IT-Support, keine Serverüberwachung, keine „Agile Transformation"
       * (KIZILELMA §10.3).
       */
      problemLabel: "Ausgangslage",
      solutionLabel: "Was wir bauen",
      resultLabel: "Was danach anders ist",
      projectsLabel: "Typische Projekte",
      depthLabel: "In der Tiefe",
      layers: {
        identity: {
          name: "Identity",
          what: "Marke, Name, Logo, Auftritt — das Fundament, auf dem alles steht.",
          who: "Gründer, neue Betriebe, Handwerk vor dem ersten Auftritt.",
          problem:
            "Der Betrieb hat einen Namen, aber kein Bild. Angebot, Fahrzeug, Rechnung und Schild sehen jedes Mal anders aus — der Kunde muss bei jedem Kontakt neu erkennen, mit wem er es zu tun hat.",
          solution:
            "Wir bauen ein Markensystem statt eines Logos: Zeichen, Schrift, Farben und ihre Anwendung, festgehalten und übergeben — damit auch die Druckerei und der nächste Dienstleister damit arbeiten können, ohne zu raten.",
          result: "Alles, was den Betrieb verlässt, kommt sichtbar von ihm. Ohne Rückfrage, ohne Nachbau, ohne dass jemand die Farbe aus einem alten PDF pipettiert.",
          projects: [
            "Corporate Design",
            "Markensystem",
            "Logo & Wortmarke",
            "Geschäftsausstattung",
            "UI-Grundlagen",
          ],
        },
        digital: {
          name: "Digital",
          what: "Website, Shop, Landingpages — sichtbar, schnell, auffindbar.",
          who: "Bäckerei, Praxis, Restaurant, Handwerksbetrieb.",
          problem:
            "Die Website ist eine Broschüre. Sie steht online, aber sie nimmt nichts entgegen — keine Anfrage, keine Bewerbung, keinen Termin. Und niemand weiß, wie viele daran vorbeigegangen sind.",
          solution:
            "Wir bauen den Auftritt als Teil des Betriebs: Website, Portal, Web-App oder Shop, verbunden mit dem, was danach passiert. Barrierefreiheit nach WCAG 2.1 AA ist dabei eingebaut und nicht nachgerüstet.",
          result: "Anfragen kommen an, sind zuordenbar und landen dort, wo sie bearbeitet werden — statt in einem Postfach, in das freitags niemand sieht.",
          projects: [
            "Websites",
            "Web-Apps",
            "Portale",
            "E-Commerce",
            "Mobile",
            "Barrierefreiheit",
          ],
        },
        operations: {
          name: "Operations",
          what: "Kasse, Planung, Abrechnung, Verwaltung — der Betrieb im System.",
          who: "Gastronomie, Außendienst, Verwaltung, Dienstleister.",
          problem:
            "Der Betrieb läuft über Zettel, Tabellen und drei Programme, die nichts voneinander wissen. Wer eine Frage beantworten will, sucht an vier Stellen — und die Antwort ist schon wieder alt, bevor sie fertig ist.",
          solution:
            "Wir strukturieren den Betrieb in einem System: Auftrag, Kunde, Beleg und Zahl an einem Ort, mit Schnittstellen zu dem, was bleiben soll. Was individuell sein muss, bauen wir; was es fertig gibt, kaufen wir nicht doppelt.",
          result: "Eine Auskunft statt vier. Und wer neu dazukommt, findet sich im System zurecht statt im Kopf eines Kollegen.",
          projects: [
            "CRM",
            "Auftragsmanagement",
            "Backoffice",
            "Daten & Schnittstellen",
            "Dashboards",
            "Individualsoftware",
          ],
        },
        automation: {
          name: "Automation",
          what: "Wiederkehrende Arbeit übernimmt das System, nicht der Mensch.",
          who: "Betriebe mit 6–20 Mitarbeitern und wachsendem Papierberg.",
          problem:
            "Dieselbe Arbeit, jeden Tag, von Hand: Belege abtippen, Mails weiterleiten, Angebote nachfassen, Listen abgleichen. Es fällt nicht auf, weil es nie viel auf einmal ist — es fällt am Monatsende auf.",
          solution:
            "Wir automatisieren die Wege, nicht die Menschen: Abläufe, Schnittstellen, Dokumente und eingehende E-Mails übernimmt das System. Dazu immer eine Stelle, an der ein Mensch sieht, was nicht durchgelaufen ist.",
          result: "Wiederkehrende Arbeit passiert, ohne dass jemand daran denken muss. Und wenn etwas hängt, meldet es sich, statt still liegen zu bleiben.",
          projects: [
            "Workflows",
            "APIs & Integrationen",
            "Dokumentenverarbeitung",
            "E-Mail-Verarbeitung",
            "Prozessautomatisierung",
          ],
        },
        intelligence: {
          name: "Intelligence · meAI",
          what: "Ein KI-System, das mitdenkt, vorbereitet und den Überblick behält.",
          who: "Etablierte Betriebe, die Entscheidungen schneller treffen wollen.",
          problem:
            "Die Zahlen sind da, die Entscheidung nicht. Wer sie treffen will, öffnet fünf Auswertungen und weiß danach mehr — aber nicht besser.",
          solution:
            "Wir bauen darauf ein System, das liest statt zeigt: Es ordnet ein, priorisiert und bereitet Optionen vor. meAI ist unser eigenes davon — von uns gebaut, von uns betrieben und im eigenen Alltag erprobt, bevor es zu einem Betrieb kommt.",
          result: "Die Frage „was ist heute zuerst dran“ hat eine Antwort — und daneben steht, warum.",
          projects: [
            "Analyse",
            "Priorisierung",
            "Knowledge",
            "KI & Agents",
            "meAI",
          ],
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
      lead: "Selbst erfunden, selbst gebaut, selbst betrieben — und deshalb der beste Beleg dafür, was wir für andere bauen können. Kein Katalog: Verkauft wird hier keins davon. Der Deep-Dive zum Flaggschiff meAI folgt direkt darunter.",
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
       * schreibt.
       *
       * BF-8 — hier standen "24 Stunden". Eine Zusage, die ein Ein-Mann-Haus
       * an einem Freitagabend, im Urlaub oder mitten in einer Auslieferung
       * nicht halten kann, ist keine Zusage, sondern eine spaetere
       * Enttaeuschung: Wer sie liest und am naechsten Tag nichts hoert, haelt
       * uns fuer unzuverlaessig, bevor das erste Gespraech stattgefunden hat.
       * Zwei Werktage sind haltbar — und werden fast immer unterboten.
       *
       * Dieselbe Frist steht in `contact.sentBody`, in `termin.done.reply`
       * und in den Bestaetigungsmails (app/api/lead/route.ts). Wer sie hier
       * aendert, aendert sie dort mit.
       */
      opsEyebrow: "Vom ersten Kontakt an",
      opsSteps: {
        request: {
          name: "Anfrage",
          what: "Sie schreiben uns — per WhatsApp, über das Formular oder direkt mit einem Terminwunsch. Wir melden uns innerhalb von zwei Werktagen.",
        },
        analysis: {
          name: "Analyse",
          what: "Zwanzig Minuten Erstgespräch, kostenlos. Wir sehen uns den Betrieb an und sagen, was wir bauen würden — und was nicht.",
        },
        offer: {
          name: "Angebot",
          what: "Ein festes Angebot mit Umfang, Preis und Zeitrahmen. Keine Stundenzettel, keine Nachforderungen.",
        },
        implementation: {
          name: "Umsetzung",
          what: "Wir bauen, was im Angebot steht — in Abschnitten, die Sie unterwegs zu sehen bekommen. Zwischenstände statt einer Überraschung am Ende.",
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
      founderLabel: "Gründer & System Lead",
      founder: "Muhammed Emin Akyol",
      body1:
        "creaDIG startete 2017 als Agentur. Aus Aufträgen wurden Produkte, aus Produkten ein System-Haus — heute laufen unter dem Dach vier eigene Systeme und die Betreuung der Betriebe, für die wir sie gebaut haben.",
      body2:
        "Das Team wächst; die nächsten Stellen sind in Vorbereitung. Wie wir heute arbeiten — wer führt, wer im Kernteam sitzt, wer dazukommt — steht darunter, ohne Schönfärberei.",
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
      standardLabel: "Zwei Sprachen, ein Standard",
      standardBody:
        "Beratung, Unterlagen, Verträge und die laufende Betreuung gibt es auf Deutsch und auf Türkisch. Derselbe Standard, dieselbe Dokumentation, dieselbe Rechnung — nur in der Sprache, in der im Betrieb entschieden wird. Kein Dolmetscher dazwischen und keine zweite, dünnere Fassung.",
      locationsLabel: "Sitz",
      marketsLabel: "Märkte",
      honesty:
        "Wir nennen keine erfundenen Mitarbeiter- oder Umsatzzahlen. Unser Beweis ist gebaute Arbeit.",
    },
    /*
     * V2-5 — DAS ARBEITSMODELL (KIZILELMA §10.6).
     *
     * -----------------------------------------------------------------------
     * DIE GROESSTE LUECKE DER SEITE WAR „WER MACHT DAS?"
     * Es stand ein Satz dazu da, mitten in „Ueber uns": „Wir arbeiten mit
     * einem spezialisierten Netzwerk … Das Team waechst." Das ist wahr und
     * beantwortet die Frage trotzdem nicht — es sagt, dass es jemanden gibt,
     * aber nicht, wer Ihr Projekt fuehrt und wer daran sitzt.
     *
     * -----------------------------------------------------------------------
     * KEINE SCHEIN-GROESSE
     * Ein Haus dieser Groesse kann sich groesser aussehen lassen; es ist nur
     * eine Frage der Wortwahl („unser Team", „unsere Standorte"). Der Preis
     * faellt spaeter an, beim ersten Termin, in dem der Kunde merkt, dass
     * „das Team" eine Person ist. Founder-led ist im Premium kein Nachteil —
     * vorausgesetzt, es steht als bewusstes Modell da und nicht als Luecke.
     *
     * -----------------------------------------------------------------------
     * WORTLAUT: ENTWURF, OWNER BESTAETIGT
     * Kein Satz hier behauptet etwas Neues: Der Gruender fuehrt (belegt),
     * es gibt ein Netzwerk aus Entwicklern, Textern und Strategen im
     * DACH-Raum (stand schon in `about.body2`), das Team waechst (ebenda).
     * Neu ist nur die Ordnung. Der genaue Wortlaut ist trotzdem Owner-Sache
     * und steht als offener Punkt auf `/status` — geaendert wird er hier,
     * nicht im Markup.
     *
     * Was NICHT dasteht und auch nicht dazukommt: eine Mitarbeiterzahl, eine
     * Umsatzzahl, ein Standort, den es nicht gibt.
     */
    workModel: {
      eyebrow: "So arbeiten wir",
      title: "Founder-led — und dazu genau die Leute, die ein Projekt braucht.",
      lead: "Wir sagen nicht, wie groß wir sind, sondern wie wir arbeiten. Das ist die ehrlichere Angabe und für Sie die nützlichere: Sie wissen danach, wer Ihr Projekt führt und wer daran sitzt.",
      items: {
        founder: {
          name: "Geführt vom Gründer",
          what: "Jedes Projekt hat einen Verantwortlichen, und es ist immer derselbe. Er führt das erste Gespräch, er entwirft das System, und er geht ans Telefon, wenn etwas ist. Kein Wechsel vom Verkauf zur Umsetzung, keine Übergabe an jemanden, der nicht dabei war.",
        },
        core: {
          name: "Ein kleines Kernteam",
          what: "Klein genug, dass jeder weiß, woran die anderen arbeiten. Groß genug, dass ein Urlaub kein Projekt anhält.",
        },
        network: {
          name: "Spezialisten nach Bedarf",
          what: "Für das, was ein Projekt zusätzlich braucht — Entwicklung, Text, Strategie — arbeiten wir mit einem festen Netzwerk im DACH-Raum. Nicht anonym eingekauft: Es sind Leute, mit denen wir schon gebaut haben.",
        },
      },
      fieldsLabel: "Verantwortungsfelder",
      fieldsNote: "Fünf Ebenen, eine Verantwortung. Das ist die Struktur des Hauses — keine Aufzählung von Fähigkeiten.",
      honesty:
        "Wir nennen keine Mitarbeiterzahl und keine Umsatzzahl. Beides ließe sich behaupten, und beides sagt über Ihr Projekt nichts. Was zählt, ist, wer daran sitzt.",
    },
    /*
     * V2-5 — DIE FOTO-SLOTS (KIZILELMA §10.6).
     *
     * „Menschen" ist die fuenfte der fehlenden Beweisarten, und sie ist die
     * einzige, die sich nicht durch Struktur ersetzen laesst: Ein Haus ohne
     * ein einziges Bild vom eigenen Arbeitsplatz wirkt wie eine Adresse, an
     * der niemand sitzt.
     *
     * Stock ist gesperrt und ein Platzhalter-Bild auch. Deshalb entscheidet
     * das Dateisystem: Liegt unter `public/images/unternehmen/<slot>.jpg`
     * ein Foto, erscheint es mit der Beschriftung von hier. Liegt keins da,
     * erscheint die Sektion nicht — heute ist das der Fall.
     *
     * Die Beschriftungen stehen trotzdem schon hier, in beiden Sprachen:
     * Der Owner soll ein Bild ablegen muessen und nicht auch noch
     * ueberlegen, was darunter steht.
     */
    photos: {
      eyebrow: "Aus dem Haus",
      title: "Wo das entsteht.",
      lead: "Keine Stockfotos und keine Bürostudio-Aufnahmen. Was hier steht, ist der Ort, an dem gearbeitet wird — oder es steht nichts.",
      slots: {
        buero: {
          caption: "Der Arbeitsraum im ICO InnovationsCentrum Osnabrück.",
          alt: "Der Arbeitsraum von creaDIG im ICO InnovationsCentrum Osnabrück",
        },
        ico: {
          caption: "Das ICO InnovationsCentrum Osnabrück, Albert-Einstein-Straße 1.",
          alt: "Das ICO InnovationsCentrum Osnabrück an der Albert-Einstein-Straße 1",
        },
        arbeitsplatz: {
          caption: "Bildschirme mit echter Arbeit darauf.",
          alt: "Arbeitsplatz bei creaDIG mit laufenden Systemen auf den Bildschirmen",
        },
        whiteboard: {
          caption: "Eine Skizze, die wirklich so entstanden ist.",
          alt: "Whiteboard mit einer Systemskizze aus einem Projekt",
        },
      },
    },
    location: {
      eyebrow: "Unser Sitz",
      note: "Sie finden uns im InnovationsCentrum Osnabrück. Termine nach Vereinbarung — persönlich, per Video oder über WhatsApp.",
      mapLink: "Auf der Karte ansehen",
      photoAlt:
        "Das ICO InnovationsCentrum Osnabrück an der Albert-Einstein-Straße 1 — Sitz von creaDIG",
    },
    packages: {
      /*
       * V2-3 — DIE RUBRIK HEISST JETZT „EINSTIEGSANGEBOTE".
       *
       * Sie hiess „Angebot" und stand als einzige bepreiste Sache direkt
       * unter den fuenf Ebenen. Wer so liest, kommt zu dem Schluss aus der
       * Tiefen-Analyse: „doch nur eine Website-Agentur." Ein Festpreis-Paket
       * ist kein Beispiel der System-Haus-Architektur, es ist die Tuer davor
       * — und `entryNote` sagt das jetzt in einem Satz, statt es dem Leser
       * zu ueberlassen.
       */
      eyebrow: "Einstiegsangebote",
      title: "Zwei Wege hinein — beide zum Festpreis.",
      lead: "Nicht jeder Betrieb fängt oben an. Diese beiden Angebote sind der Einstieg: klar umrissen, vorher bepreist, ohne dass Sie das ganze Haus mitbestellen.",
      entryNote:
        "Das ist der Einstieg, nicht die Hauptarchitektur. Was creaDIG als System-Haus baut, steht oben in den fünf Ebenen und wird nach Umfang gerechnet — nicht nach Paket.",
      forWhom: "Für wen",
      recommended: "Unsere Empfehlung",
      tierLabel: "Einstieg",
      /*
       * Der Referenzpreis wird offen als solcher benannt — samt Regelpreis
       * daneben. Ein Nachlass, den der Kunde erst bei der zweiten Rechnung
       * bemerkt, ist kein Entgegenkommen, sondern eine Ueberraschung.
       */
      referenceNote:
        "Referenzpreis für die ersten zwei Betriebe — als Gegenleistung für ein Zitat, die Nennung als Referenz und zwei Fotos. Ab dem dritten Betrieb gilt der Regelpreis.",
      regularLabel: "Regelpreis",
      netNote: "Alle Preise netto, zzgl. 19 % USt.",
      /*
       * BF-9 — die obere Oeffnung.
       *
       * Die Leiter endete bei 3.900 EUR. Wer mehr braucht — mehrere
       * Standorte, einen Shop, eine Schnittstelle in die Warenwirtschaft —
       * las diese Zahl als Obergrenze und sortierte sich selbst aus, oder wir
       * verhandelten uns an der eigenen Zahl nach unten. Beides kostet.
       *
       * Bewusst OHNE zweite Zahl: Black Lock 5 (ein beworbenes Angebot, eine
       * Leiter) bleibt unangetastet. Es steht kein zweiter Preis da, sondern
       * ein offener Satz und ein Gespraech.
       */
      openEyebrow: "Größerer Umfang",
      openPrice: "auf Anfrage",
      openNote:
        "Mehrere Standorte, ein Shop, Schnittstellen in die Warenwirtschaft oder ein System, das über die Website hinausgeht: Das rechnen wir nach Aufwand — nach einem Gespräch, nicht nach Liste. Wir sagen Ihnen vorher, was es kostet, und danach ändert sich die Zahl nicht.",
      openCta: "Umfang besprechen",
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
            /* BF-A11 — Barrierefreiheit ist Bestandteil des Pakets, nicht
               Aufpreis. Wer neu baut, bekommt sie eingebaut; wer eine
               bestehende Seite hat, bekommt Pruefung und Behebung als eigene
               Leistung (/leistungen/barrierefreiheit-website). Eine zweite
               Preiswelt entsteht dadurch nicht: Das beworbene Angebot bleibt
               dieses Paket. */
            "Barrierefreiheit nach WCAG 2.1 AA eingebaut statt nachgerüstet",
            "Texte — geschrieben, nicht als Hausaufgabe zurückgegeben",
            "Fotoauswahl und Bildaufbereitung",
          ],
          note: "Festpreis für den vereinbarten Umfang. Fester Livetermin: vier Wochen ab Materialeingang. 50 % bei Start, 50 % bei Ihrer Freigabe. Seite und Zugänge gehören Ihnen ab Tag eins.",
          cta: "Projekt anfragen",
        },
        /*
         * Der zweite Einstieg. Der Preis ist DERSELBE wie in der Preisleiter
         * auf /leistungen/barrierefreiheit-website — eine Zahl, zwei
         * Ansichten. Die Behebung (2.000–4.000 EUR) steht hier bewusst
         * nicht: Sie ist kein Festpreis, und eine Spanne in einer
         * Preiskachel liest jeder als Angebot.
         */
        audit: {
          name: "Barrierefreiheits-Prüfung",
          who: "Für Betriebe, deren Seite schon steht",
          outcome: "Ein Befundbericht, der Ihnen gehört — auch wenn Sie danach nichts tun",
          includes: [
            "Manuelle Prüfung nach WCAG 2.1 AA über alle Hauptseiten",
            "Durchlauf mit Tastatur und Screenreader, nicht nur ein Scan",
            "Jeder Fund mit Seite, Element, Kriterium und Messwert",
            "Erklärung zur Barrierefreiheit als technische Vorlage",
            "Nachprüfung nach einer Behebung, mit Zahlen vorher und nachher",
          ],
          note: "Festpreis. Die Prüfung steht für sich und verpflichtet zu keiner Behebung. Was eine Behebung kostet, sagen wir erst, wenn wir den Code gesehen haben — für Ungesehenes nennt niemand seriös einen Festpreis.",
          cta: "Leistung ansehen",
        },
      },
    },
    /*
     * V2-3 — MANAGED BETRIEB, ALS LEISTUNG BENANNT.
     *
     * -----------------------------------------------------------------------
     * WARUM DAS EINE EIGENE SEKTION IST
     * „Betreiben" war bisher an drei Stellen verteilt: als dritter
     * Prozessschritt (eine Haltung), als „Ops-Retainer" in einer Fusszeile
     * der Werkschau und als Preiskaestchen unter den Paketen. Genau das ist
     * der Teil, der ein Haus von einer Agentur unterscheidet, die uebergibt
     * und verschwindet — und der einzige, der wiederkehrenden Umsatz traegt.
     * Als Fussnote gelesen ist er nichts davon.
     *
     * -----------------------------------------------------------------------
     * ER IST KEINE SECHSTE EBENE
     * Die fuenf Ebenen stehen senkrecht aufeinander. Der Betrieb liegt quer
     * darunter und beruehrt jede von ihnen (KIZILELMA §10.1: die horizontale
     * Lebenszyklus-Ebene). Deshalb steht die Sektion UNTER der Pyramide und
     * nicht als sechste Zeile darin — eine sechste Zeile haette behauptet,
     * man koenne Betrieb weglassen wie Automation.
     *
     * -----------------------------------------------------------------------
     * WAS HIER NICHT STEHT
     * Keine Verfuegbarkeit in Prozent, keine Reaktionszeit in Stunden, kein
     * „24/7". Zugesagt ist der Rueckruf am naechsten Werktag, weil das ein
     * Haus dieser Groesse halten kann. Eine SLA-Zahl, die an einem Sonntag
     * bricht, ist keine Zusage, sondern eine spaetere Enttaeuschung —
     * dieselbe Begruendung wie bei den zwei Werktagen in BF-8.
     */
    managed: {
      eyebrow: "Betreiben",
      title: "Managed Betrieb.",
      lead: "Die fünf Ebenen stehen senkrecht aufeinander. Das hier liegt quer darunter und berührt jede von ihnen: Was gebaut ist, muss laufen — jeden Tag, auch an den Tagen, an denen niemand daran denkt.",
      statement: "Wir übergeben nicht und verschwinden. Was wir gebaut haben, betreiben wir weiter — fällt nachts etwas aus, ist das unser Problem und nicht Ihres.",
      itemsLabel: "Was dazugehört",
      items: {
        hosting: {
          name: "Hosting",
          what: "Server, Domains und Zertifikate — eingerichtet, bezahlt und in unserer Hand.",
        },
        monitoring: {
          name: "Monitoring",
          what: "Die Seite meldet sich, wenn sie nicht erreichbar ist. Nicht Ihr Kunde.",
        },
        updates: {
          name: "Updates",
          what: "Abhängigkeiten und Systemstände bleiben aktuell — bevor aus einer Lücke ein Vorfall wird.",
        },
        security: {
          name: "Security",
          what: "Zugänge, Rechte, Header und Transportverschlüsselung auf dem Stand, der beim Bau gesetzt wurde.",
        },
        backups: {
          name: "Backups",
          what: "Gesichert und zurückspielbar. Ein Backup, das nie zurückgespielt wurde, ist keins.",
        },
        support: {
          name: "Support",
          what: "Ein Ansprechpartner, der das System selbst gebaut hat. Rückruf am nächsten Werktag.",
        },
        evolution: {
          name: "Weiterentwicklung",
          what: "Was sich im Betrieb als falsch herausstellt, wird geändert — nicht dokumentiert und stehen gelassen.",
        },
      },
      note: "Keine Verfügbarkeit in Prozent, keine Reaktionszeit in Stunden, kein „24/7“. Zugesagt ist, was hier steht — und das halten wir auch im Urlaub.",
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
      submit: "Anfrage senden",
      submitWhatsapp: "Lieber per WhatsApp",
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
        "gelesen und bin damit einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet und dafür über unseren Versanddienstleister Resend Inc. (USA) zugestellt werden — abgesichert über EU-Standardvertragsklauseln und, ergänzend, mit meiner ausdrücklichen Einwilligung in die Übermittlung in die USA (Art. 49 Abs. 1 lit. a DSGVO). Widerrufen kann ich das jederzeit für die Zukunft.",
      emailLabel: "E-Mail",
      emailPlaceholder: "damit wir antworten können",
      phoneLabel: "Telefon",
      phonePlaceholder: "für den Rückruf",
      errEmail: "Bitte prüfen Sie die E-Mail-Adresse.",
      errPhone: "Bitte geben Sie eine Telefonnummer an — wir rufen lieber an, als zu schreiben.",
      errPrivacy: "Bitte bestätigen Sie die Datenschutzerklärung.",
      /* Der Sende-Zustand. Kein Text ohne Deckung: „gesendet" steht erst da,
         wenn der Server die Zustellung bestätigt hat. */
      sending: "Wird gesendet …",
      sentTitle: "Ihre Anfrage ist angekommen.",
      sentBody:
        "Wir melden uns innerhalb von zwei Werktagen. Eine Bestätigung liegt in Ihrem Postfach — schauen Sie zur Sicherheit auch in den Spam-Ordner.",
      errSendFailed:
        "Die Anfrage konnte gerade nicht zugestellt werden. Bitte versuchen Sie es noch einmal — oder nehmen Sie einen der Wege rechts.",
      errNotConfigured:
        "Der Versandweg ist noch nicht eingerichtet. Bitte nutzen Sie so lange WhatsApp oder schreiben Sie an",
      /* BF-2 — die beiden Zustaende des Missbrauchsschutzes. Sie sagen, was
         der Mensch tun kann, statt "Fehler" zu melden. */
      errRateLimited:
        "Von diesem Anschluss kamen gerade mehrere Anfragen. Bitte versuchen Sie es in ein paar Minuten noch einmal — oder nehmen Sie WhatsApp.",
      errFormExpired:
        "Das Formular war zu lange offen. Bitte laden Sie die Seite neu und senden Sie noch einmal.",
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
      /* GROW-1: Diese drei standen hart in app/termin/page.tsx, auf Deutsch —
         und die alte Fassung versprach noch, die Anfrage gehe "an unser
         WhatsApp". Seit P3-a laeuft sie ueber app/api/lead. */
      metaTitle: "Terminwunsch senden",
      metaDescription:
        "In vier Schritten zum Gespräch: Gesprächsart wählen, Wunschzeiten angeben, Angaben ergänzen. Der Wunsch geht direkt an uns — verbindlich wird der Termin mit unserer Rückmeldung.",
      back: "Zurück zur Seite",
      eyebrow: "Kostenlose Erstberatung",
      title: "In vier Schritten zum Gespräch.",
      lead: "Sagen Sie uns, wann es Ihnen passt. Wir prüfen den Wunsch und bestätigen den Termin verbindlich per Rückmeldung — dieser Assistent bucht nichts automatisch.",
      stepOf: "Schritt",
      next: "Weiter",
      prev: "Zurück",
      /* BF-A3 / F8 — wird beim Schrittwechsel in einer Live-Region angesagt. */
      stepAnnounce: (step: number, title: string) => `Schritt ${step} von 4: ${title}`,
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
      /*
       * BF-1 — hier stand bis zuletzt ein Buchungskalender ohne Kalender.
       *
       * Der Assistent zeigte feste Uhrzeiten ("09:00, 10:00, 11:00 …") aus
       * zwei hartkodierten Listen. Kein Abgleich mit einem echten Kalender,
       * keine Sperre für belegte Zeiten — die Seite behauptete eine
       * Verfügbarkeit, die niemand kannte. Wer 10:00 wählte, las "Anfrage
       * angekommen" und hielt den Termin für gesetzt.
       *
       * Jetzt fragt der Assistent, statt zuzusagen: mehrere Wunschtage,
       * grobe Zeitfenster, und an jeder Stelle der Satz, dass die Bestätigung
       * von uns kommt. Ein echter Kalenderabgleich ist ein eigenes Projekt
       * und bewusst NICHT Teil dieser Stufe.
       */
      step2: {
        title: "Wann passt es Ihnen?",
        lead: "Wählen Sie einen oder mehrere Tage. Hervorgehobene Tage sind unsere bevorzugten Gesprächstage — andere Tage sind auf Anfrage möglich.",
        timeTitle: "Zeitfenster",
        timeLead: "Mehrfachauswahl möglich. Alle Zeiten in MEZ.",
        windows: [
          { id: "vormittag", label: "Vormittag", time: "09–12 Uhr" },
          { id: "nachmittag", label: "Nachmittag", time: "13–17 Uhr" },
          { id: "abend", label: "Früher Abend", time: "17–19 Uhr" },
        ],
        preferred: "bevorzugt",
        today: "heute",
        maxDates: "Bis zu drei Tage auswählbar.",
        /*
         * BF-A3 / F6 + F7 — Beschriftungen fuer Screenreader.
         *
         * Die Tages-Schaltflaechen trugen nur die Zahl: „31, Schaltflaeche" —
         * ohne Monat, ohne Wochentag, ohne den Zustand „gewaehlt". Und die
         * beiden Monatspfeile standen mit deutschem `aria-label` HART im
         * Markup; auf der tuerkischen Seite las ein Screenreader sie mit
         * tuerkischer Aussprache vor.
         */
        prevMonth: "Vorheriger Monat",
        nextMonth: "Nächster Monat",
        daySelected: "ausgewählt",
        dayPreferred: "bevorzugter Gesprächstag",
        daysLong: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
        notBooked:
          "Das ist noch keine Buchung. Wir prüfen Ihren Wunsch und bestätigen den Termin verbindlich per Rückmeldung.",
        errDate: "Bitte wählen Sie mindestens einen Tag.",
        errTime: "Bitte wählen Sie mindestens ein Zeitfenster.",
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
        sendWhatsapp: "Lieber per WhatsApp",
        privacyNote:
          "Ihre Angaben gehen an creaDIG und dienen ausschließlich der Bearbeitung dieses Terminwunsches.",
        title: "Prüfen und senden",
        lead: "Ein Klick, und Ihr Terminwunsch liegt bei uns im Postfach. Sie bekommen sofort eine Eingangsbestätigung per E-Mail; den Termin selbst bestätigen wir Ihnen verbindlich in unserer Rückmeldung. Wenn Ihnen WhatsApp lieber ist, geht es auch darüber.",
        send: "Terminwunsch senden",
        typeLabel: "Gesprächsart",
        dateLabel: "Wunschtage",
        timeLabel: "Zeitfenster",
        langLabel: "Sprache",
      },
      done: {
        title: "Terminwunsch erhalten.",
        lead: "Ihr Terminwunsch liegt bei uns im Postfach, eine Eingangsbestätigung ist per E-Mail unterwegs. Der Termin ist damit noch nicht gebucht — wir gleichen Ihre Wunschzeiten ab und bestätigen Ihnen verbindlich einen Termin.",
        reply: "Wir melden uns innerhalb von zwei Werktagen",
        home: "Zurück zur Startseite",
        again: "Weiteren Terminwunsch senden",
      },
      waTitle: "creaDIG — Terminwunsch",
      waType: "Art",
      waDate: "Wunschtage",
      waTime: "Zeitfenster",
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
    /*
     * BF-3 — die Seiten, die nur im Fehlerfall erscheinen.
     *
     * Bis hierher gab es sie nicht: Eine falsche Adresse zeigte die englische
     * Standardseite von Next ("This page could not be found"), ohne
     * Navigation, ohne Sprache, ohne einen Weg zurück. Wer über einen alten
     * Link oder einen QR-Code kam, landete auf einer Seite, die nicht nach
     * uns aussah — und war weg.
     *
     * Die Wege stehen bewusst hier und nicht als generische Links: Die
     * Kontaktseite ist einer davon, aber WhatsApp und E-Mail stehen daneben,
     * weil die Lead-Route bei fehlender Konfiguration 503 antwortet. Ein
     * Ausweg, der selbst kaputt sein kann, ist kein Ausweg.
     */
    errorPages: {
      notFound: {
        metaTitle: "Seite nicht gefunden",
        metaDescription:
          "Diese Adresse gibt es nicht. Hier sind die Wege zurück zu creaDIG — und die direkten Kontaktwege.",
        eyebrow: "Fehler 404",
        title: "Diese Seite gibt es nicht.",
        lead: "Entweder hat sich die Adresse geändert, oder es hat sich ein Tippfehler eingeschlichen. Beides ist schnell behoben.",
      },
      serverError: {
        eyebrow: "Fehler 500",
        title: "Hier ist etwas schiefgegangen.",
        lead: "Der Fehler liegt bei uns, nicht bei Ihnen. Versuchen Sie es noch einmal — und wenn es dabei bleibt, erreichen Sie uns direkt.",
        retry: "Noch einmal versuchen",
      },
      waysLabel: "Drei Wege zurück",
      ways: {
        home: { label: "Startseite", note: "Der Überblick über das ganze Haus." },
        services: { label: "Leistungen", note: "Fünf Ebenen — von der Marke bis zur künstlichen Intelligenz." },
        contact: { label: "Kontakt", note: "Formular, WhatsApp und der Weg zum Gespräch." },
      },
      directLabel: "Oder direkt",
      directNote: "Diese beiden Wege gehen immer — auch dann, wenn das Formular gerade nicht will.",
      whatsapp: "Per WhatsApp schreiben",
      mail: "E-Mail schreiben",
    },
    /*
     * BF-A4 — die eigene Erklaerung zur Barrierefreiheit.
     *
     * Sie ist FREIWILLIG. Ob creadig.de unter das BFSG faellt, ist nicht
     * geprueft und wird hier auch nicht behauptet — das waere eine rechtliche
     * Aussage, und die trifft ein Anwalt, nicht wir. Was hier steht, ist der
     * technische Stand: was geprueft wurde, was gefunden wurde, was behoben
     * ist und was offen bleibt.
     *
     * Jede Zahl in diesem Text hat einen Beleg in
     * `docs/barrierefreiheit-befund-eigen.md`. Steht dort nichts dazu, steht
     * es hier nicht.
     */
    accessibility: {
      metaTitle: "Erklärung zur Barrierefreiheit",
      metaDescription:
        "Stand der Barrierefreiheit von creadig.de: was wir geprüft haben, was wir gefunden und behoben haben, was offen bleibt — und wie Sie uns eine Barriere melden.",
      eyebrow: "Erklärung zur Barrierefreiheit",
      title: "Was diese Seite kann — und was nicht.",
      lead: "Wir verkaufen Barrierefreiheit. Also fangen wir bei uns an: Diese Seite ist nach WCAG 2.1 Stufe AA geprüft, die gefundenen Mängel sind behoben, und was offen bleibt, steht unten. Die Erklärung ist freiwillig.",

      voluntaryTitle: "Freiwillig, nicht Pflichterfüllung",
      voluntaryBody:
        "Ob diese Website unter das Barrierefreiheitsstärkungsgesetz fällt, haben wir nicht rechtlich prüfen lassen — und behaupten es deshalb auch nicht. Wir veröffentlichen diesen Stand, weil eine Agentur, die Barrierefreiheit anbietet, ihre eigene Seite offenlegen sollte. Eine rechtliche Bewertung ist das hier nicht.",

      statusTitle: "Stand der Umsetzung",
      statusBody:
        "Nach dem Prüflauf vom 23. August 2026 sind alle acht gefundenen Mängel behoben. Der automatisierte Lauf über 68 Durchläufe (17 Seiten, zwei Fenstergrößen, helle und dunkle Fassung) meldet keine maschinell feststellbare Verletzung von WCAG 2.1 AA mehr. Die Handprüfung — Tastaturdurchlauf, zugängliche Namen, Fokus, Struktur — ist ebenfalls ohne offenen Punkt.",
      statusNote:
        "„Keine maschinell feststellbare Verletzung“ heißt nicht „barrierefrei“. Automatische Werkzeuge finden nur einen Teil der Barrieren; deshalb steht unten, was wir nicht geprüft haben.",

      checkedTitle: "Was geprüft wurde",
      checkedIntro:
        "Zwölf Punkte nach WCAG 2.1 AA, in beiden Sprachfassungen, hell und dunkel, auf 1440 × 900 und 390 × 844 Pixeln:",
      checked: [
        "Kontrast von Text und von Bedienelementen, in beiden Erscheinungsbildern",
        "Alternativtexte für informative Bilder; dekorative Grafiken stummgeschaltet",
        "Beschriftung aller Formularfelder, einschließlich Auswahlfeldern und Einwilligungs-Kästchen",
        "Fehler- und Statusmeldungen: zugeordnet, angesagt, nicht nur farblich",
        "vollständige Bedienbarkeit ohne Maus, ohne Tastaturfalle",
        "sichtbarer Fokus auf jedem Bedienelement",
        "Sprungmarke, Überschriftenstruktur, Landmarks",
        "Sprachauszeichnung je Sprachfassung",
        "Verhalten bei „Bewegung reduzieren“, bei 200 % Zoom und 320 Pixel Breite",
      ],
      pagesLabel: "Geprüfte Seiten",
      pagesBody:
        "Startseite, Leistungen und eine Leistungs-Detailseite, Produkte und eine Produkt-Detailseite, Arbeiten, Unternehmen, Kontakt, der Termin-Assistent (Schritt 1 und Schritt 3), Datenschutz, Impressum und die Fehlerseite — jeweils in Deutsch und Türkisch.",

      fixedTitle: "Was gefunden und behoben wurde",
      fixedIntro:
        "Acht Mängel, keiner davon blockierend, sieben als „erheblich“ eingestuft. Alle im Code behoben — ohne Overlay, ohne Zusatz-Werkzeug:",
      fixed: [
        "Textfarben mit zu geringem Kontrast (bis herunter auf 2,4 : 1 bei Platzhaltern)",
        "kein sichtbarer Fokus auf drei Bedienelementen der Kopfleiste",
        "keine Sprungmarke zum Inhalt",
        "Kalendertage im Termin-Assistenten ohne aussagekräftigen Namen",
        "zwei deutsche Beschriftungen in der türkischen Fassung",
        "der Schrittwechsel im Termin-Assistenten wurde nicht angesagt",
      ],
      fixedEarlier:
        "Vorher, in einem eigenen Durchgang: Mit der Systemeinstellung „Bewegung reduzieren“ blieben eingeblendete Abschnitte unsichtbar — auf einer Seite 33 Blöcke. Der schwerste Fehler dieser Seite, und er traf genau die Menschen, für die die Einstellung gemacht ist.",

      openTitle: "Bekannte Einschränkungen",
      openIntro: "Was wir nicht geprüft haben, und was das bedeutet:",
      open: [
        "Kein Durchlauf mit einem blinden Nutzer. Wir haben die technischen Voraussetzungen geprüft (Name, Rolle, Zustand, Ansagen) — nicht, wie verständlich das Ergebnis im Alltag ist.",
        "Keine Prüfung mit Vergrößerungssoftware und keine Prüfung der Bedienung per Sprache.",
        "Die Erklärung stützt sich auf einen Prüflauf zu einem Stichtag. Jede Änderung an der Seite kann etwas brechen; der automatisierte Teil läuft deshalb bei jeder Änderung mit.",
        "Externe Wege — WhatsApp und das E-Mail-Programm — liegen außerhalb unserer Seite. Für ihre Barrierefreiheit können wir nicht einstehen. Deshalb gibt es zu jedem dieser Wege auch einen auf unserer Seite.",
      ],

      feedbackTitle: "Eine Barriere melden",
      feedbackBody:
        "Wenn Ihnen etwas auf dieser Seite den Weg versperrt, schreiben Sie uns — auch formlos, auch nur mit einem Satz. Wir antworten innerhalb von zwei Werktagen und sagen, ob und wann wir es beheben.",
      feedbackMail: "E-Mail schreiben",
      feedbackForm: "Über das Formular melden",
      feedbackNote:
        "Hilfreich, aber nicht nötig: welche Seite, welches Element, welches Hilfsmittel Sie benutzen.",

      methodTitle: "Wie geprüft wurde",
      methodBody:
        "Nach einem festen Raster mit zwölf Punkten, damit zwei Personen unabhängig zum selben Ergebnis kommen. Automatisiert mit axe-core, von Hand mit Tastatur und Prüfung der zugänglichen Namen. Raster und vollständiger Befund liegen offen im Quelltext dieser Seite.",
      updatedLabel: "Stand",
      updated: "23. August 2026",
    },
    legal: {
      imprintTitle: "Impressum",
      privacyTitle: "Datenschutz",
      imprintMetaDescription: "Anbieterkennzeichnung und Kontakt von creaDIG.",
      privacyMetaDescription:
        "Kein Tracking über Websites hinweg, keine Werbe-Cookies, keine Profilbildung. Was creaDIG verarbeitet, wer es im Auftrag tut und wie lange es bleibt.",
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
      privacyIntro: "Diese Seite ist bewusst schlank gebaut: kein Tracking über Websites hinweg, keine Werbe-Cookies, keine Profilbildung. Was wir einsetzen, steht unten mit Namen — und die Reichweitenmessung lädt erst, wenn Sie sie erlaubt haben.",
      /* SEC-2 — eine Liste statt drei verstreuter Absaetze. Quelle:
         lib/site-data.ts `processors`. */
      processorsLabel: "Wer in unserem Auftrag verarbeitet",
      processorsIntro:
        "Diese Dienstleister verarbeiten personenbezogene Daten für uns — weisungsgebunden, nach einem Vertrag über die Auftragsverarbeitung (Art. 28 DSGVO) und, weil sie in den USA sitzen, abgesichert über die EU-Standardvertragsklauseln nach Art. 46 Abs. 2 lit. c DSGVO. Weiter geben wir nichts.",
      processorPurposeLabel: "Wofür",
      /* R-1: die einzelnen Dienste je Anbieter, mit Namen — sonst laeuft
         Speed Insights unbenannt unter "Reichweitenmessung" mit. */
      processorServicesLabel: "Dienste",
      processorCountryLabel: "Sitz",
      processorSafeguardLabel: "Grundlage",
      processorSafeguardScc: "Auftragsverarbeitung nach Art. 28 DSGVO + EU-Standardvertragsklauseln",
      processorDpaLink: "Vertrag ansehen",
      processorPendingMark: "Bestätigung durch den Inhaber offen",
      processorPendingNote:
        "Die markierten Verträge hat der Inhaber noch nicht im jeweiligen Dashboard bestätigt und abgelegt. Wir schreiben deshalb nicht, dass sie bestehen — das holen wir vor dem Livegang nach.",
      processorPurposes: {
        vercel:
          "Hosting, Auslieferung der Seite über das Content-Delivery-Netz und Server-Logs. Nach Ihrer Einwilligung zusätzlich zwei getrennte Messungen: Vercel Web Analytics (wie oft welche Seite geöffnet wird) und Vercel Speed Insights (wie schnell die Seite bei echten Aufrufen lädt). Beide sind cookiefrei, verarbeiten aber IP-Adresse und Seitenpfad — ohne Einwilligung wird kein Skript geladen.",
        resend:
          "Zustellung der E-Mails aus unseren Formularen an unser Postfach und der Eingangsbestätigung an Sie.",
      },
      privacyPoints: [
        {
          title: "Server-Logs",
          body: "Beim Aufruf der Seite verarbeitet unser Hoster Vercel Inc. (USA) technisch notwendige Daten wie IP-Adresse, Zeitpunkt und aufgerufene Ressource. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO — ohne diese Verarbeitung lässt sich die Seite weder ausliefern noch gegen Missbrauch absichern. Mit Vercel besteht ein Vertrag über die Auftragsverarbeitung nach Art. 28 DSGVO.",
        },
        {
          title: "Hosting und Übermittlung in Drittländer",
          body: "Diese Seite ist vollständig statisch und wird über das weltweite Content-Delivery-Netz von Vercel ausgeliefert — jeweils vom nächstgelegenen Standort. Eine Verarbeitung von Zugriffsdaten außerhalb der EU, insbesondere in den USA, ist deshalb nicht ausgeschlossen. Abgesichert ist sie über den Auftragsverarbeitungsvertrag mit Vercel Inc. einschließlich der EU-Standardvertragsklauseln nach Art. 46 Abs. 2 lit. c DSGVO. Karten- und Werbedienste binden wir nicht ein und liefern alle Schriften lokal aus. Zur Reichweitenmessung setzen wir Vercel Web Analytics und Vercel Speed Insights ein — cookiefrei, ohne geräteübergreifende Kennung und erst nach Ihrer ausdrücklichen Einwilligung; ohne sie wird kein Skript geladen. Nutzen Sie den Kontaktweg über WhatsApp, gelten dafür zusätzlich die Bedingungen von Meta Platforms Ireland Ltd.",
        },
        {
          title: "Kontaktformular, Termin und Produkt-Nachfrage",
          body: "Wenn Sie eines unserer Formulare absenden, übermitteln wir Ihre Angaben — Name, Betrieb, E-Mail, Telefon und Ihre Nachricht — an unser Postfach info@creadig.de und schicken Ihnen eine Bestätigung. Für den Versand nutzen wir Resend (Resend Inc., USA) als Auftragsverarbeiter nach Art. 28 DSGVO, abgesichert über die EU-Standardvertragsklauseln nach Art. 46 Abs. 2 lit. c DSGVO. Rechtsgrundlage ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO, die Sie vor dem Absenden ausdrücklich erteilen und jederzeit für die Zukunft widerrufen können. Eine Datenbank führen wir nicht: Ihre Anfrage liegt ausschließlich in unserem E-Mail-Postfach. Wählen Sie stattdessen den Weg über WhatsApp, gelten dafür die Bedingungen von Meta Platforms Ireland Ltd.",
        },
        {
          title: "Wie lange wir etwas aufbewahren",
          body: "Server-Logs löschen wir nach 30 Tagen. Anfragen über unsere Formulare bewahren wir bis zu 6 Monate nach dem letzten Kontakt auf und löschen sie danach; kommt ein Vertrag zustande, gelten die handels- und steuerrechtlichen Aufbewahrungsfristen von 6 bzw. 10 Jahren (§ 257 HGB, § 147 AO). Ihre Einwilligungs-Entscheidung bleibt im lokalen Speicher Ihres Browsers, bis Sie sie ändern oder die Browserdaten löschen.",
        },
        {
          title: "Schriften",
          body: "Poppins und JetBrains Mono werden zusammen mit der Seite lokal ausgeliefert. Es besteht keine Verbindung zu Google Fonts; Ihre IP-Adresse wird dafür an keinen Dritten übermittelt.",
        },
        {
          title: "Einwilligung und lokale Speicherung",
          body: "Ihre Entscheidung aus dem Einwilligungs-Banner speichern wir im lokalen Speicher Ihres Browsers (Schlüssel „creadig_consent“). Nur mit Ihrer Einwilligung merken wir uns zusätzlich das Erscheinungsbild (hell/dunkel); ohne Einwilligung gilt diese Einstellung nur für die laufende Sitzung. Die Sprache speichern wir gar nicht — sie steht in der Adresse der Seite. Es werden dabei keine Daten an Dritte übermittelt. Ihre Wahl können Sie jederzeit unter „Cookie-Einstellungen“ anpassen oder widerrufen — beim Widerruf entfernen wir die betroffenen Einträge sofort.",
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
      /* SEC-4 · Art. 49 Abs. 1 lit. a DSGVO. Steht im Banner ueber den
         Schaltern — wer „Alle akzeptieren" drueckt, muss vorher gelesen
         haben, worin er einwilligt. */
      thirdCountry:
        "Die Reichweitenmessung läuft über Vercel Inc. in den USA. Erlauben Sie sie, willigen Sie zugleich ausdrücklich in die Übermittlung Ihrer Zugriffsdaten dorthin ein (Art. 49 Abs. 1 lit. a DSGVO) — zusätzlich zu den EU-Standardvertragsklauseln, die wir mit Vercel geschlossen haben. In den USA gilt kein dem europäischen gleichwertiges Datenschutzniveau: Behörden können Zugriff verlangen, und wirksame Rechtsbehelfe dagegen bestehen möglicherweise nicht. Ohne Ihre Einwilligung findet keine Übermittlung statt.",
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
          body: "Merkt sich das Erscheinungsbild (hell/dunkel). Ohne Einwilligung gilt Ihre Wahl nur für die laufende Sitzung. Die Sprache wird nicht gespeichert — sie steht in der Adresse (creadig.de für Deutsch, creadig.de/tr für Türkisch).",
        },
        statistics: {
          name: "Reichweitenmessung",
          body: "Vercel Web Analytics und Vercel Speed Insights — misst anonym, wie oft welche Seite geöffnet wird, ob eine Anfrage zustande kam und wie schnell die Seite bei Ihnen geladen hat. Es werden keine Cookies gesetzt und keine geräteübergreifende Kennung angelegt. Ohne Ihre Einwilligung wird kein Skript geladen.",
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
    meta: {
      siteTitle: "creaDIG — marka, web ve yapay zekâ için sistem evi",
      siteDescription:
        "creaDIG, kendi sistemlerinin çatısıdır — markadan yapay zekâya. Onları biz kurarız ve biz işletiriz. Almanya, Avusturya ve İsviçre için sistem evi.",
      ogTitle: "creaDIG — Başkalarının göremediğini inşa ediyoruz.",
      ogDescription:
        "2017'den beri sistem evi. Kendi ürünlerimiz, gerçek müşteriler ve kurup işlettiğimiz yapay zekâ sistemleri. Almanya, Avusturya, İsviçre.",
      organizationDescription:
        "Marka, web, operations, automation ve yapay zekâ için sistem evi. Kendi ürünlerimiz: meAI, fibero, CASSAMEA, meahv.",
      breadcrumbHome: "Ana sayfa",
      ogImageAlt: "creaDIG — marka, web ve yapay zekâ için sistem evi",
    },
    brand: {
      categoryLabel: "Kategori",
      category: "Klasik bir BT sistem evi değil. Dijital işletmeler için bir sistem evi.",
    },
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
        title: "Beş katman. Tek sistem.",
        lead: "Her katman bir sonrakini taşır. İstediğiniz katmanda başlayabilir, istediğiniz katmanda durabilirsiniz.",
        cta: "Tüm hizmetler",
      },
      products: {
        cta: "Tüm ürünler",
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
      publishedLabel: "Yayımlandı",
      sourcesLabel: "Kaynaklar",
      sourceStatement: "Bu sitenin erişilebilirlik beyanı",
      sourceService: "Hizmet olarak erişilebilirlik",
      backCta: "Tüm notlar",
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
      title: "Sistemlerin arkasındaki ev.",
      lead: "creaDIG, bir projeyi teslim edip kaybolan bir ajans değildir. Kendi ürünlerini icat eden, onları kendi kuran ve işler hâlde tutan bir evdir — markadan yazılıma, yazılımdan yapay zekâya.",
      statement: "Müşteriler için geliştirdiğimizi kendimiz için de işletiriz. Bir sistem evini bir sunumdan ayıran şey bu sağlamlıktır.",
      metaTitle: "Şirket — Osnabrück'ten sistem evi, 2017'den beri",
      metaDescription:
        "creaDIG: Osnabrück ICO InnovationsCentrum'da sistem evi, 2017'de kuruldu. Kurucu, çalışma modeli, odak alanları ve merkez — tek çatı, beş katman, kendi dört ürünümüz.",
      chapters: {
        label: "Yol",
        title: "Bir ev, duyuruyla kurulmaz.",
        items: [
          {
            year: "2017",
            title: "Başlangıç",
            body: "Osnabrück'te kuruldu — ajans olarak. Marka, görünüm, tek tek işler. Sonrasında gelen her şey bunun içinden çıktı, yanında değil.",
          },
          {
            year: null,
            title: "İşlerden ürünler doğdu",
            body: "Projelerde sürekli tekrar edeni her seferinde yeniden çözmek yerine kurduk. Dört kendi sistemimiz: meAI, fibero, CASSAMEA, meahv — icat ettik, kurduk ve kendimiz işletiyoruz.",
          },
          {
            year: "bugün",
            title: "Ev",
            body: "Merkez: Osnabrück ICO InnovationsCentrum. Kendi ürünlerimiz işler hâlde, müşteri işleri Almanya ve İsviçre'de — ve kuran el, sonrasında telefona da kendisi bakıyor.",
          },
        ],
      },
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
      eyebrow: "Katalog değil, kanıt",
      title: "Kendi işlettiğimiz dört ürün.",
      lead: "Bu sayfa bunların hiçbirini satmıyor. Burada olmalarının nedeni, kendimiz hakkında söylediğimizi kanıtlamaları: Bu sistemlerin her birini creaDIG sıfırdan kurdu — ve kendi günlük işinde kullanıyor. Sizin için ne kurduğumuz Hizmetler altında.",
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
      interest: {
        eyebrow: "İlgi",
        title: "Haber verelim mi?",
        body: "{product} işletmeniz için ilginç geliyorsa: adresinizi bırakın, zamanı geldiğinde size haber verelim. Bülten yok, reklam yok — yalnızca bu ürüne dair tek bir mesaj.",
        emailLabel: "E-posta",
        emailPlaceholder: "size ulaşabilmemiz için",
        nameLabel: "İsim (isteğe bağlı)",
        namePlaceholder: "size nasıl hitap edelim?",
        submit: "Haber verin",
        sentTitle: "Not aldık.",
        sentBody: "Bu ürünle ilgili söylenecek bir şey olduğunda size haber vereceğiz. Onay e-postası posta kutunuzda.",
        phoneOmitted: "belirtilmedi (ürün ilgisi)",
        messageTemplate: "{product} ürünü hakkında bilgi talebi — hazır olduğunda haber verilmesi rica olunur.",
      },
      breadcrumb: "Ürünler",
      problemLabel: "Ne için kuruldu",
      thesisLabel: "Tez",
      functionsLabel: "Neler yapabiliyor",
      architectureLabel: "Sistem & mimari",
      operationsLabel: "Nasıl işletiliyor",
      learningsLabel: "İşletme ne öğretti",
      statusBadge: {
        live: "Canlı",
        beta: "Özel beta",
        aufbau: "Kuruluyor",
        intern: "Kendi işletmemizde",
      },
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
      title: "Beş katman. Tek sistem.",
      lead: "Marka, dijital görünüm, operasyon, otomasyon, zekâ. Her katman bir sonrakini taşır — yan yana değil, bir sistem olarak. Kendi ürünlerimiz için kurduğumuzu sizin günlük işinize taşırız.",
      metaTitle: "Hizmetler — markadan yapay zekâya",
      metaDescription:
        "creaDIG'in beş katmanı: marka, dijital görünüm, operasyon, otomasyon ve yapay zekâ. Almanya, Avusturya ve İsviçre'deki işletmeler için — Almanca ve Türkçe.",
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
      hints: {
        leistungen: "Sizin için ne kurarız",
        produkte: "Kendi kurduğumuz ve işlettiğimiz sistemler — katalog değil, kanıt",
        arbeiten: "Adıyla anılan tamamlanmış projeler",
        unternehmen: "Arkasında kim var ve nasıl çalışıyoruz",
        insights: "İşin içinden gelen uzman metinler",
        kontakt: "Görüşmeye giden dört yol",
      },
      ueber: "Hakkımızda",
      pakete: "Paketler",
      kontakt: "İletişim",
      cta: "Projeye başla",
      menu: "Menüyü aç",
      close: "Menüyü kapat",
      menuTitle: "Gezinme",
      theme: "Görünümü değiştir",
      language: "Dili değiştir",
      skipToContent: "İçeriğe geç",
    },
    hero: {
      eyebrow: "Sistem evi · 2017'den beri · Almanya · Avusturya · İsviçre",
      headlineLine1: "Başkalarının",
      headlineLine2: "görmediğini",
      headlineLine3: "inşa ediyoruz.",
      subline:
        "creaDIG; Almanya, Avusturya ve İsviçre'deki işletmeler için marka, dijital sistemler, otomasyon ve kendi yazılım ürünlerini geliştirir.",
      ctaPrimary: "Projeye başla",
      ctaSecondary: "İşlerimiz",
      location: "Osnabrück · DACH",
      scroll: "Kaydır",
    },
    impact: {
      eyebrow: "Temel",
      title: "Konsept değil. İşleyen bir yapı.",
      figures: {
        since: { label: "Beri", detail: "Ajanstan sistem evine büyüdük." },
        products: { label: "Kendi ürünlerimiz", detail: "meAI, fibero, CASSAMEA, meahv — kendimiz kurduk." },
        systems: {
          label: "Üretimdeki sistemler",
          detail: "Bugün bir işletmenin günlük işinde çalışan sistemler.",
        },
        automated: {
          label: "Otomatikleşen işlemler",
          detail: "Daha önce birinin elle yaptığı adımlar.",
        },
        operatingYears: {
          label: "İşletmede geçen yıl",
          detail: "Teslim edip elimizde tuttuğumuz ilk sistemden itibaren.",
        },
      },
      facts: {
        regions: {
          label: "Pazarlar",
          value: "Almanya, Avusturya ve İsviçre",
          detail: "Almanca ve Türkçe danışıyor ve kuruyoruz.",
        },
        scope: {
          label: "Kapsam",
          value: "Markadan yapay zekâya",
          detail: "Beş katman. Tek sistem.",
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
      kindProduct: "Ürün",
      kindClientWork: "Müşteri işi",
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
      lead: "Her örnek aynı sırayla: işletme nasıl duruyordu, onu ne engelliyordu, neye ulaşmak istiyordu — ve ancak ondan sonra bizim payımız. Yalnızca müşterinin yazılı onayıyla; onay yoksa burada bir şey yazmaz.",
      chapters: {
        start: "Başlangıç durumu",
        problem: "Sorun",
        goal: "Hedef",
        role: "Bizim rolümüz",
        system: "Sistem",
        delivery: "Uygulama",
        result: "Sonuç",
        today: "Bugün",
      },
      metricsLabel: "Ölçütler",
      sourceLabel: "Kaynak",
      voiceLabel: "Müşteri görüşü",
    },
    reviews: {
      eyebrow: "Değerlendirmeler",
      title: "Müşteriler ne yazdı.",
      lead: "Özgün haliyle, isim ve tarihle. Değerlendirmeleri çevirmiyoruz — çevrilmiş bir cümle, o kişinin hiç yazmadığı bir cümledir.",
      verify: "Google'da oku",
      projectLabel: "Proje",
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
      boundaryLabel: "Ne yaparız — ve ne yapmayız",
      boundaryWeLabel: "Söz verdiklerimiz",
      boundaryNotWeLabel: "Söz vermediklerimiz",
      ownProofLabel: "Kendi sitemizde denetlendi",
      priceLadderLabel: "Maliyeti",
      priceFixed: "Sabit fiyat",
      priceOffer: "Denetimden sonra teklif",
      priceMonthly: "aylık",
      ctaTitle: "İşletmenize uygun mu?",
      ctaBody: "Yirmi dakika, ücretsiz ve bağlayıcı değil. İşletmeye bakar ve yardımcı olabilir miyiz, dürüstçe söyleriz.",
      ctaPrimary: "Ücretsiz ilk görüşme",
      ctaSecondary: "WhatsApp'tan sorun",
    },
    quickCheck: {
      eyebrow: "Kısa kontrol",
      title: "Sitenize dair üç madde. Ücretsiz.",
      lead: "Siz adresi verirsiniz, biz siteye bakarız — elle, klavye ve ekran okuyucuyla. Üç somut madde alırsınız: ne dikkatimizi çekti, nerede duruyor, ziyaretçileriniz için ne anlama geliyor.",
      siteLabel: "Web sitesi adresi",
      sitePlaceholder: "isletmem.com",
      errSite: "Lütfen web sitenizin adresini yazın — adres olmadan bakabileceğimiz bir şey yok.",
      messageLabel: "Bilmemiz gereken bir şey var mı?",
      messagePlaceholder: "İsteğe bağlı. Örneğin: mağaza, randevu akışı ya da bir müşterinizin geri bildirimi.",
      submit: "Kısa kontrol iste",
      sentTitle: "Ulaştı.",
      sentBody:
        "Sitenize bakar ve üç somut maddeyle size döneriz — ücretsiz ve bağlayıcı değil.",
      limitTitle: "Kısa kontrol ne değildir",
      limitBody:
        "Üç madde gösterir, hepsini değil. WCAG 2.1 AA'ya göre eksiksiz bir denetim değildir — o el işidir ve bir bakıştan uzun sürer. Hukuki bir değerlendirme de değildir.",
      humanNote:
        "Otomatik tarayıcı yok: Siteye bir insan bakar. Bu yüzden iki saniye değil, iki iş günü sürer.",
    },
    architecture: {
      eyebrow: "Ev",
      title: "Tek çatı, beş katman, dört ürün.",
      lead: "Tüm şirket tek bir görünümde: en üstte çatı, altında beş katman, onların altında yatay olarak işletme — ve en altta kendi dört ürünümüz, her biri oturduğu katmanda.",
      roofLabel: "Çatı",
      roofNote: "Sistem evi, Osnabrück, 2017'den beri",
      layersLabel: "Beş katman",
      operateLabel: "Altında yatay",
      operateNote: "Hosting · Monitoring · Güncellemeler · Güvenlik · Yedekler · Destek · Geliştirme",
      productsLabel: "Kendi dört ürünümüz",
      onLayer: "katman",
      caption:
        "Bir organizasyon şeması ya da pazar görünümü değil — kendi evimizin düzeni. Her katmanı hizmet olarak sunuyoruz; her ürün ise o katmanı kendimiz kurduğumuzun kanıtı.",
    },
    services: {
      eyebrow: "Hizmetler",
      title: "Beş katman. Tek sistem.",
      lead: "A'dan Z'ye çalışıyoruz — ilk logodan kendi yapay zekâ sistemine kadar. Her katman altındakinin üzerine kurulur.",
      forWhom: "Kimler için",
      entryLabel: "Başlangıç",
      problemLabel: "Başlangıç durumu",
      solutionLabel: "Ne kuruyoruz",
      resultLabel: "Sonrasında ne değişir",
      projectsLabel: "Tipik projeler",
      depthLabel: "Derinlemesine",
      layers: {
        identity: {
          name: "Identity",
          what: "Marka, isim, logo, görünüm — her şeyin durduğu temel.",
          who: "Girişimciler, yeni işletmeler, ilk kimliğini arayan esnaf.",
          problem:
            "İşletmenin adı var ama görüntüsü yok. Teklif, araç, fatura ve tabela her seferinde başka görünüyor — müşteri her temasta kiminle iş yaptığını yeniden anlamak zorunda kalıyor.",
          solution:
            "Logo değil, bir marka sistemi kuruyoruz: işaret, yazı karakteri, renkler ve bunların kullanımı; yazılı hâle getirilip teslim edilir — matbaa ve bir sonraki hizmet sağlayıcı tahmin etmeden çalışabilsin diye.",
          result: "İşletmeden çıkan her şey görünür biçimde ona ait olur. Soru sormaya, yeniden çizmeye, eski bir PDF'ten renk damlatmaya gerek kalmaz.",
          projects: [
            "Kurumsal tasarım",
            "Marka sistemi",
            "Logo & kelime markası",
            "Kurumsal basılı setler",
            "Arayüz temelleri",
          ],
        },
        digital: {
          name: "Digital",
          what: "Web sitesi, mağaza, açılış sayfaları — görünür, hızlı, bulunabilir.",
          who: "Fırın, klinik, restoran, esnaf işletmesi.",
          problem:
            "Web sitesi bir broşür. İnternette duruyor ama hiçbir şeyi karşılamıyor — talep yok, başvuru yok, randevu yok. Kaç kişinin yanından geçip gittiğini de kimse bilmiyor.",
          solution:
            "Görünümü işletmenin bir parçası olarak kuruyoruz: web sitesi, portal, web uygulaması ya da mağaza; sonrasında olan her şeye bağlı. WCAG 2.1 AA'ya göre erişilebilirlik sonradan eklenmiyor, baştan içeride oluyor.",
          result: "Talepler yerine ulaşır, kimden geldiği bellidir ve işlendiği yere düşer — cuma günleri kimsenin bakmadığı bir posta kutusuna değil.",
          projects: [
            "Web siteleri",
            "Web uygulamaları",
            "Portallar",
            "E-ticaret",
            "Mobil",
            "Erişilebilirlik",
          ],
        },
        operations: {
          name: "Operations",
          what: "Kasa, planlama, faturalama, yönetim — işleyiş sistem içinde.",
          who: "Gastronomi, saha ekipleri, yönetim, hizmet sağlayıcılar.",
          problem:
            "İşletme kâğıtlar, tablolar ve birbirinden habersiz üç program üzerinden yürüyor. Bir soruya cevap vermek isteyen dört yere bakıyor — cevap daha tamamlanmadan eskimiş oluyor.",
          solution:
            "İşletmeyi tek bir sistemde yapılandırıyoruz: iş emri, müşteri, belge ve rakam tek yerde; kalması gerekenlere bağlantılarla. Özel olması gerekeni kuruyoruz, hazırı olanı ikinci kez satın almıyoruz.",
          result: "Dört bilgi yerine tek bilgi. Yeni gelen biri de bir meslektaşın kafasında değil, sistemin içinde yolunu buluyor.",
          projects: [
            "CRM",
            "İş emri yönetimi",
            "Backoffice",
            "Veri & entegrasyonlar",
            "Gösterge panelleri",
            "Özel yazılım",
          ],
        },
        automation: {
          name: "Automation",
          what: "Tekrar eden işi insan değil, sistem üstlenir.",
          who: "6–20 çalışanı ve büyüyen evrak yükü olan işletmeler.",
          problem:
            "Aynı iş, her gün, elle: belge girmek, e-postaları yönlendirmek, teklifleri takip etmek, listeleri karşılaştırmak. Fark edilmiyor, çünkü hiçbiri tek seferde çok değil — ay sonunda fark ediliyor.",
          solution:
            "İnsanları değil, yolları otomatikleştiriyoruz: akışları, entegrasyonları, belgeleri ve gelen e-postaları sistem üstleniyor. Yanında her zaman, geçmeyen bir şeyi bir insanın gördüğü bir yer duruyor.",
          result: "Tekrar eden iş, kimse aklında tutmadan oluyor. Bir şey takıldığında ise sessizce beklemek yerine haber veriyor.",
          projects: [
            "İş akışları",
            "API & entegrasyonlar",
            "Belge işleme",
            "E-posta işleme",
            "Süreç otomasyonu",
          ],
        },
        intelligence: {
          name: "Intelligence · meAI",
          what: "Düşünen, hazırlayan ve genel görünümü koruyan bir yapay zekâ sistemi.",
          who: "Daha hızlı karar almak isteyen yerleşik işletmeler.",
          problem:
            "Sayılar var, karar yok. Karar vermek isteyen beş rapor açıyor ve sonrasında daha çok şey biliyor — ama daha iyi bilmiyor.",
          solution:
            "Bunun üzerine gösteren değil okuyan bir sistem kuruyoruz: sıraya koyar, önceliklendirir ve seçenekleri hazırlar. meAI bizim kendi sistemimiz — biz kurduk, biz işletiyoruz ve bir işletmeye gitmeden önce kendi günlük işimizde denendi.",
          result: "„Bugün önce ne var“ sorusunun bir cevabı olur — ve yanında nedeni yazar.",
          projects: [
            "Analiz",
            "Önceliklendirme",
            "Bilgi yönetimi",
            "Yapay zekâ & ajanlar",
            "meAI",
          ],
        },
      },
    },
    houseProducts: {
      eyebrow: "Çatının altında",
      title: "Dört kendi ürünümüz.",
      lead: "Kendimiz icat ettik, kendimiz kurduk, kendimiz işletiyoruz — ve tam da bu yüzden başkaları için ne kurabileceğimizin en iyi kanıtı. Katalog değil: Burada hiçbiri satılmıyor. Amiral gemisi meAI'ın ayrıntılı bölümü hemen aşağıda.",
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
          what: "Bize yazarsınız — WhatsApp'tan, form üzerinden ya da doğrudan bir randevu talebiyle. İki iş günü içinde size döneriz.",
        },
        analysis: {
          name: "Analiz",
          what: "Yirmi dakikalık ilk görüşme, ücretsiz. İşletmeye bakar; neyi kurardık, neyi kurmazdık açıkça söyleriz.",
        },
        offer: {
          name: "Teklif",
          what: "Kapsamı, fiyatı ve süresi belli sabit bir teklif. Saat çizelgesi yok, sonradan ek talep yok.",
        },
        implementation: {
          name: "Uygulama",
          what: "Teklifte yazan neyi söylüyorsa onu kurarız — yol boyunca görebileceğiniz aşamalar hâlinde. Sonunda sürpriz değil, ara durumlar alırsınız.",
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
      founderLabel: "Kurucu & sistem lideri",
      founder: "Muhammed Emin Akyol",
      body1:
        "creaDIG 2017'de ajans olarak başladı. İşlerden ürünler, ürünlerden bir sistem evi doğdu — bugün bu çatı altında dört kendi sistemimiz ve onları kurduğumuz işletmelerin bakımı yürüyor.",
      body2:
        "Ekip büyüyor; yeni pozisyonlar hazırlanıyor. Bugün nasıl çalıştığımız — kim yürütüyor, çekirdek ekipte kim var, kim ekleniyor — aşağıda yazıyor, süslemeden.",
      nicheLabel: "Odak alanları",
      niches: [
        "6–20 çalışanlı zanaat işletmeleri — ağırlıkla Almanya",
        "Kendi BT birimi olmayan küçük ve orta ölçekli işletmeler",
        "Almanya ve İsviçre'de gastronomi",
      ],
      nicheOpen:
        "Bunlar ağırlık noktalarımız, koşul değil. Her sektörden ve her büyüklükten işletmeyle çalışıyoruz — Almanca ve Türkçe.",
      standardLabel: "İki dil, tek standart",
      standardBody:
        "Danışmanlık, belgeler, sözleşmeler ve sürekli destek Almanca ve Türkçe. Aynı standart, aynı belgelendirme, aynı fatura — yalnızca işletmede kararın verildiği dilde. Arada tercüman yok, ikinci ve daha ince bir sürüm yok.",
      locationsLabel: "Merkez",
      marketsLabel: "Pazarlar",
      honesty: "Uydurma çalışan veya ciro sayıları vermiyoruz. Kanıtımız yaptığımız işlerdir.",
    },
    workModel: {
      eyebrow: "Nasıl çalışıyoruz",
      title: "Kurucu yönetiminde — ve bir projenin ihtiyaç duyduğu kişilerle.",
      lead: "Ne kadar büyük olduğumuzu değil, nasıl çalıştığımızı söylüyoruz. Bu hem daha dürüst hem de sizin için daha yararlı bir bilgi: Projenizi kimin yürüttüğünü ve başında kimin oturduğunu bilirsiniz.",
      items: {
        founder: {
          name: "Kurucu yürütür",
          what: "Her projenin bir sorumlusu vardır ve bu hep aynı kişidir. İlk görüşmeyi o yapar, sistemi o tasarlar ve bir şey olduğunda telefona o çıkar. Satıştan uygulamaya geçişte kişi değişmez, orada bulunmamış birine devir olmaz.",
        },
        core: {
          name: "Küçük bir çekirdek ekip",
          what: "Herkesin diğerlerinin ne üzerinde çalıştığını bileceği kadar küçük. Bir tatilin projeyi durdurmayacağı kadar büyük.",
        },
        network: {
          name: "İhtiyaca göre uzmanlar",
          what: "Bir projenin ek olarak ihtiyaç duyduğu şey için — geliştirme, metin, strateji — DACH bölgesinde sabit bir ağla çalışıyoruz. Adı sanı belirsiz bir alım değil: daha önce birlikte iş kurduğumuz kişiler.",
        },
      },
      fieldsLabel: "Sorumluluk alanları",
      fieldsNote: "Beş katman, tek sorumluluk. Bu evin yapısıdır — bir yetenek listesi değil.",
      honesty:
        "Çalışan sayısı ya da ciro rakamı vermiyoruz. İkisi de iddia edilebilir ve ikisi de projeniz hakkında bir şey söylemez. Önemli olan, başında kimin oturduğudur.",
    },
    photos: {
      eyebrow: "Evden",
      title: "Burada ortaya çıkıyor.",
      lead: "Stok fotoğraf yok, ofis stüdyosu çekimi yok. Burada duran şey, işin yapıldığı yerdir — ya da hiçbir şey durmaz.",
      slots: {
        buero: {
          caption: "Osnabrück ICO InnovationsCentrum'daki çalışma alanı.",
          alt: "creaDIG'in Osnabrück ICO InnovationsCentrum'daki çalışma alanı",
        },
        ico: {
          caption: "ICO InnovationsCentrum Osnabrück, Albert-Einstein-Straße 1.",
          alt: "Albert-Einstein-Straße 1'deki ICO InnovationsCentrum Osnabrück",
        },
        arbeitsplatz: {
          caption: "Üzerinde gerçek iş olan ekranlar.",
          alt: "creaDIG'de çalışan sistemlerin göründüğü çalışma masası",
        },
        whiteboard: {
          caption: "Gerçekten böyle ortaya çıkmış bir eskiz.",
          alt: "Bir projeden çıkmış sistem eskizinin bulunduğu beyaz tahta",
        },
      },
    },
    location: {
      eyebrow: "Merkezimiz",
      note: "Bizi Osnabrück InnovationsCentrum'da bulabilirsiniz. Randevular önceden anlaşmayla — yüz yüze, görüntülü ya da WhatsApp üzerinden.",
      mapLink: "Haritada görüntüle",
      photoAlt:
        "Albert-Einstein-Straße 1'deki ICO InnovationsCentrum Osnabrück — creaDIG'in merkezi",
    },
    packages: {
      eyebrow: "Giriş teklifleri",
      title: "İçeri iki yol — ikisi de sabit fiyatlı.",
      lead: "Her işletme en üstten başlamaz. Bu iki teklif giriş adımıdır: sınırları belli, fiyatı önceden yazılı, tüm evi birden sipariş etmeden.",
      entryNote:
        "Bu giriş adımıdır, ana mimari değil. creaDIG'in sistem evi olarak kurduğu şey yukarıda beş katmanda durur ve pakete göre değil, kapsama göre hesaplanır.",
      forWhom: "Kimler için",
      recommended: "Önerimiz",
      tierLabel: "Giriş",
      referenceNote:
        "İlk iki işletme için referans fiyatı — karşılığında bir görüş cümlesi, referans olarak anılma ve iki fotoğraf. Üçüncü işletmeden itibaren normal fiyat geçerlidir.",
      regularLabel: "Normal fiyat",
      netNote: "Tüm fiyatlar nettir, %19 KDV hariç.",
      openEyebrow: "Daha büyük kapsam",
      openPrice: "talep üzerine",
      openNote:
        "Birden fazla şube, bir mağaza, stok sistemine bağlantılar ya da web sitesinin ötesine geçen bir sistem: Bunu listeye göre değil, görüşmeden sonra işe göre hesaplarız. Maliyeti önceden söyleriz ve sonrasında rakam değişmez.",
      openCta: "Kapsamı konuşalım",
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
            "WCAG 2.1 AA'ya göre erişilebilirlik baştan içeride, sonradan eklenmiş değil",
            "Metinler — size ödev olarak geri verilmez, biz yazarız",
            "Fotoğraf seçimi ve görsel hazırlığı",
          ],
          note: "Kararlaştırılan kapsam için sabit fiyat. Sabit yayın tarihi: malzeme ulaştıktan sonra dört hafta. Başlangıçta %50, onayınızda %50. Site ve tüm erişimler ilk günden itibaren sizindir.",
          cta: "Proje talebi gönder",
        },
        audit: {
          name: "Erişilebilirlik denetimi",
          who: "Sitesi hâlihazırda ayakta olan işletmeler için",
          outcome: "Size ait olan bir bulgu raporu — sonrasında hiçbir şey yapmasanız da",
          includes: [
            "Tüm ana sayfalarda WCAG 2.1 AA'ya göre elle denetim",
            "Klavye ve ekran okuyucuyla baştan sona geçiş, yalnızca tarama değil",
            "Her bulgu sayfası, öğesi, ölçütü ve ölçülen değeriyle",
            "Teknik taslak olarak erişilebilirlik beyanı",
            "Giderme sonrası yeniden denetim, öncesi ve sonrası sayılarla",
          ],
          note: "Sabit fiyat. Denetim tek başına durur ve hiçbir gidermeye mecbur bırakmaz. Gidermenin ne tutacağını ancak kodu gördükten sonra söyleriz — görülmemiş bir iş için kimse ciddi biçimde sabit fiyat vermez.",
          cta: "Hizmeti gör",
        },
      },
    },
    managed: {
      eyebrow: "İşletme",
      title: "Managed işletme.",
      lead: "Beş katman dikey olarak üst üste durur. Bu ise onların altında yatay uzanır ve hepsine dokunur: Kurulan şeyin işlemesi gerekir — her gün, kimsenin aklına gelmediği günlerde de.",
      statement: "Teslim edip kaybolmayız. Kurduğumuz şeyi işletmeye devam ederiz — gece bir şey düşerse bu bizim sorunumuzdur, sizin değil.",
      itemsLabel: "Neler dahil",
      items: {
        hosting: {
          name: "Hosting",
          what: "Sunucu, alan adları ve sertifikalar — kurulmuş, ödenmiş ve bizim elimizde.",
        },
        monitoring: {
          name: "Monitoring",
          what: "Site erişilemez olduğunda kendisi haber verir. Müşteriniz değil.",
        },
        updates: {
          name: "Güncellemeler",
          what: "Bağımlılıklar ve sistem sürümleri güncel kalır — bir açık olaya dönüşmeden önce.",
        },
        security: {
          name: "Güvenlik",
          what: "Erişimler, yetkiler, başlıklar ve aktarım şifrelemesi, kurulumda belirlenen düzeyde tutulur.",
        },
        backups: {
          name: "Yedekler",
          what: "Yedeklenir ve geri yüklenebilir. Hiç geri yüklenmemiş bir yedek, yedek değildir.",
        },
        support: {
          name: "Destek",
          what: "Sistemi bizzat kurmuş tek bir muhatap. Bir sonraki iş günü geri arama.",
        },
        evolution: {
          name: "Geliştirme",
          what: "İşletmede yanlış olduğu ortaya çıkan şey değiştirilir — belgelenip öylece bırakılmaz.",
        },
      },
      note: "Yüzdeyle verilmiş erişilebilirlik oranı yok, saatle verilmiş yanıt süresi yok, „7/24“ yok. Verdiğimiz söz burada yazandır — tatilde de tutarız.",
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
      submit: "Talebi gönder",
      submitWhatsapp: "WhatsApp ile göndereyim",
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
        "okudum; bilgilerimin talebimin işlenmesi amacıyla kullanılmasını ve bunun için gönderim hizmet sağlayıcımız Resend Inc. (ABD) üzerinden iletilmesini kabul ediyorum — AB standart sözleşme maddeleriyle güvence altında ve buna ek olarak ABD'ye aktarıma açık onayımla (GDPR Md. 49/1-a). Onayımı geleceğe yönelik olarak istediğim zaman geri alabilirim.",
      emailLabel: "E-posta",
      emailPlaceholder: "size dönebilmemiz için",
      phoneLabel: "Telefon",
      phonePlaceholder: "geri arama için",
      errEmail: "Lütfen e-posta adresini kontrol edin.",
      errPhone: "Lütfen bir telefon numarası girin — yazmaktansa aramayı tercih ederiz.",
      errPrivacy: "Lütfen gizlilik politikasını onaylayın.",
      sending: "Gönderiliyor …",
      sentTitle: "Talebiniz bize ulaştı.",
      sentBody:
        "İki iş günü içinde size döneceğiz. Onay e-postası posta kutunuzda — güvenlik için spam klasörüne de bakın.",
      errSendFailed:
        "Talep şu anda iletilemedi. Lütfen tekrar deneyin — ya da sağdaki yollardan birini kullanın.",
      errNotConfigured:
        "Gönderim yolu henüz kurulmadı. O zamana kadar WhatsApp'ı kullanın ya da şu adrese yazın:",
      errRateLimited:
        "Bu bağlantıdan az önce birkaç talep geldi. Lütfen birkaç dakika sonra tekrar deneyin — ya da WhatsApp'ı kullanın.",
      errFormExpired:
        "Form çok uzun süre açık kaldı. Lütfen sayfayı yenileyip yeniden gönderin.",
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
      metaTitle: "Randevu talebi gönder",
      metaDescription:
        "Dört adımda görüşmeye: görüşme türünü seçin, size uygun zamanları belirtin, bilgileri tamamlayın. Talep doğrudan bize ulaşır — randevu, dönüşümüzle kesinleşir.",
      back: "Sayfaya dön",
      eyebrow: "Ücretsiz ilk görüşme",
      title: "Dört adımda görüşmeye.",
      lead: "Size ne zaman uyduğunu söyleyin. Talebinizi inceler ve randevuyu dönüşümüzde bağlayıcı olarak onaylarız — bu asistan otomatik randevu oluşturmaz.",
      stepOf: "Adım",
      next: "Devam",
      prev: "Geri",
      stepAnnounce: (step: number, title: string) => `4 adımdan ${step}. adım: ${title}`,
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
        title: "Size ne zaman uyar?",
        lead: "Bir veya birkaç gün seçin. Vurgulanan günler tercih ettiğimiz görüşme günleridir — diğer günler talep üzerine mümkündür.",
        timeTitle: "Zaman aralığı",
        timeLead: "Birden fazla seçebilirsiniz. Tüm saatler Orta Avrupa saatidir.",
        windows: [
          { id: "vormittag", label: "Sabah", time: "09.00–12.00" },
          { id: "nachmittag", label: "Öğleden sonra", time: "13.00–17.00" },
          { id: "abend", label: "Akşamüstü", time: "17.00–19.00" },
        ],
        preferred: "tercihli",
        today: "bugün",
        maxDates: "En fazla üç gün seçilebilir.",
        prevMonth: "Önceki ay",
        nextMonth: "Sonraki ay",
        daySelected: "seçildi",
        dayPreferred: "tercih edilen görüşme günü",
        daysLong: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
        notBooked:
          "Bu henüz bir rezervasyon değildir. Talebinizi inceler ve randevuyu dönüşümüzde bağlayıcı olarak onaylarız.",
        errDate: "Lütfen en az bir gün seçin.",
        errTime: "Lütfen en az bir zaman aralığı seçin.",
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
        sendWhatsapp: "WhatsApp ile göndereyim",
        privacyNote:
          "Bilgileriniz creaDIG'e iletilir ve yalnızca bu randevu talebinin işlenmesi için kullanılır.",
        title: "Kontrol edin ve gönderin",
        lead: "Tek tıkla randevu talebiniz posta kutumuza düşer. Anında e-posta ile alındı onayı alırsınız; randevunun kendisini dönüşümüzde bağlayıcı olarak onaylarız. WhatsApp'ı tercih ediyorsanız o yol da açık.",
        send: "Randevu talebini gönder",
        typeLabel: "Görüşme türü",
        dateLabel: "Tercih edilen günler",
        timeLabel: "Zaman aralığı",
        langLabel: "Dil",
      },
      done: {
        title: "Randevu talebiniz alındı.",
        lead: "Talebiniz posta kutumuzda, alındı onayı e-posta ile yolda. Randevu henüz kesinleşmedi — belirttiğiniz zamanları değerlendirip size bağlayıcı bir randevu onayı göndereceğiz.",
        reply: "İki iş günü içinde size döneceğiz",
        home: "Ana sayfaya dön",
        again: "Yeni randevu talebi gönder",
      },
      waTitle: "creaDIG — Randevu talebi",
      waType: "Tür",
      waDate: "Tercih edilen günler",
      waTime: "Zaman aralığı",
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
    errorPages: {
      notFound: {
        metaTitle: "Sayfa bulunamadı",
        metaDescription:
          "Bu adres mevcut değil. creaDIG'e dönüş yolları ve doğrudan iletişim kanalları burada.",
        eyebrow: "Hata 404",
        title: "Bu sayfa mevcut değil.",
        lead: "Ya adres değişti ya da yazımda küçük bir hata var. İkisi de hızlıca çözülür.",
      },
      serverError: {
        eyebrow: "Hata 500",
        title: "Bir şeyler ters gitti.",
        lead: "Hata sizde değil, bizde. Lütfen tekrar deneyin — sorun sürerse bize doğrudan ulaşabilirsiniz.",
        retry: "Tekrar dene",
      },
      waysLabel: "Üç dönüş yolu",
      ways: {
        home: { label: "Ana sayfa", note: "Tüm evin genel görünümü." },
        services: { label: "Hizmetler", note: "Beş katman — markadan yapay zekâya." },
        contact: { label: "İletişim", note: "Form, WhatsApp ve görüşmeye giden yol." },
      },
      directLabel: "Ya da doğrudan",
      directNote: "Bu iki yol her zaman açıktır — form çalışmadığında bile.",
      whatsapp: "WhatsApp'tan yazın",
      mail: "E-posta gönderin",
    },
    accessibility: {
      metaTitle: "Erişilebilirlik beyanı",
      metaDescription:
        "creadig.de'nin erişilebilirlik durumu: neyi denetledik, ne bulduk ve giderdik, ne açık kaldı — ve bir engeli bize nasıl bildirirsiniz.",
      eyebrow: "Erişilebilirlik beyanı",
      title: "Bu sayfa neyi yapabiliyor — neyi yapamıyor.",
      lead: "Erişilebilirlik satıyoruz. O yüzden kendimizden başlıyoruz: Bu sayfa WCAG 2.1 AA seviyesine göre denetlendi, bulunan eksikler giderildi ve açık kalanlar aşağıda yazıyor. Bu beyan gönüllüdür.",

      voluntaryTitle: "Gönüllü, yasal bir zorunluluk beyanı değil",
      voluntaryBody:
        "Bu web sitesinin Alman Erişilebilirliği Güçlendirme Yasası (BFSG) kapsamına girip girmediğini hukuken incelettirmedik — bu yüzden öyle olduğunu da iddia etmiyoruz. Bu durumu, erişilebilirlik sunan bir ajansın kendi sayfasını açıkça ortaya koyması gerektiği için yayımlıyoruz. Burada yazanlar hukuki bir değerlendirme değildir.",

      statusTitle: "Uygulama durumu",
      statusBody:
        "23 Ağustos 2026 tarihli denetimden sonra bulunan sekiz eksiğin tamamı giderildi. 68 turluk otomatik denetim (17 sayfa, iki pencere boyutu, açık ve koyu görünüm) artık makineyle saptanabilir hiçbir WCAG 2.1 AA ihlali bildirmiyor. Elle yapılan denetim — klavyeyle gezinme, erişilebilir adlar, odak, yapı — de açık nokta bırakmıyor.",
      statusNote:
        "„Makineyle saptanabilir ihlal yok“ ifadesi „erişilebilir“ demek değildir. Otomatik araçlar engellerin yalnızca bir kısmını bulur; bu yüzden neyi denetlemediğimiz aşağıda yazıyor.",

      checkedTitle: "Neyi denetledik",
      checkedIntro:
        "WCAG 2.1 AA'ya göre on iki madde, her iki dil sürümünde, açık ve koyu görünümde, 1440 × 900 ve 390 × 844 piksel boyutlarında:",
      checked: [
        "Metin ve kontrol öğelerinin kontrastı, her iki görünümde",
        "Bilgi taşıyan görseller için alternatif metin; süsleyici grafikler sessize alındı",
        "Tüm form alanlarının etiketlenmesi — seçim listeleri ve onay kutuları dahil",
        "Hata ve durum mesajları: ilişkilendirilmiş, sesli okunuyor, yalnızca renkle verilmiyor",
        "Faresiz tam kullanılabilirlik, klavye tuzağı olmadan",
        "Her kontrol öğesinde görünür odak",
        "İçeriğe atlama bağlantısı, başlık yapısı, landmark'lar",
        "Her dil sürümü için dil işaretlemesi",
        "„Hareketi azalt“ ayarında, %200 yakınlaştırmada ve 320 piksel genişlikte davranış",
      ],
      pagesLabel: "Denetlenen sayfalar",
      pagesBody:
        "Ana sayfa, Hizmetler ve bir hizmet ayrıntı sayfası, Ürünler ve bir ürün ayrıntı sayfası, İşler, Şirket, İletişim, randevu asistanı (1. ve 3. adım), Gizlilik, Künye ve hata sayfası — her biri Almanca ve Türkçe.",

      fixedTitle: "Ne bulundu ve giderildi",
      fixedIntro:
        "Sekiz eksik; hiçbiri engelleyici değil, yedisi „ciddi“ olarak sınıflandırıldı. Hepsi kodda giderildi — overlay yok, ek araç yok:",
      fixed: [
        "Kontrastı yetersiz metin renkleri (yer tutucularda 2,4 : 1'e kadar düşen)",
        "üst çubuktaki üç kontrol öğesinde görünür odak yokluğu",
        "içeriğe atlama bağlantısının bulunmaması",
        "randevu asistanındaki takvim günlerinin anlamlı bir ada sahip olmaması",
        "Türkçe sürümde kalan iki Almanca etiket",
        "randevu asistanında adım değişiminin sesli bildirilmemesi",
      ],
      fixedEarlier:
        "Daha önce, ayrı bir turda: „Hareketi azalt“ sistem ayarı açıkken, kaydırmayla beliren bölümler görünmez kalıyordu — bir sayfada 33 blok. Bu sayfanın en ağır hatasıydı ve tam olarak bu ayarın kendisi için yapıldığı insanları etkiliyordu.",

      openTitle: "Bilinen sınırlamalar",
      openIntro: "Neyi denetlemediğimiz ve bunun anlamı:",
      open: [
        "Görme engelli bir kullanıcıyla deneme yapılmadı. Teknik ön koşulları denetledik (ad, rol, durum, sesli bildirimler) — sonucun günlük kullanımda ne kadar anlaşılır olduğunu değil.",
        "Büyüteç yazılımıyla ve sesle kullanım denetlenmedi.",
        "Beyan, belirli bir tarihteki denetime dayanır. Sayfadaki her değişiklik bir şeyi bozabilir; bu yüzden otomatik bölüm her değişiklikte birlikte çalışır.",
        "Dış yollar — WhatsApp ve e-posta programınız — sayfamızın dışındadır. Onların erişilebilirliğinden sorumlu olamayız. Bu yüzden her biri için sayfamızda da bir yol vardır.",
      ],

      feedbackTitle: "Bir engeli bildirin",
      feedbackBody:
        "Bu sayfada bir şey önünüzü kesiyorsa bize yazın — serbest biçimde, tek bir cümleyle bile olur. İki iş günü içinde yanıtlar, sorunu giderip gideremeyeceğimizi ve ne zaman gidereceğimizi söyleriz.",
      feedbackMail: "E-posta gönderin",
      feedbackForm: "Form üzerinden bildirin",
      feedbackNote:
        "Yardımcı olur ama şart değil: hangi sayfa, hangi öğe, hangi yardımcı teknolojiyi kullandığınız.",

      methodTitle: "Nasıl denetlendi",
      methodBody:
        "İki kişinin bağımsız olarak aynı sonuca ulaşması için on iki maddelik sabit bir şablona göre. Otomatik olarak axe-core ile, elle klavye ve erişilebilir ad denetimiyle. Şablon ve tam denetim raporu bu sayfanın kaynak kodunda açıkça yer alır.",
      updatedLabel: "Durum",
      updated: "23 Ağustos 2026",
    },
    legal: {
      imprintTitle: "Künye",
      privacyTitle: "Gizlilik",
      imprintMetaDescription: "creaDIG'in sağlayıcı bilgileri ve iletişim.",
      privacyMetaDescription:
        "Siteler arası izleme yok, reklam çerezi yok, profil oluşturma yok. creaDIG neyi işliyor, bunu kim adımıza yapıyor ve ne kadar süre saklanıyor.",
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
      privacyIntro: "Bu sayfa bilinçli olarak sade kuruldu: siteler arası izleme yok, reklam çerezi yok, profil oluşturma yok. Kullandıklarımız aşağıda adıyla yazılı — ve erişim ölçümü ancak siz izin verdikten sonra yüklenir.",
      processorsLabel: "Bizim adımıza kim işliyor",
      processorsIntro:
        "Bu hizmet sağlayıcılar kişisel verileri bizim için işler — talimatımıza bağlı olarak, veri işleyen sözleşmesi (GDPR Md. 28) kapsamında ve ABD'de bulundukları için GDPR Md. 46/2-c uyarınca AB standart sözleşme maddeleriyle güvence altında. Bunun ötesinde hiçbir aktarım yapmıyoruz.",
      processorPurposeLabel: "Ne için",
      processorServicesLabel: "Hizmetler",
      processorCountryLabel: "Merkez",
      processorSafeguardLabel: "Dayanak",
      processorSafeguardScc: "GDPR Md. 28 uyarınca veri işleme + AB standart sözleşme maddeleri",
      processorDpaLink: "Sözleşmeyi görüntüle",
      processorPendingMark: "İşletme sahibinin onayı bekleniyor",
      processorPendingNote:
        "İşaretli sözleşmeleri işletme sahibi henüz ilgili panelde onaylayıp saklamadı. Bu yüzden var olduklarını yazmıyoruz — yayına almadan önce tamamlanacak.",
      processorPurposes: {
        vercel:
          "Barındırma, sayfanın içerik dağıtım ağı üzerinden sunulması ve sunucu kayıtları. Onayınızdan sonra ayrıca iki ayrı ölçüm: Vercel Web Analytics (hangi sayfanın ne sıklıkla açıldığı) ve Vercel Speed Insights (gerçek çağrılarda sayfanın ne kadar hızlı yüklendiği). Her ikisi de çerezsizdir, ancak IP adresi ve sayfa yolunu işler — onay yoksa hiçbir betik yüklenmez.",
        resend:
          "Formlarımızdan çıkan e-postaların posta kutumuza ve alındı onayının size iletilmesi.",
      },
      privacyPoints: [
        {
          title: "Sunucu kayıtları",
          body: "Sayfa çağrıldığında sağlayıcımız Vercel Inc. (ABD) IP adresi, zaman ve çağrılan kaynak gibi teknik olarak gerekli verileri işler. Hukuki dayanak GDPR Md. 6/1-f'dir — bu işleme olmadan sayfa ne sunulabilir ne de kötüye kullanıma karşı korunabilir. Vercel ile GDPR Md. 28 uyarınca bir veri işleyen sözleşmesi mevcuttur.",
        },
        {
          title: "Barındırma ve üçüncü ülkelere aktarım",
          body: "Bu sayfa tamamen statiktir ve Vercel'in dünya çapındaki içerik dağıtım ağı üzerinden, her seferinde en yakın konumdan sunulur. Bu nedenle erişim verilerinin AB dışında, özellikle ABD'de işlenmesi ihtimali bulunur. Bu durum, Vercel Inc. ile yapılan veri işleyen sözleşmesi ve GDPR Md. 46/2-c uyarınca AB standart sözleşme maddeleriyle güvence altına alınmıştır. Harita ve reklam hizmeti kullanmıyoruz ve tüm yazı tiplerini yerel olarak sunuyoruz. Erişim ölçümü için Vercel Web Analytics ve Vercel Speed Insights kullanıyoruz — çerezsiz, cihazlar arası kimlik olmadan ve yalnızca açık onayınızdan sonra; onay yoksa hiçbir betik yüklenmez. İletişim için WhatsApp'ı kullanırsanız, ek olarak Meta Platforms Ireland Ltd. koşulları geçerlidir.",
        },
        {
          title: "İletişim formu, randevu ve ürün talebi",
          body: "Formlarımızdan birini gönderdiğinizde bilgilerinizi — ad, işletme, e-posta, telefon ve mesajınız — info@creadig.de posta kutumuza iletiriz ve size bir onay göndeririz. Gönderim için GDPR Md. 28 uyarınca veri işleyenimiz olan Resend'i (Resend Inc., ABD) kullanırız; aktarım GDPR Md. 46/2-c uyarınca AB standart sözleşme maddeleriyle güvence altındadır. Hukuki dayanak, göndermeden önce açıkça verdiğiniz ve geleceğe yönelik olarak istediğiniz zaman geri alabileceğiniz GDPR Md. 6/1-a onayınızdır. Veritabanı tutmuyoruz: talebiniz yalnızca e-posta kutumuzda bulunur. Bunun yerine WhatsApp yolunu seçerseniz Meta Platforms Ireland Ltd. koşulları geçerlidir.",
        },
        {
          title: "Ne kadar süre saklıyoruz",
          body: "Sunucu kayıtlarını 30 gün sonra sileriz. Formlar üzerinden gelen talepleri son temastan itibaren en fazla 6 ay saklar, ardından sileriz; bir sözleşme kurulursa ticaret ve vergi hukukundaki 6 ve 10 yıllık saklama süreleri geçerlidir (§ 257 HGB, § 147 AO). Onay kararınız, siz değiştirene ya da tarayıcı verilerini silene kadar tarayıcınızın yerel deposunda kalır.",
        },
        {
          title: "Yazı tipleri",
          body: "Poppins ve JetBrains Mono sayfayla birlikte yerel olarak sunulur. Google Fonts ile bağlantı kurulmaz; bu nedenle IP adresiniz üçüncü bir tarafa iletilmez.",
        },
        {
          title: "Onay ve yerel kayıt",
          body: "Onay penceresindeki kararınızı tarayıcınızın yerel deposunda saklıyoruz („creadig_consent“ anahtarı). Yalnızca onayınızla ek olarak görünümü (açık/koyu) hatırlıyoruz; onay yoksa bu ayar sadece açık oturum için geçerlidir. Dili hiç saklamıyoruz — o, sayfanın adresinde durur. Bu sırada üçüncü taraflara hiçbir veri aktarılmaz. Seçiminizi istediğiniz zaman „Çerez ayarları“ üzerinden değiştirebilir veya geri alabilirsiniz — geri aldığınızda ilgili kayıtları anında sileriz.",
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
      thirdCountry:
        "Erişim ölçümü, ABD'deki Vercel Inc. üzerinden yürür. Buna izin verirseniz, erişim verilerinizin oraya aktarılmasına da açıkça onay vermiş olursunuz (GDPR Md. 49/1-a) — Vercel ile imzaladığımız AB standart sözleşme maddelerine ek olarak. ABD'de Avrupa'dakine denk bir veri koruma düzeyi yoktur: kamu kurumları erişim talep edebilir ve buna karşı etkili hukuki yollar bulunmayabilir. Onayınız olmadan hiçbir aktarım yapılmaz.",
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
          body: "Görünümü (açık/koyu) hatırlar. Onay olmadan seçiminiz yalnızca bu oturum için geçerlidir. Dil saklanmaz — adreste durur (Almanca için creadig.de, Türkçe için creadig.de/tr).",
        },
        statistics: {
          name: "Erişim ölçümü",
          body: "Vercel Web Analytics ve Vercel Speed Insights — hangi sayfanın ne sıklıkla açıldığını, bir talebin oluşup oluşmadığını ve sayfanın sizde ne kadar hızlı yüklendiğini anonim olarak ölçer. Çerez kullanılmaz, cihazlar arası kimlik oluşturulmaz. Onayınız olmadan hiçbir betik yüklenmez.",
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
