import type { Locale } from "@/lib/dictionary"
import type { Localized } from "@/lib/site-data"

/**
 * System-Notes.
 *
 * ---------------------------------------------------------------------------
 * WAS DAS IST
 * Kein Blog im Marketing-Sinn. Notizen aus dem Bau: warum eine Entscheidung so
 * und nicht anders gefallen ist, was ein System im Betrieb gelehrt hat, welche
 * Annahme sich als falsch herausgestellt hat. Für ein Haus, das eigene
 * Produkte baut, ist das der einzige Inhaltstyp, der wirklich belegt ist —
 * alles andere wäre nacherzähltes Branchenwissen.
 *
 * ---------------------------------------------------------------------------
 * DIE LISTE WAR LEER — UND DAS WAR RICHTIG SO
 * Hier stand bis BF-A9: „Die Struktur steht, der Inhalt kommt vom Owner.“ Ein
 * Insights-Bereich mit drei erfundenen Beispielartikeln wäre in zehn Minuten
 * gebaut und das Erste gewesen, was ein Interessent als Fassade erkennt.
 *
 * Der erste Eintrag ist deshalb kein Meinungsstück, sondern ein Befund: die
 * Prüfung der eigenen Seite, mit den eigenen Mängeln und den Zahlen dazu.
 * Jede Angabe darin hat einen Beleg in `docs/barrierefreiheit-befund-eigen.md`
 * — steht sie dort nicht, steht sie auch hier nicht.
 *
 * Solange nichts veröffentlicht ist, nimmt sich die Route aus dem Suchindex
 * (`noindex, follow`) und aus der Sitemap. Das gilt weiter, für den Fall, dass
 * alle Einträge wieder auf `published: false` gehen.
 *
 * ---------------------------------------------------------------------------
 * SO KOMMT EIN EINTRAG DAZU
 * Beide Sprachen sind Pflicht — ein halb übersetzter Eintrag kommt gar nicht
 * erst ins Repo, dafür sorgt der Typ.
 */

/**
 * Ein Abschnitt im Fließtext.
 *
 * Bewusst vier Bausteine und kein Markdown-Parser: Ein Parser zöge eine
 * Abhängigkeit und die Freiheit ein, Markup in den Text zu schreiben — und
 * genau daraus entstehen halb formatierte Absätze, die in einer Sprache
 * anders aussehen als in der anderen. Vier Bausteine, beide Sprachen
 * derselbe Aufbau, keine Ausnahme.
 */
export type InsightBlock =
  | { kind: "heading"; text: Localized }
  | { kind: "text"; text: Localized }
  | { kind: "list"; items: Record<Locale, string[]> }
  /** Abgesetzt, für den Satz, der die Grenze zieht. */
  | { kind: "note"; text: Localized }

/**
 * MP10-4 — DIE KATEGORIEN.
 *
 * ---------------------------------------------------------------------------
 * WARUM SIE VOR DEN ARTIKELN KOMMEN
 * Ein Bereich mit einem Beitrag ist ein Zufall; ein Bereich mit sechs Faechern
 * und einem gefuellten Fach ist ein Anfang. Der Unterschied liegt nicht im
 * Inhalt, sondern darin, ob erkennbar ist, WORUEBER hier geschrieben wird —
 * und das laesst sich festlegen, bevor der zweite Text existiert.
 *
 * Die sechs Faecher sind nicht frei erfunden: Es sind die fuenf Ebenen des
 * Hauses, zusammengefasst auf das, worueber sich aus dem eigenen Betrieb
 * ueberhaupt etwas sagen laesst, plus „Praxis" fuer den Befund am eigenen
 * Objekt (dort liegt der erste Beitrag).
 *
 * ---------------------------------------------------------------------------
 * WAS DIE KATEGORIEN NICHT TUN
 * Sie erscheinen NICHT als leere Regalbretter auf der Seite. Ein Fach ohne
 * Beitrag ist eine „Demnaechst"-Kachel mit anderem Namen, und die hat dieser
 * Bereich schon einmal ausdruecklich abgelehnt (siehe den leeren Zustand in
 * `components/pages/insights-page-body.tsx`). Sichtbar sind nur Faecher, in
 * denen etwas steht; welche leer sind, sagt `/status` dem Owner.
 */
