import type { Localized } from "@/lib/site-data"
import { serviceLayers } from "@/lib/site-data"
import type { Locale } from "@/lib/dictionary"

/**
 * MP-D · DER BETRIEBSCHECK — Daten, Fragen und Rechnung.
 *
 * ---------------------------------------------------------------------------
 * WAS ER IST UND WAS ER AUSDRUECKLICH NICHT IST
 * Er ist eine Selbsteinschaetzung: Der Besucher beantwortet fuenfzehn Fragen
 * ueber SEINEN Betrieb, und die Seite rechnet daraus eine Ordnung. Er ist
 * KEINE Pruefung, kein Scan, kein Audit — niemand hier sieht den Betrieb.
 *
 * Der Unterschied ist derselbe, den `quick-check.tsx` schon einmal getroffen
 * hat: Ein Knopf, der eine fremde Sache automatisch bewertet und eine Ampel
 * ausgibt, verspricht dasselbe wie ein Barrierefreiheits-Overlay — ein
 * Ergebnis, fuer das niemand geradesteht. Hier bewertet der Betrieb sich
 * selbst; die Seite ordnet nur, was er gesagt hat. Deshalb darf sie eine Zahl
 * nennen, ohne etwas zu behaupten.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIE FRAGEN SO KLINGEN
 * Keine Frage nennt ein Werkzeug, eine Technologie oder ein Kuerzel. Wer
 * „Nutzen Sie ein CRM?" fragt, bekommt die Antwort auf eine Vokabel, nicht
 * auf einen Zustand — und schliesst jeden aus, der das Wort nicht kennt,
 * obwohl er genau das Problem hat. Gefragt wird darum immer nach dem ALLTAG:
 * Sehen Sie den Stand? Tippen Sie zweimal? Findet ein Kollege den Vorgang?
 *
 * Jede Frage haengt an genau einer der fuenf Ebenen. Das ist der Punkt: Am
 * Ende steht nicht „Sie sind zu 62 % digital", sondern WO der Engpass liegt —
 * und weil die Ebenen aufeinander stehen, sagt die schwaechste zugleich,
 * welche darueber gerade nicht tragen kann.
 *
 * ---------------------------------------------------------------------------
 * DIE RECHNUNG IST ABSICHTLICH GROB
 * Drei Antworten (laeuft / teilweise / nicht), zwei Punkte, ein Punkt, null.
 * Fuenfzehn Fragen, dreissig Punkte, Prozent. Keine Gewichtung, keine
 * Nachkommastelle: Eine Selbsteinschaetzung, die auf 0,1 Prozent genau tut,
 * behauptet eine Genauigkeit, die sie nicht hat.
 */

export type CheckLayer = (typeof serviceLayers)[number]["key"]

export type CheckAnswerKey = "yes" | "partly" | "no"

export const CHECK_ANSWERS: { key: CheckAnswerKey; points: number; label: Localized }[] = [
  { key: "yes", points: 2, label: { de: "Läuft", tr: "Yürüyor" } },
  { key: "partly", points: 1, label: { de: "Teilweise", tr: "Kısmen" } },
  { key: "no", points: 0, label: { de: "Nicht", tr: "Hayır" } },
]

export const MAX_POINTS_PER_QUESTION = 2

export type CheckQuestion = {
  id: string
  layer: CheckLayer
  /** Als Zustand formuliert, nie als Werkzeug. */
  text: Localized
}

/**
 * Fuenfzehn Fragen, drei je Ebene. Die Reihenfolge ist die des Hauses:
 * Identity traegt Digital traegt Operations traegt Automation traegt
 * Intelligence.
 */
