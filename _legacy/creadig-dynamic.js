/**
 * creaDIG — dynamic UI strings (MEAI terminal, form, etc.)
 */
(function () {
  const TERMINAL_LINES = [
    {
      de: 'Priorität 1 — Rechnungsblock schließen',
      en: 'Priority 1 — Close billing block',
      tr: 'Öncelik 1 — Fatura bloğunu kapat',
      ar: 'الأولوية 1 — إغلاق كتلة الفواتير',
      ru: 'Приоритет 1 — Закрыть блок счетов',
      c: 'pr',
    },
    {
      de: 'Priorität 2 — Lieferant bestätigen bis 14:00',
      en: 'Priority 2 — Confirm supplier by 14:00',
      tr: 'Öncelik 2 — Tedarikçiyi 14:00\'e kadar onayla',
      ar: 'الأولوية 2 — تأكيد المورد بحلول 14:00',
      ru: 'Приоритет 2 — Подтвердить поставщика до 14:00',
      c: 'pr',
    },
    {
      de: '3 neue Anfragen — automatisch qualifiziert',
      en: '3 new inquiries — auto-qualified',
      tr: '3 yeni talep — otomatik nitelendirildi',
      ar: '3 طلبات جديدة — مؤهلة تلقائياً',
      ru: '3 новых запроса — автоматически квалифицированы',
      c: 'nm',
    },
    {
      de: 'Social Media Post — Donnerstag vorbereitet',
      en: 'Social post — prepared for Thursday',
      tr: 'Sosyal medya gönderisi — Perşembe için hazır',
      ar: 'منشور اجتماعي — جاهز ليوم الخميس',
      ru: 'Пост в соцсетях — подготовлен на четверг',
      c: 'nm',
    },
    {
      de: 'Rechnung #047 — versendet ✓',
      en: 'Invoice #047 — sent ✓',
      tr: 'Fatura #047 — gönderildi ✓',
      ar: 'فاتورة #047 — تم الإرسال ✓',
      ru: 'Счёт #047 — отправлен ✓',
      c: 'dn',
    },
    {
      de: 'Wochenbericht — generiert ✓',
      en: 'Weekly report — generated ✓',
      tr: 'Haftalık rapor — oluşturuldu ✓',
      ar: 'التقرير الأسبوعي — تم إنشاؤه ✓',
      ru: 'Недельный отчёт — сформирован ✓',
      c: 'dn',
    },
  ];

  const NOTE = {
    de: 'Nächste Aufgabe fällig in 2h — Erinnerung aktiv',
    en: 'Next task due in 2h — reminder active',
    tr: 'Sonraki görev 2 saat içinde — hatırlatıcı aktif',
    ar: 'المهمة التالية خلال ساعتين — التذكير مفعّل',
    ru: 'Следующая задача через 2 ч — напоминание активно',
  };

  let terminalStarted = false;
  let terminalObserver = null;

  function typeIt(el, text, spd) {
    let i = 0;
    const c = document.createElement('span');
    c.className = 'tc';
    el.appendChild(c);
    const iv = setInterval(() => {
      if (i < text.length) {
        el.insertBefore(document.createTextNode(text[i]), c);
        i++;
      } else {
        clearInterval(iv);
        c.remove();
      }
    }, spd);
  }

  function runTerminal() {
    const mdBody = document.getElementById('md-body');
    if (!mdBody) return;

    mdBody.innerHTML = '';
    let delay = 300;

    TERMINAL_LINES.forEach((ln) => {
      const text = t(ln);
      setTimeout(() => {
        const d = document.createElement('div');
        d.className = 'tl ' + ln.c;
        const dot = document.createElement('div');
        dot.className = 'tl-dot';
        const sp = document.createElement('span');
        d.appendChild(dot);
        d.appendChild(sp);
        mdBody.appendChild(d);
        setTimeout(() => d.classList.add('show'), 40);
        typeIt(sp, text, 22);
      }, delay);
      delay += text.length * 22 + 250;
    });

    setTimeout(() => {
      const note = document.createElement('div');
      note.className = 'md-note';
      note.style.opacity = '0';
      note.style.transition = 'opacity .5s';
      note.textContent = t(NOTE);
      mdBody.appendChild(note);
      setTimeout(() => {
        note.style.opacity = '1';
      }, 100);
    }, delay + 200);
  }

  function setupTerminalObserver() {
    const mdBody = document.getElementById('md-body');
    if (!mdBody || terminalObserver) return;

    terminalObserver = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !terminalStarted) {
          terminalStarted = true;
          runTerminal();
        }
      },
      { threshold: 0.3 }
    );
    terminalObserver.observe(mdBody);
  }

  function refreshDynamicContent() {
    if (terminalStarted) runTerminal();
  }

  window.addEventListener('langChanged', refreshDynamicContent);
  document.addEventListener('DOMContentLoaded', setupTerminalObserver);
})();
