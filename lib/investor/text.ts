import type { InvestorSprache } from "./store"

export type InvestorText = {
  dir: "ltr" | "rtl"
  vertraulich: string
  fuer: string
  titel: string
  lead: string
  thesenTitel: string
  thesen: { titel: string; text: string }[]
  liveTitel: string
  liveHinweis: string
  stand: string
  umsatz: string
  umsatzLeer: string
  wachstum: string
  wachstumLeer: string
  pipeline: string
  pipelineLeer: string
  agenten: string
  abteilungen: string
  von: string
  verlauf: string
  zahlenAus: string
  portfolioTitel: string
  portfolio: { name: string; art: string; text: string; markt: string }[]
  maerkteTitel: string
  maerkte: { region: string; rolle: string; text: string }[]
  wegTitel: string
  weg: { wann: string; was: string }[]
  angebotTitel: string
  angebot: string
  angebotPunkte: string[]
  kontaktTitel: string
  kontaktText: string
  kontaktKnopf: string
  fuss: string
  ungueltigTitel: string
  ungueltigText: string
}

const EN: InvestorText = {
  dir: "ltr",
  vertraulich: "Confidential · Personal invitation",
  fuer: "Prepared for",
  titel: "An AI-run technology house, built in Germany, ready for the Gulf.",
  lead: "creaDIG Solutions builds software and digital systems for businesses and Islamic institutions. The company runs on its own AI operating system: fifteen departments, AI employees doing the work, one founder making the decisions.",
  thesenTitel: "Why creaDIG",
  thesen: [
    { titel: "Proof, not slides", text: "Every number on this page is read live from our own finance and sales systems. Nothing is typed in by hand." },
    { titel: "AI as the operating model", text: "Sales research, outreach, follow-ups, project delivery, finance and reporting are run by AI agents. The founder approves; the system executes." },
    { titel: "A bridge few can build", text: "German engineering standards, Turkish delivery capacity and native Arabic product work under one roof — for companies and for Islamic institutions alike." },
  ],
  liveTitel: "Live from our systems",
  liveHinweis: "Read directly from creaDIG Finance and the sales pipeline on every visit.",
  stand: "As of",
  umsatz: "Revenue, last 12 months",
  umsatzLeer: "Being recorded",
  wachstum: "Growth, last 3 vs. prior 3 months",
  wachstumLeer: "Too early to compare",
  pipeline: "Open sales pipeline",
  pipelineLeer: "Being built",
  agenten: "AI employees at work",
  abteilungen: "Departments staffed",
  von: "of",
  verlauf: "Monthly revenue",
  zahlenAus: "Financial figures are shared in a personal conversation.",
  portfolioTitel: "Portfolio",
  portfolio: [
    { name: "fibero", art: "Vertical SaaS", text: "Field software for fibre-optic installation companies: surveys, photo documentation, house connections, billing.", markt: "Germany · Europe" },
    { name: "stammo", art: "Loyalty SaaS", text: "Digital stamp cards in Apple and Google Wallet that notice when regular guests stop coming.", markt: "Germany · France" },
    { name: "creaDIG Control Center", art: "AI operating system", text: "The system this company runs on — sales, projects, finance and communication with AI employees.", markt: "SMEs worldwide" },
    { name: "Islamic digital services", art: "Platforms", text: "Quran study with Arabic root reading, live donation broadcasting and management systems for mosques and associations.", markt: "Europe · Türkiye · Gulf" },
  ],
  maerkteTitel: "Three markets, three roles",
  maerkte: [
    { region: "Germany & Europe", rolle: "Proof and cash flow", text: "Paying customers, recurring revenue and references in the most demanding market." },
    { region: "Türkiye", rolle: "Delivery capacity", text: "Engineering and production strength at a cost advantage, plus a second home market." },
    { region: "Gulf states", rolle: "Capital and scale", text: "Strategic partners, investment and large institutional projects aligned with national AI and digital agendas." },
  ],
  wegTitel: "The next twelve months",
  weg: [
    { wann: "Q4 2026", was: "First recurring customers for fibero and stammo in Germany." },
    { wann: "Q1 2027", was: "Gulf presence: LEAP Riyadh, partner talks in Abu Dhabi and Dubai." },
    { wann: "Q2 2027", was: "Arabic product lines and a local partner in the region." },
    { wann: "Q3 2027", was: "Delivery team in Türkiye, first institutional project in the Gulf." },
  ],
  angebotTitel: "What we are looking for",
  angebot: "A strategic partner who opens doors in the Gulf and invests in growth.",
  angebotPunkte: ["Equity investment or strategic partnership", "Introductions to institutions, family offices and enterprises", "A local partner for presence in the UAE or Saudi Arabia"],
  kontaktTitel: "Talk to the founder",
  kontaktText: "Muhammed Emin Akyol, founder of creaDIG Solutions. Conversations in English, German, Turkish or Arabic.",
  kontaktKnopf: "Write to Emin",
  fuss: "This page is personal and confidential. Please do not forward the link.",
  ungueltigTitel: "This invitation is no longer active",
  ungueltigText: "The link has expired or was withdrawn. Please contact creaDIG Solutions for a new invitation.",
}

