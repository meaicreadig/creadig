// i18n-ready dictionary. DE ist primär, TR ist gleichwertig.
// Alle Inhalte sind echt. Keine erfundenen Zahlen, Zitate oder Auszeichnungen.

export type Locale = "de" | "tr" | "en" | "ar"

export const WHATSAPP_NUMBER = "+41 76 504 58 79"

/**
 * MP-D.5 · Befund — hier stand eine Konstante mit DEUTSCHEM Vortext.
 *
 * `WHATSAPP_LINK` war ein Modulwert, kein Aufruf: Der vorausgefuellte Satz
 * „Guten Tag creaDIG, ich interessiere mich fuer ein Projekt." ging an drei
 * Stellen ins Markup — schwebender Knopf, Kopfleiste, Leistungsseite — und
 * damit auf JEDER Seite, auch auf `/tr/...`. Ein tuerkischer Besucher hat
 * WhatsApp geoeffnet und einen deutschen Satz im Eingabefeld gefunden.
 *
 * Der Termin-Assistent hat das nie falsch gemacht: Er baut seine Nachricht aus
 * `t.termin.*`. Nur diese Konstante konnte es nicht, weil sie ausserhalb
 * jeder Sprache steht. Deshalb ist sie jetzt eine Funktion.
 */
export function whatsappLink(locale: Locale): string {
  return (
    "https://wa.me/41765045879?text=" +
    encodeURIComponent(dictionary[locale].contact.whatsappIntro)
  )
}

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
        /*
         * MP10-2.4 — der Verweis AM ENDE der Werkschau.
         *
         * Oben gibt es ihn schon, und dort ist er fuer die falsche Person:
         * Wer die Sektion noch nicht gelesen hat, klickt nicht auf „alle".
         * Wer drei Arbeiten durchgescrollt hat, will genau das — und fand
         * am Ende nur eine Fussnote ueber Mockups und die naechste Sektion.
         */
        ctaEnd: "Alle Arbeiten ansehen",
      },
      /*
       * MP10-2.7 — die Ueberschrift ist in den Hero gezogen.
       *
       * Hier stand „Fünf Ebenen. Ein System." — derselbe Satz, den der Hero
       * jetzt traegt. Zweimal auf einer Seite gelesen ist er keine Betonung,
       * sondern eine Wiederholung, und die zweite Fassung macht die erste
       * kleiner. Oben bindet er die fuenf Chips zusammen; hier steht, was die
       * Reihe darunter zeigt.
       */
      capabilities: {
        eyebrow: "Leistungen",
        title: "Von der Marke bis zur Intelligenz.",
        lead: "Jede Ebene trägt die nächste. Sie können auf jeder einsteigen — und auf jeder aufhören.",
        cta: "Alle Leistungen",
      },
      /*
       * MP10-2.1 / 2.2 — DER EINSTIEG AUF DER STARTSEITE.
       *
       * -----------------------------------------------------------------------
       * WARUM HIER EINE ZAHL STEHT — UND NUR EINE
       * Die Startseite nannte keinen einzigen Preis. Das war als Haltung
       * gedacht (ein System-Haus ist keine Preisliste), wirkte aber als
       * Auskunftsverweigerung: Wer wissen will, ob er sich das leisten kann,
       * und keine Zahl findet, geht — und zwar zu jemandem, der eine nennt.
       *
       * Was hier NICHT steht, ist ein Paketblock. Ein Satz mit einer Zahl und
       * einem Verweis; die Leiter, der Regelpreis und die Betreuung stehen
       * weiter an genau einer Stelle, auf `/leistungen#pakete`. Die Zahl
       * selbst kommt aus `site-data.packages` — sie wird hier nicht noch
       * einmal getippt, sonst gibt es zwei Wahrheiten.
       *
       * -----------------------------------------------------------------------
       * WARUM ZWEI FRAGEN DANEBEN
       * Es sind dieselben zwei, die im Erstgespraech immer zuerst kommen:
       * was kostet das, wie laeuft das ab. Sie stehen wortgleich in der FAQ
       * auf `/leistungen` — gespiegelt, nicht neu geschrieben: Die Sektion
       * liest `t.faq.items`, damit die Antwort hier nicht in vier Wochen
       * anders lautet als dort.
       */
      entry: {
        eyebrow: "Einstieg",
        priceLead: "Website-Paket ab",
        priceNote: "netto. Festpreis für den vereinbarten Umfang.",
        priceCta: "Pakete und Preise",
        questionsLabel: "Zwei Fragen vorab",
        questionsCta: "Alle Fragen",
      },
      products: {
        cta: "Alle Produkte",
      },
      /*
       * MP10-2.5 — HIER STAND DER SITZ ZUM DRITTEN MAL.
       *
       * Ueberschrift „Osnabrück. Seit 2017.", darunter „Sitz im ICO
       * InnovationsCentrum" — und unmittelbar danach das Standortband mit
       * Haus, Anschrift und Kartenlink. Zweimal derselbe Ort auf zwei
       * Bildschirmhoehen; auf der ganzen Startseite kam er sechsmal vor.
       *
       * Ein Sitz, der oft genug wiederholt wird, wird nicht glaubwuerdiger,
       * sondern zum eigentlichen Thema. Er steht jetzt an genau zwei Stellen
       * als Text — Hero-Eyebrow und Fusszeile — und einmal als Bild im
       * Standortband direkt darunter. Diese Zeile sagt dafuer, was nur sie
       * sagen kann: wer dahintersteht.
       */
      company: {
        eyebrow: "Das Unternehmen",
        title: "Ein Haus, das wächst.",
        body: "Gegründet 2017, geführt von Muhammed Emin Akyol — mit einem kleinen Kernteam und einem spezialisierten Netzwerk im DACH-Raum.",
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
      /*
       * MP10-4 — die sechs Faecher.
       *
       * Sichtbar sind nur die gefuellten (siehe `lib/insights.ts`). Die Namen
       * stehen hier und nicht in den Daten, weil sie uebersetzt werden — der
       * Schluessel ist die Wahrheit, das Wort ist die Sprache.
       */
      categoriesLabel: "Worüber wir schreiben",
      categories: {
        systems: "Systeme",
        automation: "Automatisierung",
        ai: "Künstliche Intelligenz",
        products: "Produkte",
        betrieb: "Betrieb",
        praxis: "Praxis",
      },
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
          what: "Schreiben Sie in eigenen Worten, worum es geht — per WhatsApp oder E-Mail, ohne Formular.",
          cta: "Zu den direkten Wegen",
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
      /*
       * MP10-2.6 — steht nicht mehr auf der Seite. Der Halbsatz stand zweimal
       * woertlich auf /kontakt: einmal neben der Adresse im Kopf, einmal in
       * der E-Mail-Kachel weiter unten. Die Kachel behaelt ihn, weil sie ohne
       * ihn nur eine Adresse ist; der Kopf ist der schnelle Griff. Der
       * Schluessel bleibt fuer den Fall, dass ein anderer Ort ihn braucht.
       */
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
      /*
       * MP-C.1 — der Reifegrad, den der OWNER sagt.
       *
       * `statusBadge` darueber wird aus `live` und `href` gerechnet und kann
       * genau drei Zustaende erreichen: laeuft, im Aufbau, im eigenen Betrieb.
       * Die Stufe dazwischen — echte Nutzer in einer geschlossenen Phase —
       * kann keine Rechnung wissen, die weiss nur eine Person.
       *
       * Ist `productWorlds[slug].maturity` gesetzt, gewinnt dieser Wert. Zwei
       * Badges nebeneinander waeren zwei Wahrheiten zur selben Frage; solange
       * nichts gesetzt ist, bleibt es bei der Ableitung.
       */
      maturityBadge: {
        live: "Live",
        pilot: "Pilotbetrieb",
        "private-beta": "Private Beta",
        "in-development": "In Entwicklung",
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
      /*
       * MP-C.2 — hier stand „aus dem laufenden System".
       *
       * Das war ein Produktionsversprechen, und es widersprach dem Canon, der
       * seit MP-C.1 gilt: Aufnahmen entstehen in einer DEMO-INSTANZ, nie im
       * Produktivsystem — auf einem echten Screen stehen Kundennamen, Betraege
       * und Adressen. Die Ueberschrift haette also genau das behauptet, was
       * das Bild nicht sein darf.
       *
       * Die wahre Aussage ist zweiteilig, und beide Haelften zaehlen: Die
       * OBERFLAECHE ist die echte Anwendung — das ist der Beleg. Die DATEN
       * darin sind erfunden — das ist die Ehrlichkeit. Wer nur „Demo" sagt,
       * laesst offen, ob auch die Oberflaeche eine Attrappe ist, und
       * verschenkt den Beleg.
       */
      screensPending:
        "Oberflächen zeigen wir erst, wenn wir die echte Anwendung mit Demodaten aufnehmen können. Bis dahin steht hier, was gebaut ist — und nicht ein Bild, das etwas anderes behauptet.",
      screensLabel: "Die echte Oberfläche",
      /** Canon-Wortlaut aus `docs/ops/demo-data-standard.md`. */
      screensCaption: "Echte Oberfläche, Demodaten.",
      screensAlt: "echte Oberfläche mit Demodaten",
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
      /* MP10-4 — steht im Footer, nicht in der Leiste: Der Betrieb ist ein
         Kapitel unter „Leistungen", keine sechste Hauptrubrik. */
      betrieb: "Managed Betrieb",
      systeme: "Systeme",
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
      /*
       * MP10-2.5 — die erste der beiden verbliebenen Sitz-Nennungen.
       *
       * Der Eyebrow zaehlte die drei Maerkte auf, die zwei Zeilen tiefer in
       * der Subline noch einmal stehen — und nannte den Sitz nicht. Jetzt
       * steht hier, was nur hier steht: Was fuer ein Haus, von wo, seit wann.
       * Die Maerkte traegt die Subline.
       */
      eyebrow: "System-Haus · Osnabrück · seit 2017",
      headlineLine1: "Wir bauen,",
      headlineLine2: "was andere",
      headlineLine3: "nicht sehen.",
      /*
       * Glasklare Subline (§4.1): Vorher stand hier ein Markenbild („das Dach
       * ueber unseren Systemen"). Schoen — aber wer creaDIG nicht kennt, weiss
       * danach immer noch nicht, was gemacht wird. Der Satz nennt die Sache
       * beim Namen; die Haltung traegt die Headline darueber.
       *
       * MP10-2.7 — er nannte VIER Dinge („Marken, digitale Systeme,
       * Automatisierung und eigene Softwareprodukte"), waehrend die Sektion
       * darunter, das Menue und `/leistungen` fuenf Ebenen zeigen. Zwei
       * verschiedene Antworten auf „was macht ihr eigentlich", 800 Pixel
       * auseinander. Jetzt nennt er dieselben fuenf, in derselben Reihenfolge.
       */
      subline:
        "creaDIG baut Marke, digitalen Auftritt, Betrieb, Automatisierung und künstliche Intelligenz als ein System — für Unternehmen in Deutschland, Österreich und der Schweiz.",
      /*
       * MP10-2.7 — der Satz, der die fuenf Ebenen zusammenbindet.
       *
       * Er stand bisher als Ueberschrift der Kachelreihe weiter unten. Dort
       * kommt er zu spaet: Wer die Reihe erreicht, hat die Chips daruber
       * schon als lose Aufzaehlung gelesen. Im Hero macht er aus fuenf Worten
       * eine Ordnung — und genau das ist der Unterschied zwischen einem
       * Leistungskatalog und einem System-Haus.
       */
      systemLine: "Fünf Ebenen. Ein System.",
      ctaPrimary: "Projekt starten",
      ctaSecondary: "Unsere Arbeit",
      /*
       * MP10-2.5 — die Fusszeile des Hero nannte den Sitz ein zweites Mal,
       * 200 Pixel unter dem Eyebrow. Sie traegt jetzt den Markt, den der
       * Eyebrow abgegeben hat.
       */
      location: "Deutschland · Österreich · Schweiz",
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
        /*
         * MP10-2 (Zusatz) — die Beschriftung musste mit dem Wert mitziehen.
         *
         * Sie lautete „Gerechnet ab dem ersten System, das wir übergeben und
         * behalten haben" — eine Angabe, die nur der Owner hat. Der Wert
         * kommt jetzt aus dem Gruendungsjahr (`site-data.FOUNDING_YEAR`), und
         * genau das steht hier auch. Eine Zahl, die anders gerechnet ist als
         * ihre Beschriftung, ist eine falsche Zahl mit richtiger Ziffer.
         */
        operatingYears: {
          label: "Jahre im Geschäft",
          detail: "Ununterbrochen, gerechnet ab der Gründung 2017.",
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
      /*
       * MP10-2.9 — DER DISCLAIMER WAR STAERKER ALS DIE WAND.
       *
       * Er lautete: „Freigaben stehen aus; eine Kunden-, Geschäfts- oder
       * Partnerbeziehung wird damit nicht behauptet." Das gehoerte zur Reihe
       * fremder Marken aus dem Glasfaser-Alltag — und die ist seit dem
       * 22.08.2026 leer (`site-data.brands`). Uebrig blieb ein Satz, der
       * genau ueber den beiden Reihen stand, die es noch gibt: eigene
       * Produkte und Kunden MIT Zustimmung. Er widerrief also, was darunter
       * zu Recht steht.
       *
       * Ein Hinweis, der die eigene Aussage schwaecht, ist keine Ehrlichkeit,
       * sondern ein Rest. Jetzt sagt der Satz, wonach eine Logo-Wand zuerst
       * gefragt wird: Was davon ist eures, und wer hat zugestimmt.
       */
      note: "Eigene Produkte haben wir gebaut und betreiben sie selbst. Kunden stehen hier nur mit ihrer Zustimmung. Fremde Marken stehen gar nicht hier — ohne Freigabe kein Name.",
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
      // Nur Produktkarten ohne echtes Foto — Kunden-/Produktfotos tragen eigene Notes.
      mockupNote: "Produktkarten: illustrative Mockups, keine Screenshots.",
      productPhotoNote:
        "Produktbilder zeigen die echte Oberfläche (Demodaten) — keine Mockups.",
      customerPhotoNote: "Kundenbilder zeigen die echte Oberfläche — keine Mockups.",
      // Selected Work / gemischte Werkschau.
      imageNoteMixed:
        "Echte Oberflächen (Produkt & Kunden) und illustrative Mockups — getrennt ausgewiesen, nicht vermischt etikettiert.",
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
     * Kundennamen. MP-C.3 ergaenzt davor das Kurzformat Projekt · Kategorie · Leistungen.
     */
    cases: {
      eyebrow: "Kundenfälle",
      title: "Was sich danach geändert hat.",
      lead: "Jeder Fall in derselben Reihenfolge: wie der Betrieb dastand, was ihn aufgehalten hat, was er erreichen wollte — und erst dann, was wir daran hatten. Nur mit schriftlicher Freigabe des Kunden; ohne Freigabe steht hier nichts.",
      card: {
        project: "Projekt",
        category: "Kategorie",
        services: "Leistungen",
      },
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
        /*
         * MP10-2.8 — DIE FRAGE, DIE NIEMAND STELLT UND JEDER DENKT.
         *
         * Wir verkaufen nicht nur ein Projekt, sondern einen Dauerbetrieb zu
         * 149 EUR im Monat. Wer das liest, rechnet still mit: „Und wenn ich
         * irgendwann nicht mehr will — habe ich dann noch etwas?" Solange
         * darauf keine Antwort steht, ist die Antwort im Kopf des Lesers die
         * schlechteste: Abhaengigkeit.
         *
         * Sie auszusprechen ist staerker als jede Referenz, weil sie gegen
         * unser eigenes Interesse zu sprechen scheint — und weil sie nichts
         * kostet: System und Daten gehoeren ohnehin dem Kunden, und monatlich
         * kuendbar war die Betreuung immer schon. Neu ist nur, dass es
         * dasteht.
         *
         * Die Zahl 149 EUR und die Kuendbarkeit stehen auch in `retainer`
         * (site-data) und in der Preisleiter der Barrierefreiheits-Seite. Wer
         * eine davon aendert, aendert die anderen mit.
         */
        {
          q: "Wem gehört das System — und was passiert, wenn ich die Betreuung kündige?",
          a: "Das System und alle Daten darin gehören Ihnen, vom ersten Tag an. Die laufende Betreuung für 149 € netto im Monat ist monatlich kündbar, ohne Mindestlaufzeit. Danach bleibt alles bei Ihnen: Code, Inhalte, Zugänge und Domain — wir händigen aus, was wir haben, und Sie können mit jedem anderen weiterarbeiten. Was aufhört, ist die Betreuung, nicht Ihr Zugriff.",
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
      /*
       * MP10-1 — die vier Kauf-Fragen.
       *
       * Drei der vier Beschriftungen stehen heute ueber leeren Feldern und
       * rendern deshalb nicht. Sie sind trotzdem hier: Sobald der Owner eine
       * Projektdauer, ein Vorher→Nachher oder einen Kundenaufwand bestaetigt,
       * ist die Zeile fertig uebersetzt und muss nicht in zwei Woerterbuechern
       * nachgezogen werden.
       */
      durationLabel: "Wie lange es dauert",
      fromToLabel: "Was sich im Betrieb ändert",
      fromToBefore: "Vorher",
      fromToAfter: "Nachher",
      clientEffortLabel: "Was Sie beitragen",
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
      /* MP-A · Textdichte: Die Tiefe je Ebene liegt hinter diesem Wort. */
      detailLabel: "Im Detail",
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
      /*
       * MP10-2.3 — das Etikett der Projektdauer.
       *
       * Steht heute ueber einem leeren Feld (`Package.duration === null`) und
       * rendert deshalb nicht. Es liegt trotzdem hier, damit der Owner nur
       * eine Dauer nachtragen muss und nicht auch noch die Uebersetzung.
       */
      durationLabel: "Projektdauer",
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
      retainerTitle: "Betrieb statt Übergabe.",
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
    /*
     * MP10-4 — DER BETRIEB HAT EINE EIGENE ADRESSE BEKOMMEN.
     *
     * -------------------------------------------------------------------------
     * WARUM EINE SEKTION NICHT REICHTE
     * „Managed Betrieb" stand als eine Sektion mitten auf /leistungen, zwischen
     * den fuenf Ebenen und den Paketen. Genau der Teil, der dieses Haus von
     * einer Agentur unterscheidet, die uebergibt und verschwindet, war damit
     * ein Absatz auf einer Seite, die von etwas anderem handelt — nicht
     * verlinkbar, nicht auffindbar, nicht suchbar.
     *
     * Der Betrieb ist ausserdem das Einzige im Angebot, das wiederkehrend ist.
     * Ein wiederkehrendes Angebot ohne eigene Seite ist ein Angebot, das nur
     * verkauft wird, wenn jemand zufaellig weit genug scrollt.
     *
     * Die Sektion bleibt, wo sie ist — sie fasst zusammen und verweist hierher.
     * Diese Seite sagt, was dort keinen Platz hatte: WARUM Betrieb statt
     * Uebergabe, und was das fuer die Abhaengigkeit des Kunden bedeutet.
     *
     * KEINE ZWEITE WAHRHEIT: Die sieben Bestandteile kommen aus `managed.items`
     * (dieselben Texte wie in der Sektion), der Preis aus `site-data.retainer`,
     * die Grenze der Zusage aus `managed.note`. Neu geschrieben ist hier nur,
     * was es vorher nirgends gab.
     */
    /*
     * MP10-4 — DIE SYSTEM-SEITE.
     *
     * Warum sie keine Logo-Wand ist, steht in `lib/systems.ts`. Was hier steht,
     * ist die Arbeitsweise: welche Fragen vor dem Bau geklaert werden, wie
     * betrieben wird, und was an dieser Seite selbst nachpruefbar ist.
     *
     * Der letzte Abschnitt ist der eigentliche Grund fuer die Seite. Alles
     * andere darauf ist eine Beschreibung; die sieben Punkte unter
     * „nachpruefbar" sind ein Beleg — jeder einzelne im Antwort-Header, im
     * ausgelieferten HTML oder im Repo kontrollierbar, ohne uns zu fragen.
     */
    systemePage: {
      eyebrow: "Systeme",
      title: "Integration first.",
      lead: "Ein neues System ersetzt selten alles. Meistens muss es neben dem laufen, was schon da ist — und mit ihm reden. Was dabei zu klären ist, steht hier.",
      metaTitle: "Systeme & Integration — Schnittstellen, Daten, Betrieb",
      metaDescription:
        "Wie creaDIG Systeme anbindet und betreibt: Schnittstellen, Daten, Hosting, Abrechnung, Belege, Zugänge, KI-Dienste. Dazu sieben Punkte, die an dieser Seite selbst nachprüfbar sind.",
      statement: "Ein System, das nur für sich funktioniert, ist ein zweiter Ort, an dem dieselben Daten gepflegt werden. Genau das wollte niemand.",
      /* Kurzes Wort oben, ganzer Satz als Ueberschrift — sonst stuenden
         Eyebrow und H2 zweimal mit demselben Text uebereinander. */
      categoriesEyebrow: "Integration",
      categoriesLabel: "Womit ein System sprechen muss.",
      categoriesNote: "Kein Anbieter-Katalog. Hier steht, was wir vor dem Bau klären — nicht, welche fremden Marken wir angeblich beherrschen. Was wir tatsächlich angebunden haben, sagen wir im Gespräch mit Namen.",
      categoryQuestionLabel: "Was zuerst geklärt wird",
      categories: {
        interfaces: {
          name: "Schnittstellen",
          body: "Fast jedes System muss Daten irgendwo holen oder abgeben. Ob dafür eine Schnittstelle existiert, entscheidet über den halben Aufwand — und es entscheidet sich vor dem ersten Entwurf, nicht mitten im Bau.",
          question: "Gibt es eine dokumentierte Schnittstelle, einen Export oder gar nichts?",
        },
        data: {
          name: "Daten und Datenbanken",
          body: "Wo die Daten leben, wem sie gehören und wie sie aussehen, wenn sie einmal falsch sind. Ein Datenmodell, das den Betrieb nicht abbildet, wird im Betrieb umgangen — dann pflegt jemand wieder eine Tabelle nebenher.",
          question: "Welcher Bestand ist die Wahrheit, wenn zwei Stellen sich widersprechen?",
        },
        hosting: {
          name: "Hosting und Auslieferung",
          body: "Wo es läuft, wie es dorthin kommt und was passiert, wenn eine Auslieferung schiefgeht. Kein Nebenthema: Es entscheidet über Tempo, Erreichbarkeit und darüber, ob eine Änderung Minuten oder Tage braucht.",
          question: "Wer hat heute Zugriff auf Server, Domain und Zertifikate?",
        },
        billing: {
          name: "Abrechnung und Zahlungen",
          body: "Der Teil, an dem sich Fehler in Geld ausdrücken. Beträge, Steuersätze, Belege, Fristen — und die Regeln des Landes, in dem abgerechnet wird. Hier wird nichts geschätzt und nichts gerundet.",
          question: "Nach welchen Regeln wird gerechnet, und wer prüft das Ergebnis?",
        },
        documents: {
          name: "Dokumente und Belege",
          body: "Verträge, Rechnungen, Nachweise, Fotos vom Einsatz. Sie entstehen unterwegs und müssen wiederfindbar sein — sonst wird das System zur Ablage, in die niemand mehr hineinsieht.",
          question: "Was muss wie lange auffindbar bleiben — und für wen?",
        },
        accounts: {
          name: "Zugänge und Rechte",
          body: "Wer darf was sehen, wer darf was ändern, und was passiert, wenn jemand geht. Die unauffälligste Frage im Projekt und die, die im Betrieb am häufigsten weh tut.",
          question: "Welche Rollen gibt es wirklich — nicht im Organigramm, sondern im Alltag?",
        },
        ai: {
          name: "KI-Dienste",
          body: "Sinnvoll dort, wo etwas gelesen, sortiert oder vorbereitet werden muss, das heute jemand von Hand macht. Nicht sinnvoll als Etikett auf einem System, das ohnehin funktioniert hätte.",
          question: "Welcher Schritt kostet heute Zeit — und darf eine Maschine ihn vorbereiten?",
        },
      },
      connectedLabel: "Angebunden",
      operationsEyebrow: "Praxis",
      operationsLabel: "Wie wir betreiben.",
      operationsNote: "Was davon als Leistung buchbar ist, steht auf der Seite zum Managed Betrieb.",
      operations: {
        monitoring: {
          name: "Monitoring",
          body: "Die Systeme melden sich selbst, wenn sie nicht erreichbar sind. Bei der Anfragestrecke geht das weiter: Ein Selbsttest prüft, ob eine Anfrage überhaupt noch zugestellt werden kann — ein stiller Ausfall dort sieht von außen aus wie schlechte Marktlage.",
        },
        logging: {
          name: "Logging",
          body: "Genug, um einen Fehler zu finden. Nicht mehr, als sich verantworten lässt: Was jemand in ein Formular geschrieben hat, steht in keinem Protokoll.",
        },
        backups: {
          name: "Backups",
          body: "Gesichert und zurückgespielt. Ein Backup, das nie zurückgespielt wurde, ist keins — es ist eine Datei, von der man hofft.",
        },
        security: {
          name: "Security",
          body: "Zugänge, Rechte, Transportverschlüsselung und Antwort-Header auf dem Stand, der beim Bau gesetzt wurde — und danach nachgemessen, nicht angenommen.",
        },
        deployment: {
          name: "Deployment",
          body: "Jede Änderung nimmt denselben Weg: bauen, prüfen, ausliefern. Bricht eine der Prüfungen, wird nicht ausgeliefert — auch dann nicht, wenn es eilig ist.",
        },
      },
      proofEyebrow: "Beleg",
      proofLabel: "An dieser Seite nachprüfbar.",
      proofNote: "Zeigen ist besser als behaupten. Jeder Punkt lässt sich von außen im Antwort-Header, im ausgelieferten Quelltext oder im Repo kontrollieren — ohne uns zu fragen.",
      proofs: {
        headers: {
          name: "Sicherheits-Header",
          body: "HSTS mit Subdomains und Preload, X-Content-Type-Options, Referrer-Policy, X-Frame-Options auf DENY, Permissions-Policy und eine Content-Security-Policy, die object-src, base-uri, form-action und frame-ancestors bereits scharf setzt.",
        },
        static: {
          name: "Statisch ausgeliefert",
          body: "Die Seiten werden zur Bauzeit erzeugt und vom CDN ausgeliefert, nicht bei jedem Aufruf gerendert. Das ist der Grund, warum sie schnell ist — und warum ein Ausfall der Anwendung sie nicht sofort mitnimmt.",
        },
        bilingual: {
          name: "Zwei Sprachen, zwei Adressen",
          body: "Deutsch und Türkisch haben eigene URLs, eigene Titel, eigene strukturierte Daten und sind über hreflang verbunden — nicht ein Schalter, der im Browser Text austauscht.",
        },
        images: {
          name: "Bilder in AVIF und WebP",
          body: "Die Aufnahmen werden zur Bauzeit umgerechnet und in der Größe ausgeliefert, die das Layout wirklich braucht. Wer AVIF nicht kann, bekommt WebP — automatisch, nicht per Weiche im Code.",
        },
        gates: {
          name: "Drei Prüfungen im Build",
          body: "Der Build bricht ab, wenn eine Funktion zu groß wird, wenn strukturierte Daten Sterne behaupten würden, die es nicht gibt, oder wenn eine Leistungsseite auf Türkisch weniger sagt als auf Deutsch. Keine Absichtserklärung — ein Abbruch.",
        },
        selftest: {
          name: "Selbsttest der Anfragestrecke",
          body: "Eine eigene Route prüft, ob Schlüssel, Absender-Domain und Missbrauchsschutz der Anfragestrecke noch funktionieren, ohne dabei eine Mail zu verschicken. Fällt eine Prüfung, antwortet sie mit einem Fehler, den ein Wächter versteht.",
        },
        accessibility: {
          name: "Eigene Barrierefreiheits-Prüfung, offengelegt",
          body: "Wir haben diese Seite selbst geprüft und die gefundenen Mängel veröffentlicht, statt eine Erklärung ohne Befund abzugeben. Nachzulesen unter Barrierefreiheit.",
        },
      },
    },
    betriebPage: {
      eyebrow: "Betreiben",
      title: "Übergeben ist einfach. Betreiben ist die Arbeit.",
      lead: "Die meisten Projekte enden mit dem Livegang. Danach beginnt der Teil, den niemand verkauft: Updates, Ausfälle, Sicherheitslücken und die kleinen Änderungen, die plötzlich niemand mehr machen kann. Wir bleiben.",
      metaTitle: "Managed Betrieb — Hosting, Monitoring, Updates, Backups",
      metaDescription:
        "creaDIG betreibt, was creaDIG gebaut hat: Hosting, Monitoring, Updates, Security, Backups, Support und Weiterentwicklung. Monatlich kündbar — System und Daten gehören Ihnen.",
      whyLabel: "Warum Betrieb statt Übergabe",
      why: [
        {
          name: "Wer gebaut hat, kennt die Stellen",
          body: "Ein fremder Betreuer liest bei jedem Fehler zuerst fremden Code. Wir lesen unseren eigenen — deshalb ist die Antwort auf „geht das schnell?“ hier meistens ja.",
        },
        {
          name: "Ein System altert, auch wenn niemand es anfasst",
          body: "Abhängigkeiten bekommen Sicherheitslücken, Zertifikate laufen ab, Browser ändern ihre Regeln. Nichts davon kündigt sich an, und nichts davon wartet auf das nächste Projektbudget.",
        },
        {
          name: "Der Ausfall kommt nicht zur Bürozeit",
          body: "Er kommt nachts, am Wochenende, im Urlaub. Die Frage ist nicht, ob ihn jemand bemerkt, sondern wer zuerst: das Monitoring oder Ihr Kunde.",
        },
        {
          name: "Was sich im Betrieb als falsch herausstellt, wird geändert",
          body: "Kein Bau übersteht den ersten echten Monat unverändert. In einem Projekt mit Abnahmedatum wird so etwas dokumentiert und stehen gelassen. Im Betrieb wird es geändert.",
        },
      ],
      /*
       * Die Abhaengigkeits-Frage, an derselben Stelle beantwortet, an der sie
       * entsteht. Dieselbe Auskunft steht als FAQ-Punkt auf /leistungen —
       * die Zahl dazu kommt aus `site-data.retainer`, nicht aus diesem Text.
       */
      ownershipLabel: "Abhängigkeit",
      ownershipTitle: "Betrieb heißt nicht Abhängigkeit.",
      ownershipBody: "Das System und alle Daten darin gehören Ihnen, vom ersten Tag an. Die Betreuung ist monatlich kündbar, ohne Mindestlaufzeit. Danach bleibt alles bei Ihnen — Code, Inhalte, Zugänge und Domain. Was aufhört, ist die Betreuung, nicht Ihr Zugriff.",
    },
    contact: {
      eyebrow: "Kontakt",
      /*
       * MP10-2.6 — `title`/`lead` gehoerten zum Formular, das hier stand, und
       * bleiben fuer den Fall, dass ein anderer Ort sie braucht. Die Seite
       * selbst traegt jetzt `directTitle`/`directLead`: Sie kuendigt kein
       * Eingabefeld mehr an, sondern drei Wege.
       */
      title: "In 20 Minuten unverbindlich.",
      lead: "Deutsch und Türkisch. Wählen Sie den Weg, der Ihnen am schnellsten passt.",
      directTitle: "Drei Wege. Jeder endet bei einem Menschen.",
      directLead: "Ein Erstgespräch läuft über die Terminanfrage — dort steht in vier Schritten, worum es geht. Wer nur eine Frage hat, schreibt direkt: per WhatsApp oder E-Mail, auf Deutsch oder Türkisch.",
      mailTitle: "E-Mail",
      mailNote: "Für Unterlagen, Angebote und alles Schriftliche.",
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
      /* Der Satz, der beim Oeffnen im Eingabefeld steht. */
      whatsappIntro: "Guten Tag creaDIG, ich interessiere mich für ein Projekt.",
      /* Die Vorlesehilfe des schwebenden Knopfes und der Kopfleiste. */
      whatsappAction: "Per WhatsApp schreiben",
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
    /*
     * MP10-2 (Zusatz) — DAS ABSCHLUSS-BAND SAGT JETZT, WO ES STEHT.
     *
     * -------------------------------------------------------------------------
     * DAS PROBLEM
     * Es steht am Ende von sieben verschiedenen Seiten und sagte auf allen
     * dasselbe: „Projekt starten". Nach der Preistabelle liest sich das wie
     * eine Wiederholung der Kachel-Schaltflaeche daneben; nach der Werkschau
     * wie ein Aufruf, der mit dem gerade Gesehenen nichts zu tun hat. Ein
     * Schlussstrich, der den Absatz darueber nicht kennt, ist ein Banner.
     *
     * `variants` liefert den Ort mit: Nach Preisen wird der naechste Schritt
     * konkret („Festpreis-Angebot anfragen"), nach der Werkschau knuepft er an
     * das Gesehene an („Ähnliches Vorhaben?"). Der Grundfall bleibt unveraendert
     * fuer alle Seiten, die keinen besonderen Anlauf haben.
     */
    closing: {
      eyebrow: "Nächster Schritt",
      title: "Sie führen den Betrieb. Wir bauen das System dahinter.",
      lead: "Zwanzig Minuten, kostenlos und unverbindlich. Wir sehen uns den Betrieb an und sagen ehrlich, ob wir helfen können.",
      ctaPrimary: "Projekt starten",
      ctaSecondary: "Arbeiten ansehen",
      variants: {
        prices: {
          eyebrow: "Nächster Schritt",
          title: "Ein Festpreis für Ihren Umfang — nach zwanzig Minuten.",
          lead: "Was oben steht, ist der Einstieg. Was Ihr Betrieb braucht, sehen wir uns an, bevor irgendjemand eine Zahl nennt — kostenlos und unverbindlich.",
          ctaPrimary: "Festpreis-Angebot anfragen",
          ctaSecondary: "Arbeiten ansehen",
        },
        work: {
          eyebrow: "Nächster Schritt",
          title: "Ähnliches Vorhaben? Sprechen wir.",
          lead: "Zwanzig Minuten, kostenlos und unverbindlich. Wir sagen Ihnen ehrlich, ob Ihr Vorhaben zu dem passt, was Sie hier gesehen haben.",
          ctaPrimary: "Vorhaben besprechen",
          ctaSecondary: "Leistungen ansehen",
        },
      },
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
          bodyStored:
            "Wenn Sie eines unserer Formulare absenden, übermitteln wir Ihre Angaben — Name, Betrieb, E-Mail, Telefon und Ihre Nachricht — an unser Postfach info@creadig.de und schicken Ihnen eine Bestätigung. Für den Versand nutzen wir Resend (Resend Inc., USA) als Auftragsverarbeiter nach Art. 28 DSGVO, abgesichert über die EU-Standardvertragsklauseln nach Art. 46 Abs. 2 lit. c DSGVO. Rechtsgrundlage ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO, die Sie vor dem Absenden ausdrücklich erteilen und jederzeit für die Zukunft widerrufen können. Zusätzlich speichern wir Ihre Anfrage in einer Datenbank, damit wir sie zuverlässig bearbeiten und den Bearbeitungsstand nachvollziehen können. Betreiber dieser Datenbank ist Neon, LLC als Auftragsverarbeiter nach Art. 28 DSGVO; die Daten liegen in der Region Frankfurt (aws-eu-central-1). Kommt kein Vertrag zustande, löschen wir Ihre Anfrage 12 Monate nach dem letzten Kontakt. Wählen Sie stattdessen den Weg über WhatsApp, gelten dafür die Bedingungen von Meta Platforms Ireland Ltd.",
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
      /*
       * MP10-2.7 — die Tagline zaehlte fuenf Dinge auf, aber in einer
       * anderen Sprache als der Rest des Hauses („Web", „Operations",
       * „Automation", „KI"). Jetzt stehen dieselben fuenf Ebenennamen wie im
       * Hero, in den Kacheln und in den Sprungmarken darunter.
       */
      tagline: "System-Haus für Identity, Digital, Operations, Automation und Intelligence.",
      productsLabel: "Produkte",
      navLabel: "Seite",
      /*
       * MP10-2.7 — die fuenf Ebenen als Sprungmarken.
       *
       * Der Footer ist das vollstaendige Verzeichnis der Seite. Bis hierher
       * fuehrte er auf `/leistungen` als Ganzes; wer eine bestimmte Ebene
       * suchte, musste dort erst wieder scrollen. Die fuenf Anker sind
       * derselbe Satz Namen wie im Hero und in den Kacheln — dritte
       * Nennung, dieselben Woerter, dieselbe Reihenfolge.
       */
      layersLabel: "Fünf Ebenen",
      legalLabel: "Rechtliches",
      imprint: "Impressum",
      privacy: "Datenschutz",
      socialLabel: "Social",
      /*
       * MP10-2.10 — der Materialstand, dezent.
       *
       * `/status` ist das ehrlichste, was diese Seite hat: eine Liste dessen,
       * was fehlt, abgeleitet aus denselben Daten, aus denen die Seite gebaut
       * wird. Sie war bisher nur erreichbar, wenn man die Adresse kannte.
       * Im Betrieb antwortet sie ohne Schluessel weiterhin mit 404 — der
       * Link ist damit kein Leck, sondern ein Signal.
       */
      statusLabel: "Materialstand",
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
        ctaEnd: "Tüm işleri gör",
      },
      capabilities: {
        eyebrow: "Hizmetler",
        title: "Markadan yapay zekâya.",
        lead: "Her katman bir sonrakini taşır. İstediğiniz katmanda başlayabilir, istediğiniz katmanda durabilirsiniz.",
        cta: "Tüm hizmetler",
      },
      entry: {
        eyebrow: "Başlangıç",
        priceLead: "Web sitesi paketi",
        priceNote: "net'ten itibaren. Anlaşılan kapsam için sabit fiyat.",
        priceCta: "Paketler ve fiyatlar",
        questionsLabel: "Önce iki soru",
        questionsCta: "Tüm sorular",
      },
      products: {
        cta: "Tüm ürünler",
      },
      company: {
        eyebrow: "Şirket",
        title: "Büyüyen bir ev.",
        body: "2017'de kuruldu, Muhammed Emin Akyol yönetiminde — küçük bir çekirdek ekip ve DACH bölgesinde uzman bir ağla birlikte.",
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
      categoriesLabel: "Ne hakkında yazıyoruz",
      categories: {
        systems: "Sistemler",
        automation: "Otomasyon",
        ai: "Yapay zekâ",
        products: "Ürünler",
        betrieb: "İşletme",
        praxis: "Pratik",
      },
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
          what: "Konuyu kendi cümlelerinizle yazın — WhatsApp'tan ya da e-postayla, formsuz.",
          cta: "Doğrudan yollara git",
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
      /*
       * MP10-2.6 — steht nicht mehr auf der Seite. Der Halbsatz stand zweimal
       * woertlich auf /kontakt: einmal neben der Adresse im Kopf, einmal in
       * der E-Mail-Kachel weiter unten. Die Kachel behaelt ihn, weil sie ohne
       * ihn nur eine Adresse ist; der Kopf ist der schnelle Griff. Der
       * Schluessel bleibt fuer den Fall, dass ein anderer Ort ihn braucht.
       */
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
      maturityBadge: {
        live: "Canlı",
        pilot: "Pilot işletme",
        "private-beta": "Özel beta",
        "in-development": "Geliştirme aşamasında",
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
        "Arayüzleri ancak gerçek uygulamayı örnek verilerle kaydedebildiğimizde paylaşırız. O zamana kadar burada ne kurulduğu yazar — başka bir şey iddia eden bir görsel değil.",
      screensLabel: "Gerçek arayüz",
      screensCaption: "Gerçek arayüz, örnek veriler.",
      screensAlt: "örnek verilerle gerçek arayüz",
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
      betrieb: "Managed işletme",
      systeme: "Sistemler",
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
      eyebrow: "Sistem evi · Osnabrück · 2017'den beri",
      headlineLine1: "Başkalarının",
      headlineLine2: "görmediğini",
      headlineLine3: "inşa ediyoruz.",
      subline:
        "creaDIG; Almanya, Avusturya ve İsviçre'deki işletmeler için markayı, dijital görünümü, işletmeyi, otomasyonu ve yapay zekâyı tek bir sistem olarak kurar.",
      systemLine: "Beş katman. Tek sistem.",
      ctaPrimary: "Projeye başla",
      ctaSecondary: "İşlerimiz",
      location: "Almanya · Avusturya · İsviçre",
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
          label: "İşteki yıl",
          detail: "Kesintisiz, 2017'deki kuruluştan itibaren.",
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
      note: "Kendi ürünlerimizi biz kurduk ve kendimiz işletiyoruz. Müşteriler burada yalnızca onayıyla yer alır. Yabancı markalar ise hiç yer almaz — onay yoksa isim de yok.",
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
      mockupNote: "Ürün kartları: açıklayıcı maketler, ekran görüntüsü değil.",
      productPhotoNote:
        "Ürün görselleri gerçek arayüzü gösterir (demodaten) — maket değil.",
      customerPhotoNote: "Müşteri görselleri gerçek arayüzü gösterir — maket değil.",
      imageNoteMixed:
        "Gerçek arayüzler (ürün ve müşteri) ile açıklayıcı maketler — ayrı etiketlenir, karıştırılmaz.",
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
      card: {
        project: "Proje",
        category: "Kategori",
        services: "Hizmetler",
      },
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
        {
          q: "Sistem kime ait — ve desteği iptal edersem ne olur?",
          a: "Sistem ve içindeki tüm veriler ilk günden itibaren size aittir. Aylık 149 € net sürekli destek, asgari süre olmadan aylık iptal edilebilir. Sonrasında her şey sizde kalır: kod, içerik, erişimler ve alan adı — elimizdekini teslim ederiz, dilediğiniz başka biriyle devam edebilirsiniz. Biten şey destektir, erişiminiz değil.",
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
      durationLabel: "Ne kadar sürer",
      fromToLabel: "İşletmede ne değişir",
      fromToBefore: "Öncesi",
      fromToAfter: "Sonrası",
      clientEffortLabel: "Sizden gerekenler",
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
      detailLabel: "Ayrıntıda",
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
      durationLabel: "Proje süresi",
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

    systemePage: {
      eyebrow: "Sistemler",
      title: "Önce entegrasyon.",
      lead: "Yeni bir sistem nadiren her şeyin yerine geçer. Çoğu zaman hâlihazırda çalışanın yanında çalışması ve onunla konuşması gerekir. Bunun için nelerin netleşmesi gerektiği burada yazıyor.",
      metaTitle: "Sistemler & entegrasyon — arayüzler, veri, işletme",
      metaDescription:
        "creaDIG sistemleri nasıl bağlar ve işletir: arayüzler, veri, hosting, hakediş, belgeler, erişimler, yapay zekâ servisleri. Ayrıca bu sitenin kendisinde doğrulanabilir yedi nokta.",
      statement: "Yalnızca kendi başına çalışan bir sistem, aynı verinin bakıldığı ikinci bir yerdir. Kimse bunu istememişti.",
      categoriesEyebrow: "Entegrasyon",
      categoriesLabel: "Bir sistemin neyle konuşması gerekir.",
      categoriesNote: "Sağlayıcı kataloğu değil. Burada, inşadan önce neyi netleştirdiğimiz yazıyor — hangi yabancı markalara sözde hâkim olduğumuz değil. Gerçekte neyi bağladığımızı görüşmede adıyla söyleriz.",
      categoryQuestionLabel: "Önce netleşen soru",
      categories: {
        interfaces: {
          name: "Arayüzler",
          body: "Neredeyse her sistemin bir yerden veri alması ya da bir yere vermesi gerekir. Bunun için bir arayüz olup olmaması işin yarısını belirler — ve bu, ilk taslaktan önce belli olur, inşanın ortasında değil.",
          question: "Belgelenmiş bir arayüz mü var, bir dışa aktarım mı, yoksa hiçbir şey mi?",
        },
        data: {
          name: "Veri ve veritabanları",
          body: "Verinin nerede yaşadığı, kime ait olduğu ve yanlış olduğunda neye benzediği. İşletmeyi yansıtmayan bir veri modeli işletmede es geçilir — o zaman biri yeniden yan tarafta tablo tutar.",
          question: "İki yer birbiriyle çelişince hangi kayıt doğrudur?",
        },
        hosting: {
          name: "Hosting ve yayına alma",
          body: "Nerede çalıştığı, oraya nasıl gittiği ve bir yayınlama ters gidince ne olduğu. Yan konu değil: hız, erişilebilirlik ve bir değişikliğin dakika mı gün mü sürdüğü buna bağlı.",
          question: "Sunucuya, alan adına ve sertifikalara bugün kimin erişimi var?",
        },
        billing: {
          name: "Hakediş ve ödemeler",
          body: "Hataların paraya dönüştüğü kısım. Tutarlar, vergi oranları, belgeler, süreler — ve hesabın yapıldığı ülkenin kuralları. Burada hiçbir şey tahmin edilmez, hiçbir şey yuvarlanmaz.",
          question: "Hangi kurallara göre hesaplanıyor ve sonucu kim kontrol ediyor?",
        },
        documents: {
          name: "Belgeler ve evraklar",
          body: "Sözleşmeler, faturalar, kanıtlar, sahadan fotoğraflar. Yol boyunca oluşurlar ve yeniden bulunabilmeleri gerekir — yoksa sistem, kimsenin bir daha bakmadığı bir arşive dönüşür.",
          question: "Ne, ne kadar süre ve kimin için bulunabilir kalmalı?",
        },
        accounts: {
          name: "Erişimler ve yetkiler",
          body: "Kim neyi görebilir, kim neyi değiştirebilir ve biri ayrıldığında ne olur. Projenin en dikkat çekmeyen sorusu ve işletmede en sık canını yakanı.",
          question: "Gerçekte hangi roller var — şemada değil, günlük işte?",
        },
        ai: {
          name: "Yapay zekâ servisleri",
          body: "Bugün birinin elle yaptığı bir okuma, ayıklama ya da hazırlama varsa anlamlıdır. Zaten çalışacak bir sisteme yapıştırılan bir etiket olarak anlamsızdır.",
          question: "Bugün hangi adım zaman yiyor — ve onu bir makine hazırlayabilir mi?",
        },
      },
      connectedLabel: "Bağlı sistemler",
      operationsEyebrow: "Pratik",
      operationsLabel: "Nasıl işletiriz.",
      operationsNote: "Bunun hangi kısmının hizmet olarak alınabileceği Managed işletme sayfasında yazıyor.",
      operations: {
        monitoring: {
          name: "Monitoring",
          body: "Sistemler erişilemez olduklarında kendileri haber verir. Talep hattında bu daha ileri gider: Bir öz test, bir talebin hâlâ iletilip iletilemediğini kontrol eder — oradaki sessiz bir arıza dışarıdan kötü piyasa gibi görünür.",
        },
        logging: {
          name: "Logging",
          body: "Bir hatayı bulmaya yetecek kadar. Sorumluluğu taşınabilecek olandan fazlası değil: Birinin forma yazdığı şey hiçbir kayıtta yer almaz.",
        },
        backups: {
          name: "Yedekler",
          body: "Yedeklenmiş ve geri yüklenmiş. Hiç geri yüklenmemiş bir yedek, yedek değildir — umut edilen bir dosyadır.",
        },
        security: {
          name: "Güvenlik",
          body: "Erişimler, yetkiler, taşıma şifrelemesi ve yanıt başlıkları kurulumda ayarlanan seviyede — ve sonrasında varsayılmaz, ölçülür.",
        },
        deployment: {
          name: "Yayınlama",
          body: "Her değişiklik aynı yoldan geçer: kur, kontrol et, yayına al. Kontrollerden biri kırılırsa yayına alınmaz — acele olsa bile.",
        },
      },
      proofEyebrow: "Kanıt",
      proofLabel: "Bu sitede doğrulanabilir.",
      proofNote: "Göstermek, iddia etmekten iyidir. Her nokta dışarıdan yanıt başlığında, gönderilen kaynak kodda ya da depoda kontrol edilebilir — bize sormaya gerek yok.",
      proofs: {
        headers: {
          name: "Güvenlik başlıkları",
          body: "Alt alan adları ve preload ile HSTS, X-Content-Type-Options, Referrer-Policy, DENY olarak X-Frame-Options, Permissions-Policy ve object-src, base-uri, form-action ile frame-ancestors'ı hâlihazırda zorlayan bir Content-Security-Policy.",
        },
        static: {
          name: "Statik olarak sunulur",
          body: "Sayfalar derleme anında üretilir ve CDN'den sunulur, her çağrıda yeniden oluşturulmaz. Sitenin hızlı olmasının nedeni budur — ve uygulamadaki bir arızanın onu hemen götürmemesinin de.",
        },
        bilingual: {
          name: "İki dil, iki adres",
          body: "Almanca ve Türkçe'nin kendi URL'leri, kendi başlıkları, kendi yapılandırılmış verileri vardır ve hreflang ile bağlıdır — tarayıcıda metin değiştiren bir düğme değil.",
        },
        images: {
          name: "AVIF ve WebP görseller",
          body: "Görseller derleme anında dönüştürülür ve düzenin gerçekten ihtiyaç duyduğu boyutta sunulur. AVIF desteklemeyen WebP alır — otomatik olarak, kodda bir dallanmayla değil.",
        },
        gates: {
          name: "Derlemede üç kontrol",
          body: "Bir fonksiyon fazla büyürse, yapılandırılmış veri olmayan yıldızları iddia edecek olursa ya da bir hizmet sayfası Türkçe'de Almanca'dan az şey söylerse derleme durur. Niyet beyanı değil — durdurma.",
        },
        selftest: {
          name: "Talep hattının öz testi",
          body: "Ayrı bir yol, talep hattının anahtarını, gönderici alan adını ve kötüye kullanım korumasını e-posta göndermeden kontrol eder. Bir kontrol düşerse, bir gözcünün anlayacağı bir hata döner.",
        },
        accessibility: {
          name: "Açıkça yayımlanmış kendi erişilebilirlik denetimimiz",
          body: "Bu siteyi kendimiz denetledik ve bulduğumuz eksikleri, bulgusuz bir beyan vermek yerine yayımladık. Erişilebilirlik sayfasında okunabilir.",
        },
      },
    },
    betriebPage: {
      eyebrow: "İşletme",
      title: "Teslim etmek kolaydır. Asıl iş işletmektir.",
      lead: "Çoğu proje yayına alınmayla biter. Asıl kimsenin satmadığı kısım ondan sonra başlar: güncellemeler, kesintiler, güvenlik açıkları ve bir anda kimsenin yapamadığı küçük değişiklikler. Biz kalırız.",
      metaTitle: "Managed işletme — hosting, monitoring, güncelleme, yedekleme",
      metaDescription:
        "creaDIG kurduğu şeyi işletir: hosting, monitoring, güncellemeler, güvenlik, yedekler, destek ve geliştirme. Aylık iptal edilebilir — sistem ve veriler size aittir.",
      whyLabel: "Neden teslim değil de işletme",
      why: [
        {
          name: "Kuran, yerini bilir",
          body: "Yabancı bir bakım ekibi her hatada önce yabancı kod okur. Biz kendi kodumuzu okuruz — bu yüzden „çabuk olur mu?“ sorusunun cevabı burada çoğu zaman evettir.",
        },
        {
          name: "Sisteme kimse dokunmasa da yaşlanır",
          body: "Bağımlılıklarda güvenlik açıkları çıkar, sertifikalar dolar, tarayıcılar kurallarını değiştirir. Hiçbiri önceden haber vermez ve hiçbiri bir sonraki proje bütçesini beklemez.",
        },
        {
          name: "Kesinti mesai saatinde gelmez",
          body: "Gece gelir, hafta sonu gelir, tatilde gelir. Soru birinin fark edip etmeyeceği değil, önce kimin fark edeceğidir: monitoring mi, müşteriniz mi.",
        },
        {
          name: "İşletmede yanlış çıkan şey değiştirilir",
          body: "Hiçbir yapı ilk gerçek ayı değişmeden atlatmaz. Teslim tarihli bir projede böyle bir şey belgelenir ve öylece bırakılır. İşletmede ise değiştirilir.",
        },
      ],
      ownershipLabel: "Bağımlılık",
      ownershipTitle: "İşletme, bağımlılık demek değildir.",
      ownershipBody: "Sistem ve içindeki tüm veriler ilk günden itibaren size aittir. Bakım aylık olarak, asgari süre olmadan iptal edilebilir. Sonrasında her şey sizde kalır — kod, içerikler, erişimler ve alan adı. Biten şey bakımdır, erişiminiz değil.",
    },
    contact: {
      eyebrow: "İletişim",
      title: "20 dakikada, bağlayıcı olmadan.",
      lead: "Almanca ve Türkçe. Size en hızlı gelen yolu seçin.",
      directTitle: "Üç yol. Hepsi bir insana çıkar.",
      directLead: "İlk görüşme randevu talebinden geçer — orada dört adımda konuyu anlatırsınız. Sadece bir sorusu olan doğrudan yazar: WhatsApp'tan ya da e-postayla, Almanca veya Türkçe.",
      mailTitle: "E-posta",
      mailNote: "Belgeler, teklifler ve yazılı her şey için.",
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
      whatsappIntro: "Merhaba creaDIG, bir proje hakkında bilgi almak istiyorum.",
      whatsappAction: "WhatsApp'tan yazın",
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
      /*
       * MP-A · Canon. Hier stand „İşletmeyi" — ohne Possessiv. Der Canon des
       * Owners sagt „İşletmenizi": DEN Betrieb gegen IHREN Betrieb. Ein Wort,
       * und es entscheidet, ob der Satz den Leser meint.
       */
      title: "İşletmenizi siz yönetirsiniz. Arkasındaki sistemi biz kurarız.",
      lead: "Yirmi dakika, ücretsiz ve bağlayıcı değil. İşletmeye bakar ve yardımcı olabilir miyiz, dürüstçe söyleriz.",
      ctaPrimary: "Projeye başla",
      ctaSecondary: "İşleri gör",
      variants: {
        prices: {
          eyebrow: "Sonraki adım",
          title: "Kapsamınıza sabit bir fiyat — yirmi dakika sonra.",
          lead: "Yukarıdaki, giriş adımıdır. İşletmenizin neye ihtiyacı olduğuna, kimse bir rakam söylemeden önce bakarız — ücretsiz ve bağlayıcı değil.",
          ctaPrimary: "Sabit fiyat teklifi isteyin",
          ctaSecondary: "İşleri gör",
        },
        work: {
          eyebrow: "Sonraki adım",
          title: "Benzer bir işiniz mi var? Konuşalım.",
          lead: "Yirmi dakika, ücretsiz ve bağlayıcı değil. İşinizin burada gördüklerinize uyup uymadığını dürüstçe söyleriz.",
          ctaPrimary: "İşinizi konuşalım",
          ctaSecondary: "Hizmetleri gör",
        },
      },
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
          bodyStored:
            "Formlarımızdan birini gönderdiğinizde bilgilerinizi — ad, işletme, e-posta, telefon ve mesajınız — info@creadig.de posta kutumuza iletiriz ve size bir onay göndeririz. Gönderim için GDPR Md. 28 uyarınca veri işleyenimiz olan Resend'i (Resend Inc., ABD) kullanırız; aktarım GDPR Md. 46/2-c uyarınca AB standart sözleşme maddeleriyle güvence altındadır. Hukuki dayanak, göndermeden önce açıkça verdiğiniz ve geleceğe yönelik olarak istediğiniz zaman geri alabileceğiniz GDPR Md. 6/1-a onayınızdır. Ayrıca talebinizi bir veritabanında saklarız; böylece güvenilir biçimde işleyebilir ve hangi aşamada olduğunu takip edebiliriz. Bu veritabanını GDPR Md. 28 uyarınca veri işleyen sıfatıyla Neon, LLC işletir; veriler Frankfurt bölgesinde (aws-eu-central-1) tutulur. Sözleşme kurulmazsa talebinizi son temastan 12 ay sonra sileriz. Bunun yerine WhatsApp yolunu seçerseniz Meta Platforms Ireland Ltd. koşulları geçerlidir.",
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
      tagline: "Identity, Digital, Operations, Automation ve Intelligence için sistem evi.",
      productsLabel: "Ürünler",
      navLabel: "Sayfa",
      layersLabel: "Beş katman",
      legalLabel: "Yasal",
      imprint: "Künye",
      privacy: "Gizlilik",
      socialLabel: "Sosyal",
      statusLabel: "Malzeme durumu",
      rights: "Tüm hakları saklıdır.",
    },
  },
  /*
   * GATE 3 — die englische Fassung.
   *
   * ---------------------------------------------------------------------------
   * QUELLE
   * Der aktuelle deutsche System-Haus-Canon, nicht die alte Website. Die
   * Legacy-Seite hatte eine englische Fassung; sie beschreibt eine
   * Digitalagentur mit anderen Paketen und anderen Preisen. Sie ist hier als
   * Terminologie-Referenz benutzt worden und an keiner Stelle als Positionierung.
   *
   * ---------------------------------------------------------------------------
   * NICHT VEROEFFENTLICHT
   * Dieser Block steht im Objekt, aber "en" steht NICHT in `locales`. Damit
   * ist er vollstaendig und typgeprueft, aber ohne Route — genau der Zustand,
   * den der Canon verlangt ("keine Sprache halb veroeffentlichen").
   *
   * Was zum Livegang noch fehlt, steht in `docs/i18n/current-state.md`:
   * die `Localized`-Eintraege in site-data/insights/betriebscheck/branchen,
   * der Routenbaum unter app/(en)/ und der Eintrag in `locales`.
   *
   * ---------------------------------------------------------------------------
   * EIN SATZ, DER MITWANDERN MUSS
   * `legal.privacyPoints` enthaelt "We do not keep a database" — die
   * Uebersetzung des heutigen, wahren deutschen Satzes. Wird die Lead-
   * Persistenz scharfgeschaltet, wird er hier genauso falsch wie in DE und TR.
   * Siehe `docs/ops/privacy-persistence-gate.md`.
   */
  en: {
    meta: {
      siteTitle: "creaDIG — systems house for brand, web and AI",
      siteDescription:
        "creaDIG is the house above its own systems — from brand to AI. We build them. And we run them. A systems house for Germany, Austria and Switzerland.",
      ogTitle: "creaDIG — we build what others never see.",
      ogDescription:
        "A systems house since 2017. Our own products, real clients, AI systems we build and operate. Germany, Austria, Switzerland.",
      organizationDescription:
        "Systems house for brand, web, operations, automation and AI. Our own products: meAI, fibero, CASSAMEA, meahv.",
      breadcrumbHome: "Home",
      ogImageAlt: "creaDIG — systems house for brand, web and AI",
    },
    brand: {
      categoryLabel: "Category",
      category: "Not a classic IT systems house. A systems house for digital operations.",
    },
    home: {
      statement: {
        eyebrow: "creaDIG in one sentence",
        title: "We design systems, build them ourselves and keep them running.",
        body: "From the brand through the digital presence and day-to-day operations to automation and artificial intelligence. Five levels that build on each other — and four products of our own on which we have tested them.",
        cta: "About the company",
      },
      work: {
        eyebrow: "Selected work",
        title: "Show first. Talk after.",
        cta: "All work",
        ctaEnd: "See all work",
      },
      capabilities: {
        eyebrow: "Services",
        title: "From the brand to intelligence.",
        lead: "Every level carries the next. You can start at any one of them — and stop at any one of them.",
        cta: "All services",
      },
      entry: {
        eyebrow: "Getting started",
        priceLead: "Website package from",
        priceNote: "excl. VAT. Fixed price for the agreed scope.",
        priceCta: "Packages and prices",
        questionsLabel: "Two questions up front",
        questionsCta: "All questions",
      },
      products: {
        cta: "All products",
      },
      company: {
        eyebrow: "The company",
        title: "A house that grows.",
        body: "Founded in 2017, led by Muhammed Emin Akyol — with a small core team and a specialised network across Germany, Austria and Switzerland.",
        cta: "More about us",
      },
      insights: {
        eyebrow: "Insights",
        title: "Notes from the build.",
        cta: "All notes",
      },
    },
    insightsPage: {
      eyebrow: "Insights",
      title: "Notes from the build.",
      lead: "Not a blog. Notes from running systems: why a decision went one way and not the other, what a system taught us in daily use, which assumption turned out to be wrong.",
      metaTitle: "Insights — system notes from creaDIG",
      metaDescription:
        "Notes from building our own systems: decisions, experience from running them, and what turned out to be wrong.",
      emptyTitle: "Nothing published yet.",
      emptyBody:
        "The first note is still to come. We only write here once a system has run long enough for there to be something to learn from it — until then the page stays empty rather than filling itself with sample texts.",
      emptyCtaProducts: "What we have built",
      emptyCtaWorks: "See our work",
      readLabel: "Read",
      categoriesLabel: "What we write about",
      categories: {
        systems: "Systems",
        automation: "Automation",
        ai: "Artificial intelligence",
        products: "Products",
        betrieb: "Operations",
        praxis: "Practice",
      },
      publishedLabel: "Published",
      sourcesLabel: "For reference",
      sourceStatement: "Accessibility statement for this site",
      sourceService: "Accessibility as a service",
      backCta: "All notes",
    },
    kontaktPage: {
      eyebrow: "Contact",
      title: "Choose the route that fits.",
      lead: "Not every enquiry starts with an appointment. Some start with a look at what we have built — that is a route to us as well. Advice in German, Turkish and English.",
      metaTitle: "Contact — creaDIG Osnabrück",
      metaDescription:
        "Reach creaDIG: by WhatsApp, email, a free first consultation, or straight through our work. ICO InnovationsCentrum Osnabrück, advice in German, Turkish and English.",
      intentsLabel: "Where would you like to start?",
      intents: {
        talk: {
          name: "Discuss a project",
          what: "Tell us in your own words what it is about — by WhatsApp or email, no form.",
          cta: "See the direct routes",
        },
        appointment: {
          name: "Book an appointment",
          what: "A twenty-minute first conversation, free and without obligation. Four steps and your request is in.",
          cta: "Request an appointment",
        },
        products: {
          name: "See the products",
          what: "Four systems of our own that we built and run ourselves. The fastest way to form a judgement about us.",
          cta: "To the products",
        },
        works: {
          name: "See the work",
          what: "Our own products and client work, kept clearly apart. Detailed case write-ups follow as approvals come in.",
          cta: "See our work",
        },
      },
      mailLabel: "Email",
      mailNote: "For documents, proposals and anything in writing.",
    },
    unternehmenPage: {
      eyebrow: "Company",
      title: "The house behind the systems.",
      lead: "creaDIG is not an agency that delivers a project and disappears. We are a house that invents its own products, builds them itself and keeps them running — from the brand through the software to artificial intelligence.",
      statement: "What we develop for clients, we operate for ourselves. That substance is what separates a systems house from a presentation.",
      metaTitle: "Company — a systems house from Osnabrück, since 2017",
      metaDescription:
        "creaDIG: systems house at the ICO InnovationsCentrum Osnabrück, founded in 2017. Founder, way of working, focus areas and location — one house, five levels, four products of our own.",
      chapters: {
        label: "The path",
        title: "A house is not built by announcing it.",
        items: [
          {
            year: "2017",
            title: "The beginning",
            body: "Founded in Osnabrück — as an agency. Brand, presence, individual commissions. Everything that came after grew out of that, not beside it.",
          },
          {
            year: null,
            title: "Commissions became products",
            body: "What kept recurring in projects, we built instead of solving it again every time. Four systems of our own: meAI, fibero, CASSAMEA, meahv — invented, built and operated by us.",
          },
          {
            year: "today",
            title: "The house",
            body: "Based at the ICO InnovationsCentrum Osnabrück. Our own products in operation, client work in Germany and Switzerland — and the same hand that builds picks up the phone afterwards.",
          },
        ],
      },
    },
    arbeitenPage: {
      eyebrow: "Work",
      title: "Built. And operated.",
      lead: "Four products of our own that we invented and built ourselves — alongside client work from Germany and Switzerland. Listed separately, so it is clear what belongs to us.",
      metaTitle: "Work — our own products and client work",
      metaDescription:
        "The creaDIG portfolio: four products of our own and client work from Germany and Switzerland. Listed separately — our own systems and commissioned work are not the same thing.",
    },
    arbeitPage: {
      breadcrumb: "Work",
      kindLabel: "Type",
      sectorLabel: "Sector",
      regionLabel: "Region",
      statusLabel: "Status",
      builtLabel: "What we built",
      whatLabel: "What it is about",
      backLabel: "All work",
      caseGatedNote:
        "We publish a detailed case write-up with starting point, solution and outcome only with the client's written approval. Once it exists, it appears here.",
      ctaTitle: "A similar starting point in your business?",
      ctaBody: "Twenty minutes, free and without obligation. We look at the operation and tell you honestly whether we can help.",
      ctaPrimary: "Start a project",
      ctaSecondary: "All work",
    },
    produktePage: {
      eyebrow: "Proof, not a catalogue",
      title: "Four products we run ourselves.",
      lead: "This page sells none of them. It exists because it backs up what we say about ourselves: creaDIG built every one of these systems from the ground up — and uses it in its own day-to-day work. What we build for you is under Services.",
      metaTitle: "Our own products — meAI, fibero, CASSAMEA, meahv",
      metaDescription:
        "The four products creaDIG built for itself: meAI (AI business operating system), fibero (fibre-optic operations), CASSAMEA (hospitality POS, Switzerland) and meahv (property management).",
      builtLabel: "What we built",
      sectorLabel: "Sector",
      statusLabel: "Status",
      regionLabel: "Market",
      openLabel: "View product",
      liveLabel: "Open live",
      clientWorkTitle: "What we built for others.",
      clientWorkNote: "Explicitly not a product of ours — work for clients.",
      clientWorkCta: "See our work",
    },
    produktPage: {
      interest: {
        eyebrow: "Register interest",
        title: "Shall we let you know?",
        body: "If {product} is of interest for your business: leave an address and we will get in touch once it is ready. No newsletter, no advertising — one message about this product.",
        emailLabel: "Email",
        emailPlaceholder: "so we can reach you",
        nameLabel: "Name (optional)",
        namePlaceholder: "how should we address you?",
        submit: "Let me know",
        sentTitle: "Noted.",
        sentBody: "We will be in touch as soon as there is something to say about this product. A confirmation is in your inbox.",
        phoneOmitted: "not provided (product enquiry)",
        messageTemplate: "Interest in the product {product} — please notify me as soon as it is available.",
      },
      breadcrumb: "Products",
      problemLabel: "What it was built for",
      thesisLabel: "The thesis",
      functionsLabel: "What it does",
      architectureLabel: "System & architecture",
      operationsLabel: "How it is operated",
      learningsLabel: "What operating it taught us",
      statusBadge: {
        live: "Live",
        beta: "Private beta",
        aufbau: "In build",
        intern: "In our own operation",
      },
      maturityBadge: {
        live: "Live",
        pilot: "Pilot",
        "private-beta": "Private beta",
        "in-development": "In development",
      },
      builtLabel: "What we built",
      blocksLabel: "Building blocks",
      blocksTitle: "Built ourselves, block by block.",
      sectorLabel: "Sector",
      statusLabel: "Status",
      regionLabel: "Market",
      liveLabel: "Open live",
      backLabel: "All products",
      systemLabel: "Where it sits in the system",
      systemBody:
        "Every product of ours sits on one of the five levels — and we offer that same level as a service. What we have built here, we also build for your business.",
      layerLabel: "Level",
      servicesLabel: "Matching services",
      layerCta: "View level",
      houseContextLabel: "Under the same roof",
      houseContextNote:
        "We do not only build for this field — we work in it ourselves. That is why we know the questions before they are asked.",
      storyLabel: "Why we built it",
      nextLabel: "Next product",
      prevLabel: "Previous product",
      screensPending:
        "We only show interfaces once we can capture the real application with demo data. Until then, what is built is written here — rather than an image claiming something else.",
      screensLabel: "The real interface",
      screensCaption: "Real interface, demo data.",
      screensAlt: "real interface with demo data",
      ctaTitle: "Does this fit your business?",
      ctaBody: "Twenty minutes, free and without obligation. We look at the operation and tell you honestly whether we can help.",
      ctaPrimary: "Start a project",
      ctaSecondary: "All products",
    },
    leistungenPage: {
      eyebrow: "Services",
      title: "Five levels. One system.",
      lead: "Brand, presence, operations, automation, intelligence. Each level carries the next — not side by side, but as one system. What we built for our own products, we bring into your working day.",
      metaTitle: "Services — from the brand to AI",
      metaDescription:
        "The five levels of creaDIG: brand, digital presence, operations, automation and AI. For companies in Germany, Austria and Switzerland — in German, Turkish and English.",
      pricingLabel: "Prices",
      pricingNote:
        "Standard products are priced transparently. Systems development is quoted individually — by scope, not by the hour.",
    },
    nav: {
      home: "Home",
      leistungen: "Services",
      produkte: "Products",
      arbeiten: "Work",
      unternehmen: "Company",
      insights: "Insights",
      betrieb: "Managed operations",
      systeme: "Systems",
      hints: {
        leistungen: "What we build for you",
        produkte: "What we built and run ourselves — proof, not a catalogue",
        arbeiten: "Delivered projects, named",
        unternehmen: "Who is behind it and how we work",
        insights: "Technical notes from live operation",
        kontakt: "Four ways to start a conversation",
      },
      ueber: "About us",
      pakete: "Packages",
      kontakt: "Contact",
      cta: "Start a project",
      menu: "Open menu",
      close: "Close menu",
      menuTitle: "Navigation",
      theme: "Switch appearance",
      language: "Change language",
      skipToContent: "Skip to content",
    },
    hero: {
      eyebrow: "Systems house · Osnabrück · since 2017",
      headlineLine1: "We build",
      headlineLine2: "what others",
      headlineLine3: "never see.",
      subline:
        "creaDIG builds brand, digital presence, operations, automation and artificial intelligence as one system — for companies in Germany, Austria and Switzerland.",
      systemLine: "Five levels. One system.",
      ctaPrimary: "Start a project",
      ctaSecondary: "Our work",
      location: "Germany · Austria · Switzerland",
      scroll: "Scroll",
    },
    impact: {
      eyebrow: "The foundation",
      title: "Not a concept. A running operation.",
      figures: {
        since: { label: "Since", detail: "Grown from an agency into a systems house." },
        products: { label: "Own products", detail: "meAI, fibero, CASSAMEA, meahv — built ourselves." },
        systems: {
          label: "Systems in production",
          detail: "Systems running today in the daily work of a business.",
        },
        automated: {
          label: "Automated steps",
          detail: "Steps somebody used to do by hand.",
        },
        operatingYears: {
          label: "Years in business",
          detail: "Without interruption, counted from the founding in 2017.",
        },
      },
      facts: {
        regions: {
          label: "Markets",
          value: "Germany, Austria & Switzerland",
          detail: "Advised and built in German, Turkish and English.",
        },
        scope: {
          label: "Span",
          value: "From the brand to AI",
          detail: "Five levels. One system.",
        },
      },
      note: "Systems in daily operation — not in a presentation.",
    },
    logos: {
      eyebrow: "Ecosystem",
      title: "What runs under this roof",
      ownProducts: "Own products",
      clients: "Clients",
      brands: "Brands in our working environment",
      note: "We built our own products and operate them ourselves. Clients appear here only with their consent. Third-party brands do not appear at all — no name without approval.",
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Built. And operated.",
      lead: "Four products of our own that we invented and built ourselves — alongside client work from Germany and Switzerland. Listed separately, so it is clear what belongs to us.",
      built: "What we built",
      products: "Own products",
      productsNote: "Invented, built and operated by us.",
      clientWork: "Client work",
      clientWorkNote: "A service for clients — not a product of ours.",
      kindProduct: "Product",
      kindClientWork: "Client work",
      more: "Also under this roof",
      viewLive: "View live",
      mockupNote: "Product cards: illustrative mock-ups, not screenshots.",
      productPhotoNote:
        "Product images show the real interface (demo data) — not mock-ups.",
      customerPhotoNote: "Client images show the real interface — not mock-ups.",
      imageNoteMixed:
        "Real interfaces (product & client) and illustrative mock-ups — labelled separately, never mixed.",
      viewLabel: "View",
      viewCards: "Cards",
      viewRegistry: "Register",
      colProject: "Project",
      colSector: "Sector",
      colRegion: "Region",
      registryNote: "The same projects, densely listed. We add years once they are documented — estimated years do not appear here.",
    },
    cases: {
      eyebrow: "Client cases",
      title: "What changed afterwards.",
      lead: "Every case in the same order: where the business stood, what was holding it up, what it wanted to achieve — and only then what our part in it was. Only with the client's written approval; without approval, nothing appears here.",
      card: {
        project: "Project",
        category: "Category",
        services: "Services",
      },
      chapters: {
        start: "Starting point",
        problem: "The problem",
        goal: "The goal",
        role: "Our role",
        system: "The system",
        delivery: "Delivery",
        result: "Outcome",
        today: "Today",
      },
      metricsLabel: "Figures",
      sourceLabel: "Source",
      voiceLabel: "In the client's words",
    },
    reviews: {
      eyebrow: "Reviews",
      title: "What clients have written.",
      lead: "In the original wording, with name and date. We do not translate reviews — a translated sentence is a sentence the person never wrote.",
      verify: "Read on Google",
      projectLabel: "Project",
      sourceGoogle: "Google review",
      sourceClient: "Sent directly to us",
      ofFive: "out of 5",
      countOne: "review",
      countMany: "reviews",
    },
    faq: {
      eyebrow: "Frequent questions",
      title: "What prospects ask first.",
      lead: "Six questions that come up in almost every first conversation — answered here in advance. Every answer matches what we say on the phone.",
      more: "Your question is not here?",
      moreCta: "Ask directly",
      items: [
        {
          q: "What does a creaDIG presence cost?",
          a: "The website package costs €2,400 excl. VAT as a reference price for the first two businesses, then €3,900 excl. VAT. Ongoing support costs €149 excl. VAT per month. All prices plus 19% VAT, fixed price for the agreed scope.",
        },
        {
          q: "How does a project run?",
          a: "In three steps: understand, build, operate. We look at the business, build the system and then keep it running.",
        },
        {
          q: "What is meAI?",
          a: "meAI is our AI business operating system — it brings together figures, tasks and documents and prepares decisions. Live at meai.run.",
        },
        {
          q: "Do you work in Switzerland as well?",
          a: "Yes. We are based at the ICO InnovationsCentrum Osnabrück; Switzerland is a market we serve. CASSAMEA was built specifically for Swiss hospitality.",
        },
        {
          q: "Do you speak Turkish?",
          a: "Yes. Advice, documents and ongoing support are available in German and Turkish — entirely over WhatsApp if you prefer.",
        },
        {
          q: "Who owns the system — and what happens if I cancel the support?",
          a: "The system and all the data in it belong to you from day one. Ongoing support at €149 excl. VAT per month can be cancelled monthly, with no minimum term. Afterwards everything stays with you: code, content, access and domain — we hand over what we hold, and you can continue with anyone else. What ends is the support, not your access.",
        },
      ],
    },
    servicePage: {
      breadcrumbHome: "Home",
      breadcrumbServices: "Services",
      includesLabel: "What is included",
      forWhomLabel: "Who it is for",
      layerLabel: "Level in the system",
      processLabel: "How it runs",
      durationLabel: "How long it takes",
      fromToLabel: "What changes in the business",
      fromToBefore: "Before",
      fromToAfter: "After",
      clientEffortLabel: "What you contribute",
      packagesLabel: "Included in these packages",
      packagesCta: "See packages and prices",
      worksLabel: "Related work",
      worksCta: "See the full portfolio",
      boundaryLabel: "What we do — and what we do not",
      boundaryWeLabel: "We take this on",
      boundaryNotWeLabel: "We do not take this on",
      ownProofLabel: "Tested on our own systems",
      priceLadderLabel: "What it costs",
      priceFixed: "Fixed price",
      priceOffer: "Quote after the review",
      priceMonthly: "per month",
      ctaTitle: "Does this fit your business?",
      ctaBody: "Twenty minutes, free and without obligation. We look at the operation and tell you honestly whether we can help.",
      ctaPrimary: "Free first consultation",
      ctaSecondary: "Ask via WhatsApp",
    },
    quickCheck: {
      eyebrow: "Quick check",
      title: "Three points on your site. Free.",
      lead: "You give us the address, we look at the site — by hand, with keyboard and screen reader. You get three concrete points: what we noticed, where it is, and what it means for your visitors.",
      siteLabel: "Website address",
      sitePlaceholder: "mybusiness.com",
      errSite: "Please give us your website address — without it we have nothing to look at.",
      messageLabel: "Anything we should know?",
      messagePlaceholder: "Optional. For example: the shop, the booking flow, feedback from a customer.",
      submit: "Request the quick check",
      sentTitle: "Received.",
      sentBody:
        "We will look at your site and come back with three concrete points — free and without obligation.",
      limitTitle: "What the quick check is not",
      limitBody:
        "It shows three points, not all of them. It is not a full audit against WCAG 2.1 AA — that is manual work and takes longer than a look. And it is not a legal assessment.",
      humanNote:
        "Not an automated scanner: a person looks at the site. That is why it takes two working days and not two seconds.",
    },
    architecture: {
      eyebrow: "The house",
      title: "One roof, five levels, four products.",
      lead: "The whole company in one view: the roof on top, the five levels below it, operations running across underneath — and at the bottom the four products of our own, each on the level where it sits.",
      roofLabel: "The roof",
      roofNote: "Systems house, Osnabrück, since 2017",
      layersLabel: "Five levels",
      operateLabel: "Running across",
      operateNote: "Hosting · monitoring · updates · security · backups · support · further development",
      productsLabel: "Four products of our own",
      onLayer: "on level",
      caption:
        "Not an org chart and not a market overview — the order of our own house. We offer every level as a service; every product is the evidence that we built it ourselves.",
    },
    services: {
      eyebrow: "Services",
      title: "Five levels. One system.",
      lead: "We work from A to Z — from the first logo to a company's own AI system. Each level builds on the one below it.",
      forWhom: "Who it is for",
      entryLabel: "Entry point",
      problemLabel: "Starting point",
      solutionLabel: "What we build",
      resultLabel: "What is different afterwards",
      projectsLabel: "Typical projects",
      detailLabel: "In detail",
      depthLabel: "In depth",
      layers: {
        identity: {
          name: "Identity",
          what: "Brand, name, logo, presence — the foundation everything else stands on.",
          who: "Founders, new businesses, trades before their first public presence.",
          problem:
            "The business has a name but no picture. Quote, van, invoice and sign look different every time — the customer has to work out who they are dealing with at every contact.",
          solution:
            "We build a brand system rather than a logo: mark, typeface, colours and how to apply them, documented and handed over — so the print shop and the next supplier can work with it without guessing.",
          result: "Everything that leaves the business visibly comes from it. No queries, no rebuilding, nobody eyedropping a colour out of an old PDF.",
          projects: [
            "Corporate design",
            "Brand system",
            "Logo & wordmark",
            "Business stationery",
            "UI foundations",
          ],
        },
        digital: {
          name: "Digital",
          what: "Website, shop, landing pages — visible, fast, findable.",
          who: "Bakeries, practices, restaurants, trade businesses.",
          problem:
            "The website is a brochure. It is online, but it receives nothing — no enquiry, no application, no appointment. And nobody knows how many people walked past it.",
          solution:
            "We build the presence as part of the business: website, portal, web app or shop, connected to whatever happens next. Accessibility to WCAG 2.1 AA is built in, not retrofitted.",
          result: "Enquiries arrive, can be traced, and land where they are handled — instead of in an inbox nobody opens on a Friday.",
          projects: [
            "Websites",
            "Web apps",
            "Portals",
            "E-commerce",
            "Mobile",
            "Accessibility",
          ],
        },
        operations: {
          name: "Operations",
          what: "Point of sale, planning, billing, administration — the business inside one system.",
          who: "Hospitality, field service, administration, service providers.",
          problem:
            "The business runs on notes, spreadsheets and three programs that know nothing about each other. Answering one question means searching in four places — and the answer is already out of date before it is finished.",
          solution:
            "We structure the business in one system: job, customer, document and figure in one place, with interfaces to whatever should stay. What has to be bespoke, we build; what already exists off the shelf, we do not buy twice.",
          result: "One source of an answer instead of four. And someone new finds their way around the system rather than around a colleague's memory.",
          projects: [
            "CRM",
            "Job management",
            "Back office",
            "Data & interfaces",
            "Dashboards",
            "Custom software",
          ],
        },
        automation: {
          name: "Automation",
          what: "Recurring work is done by the system, not by a person.",
          who: "Businesses with 6–20 staff and a growing pile of paperwork.",
          problem:
            "The same work, every day, by hand: retyping receipts, forwarding emails, chasing quotes, reconciling lists. It goes unnoticed because it is never much at once — it is noticed at the end of the month.",
          solution:
            "We automate the routes, not the people: the system takes over processes, interfaces, documents and incoming email. Always with one place where a person can see what did not go through.",
          result: "Recurring work happens without anyone having to remember it. And when something gets stuck, it says so instead of sitting there quietly.",
          projects: [
            "Workflows",
            "APIs & integrations",
            "Document processing",
            "Email processing",
            "Process automation",
          ],
        },
        intelligence: {
          name: "Intelligence · meAI",
          what: "An AI system that thinks along, prepares and keeps the overview.",
          who: "Established businesses that want to decide faster.",
          problem:
            "The figures are there, the decision is not. Anyone who wants to make it opens five reports and afterwards knows more — but not better.",
          solution:
            "On top of that we build a system that reads instead of displays: it classifies, prioritises and prepares options. meAI is our own version — built by us, run by us, and proven in our own working day before it reaches a business.",
          result: "The question “what comes first today” has an answer — and the reason stands next to it.",
          projects: [
            "Analysis",
            "Prioritisation",
            "Knowledge",
            "AI & agents",
            "meAI",
          ],
        },
      },
    },
    houseProducts: {
      eyebrow: "Under this roof",
      title: "Four products of our own.",
      lead: "Invented, built and operated by us — and therefore the best evidence of what we can build for others. Not a catalogue: none of them is for sale here. The deep dive into our flagship meAI follows directly below.",
      statusLabel: "Status",
      openLabel: "Open",
    },
    meai: {
      eyebrow: "Flagship · meai.run",
      title: "Your invisible managing director.",
      lead: "meAI is our AI business operating system. It reads the business, prepares decisions and holds together what would otherwise be scattered across heads and scraps of paper.",
      dna: "The rare double DNA: we do not only build the AI system — we run our own business on it. What meAI can do has been proven in our own working day before it reaches a client.",
      cta: "Open meai.run",
      capabilities: {
        overview: {
          name: "Overview",
          what: "Figures, tasks and appointments in one place, always current.",
        },
        tasks: {
          name: "Prioritisation",
          what: "The system says what comes first today — and why.",
        },
        documents: {
          name: "Documents",
          what: "Invoices and receipts are read, sorted and assigned.",
        },
        decisions: {
          name: "Decisions",
          what: "Prepared options instead of empty spreadsheets.",
        },
      },
    },
    process: {
      eyebrow: "How we work",
      title: "Understand. Build. Operate.",
      bridge: "creaDIG builds the system — the system runs itself — you keep the overview.",
      steps: {
        understand: {
          name: "Understand",
          what: "We look at the business before we build a single line. Where does time get lost, what blocks, what is invisible?",
        },
        build: {
          name: "Build",
          what: "Brand, interface, logic, automation — as one connected system, not a collection of tools.",
        },
        operate: {
          name: "Operate",
          what: "We do not hand over and disappear. We operate, monitor and keep developing.",
        },
      },
      opsEyebrow: "From the first contact",
      opsSteps: {
        request: {
          name: "Enquiry",
          what: "You write to us — by WhatsApp, through the form, or straight away with a preferred date. We reply within two working days.",
        },
        analysis: {
          name: "Analysis",
          what: "A twenty-minute first conversation, free. We look at the business and say what we would build — and what we would not.",
        },
        offer: {
          name: "Quote",
          what: "A fixed quote with scope, price and timeframe. No timesheets, no follow-up claims.",
        },
        implementation: {
          name: "Delivery",
          what: "We build what the quote says — in stages you get to see along the way. Interim states instead of a surprise at the end.",
        },
        operate: {
          name: "Operation",
          what: "After launch we stay on it: operating, monitoring, developing further — for as long as you want.",
        },
      },
    },
    about: {
      eyebrow: "About us",
      title: "A house that grows.",
      founderLabel: "Founder & system lead",
      founder: "Muhammed Emin Akyol",
      body1:
        "creaDIG started in 2017 as an agency. Commissions became products, products became a systems house — today four systems of our own run under this roof, alongside support for the businesses we built them for.",
      body2:
        "The team is growing; the next roles are being prepared. How we work today — who leads, who is in the core team, who is joining — is set out below, without varnish.",
      nicheLabel: "Focus areas",
      niches: [
        "Trade businesses with 6–20 staff — focus on Germany",
        "Small and medium businesses without their own IT department",
        "Hospitality in Germany and Switzerland",
      ],
      nicheOpen:
        "These are focus areas, not conditions. We work with companies of any sector and size — in German, Turkish and English.",
      standardLabel: "Two languages, one standard",
      standardBody:
        "Advice, documents, contracts and ongoing support are available in German and Turkish. The same standard, the same documentation, the same invoice — only in the language in which decisions are made in the business. No interpreter in between and no second, thinner version.",
      locationsLabel: "Location",
      marketsLabel: "Markets",
      honesty:
        "We do not quote invented headcounts or revenue figures. Our proof is work we have built.",
    },
    workModel: {
      eyebrow: "How we work",
      title: "Founder-led — plus exactly the people a project needs.",
      lead: "We do not tell you how big we are, but how we work. That is the more honest figure and the more useful one for you: afterwards you know who leads your project and who is working on it.",
      items: {
        founder: {
          name: "Led by the founder",
          what: "Every project has one person responsible, and it is always the same one. He runs the first conversation, he designs the system, and he answers the phone when something comes up. No handover from sales to delivery, no passing it to someone who was not there.",
        },
        core: {
          name: "A small core team",
          what: "Small enough that everyone knows what the others are working on. Large enough that one holiday does not stop a project.",
        },
        network: {
          name: "Specialists as needed",
          what: "For whatever a project needs on top — development, copy, strategy — we work with a settled network across Germany, Austria and Switzerland. Not bought in anonymously: these are people we have already built with.",
        },
      },
      fieldsLabel: "Areas of responsibility",
      fieldsNote: "Five levels, one responsibility. This is the structure of the house — not a list of skills.",
      honesty:
        "We do not quote a headcount and we do not quote revenue. Both could simply be asserted, and neither says anything about your project. What counts is who works on it.",
    },
    photos: {
      eyebrow: "From the house",
      title: "Where this is made.",
      lead: "No stock photos and no studio office shots. What appears here is the place where the work happens — or nothing appears.",
      slots: {
        buero: {
          caption: "The workspace at the ICO InnovationsCentrum Osnabrück.",
          alt: "The creaDIG workspace at the ICO InnovationsCentrum Osnabrück",
        },
        ico: {
          caption: "The ICO InnovationsCentrum Osnabrück, Albert-Einstein-Straße 1.",
          alt: "The ICO InnovationsCentrum Osnabrück at Albert-Einstein-Straße 1",
        },
        arbeitsplatz: {
          caption: "Screens with real work on them.",
          alt: "A creaDIG workstation with live systems on the screens",
        },
        whiteboard: {
          caption: "A sketch that really came about this way.",
          alt: "Whiteboard with a system sketch from a project",
        },
      },
    },
    location: {
      eyebrow: "Our location",
      note: "You will find us at the InnovationsCentrum Osnabrück. Meetings by arrangement — in person, by video or over WhatsApp.",
      mapLink: "View on the map",
      photoAlt:
        "The ICO InnovationsCentrum Osnabrück at Albert-Einstein-Straße 1 — the home of creaDIG",
    },
    packages: {
      eyebrow: "Entry offers",
      title: "Two ways in — both at a fixed price.",
      lead: "Not every business starts at the top. These two offers are the entry point: clearly bounded, priced in advance, without you having to order the whole house.",
      entryNote:
        "This is the entry point, not the main architecture. What creaDIG builds as a systems house is set out above in the five levels and is quoted by scope — not by package.",
      forWhom: "Who it is for",
      recommended: "Our recommendation",
      tierLabel: "Entry",
      referenceNote:
        "A reference price for the first two businesses — in return for a quote, a mention as a reference and two photographs. From the third business onwards the standard price applies.",
      regularLabel: "Standard price",
      durationLabel: "Project duration",
      netNote: "All prices excl. VAT, plus 19% VAT.",
      openEyebrow: "Larger scope",
      openPrice: "on request",
      openNote:
        "Several locations, a shop, interfaces into inventory management, or a system that goes beyond the website: we quote that by effort — after a conversation, not from a list. We tell you what it costs beforehand, and the figure does not change afterwards.",
      openCta: "Discuss the scope",
      retainerEyebrow: "Ongoing support",
      retainerTitle: "Operation instead of handover.",
      retainerFrom: "from",
      retainerCta: "Request support",
      once: "one-off · fixed price",
      monthly: "/ month",
      items: {
        website: {
          name: "Website package for trades",
          who: "For trade businesses and small companies",
          outcome: "Online in four weeks — with enquiries and applications",
          includes: [
            "A website built for enquiries — not as a brochure",
            "A careers page for applicants",
            "Google Business Profile set up",
            "An enquiry form that actually delivers",
            "Accessibility to WCAG 2.1 AA built in, not retrofitted",
            "Copy — written, not handed back to you as homework",
            "Photo selection and image preparation",
          ],
          note: "Fixed price for the agreed scope. A firm launch date: four weeks from receipt of your material. 50% at the start, 50% on your approval. The site and all access belong to you from day one.",
          cta: "Request a project",
        },
        audit: {
          name: "Accessibility audit",
          who: "For businesses whose site already exists",
          outcome: "A findings report that belongs to you — even if you do nothing afterwards",
          includes: [
            "Manual review against WCAG 2.1 AA across all main pages",
            "A pass with keyboard and screen reader, not just a scan",
            "Every finding with page, element, criterion and measured value",
            "An accessibility statement as a technical template",
            "A re-check after remediation, with figures before and after",
          ],
          note: "Fixed price. The audit stands on its own and commits you to no remediation. What remediation costs we only say once we have seen the code — nobody names a fixed price for something unseen and means it.",
          cta: "See the service",
        },
      },
    },
    managed: {
      eyebrow: "Operate",
      title: "Managed operations.",
      lead: "The five levels stand vertically on each other. This runs across underneath them and touches every one: what has been built has to run — every day, including the days nobody thinks about it.",
      statement: "We do not hand over and disappear. What we have built, we keep running — if something fails at night, that is our problem and not yours.",
      itemsLabel: "What is included",
      items: {
        hosting: {
          name: "Hosting",
          what: "Servers, domains and certificates — set up, paid for and in our hands.",
        },
        monitoring: {
          name: "Monitoring",
          what: "The site reports when it is unreachable. Not your customer.",
        },
        updates: {
          name: "Updates",
          what: "Dependencies and system versions stay current — before a gap becomes an incident.",
        },
        security: {
          name: "Security",
          what: "Access, permissions, headers and transport encryption at the level set when it was built.",
        },
        backups: {
          name: "Backups",
          what: "Backed up and restorable. A backup that has never been restored is not one.",
        },
        support: {
          name: "Support",
          what: "One contact who built the system himself. A call back the next working day.",
        },
        evolution: {
          name: "Further development",
          what: "Whatever turns out to be wrong in operation gets changed — not documented and left standing.",
        },
      },
      note: "No availability in per cent, no response time in hours, no “24/7”. What is promised is what is written here — and we keep it on holiday too.",
    },
    systemePage: {
      eyebrow: "Systems",
      title: "Integration first.",
      lead: "A new system rarely replaces everything. Most of the time it has to run alongside what is already there — and talk to it. What needs settling in the process is set out here.",
      metaTitle: "Systems & integration — interfaces, data, operation",
      metaDescription:
        "How creaDIG connects and operates systems: interfaces, data, hosting, billing, documents, access, AI services. Plus seven points you can verify on this page itself.",
      statement: "A system that only works on its own is a second place where the same data is maintained. That is precisely what nobody wanted.",
      categoriesEyebrow: "Integration",
      categoriesLabel: "What a system has to talk to.",
      categoriesNote: "Not a vendor catalogue. What is listed here is what we settle before building — not which third-party brands we supposedly master. What we have actually connected, we name in conversation.",
      categoryQuestionLabel: "What gets settled first",
      categories: {
        interfaces: {
          name: "Interfaces",
          body: "Almost every system has to fetch data from somewhere or hand it over. Whether an interface exists decides half the effort — and it is decided before the first draft, not in the middle of the build.",
          question: "Is there a documented interface, an export, or nothing at all?",
        },
        data: {
          name: "Data and databases",
          body: "Where the data lives, who owns it and what it looks like once it is wrong. A data model that does not reflect the business gets worked around in the business — and then someone maintains a spreadsheet on the side again.",
          question: "Which record is the truth when two places contradict each other?",
        },
        hosting: {
          name: "Hosting and delivery",
          body: "Where it runs, how it gets there and what happens when a deployment goes wrong. Not a side issue: it decides speed, availability and whether a change takes minutes or days.",
          question: "Who has access to servers, domain and certificates today?",
        },
        billing: {
          name: "Billing and payments",
          body: "The part where mistakes turn into money. Amounts, tax rates, documents, deadlines — and the rules of the country the billing happens in. Nothing here is estimated and nothing is rounded.",
          question: "By which rules is it calculated, and who checks the result?",
        },
        documents: {
          name: "Documents and records",
          body: "Contracts, invoices, evidence, photographs from the job. They arise along the way and have to be findable again — otherwise the system becomes a filing cabinet nobody opens.",
          question: "What has to stay findable, for how long — and for whom?",
        },
        accounts: {
          name: "Access and permissions",
          body: "Who may see what, who may change what, and what happens when somebody leaves. The least conspicuous question in a project and the one that hurts most often in operation.",
          question: "Which roles really exist — not on the org chart, but in daily work?",
        },
        ai: {
          name: "AI services",
          body: "Worthwhile where something has to be read, sorted or prepared that a person does by hand today. Not worthwhile as a label on a system that would have worked anyway.",
          question: "Which step costs time today — and may a machine prepare it?",
        },
      },
      connectedLabel: "Connected",
      operationsEyebrow: "In practice",
      operationsLabel: "How we operate.",
      operationsNote: "Which of these can be booked as a service is set out on the managed operations page.",
      operations: {
        monitoring: {
          name: "Monitoring",
          body: "The systems report themselves when they are unreachable. For the enquiry path it goes further: a self-test checks whether an enquiry can still be delivered at all — a silent failure there looks from the outside like a weak market.",
        },
        logging: {
          name: "Logging",
          body: "Enough to find a fault. No more than can be justified: what somebody typed into a form appears in no log.",
        },
        backups: {
          name: "Backups",
          body: "Backed up and restored. A backup that has never been restored is not one — it is a file you hope about.",
        },
        security: {
          name: "Security",
          body: "Access, permissions, transport encryption and response headers at the level set when it was built — and measured again afterwards, not assumed.",
        },
        deployment: {
          name: "Deployment",
          body: "Every change takes the same route: build, check, deliver. If one of the checks breaks, nothing is delivered — not even when it is urgent.",
        },
      },
      proofEyebrow: "Evidence",
      proofLabel: "Verifiable on this page.",
      proofNote: "Showing beats claiming. Every point can be checked from outside in the response header, in the delivered source or in the repository — without asking us.",
      proofs: {
        headers: {
          name: "Security headers",
          body: "HSTS with subdomains and preload, X-Content-Type-Options, Referrer-Policy, X-Frame-Options set to DENY, Permissions-Policy and a Content-Security-Policy that already enforces object-src, base-uri, form-action and frame-ancestors.",
        },
        static: {
          name: "Delivered statically",
          body: "The pages are generated at build time and served from the CDN, not rendered on every request. That is why the site is fast — and why an application outage does not immediately take it down.",
        },
        bilingual: {
          name: "Two languages, two addresses",
          body: "German and Turkish have their own URLs, their own titles, their own structured data and are linked by hreflang — not a switch that swaps text in the browser.",
        },
        images: {
          name: "Images in AVIF and WebP",
          body: "The photographs are converted at build time and delivered at the size the layout actually needs. Anyone who cannot handle AVIF gets WebP — automatically, not by a branch in the code.",
        },
        gates: {
          name: "Three checks in the build",
          body: "The build stops if a function grows too large, if structured data would claim star ratings that do not exist, or if a service page says less in Turkish than in German. Not a statement of intent — a hard stop.",
        },
        selftest: {
          name: "Self-test of the enquiry path",
          body: "A dedicated route checks whether the keys, sender domain and abuse protection of the enquiry path still work, without sending an email. If a check fails, it answers with an error a monitor understands.",
        },
        accessibility: {
          name: "Our own accessibility audit, published",
          body: "We audited this site ourselves and published the defects we found, instead of issuing a statement without findings. Read it under Accessibility.",
        },
      },
    },
    betriebPage: {
      eyebrow: "Operate",
      title: "Handing over is easy. Operating is the work.",
      lead: "Most projects end at launch. After that begins the part nobody sells: updates, outages, security gaps and the small changes that suddenly nobody can make any more. We stay.",
      metaTitle: "Managed operations — hosting, monitoring, updates, backups",
      metaDescription:
        "creaDIG operates what creaDIG built: hosting, monitoring, updates, security, backups, support and further development. Cancellable monthly — the system and the data belong to you.",
      whyLabel: "Why operation instead of handover",
      why: [
        {
          name: "Whoever built it knows the places",
          body: "An outside maintainer reads unfamiliar code at every fault. We read our own — which is why the answer to “can that be done quickly?” is usually yes here.",
        },
        {
          name: "A system ages even when nobody touches it",
          body: "Dependencies get security gaps, certificates expire, browsers change their rules. None of it announces itself, and none of it waits for the next project budget.",
        },
        {
          name: "The outage does not come during office hours",
          body: "It comes at night, at the weekend, on holiday. The question is not whether somebody notices it, but who notices first: the monitoring or your customer.",
        },
        {
          name: "What turns out to be wrong in operation gets changed",
          body: "No build survives its first real month unchanged. In a project with a sign-off date something like that gets documented and left standing. In operation it gets changed.",
        },
      ],
      ownershipLabel: "Dependency",
      ownershipTitle: "Operation does not mean dependency.",
      ownershipBody: "The system and all the data in it belong to you from day one. Support can be cancelled monthly, with no minimum term. Afterwards everything stays with you — code, content, access and domain. What ends is the support, not your access.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Twenty minutes, no obligation.",
      lead: "German, Turkish and English. Choose whichever route suits you fastest.",
      directTitle: "Three routes. Every one ends with a person.",
      directLead: "A first conversation runs through the appointment request — four steps that set out what it is about. Anyone with just a question writes directly: by WhatsApp or email, in German, Turkish or English.",
      mailTitle: "Email",
      mailNote: "For documents, proposals and anything in writing.",
      nameLabel: "Name",
      namePlaceholder: "your name",
      businessLabel: "Business",
      businessPlaceholder: "company or sector",
      messageLabel: "What is it about?",
      messagePlaceholder: "Briefly, in your own words — one or two sentences are enough.",
      errRequired: "Please add your name and a few words about your enquiry.",
      submit: "Send enquiry",
      submitWhatsapp: "Rather by WhatsApp",
      whatsappTitle: "WhatsApp",
      whatsappNote: "Fastest reply, DE, TR & EN.",
      whatsappIntro: "Hello creaDIG, I am interested in a project.",
      whatsappAction: "Write on WhatsApp",
      appointmentTitle: "Free first consultation",
      appointmentNote: "Twenty minutes, by video. Free and without obligation.",
      appointmentValue:
        "We look at your business and tell you what we would build — and what we would not. Including when the answer is “not yet”.",
      appointmentCta: "Request an appointment",
      locationsLabel: "Location",
      marketsLabel: "Markets",
      privacyConsentPrefix: "I have read the",
      privacyConsentLink: "privacy policy",
      privacyConsentSuffix:
        "and agree that my details may be processed to handle my enquiry and delivered for that purpose via our sending provider Resend Inc. (USA) — safeguarded by EU standard contractual clauses and, in addition, with my explicit consent to the transfer to the USA (Art. 49(1)(a) GDPR). I can withdraw this at any time with effect for the future.",
      emailLabel: "Email",
      emailPlaceholder: "so we can reply",
      phoneLabel: "Phone",
      phonePlaceholder: "for the call back",
      errEmail: "Please check the email address.",
      errPhone: "Please give us a phone number — we would rather call than write.",
      errPrivacy: "Please confirm the privacy policy.",
      sending: "Sending …",
      sentTitle: "Your enquiry has arrived.",
      sentBody:
        "We will be in touch within two working days. A confirmation is in your inbox — check the spam folder to be safe.",
      errSendFailed:
        "The enquiry could not be delivered just now. Please try again — or take one of the routes on the right.",
      errNotConfigured:
        "The sending path is not set up yet. Please use WhatsApp in the meantime, or write to",
      errRateLimited:
        "Several enquiries just came from this connection. Please try again in a few minutes — or use WhatsApp.",
      errFormExpired:
        "The form was open for too long. Please reload the page and send again.",
      handoffNote:
        "On sending, WhatsApp or your email program opens with the finished message — it is only sent once you confirm it there.",
      handoffTitle: "Almost there — one step is missing.",
      handoffWhatsapp:
        "WhatsApp is open with your finished message. It only reaches us once you tap send there.",
      handoffMail:
        "Your email program is open with the finished message. It only reaches us once you click send there.",
      handoffRetry: "Nothing happened? Open it again here.",
      errBlocked:
        "Your browser blocked the window. Please open WhatsApp through the link below — or write directly to",
    },
    closing: {
      eyebrow: "Next step",
      title: "You run the business. We build the system behind it.",
      lead: "Twenty minutes, free and without obligation. We look at the operation and tell you honestly whether we can help.",
      ctaPrimary: "Start a project",
      ctaSecondary: "See our work",
      variants: {
        prices: {
          eyebrow: "Next step",
          title: "A fixed price for your scope — after twenty minutes.",
          lead: "What is above is the entry point. What your business needs, we look at before anyone names a figure — free and without obligation.",
          ctaPrimary: "Request a fixed-price quote",
          ctaSecondary: "See our work",
        },
        work: {
          eyebrow: "Next step",
          title: "A similar plan? Let us talk.",
          lead: "Twenty minutes, free and without obligation. We will tell you honestly whether your plan fits what you have seen here.",
          ctaPrimary: "Discuss your plan",
          ctaSecondary: "See the services",
        },
      },
    },
    termin: {
      metaTitle: "Send an appointment request",
      metaDescription:
        "Four steps to a conversation: choose the type, give your preferred times, add your details. The request comes straight to us — the appointment becomes binding with our reply.",
      back: "Back to the site",
      eyebrow: "Free first consultation",
      title: "Four steps to a conversation.",
      lead: "Tell us when it suits you. We check the request and confirm the appointment bindingly in our reply — this assistant does not book anything automatically.",
      stepOf: "Step",
      next: "Next",
      prev: "Back",
      stepAnnounce: (step: number, title: string) => `Step ${step} of 4: ${title}`,
      step1: {
        title: "What is it about?",
        lead: "Choose the type of conversation.",
        vgName: "Free first consultation",
        vgDesc: "Twenty minutes, no obligation. We listen and tell you honestly whether we can help.",
        vgMeta: "free · 20 min",
        arName: "Systems conversation",
        arDesc: "A deeper look at operations, automation and meAI — for businesses with a concrete plan.",
        arMeta: "in depth · 45 min",
      },
      step2: {
        title: "When suits you?",
        lead: "Choose one or more days. Highlighted days are our preferred days for conversations — other days are possible on request.",
        timeTitle: "Time windows",
        timeLead: "You can pick more than one. All times CET.",
        windows: [
          { id: "vormittag", label: "Morning", time: "09:00–12:00" },
          { id: "nachmittag", label: "Afternoon", time: "13:00–17:00" },
          { id: "abend", label: "Early evening", time: "17:00–19:00" },
        ],
        preferred: "preferred",
        today: "today",
        maxDates: "Up to three days can be selected.",
        prevMonth: "Previous month",
        nextMonth: "Next month",
        daySelected: "selected",
        dayPreferred: "preferred day for conversations",
        daysLong: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        notBooked:
          "This is not a booking yet. We check your request and confirm the appointment bindingly in our reply.",
        errDate: "Please choose at least one day.",
        errTime: "Please choose at least one time window.",
      },
      step3: {
        title: "Your details",
        lead: "Required fields are marked with *.",
        name: "Name",
        phone: "Phone",
        email: "Email",
        org: "Company",
        city: "City / region",
        interest: "Interest",
        size: "Company size",
        note: "Message",
        notePlaceholder: "Briefly, in your own words — one or two sentences are enough.",
        langLabel: "Language of the conversation",
        langDe: "German",
        langTr: "Turkish",
        langBoth: "German + Turkish",
        choose: "Please choose",
        errRequired: "Please complete the required fields correctly.",
        errEmail: "Please give a valid email address.",
        interests: ["Website package for trades", "Ongoing support — €149 / month", "Something else — brand, software or automation", "Not sure yet"],
        sizes: ["1–4 staff", "5–15 staff", "16–30 staff", "more than 30 staff"],
      },
      step4: {
        sendWhatsapp: "Rather by WhatsApp",
        privacyNote:
          "Your details go to creaDIG and are used solely to handle this appointment request.",
        title: "Check and send",
        lead: "One click and your appointment request is in our inbox. You will receive an acknowledgement by email straight away; the appointment itself we confirm bindingly in our reply. If you prefer WhatsApp, that works too.",
        send: "Send appointment request",
        typeLabel: "Type of conversation",
        dateLabel: "Preferred days",
        timeLabel: "Time windows",
        langLabel: "Language",
      },
      done: {
        title: "Appointment request received.",
        lead: "Your appointment request is in our inbox and an acknowledgement is on its way by email. The appointment is not booked yet — we compare your preferred times and confirm a binding date.",
        reply: "We will be in touch within two working days",
        home: "Back to the home page",
        again: "Send another appointment request",
      },
      waTitle: "creaDIG — appointment request",
      waType: "Type",
      waDate: "Preferred days",
      waTime: "Time windows",
      waName: "Name",
      waOrg: "Company",
      waCity: "City",
      waPhone: "Phone",
      waInterest: "Interest",
      waSize: "Size",
      waLang: "Language",
      waNote: "Message",
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    errorPages: {
      notFound: {
        metaTitle: "Page not found",
        metaDescription:
          "This address does not exist. Here are the ways back to creaDIG — and the direct ways to reach us.",
        eyebrow: "Error 404",
        title: "This page does not exist.",
        lead: "Either the address has changed or a typo slipped in. Both are quickly fixed.",
      },
      serverError: {
        eyebrow: "Error 500",
        title: "Something went wrong here.",
        lead: "The fault is ours, not yours. Try again — and if it persists, you can reach us directly.",
        retry: "Try again",
      },
      waysLabel: "Three ways back",
      ways: {
        home: { label: "Home", note: "The overview of the whole house." },
        services: { label: "Services", note: "Five levels — from the brand to artificial intelligence." },
        contact: { label: "Contact", note: "Form, WhatsApp and the way to a conversation." },
      },
      directLabel: "Or directly",
      directNote: "These two routes always work — even when the form will not.",
      whatsapp: "Write on WhatsApp",
      mail: "Write an email",
    },
    accessibility: {
      metaTitle: "Accessibility statement",
      metaDescription:
        "The accessibility status of creadig.de: what we audited, what we found and fixed, what remains open — and how to report a barrier to us.",
      eyebrow: "Accessibility statement",
      title: "What this site can do — and what it cannot.",
      lead: "We sell accessibility. So we start with ourselves: this site is audited against WCAG 2.1 level AA, the defects we found are fixed, and what remains open is set out below. This statement is voluntary.",
      voluntaryTitle: "Voluntary, not compliance paperwork",
      voluntaryBody:
        "Whether this website falls under the German Accessibility Strengthening Act has not been assessed legally — so we do not claim that it does. We publish this status because an agency that offers accessibility should open up its own site. This is not a legal assessment.",
      statusTitle: "Implementation status",
      statusBody:
        "After the audit run of 23 August 2026, all eight defects found are fixed. The automated run across 68 passes (17 pages, two window sizes, light and dark appearance) reports no machine-detectable violation of WCAG 2.1 AA. The manual review — keyboard pass, accessible names, focus, structure — is likewise without an open item.",
      statusNote:
        "“No machine-detectable violation” does not mean “accessible”. Automated tools find only some barriers; that is why what we did not audit is set out below.",
      checkedTitle: "What was audited",
      checkedIntro:
        "Twelve points against WCAG 2.1 AA, in both language versions, light and dark, at 1440 × 900 and 390 × 844 pixels:",
      checked: [
        "Contrast of text and of controls, in both appearances",
        "Alternative text for informative images; decorative graphics muted",
        "Labelling of all form fields, including select fields and consent checkboxes",
        "Error and status messages: associated, announced, not signalled by colour alone",
        "Full operability without a mouse, with no keyboard trap",
        "A visible focus on every control",
        "Skip link, heading structure, landmarks",
        "Language marking per language version",
        "Behaviour with “reduce motion”, at 200% zoom and 320 pixels wide",
      ],
      pagesLabel: "Pages audited",
      pagesBody:
        "Home, services and one service detail page, products and one product detail page, work, company, contact, the appointment assistant (step 1 and step 3), privacy, imprint and the error page — each in German and Turkish.",
      fixedTitle: "What was found and fixed",
      fixedIntro:
        "Eight defects, none of them blocking, seven classified as serious. All fixed in the code — no overlay, no add-on tool:",
      fixed: [
        "Text colours with insufficient contrast (down to 2.4 : 1 on placeholders)",
        "No visible focus on three controls in the header",
        "No skip link to the content",
        "Calendar days in the appointment assistant without a meaningful name",
        "Two German labels in the Turkish version",
        "The step change in the appointment assistant was not announced",
      ],
      fixedEarlier:
        "Before that, in a separate pass: with the system setting “reduce motion”, sections that fade in stayed invisible — 33 blocks on one page. The most serious defect on this site, and it hit exactly the people the setting is made for.",
      openTitle: "Known limitations",
      openIntro: "What we did not audit, and what that means:",
      open: [
        "No pass with a blind user. We checked the technical prerequisites (name, role, state, announcements) — not how understandable the result is in daily use.",
        "No testing with magnification software and no testing of voice control.",
        "The statement rests on an audit run on one date. Every change to the site can break something; that is why the automated part runs with every change.",
        "External routes — WhatsApp and the email program — lie outside our site. We cannot vouch for their accessibility. That is why there is also a route on our own site for each of them.",
      ],
      feedbackTitle: "Report a barrier",
      feedbackBody:
        "If something on this site blocks your way, write to us — informally, even just one sentence. We reply within two working days and tell you whether and when we will fix it.",
      feedbackMail: "Write an email",
      feedbackForm: "Report via the form",
      feedbackNote:
        "Helpful but not necessary: which page, which element, which assistive technology you use.",
      methodTitle: "How it was audited",
      methodBody:
        "Against a fixed twelve-point framework, so that two people arrive independently at the same result. Automated with axe-core, by hand with the keyboard and a check of accessible names. The framework and the full findings are open in the source of this site.",
      updatedLabel: "As of",
      updated: "23 August 2026",
    },
    legal: {
      imprintTitle: "Imprint",
      privacyTitle: "Privacy",
      imprintMetaDescription: "Provider identification and contact details for creaDIG.",
      privacyMetaDescription:
        "No cross-site tracking, no advertising cookies, no profiling. What creaDIG processes, who does it on our behalf and how long it stays.",
      back: "Back to the site",
      providerLabel: "Provider (§ 5 DDG)",
      addressLabel: "Address",
      sameAddress: "Address as above",
      formalLabel: "Legal details",
      legalFormLabel: "Legal form",
      vatLabel: "VAT",
      smallBusinessNote:
        "Small business under § 19 UStG — no VAT is charged.",
      mstvLabel: "Responsible under § 18(2) MStV",
      placeholderMark: "Placeholder — will be replaced before launch",
      taxStatusPending: "VAT status not yet released.",
      phoneLabel: "Phone",
      phonePending: "A German phone number follows.",
      pending: "Still to be confirmed",
      pendingNote: "Two details are still outstanding and are marked as placeholders above: the VAT status (identification number under § 27a UStG or a reference to the small business rule under § 19 UStG) and the German phone number. We will add both as soon as the owner has released them. Provider, address, legal form, the person responsible under § 18(2) MStV and the contact routes above already apply bindingly.",
      responsible: "Responsible for the content",
      contactLabel: "Contact",
      privacyIntro: "This site is deliberately built lean: no cross-site tracking, no advertising cookies, no profiling. What we do use is named below — and the analytics only load once you have allowed them.",
      processorsLabel: "Who processes on our behalf",
      processorsIntro:
        "These service providers process personal data for us — on our instructions, under a data processing agreement (Art. 28 GDPR) and, because they are based in the USA, safeguarded by the EU standard contractual clauses under Art. 46(2)(c) GDPR. We pass on nothing further.",
      processorPurposeLabel: "Purpose",
      processorServicesLabel: "Services",
      processorCountryLabel: "Location",
      processorSafeguardLabel: "Basis",
      processorSafeguardScc: "Processing under Art. 28 GDPR + EU standard contractual clauses",
      processorDpaLink: "View the agreement",
      processorPendingMark: "Confirmation by the owner outstanding",
      processorPendingNote:
        "The agreements marked have not yet been confirmed and filed by the owner in the respective dashboard. We therefore do not write that they exist — we will make that good before launch.",
      processorPurposes: {
        vercel:
          "Hosting, delivery of the site through the content delivery network, and server logs. After your consent, additionally two separate measurements: Vercel Web Analytics (how often which page is opened) and Vercel Speed Insights (how fast the page loads on real visits). Both are cookie-free but process IP address and page path — without consent no script is loaded.",
        resend:
          "Delivery of the emails from our forms to our inbox and of the acknowledgement to you.",
      },
      privacyPoints: [
        {
          title: "Server logs",
          body: "When the site is opened, our host Vercel Inc. (USA) processes technically necessary data such as IP address, time and requested resource. The legal basis is Art. 6(1)(f) GDPR — without this processing the site can neither be delivered nor protected against abuse. A data processing agreement under Art. 28 GDPR is in place with Vercel.",
        },
        {
          title: "Hosting and transfer to third countries",
          body: "This site is fully static and is delivered through Vercel's worldwide content delivery network — from the nearest location in each case. Processing of access data outside the EU, in particular in the USA, can therefore not be ruled out. It is safeguarded by the data processing agreement with Vercel Inc. including the EU standard contractual clauses under Art. 46(2)(c) GDPR. We embed no map or advertising services and deliver all fonts locally. For analytics we use Vercel Web Analytics and Vercel Speed Insights — cookie-free, without a cross-device identifier and only after your explicit consent; without it no script is loaded. If you use the WhatsApp route, the terms of Meta Platforms Ireland Ltd. additionally apply.",
        },
        {
          title: "Contact form, appointments and product enquiries",
          body: "When you submit one of our forms, we transmit your details — name, business, email, phone and your message — to our inbox info@creadig.de and send you a confirmation. For delivery we use Resend (Resend Inc., USA) as a processor under Art. 28 GDPR, safeguarded by the EU standard contractual clauses under Art. 46(2)(c) GDPR. The legal basis is your consent under Art. 6(1)(a) GDPR, which you give explicitly before sending and can withdraw at any time with effect for the future. We do not keep a database: your enquiry sits solely in our email inbox. If you take the WhatsApp route instead, the terms of Meta Platforms Ireland Ltd. apply.",
          bodyStored:
            "When you submit one of our forms, we transmit your details — name, business, email, phone and your message — to our inbox info@creadig.de and send you a confirmation. For delivery we use Resend (Resend Inc., USA) as a processor under Art. 28 GDPR, safeguarded by the EU standard contractual clauses under Art. 46(2)(c) GDPR. The legal basis is your consent under Art. 6(1)(a) GDPR, which you give explicitly before sending and can withdraw at any time with effect for the future. We additionally store your enquiry in a database so that we can handle it reliably and trace its progress. That database is operated by Neon, LLC as a processor under Art. 28 GDPR; the data is held in the Frankfurt region (aws-eu-central-1). If no contract comes about, we delete your enquiry 12 months after the last contact. If you take the WhatsApp route instead, the terms of Meta Platforms Ireland Ltd. apply.",
        },
        {
          title: "How long we keep things",
          body: "We delete server logs after 30 days. Enquiries through our forms we keep for up to 6 months after the last contact and then delete them; if a contract comes about, the commercial and tax retention periods of 6 and 10 years respectively apply (§ 257 HGB, § 147 AO). Your consent decision stays in your browser's local storage until you change it or clear your browser data.",
        },
        {
          title: "Fonts",
          body: "Poppins and JetBrains Mono are delivered locally together with the site. There is no connection to Google Fonts; your IP address is not transmitted to any third party for this.",
        },
        {
          title: "Consent and local storage",
          body: "We store your decision from the consent banner in your browser's local storage (key “creadig_consent”). Only with your consent do we additionally remember the appearance (light/dark); without consent that setting applies only for the current session. We do not store the language at all — it is in the page address. No data is transmitted to third parties in the process. You can adjust or withdraw your choice at any time under “Cookie settings” — on withdrawal we remove the affected entries immediately.",
        },
        {
          title: "Your rights",
          body: "You have the right at any time to access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20) and objection (Art. 21). A message to the address below is enough. Independently of this, you have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR) — for our location that is the State Commissioner for Data Protection of Lower Saxony.",
        },
      ],
      privacyNote: "This version will undergo a final legal review together with the complete company details.",
    },
    consent: {
      title: "Your consent",
      intro:
        "This site stores only what it needs to function — and what you allow. For anything that is not technically necessary we need your consent.",
      minors:
        "If you are under 16, please obtain the agreement of your parent or guardian before allowing non-essential functions.",
      privacyPrefix: "Details are in our",
      privacyLink: "privacy policy",
      revoke:
        "You can adjust or withdraw your choice at any time via “Cookie settings” in the footer.",
      acceptAll: "Accept all",
      essentialOnly: "Accept essential only",
      customize: "Individual privacy preferences",
      save: "Save selection",
      alwaysActive: "Always active",
      thirdCountry:
        "Analytics run through Vercel Inc. in the USA. If you allow them, you also explicitly consent to the transfer of your access data there (Art. 49(1)(a) GDPR) — in addition to the EU standard contractual clauses we have concluded with Vercel. The USA does not have a level of data protection equivalent to the European one: authorities can demand access, and effective legal remedies against this may not exist. Without your consent no transfer takes place.",
      settingsLabel: "Cookie settings",
      settingsTitle: "Privacy preferences",
      close: "Close",
      categories: {
        essential: {
          name: "Essential",
          body: "Stores only your decision from this banner, so that we do not have to ask again on every visit. Without this storage the consent itself does not work.",
        },
        functional: {
          name: "Convenience",
          body: "Remembers the appearance (light/dark). Without consent your choice applies only for the current session. The language is not stored — it is in the address (creadig.de for German, creadig.de/tr for Turkish, creadig.de/en for English).",
        },
        statistics: {
          name: "Analytics",
          body: "Vercel Web Analytics and Vercel Speed Insights — measures anonymously how often which page is opened, whether an enquiry came about and how fast the page loaded for you. No cookies are set and no cross-device identifier is created. Without your consent no script is loaded.",
        },
      },
    },
    footer: {
      tagline: "Systems house for identity, digital, operations, automation and intelligence.",
      productsLabel: "Products",
      navLabel: "Site",
      layersLabel: "Five levels",
      legalLabel: "Legal",
      imprint: "Imprint",
      privacy: "Privacy",
      socialLabel: "Social",
      statusLabel: "Material status",
      rights: "All rights reserved.",
    },
  },
  /*
   * GATE 3 — die arabische Fassung.
   *
   * ---------------------------------------------------------------------------
   * QUELLE
   * Der aktuelle deutsche System-Haus-Canon. Die alte Website hatte Arabisch;
   * es beschreibt eine Digitalagentur mit anderen Paketen. Als Terminologie-
   * Referenz brauchbar, als Positionierung nicht — und so ist es benutzt.
   *
   * ---------------------------------------------------------------------------
   * WAS HIER BEWUSST LATEINISCH BLEIBT
   * Eigennamen: creaDIG, meAI, fibero, CASSAMEA, meahv, Resend, Vercel,
   * Google, WCAG, HSTS. Ein transkribierter Produktname ist im Arabischen
   * nicht wiederzufinden — weder in der Suche noch auf der Rechnung.
   *
   * Zahlen stehen in westlichen Ziffern (2017, 149 EUR). Der Markt ist
   * Europa; die Rechnung, die danach kommt, traegt dieselben Ziffern.
   *
   * ---------------------------------------------------------------------------
   * UEBERSETZT IST NICHT RTL
   * Dieser Block ist der INHALT. Die Leserichtung ist Sache des Layouts
   * (`app/(ar)/layout.tsx`, `dir="rtl"`) und der logischen CSS-Eigenschaften.
   * Beides ist getrennt zu pruefen — ein arabischer Text in einem
   * linkslaufenden Raster ist keine arabische Seite.
   */
  ar: {
    meta: {
      siteTitle: "creaDIG — بيت أنظمة للعلامة والويب والذكاء الاصطناعي",
      siteDescription:
        "creaDIG هي المظلة فوق أنظمتنا الخاصة — من العلامة إلى الذكاء الاصطناعي. نبنيها بأنفسنا. ونشغّلها بأنفسنا. بيت أنظمة لألمانيا والنمسا وسويسرا.",
      ogTitle: "creaDIG — نبني ما لا يراه الآخرون.",
      ogDescription:
        "بيت أنظمة منذ 2017. منتجات خاصة بنا، عملاء حقيقيون، وأنظمة ذكاء اصطناعي نبنيها ونشغّلها. ألمانيا والنمسا وسويسرا.",
      organizationDescription:
        "بيت أنظمة للعلامة والويب والتشغيل والأتمتة والذكاء الاصطناعي. منتجاتنا الخاصة: meAI وfibero وCASSAMEA وmeahv.",
      breadcrumbHome: "الصفحة الرئيسية",
      ogImageAlt: "creaDIG — بيت أنظمة للعلامة والويب والذكاء الاصطناعي",
    },
    brand: {
      categoryLabel: "التصنيف",
      category: "لسنا بيت تقنية معلومات تقليديًا. نحن بيت أنظمة للمنشآت الرقمية.",
    },
    home: {
      statement: {
        eyebrow: "creaDIG في جملة واحدة",
        title: "نبتكر الأنظمة، ونبنيها بأنفسنا، ونُبقيها في التشغيل.",
        body: "من العلامة مرورًا بالحضور الرقمي والتشغيل اليومي وصولًا إلى الأتمتة والذكاء الاصطناعي. خمس طبقات يقوم بعضها على بعض — وأربعة منتجات خاصة بنا اختبرناها على أنفسنا.",
        cta: "عن الشركة",
      },
      work: {
        eyebrow: "أعمال مختارة",
        title: "نُري أولًا. ثم نتحدث.",
        cta: "كل الأعمال",
        ctaEnd: "عرض كل الأعمال",
      },
      capabilities: {
        eyebrow: "الخدمات",
        title: "من العلامة إلى الذكاء.",
        lead: "كل طبقة تحمل التي تليها. يمكنكم البدء عند أيٍّ منها — والتوقف عند أيٍّ منها.",
        cta: "كل الخدمات",
      },
      entry: {
        eyebrow: "نقطة البداية",
        priceLead: "باقة الموقع تبدأ من",
        priceNote: "دون ضريبة القيمة المضافة. سعر ثابت للنطاق المتفق عليه.",
        priceCta: "الباقات والأسعار",
        questionsLabel: "سؤالان قبل البداية",
        questionsCta: "كل الأسئلة",
      },
      products: {
        cta: "كل المنتجات",
      },
      company: {
        eyebrow: "الشركة",
        title: "بيتٌ ينمو.",
        body: "تأسست في 2017 بقيادة محمد أمين أكيول — مع فريق أساسي صغير وشبكة متخصصة في ألمانيا والنمسا وسويسرا.",
        cta: "المزيد عنا",
      },
      insights: {
        eyebrow: "ملاحظات",
        title: "ملاحظات من ورشة البناء.",
        cta: "كل الملاحظات",
      },
    },
    insightsPage: {
      eyebrow: "ملاحظات",
      title: "ملاحظات من ورشة البناء.",
      lead: "ليست مدونة. ملاحظات من التشغيل: لماذا اتُّخذ قرارٌ على هذا النحو دون غيره، وما الذي علّمنا إياه نظامٌ في الاستعمال اليومي، وأي افتراض تبيّن خطؤه.",
      metaTitle: "ملاحظات — مذكرات أنظمة من creaDIG",
      metaDescription:
        "ملاحظات من بناء أنظمتنا الخاصة: القرارات، وخبرة التشغيل، وما تبيّن أنه كان خطأً.",
      emptyTitle: "لم يُنشر شيء بعد.",
      emptyBody:
        "الملاحظة الأولى لم تُكتب بعد. لا نكتب هنا إلا بعد أن يعمل النظام مدةً تكفي لاستخلاص درسٍ منه — وحتى ذلك الحين تبقى الصفحة فارغة بدل أن تمتلئ بنصوص تجريبية.",
      emptyCtaProducts: "ما الذي بنيناه",
      emptyCtaWorks: "إلى معرض الأعمال",
      readLabel: "قراءة",
      categoriesLabel: "عمّ نكتب",
      categories: {
        systems: "الأنظمة",
        automation: "الأتمتة",
        ai: "الذكاء الاصطناعي",
        products: "المنتجات",
        betrieb: "التشغيل",
        praxis: "الممارسة",
      },
      publishedLabel: "نُشر في",
      sourcesLabel: "للمراجعة",
      sourceStatement: "بيان إتاحة الوصول لهذا الموقع",
      sourceService: "إتاحة الوصول كخدمة",
      backCta: "كل الملاحظات",
    },
    kontaktPage: {
      eyebrow: "التواصل",
      title: "اختاروا الطريق الذي يناسبكم.",
      lead: "ليس كل استفسار يبدأ بموعد. بعضها يبدأ بنظرة على ما بنيناه — وهذا أيضًا طريق إلينا. استشارة بالألمانية والتركية والإنجليزية.",
      metaTitle: "التواصل — creaDIG أوسنابروك",
      metaDescription:
        "التواصل مع creaDIG: عبر واتساب أو البريد الإلكتروني أو استشارة أولى مجانية أو مباشرةً من خلال أعمالنا. مركز ICO للابتكار في أوسنابروك، استشارة بالألمانية والتركية والإنجليزية.",
      intentsLabel: "من أين تودّون البدء؟",
      intents: {
        talk: {
          name: "مناقشة مشروع",
          what: "اكتبوا بكلماتكم عمّا يدور الأمر — عبر واتساب أو البريد الإلكتروني، دون نموذج.",
          cta: "إلى الطرق المباشرة",
        },
        appointment: {
          name: "حجز موعد",
          what: "عشرون دقيقة حديث أول، مجانًا ودون التزام. أربع خطوات ويصلنا طلبكم.",
          cta: "طلب موعد",
        },
        products: {
          name: "استعراض المنتجات",
          what: "أربعة أنظمة خاصة بنا بنيناها ونشغّلها بأنفسنا. أسرع طريق لتكوين حكم علينا.",
          cta: "إلى المنتجات",
        },
        works: {
          name: "استعراض الأعمال",
          what: "منتجاتنا الخاصة وأعمال العملاء، مفصولة بوضوح. الوصف التفصيلي للحالات يتبع مع الموافقات.",
          cta: "إلى معرض الأعمال",
        },
      },
      mailLabel: "البريد الإلكتروني",
      mailNote: "للمستندات والعروض وكل ما هو مكتوب.",
    },
    unternehmenPage: {
      eyebrow: "الشركة",
      title: "البيت الذي خلف الأنظمة.",
      lead: "creaDIG ليست وكالة تسلّم مشروعًا ثم تختفي. نحن بيتٌ يبتكر منتجاته الخاصة، ويبنيها بنفسه، ويُبقيها في التشغيل — من العلامة مرورًا بالبرمجيات وصولًا إلى الذكاء الاصطناعي.",
      statement: "ما نطوّره للعملاء نشغّله لأنفسنا. هذا الرصيد هو ما يفصل بيت الأنظمة عن العرض التقديمي.",
      metaTitle: "الشركة — بيت أنظمة من أوسنابروك، منذ 2017",
      metaDescription:
        "creaDIG: بيت أنظمة في مركز ICO للابتكار بأوسنابروك، تأسس في 2017. المؤسس، وطريقة العمل، ومجالات التركيز، والمقر — مظلة واحدة، خمس طبقات، أربعة منتجات خاصة.",
      chapters: {
        label: "الطريق",
        title: "البيت لا يُبنى بإعلان.",
        items: [
          {
            year: "2017",
            title: "البداية",
            body: "تأسست في أوسنابروك — كوكالة. علامة، حضور، مشاريع مفردة. كل ما جاء بعد ذلك نشأ من هذا، لا بجانبه.",
          },
          {
            year: null,
            title: "من المشاريع إلى المنتجات",
            body: "ما تكرّر في المشاريع بنيناه مرةً واحدة بدل حلّه في كل مرة من جديد. أربعة أنظمة خاصة بنا: meAI وfibero وCASSAMEA وmeahv — ابتكرناها وبنيناها ونشغّلها.",
          },
          {
            year: "اليوم",
            title: "البيت",
            body: "المقر في مركز ICO للابتكار بأوسنابروك. منتجاتنا الخاصة قيد التشغيل، وأعمال العملاء في ألمانيا وسويسرا — واليد التي تبني هي نفسها التي تردّ على الهاتف بعد ذلك.",
          },
        ],
      },
    },
    arbeitenPage: {
      eyebrow: "الأعمال",
      title: "مبنيّة. ومشغَّلة.",
      lead: "أربعة منتجات خاصة بنا ابتكرناها وبنيناها بأنفسنا — إلى جانب أعمال لعملاء في ألمانيا وسويسرا. مفصولة بوضوح ليتبيّن ما هو ملكنا.",
      metaTitle: "الأعمال — منتجاتنا الخاصة وأعمال العملاء",
      metaDescription:
        "معرض أعمال creaDIG: أربعة منتجات خاصة وأعمال لعملاء في ألمانيا وسويسرا. مفصولة بوضوح — الأنظمة الخاصة والأعمال المكلَّف بها ليستا الشيء نفسه.",
    },
    arbeitPage: {
      breadcrumb: "الأعمال",
      kindLabel: "النوع",
      sectorLabel: "القطاع",
      regionLabel: "المنطقة",
      statusLabel: "الحالة",
      builtLabel: "ما الذي بنيناه",
      whatLabel: "عمّ يدور الأمر",
      backLabel: "كل الأعمال",
      caseGatedNote:
        "لا ننشر وصفًا تفصيليًا للحالة يشمل نقطة البداية والحل والنتيجة إلا بموافقة خطية من العميل. متى وُجدت، ظهرت هنا.",
      ctaTitle: "وضعٌ مشابه في منشأتكم؟",
      ctaBody: "عشرون دقيقة، مجانًا ودون التزام. ننظر في المنشأة ونقول بصراحة إن كنا نستطيع المساعدة.",
      ctaPrimary: "بدء مشروع",
      ctaSecondary: "كل الأعمال",
    },
    produktePage: {
      eyebrow: "دليل، لا كتالوج",
      title: "أربعة منتجات نشغّلها بأنفسنا.",
      lead: "هذه الصفحة لا تبيع أيًّا منها. هي هنا لأنها تُثبت ما نقوله عن أنفسنا: كل واحد من هذه الأنظمة بنته creaDIG من الأساس — وتستعمله في عملها اليومي. أما ما نبنيه لكم فتجدونه تحت الخدمات.",
      metaTitle: "منتجاتنا الخاصة — meAI وfibero وCASSAMEA وmeahv",
      metaDescription:
        "منتجات creaDIG الأربعة: meAI (نظام تشغيل أعمال بالذكاء الاصطناعي)، وfibero (تشغيل شبكات الألياف)، وCASSAMEA (نقاط بيع للضيافة، سويسرا)، وmeahv (إدارة العقارات).",
      builtLabel: "ما الذي بنيناه",
      sectorLabel: "القطاع",
      statusLabel: "الحالة",
      regionLabel: "السوق",
      openLabel: "عرض المنتج",
      liveLabel: "فتح النسخة الحية",
      clientWorkTitle: "ما بنيناه للآخرين.",
      clientWorkNote: "ليس منتجًا لنا صراحةً — أعمال لعملاء.",
      clientWorkCta: "إلى معرض الأعمال",
    },
    produktPage: {
      interest: {
        eyebrow: "تسجيل اهتمام",
        title: "هل نُعلمكم؟",
        body: "إن كان {product} يهمّ منشأتكم: اتركوا عنوانًا ونتواصل معكم حالما يصبح جاهزًا. لا نشرة بريدية ولا إعلانات — رسالة واحدة عن هذا المنتج.",
        emailLabel: "البريد الإلكتروني",
        emailPlaceholder: "لنتمكن من الوصول إليكم",
        nameLabel: "الاسم (اختياري)",
        namePlaceholder: "كيف نخاطبكم؟",
        submit: "أعلِمونا",
        sentTitle: "سُجّل.",
        sentBody: "سنتواصل معكم حالما يكون هناك ما يُقال عن هذا المنتج. تأكيدٌ في بريدكم.",
        phoneOmitted: "غير مذكور (استفسار عن منتج)",
        messageTemplate: "اهتمام بالمنتج {product} — يُرجى إعلامي حالما يصبح متاحًا.",
      },
      breadcrumb: "المنتجات",
      problemLabel: "لِمَ بُني",
      thesisLabel: "الفرضية",
      functionsLabel: "ما الذي يفعله",
      architectureLabel: "النظام والبنية",
      operationsLabel: "كيف يُشغَّل",
      learningsLabel: "ما علّمنا إياه التشغيل",
      statusBadge: {
        live: "حيّ",
        beta: "نسخة تجريبية خاصة",
        aufbau: "قيد البناء",
        intern: "في تشغيلنا الخاص",
      },
      maturityBadge: {
        live: "حيّ",
        pilot: "تشغيل تجريبي",
        "private-beta": "نسخة تجريبية خاصة",
        "in-development": "قيد التطوير",
      },
      builtLabel: "ما الذي بنيناه",
      blocksLabel: "اللبنات",
      blocksTitle: "مبنيّ بأيدينا، لبنةً لبنة.",
      sectorLabel: "القطاع",
      statusLabel: "الحالة",
      regionLabel: "السوق",
      liveLabel: "فتح النسخة الحية",
      backLabel: "كل المنتجات",
      systemLabel: "موقعه في النظام",
      systemBody:
        "كل منتج من منتجاتنا يجلس على إحدى الطبقات الخمس — والطبقة نفسها نقدّمها كخدمة. ما بنيناه هنا نبنيه لمنشأتكم أيضًا.",
      layerLabel: "الطبقة",
      servicesLabel: "الخدمات المناسبة",
      layerCta: "عرض الطبقة",
      houseContextLabel: "تحت المظلة نفسها",
      houseContextNote:
        "نحن لا نبني لهذا المجال فحسب — نحن نعمل فيه بأنفسنا. لهذا نعرف الأسئلة قبل أن تُطرح.",
      storyLabel: "لماذا بنيناه",
      nextLabel: "المنتج التالي",
      prevLabel: "المنتج السابق",
      screensPending:
        "لا نعرض الواجهات إلا حين نستطيع تصوير التطبيق الحقيقي ببيانات تجريبية. حتى ذلك الحين يُكتب هنا ما هو مبنيّ — لا صورة تدّعي شيئًا آخر.",
      screensLabel: "الواجهة الحقيقية",
      screensCaption: "واجهة حقيقية، بيانات تجريبية.",
      screensAlt: "واجهة حقيقية ببيانات تجريبية",
      ctaTitle: "هل يناسب هذا منشأتكم؟",
      ctaBody: "عشرون دقيقة، مجانًا ودون التزام. ننظر في المنشأة ونقول بصراحة إن كنا نستطيع المساعدة.",
      ctaPrimary: "بدء مشروع",
      ctaSecondary: "كل المنتجات",
    },
    leistungenPage: {
      eyebrow: "الخدمات",
      title: "خمس طبقات. نظام واحد.",
      lead: "العلامة، الحضور، التشغيل، الأتمتة، الذكاء. كل طبقة تحمل التي تليها — لا جنبًا إلى جنب، بل كنظام واحد. ما بنيناه لمنتجاتنا نأتي به إلى يومكم العملي.",
      metaTitle: "الخدمات — من العلامة إلى الذكاء الاصطناعي",
      metaDescription:
        "طبقات creaDIG الخمس: العلامة، الحضور الرقمي، التشغيل، الأتمتة، والذكاء الاصطناعي. لشركات في ألمانيا والنمسا وسويسرا — بالألمانية والتركية والإنجليزية.",
      pricingLabel: "الأسعار",
      pricingNote:
        "المنتجات القياسية مسعّرة بشفافية. أما تطوير الأنظمة فيُحسب إفراديًا — بحسب النطاق، لا بالساعة.",
    },
    nav: {
      home: "الرئيسية",
      leistungen: "الخدمات",
      produkte: "المنتجات",
      arbeiten: "الأعمال",
      unternehmen: "الشركة",
      insights: "ملاحظات",
      betrieb: "التشغيل المُدار",
      systeme: "الأنظمة",
      hints: {
        leistungen: "ما نبنيه لكم",
        produkte: "ما بنيناه ونشغّله بأنفسنا — دليل، لا كتالوج",
        arbeiten: "مشاريع منجزة، بالأسماء",
        unternehmen: "من يقف خلف ذلك وكيف نعمل",
        insights: "نصوص مهنية من التشغيل الجاري",
        kontakt: "أربعة طرق لبدء الحديث",
      },
      ueber: "من نحن",
      pakete: "الباقات",
      kontakt: "التواصل",
      cta: "بدء مشروع",
      menu: "فتح القائمة",
      close: "إغلاق القائمة",
      menuTitle: "التنقّل",
      theme: "تبديل المظهر",
      language: "تغيير اللغة",
      skipToContent: "الانتقال إلى المحتوى",
    },
    hero: {
      eyebrow: "بيت أنظمة · أوسنابروك · منذ 2017",
      headlineLine1: "نبني",
      headlineLine2: "ما لا يراه",
      headlineLine3: "الآخرون.",
      subline:
        "تبني creaDIG العلامة والحضور الرقمي والتشغيل والأتمتة والذكاء الاصطناعي كنظام واحد — لشركات في ألمانيا والنمسا وسويسرا.",
      systemLine: "خمس طبقات. نظام واحد.",
      ctaPrimary: "بدء مشروع",
      ctaSecondary: "أعمالنا",
      location: "ألمانيا · النمسا · سويسرا",
      scroll: "تمرير",
    },
    impact: {
      eyebrow: "الأساس",
      title: "ليست فكرة. تشغيلٌ قائم.",
      figures: {
        since: { label: "منذ", detail: "نمت من وكالة إلى بيت أنظمة." },
        products: { label: "منتجات خاصة", detail: "meAI وfibero وCASSAMEA وmeahv — بنيناها بأنفسنا." },
        systems: {
          label: "أنظمة في الإنتاج",
          detail: "أنظمة تعمل اليوم في اليوم العملي لمنشأة.",
        },
        automated: {
          label: "خطوات مؤتمتة",
          detail: "خطوات كان أحدهم يؤديها يدويًا من قبل.",
        },
        operatingYears: {
          label: "سنوات في السوق",
          detail: "دون انقطاع، محسوبة من التأسيس في 2017.",
        },
      },
      facts: {
        regions: {
          label: "الأسواق",
          value: "ألمانيا والنمسا وسويسرا",
          detail: "استشارة وبناء بالألمانية والتركية والإنجليزية.",
        },
        scope: {
          label: "المدى",
          value: "من العلامة إلى الذكاء الاصطناعي",
          detail: "خمس طبقات. نظام واحد.",
        },
      },
      note: "أنظمة في التشغيل اليومي — لا في عرض تقديمي.",
    },
    logos: {
      eyebrow: "المنظومة",
      title: "ما يعمل تحت هذه المظلة",
      ownProducts: "منتجات خاصة",
      clients: "العملاء",
      brands: "علامات في محيط عملنا",
      note: "منتجاتنا الخاصة بنيناها ونشغّلها بأنفسنا. العملاء لا يظهرون هنا إلا بموافقتهم. أما العلامات الأخرى فلا تظهر أصلًا — لا اسم دون إذن.",
    },
    portfolio: {
      eyebrow: "معرض الأعمال",
      title: "مبنيّة. ومشغَّلة.",
      lead: "أربعة منتجات خاصة بنا ابتكرناها وبنيناها بأنفسنا — إلى جانب أعمال لعملاء في ألمانيا وسويسرا. مفصولة بوضوح ليتبيّن ما هو ملكنا.",
      built: "ما الذي بنيناه",
      products: "منتجات خاصة",
      productsNote: "ابتكرناها وبنيناها ونشغّلها بأنفسنا.",
      clientWork: "أعمال العملاء",
      clientWorkNote: "خدمة لعملاء — لا منتجًا لنا.",
      kindProduct: "منتج",
      kindClientWork: "عمل لعميل",
      more: "كذلك تحت هذه المظلة",
      viewLive: "عرض حيّ",
      mockupNote: "بطاقات المنتجات: نماذج توضيحية، لا لقطات شاشة.",
      productPhotoNote:
        "صور المنتجات تُظهر الواجهة الحقيقية (ببيانات تجريبية) — لا نماذج.",
      customerPhotoNote: "صور العملاء تُظهر الواجهة الحقيقية — لا نماذج.",
      imageNoteMixed:
        "واجهات حقيقية (منتجات وعملاء) ونماذج توضيحية — موسومة بشكل منفصل، لا مختلطة.",
      viewLabel: "العرض",
      viewCards: "بطاقات",
      viewRegistry: "سجل",
      colProject: "المشروع",
      colSector: "القطاع",
      colRegion: "المنطقة",
      registryNote: "المشاريع نفسها، مسرودة بكثافة. نضيف السنوات حالما تُوثَّق — السنوات المقدَّرة لا مكان لها هنا.",
    },
    cases: {
      eyebrow: "حالات العملاء",
      title: "ما الذي تغيّر بعد ذلك.",
      lead: "كل حالة بالترتيب نفسه: أين كانت المنشأة، وما الذي كان يعرقلها، وما الذي أرادت بلوغه — وبعد ذلك فقط ما كان دورنا. بموافقة خطية من العميل فقط؛ ودون موافقة لا يظهر هنا شيء.",
      card: {
        project: "المشروع",
        category: "الفئة",
        services: "الخدمات",
      },
      chapters: {
        start: "نقطة البداية",
        problem: "المشكلة",
        goal: "الهدف",
        role: "دورنا",
        system: "النظام",
        delivery: "التنفيذ",
        result: "النتيجة",
        today: "اليوم",
      },
      metricsLabel: "الأرقام",
      sourceLabel: "المصدر",
      voiceLabel: "بكلمات العميل",
    },
    reviews: {
      eyebrow: "التقييمات",
      title: "ما كتبه العملاء.",
      lead: "بنصّها الأصلي، مع الاسم والتاريخ. نحن لا نترجم التقييمات — الجملة المترجَمة جملةٌ لم يكتبها صاحبها قط.",
      verify: "الاطلاع على Google",
      projectLabel: "المشروع",
      sourceGoogle: "تقييم على Google",
      sourceClient: "أُرسل إلينا مباشرةً",
      ofFive: "من 5",
      countOne: "تقييم",
      countMany: "تقييمات",
    },
    faq: {
      eyebrow: "أسئلة متكررة",
      title: "ما يسأله المهتمّون أولًا.",
      lead: "ستة أسئلة تَرِد في كل حديث أول تقريبًا — مُجابة هنا مسبقًا. كل إجابة مطابقة لما نقوله على الهاتف.",
      more: "سؤالكم غير مذكور؟",
      moreCta: "اسألوا مباشرةً",
      items: [
        {
          q: "كم يكلّف الحضور الرقمي لدى creaDIG؟",
          a: "باقة الموقع بـ 2.400 يورو دون ضريبة كسعر مرجعي لأول منشأتين، ثم 3.900 يورو دون ضريبة. المتابعة الجارية بـ 149 يورو دون ضريبة شهريًا. كل الأسعار تُضاف إليها ضريبة 19٪، بسعر ثابت للنطاق المتفق عليه.",
        },
        {
          q: "كيف يسير المشروع؟",
          a: "في ثلاث خطوات: نفهم، نبني، نشغّل. ننظر في المنشأة، ونبني النظام، ثم نُبقيه في التشغيل.",
        },
        {
          q: "ما هو meAI؟",
          a: "meAI هو نظام تشغيل الأعمال بالذكاء الاصطناعي لدينا — يجمع الأرقام والمهام والمستندات ويُهيّئ القرارات. حيّ على meai.run.",
        },
        {
          q: "هل تعملون في سويسرا أيضًا؟",
          a: "نعم. مقرّنا مركز ICO للابتكار في أوسنابروك؛ وسويسرا سوقٌ نخدمه. وقد بُني CASSAMEA خصيصًا لقطاع الضيافة السويسري.",
        },
        {
          q: "هل تتحدثون التركية؟",
          a: "نعم. الاستشارة والمستندات والمتابعة الجارية متاحة بالألمانية والتركية — وعبر واتساب بالكامل إن رغبتم.",
        },
        {
          q: "لمن يعود النظام — وماذا يحدث إن أنهيتُ المتابعة؟",
          a: "النظام وكل البيانات فيه ملككم من اليوم الأول. المتابعة الجارية بـ 149 يورو دون ضريبة شهريًا قابلة للإنهاء شهريًا دون حد أدنى للمدة. وبعدها يبقى كل شيء لديكم: الشيفرة والمحتوى والصلاحيات والنطاق — نسلّم ما بحوزتنا، ويمكنكم المتابعة مع أي جهة أخرى. ما ينتهي هو المتابعة، لا وصولكم.",
        },
      ],
    },
    servicePage: {
      breadcrumbHome: "الرئيسية",
      breadcrumbServices: "الخدمات",
      includesLabel: "ما يشمله",
      forWhomLabel: "لمن",
      layerLabel: "الطبقة في النظام",
      processLabel: "كيف يسير",
      durationLabel: "كم يستغرق",
      fromToLabel: "ما الذي يتغيّر في المنشأة",
      fromToBefore: "قبل",
      fromToAfter: "بعد",
      clientEffortLabel: "ما تُسهمون به",
      packagesLabel: "مشمول في هذه الباقات",
      packagesCta: "عرض الباقات والأسعار",
      worksLabel: "أعمال ذات صلة",
      worksCta: "عرض معرض الأعمال كاملًا",
      boundaryLabel: "ما نفعله — وما لا نفعله",
      boundaryWeLabel: "هذا نلتزم به",
      boundaryNotWeLabel: "هذا لا نلتزم به",
      ownProofLabel: "مُختبَر على أنظمتنا",
      priceLadderLabel: "كم يكلّف",
      priceFixed: "سعر ثابت",
      priceOffer: "عرض بعد الفحص",
      priceMonthly: "شهريًا",
      ctaTitle: "هل يناسب هذا منشأتكم؟",
      ctaBody: "عشرون دقيقة، مجانًا ودون التزام. ننظر في المنشأة ونقول بصراحة إن كنا نستطيع المساعدة.",
      ctaPrimary: "استشارة أولى مجانية",
      ctaSecondary: "السؤال عبر واتساب",
    },
    quickCheck: {
      eyebrow: "فحص سريع",
      title: "ثلاث نقاط عن موقعكم. مجانًا.",
      lead: "تعطوننا العنوان، وننظر في الموقع — يدويًا، بلوحة المفاتيح وقارئ الشاشة. وتحصلون على ثلاث نقاط محدَّدة: ما لفت انتباهنا، وأين هو، وماذا يعني لزوّاركم.",
      siteLabel: "عنوان الموقع",
      sitePlaceholder: "example.com",
      errSite: "يُرجى ذكر عنوان موقعكم — بدونه لا شيء ننظر فيه.",
      messageLabel: "هل من شيء ينبغي أن نعرفه؟",
      messagePlaceholder: "اختياري. مثلًا: المتجر، أو حجز المواعيد، أو ملاحظة من أحد العملاء.",
      submit: "طلب الفحص السريع",
      sentTitle: "وصلنا.",
      sentBody:
        "سننظر في موقعكم ونعود إليكم بثلاث نقاط محدَّدة — مجانًا ودون التزام.",
      limitTitle: "ما ليس عليه الفحص السريع",
      limitBody:
        "يُظهر ثلاث نقاط، لا كلّها. وليس فحصًا كاملًا وفق WCAG 2.1 AA — ذاك عملٌ يدوي يستغرق أكثر من نظرة. وليس تقييمًا قانونيًا.",
      humanNote:
        "ليس ماسحًا آليًا: إنسانٌ ينظر في الموقع. لذلك يستغرق يومَي عمل لا ثانيتين.",
    },
    architecture: {
      eyebrow: "البيت",
      title: "مظلة واحدة، خمس طبقات، أربعة منتجات.",
      lead: "الشركة كلها في عرضٍ واحد: المظلة في الأعلى، وتحتها الطبقات الخمس، ويمتدّ التشغيل عرضيًا تحتها — وفي الأسفل المنتجات الأربعة، كلٌّ عند الطبقة التي يجلس عليها.",
      roofLabel: "المظلة",
      roofNote: "بيت أنظمة، أوسنابروك، منذ 2017",
      layersLabel: "خمس طبقات",
      operateLabel: "ممتدّ عرضيًا",
      operateNote: "استضافة · مراقبة · تحديثات · أمان · نسخ احتياطي · دعم · تطوير مستمر",
      productsLabel: "أربعة منتجات خاصة",
      onLayer: "على طبقة",
      caption:
        "ليس هيكلًا تنظيميًا ولا مسحًا للسوق — بل ترتيب بيتنا نحن. كل طبقة نقدّمها كخدمة؛ وكل منتج دليلٌ على أننا بنيناها بأنفسنا.",
    },
    services: {
      eyebrow: "الخدمات",
      title: "خمس طبقات. نظام واحد.",
      lead: "نعمل من الألف إلى الياء — من أول شعار إلى نظام ذكاء اصطناعي خاص بالمنشأة. كل طبقة تقوم على التي تحتها.",
      forWhom: "لمن",
      entryLabel: "نقطة الدخول",
      problemLabel: "نقطة البداية",
      solutionLabel: "ما الذي نبنيه",
      resultLabel: "ما الذي يختلف بعد ذلك",
      projectsLabel: "مشاريع نموذجية",
      detailLabel: "بالتفصيل",
      depthLabel: "في العمق",
      layers: {
        identity: {
          name: "الهوية",
          what: "العلامة والاسم والشعار والحضور — الأساس الذي يقوم عليه كل شيء.",
          who: "المؤسسون، والمنشآت الجديدة، والحِرف قبل أول ظهور علني.",
          problem:
            "للمنشأة اسمٌ ولا صورة لها. العرض والمركبة والفاتورة واللافتة تبدو مختلفة في كل مرة — وعلى العميل أن يستنتج في كل تواصل مع من يتعامل.",
          solution:
            "نبني نظام علامة لا شعارًا: الرمز والخط والألوان وقواعد استعمالها، موثَّقة ومُسلَّمة — لتستطيع المطبعة والمورّد التالي العمل بها دون تخمين.",
          result: "كل ما يخرج من المنشأة يأتي منها بشكل ظاهر. دون استفسارات، ودون إعادة بناء، ودون أن يلتقط أحدٌ لونًا من ملف PDF قديم.",
          projects: [
            "الهوية المؤسسية",
            "نظام العلامة",
            "الشعار والعلامة اللفظية",
            "المطبوعات المكتبية",
            "أسس واجهة الاستخدام",
          ],
        },
        digital: {
          name: "الرقمي",
          what: "موقع، متجر، صفحات هبوط — ظاهرة وسريعة وقابلة للعثور عليها.",
          who: "المخابز والعيادات والمطاعم والمنشآت الحِرفية.",
          problem:
            "الموقع كتيّبٌ إعلاني. هو على الشبكة، لكنه لا يستقبل شيئًا — لا استفسارًا ولا طلب توظيف ولا موعدًا. ولا أحد يعرف كم شخصًا مرّ من أمامه.",
          solution:
            "نبني الحضور جزءًا من المنشأة: موقعًا أو بوابةً أو تطبيق ويب أو متجرًا، موصولًا بما يحدث بعده. وإتاحة الوصول وفق WCAG 2.1 AA مبنيّة من الداخل لا مُضافة لاحقًا.",
          result: "الاستفسارات تصل، وتُنسب إلى مصدرها، وتحطّ حيث تُعالَج — بدل صندوق بريد لا يفتحه أحد يوم الجمعة.",
          projects: [
            "المواقع",
            "تطبيقات الويب",
            "البوابات",
            "التجارة الإلكترونية",
            "الأجهزة المحمولة",
            "إتاحة الوصول",
          ],
        },
        operations: {
          name: "التشغيل",
          what: "نقاط البيع والتخطيط والفوترة والإدارة — المنشأة داخل نظام واحد.",
          who: "الضيافة، والعمل الميداني، والإدارة، ومقدّمو الخدمات.",
          problem:
            "المنشأة تسير على أوراق وجداول وثلاثة برامج لا يعرف بعضها بعضًا. من أراد إجابة سؤالٍ واحد بحث في أربعة مواضع — وتكون الإجابة قد قدُمت قبل أن تكتمل.",
          solution:
            "نُنظّم المنشأة في نظام واحد: الطلب والعميل والمستند والرقم في مكان واحد، مع واجهات لما يجب أن يبقى. ما يجب أن يكون مخصَّصًا نبنيه؛ وما هو متاح جاهزًا لا نشتريه مرتين.",
          result: "مصدر إجابة واحد بدل أربعة. ومن ينضمّ حديثًا يجد طريقه في النظام لا في ذاكرة زميل.",
          projects: [
            "إدارة العملاء",
            "إدارة الطلبات",
            "الإدارة الخلفية",
            "البيانات والواجهات",
            "لوحات المعلومات",
            "برمجيات مخصَّصة",
          ],
        },
        automation: {
          name: "الأتمتة",
          what: "العمل المتكرر يؤدّيه النظام، لا الإنسان.",
          who: "منشآت من 6 إلى 20 موظفًا مع تراكم أوراق متزايد.",
          problem:
            "العمل نفسه، كل يوم، يدويًا: إعادة كتابة الإيصالات، وتحويل الرسائل، ومتابعة العروض، ومطابقة القوائم. لا يُلاحَظ لأنه ليس كثيرًا دفعةً واحدة — يُلاحَظ في نهاية الشهر.",
          solution:
            "نؤتمت المسارات لا الناس: النظام يتولّى العمليات والواجهات والمستندات والبريد الوارد. ودائمًا مع موضع واحد يرى فيه إنسانٌ ما لم يمرّ.",
          result: "العمل المتكرر يحدث دون أن يضطر أحدٌ لتذكّره. وإذا تعطّل شيء، أبلغ عن نفسه بدل أن يبقى ساكنًا.",
          projects: [
            "مسارات العمل",
            "الواجهات والتكاملات",
            "معالجة المستندات",
            "معالجة البريد",
            "أتمتة العمليات",
          ],
        },
        intelligence: {
          name: "الذكاء · meAI",
          what: "نظام ذكاء اصطناعي يفكّر معكم، ويُهيّئ، ويحفظ الصورة الكاملة.",
          who: "منشآت راسخة تريد أن تقرّر أسرع.",
          problem:
            "الأرقام موجودة، والقرار ليس كذلك. من أراد اتخاذه فتح خمسة تقارير وخرج يعرف أكثر — لا أفضل.",
          solution:
            "نبني فوق ذلك نظامًا يقرأ بدل أن يعرض: يصنّف، ويرتّب الأولويات، ويُهيّئ الخيارات. وmeAI هو نسختنا منه — بنيناه ونشغّله، وجرّبناه في يومنا العملي قبل أن يصل إلى منشأة.",
          result: "سؤال «ما الذي يأتي أولًا اليوم» صار له جواب — والسبب مكتوب بجانبه.",
          projects: [
            "التحليل",
            "ترتيب الأولويات",
            "المعرفة",
            "الذكاء الاصطناعي والوكلاء",
            "meAI",
          ],
        },
      },
    },
    houseProducts: {
      eyebrow: "تحت هذه المظلة",
      title: "أربعة منتجات خاصة بنا.",
      lead: "ابتكرناها وبنيناها ونشغّلها بأنفسنا — ولذلك هي أفضل دليل على ما نستطيع بناءه للآخرين. ليست كتالوجًا: لا يُباع منها شيء هنا. والتعمّق في منتجنا الرائد meAI يأتي مباشرةً بعدها.",
      statusLabel: "الحالة",
      openLabel: "فتح",
    },
    meai: {
      eyebrow: "المنتج الرائد · meai.run",
      title: "مديركم التنفيذي غير المرئي.",
      lead: "meAI هو نظام تشغيل الأعمال بالذكاء الاصطناعي لدينا. يقرأ المنشأة، ويُهيّئ القرارات، ويجمع ما يتفرّق عادةً بين الرؤوس وقصاصات الورق.",
      dna: "الحمض النووي المزدوج النادر: نحن لا نبني نظام الذكاء الاصطناعي فحسب — بل ندير به منشأتنا. ما يستطيعه meAI مُجرَّب في يومنا العملي قبل أن يصل إلى عميل.",
      cta: "فتح meai.run",
      capabilities: {
        overview: {
          name: "نظرة عامة",
          what: "الأرقام والمهام والمواعيد في مكان واحد، محدَّثة دائمًا.",
        },
        tasks: {
          name: "ترتيب الأولويات",
          what: "النظام يقول ما الذي يأتي أولًا اليوم — ولماذا.",
        },
        documents: {
          name: "المستندات",
          what: "الفواتير والإيصالات تُقرأ وتُصنَّف وتُنسَب.",
        },
        decisions: {
          name: "القرارات",
          what: "خيارات مُهيّأة بدل جداول فارغة.",
        },
      },
    },
    process: {
      eyebrow: "كيف نعمل",
      title: "نفهم. نبني. نشغّل.",
      bridge: "creaDIG تبني النظام — والنظام يشتغل بنفسه — وأنتم تحتفظون بالصورة الكاملة.",
      steps: {
        understand: {
          name: "نفهم",
          what: "ننظر في المنشأة قبل أن نبني سطرًا واحدًا. أين يضيع الوقت، وما الذي يعرقل، وما الذي لا يُرى؟",
        },
        build: {
          name: "نبني",
          what: "العلامة والواجهة والمنطق والأتمتة — كنظام واحد مترابط، لا كمجموعة أدوات.",
        },
        operate: {
          name: "نشغّل",
          what: "لا نسلّم ونختفي. نُشغّل ونراقب ونطوّر.",
        },
      },
      opsEyebrow: "من أول تواصل",
      opsSteps: {
        request: {
          name: "الاستفسار",
          what: "تكتبون إلينا — عبر واتساب أو النموذج أو مباشرةً بموعد مقترح. نردّ خلال يومَي عمل.",
        },
        analysis: {
          name: "التحليل",
          what: "عشرون دقيقة حديث أول، مجانًا. ننظر في المنشأة ونقول ما الذي سنبنيه — وما الذي لن نبنيه.",
        },
        offer: {
          name: "العرض",
          what: "عرض ثابت بالنطاق والسعر والإطار الزمني. لا كشوف ساعات ولا مطالبات لاحقة.",
        },
        implementation: {
          name: "التنفيذ",
          what: "نبني ما ورد في العرض — على مراحل ترونها في الطريق. حالات وسيطة بدل مفاجأة في النهاية.",
        },
        operate: {
          name: "التشغيل",
          what: "بعد الإطلاق نبقى على الخط: نشغّل ونراقب ونطوّر — ما دمتم ترغبون.",
        },
      },
    },
    about: {
      eyebrow: "من نحن",
      title: "بيتٌ ينمو.",
      founderLabel: "المؤسس وقائد الأنظمة",
      founder: "محمد أمين أكيول",
      body1:
        "بدأت creaDIG في 2017 كوكالة. تحوّلت المشاريع إلى منتجات، والمنتجات إلى بيت أنظمة — واليوم تعمل تحت هذه المظلة أربعة أنظمة خاصة، إلى جانب متابعة المنشآت التي بنيناها لها.",
      body2:
        "الفريق ينمو؛ والوظائف التالية قيد الإعداد. وكيف نعمل اليوم — من يقود، ومن في الفريق الأساسي، ومن سينضم — مذكور أدناه دون تجميل.",
      nicheLabel: "مجالات التركيز",
      niches: [
        "الحِرف بعدد 6 إلى 20 موظفًا — التركيز على ألمانيا",
        "المنشآت الصغيرة والمتوسطة دون قسم تقنية معلومات خاص",
        "الضيافة في ألمانيا وسويسرا",
      ],
      nicheOpen:
        "هذه مجالات تركيز لا شروط. نعمل مع شركات من كل قطاع وكل حجم — بالألمانية والتركية والإنجليزية.",
      standardLabel: "لغتان، معيار واحد",
      standardBody:
        "الاستشارة والمستندات والعقود والمتابعة الجارية متاحة بالألمانية والتركية. المعيار نفسه، والتوثيق نفسه، والفاتورة نفسها — فقط باللغة التي يُقرَّر بها داخل المنشأة. دون مترجم في الوسط ودون نسخة ثانية أرقّ.",
      locationsLabel: "المقر",
      marketsLabel: "الأسواق",
      honesty:
        "لا نذكر أعداد موظفين أو أرقام إيرادات مُختلَقة. دليلنا هو عملٌ بنيناه.",
    },
    workModel: {
      eyebrow: "هكذا نعمل",
      title: "بقيادة المؤسس — ومعه بالضبط من يحتاجه المشروع.",
      lead: "لا نقول كم نحن كبار، بل كيف نعمل. هذه هي المعلومة الأصدق والأنفع لكم: بعدها تعرفون من يقود مشروعكم ومن يعمل عليه.",
      items: {
        founder: {
          name: "بقيادة المؤسس",
          what: "لكل مشروع مسؤول واحد، وهو دائمًا الشخص نفسه. يقود الحديث الأول، ويصمّم النظام، ويردّ على الهاتف حين يستجدّ أمر. لا انتقال من البيع إلى التنفيذ، ولا تسليم لشخص لم يكن حاضرًا.",
        },
        core: {
          name: "فريق أساسي صغير",
          what: "صغير بما يكفي ليعرف كلٌّ ما يعمل عليه الآخرون. وكبير بما يكفي ألّا توقف إجازةٌ واحدة مشروعًا.",
        },
        network: {
          name: "متخصصون عند الحاجة",
          what: "لما يحتاجه المشروع إضافةً — تطوير، كتابة، استراتيجية — نعمل مع شبكة ثابتة في ألمانيا والنمسا وسويسرا. ليست شراءً مجهولًا: هؤلاء أشخاص بنينا معهم من قبل.",
        },
      },
      fieldsLabel: "مجالات المسؤولية",
      fieldsNote: "خمس طبقات، مسؤولية واحدة. هذه بنية البيت — لا قائمة مهارات.",
      honesty:
        "لا نذكر عدد موظفين ولا رقم إيرادات. كلاهما يمكن ادّعاؤه، وكلاهما لا يقول شيئًا عن مشروعكم. المهم من يعمل عليه.",
    },
    photos: {
      eyebrow: "من داخل البيت",
      title: "حيث يُصنع هذا.",
      lead: "لا صور مخزون ولا لقطات مكاتب استوديو. ما يظهر هنا هو المكان الذي يجري فيه العمل — أو لا يظهر شيء.",
      slots: {
        buero: {
          caption: "مساحة العمل في مركز ICO للابتكار بأوسنابروك.",
          alt: "مساحة عمل creaDIG في مركز ICO للابتكار بأوسنابروك",
        },
        ico: {
          caption: "مركز ICO للابتكار بأوسنابروك، شارع ألبرت أينشتاين 1.",
          alt: "مركز ICO للابتكار بأوسنابروك في شارع ألبرت أينشتاين 1",
        },
        arbeitsplatz: {
          caption: "شاشات عليها عملٌ حقيقي.",
          alt: "محطة عمل في creaDIG وعلى الشاشات أنظمة قيد التشغيل",
        },
        whiteboard: {
          caption: "رسمٌ نشأ فعلًا على هذا النحو.",
          alt: "لوح أبيض عليه رسم نظام من أحد المشاريع",
        },
      },
    },
    location: {
      eyebrow: "مقرّنا",
      note: "تجدوننا في مركز الابتكار بأوسنابروك. المواعيد بالاتفاق — حضوريًا أو عبر الفيديو أو عبر واتساب.",
      mapLink: "عرض على الخريطة",
      photoAlt:
        "مركز ICO للابتكار بأوسنابروك في شارع ألبرت أينشتاين 1 — مقر creaDIG",
    },
    packages: {
      eyebrow: "عروض البداية",
      title: "طريقان للدخول — كلاهما بسعر ثابت.",
      lead: "ليست كل منشأة تبدأ من الأعلى. هذان العرضان هما نقطة الدخول: محدَّدان بوضوح، ومسعّران مسبقًا، دون أن تطلبوا البيت كله.",
      entryNote:
        "هذه نقطة الدخول، لا البنية الأساسية. أما ما تبنيه creaDIG كبيت أنظمة فمذكور أعلاه في الطبقات الخمس ويُحسب بحسب النطاق — لا بالباقة.",
      forWhom: "لمن",
      recommended: "توصيتنا",
      tierLabel: "البداية",
      referenceNote:
        "سعر مرجعي لأول منشأتين — مقابل اقتباس، وذكرٍ كمرجع، وصورتين. ومن المنشأة الثالثة يسري السعر المعتاد.",
      regularLabel: "السعر المعتاد",
      durationLabel: "مدة المشروع",
      netNote: "كل الأسعار دون ضريبة، تُضاف إليها ضريبة 19٪.",
      openEyebrow: "نطاق أكبر",
      openPrice: "عند الطلب",
      openNote:
        "مواقع متعددة، أو متجر، أو واجهات إلى نظام المخزون، أو نظام يتجاوز الموقع: هذا نحسبه بالجهد — بعد حديث، لا من قائمة. نقول لكم التكلفة مسبقًا، ولا يتغيّر الرقم بعدها.",
      openCta: "مناقشة النطاق",
      retainerEyebrow: "المتابعة الجارية",
      retainerTitle: "تشغيل بدل تسليم.",
      retainerFrom: "من",
      retainerCta: "طلب المتابعة",
      once: "مرة واحدة · سعر ثابت",
      monthly: "/ شهريًا",
      items: {
        website: {
          name: "باقة الموقع للحِرف",
          who: "للمنشآت الحِرفية والشركات الصغيرة",
          outcome: "على الشبكة خلال أربعة أسابيع — مع استفسارات وطلبات توظيف",
          includes: [
            "موقع مبنيّ للاستفسارات — لا ككتيّب",
            "صفحة توظيف للمتقدمين",
            "إعداد ملف الأعمال على Google",
            "نموذج استفسار يصل فعلًا",
            "إتاحة الوصول وفق WCAG 2.1 AA مبنيّة لا مُضافة",
            "النصوص — مكتوبة، لا مُعادة إليكم كواجب منزلي",
            "اختيار الصور وتجهيزها",
          ],
          note: "سعر ثابت للنطاق المتفق عليه. موعد إطلاق محدَّد: أربعة أسابيع من استلام موادّكم. 50٪ عند البدء و50٪ عند موافقتكم. الموقع وكل الصلاحيات ملككم من اليوم الأول.",
          cta: "طلب مشروع",
        },
        audit: {
          name: "فحص إتاحة الوصول",
          who: "للمنشآت التي لديها موقع قائم",
          outcome: "تقرير نتائج يعود إليكم — حتى لو لم تفعلوا شيئًا بعده",
          includes: [
            "فحص يدوي وفق WCAG 2.1 AA على كل الصفحات الرئيسية",
            "جولة بلوحة المفاتيح وقارئ الشاشة، لا مجرد مسح آلي",
            "كل نتيجة مع الصفحة والعنصر والمعيار والقيمة المقيسة",
            "بيان إتاحة الوصول كقالب تقني",
            "إعادة فحص بعد المعالجة، بأرقام قبل وبعد",
          ],
          note: "سعر ثابت. الفحص قائم بذاته ولا يُلزمكم بأي معالجة. أما تكلفة المعالجة فلا نقولها إلا بعد أن نرى الشيفرة — لا أحد يذكر سعرًا ثابتًا لشيء لم يره ويكون جادًّا.",
          cta: "عرض الخدمة",
        },
      },
    },
    managed: {
      eyebrow: "التشغيل",
      title: "التشغيل المُدار.",
      lead: "الطبقات الخمس تقوم رأسيًا بعضها فوق بعض. وهذا يمتدّ عرضيًا تحتها ويمسّ كل واحدة منها: ما بُني يجب أن يعمل — كل يوم، بما في ذلك الأيام التي لا يفكّر فيها أحد بذلك.",
      statement: "لا نسلّم ونختفي. ما بنيناه نُبقيه يعمل — وإن تعطّل شيء ليلًا فتلك مشكلتنا لا مشكلتكم.",
      itemsLabel: "ما يشمله",
      items: {
        hosting: {
          name: "الاستضافة",
          what: "الخوادم والنطاقات والشهادات — مُعدّة ومدفوعة وفي عهدتنا.",
        },
        monitoring: {
          name: "المراقبة",
          what: "الموقع يُبلغ حين لا يكون متاحًا. لا عميلكم.",
        },
        updates: {
          name: "التحديثات",
          what: "الاعتماديات وإصدارات النظام تبقى محدَّثة — قبل أن تتحوّل ثغرة إلى حادثة.",
        },
        security: {
          name: "الأمان",
          what: "الصلاحيات والأذونات والترويسات وتشفير النقل على المستوى الذي حُدّد عند البناء.",
        },
        backups: {
          name: "النسخ الاحتياطي",
          what: "محفوظة وقابلة للاستعادة. النسخة التي لم تُستعَد قط ليست نسخة احتياطية.",
        },
        support: {
          name: "الدعم",
          what: "جهة اتصال واحدة بنَت النظام بنفسها. اتصال ردٍّ في يوم العمل التالي.",
        },
        evolution: {
          name: "التطوير المستمر",
          what: "ما يتبيّن خطؤه في التشغيل يُغيَّر — لا يُوثَّق ويُترك كما هو.",
        },
      },
      note: "لا نسبة إتاحة مئوية، ولا زمن استجابة بالساعات، ولا «24/7». المُلتزَم به هو ما هو مكتوب هنا — ونلتزم به في الإجازة أيضًا.",
    },
    systemePage: {
      eyebrow: "الأنظمة",
      title: "التكامل أولًا.",
      lead: "النظام الجديد نادرًا ما يستبدل كل شيء. غالبًا عليه أن يعمل بجانب ما هو قائم — وأن يتحدث معه. وما يجب حسمه في ذلك مذكور هنا.",
      metaTitle: "الأنظمة والتكامل — واجهات وبيانات وتشغيل",
      metaDescription:
        "كيف تربط creaDIG الأنظمة وتشغّلها: الواجهات، والبيانات، والاستضافة، والفوترة، والمستندات، والصلاحيات، وخدمات الذكاء الاصطناعي. مع سبع نقاط يمكن التحقق منها على هذه الصفحة نفسها.",
      statement: "النظام الذي يعمل لنفسه فقط هو موضع ثانٍ تُصان فيه البيانات نفسها. وهذا بالضبط ما لم يُرده أحد.",
      categoriesEyebrow: "التكامل",
      categoriesLabel: "مع ماذا يجب أن يتحدث النظام.",
      categoriesNote: "ليس كتالوج مورّدين. المذكور هنا ما نحسمه قبل البناء — لا أي علامات خارجية نُتقنها زعمًا. أما ما ربطناه فعلًا فنذكره بالاسم في الحديث.",
      categoryQuestionLabel: "ما يُحسم أولًا",
      categories: {
        interfaces: {
          name: "الواجهات",
          body: "كل نظام تقريبًا عليه أن يجلب بيانات من مكان أو يسلّمها. ووجود واجهة من عدمه يحسم نصف الجهد — ويُحسم قبل أول تصميم، لا في منتصف البناء.",
          question: "هل توجد واجهة موثَّقة، أم تصدير، أم لا شيء؟",
        },
        data: {
          name: "البيانات وقواعد البيانات",
          body: "أين تعيش البيانات، ولمن تعود، وكيف تبدو حين تصير خاطئة. نموذج بيانات لا يعكس المنشأة يُلتفّ عليه في التشغيل — وعندها يعود أحدهم إلى صيانة جدول جانبي.",
          question: "أي سجلّ هو الحقيقة حين يتناقض موضعان؟",
        },
        hosting: {
          name: "الاستضافة والتسليم",
          body: "أين يعمل، وكيف يصل إلى هناك، وماذا يحدث حين يفشل نشر. ليست مسألة جانبية: هي تحسم السرعة والإتاحة وما إذا كان التغيير يستغرق دقائق أم أيامًا.",
          question: "من يملك اليوم صلاحية الوصول إلى الخوادم والنطاق والشهادات؟",
        },
        billing: {
          name: "الفوترة والمدفوعات",
          body: "الجزء الذي تتحوّل فيه الأخطاء إلى مال. المبالغ ونسب الضريبة والمستندات والمواعيد — وقواعد البلد الذي تجري فيه الفوترة. هنا لا شيء يُقدَّر ولا شيء يُقرَّب.",
          question: "بأي قواعد يُحسب، ومن يراجع النتيجة؟",
        },
        documents: {
          name: "المستندات والإثباتات",
          body: "عقود وفواتير وإثباتات وصور من الموقع. تنشأ في الطريق ويجب أن تبقى قابلة للعثور عليها — وإلا صار النظام أرشيفًا لا يفتحه أحد.",
          question: "ما الذي يجب أن يبقى قابلًا للعثور عليه، وكم مدة، ولمن؟",
        },
        accounts: {
          name: "الصلاحيات والأذونات",
          body: "من يرى ماذا، ومن يغيّر ماذا، وماذا يحدث حين يغادر أحدهم. أقلّ الأسئلة لفتًا للانتباه في المشروع، وأكثرها إيلامًا في التشغيل.",
          question: "أي أدوار موجودة فعلًا — لا في الهيكل التنظيمي، بل في العمل اليومي؟",
        },
        ai: {
          name: "خدمات الذكاء الاصطناعي",
          body: "مجدية حيث يجب قراءة شيء أو تصنيفه أو تهيئته مما يفعله إنسانٌ يدويًا اليوم. وغير مجدية كملصق على نظام كان سيعمل على أي حال.",
          question: "أي خطوة تكلّف وقتًا اليوم — وهل يجوز لآلة أن تُهيّئها؟",
        },
      },
      connectedLabel: "مرتبط",
      operationsEyebrow: "في الممارسة",
      operationsLabel: "كيف نشغّل.",
      operationsNote: "أما ما يمكن حجزه منها كخدمة فمذكور في صفحة التشغيل المُدار.",
      operations: {
        monitoring: {
          name: "المراقبة",
          body: "الأنظمة تُبلغ عن نفسها حين لا تكون متاحة. وفي مسار الاستفسارات يمتدّ الأمر أبعد: اختبار ذاتي يفحص ما إذا كان الاستفسار لا يزال قابلًا للتسليم أصلًا — فالعطل الصامت هناك يبدو من الخارج كسوق راكد.",
        },
        logging: {
          name: "السجلات",
          body: "بما يكفي للعثور على خطأ. ولا أكثر مما يمكن تبريره: ما كتبه أحدهم في نموذج لا يظهر في أي سجل.",
        },
        backups: {
          name: "النسخ الاحتياطي",
          body: "محفوظة ومُستعادة. النسخة التي لم تُستعَد قط ليست نسخة — بل ملف يُرجى منه خير.",
        },
        security: {
          name: "الأمان",
          body: "الصلاحيات والأذونات وتشفير النقل وترويسات الاستجابة على المستوى الذي حُدّد عند البناء — ثم قيست ثانيةً، لا افتُرضت.",
        },
        deployment: {
          name: "النشر",
          body: "كل تغيير يسلك المسار نفسه: بناء، فحص، تسليم. وإن انكسر أحد الفحوص لم يُسلَّم شيء — ولا حتى عند الاستعجال.",
        },
      },
      proofEyebrow: "الدليل",
      proofLabel: "قابل للتحقق على هذه الصفحة.",
      proofNote: "العرض خير من الادّعاء. كل نقطة يمكن فحصها من الخارج في ترويسة الاستجابة أو في المصدر المُسلَّم أو في المستودع — دون سؤالنا.",
      proofs: {
        headers: {
          name: "ترويسات الأمان",
          body: "HSTS مع النطاقات الفرعية والتحميل المسبق، وX-Content-Type-Options، وReferrer-Policy، وX-Frame-Options على DENY، وPermissions-Policy، وسياسة محتوى تُشدِّد أصلًا object-src وbase-uri وform-action وframe-ancestors.",
        },
        static: {
          name: "تسليم ثابت",
          body: "الصفحات تُولَّد وقت البناء وتُسلَّم من شبكة التوزيع، لا تُصاغ عند كل طلب. لهذا الموقع سريع — ولهذا لا يُسقطه عطلُ التطبيق فورًا.",
        },
        bilingual: {
          name: "لغات متعددة، عناوين متعددة",
          body: "لكل لغة عناوينها وعناوينها الوصفية وبياناتها المنظَّمة، وهي مرتبطة عبر hreflang — لا مفتاحٌ يستبدل النص في المتصفح.",
        },
        images: {
          name: "الصور بصيغتَي AVIF وWebP",
          body: "الصور تُحوَّل وقت البناء وتُسلَّم بالمقاس الذي يحتاجه التخطيط فعلًا. ومن لا يدعم AVIF يحصل على WebP — تلقائيًا، لا بتفرّع في الشيفرة.",
        },
        gates: {
          name: "ثلاثة فحوص في البناء",
          body: "البناء يتوقف إن كبرت دالةٌ أكثر من اللازم، أو إن ادّعت البيانات المنظَّمة نجومًا غير موجودة، أو إن قالت صفحة خدمة بالتركية أقلّ مما تقوله بالألمانية. ليس إعلان نوايا — بل توقّف.",
        },
        selftest: {
          name: "اختبار ذاتي لمسار الاستفسارات",
          body: "مسارٌ مخصَّص يفحص ما إذا كانت المفاتيح ونطاق المُرسِل والحماية من إساءة الاستعمال لا تزال تعمل، دون إرسال بريد. وإن سقط فحصٌ ردّ بخطأ يفهمه المراقب.",
        },
        accessibility: {
          name: "فحص إتاحة الوصول الخاص بنا، منشورًا",
          body: "فحصنا هذا الموقع بأنفسنا ونشرنا العيوب التي وجدناها، بدل إصدار بيان بلا نتائج. اقرؤوه تحت إتاحة الوصول.",
        },
      },
    },
    betriebPage: {
      eyebrow: "التشغيل",
      title: "التسليم سهل. التشغيل هو العمل.",
      lead: "معظم المشاريع تنتهي عند الإطلاق. وبعده يبدأ الجزء الذي لا يبيعه أحد: التحديثات والأعطال والثغرات الأمنية والتغييرات الصغيرة التي فجأةً لا يستطيع أحد إجراءها. نحن نبقى.",
      metaTitle: "التشغيل المُدار — استضافة ومراقبة وتحديثات ونسخ احتياطي",
      metaDescription:
        "creaDIG تشغّل ما بنته creaDIG: الاستضافة والمراقبة والتحديثات والأمان والنسخ الاحتياطي والدعم والتطوير المستمر. قابل للإنهاء شهريًا — النظام والبيانات ملككم.",
      whyLabel: "لماذا التشغيل بدل التسليم",
      why: [
        {
          name: "من بنى يعرف المواضع",
          body: "المشرف الخارجي يقرأ شيفرةً غريبة عند كل عطل. نحن نقرأ شيفرتنا — ولهذا يكون الجواب على «هل يمكن ذلك بسرعة؟» هنا غالبًا نعم.",
        },
        {
          name: "النظام يشيخ حتى لو لم يمسّه أحد",
          body: "الاعتماديات تُصاب بثغرات، والشهادات تنتهي، والمتصفحات تغيّر قواعدها. لا شيء من ذلك يُعلن عن نفسه، ولا شيء منه ينتظر ميزانية المشروع القادمة.",
        },
        {
          name: "العطل لا يأتي في أوقات الدوام",
          body: "يأتي ليلًا، ونهاية الأسبوع، وفي الإجازة. والسؤال ليس هل سيلاحظه أحد، بل من يلاحظه أولًا: المراقبة أم عميلكم.",
        },
        {
          name: "ما يتبيّن خطؤه في التشغيل يُغيَّر",
          body: "لا بناء يعبر شهره الحقيقي الأول دون تغيير. في مشروع له تاريخ تسليم يُوثَّق مثل ذلك ويُترك. أما في التشغيل فيُغيَّر.",
        },
      ],
      ownershipLabel: "التبعية",
      ownershipTitle: "التشغيل لا يعني التبعية.",
      ownershipBody: "النظام وكل البيانات فيه ملككم من اليوم الأول. المتابعة قابلة للإنهاء شهريًا دون حد أدنى للمدة. وبعدها يبقى كل شيء لديكم — الشيفرة والمحتوى والصلاحيات والنطاق. ما ينتهي هو المتابعة، لا وصولكم.",
    },
    contact: {
      eyebrow: "التواصل",
      title: "عشرون دقيقة، دون التزام.",
      lead: "بالألمانية والتركية والإنجليزية. اختاروا الطريق الأسرع لكم.",
      directTitle: "ثلاثة طرق. كلٌّ منها ينتهي عند إنسان.",
      directLead: "الحديث الأول يمرّ عبر طلب الموعد — أربع خطوات تبيّن عمّا يدور الأمر. ومن لديه سؤال فقط يكتب مباشرةً: عبر واتساب أو البريد، بالألمانية أو التركية أو الإنجليزية.",
      mailTitle: "البريد الإلكتروني",
      mailNote: "للمستندات والعروض وكل ما هو مكتوب.",
      nameLabel: "الاسم",
      namePlaceholder: "اسمكم",
      businessLabel: "المنشأة",
      businessPlaceholder: "الشركة أو القطاع",
      messageLabel: "عمّ يدور الأمر؟",
      messagePlaceholder: "باختصار وبكلماتكم — جملة أو جملتان تكفيان.",
      errRequired: "يُرجى إضافة الاسم وبضع كلمات عن الطلب.",
      submit: "إرسال الطلب",
      submitWhatsapp: "أفضّل واتساب",
      whatsappTitle: "واتساب",
      whatsappNote: "أسرع ردّ، بالألمانية والتركية والإنجليزية.",
      whatsappIntro: "مرحبًا creaDIG، أنا مهتم بمشروع.",
      whatsappAction: "المراسلة عبر واتساب",
      appointmentTitle: "استشارة أولى مجانية",
      appointmentNote: "عشرون دقيقة، عبر الفيديو. مجانًا ودون التزام.",
      appointmentValue:
        "ننظر في منشأتكم ونقول ما الذي سنبنيه — وما الذي لن نبنيه. حتى حين يكون الجواب «ليس بعد».",
      appointmentCta: "طلب موعد",
      locationsLabel: "المقر",
      marketsLabel: "الأسواق",
      privacyConsentPrefix: "لقد قرأتُ",
      privacyConsentLink: "سياسة الخصوصية",
      privacyConsentSuffix:
        "وأوافق على معالجة بياناتي لأغراض معالجة طلبي وتسليمها لهذا الغرض عبر مزوّد الإرسال Resend Inc. (الولايات المتحدة) — بضمان الشروط التعاقدية النموذجية للاتحاد الأوروبي، وإضافةً إلى ذلك بموافقتي الصريحة على النقل إلى الولايات المتحدة (المادة 49(1)(أ) من اللائحة العامة لحماية البيانات). ويمكنني سحب ذلك في أي وقت بأثر مستقبلي.",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "لنتمكن من الرد",
      phoneLabel: "الهاتف",
      phonePlaceholder: "للاتصال بكم",
      errEmail: "يُرجى التحقق من عنوان البريد الإلكتروني.",
      errPhone: "يُرجى ذكر رقم هاتف — نفضّل الاتصال على الكتابة.",
      errPrivacy: "يُرجى تأكيد سياسة الخصوصية.",
      sending: "جارٍ الإرسال …",
      sentTitle: "وصل طلبكم.",
      sentBody:
        "سنتواصل معكم خلال يومَي عمل. وتأكيدٌ في بريدكم — تحقّقوا من مجلد الرسائل غير المرغوبة احتياطًا.",
      errSendFailed:
        "تعذّر تسليم الطلب الآن. يُرجى المحاولة مرة أخرى — أو سلوك أحد الطرق المذكورة.",
      errNotConfigured:
        "مسار الإرسال غير مُعدّ بعد. يُرجى استعمال واتساب في هذه الأثناء، أو الكتابة إلى",
      errRateLimited:
        "وردت عدة طلبات للتوّ من هذا الاتصال. يُرجى المحاولة بعد بضع دقائق — أو استعمال واتساب.",
      errFormExpired:
        "بقي النموذج مفتوحًا مدة طويلة. يُرجى إعادة تحميل الصفحة والإرسال مرة أخرى.",
      handoffNote:
        "عند الإرسال يُفتح واتساب أو برنامج البريد لديكم بالرسالة الجاهزة — ولا تُرسَل إلا حين تؤكّدونها هناك.",
      handoffTitle: "كدتم تنتهون — بقيت خطوة.",
      handoffWhatsapp:
        "واتساب مفتوح برسالتكم الجاهزة. ولا تصلنا إلا حين تضغطون إرسال هناك.",
      handoffMail:
        "برنامج البريد لديكم مفتوح بالرسالة الجاهزة. ولا تصلنا إلا حين تضغطون إرسال هناك.",
      handoffRetry: "لم يحدث شيء؟ افتحوه من هنا مرة أخرى.",
      errBlocked:
        "حجب متصفحكم النافذة. يُرجى فتح واتساب عبر الرابط أدناه — أو الكتابة مباشرةً إلى",
    },
    closing: {
      eyebrow: "الخطوة التالية",
      title: "أنتم تديرون المنشأة. ونحن نبني النظام الذي خلفها.",
      lead: "عشرون دقيقة، مجانًا ودون التزام. ننظر في المنشأة ونقول بصراحة إن كنا نستطيع المساعدة.",
      ctaPrimary: "بدء مشروع",
      ctaSecondary: "عرض الأعمال",
      variants: {
        prices: {
          eyebrow: "الخطوة التالية",
          title: "سعر ثابت لنطاقكم — بعد عشرين دقيقة.",
          lead: "ما ورد أعلاه هو نقطة الدخول. أما ما تحتاجه منشأتكم فننظر فيه قبل أن يذكر أحدٌ رقمًا — مجانًا ودون التزام.",
          ctaPrimary: "طلب عرض بسعر ثابت",
          ctaSecondary: "عرض الأعمال",
        },
        work: {
          eyebrow: "الخطوة التالية",
          title: "مشروع مشابه؟ لنتحدث.",
          lead: "عشرون دقيقة، مجانًا ودون التزام. نقول لكم بصراحة إن كان مشروعكم يناسب ما رأيتموه هنا.",
          ctaPrimary: "مناقشة المشروع",
          ctaSecondary: "عرض الخدمات",
        },
      },
    },
    termin: {
      metaTitle: "إرسال طلب موعد",
      metaDescription:
        "أربع خطوات إلى الحديث: اختيار نوع اللقاء، وذكر الأوقات المفضّلة، وإضافة البيانات. الطلب يصل إلينا مباشرةً — ويصبح الموعد ملزِمًا بردّنا.",
      back: "العودة إلى الموقع",
      eyebrow: "استشارة أولى مجانية",
      title: "أربع خطوات إلى الحديث.",
      lead: "قولوا لنا متى يناسبكم. نراجع الطلب ونؤكّد الموعد بشكل ملزِم في ردّنا — هذا المساعد لا يحجز شيئًا تلقائيًا.",
      stepOf: "خطوة",
      next: "التالي",
      prev: "السابق",
      stepAnnounce: (step: number, title: string) => `الخطوة ${step} من 4: ${title}`,
      step1: {
        title: "عمّ يدور الأمر؟",
        lead: "اختاروا نوع الحديث.",
        vgName: "استشارة أولى مجانية",
        vgDesc: "عشرون دقيقة، دون التزام. نُصغي ونقول بصراحة إن كنا نستطيع المساعدة.",
        vgMeta: "مجانًا · 20 دقيقة",
        arName: "حديث عن الأنظمة",
        arDesc: "نظرة أعمق في التشغيل والأتمتة وmeAI — لمنشآت لديها مشروع محدَّد.",
        arMeta: "مفصَّل · 45 دقيقة",
      },
      step2: {
        title: "متى يناسبكم؟",
        lead: "اختاروا يومًا أو أكثر. الأيام المميّزة هي أيامنا المفضّلة للحديث — وغيرها ممكن عند الطلب.",
        timeTitle: "النوافذ الزمنية",
        timeLead: "يمكن اختيار أكثر من واحدة. كل الأوقات بتوقيت وسط أوروبا.",
        windows: [
          { id: "vormittag", label: "صباحًا", time: "09:00–12:00" },
          { id: "nachmittag", label: "بعد الظهر", time: "13:00–17:00" },
          { id: "abend", label: "مساءً مبكرًا", time: "17:00–19:00" },
        ],
        preferred: "مفضَّل",
        today: "اليوم",
        maxDates: "يمكن اختيار ثلاثة أيام كحد أقصى.",
        prevMonth: "الشهر السابق",
        nextMonth: "الشهر التالي",
        daySelected: "مُختار",
        dayPreferred: "يوم مفضَّل للحديث",
        daysLong: ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
        notBooked:
          "هذا ليس حجزًا بعد. نراجع طلبكم ونؤكّد الموعد بشكل ملزِم في ردّنا.",
        errDate: "يُرجى اختيار يوم واحد على الأقل.",
        errTime: "يُرجى اختيار نافذة زمنية واحدة على الأقل.",
      },
      step3: {
        title: "بياناتكم",
        lead: "الحقول الإلزامية مُعلَّمة بـ *.",
        name: "الاسم",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        org: "الشركة",
        city: "المدينة / المنطقة",
        interest: "الاهتمام",
        size: "حجم الشركة",
        note: "الرسالة",
        notePlaceholder: "باختصار وبكلماتكم — جملة أو جملتان تكفيان.",
        langLabel: "لغة الحديث",
        langDe: "الألمانية",
        langTr: "التركية",
        langBoth: "الألمانية + التركية",
        choose: "يُرجى الاختيار",
        errRequired: "يُرجى تعبئة الحقول الإلزامية بشكل صحيح.",
        errEmail: "يُرجى ذكر عنوان بريد إلكتروني صالح.",
        interests: ["باقة الموقع للحِرف", "المتابعة الجارية — 149 يورو / شهريًا", "شيء آخر — علامة أو برمجيات أو أتمتة", "غير محدَّد بعد"],
        sizes: ["1–4 موظفين", "5–15 موظفًا", "16–30 موظفًا", "أكثر من 30 موظفًا"],
      },
      step4: {
        sendWhatsapp: "أفضّل واتساب",
        privacyNote:
          "بياناتكم تصل إلى creaDIG وتُستعمل حصرًا لمعالجة طلب الموعد هذا.",
        title: "المراجعة والإرسال",
        lead: "نقرة واحدة ويصل طلب موعدكم إلى بريدنا. وتصلكم فورًا رسالة استلام؛ أما الموعد نفسه فنؤكّده بشكل ملزِم في ردّنا. وإن كنتم تفضّلون واتساب فهو ممكن أيضًا.",
        send: "إرسال طلب الموعد",
        typeLabel: "نوع الحديث",
        dateLabel: "الأيام المفضّلة",
        timeLabel: "النوافذ الزمنية",
        langLabel: "اللغة",
      },
      done: {
        title: "استلمنا طلب الموعد.",
        lead: "طلب موعدكم في بريدنا، ورسالة الاستلام في طريقها إليكم. والموعد لم يُحجز بعد — نقارن أوقاتكم المفضّلة ونؤكّد لكم موعدًا ملزِمًا.",
        reply: "سنتواصل معكم خلال يومَي عمل",
        home: "العودة إلى الصفحة الرئيسية",
        again: "إرسال طلب موعد آخر",
      },
      waTitle: "creaDIG — طلب موعد",
      waType: "النوع",
      waDate: "الأيام المفضّلة",
      waTime: "النوافذ الزمنية",
      waName: "الاسم",
      waOrg: "الشركة",
      waCity: "المدينة",
      waPhone: "الهاتف",
      waInterest: "الاهتمام",
      waSize: "الحجم",
      waLang: "اللغة",
      waNote: "الرسالة",
      months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
      days: ["إث", "ثلا", "أرب", "خم", "جم", "سبت", "أحد"],
    },
    errorPages: {
      notFound: {
        metaTitle: "الصفحة غير موجودة",
        metaDescription:
          "هذا العنوان غير موجود. هذه طرق العودة إلى creaDIG — وطرق التواصل المباشر.",
        eyebrow: "خطأ 404",
        title: "هذه الصفحة غير موجودة.",
        lead: "إما أن العنوان تغيّر، وإما أن خطأً مطبعيًا تسلّل. وكلاهما يُصلَح بسرعة.",
      },
      serverError: {
        eyebrow: "خطأ 500",
        title: "حدث خلل هنا.",
        lead: "الخطأ منّا لا منكم. جرّبوا مرة أخرى — وإن استمر فيمكنكم الوصول إلينا مباشرةً.",
        retry: "المحاولة مرة أخرى",
      },
      waysLabel: "ثلاث طرق للعودة",
      ways: {
        home: { label: "الرئيسية", note: "نظرة عامة على البيت كله." },
        services: { label: "الخدمات", note: "خمس طبقات — من العلامة إلى الذكاء الاصطناعي." },
        contact: { label: "التواصل", note: "النموذج وواتساب وطريق الحديث." },
      },
      directLabel: "أو مباشرةً",
      directNote: "هذان الطريقان يعملان دائمًا — حتى حين يتعطّل النموذج.",
      whatsapp: "المراسلة عبر واتساب",
      mail: "كتابة بريد إلكتروني",
    },
    accessibility: {
      metaTitle: "بيان إتاحة الوصول",
      metaDescription:
        "حالة إتاحة الوصول في creadig.de: ما فحصناه، وما وجدناه وعالجناه، وما يبقى مفتوحًا — وكيف تُبلغوننا عن عائق.",
      eyebrow: "بيان إتاحة الوصول",
      title: "ما يستطيعه هذا الموقع — وما لا يستطيعه.",
      lead: "نحن نبيع إتاحة الوصول. لذلك نبدأ بأنفسنا: هذا الموقع مفحوص وفق WCAG 2.1 المستوى AA، والعيوب التي وُجدت عولجت، وما يبقى مفتوحًا مذكور أدناه. وهذا البيان طوعي.",
      voluntaryTitle: "طوعي، لا امتثال شكلي",
      voluntaryBody:
        "لم نُخضع لفحص قانوني ما إذا كان هذا الموقع يقع تحت قانون تعزيز إتاحة الوصول الألماني — ولذلك لا ندّعي ذلك. ننشر هذه الحالة لأن وكالةً تعرض إتاحة الوصول ينبغي أن تكشف موقعها هي. وهذا ليس تقييمًا قانونيًا.",
      statusTitle: "حالة التنفيذ",
      statusBody:
        "بعد جولة الفحص في 23 أغسطس 2026، عولجت كل العيوب الثمانية التي وُجدت. والجولة الآلية عبر 68 تمريرة (17 صفحة، مقاسا نافذة، مظهران فاتح وداكن) لا تُبلغ عن أي مخالفة قابلة للرصد آليًا لـ WCAG 2.1 AA. والفحص اليدوي — جولة لوحة المفاتيح، والأسماء المتاحة، والتركيز، والبنية — كذلك دون نقطة مفتوحة.",
      statusNote:
        "«لا مخالفة قابلة للرصد آليًا» لا تعني «متاح الوصول». الأدوات الآلية تجد جزءًا من العوائق فقط؛ لذلك يُذكر أدناه ما لم نفحصه.",
      checkedTitle: "ما الذي فُحص",
      checkedIntro:
        "اثنتا عشرة نقطة وفق WCAG 2.1 AA، في نسختَي اللغة، فاتحًا وداكنًا، على 1440 × 900 و390 × 844 بكسل:",
      checked: [
        "تباين النصوص وعناصر التحكم، في المظهرين",
        "النصوص البديلة للصور المعلوماتية؛ والرسوم الزخرفية مكتومة",
        "تسمية كل حقول النماذج، بما فيها القوائم المنسدلة ومربعات الموافقة",
        "رسائل الخطأ والحالة: منسوبة ومُعلَنة، لا باللون وحده",
        "إمكانية التشغيل الكامل دون فأرة، دون مصيدة لوحة مفاتيح",
        "تركيز مرئي على كل عنصر تحكم",
        "رابط التخطي، وبنية العناوين، والمعالم",
        "تعليم اللغة في كل نسخة لغوية",
        "السلوك مع «تقليل الحركة»، وعند تكبير 200٪ وعرض 320 بكسل",
      ],
      pagesLabel: "الصفحات المفحوصة",
      pagesBody:
        "الرئيسية، والخدمات وصفحة خدمة تفصيلية، والمنتجات وصفحة منتج تفصيلية، والأعمال، والشركة، والتواصل، ومساعد المواعيد (الخطوة 1 والخطوة 3)، والخصوصية، وبيانات الناشر، وصفحة الخطأ — كلٌّ بالألمانية والتركية.",
      fixedTitle: "ما الذي وُجد وعولج",
      fixedIntro:
        "ثمانية عيوب، لا شيء منها معطِّل، وسبعة مصنَّفة خطيرة. عولجت كلها في الشيفرة — دون طبقة تغطية ودون أداة إضافية:",
      fixed: [
        "ألوان نصوص بتباين غير كافٍ (وصولًا إلى 2,4 : 1 في النصوص النائبة)",
        "غياب التركيز المرئي عن ثلاثة عناصر تحكم في الشريط العلوي",
        "غياب رابط التخطي إلى المحتوى",
        "أيام التقويم في مساعد المواعيد دون اسم ذي دلالة",
        "تسميتان ألمانيتان بقيتا في النسخة التركية",
        "تغيير الخطوة في مساعد المواعيد لم يكن يُعلَن",
      ],
      fixedEarlier:
        "قبل ذلك، في جولة منفصلة: من فعّل «تقليل الحركة» في نظام التشغيل لم يكن يرى أجزاءً من الصفحة. الأقسام التي تظهر تدريجيًا كانت تبقى غير مرئية — 33 كتلة في صفحة واحدة. أخطر خطأ في هذا الموقع، وقد أصاب تحديدًا من صُنع هذا الإعداد لأجلهم.",
      openTitle: "قيود معروفة",
      openIntro: "ما لم نفحصه، وماذا يعني ذلك:",
      open: [
        "لا جولة مع مستخدم كفيف. فحصنا المتطلبات التقنية (الاسم والدور والحالة والإعلانات) — لا مدى وضوح النتيجة في الاستعمال اليومي.",
        "لا فحص ببرمجيات التكبير ولا فحص للتحكم الصوتي.",
        "يستند البيان إلى جولة فحص في تاريخ محدَّد. وكل تغيير في الموقع قد يكسر شيئًا؛ لذلك يعمل الجزء الآلي مع كل تغيير.",
        "الطرق الخارجية — واتساب وبرنامج البريد — خارج موقعنا. ولا نستطيع الضمان لإتاحة وصولها. لذلك يوجد لكل واحد منها طريقٌ على موقعنا أيضًا.",
      ],
      feedbackTitle: "الإبلاغ عن عائق",
      feedbackBody:
        "إن أعاقكم شيء في هذا الموقع فاكتبوا إلينا — بلا رسميات، ولو بجملة واحدة. نردّ خلال يومَي عمل ونقول إن كنا سنعالجه ومتى.",
      feedbackMail: "كتابة بريد إلكتروني",
      feedbackForm: "الإبلاغ عبر النموذج",
      feedbackNote:
        "مفيد لكن غير ضروري: أي صفحة، وأي عنصر، وأي تقنية مساعِدة تستعملون.",
      methodTitle: "كيف جرى الفحص",
      methodBody:
        "وفق إطار ثابت من اثنتي عشرة نقطة، ليصل شخصان مستقلان إلى النتيجة نفسها. آليًا بـ axe-core، ويدويًا بلوحة المفاتيح وفحص الأسماء المتاحة. والإطار والنتائج الكاملة مكشوفة في مصدر هذا الموقع.",
      updatedLabel: "الحالة بتاريخ",
      updated: "23 أغسطس 2026",
    },
    legal: {
      imprintTitle: "بيانات الناشر",
      privacyTitle: "الخصوصية",
      imprintMetaDescription: "بيانات مقدّم الخدمة ووسائل التواصل لدى creaDIG.",
      privacyMetaDescription:
        "لا تتبّع عبر المواقع، ولا ملفات تعريف ارتباط إعلانية، ولا تكوين ملفات شخصية. ما تعالجه creaDIG، ومن يفعل ذلك بتكليف منها، وكم يبقى.",
      back: "العودة إلى الموقع",
      providerLabel: "مقدّم الخدمة (المادة 5 DDG)",
      addressLabel: "العنوان",
      sameAddress: "العنوان كما هو أعلاه",
      formalLabel: "بيانات قانونية",
      legalFormLabel: "الشكل القانوني",
      vatLabel: "ضريبة القيمة المضافة",
      smallBusinessNote:
        "منشأة صغيرة وفق المادة 19 من قانون ضريبة القيمة المضافة — لا تُحتسب ضريبة.",
      mstvLabel: "المسؤول وفق المادة 18(2) MStV",
      placeholderMark: "عنصر نائب — يُستبدل قبل الإطلاق",
      taxStatusPending: "حالة ضريبة القيمة المضافة لم تُعتمد بعد.",
      phoneLabel: "الهاتف",
      phonePending: "رقم هاتف ألماني يتبع.",
      pending: "بانتظار التأكيد",
      pendingNote: "بيانان ما يزالان معلّقَين ومُعلَّمان أعلاه كعناصر نائبة: حالة ضريبة القيمة المضافة (رقم التعريف وفق المادة 27أ أو الإشارة إلى قاعدة المنشآت الصغيرة وفق المادة 19) ورقم الهاتف الألماني. سنضيفهما حالما يعتمدهما المالك. أما مقدّم الخدمة والعنوان والشكل القانوني والمسؤول وفق المادة 18(2) MStV ووسائل التواصل أعلاه فسارية بالفعل.",
      responsible: "المسؤول عن المحتوى",
      contactLabel: "التواصل",
      privacyIntro: "هذا الموقع مبنيّ خفيفًا عن قصد: لا تتبّع عبر المواقع، ولا ملفات تعريف ارتباط إعلانية، ولا تكوين ملفات شخصية. وما نستعمله مذكور أدناه بالاسم — وقياس الوصول لا يُحمَّل إلا بعد إذنكم.",
      processorsLabel: "من يعالج بتكليف منّا",
      processorsIntro:
        "مقدّمو الخدمات هؤلاء يعالجون بيانات شخصية لحسابنا — وفق تعليماتنا، وبموجب عقد معالجة بالإنابة (المادة 28 من اللائحة العامة لحماية البيانات)، ولأنهم في الولايات المتحدة فبضمان الشروط التعاقدية النموذجية للاتحاد الأوروبي وفق المادة 46(2)(ج). ولا نمرّر شيئًا أبعد من ذلك.",
      processorPurposeLabel: "الغرض",
      processorServicesLabel: "الخدمات",
      processorCountryLabel: "المقر",
      processorSafeguardLabel: "الأساس",
      processorSafeguardScc: "معالجة بالإنابة وفق المادة 28 + الشروط التعاقدية النموذجية للاتحاد الأوروبي",
      processorDpaLink: "عرض العقد",
      processorPendingMark: "تأكيد المالك معلّق",
      processorPendingNote:
        "العقود المُعلَّمة لم يؤكّدها المالك بعد ويحفظها في لوحة كل مزوّد. لذلك لا نكتب أنها قائمة — سنستدرك ذلك قبل الإطلاق.",
      processorPurposes: {
        vercel:
          "الاستضافة، وتسليم الموقع عبر شبكة توزيع المحتوى، وسجلات الخادم. وبعد موافقتكم إضافةً إلى ذلك قياسان منفصلان: Vercel Web Analytics (كم مرة تُفتح كل صفحة) وVercel Speed Insights (بأي سرعة تُحمَّل الصفحة في الزيارات الحقيقية). كلاهما دون ملفات تعريف ارتباط، لكنهما يعالجان عنوان IP ومسار الصفحة — ودون موافقة لا يُحمَّل أي سكربت.",
        resend:
          "تسليم رسائل نماذجنا إلى بريدنا، ورسالة الاستلام إليكم.",
      },
      privacyPoints: [
        {
          title: "سجلات الخادم",
          body: "عند فتح الموقع يعالج مضيفنا Vercel Inc. (الولايات المتحدة) بيانات لازمة تقنيًا مثل عنوان IP والوقت والمورد المطلوب. والأساس القانوني هو المادة 6(1)(و) — فبدون هذه المعالجة لا يمكن تسليم الموقع ولا تأمينه ضد إساءة الاستعمال. ومع Vercel عقد معالجة بالإنابة وفق المادة 28.",
        },
        {
          title: "الاستضافة والنقل إلى دول ثالثة",
          body: "هذا الموقع ثابت بالكامل ويُسلَّم عبر شبكة توزيع المحتوى العالمية لدى Vercel — من أقرب موقع في كل مرة. ولذلك لا يمكن استبعاد معالجة بيانات الوصول خارج الاتحاد الأوروبي، ولا سيما في الولايات المتحدة. وهي مضمونة بعقد المعالجة بالإنابة مع Vercel Inc. بما فيه الشروط التعاقدية النموذجية وفق المادة 46(2)(ج). ولا ندمج خدمات خرائط أو إعلانات، ونُسلّم كل الخطوط محليًا. ولقياس الوصول نستعمل Vercel Web Analytics وVercel Speed Insights — دون ملفات تعريف ارتباط، ودون معرّف عابر للأجهزة، وبعد موافقتكم الصريحة فقط؛ وبدونها لا يُحمَّل أي سكربت. وإن سلكتم طريق واتساب فتسري إضافةً إلى ذلك شروط Meta Platforms Ireland Ltd.",
        },
        {
          title: "نموذج التواصل والمواعيد واستفسارات المنتجات",
          body: "حين ترسلون أحد نماذجنا ننقل بياناتكم — الاسم والمنشأة والبريد والهاتف ورسالتكم — إلى بريدنا info@creadig.de ونرسل إليكم تأكيدًا. وللإرسال نستعمل Resend (Resend Inc.، الولايات المتحدة) كمعالج بالإنابة وفق المادة 28، بضمان الشروط التعاقدية النموذجية وفق المادة 46(2)(ج). والأساس القانوني هو موافقتكم وفق المادة 6(1)(أ)، التي تمنحونها صراحةً قبل الإرسال ويمكنكم سحبها في أي وقت بأثر مستقبلي. ونحن لا نحتفظ بقاعدة بيانات: طلبكم يوجد حصرًا في بريدنا الإلكتروني. وإن سلكتم طريق واتساب بدلًا من ذلك فتسري شروط Meta Platforms Ireland Ltd.",
          bodyStored:
            "حين ترسلون أحد نماذجنا ننقل بياناتكم — الاسم والمنشأة والبريد والهاتف ورسالتكم — إلى بريدنا info@creadig.de ونرسل إليكم تأكيدًا. وللإرسال نستعمل Resend (Resend Inc.، الولايات المتحدة) كمعالج بالإنابة وفق المادة 28، بضمان الشروط التعاقدية النموذجية وفق المادة 46(2)(ج). والأساس القانوني هو موافقتكم وفق المادة 6(1)(أ)، التي تمنحونها صراحةً قبل الإرسال ويمكنكم سحبها في أي وقت بأثر مستقبلي. ونحفظ طلبكم إضافةً إلى ذلك في قاعدة بيانات كي نتمكن من معالجته بموثوقية وتتبّع مرحلته. وتُشغّل قاعدة البيانات هذه شركة Neon, LLC كمعالج بالإنابة وفق المادة 28؛ والبيانات محفوظة في منطقة فرانكفورت (aws-eu-central-1). وإن لم يُبرَم عقد حذفنا طلبكم بعد 12 شهرًا من آخر تواصل. وإن سلكتم طريق واتساب بدلًا من ذلك فتسري شروط Meta Platforms Ireland Ltd.",
        },
        {
          title: "كم نحتفظ بالأشياء",
          body: "نحذف سجلات الخادم بعد 30 يومًا. ونحتفظ بالطلبات الواردة عبر نماذجنا حتى 6 أشهر بعد آخر تواصل ثم نحذفها؛ وإن نشأ عقد سرت مدد الحفظ التجارية والضريبية البالغة 6 و10 سنوات على التوالي (المادة 257 HGB والمادة 147 AO). وقراركم بشأن الموافقة يبقى في التخزين المحلي لمتصفحكم حتى تغيّروه أو تمسحوا بيانات المتصفح.",
        },
        {
          title: "الخطوط",
          body: "يُسلَّم خطّا Poppins وJetBrains Mono محليًا مع الموقع. ولا يوجد اتصال بـ Google Fonts؛ ولا يُنقل عنوان IP الخاص بكم لأي طرف ثالث لأجل ذلك.",
        },
        {
          title: "الموافقة والتخزين المحلي",
          body: "نحفظ قراركم من لافتة الموافقة في التخزين المحلي لمتصفحكم (المفتاح «creadig_consent»). وبموافقتكم فقط نتذكّر إضافةً إلى ذلك المظهر (فاتح/داكن)؛ ودون موافقة يسري هذا الإعداد للجلسة الحالية فقط. أما اللغة فلا نحفظها إطلاقًا — فهي في عنوان الصفحة. ولا تُنقل بذلك أي بيانات لأطراف ثالثة. ويمكنكم تعديل اختياركم أو سحبه في أي وقت تحت «إعدادات ملفات تعريف الارتباط» — وعند السحب نزيل المدخلات المعنية فورًا.",
        },
        {
          title: "حقوقكم",
          body: "لكم في أي وقت حق الوصول (المادة 15) والتصحيح (16) والمحو (17) وتقييد المعالجة (18) ونقل البيانات (20) والاعتراض (21). وتكفي رسالة إلى العنوان المذكور أدناه. وبصرف النظر عن ذلك لكم حق تقديم شكوى إلى سلطة إشراف على حماية البيانات (المادة 77) — والمختصة لمقرّنا هي مفوّضة حماية البيانات لولاية ساكسونيا السفلى.",
        },
      ],
      privacyNote: "ستخضع هذه النسخة لمراجعة قانونية نهائية مع بيانات الشركة الكاملة.",
    },
    consent: {
      title: "موافقتكم",
      intro:
        "هذا الموقع يحفظ فقط ما يحتاجه ليعمل — وما تسمحون به. أما كل ما ليس لازمًا تقنيًا فنحتاج فيه إلى موافقتكم.",
      minors:
        "إن كان عمركم دون 16 عامًا فيُرجى أخذ موافقة وليّ الأمر قبل السماح بالوظائف غير الضرورية.",
      privacyPrefix: "التفاصيل في",
      privacyLink: "سياسة الخصوصية",
      revoke:
        "يمكنكم تعديل اختياركم أو سحبه في أي وقت عبر «إعدادات ملفات تعريف الارتباط» في التذييل.",
      acceptAll: "قبول الكل",
      essentialOnly: "قبول الضروري فقط",
      customize: "تفضيلات خصوصية فردية",
      save: "حفظ الاختيار",
      alwaysActive: "مفعَّل دائمًا",
      thirdCountry:
        "قياس الوصول يجري عبر Vercel Inc. في الولايات المتحدة. وإن سمحتم به فأنتم توافقون صراحةً في الوقت نفسه على نقل بيانات وصولكم إلى هناك (المادة 49(1)(أ)) — إضافةً إلى الشروط التعاقدية النموذجية التي أبرمناها مع Vercel. ولا يسري في الولايات المتحدة مستوى حماية بيانات مكافئ للأوروبي: يمكن للسلطات طلب الوصول، وقد لا تتوفر سبل انتصاف فعّالة ضد ذلك. ودون موافقتكم لا يجري أي نقل.",
      settingsLabel: "إعدادات ملفات تعريف الارتباط",
      settingsTitle: "تفضيلات الخصوصية",
      close: "إغلاق",
      categories: {
        essential: {
          name: "ضروري",
          body: "يحفظ قراركم من هذه اللافتة فقط، كي لا نضطر للسؤال في كل زيارة. وبدون هذا الحفظ لا تعمل الموافقة نفسها.",
        },
        functional: {
          name: "الراحة",
          body: "يتذكّر المظهر (فاتح/داكن). ودون موافقة يسري اختياركم للجلسة الحالية فقط. أما اللغة فلا تُحفظ — فهي في العنوان (creadig.de للألمانية، وcreadig.de/tr للتركية، وcreadig.de/en للإنجليزية، وcreadig.de/ar للعربية).",
        },
        statistics: {
          name: "قياس الوصول",
          body: "Vercel Web Analytics وVercel Speed Insights — يقيسان بشكل مجهول كم مرة تُفتح كل صفحة، وهل نشأ استفسار، وبأي سرعة تحمّلت الصفحة لديكم. ولا تُوضع ملفات تعريف ارتباط ولا يُنشأ معرّف عابر للأجهزة. ودون موافقتكم لا يُحمَّل أي سكربت.",
        },
      },
    },
    footer: {
      tagline: "بيت أنظمة للهوية والرقمي والتشغيل والأتمتة والذكاء.",
      productsLabel: "المنتجات",
      navLabel: "الموقع",
      layersLabel: "خمس طبقات",
      legalLabel: "قانوني",
      imprint: "بيانات الناشر",
      privacy: "الخصوصية",
      socialLabel: "التواصل الاجتماعي",
      statusLabel: "حالة المواد",
      rights: "جميع الحقوق محفوظة.",
    },
  },
} as const

export type Dictionary = (typeof dictionary)["de"]

type IsPlainObject<T> = T extends object ? (T extends readonly unknown[] ? false : true) : false

/** Keys and nesting must match; leaf strings may differ (DE vs TR copy). */
type SameShape<A, B> = IsPlainObject<A> extends true
  ? IsPlainObject<B> extends true
    ? keyof A extends keyof B
      ? keyof B extends keyof A
        ? { [K in keyof A & keyof B]: SameShape<A[K], B[K]> }[keyof A & keyof B] extends true
          ? true
          : false
        : false
      : false
    : false
  : true

type AssertLocaleParity = SameShape<Dictionary, (typeof dictionary)["tr"]>
const _localeParity: AssertLocaleParity = true
void _localeParity

/*
 * Dasselbe Gate fuer Englisch. Es greift, obwohl "en" noch nicht in
 * `locales` steht — und genau deshalb ist es nuetzlich: Der Block laesst
 * sich nicht halbfertig liegen lassen, ohne dass `tsc` es meldet.
 */
type AssertEnParity = SameShape<Dictionary, (typeof dictionary)["en"]>
const _enParity: AssertEnParity = true
void _enParity

type AssertArParity = SameShape<Dictionary, (typeof dictionary)["ar"]>
const _arParity: AssertArParity = true
void _arParity