export const CHECK_QUESTIONS: CheckQuestion[] = [
  {
    id: "id-1",
    layer: "identity",
    text: {
      de: "Ihr Betrieb tritt überall gleich auf — Fahrzeug, Angebot, Rechnung, Website.",
      tr: "İşletmeniz her yerde aynı görünüyor — araç, teklif, fatura, web sitesi.",
    },
  },
  {
    id: "id-2",
    layer: "identity",
    text: {
      de: "Wer Sie zum ersten Mal sieht, versteht in zehn Sekunden, was Sie tun.",
      tr: "Sizi ilk kez gören, on saniyede ne yaptığınızı anlıyor.",
    },
  },
  {
    id: "id-3",
    layer: "identity",
    text: {
      de: "Logos, Farben und Vorlagen liegen an einer Stelle — nicht auf drei Rechnern.",
      tr: "Logolar, renkler ve şablonlar tek bir yerde — üç ayrı bilgisayarda değil.",
    },
  },

  {
    id: "dg-1",
    layer: "digital",
    text: {
      de: "Ihre Website ist so aktuell, dass Sie sie jemandem ungefragt schicken würden.",
      tr: "Web siteniz, birine çekinmeden gönderebileceğiniz kadar güncel.",
    },
  },
  {
    id: "dg-2",
    layer: "digital",
    text: {
      de: "Wer Ihre Leistung sucht, findet Sie — nicht nur, wer Ihren Namen schon kennt.",
      tr: "Hizmetinizi arayan sizi buluyor — sadece adınızı bilen değil.",
    },
  },
  {
    id: "dg-3",
    layer: "digital",
    text: {
      de: "Eine Anfrage kommt strukturiert bei Ihnen an, nicht als Zuruf zwischen Tür und Angel.",
      tr: "Gelen talep size düzenli ulaşıyor, iki iş arasında laf olarak değil.",
    },
  },

  {
    id: "op-1",
    layer: "operations",
    text: {
      de: "Sie sehen den Stand eines Auftrags, ohne jemanden anzurufen.",
      tr: "Bir işin durumunu kimseyi aramadan görebiliyorsunuz.",
    },
  },
  {
    id: "op-2",
    layer: "operations",
    text: {
      de: "Angebot, Auftrag und Rechnung hängen zusammen — dieselben Daten werden nicht zweimal getippt.",
      tr: "Teklif, iş emri ve fatura birbirine bağlı — aynı veri iki kez yazılmıyor.",
    },
  },
  {
    id: "op-3",
    layer: "operations",
    text: {
      de: "Fällt jemand aus, findet ein anderer den Vorgang ohne Rückfrage.",
      tr: "Biri olmadığında, bir başkası işi kimseye sormadan bulabiliyor.",
    },
  },

  {
    id: "au-1",
    layer: "automation",
    text: {
      de: "Wiederkehrende Schritte laufen ohne Sie — Erinnerungen, Bestätigungen, Übergaben.",
      tr: "Tekrar eden adımlar sizsiz yürüyor — hatırlatma, onay, devir.",
    },
  },
  {
    id: "au-2",
    layer: "automation",
    text: {
      de: "Zahlen aus dem Betrieb entstehen nebenbei, nicht am Monatsende in einer Tabelle.",
      tr: "İşletme rakamları iş akarken oluşuyor, ay sonunda bir tabloda değil.",
    },
  },
  {
    id: "au-3",
    layer: "automation",
    text: {
      de: "In den letzten sechs Monaten ist mindestens ein Handgriff dauerhaft weggefallen.",
      tr: "Son altı ayda en az bir el işi kalıcı olarak ortadan kalktı.",
    },
  },

  {
    id: "in-1",
    layer: "intelligence",
    text: {
      de: "Sie können sagen, welcher Auftragstyp bei Ihnen tatsächlich Geld bringt.",
      tr: "Hangi iş türünün gerçekten para kazandırdığını söyleyebiliyorsunuz.",
    },
  },
  {
    id: "in-2",
    layer: "intelligence",
    text: {
      de: "Entscheidungen stützen sich auf Zahlen, die Sie am selben Tag sehen — nicht auf ein Gefühl.",
      tr: "Kararlar aynı gün görebildiğiniz rakamlara dayanıyor — hisse değil.",
    },
  },
  {
    id: "in-3",
    layer: "intelligence",
    text: {
      de: "Ihre Systeme melden sich, bevor Sie fragen — Auslastung, Termine, Engpässe.",
      tr: "Sistemleriniz siz sormadan haber veriyor — doluluk, randevu, darboğaz.",
    },
  },
]