const AR: InvestorText = {
  dir: "rtl",
  vertraulich: "سرّي · دعوة شخصية",
  fuer: "أُعدّت خصيصًا لـ",
  titel: "بيت تقني يُدار بالذكاء الاصطناعي، تأسّس في ألمانيا، وجاهز للخليج.",
  lead: "تبني creaDIG Solutions البرمجيات والأنظمة الرقمية للشركات وللمؤسسات الإسلامية. وتعمل الشركة على نظام تشغيل ذكي خاص بها: خمسة عشر قسمًا، وموظفون من الذكاء الاصطناعي ينجزون العمل، ومؤسس واحد يتخذ القرار.",
  thesenTitel: "لماذا creaDIG",
  thesen: [
    { titel: "دليل لا عروض", text: "كل رقم في هذه الصفحة يُقرأ مباشرة من أنظمتنا المالية والبيعية. لا شيء يُكتب يدويًا." },
    { titel: "الذكاء الاصطناعي نموذجًا للتشغيل", text: "البحث عن العملاء والتواصل والمتابعة وتنفيذ المشاريع والمالية والتقارير تديرها وكلاء ذكية. المؤسس يوافق، والنظام ينفّذ." },
    { titel: "جسر قلّ من يبنيه", text: "معايير الهندسة الألمانية، وقدرة التنفيذ التركية، وعمل أصيل على المنتجات العربية تحت سقف واحد، للشركات وللمؤسسات الإسلامية معًا." },
  ],
  liveTitel: "مباشرة من أنظمتنا",
  liveHinweis: "تُقرأ مباشرة من النظام المالي ومسار المبيعات عند كل زيارة.",
  stand: "بتاريخ",
  umsatz: "الإيرادات خلال آخر 12 شهرًا",
  umsatzLeer: "قيد التسجيل",
  wachstum: "النمو: آخر 3 أشهر مقابل الثلاثة السابقة",
  wachstumLeer: "مبكر للمقارنة",
  pipeline: "فرص البيع المفتوحة",
  pipelineLeer: "قيد البناء",
  agenten: "موظفون من الذكاء الاصطناعي يعملون",
  abteilungen: "أقسام مشغولة",
  von: "من",
  verlauf: "الإيرادات الشهرية",
  zahlenAus: "تُعرض الأرقام المالية في لقاء شخصي.",
  portfolioTitel: "المحفظة",
  portfolio: [
    { name: "fibero", art: "برمجيات قطاعية", text: "برنامج ميداني لشركات تمديد الألياف الضوئية: المسح، والتوثيق بالصور، وتوصيلات المنازل، والفوترة.", markt: "ألمانيا · أوروبا" },
    { name: "stammo", art: "برنامج ولاء", text: "بطاقات ختم رقمية في Apple وGoogle Wallet تنبّه حين ينقطع الزبائن الدائمون.", markt: "ألمانيا · فرنسا" },
    { name: "creaDIG Control Center", art: "نظام تشغيل ذكي", text: "النظام الذي تعمل عليه هذه الشركة: المبيعات والمشاريع والمالية والتواصل مع موظفين من الذكاء الاصطناعي.", markt: "الشركات حول العالم" },
    { name: "خدمات رقمية إسلامية", art: "منصّات", text: "دراسة القرآن بقراءة الجذور العربية، وبثّ مباشر للتبرعات، وأنظمة إدارة للمساجد والجمعيات.", markt: "أوروبا · تركيا · الخليج" },
  ],
  maerkteTitel: "ثلاثة أسواق، ثلاثة أدوار",
  maerkte: [
    { region: "ألمانيا وأوروبا", rolle: "الدليل والتدفق النقدي", text: "عملاء يدفعون، وإيرادات متكررة، ومراجع في أكثر الأسواق تطلّبًا." },
    { region: "تركيا", rolle: "قدرة التنفيذ", text: "قوة هندسية وإنتاجية بتكلفة مناسبة، وسوق ثانية." },
    { region: "دول الخليج", rolle: "رأس المال والتوسّع", text: "شركاء استراتيجيون واستثمار ومشاريع مؤسسية كبرى تنسجم مع الرؤى الوطنية للذكاء الاصطناعي والتحول الرقمي." },
  ],
  wegTitel: "الأشهر الاثنا عشر القادمة",
  weg: [
    { wann: "الربع الرابع 2026", was: "أول عملاء بإيرادات متكررة لـ fibero وstammo في ألمانيا." },
    { wann: "الربع الأول 2027", was: "حضور في الخليج: LEAP الرياض، ومحادثات شراكة في أبوظبي ودبي." },
    { wann: "الربع الثاني 2027", was: "خطوط منتجات عربية وشريك محلي في المنطقة." },
    { wann: "الربع الثالث 2027", was: "فريق تنفيذ في تركيا، وأول مشروع مؤسسي في الخليج." },
  ],
  angebotTitel: "ما الذي نبحث عنه",
  angebot: "شريك استراتيجي يفتح الأبواب في الخليج ويستثمر في النمو.",
  angebotPunkte: ["استثمار في الحصص أو شراكة استراتيجية", "تعريف بالمؤسسات والمكاتب العائلية والشركات", "شريك محلي للحضور في الإمارات أو السعودية"],
  kontaktTitel: "تحدّث مع المؤسس",
  kontaktText: "محمد أمين أكيول، مؤسس creaDIG Solutions. المحادثة بالعربية أو الإنجليزية أو الألمانية أو التركية.",
  kontaktKnopf: "راسل أمين",
  fuss: "هذه الصفحة شخصية وسرّية. نرجو عدم مشاركة الرابط.",
  ungueltigTitel: "هذه الدعوة لم تعد فعّالة",
  ungueltigText: "انتهت صلاحية الرابط أو سُحب. يُرجى التواصل مع creaDIG Solutions للحصول على دعوة جديدة.",
}