export const insightCategoryKeys = [
  "systems",
  "automation",
  "ai",
  "products",
  "betrieb",
  "praxis",
] as const

export type InsightCategoryKey = (typeof insightCategoryKeys)[number]

export type Insight = {
  slug: string
  /**
   * Das Fach, in dem der Beitrag steht. Pflicht — ein Beitrag ohne Fach
   * waere der Anfang einer Liste, die keine Struktur mehr hat.
   *
   * Nicht dasselbe wie `topic`: Das Fach ist das Regal (sechs Stueck, fest),
   * `topic` ist das Etikett auf dem Ruecken (zwei bis drei Worte, frei).
   */
  category: InsightCategoryKey
  /** Veröffentlichungsdatum, ISO (YYYY-MM-DD). Bestimmt die Reihenfolge. */
  date: string
  /** Einordnung in zwei bis drei Worten. */
  topic: Localized
  title: Localized
  /** Zwei bis drei Sätze — was drinsteht, nicht was drinstehen könnte. */
  teaser: Localized
  /** <title> der Detailseite — kürzer und suchnäher als der Titel. */
  metaTitle: Localized
  /** Der Text selbst. Leer heißt: Die Notiz hat keine eigene Seite. */
  body: InsightBlock[]
  /** Auf `false` verschwindet der Eintrag aus Liste UND Sitemap. */
  published: boolean
}