export const QUESTIONS_PER_LAYER = CHECK_QUESTIONS.length / serviceLayers.length

/* ==========================================================================
 * DIE RECHNUNG
 * ========================================================================== */

export type LayerResult = {
  key: CheckLayer
  level: string
  points: number
  maxPoints: number
  /** 0–100, ganzzahlig. */
  percent: number
}

export type CheckResult = {
  /** Gesamtscore 0–100, ganzzahlig. */
  score: number
  layers: LayerResult[]
  /** Die schwächste Ebene. Bei Gleichstand die untere — sie trägt die andere. */
  bottleneck: LayerResult
  /**
   * Die Ebene direkt über dem Engpass — die, die deshalb nicht tragen kann.
   * `null`, wenn der Engpass schon ganz oben liegt.
   */
  blocked: LayerResult | null
  /**
   * Wie viele Fragen mit „Nicht" beantwortet wurden. Das ist keine Schätzung:
   * Jede davon ist eine Stelle, die der Betrieb selbst als offen benannt hat.
   */
  manualSpots: number
  /** Wurden alle Fragen beantwortet? Vorher gibt es kein Ergebnis. */
  complete: boolean
  /**
   * Alle fuenf Ebenen gleich stark.
   *
   * Ohne dieses Feld behauptet die Seite auch dann einen Engpass, wenn es
   * keinen gibt: `bottleneck` ist immer gesetzt, weil eine Liste immer ein
   * Minimum hat. Bei fuenfmal 100 Prozent stand dort „Identity → Digital:
   * Solange Identity nicht traegt …" — ein Satz ueber eine Luecke, die der
   * Besucher gerade selbst als geschlossen gemeldet hat. Das ist genau die
   * Sorte Behauptung, die diese Seite nicht macht.
   */
  evenlyBalanced: boolean
}

export type CheckAnswers = Partial<Record<string, CheckAnswerKey>>

function pointsOf(answer: CheckAnswerKey | undefined): number {
  return CHECK_ANSWERS.find((option) => option.key === answer)?.points ?? 0
}

export function evaluateCheck(answers: CheckAnswers): CheckResult {
  const layers: LayerResult[] = serviceLayers.map((layer) => {
    const questions = CHECK_QUESTIONS.filter((question) => question.layer === layer.key)
    const points = questions.reduce((sum, question) => sum + pointsOf(answers[question.id]), 0)
    const maxPoints = questions.length * MAX_POINTS_PER_QUESTION
    return {
      key: layer.key,
      level: layer.level,
      points,
      maxPoints,
      percent: Math.round((points / maxPoints) * 100),
    }
  })

  const totalPoints = layers.reduce((sum, layer) => sum + layer.points, 0)
  const totalMax = layers.reduce((sum, layer) => sum + layer.maxPoints, 0)

  /*
   * Bei Gleichstand gewinnt die UNTERE Ebene. Das ist keine Willkür: Die
   * Ebenen stehen aufeinander, und eine Luecke unten macht jede Anstrengung
   * darueber teurer. `reduce` mit `<` statt `<=` behaelt darum den ersten
   * Fund — und die Liste ist von 01 nach 05 sortiert.
   */
  const bottleneck = layers.reduce((worst, layer) =>
    layer.percent < worst.percent ? layer : worst,
  )
  const bottleneckIndex = layers.findIndex((layer) => layer.key === bottleneck.key)
  const blocked = layers[bottleneckIndex + 1] ?? null

  const manualSpots = CHECK_QUESTIONS.filter(
    (question) => answers[question.id] === "no",
  ).length

  return {
    score: Math.round((totalPoints / totalMax) * 100),
    layers,
    bottleneck,
    blocked,
    manualSpots,
    evenlyBalanced: layers.every((layer) => layer.percent === layers[0].percent),
    complete: CHECK_QUESTIONS.every((question) => answers[question.id] !== undefined),
  }
}