const DE: InvestorText = {
  dir: "ltr",
  vertraulich: "Vertraulich · Persönliche Einladung",
  fuer: "Vorbereitet für",
  titel: "Ein KI-geführtes Technologiehaus, gebaut in Deutschland, bereit für den Golf.",
  lead: "creaDIG Solutions baut Software und digitale Systeme für Unternehmen und islamische Einrichtungen. Die Firma läuft auf ihrem eigenen KI-Betriebssystem: fünfzehn Abteilungen, KI-Mitarbeiter erledigen die Arbeit, ein Gründer entscheidet.",
  thesenTitel: "Warum creaDIG",
  thesen: [
    { titel: "Beweis statt Folien", text: "Jede Zahl auf dieser Seite wird live aus unseren Finanz- und Vertriebssystemen gelesen. Nichts ist von Hand eingetragen." },
    { titel: "KI als Betriebsmodell", text: "Kundensuche, Ansprache, Nachfassen, Projektlieferung, Finanzen und Berichte führen KI-Agenten. Der Gründer gibt frei, das System führt aus." },
    { titel: "Eine Brücke, die wenige bauen", text: "Deutsche Ingenieursstandards, türkische Lieferkraft und echte arabische Produktarbeit unter einem Dach, für Firmen wie für islamische Einrichtungen." },
  ],
  liveTitel: "Live aus unseren Systemen",
  liveHinweis: "Bei jedem Aufruf direkt aus creaDIG Finanz und der Vertriebspipeline gelesen.",
  stand: "Stand",
  umsatz: "Umsatz, letzte 12 Monate",
  umsatzLeer: "Wird erfasst",
  wachstum: "Wachstum, letzte 3 vs. vorherige 3 Monate",
  wachstumLeer: "Noch zu früh",
  pipeline: "Offene Vertriebspipeline",
  pipelineLeer: "Im Aufbau",
  agenten: "KI-Mitarbeiter im Einsatz",
  abteilungen: "Abteilungen besetzt",
  von: "von",
  verlauf: "Monatsumsatz",
  zahlenAus: "Finanzzahlen teilen wir im persönlichen Gespräch.",
  portfolioTitel: "Portfolio",
  portfolio: [
    { name: "fibero", art: "Vertikale SaaS", text: "Software für Glasfaser-Montagefirmen: Aufmaß, Fotodokumentation, Hausanschlüsse, Abrechnung.", markt: "Deutschland · Europa" },
    { name: "stammo", art: "Treue-SaaS", text: "Digitale Stempelkarten in Apple und Google Wallet, die merken, wenn Stammgäste wegbleiben.", markt: "Deutschland · Frankreich" },
    { name: "creaDIG Control Center", art: "KI-Betriebssystem", text: "Das System, auf dem diese Firma läuft: Vertrieb, Projekte, Finanzen und Kommunikation mit KI-Mitarbeitern.", markt: "KMU weltweit" },
    { name: "Islamische digitale Dienste", art: "Plattformen", text: "Koranstudium mit arabischer Wurzellesung, Live-Spendenübertragung und Verwaltungssysteme für Moscheen und Vereine.", markt: "Europa · Türkei · Golf" },
  ],
  maerkteTitel: "Drei Märkte, drei Rollen",
  maerkte: [
    { region: "Deutschland & Europa", rolle: "Beweis und Cashflow", text: "Zahlende Kunden, wiederkehrender Umsatz und Referenzen im anspruchsvollsten Markt." },
    { region: "Türkei", rolle: "Lieferkraft", text: "Entwicklungs- und Produktionsstärke mit Kostenvorteil, dazu ein zweiter Heimatmarkt." },
    { region: "Golfstaaten", rolle: "Kapital und Größe", text: "Strategische Partner, Investition und große institutionelle Projekte im Einklang mit den nationalen KI- und Digitalagenden." },
  ],
  wegTitel: "Die nächsten zwölf Monate",
  weg: [
    { wann: "Q4 2026", was: "Erste wiederkehrende Kunden für fibero und stammo in Deutschland." },
    { wann: "Q1 2027", was: "Präsenz am Golf: LEAP Riad, Partnergespräche in Abu Dhabi und Dubai." },
    { wann: "Q2 2027", was: "Arabische Produktlinien und ein lokaler Partner in der Region." },
    { wann: "Q3 2027", was: "Lieferteam in der Türkei, erstes institutionelles Projekt am Golf." },
  ],
  angebotTitel: "Was wir suchen",
  angebot: "Einen strategischen Partner, der am Golf Türen öffnet und in Wachstum investiert.",
  angebotPunkte: ["Beteiligung oder strategische Partnerschaft", "Zugang zu Institutionen, Family Offices und Unternehmen", "Ein lokaler Partner für Präsenz in den VAE oder Saudi-Arabien"],
  kontaktTitel: "Mit dem Gründer sprechen",
  kontaktText: "Muhammed Emin Akyol, Gründer von creaDIG Solutions. Gespräche auf Deutsch, Englisch, Türkisch oder Arabisch.",
  kontaktKnopf: "Emin schreiben",
  fuss: "Diese Seite ist persönlich und vertraulich. Bitte den Link nicht weitergeben.",
  ungueltigTitel: "Diese Einladung ist nicht mehr aktiv",
  ungueltigText: "Der Link ist abgelaufen oder wurde zurückgezogen. Bitte creaDIG Solutions für eine neue Einladung kontaktieren.",
}

export const INVESTOR_TEXT: Record<InvestorSprache, InvestorText> = { en: EN, ar: AR, de: DE }