export const insights: Insight[] = [
  {
    /*
     * BF-A9 — der Beleg statt des Versprechens.
     *
     * -----------------------------------------------------------------------
     * WARUM DAS DER ERSTE ARTIKEL IST
     * Wir verkaufen ab jetzt Barrierefreiheit. Der erste Satz, den ein
     * Interessent dazu von uns liest, darf deshalb keine Behauptung sein,
     * sondern muss ein Befund am eigenen Objekt sein — mit den eigenen
     * Mängeln, nicht mit den Mängeln anonymer Anderer.
     *
     * -----------------------------------------------------------------------
     * WAS HIER NICHT STEHT
     * Kein Kundenname (keine Referenz ohne schriftliche Freigabe), keine
     * Bussgeldzahl, keine Frist als Druckmittel, kein "rechtssicher". Und
     * keine Selbstbeweihraeucherung: Der Text nennt acht eigene Maengel, den
     * schwersten aus einem frueheren Durchgang und einen Messfehler, der uns
     * beinahe als Ergebnis durchgegangen waere.
     */
    slug: "eigene-seite-geprueft",
    /* Praxis: ein Befund am eigenen Objekt, keine Ebenen-Lehre. */
    category: "praxis",
    date: "2026-08-23",
    topic: { de: "Barrierefreiheit", tr: "Erişilebilirlik", en: "Accessibility" },
    title: {
      de: "Wir haben unsere eigene Seite geprüft. Acht Mängel.",
      tr: "Kendi sitemizi denetledik. Sekiz eksik.",
      en: "We audited our own site. Eight defects.",
    },
    metaTitle: {
      de: "Eigene Website auf Barrierefreiheit geprüft — der Befund",
      tr: "Kendi sitemizi erişilebilirlik için denetledik — bulgular",
      en: "Auditing our own website for accessibility — the findings",
    },
    teaser: {
      de: "Bevor wir Barrierefreiheit anbieten, haben wir creadig.de nach dem eigenen 12-Punkte-Raster geprüft. Acht Mängel, sieben davon erheblich. Was wir gefunden haben, wie wir es behoben haben — und der Messfehler, der uns fast als Ergebnis durchgegangen wäre.",
      tr: "Erişilebilirliği sunmadan önce creadig.de'yi kendi 12 maddelik şablonumuzla denetledik. Sekiz eksik, yedisi ciddi. Ne bulduk, nasıl giderdik — ve neredeyse sonuç diye kabul edeceğimiz ölçüm hatası.",
      en: "Before offering accessibility as a service, we audited creadig.de against our own 12-point framework. Eight defects, seven of them serious. What we found, how we fixed it — and the measurement error that almost passed as a result.",
    },
    body: [
      {
        kind: "text",
        text: {
          de: "Wer Barrierefreiheit verkauft und sie selbst nicht liefert, verliert das Gespräch im ersten Satz. Also haben wir am 23. August 2026 unsere eigene Seite geprüft — nach demselben Raster, das wir bei Kunden anlegen, und mit demselben Ergebnisbericht. Dieser Text ist die Kurzfassung. Der vollständige Befund liegt offen im Quelltext dieser Seite.",
          tr: "Erişilebilirlik satıp kendi sitesinde sunmayan, konuşmayı ilk cümlede kaybeder. Bu yüzden 23 Ağustos 2026'da kendi sitemizi denetledik — müşterilerde uyguladığımız şablonun aynısıyla ve aynı rapor biçimiyle. Bu yazı özetidir; bulgunun tamamı bu sitenin kaynak kodunda açıkta durur.",
          en: "Anyone who sells accessibility and does not deliver it on their own site loses the conversation in the first sentence. So on 23 August 2026 we audited our own site — against the same framework we apply for clients, and with the same findings report. This text is the short version. The full findings are open in the source of this site.",
        },
      },
      { kind: "heading", text: { de: "Was geprüft wurde", tr: "Ne denetlendi", en: "What was audited" } },
      {
        kind: "text",
        text: {
          de: "Siebzehn Routen in beiden Sprachen, in heller und dunkler Fassung, auf 1440 × 900 und 390 × 844 Pixeln: 68 automatisierte Durchläufe mit axe-core über WCAG 2.1 A und AA. Dazu von Hand, was eine Maschine nicht entscheiden kann — der ganze Weg mit der Tastatur, die zugänglichen Namen aller Bedienelemente, die Überschriften- und Landmark-Struktur, das Verhalten des Termin-Assistenten beim Schrittwechsel.",
          tr: "Her iki dilde on yedi rota, açık ve koyu görünümde, 1440 × 900 ve 390 × 844 piksel pencerede: axe-core ile WCAG 2.1 A ve AA üzerinden 68 otomatik geçiş. Buna ek olarak, bir makinenin karara bağlayamayacağı her şey elle — klavyeyle baştan sona yol, tüm öğelerin erişilebilir adları, başlık ve landmark yapısı, randevu asistanının adım değiştirirken davranışı.",
          en: "Seventeen routes in both languages, in light and dark appearance, at 1440 × 900 and 390 × 844 pixels: 68 automated passes with axe-core across WCAG 2.1 A and AA. Plus, by hand, whatever a machine cannot decide — the whole path with the keyboard, the accessible names of every control, the heading and landmark structure, the behaviour of the appointment assistant when the step changes.",
        },
      },
      {
        kind: "text",
        text: {
          de: "Ergebnis: acht Befunde, sieben davon erheblich, keiner blockierend. Jede Funktion war erreichbar — an sieben Stellen aber deutlich erschwert. Drei davon stehen hier, weil sie das Muster zeigen.",
          tr: "Sonuç: sekiz bulgu, yedisi ciddi, hiçbiri engelleyici değil. Her işlev erişilebilirdi — ama yedi yerde belirgin biçimde zorlaştırılmıştı. Üçü burada, çünkü örüntüyü onlar gösteriyor.",
          en: "Result: eight findings, seven of them serious, none blocking. Every function was reachable — but at seven points made considerably harder. Three of them are here because they show the pattern.",
        },
      },
      {
        kind: "heading",
        text: { de: "1 · Der Fokus war unsichtbar", tr: "1 · Odak görünmüyordu", en: "1 · The focus was invisible" },
      },
      {
        kind: "text",
        text: {
          de: "Drei Bedienelemente in der Kopfleiste — Sprachumschalter, Erscheinungsbild, WhatsApp — zeigten beim Durchtabben keinen sichtbaren Umriss. Gemessen: outline-style „none“, kein Schatten, nichts. Sie stehen auf jeder Seite. Die Ursache war keine vergessene Regel, sondern eine, die verlor: Die globale Vorgabe für den Fokus stand in einer Kaskadenschicht und wurde von einer Utility-Klasse überschrieben, die den Umriss abschaltet und durch einen Ring ersetzt, den diese Farbpalette nicht zeichnet. Behoben, indem die Fokus-Regel jetzt außerhalb jeder Schicht steht. Nachgemessen: 2 beziehungsweise 3 Pixel durchgezogen, alle drei sichtbar. (WCAG 2.4.7)",
          tr: "Üst çubuktaki üç öğe — dil değiştirici, görünüm değiştirici, WhatsApp — sekmeyle gezerken görünür bir çerçeve göstermiyordu. Ölçüm: outline-style „none“, gölge yok, hiçbir şey yok. Bu öğeler her sayfada duruyor. Neden, unutulmuş bir kural değil, kaybeden bir kuraldı: Odak için genel tanım bir katman içindeydi ve çerçeveyi kapatıp yerine bu renk paletinin çizmediği bir halka koyan bir utility sınıfı tarafından eziliyordu. Odak kuralı artık hiçbir katmanın içinde değil. Yeniden ölçüldü: 2 ve 3 piksel düz çizgi, üçü de görünür. (WCAG 2.4.7)",
          en: "Three controls in the header — language switcher, appearance, WhatsApp — showed no visible outline when tabbed through. Measured: outline-style “none”, no shadow, nothing. They appear on every page. The cause was not a forgotten rule but one that lost: the global focus definition sat in a cascade layer and was overridden by a utility class that switches the outline off and replaces it with a ring this colour palette does not draw. Fixed by putting the focus rule outside any layer. Measured again: 2 and 3 pixels solid, all three visible. (WCAG 2.4.7)",
        },
      },
      {
        kind: "heading",
        text: { de: "2 · Acht Stationen bis zum Inhalt", tr: "2 · İçeriğe kadar sekiz durak", en: "2 · Eight stops before the content" },
      },
      {
        kind: "text",
        text: {
          de: "Es gab keine Sprungmarke. Wer nur mit der Tastatur arbeitet, landete zuerst auf dem Logo, danach auf vier Menüpunkten, dem Sprachumschalter, dem Erscheinungsbild-Schalter, WhatsApp und dem Hauptknopf — acht Stationen, auf jeder Seite erneut, bevor der Inhalt anfing. Das ist kein Schönheitsfehler; es ist der Unterschied zwischen einer Seite, die man benutzt, und einer, die man verlässt. Jetzt ist die Sprungmarke die erste Station, sie ist sichtbar, sobald sie den Fokus hat, und sie setzt ihn auf den Inhalt. (WCAG 2.4.1)",
          tr: "Atlama bağlantısı yoktu. Yalnızca klavyeyle çalışan biri önce logoya, ardından dört menü maddesine, dil değiştiriciye, görünüm değiştiriciye, WhatsApp'a ve ana düğmeye düşüyordu — içerik başlamadan önce, her sayfada yeniden sekiz durak. Bu bir güzellik kusuru değil; kullanılan bir siteyle terk edilen bir site arasındaki fark. Artık atlama bağlantısı ilk duraktır, odağı aldığı anda görünür olur ve odağı içeriğe taşır. (WCAG 2.4.1)",
          en: "There was no skip link. Anyone working with the keyboard alone landed first on the logo, then on four menu items, the language switcher, the appearance switch, WhatsApp and the main button — eight stops, on every page again, before the content began. That is not a cosmetic flaw; it is the difference between a site people use and one they leave. The skip link is now the first stop, it is visible as soon as it has focus, and it moves focus to the content. (WCAG 2.4.1)",
        },
      },
      {
        kind: "heading",
        text: {
          de: "3 · „Weiter“ drücken und Stille hören",
          tr: "3 · „İleri“ye basıp sessizlik duymak",
          en: "3 · Pressing “next” and hearing silence",
        },
      },
      {
        kind: "text",
        text: {
          de: "Im Termin-Assistenten tauschte ein Klick auf „Weiter“ den Inhalt aus, scrollte nach oben — und setzte den Fokus nicht. Gemessen landete er auf dem Dokumentkörper. Für einen Tastaturnutzer heißt das: wieder ganz vorn anfangen. Für einen Screenreader-Nutzer heißt es: gar nichts. Es gab auf der ganzen Seite keine einzige Region, die eine Änderung angesagt hätte. Man drückte „Weiter“ und hörte Stille. Jetzt wandert der Fokus auf die Überschrift des neuen Schritts, und eine höflich vorlesende Region sagt an, welcher Schritt von wie vielen begonnen hat. (WCAG 4.1.3, 2.4.3)",
          tr: "Randevu asistanında „İleri“ye tıklamak içeriği değiştiriyor, sayfayı yukarı kaydırıyor — ama odağı taşımıyordu. Ölçümde odak belge gövdesine düşüyordu. Klavye kullanan biri için bu, baştan başlamak demek. Ekran okuyucu kullanan biri içinse hiçbir şey demek: Sitenin tamamında bir değişikliği duyuran tek bir bölge yoktu. „İleri“ye basılıyor ve sessizlik duyuluyordu. Artık odak yeni adımın başlığına gider ve nazikçe okuyan bir bölge, kaç adımdan hangisinin başladığını duyurur. (WCAG 4.1.3, 2.4.3)",
          en: "In the appointment assistant, clicking “next” swapped the content, scrolled to the top — and did not move the focus. Measured, it landed on the document body. For a keyboard user that means starting from the front again. For a screen reader user it means nothing at all: there was not a single region on the whole site that would have announced a change. You pressed “next” and heard silence. Now the focus moves to the heading of the new step, and a politely announcing region says which step of how many has begun. (WCAG 4.1.3, 2.4.3)",
        },
      },
      { kind: "heading", text: { de: "Die übrigen fünf", tr: "Kalan beşi", en: "The remaining five" } },
      {
        kind: "list",
        items: {
          de: [
            "Die goldene Textfarbe unterschritt auf getönten Flächen an fünf Stellen den geforderten Kontrast — Werte zwischen 4,26 und 4,34 zu 1, nötig sind 4,5.",
            "Textfarben mit 70 und 80 Prozent Deckkraft: bis herunter auf 2,85 zu 1 in der hellen Fassung, sieben Stellen im Code.",
            "Platzhalter in Formularfeldern mit 60 Prozent Deckkraft: 2,40 zu 1. Von der Maschine nicht gemeldet, weil ein Platzhalter nur im leeren Feld sichtbar ist — von Hand gefunden.",
            "Die 31 Kalendertage im Termin-Assistenten hießen für einen Screenreader nur „31, Schaltfläche“ — ohne Wochentag, ohne Monat, ohne den Zustand „gewählt“.",
            "Auf der türkischen Terminseite waren zwei Beschriftungen deutsch geblieben, hart im Markup statt aus dem Wörterbuch. Ein türkischer Screenreader liest „Nächster Monat“ mit türkischer Aussprache — das Ergebnis versteht niemand.",
          ],
          tr: [
            "Altın metin rengi, tonlu zeminlerde beş yerde gereken kontrastın altında kaldı — 4,26 ile 4,34'e 1 arası değerler, gereken 4,5.",
            "Yüzde 70 ve 80 opaklıkla kullanılan metin renkleri: açık görünümde 2,85'e 1'e kadar iniyordu, kodda yedi yer.",
            "Form alanlarındaki yer tutucular yüzde 60 opaklıkla: 2,40'a 1. Makine bildirmedi, çünkü yer tutucu yalnızca boş alanda görünür — elle bulundu.",
            "Randevu asistanındaki 31 takvim günü, ekran okuyucu için yalnızca „31, düğme“ adını taşıyordu — gün adı yok, ay yok, „seçili“ durumu yok.",
            "Türkçe randevu sayfasında iki etiket Almanca kalmıştı; sözlükten değil, doğrudan koddan geliyordu. Türkçe bir ekran okuyucu „Nächster Monat“ ifadesini Türkçe telaffuzla okur — çıkan sesi kimse anlamaz.",
          ],
          en: [
            "The golden text colour fell below the required contrast on tinted surfaces at five points — values between 4.26 and 4.34 to 1, where 4.5 is needed.",
            "Text colours at 70 and 80 per cent opacity: down to 2.85 to 1 in the light appearance, seven places in the code.",
            "Placeholders in form fields at 60 per cent opacity: 2.40 to 1. Not reported by the machine, because a placeholder is only visible in an empty field — found by hand.",
            "For a screen reader, the 31 calendar days in the appointment assistant were named only “31, button” — no weekday, no month, no “selected” state.",
            "On the Turkish appointment page two labels had stayed German, hard-coded in the markup instead of coming from the dictionary. A Turkish screen reader reads “Nächster Monat” with Turkish pronunciation — nobody understands the result.",
          ],
        },
      },
      {
        kind: "heading",
        text: { de: "Der schwerste Fehler war älter", tr: "En ağır hata daha eskiydi", en: "The most serious defect was older" },
      },
      {
        kind: "text",
        text: {
          de: "Er stammt aus einem Durchgang davor und gehört trotzdem hierher: Wer im Betriebssystem „Bewegung reduzieren“ eingeschaltet hatte, sah Teile der Seite gar nicht. Die eingeblendeten Abschnitte blieben unsichtbar — auf der Leistungsübersicht 33 Blöcke. Die Seite war leer für genau die Gruppe, für die diese Einstellung gemacht ist. Ein Befund, der die eigene Vorgeschichte verschweigt, ist weniger wert als einer, der sie nennt.",
          tr: "Bir önceki turdan kalma, yine de buraya ait: İşletim sisteminde „hareketi azalt“ seçeneğini açmış olan biri, sayfanın bir bölümünü hiç görmüyordu. Kaydırınca beliren bölümler görünmez kalıyordu — hizmetler sayfasında 33 blok. Sayfa, tam da bu ayarın kendisi için yapıldığı grup için boştu. Kendi geçmişini gizleyen bir bulgu, onu söyleyenden daha az değerlidir.",
          en: "It comes from an earlier pass and belongs here nonetheless: anyone who had switched on “reduce motion” in their operating system did not see parts of the site at all. Sections that fade in stayed invisible — 33 blocks on the services overview. The page was empty for exactly the group the setting is made for. A findings report that hides its own history is worth less than one that names it.",
        },
      },
      {
        kind: "heading",
        text: { de: "Und ein Messfehler", tr: "Ve bir ölçüm hatası", en: "And a measurement error" },
      },
      {
        kind: "text",
        text: {
          de: "Nach der Behebung meldete die Maschine noch zwei Kontrastwerte — beide auf Seiten, deren deutsche Zwillingsseite bei identischem Markup bestand. Die Ursache lag nicht in der Seite, sondern in der Messung: Der Prüflauf traf die eingeblendeten Abschnitte mitten in der 0,9 Sekunden langen Animation und maß eine halb durchsichtige Fläche — einen Zustand, den ein Mensch nie zu Gesicht bekommt. Der Lauf misst jetzt mit reduzierter Bewegung, also den Endzustand. Es wäre bequem gewesen, die beiden Werte als Ausreißer abzuhaken. Ein Befund, der Messfehler als Ergebnis ausgibt, ist genauso falsch wie einer, der Funde verschweigt.",
          tr: "Giderme sonrasında makine hâlâ iki kontrast değeri bildiriyordu — ikisi de, Almanca ikizi aynı kodla geçen sayfalarda. Neden sayfada değil, ölçümdeydi: Denetim geçişi, beliren bölümleri 0,9 saniyelik animasyonun ortasında yakalıyor ve yarı saydam bir yüzeyi ölçüyordu — bir insanın hiçbir zaman görmediği bir durumu. Geçiş artık hareketi azaltılmış biçimde, yani son durumu ölçüyor. İki değeri „sapma“ diye geçiştirmek kolay olurdu. Ölçüm hatasını sonuç diye sunan bir bulgu, bulguları gizleyen kadar yanlıştır.",
          en: "After remediation the machine still reported two contrast values — both on pages whose German twin passed with identical markup. The cause was not in the page but in the measurement: the audit run caught the fading sections in the middle of the 0.9-second animation and measured a semi-transparent surface — a state no person ever sees. The run now measures with reduced motion, that is, the final state. It would have been convenient to write the two values off as outliers. A findings report that presents a measurement error as a result is exactly as wrong as one that hides findings.",
        },
      },
      {
        kind: "heading",
        text: { de: "Was das heißt — und was nicht", tr: "Bu ne demek — ve ne demek değil", en: "What that means — and what it does not" },
      },
      {
        kind: "text",
        text: {
          de: "Alle acht Mängel sind behoben, im Code, ohne Overlay und ohne Zusatzwerkzeug. Der automatisierte Lauf meldet über 68 Durchläufe keine maschinell feststellbare Verletzung von WCAG 2.1 AA mehr; vorher waren es elf Stellen. Die Handprüfung ist ohne offenen Punkt.",
          tr: "Sekiz eksiğin tamamı giderildi — kodun içinde, overlay olmadan, ek araç olmadan. Otomatik geçiş, 68 turda WCAG 2.1 AA'nın makineyle saptanabilir hiçbir ihlalini bildirmiyor; öncesinde on bir yer vardı. Elle denetimde açık madde yok.",
          en: "All eight defects are fixed, in the code, without an overlay and without an add-on tool. Across 68 passes the automated run now reports no machine-detectable violation of WCAG 2.1 AA; before, there were eleven places. The manual review has no open item.",
        },
      },
      {
        kind: "note",
        text: {
          de: "„Keine maschinell feststellbare Verletzung“ heißt nicht „barrierefrei“. Automatische Werkzeuge finden nach Angabe ihrer eigenen Entwickler etwa ein Drittel der Barrieren. Wir haben keinen Durchlauf mit einem blinden Nutzer gemacht, keine Vergrößerungssoftware und keine Sprachsteuerung geprüft. Und dieser Text ist keine rechtliche Bewertung — die trifft ein Anwalt, nicht wir.",
          tr: "„Makineyle saptanabilir ihlal yok“, „erişilebilir“ demek değildir. Otomatik araçlar, kendi geliştiricilerinin beyanına göre engellerin yaklaşık üçte birini bulur. Görme engelli bir kullanıcıyla bir geçiş yapmadık, büyütme yazılımını ve sesle kullanımı denetlemedik. Ve bu yazı hukuki bir değerlendirme değildir — onu bir avukat yapar, biz değil.",
          en: "“No machine-detectable violation” does not mean “accessible”. By their own developers' account, automated tools find about a third of barriers. We did no pass with a blind user, tested no magnification software and no voice control. And this text is not a legal assessment — a lawyer makes that, not us.",
        },
      },
      {
        kind: "text",
        text: {
          de: "Das ist der Grund, warum wir keinen automatischen Scanner auf diese Website stellen, obwohl er das beste Lockmittel wäre: Eine Ampel, die eine Maschine über eine fremde Seite hängt, verspricht dasselbe wie ein Overlay — ein Ergebnis, für das niemand geradesteht. Wer eine Ampel verkauft, kann nicht erklären, warum die Ampel des Nachbarn nichts taugt.",
          tr: "Bu yüzden, en iyi cezbedici olmasına rağmen bu siteye otomatik bir tarayıcı koymuyoruz: Bir makinenin yabancı bir sitenin üstüne astığı ışık, overlay ile aynı şeyi vaat eder — kimsenin arkasında durmadığı bir sonuç. Işık satan biri, komşunun ışığının neden işe yaramadığını açıklayamaz.",
          en: "That is why we do not put an automated scanner on this website, although it would be the best lure: a traffic light that a machine hangs over somebody else's page promises the same as an overlay — a result nobody stands behind. Anyone selling a traffic light cannot explain why the neighbour's traffic light is worthless.",
        },
      },
    ],
    published: true,
  },
]

/** Nur Veröffentlichtes verlässt die Datei — neueste zuerst. */
export const publishedInsights = insights
  .filter((entry) => entry.published)
  .sort((a, b) => b.date.localeCompare(a.date))

/** Nur Einträge mit Fließtext bekommen eine eigene Seite. */
export const readableInsights = publishedInsights.filter((entry) => entry.body.length > 0)

export function findInsight(slug: string) {
  return readableInsights.find((entry) => entry.slug === slug)
}

/** Beitraege eines Fachs, neueste zuerst. */
export function insightsInCategory(key: InsightCategoryKey) {
  return publishedInsights.filter((entry) => entry.category === key)
}

/**
 * Nur Faecher, in denen etwas steht — in der festen Reihenfolge oben, damit
 * die Leiste nicht bei jedem neuen Beitrag umspringt.
 */
export const filledInsightCategories = insightCategoryKeys.filter(
  (key) => insightsInCategory(key).length > 0,
)

/** Was der Owner noch fuellen muss. Wird auf `/status` gelesen. */
export const emptyInsightCategories = insightCategoryKeys.filter(
  (key) => insightsInCategory(key).length === 0,
)