/**
 * Die Zusammenfassung, die mit dem Lead ins Postfach geht.
 *
 * Sie steht bewusst als Klartext im `message`-Feld des bestehenden
 * Lead-Wegs — kein zweiter Endpunkt, keine zweite Ablage. Wer die Anfrage
 * liest, sieht dieselbe Ordnung, die der Absender auf dem Bildschirm hatte.
 */
export function checkSummary(
  result: CheckResult,
  answers: CheckAnswers,
  locale: Locale,
  layerName: (key: CheckLayer) => string,
): string {
  const head =
    locale === "tr"
      ? [
          `Betriebscheck sonucu: ${result.score}/100`,
          `Darboğaz: ${layerName(result.bottleneck.key)} (${result.bottleneck.percent}%)`,
          `„Hayır" sayısı: ${result.manualSpots}`,
        ]
      : [
          `Betriebscheck-Ergebnis: ${result.score}/100`,
          `Engpass: ${layerName(result.bottleneck.key)} (${result.bottleneck.percent} %)`,
          `Mit „Nicht" beantwortet: ${result.manualSpots}`,
        ]

  const perLayer = result.layers.map(
    (layer) => `  ${layer.level} ${layerName(layer.key)}: ${layer.percent} %`,
  )

  const detail = CHECK_QUESTIONS.map((question) => {
    const answer = CHECK_ANSWERS.find((option) => option.key === answers[question.id])
    return `  [${answer?.label[locale] ?? "—"}] ${question.text[locale]}`
  })

  return [...head, "", ...perLayer, "", ...detail].join("\n")
}

/* ==========================================================================
 * SEITENTEXTE
 *
 * Sie liegen hier und nicht im Woerterbuch — dieselbe Entscheidung wie bei
 * `site-data.ts` und `service-pages.ts`: Was zu einem Datensatz gehoert,
 * steht bei ihm. Beide Sprachen stehen nebeneinander, damit keine Fassung
 * unbemerkt zurueckfaellt.
 * ========================================================================== */

export const checkCopy = {
  metaTitle: {
    de: "Betriebscheck — wo Ihr Betrieb noch von Hand läuft | creaDIG",
    tr: "İşletme kontrolü — işletmeniz nerede hâlâ elle yürüyor | creaDIG",
  },
  metaDescription: {
    de: "Fünfzehn Fragen zu Ihrem Alltag, fünf Ebenen, ein Ergebnis: wo der Engpass liegt und was er kostet. Kostenlos, ohne Anmeldung.",
    tr: "Günlük işinize dair on beş soru, beş katman, tek sonuç: darboğaz nerede ve neye mal oluyor. Ücretsiz, kayıt gerekmez.",
  },
  eyebrow: { de: "Betriebscheck", tr: "İşletme kontrolü" },
  title: {
    de: "Ihr Betrieb läuft. Aber wie viel davon noch von Hand?",
    tr: "İşletmeniz yürüyor. Peki ne kadarı hâlâ elle?",
  },
  lead: {
    de: "Fünfzehn Fragen, fünf Ebenen, zwei Minuten. Am Ende sehen Sie, wo der Engpass liegt — und wie viele Stellen Sie selbst als offen benannt haben.",
    tr: "On beş soru, beş katman, iki dakika. Sonunda darboğazın nerede olduğunu ve kaç noktayı kendinizin açık olarak işaretlediğini görürsünüz.",
  },
  /* Die Ehrlichkeitszeile. Sie steht VOR dem Ergebnis, nicht im Kleingedruckten. */
  disclaimer: {
    de: "Das ist Ihre eigene Einschätzung, keine Prüfung — wir sehen Ihren Betrieb nicht. Die Seite ordnet nur, was Sie angegeben haben.",
    tr: "Bu sizin kendi değerlendirmeniz, bir denetim değil — işletmenizi görmüyoruz. Sayfa yalnızca verdiğiniz yanıtları düzenler.",
  },
  progress: {
    de: (done: number, total: number) => `${done} von ${total} beantwortet`,
    tr: (done: number, total: number) => `${total} sorudan ${done} tanesi yanıtlandı`,
  },
  resultTitle: { de: "Ihr Ergebnis", tr: "Sonucunuz" },
  showResult: { de: "Ergebnis zeigen", tr: "Sonucu göster" },
  scoreLabel: { de: "Gesamt", tr: "Toplam" },
  bottleneckLabel: { de: "Größte Lücke", tr: "En büyük boşluk" },
  bottleneckBlocked: {
    de: (weak: string, blocked: string) =>
      `${weak} → ${blocked}: Solange ${weak} nicht trägt, kostet jeder Schritt in ${blocked} mehr, als er müsste.`,
    tr: (weak: string, blocked: string) =>
      `${weak} → ${blocked}: ${weak} taşımadığı sürece, ${blocked} tarafındaki her adım olması gerekenden pahalıya gelir.`,
  },
  /* Wenn keine Ebene abfaellt, gibt es keine Luecke — und die Seite sagt das. */
  bottleneckEven: {
    de: "Keine Ebene fällt ab. Dann ist die Frage nicht, wo es klemmt, sondern was als Nächstes dazukommt.",
    tr: "Hiçbir katman geride kalmıyor. O hâlde soru nerede takıldığı değil, sırada ne olduğu.",
  },
  bottleneckEvenLabel: { de: "Kein Engpass", tr: "Darboğaz yok" },
  bottleneckTop: {
    de: (weak: string) =>
      `${weak} ist die schwächste Ebene — und die oberste. Darunter steht bereits etwas, auf dem sie aufbauen kann.`,
    tr: (weak: string) =>
      `${weak} en zayıf katman — ve en üstteki. Altında, üzerine kurulabileceği bir şey zaten var.`,
  },
  manualLabel: {
    de: (count: number) =>
      count === 1
        ? "1 Stelle haben Sie selbst als offen benannt."
        : `${count} Stellen haben Sie selbst als offen benannt.`,
    tr: (count: number) => `${count} noktayı kendiniz açık olarak işaretlediniz.`,
  },
  manualNone: {
    de: "Sie haben keine Stelle als offen benannt. Dann geht es nicht um Aufräumen, sondern um den nächsten Schritt.",
    tr: "Hiçbir noktayı açık olarak işaretlemediniz. O hâlde mesele toparlamak değil, bir sonraki adım.",
  },
  formTitle: {
    de: "Ergebnis besprechen",
    tr: "Sonucu konuşalım",
  },
  formHeadline: {
    de: "Zwanzig Minuten auf Ihre Antworten.",
    tr: "Yanıtlarınız üzerine yirmi dakika.",
  },
  formLead: {
    de: "Wenn Sie wollen, sehen wir uns die Antworten gemeinsam an — zwanzig Minuten, kostenlos, ohne Verpflichtung. Ihre Antworten kommen mit.",
    tr: "İsterseniz yanıtlara birlikte bakalım — yirmi dakika, ücretsiz, yükümlülük yok. Yanıtlarınız da gelir.",
  },
  nameLabel: { de: "Name", tr: "Ad" },
  businessLabel: { de: "Betrieb", tr: "İşletme" },
  emailLabel: { de: "E-Mail", tr: "E-posta" },
  phoneLabel: { de: "Telefon", tr: "Telefon" },
  submit: { de: "Ergebnis senden", tr: "Sonucu gönder" },
  sending: { de: "Wird gesendet …", tr: "Gönderiliyor …" },
  sentTitle: { de: "Angekommen.", tr: "Ulaştı." },
  sentBody: {
    de: "Ihre Antworten liegen bei uns. Wir melden uns innerhalb von zwei Werktagen — mit Ihrer Vorgangsnummer.",
    tr: "Yanıtlarınız bize ulaştı. İki iş günü içinde dönüş yaparız — işlem numaranızla birlikte.",
  },
  referenceLabel: { de: "Ihre Vorgangsnummer", tr: "İşlem numaranız" },
} as const
