(function () {
  'use strict';

  var WA_NUMBER = '4915140448885';
  var AVAIL_DAYS = [2, 4];
  var TIME_SLOTS_VG = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  var TIME_SLOTS_BR = ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  var MONTHS = {
    tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    bs: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
  };

  var DAYS = {
    tr: ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'],
    de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    ar: ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'],
    bs: ['Po', 'Ut', 'Sr', 'Če', 'Pe', 'Su', 'Ne']
  };

  var MEETING_LANG_LABELS = {
    tr: 'Türkçe',
    de: 'Deutsch',
    'tr-de': 'Türkçe + Almanca',
    en: 'Turkish',
    ar: 'التركية',
    bs: 'Turski'
  };

  var state = {
    type: null,
    date: null,
    dateLabel: null,
    time: null,
    meetingLang: 'tr',
    curStep: 1
  };

  var now = new Date();
  var calYear = now.getFullYear();
  var calMonth = now.getMonth();
  var planningDates = {};
  var planningLoaded = false;

  function loadPlanning() {
    if (!window.TerminAvailability) {
      planningLoaded = true;
      return Promise.resolve();
    }
    return TerminAvailability.fetch(false).then(function (data) {
      planningDates = TerminAvailability.planningSet(data);
      planningLoaded = true;
    });
  }

  function getSiteLang() {
    try {
      if (localStorage.getItem('selsebil_lang_chosen') === '1') {
        var s = localStorage.getItem('selsebil_lang');
        if (s === 'de' || s === 'en' || s === 'ar' || s === 'bs' || s === 'tr') return s;
      }
    } catch (e) {}
    return 'tr';
  }

  function t(obj) {
    if (!obj) return '';
    var lang = getSiteLang();
    return obj[lang] || obj.tr || '';
  }

  function selectType(type) {
    state.type = type;
    var vg = document.getElementById('card-vg');
    var br = document.getElementById('card-br');
    if (vg) vg.classList.toggle('selected', type === 'vg');
    if (br) br.classList.toggle('selected', type === 'br');
    var btn1 = document.getElementById('btn1');
    if (btn1) btn1.disabled = false;
  }
  window.selectType = selectType;

  function goStep(n) {
    if (n === 3 && !validateStep2()) return;
    var cur = document.getElementById('s' + state.curStep);
    if (cur) cur.classList.remove('active');
    state.curStep = n;
    var next = document.getElementById('s' + n);
    if (next) next.classList.add('active');
    updateProgress(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (n === 2) {
      loadPlanning().then(function () {
        renderCal();
      });
    }
    if (n === 4) renderSummary();
  }
  window.goStep = goStep;

  function updateProgress(n) {
    var pct = { 1: 25, 2: 50, 3: 75, 4: 95, 5: 100 };
    var fill = document.getElementById('progFill');
    if (fill) fill.style.width = (pct[n] || 25) + '%';
    [1, 2, 3, 4].forEach(function (i) {
      var dot = document.getElementById('sdot' + i);
      if (!dot) return;
      dot.classList.remove('active', 'done');
      if (i < n) dot.classList.add('done');
      else if (i === n) dot.classList.add('active');
      var line = document.getElementById('sline' + i);
      if (line) line.classList.toggle('done', i < n);
    });
  }

  function renderCal() {
    var grid = document.getElementById('calGrid');
    if (!grid) return;
    if (state.date && planningDates[state.date]) {
      state.date = null;
      state.dateLabel = null;
      state.time = null;
      var timeSection = document.getElementById('timeSection');
      if (timeSection) timeSection.style.display = 'none';
      var btn2clear = document.getElementById('btn2');
      if (btn2clear) btn2clear.disabled = true;
    }
    grid.innerHTML = '';
    var lang = getSiteLang();
    var months = MONTHS[lang] || MONTHS.tr;
    var days = DAYS[lang] || DAYS.tr;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    days.forEach(function (d) {
      var el = document.createElement('div');
      el.className = 'termin-cal-dayname';
      el.textContent = d;
      grid.appendChild(el);
    });

    var first = new Date(calYear, calMonth, 1).getDay();
    var firstMon = first === 0 ? 6 : first - 1;
    var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    for (var i = 0; i < firstMon; i++) {
      var empty = document.createElement('div');
      empty.className = 'termin-cal-day empty';
      grid.appendChild(empty);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(calYear, calMonth, d);
      var dow = date.getDay();
      var dowMon = dow === 0 ? 6 : dow - 1;
      var isPast = date < today;
      var isAvail = AVAIL_DAYS.indexOf(dowMon) !== -1 && !isPast;
      var dateStr =
        calYear +
        '-' +
        (calMonth < 9 ? '0' : '') +
        (calMonth + 1) +
        '-' +
        (d < 10 ? '0' : '') +
        d;
      var isPlanning = !!planningDates[dateStr];
      var isToday = date.getTime() === today.getTime();
      var isSelected = state.date === dateStr;

      var cell = document.createElement('div');
      cell.className =
        'termin-cal-day' +
        (isPast || isPlanning ? ' disabled' : '') +
        (isToday ? ' today' : '') +
        (isAvail && !isPlanning ? ' has-slots' : '') +
        (isPlanning ? ' has-planning' : '') +
        (isSelected && !isPlanning ? ' selected' : '');
      cell.textContent = d;

      if (!isPast && !isPlanning) {
        (function (ds, dayNum, mon, yr) {
          cell.addEventListener('click', function () {
            state.date = ds;
            state.dateLabel = dayNum + ' ' + months[mon] + ' ' + yr;
            state.time = null;
            renderCal();
            renderTimeSlots();
            var btn2 = document.getElementById('btn2');
            if (btn2) btn2.disabled = true;
          });
        })(dateStr, d, calMonth, calYear);
      }
      grid.appendChild(cell);
    }

    var calMonthEl = document.getElementById('calMonth');
    if (calMonthEl) calMonthEl.textContent = months[calMonth] + ' ' + calYear;
  }

  function renderTimeSlots() {
    var section = document.getElementById('timeSection');
    var grid = document.getElementById('timeGrid');
    if (!section || !grid) return;
    section.style.display = 'block';
    grid.innerHTML = '';
    var slots = state.type === 'br' ? TIME_SLOTS_BR : TIME_SLOTS_VG;
    slots.forEach(function (slot) {
      var el = document.createElement('div');
      el.className = 'termin-time-slot';
      el.textContent = slot;
      el.addEventListener('click', function () {
        state.time = slot;
        grid.querySelectorAll('.termin-time-slot').forEach(function (s) {
          s.classList.remove('selected');
        });
        el.classList.add('selected');
        var btn2 = document.getElementById('btn2');
        if (btn2) btn2.disabled = false;
      });
      grid.appendChild(el);
    });
  }

  function validateStep2() {
    var msgDate = t({
      tr: 'Lütfen bir tarih seçin.',
      de: 'Bitte wählen Sie ein Datum.',
      en: 'Please select a date.',
      ar: 'يرجى اختيار تاريخ.',
      bs: 'Molimo odaberite datum.'
    });
    var msgTime = t({
      tr: 'Lütfen bir saat seçin.',
      de: 'Bitte wählen Sie eine Uhrzeit.',
      en: 'Please select a time.',
      ar: 'يرجى اختيار وقت.',
      bs: 'Molimo odaberite vrijeme.'
    });
    if (!state.date) {
      alert(msgDate);
      return false;
    }
    if (!state.time) {
      alert(msgTime);
      return false;
    }
    return true;
  }

  function calPrev() {
    calMonth--;
    if (calMonth < 0) {
      calMonth = 11;
      calYear--;
    }
    renderCal();
  }
  window.calPrev = calPrev;

  function calNext() {
    calMonth++;
    if (calMonth > 11) {
      calMonth = 0;
      calYear++;
    }
    renderCal();
  }
  window.calNext = calNext;

  function selectMeetingRadio(el) {
    var group = document.getElementById('terminMeetingLang');
    if (!group) return;
    group.querySelectorAll('.termin-radio-item').forEach(function (r) {
      r.classList.remove('selected');
    });
    el.classList.add('selected');
    state.meetingLang = el.getAttribute('data-val') || 'tr';
  }
  window.selectMeetingRadio = selectMeetingRadio;

  function val(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    if (el.tagName === 'SELECT') {
      var opt = el.options[el.selectedIndex];
      return (opt && opt.text) || '';
    }
    return el.value.trim();
  }

  function meetingLangLabel() {
    var lang = getSiteLang();
    if (lang === 'de' && state.meetingLang === 'tr') return 'Türkisch';
    if (lang === 'de' && state.meetingLang === 'de') return 'Deutsch';
    if (lang === 'de' && state.meetingLang === 'tr-de') return 'Türkisch + Deutsch';
    return MEETING_LANG_LABELS[state.meetingLang] || MEETING_LANG_LABELS.tr;
  }

  function renderSummary() {
    var typeLabels = {
      vg: t({
        tr: 'Ön Görüşme (Vorgespräch)',
        de: 'Vorgespräch',
        en: 'Intro call (Vorgespräch)',
        ar: 'مقدمة (Vorgespräch)',
        bs: 'Uvodni razgovor (Vorgespräch)'
      }),
      br: t({
        tr: 'Yayın Rezervasyonu (Buchungstermin)',
        de: 'Buchungstermin',
        en: 'Broadcast booking (Buchungstermin)',
        ar: 'حجز البث (Buchungstermin)',
        bs: 'Rezervacija prijenosa (Buchungstermin)'
      })
    };

    var rows = [
      { k: t({ tr: 'Termin Türü', de: 'Terminart', en: 'Appointment type', ar: 'نوع الموعد', bs: 'Vrsta termina' }), v: typeLabels[state.type] || '-', cls: 'blue' },
      { k: t({ tr: 'Tarih', de: 'Datum', en: 'Date', ar: 'التاريخ', bs: 'Datum' }), v: state.dateLabel || '-' },
      { k: t({ tr: 'Saat Tercihi', de: 'Uhrzeit', en: 'Preferred time', ar: 'الوقت', bs: 'Vrijeme' }), v: state.time || '-' },
      { k: t({ tr: 'Ad Soyad', de: 'Name', en: 'Name', ar: 'الاسم', bs: 'Ime' }), v: val('termin_fName') },
      { k: t({ tr: 'Telefon', de: 'Telefon', en: 'Phone', ar: 'الهاتف', bs: 'Telefon' }), v: val('termin_fPhone') },
      { k: t({ tr: 'E-posta', de: 'E-Mail', en: 'Email', ar: 'البريد', bs: 'E-mail' }), v: val('termin_fEmail') },
      { k: t({ tr: 'Dernek / Kurum', de: 'Verein / Organisation', en: 'Association', ar: 'الجمعية', bs: 'Udruženje' }), v: val('termin_fOrg') },
      { k: t({ tr: 'Şehir', de: 'Stadt', en: 'City', ar: 'المدينة', bs: 'Grad' }), v: val('termin_fCity') || '-' },
      { k: t({ tr: 'Katılımcı', de: 'Teilnehmer', en: 'Attendees', ar: 'الحضور', bs: 'Sudionici' }), v: val('termin_fSize') || '-' },
      { k: t({ tr: 'Hedef Miktar', de: 'Zielbetrag', en: 'Target amount', ar: 'المبلغ المستهدف', bs: 'Ciljni iznos' }), v: val('termin_fTarget') || '-' },
      { k: t({ tr: 'Görüşme Dili', de: 'Gesprächssprache', en: 'Meeting language', ar: 'لغة اللقاء', bs: 'Jezik razgovora' }), v: meetingLangLabel() },
      { k: t({ tr: 'Not', de: 'Notiz', en: 'Note', ar: 'ملاحظة', bs: 'Napomena' }), v: val('termin_fNote') || '-' }
    ];

    var html = '';
    rows.forEach(function (r) {
      html +=
        '<div class="termin-summary-row"><div class="termin-summary-key">' +
        r.k +
        '</div><div class="termin-summary-val' +
        (r.cls ? ' ' + r.cls : '') +
        '">' +
        r.v +
        '</div></div>';
    });

    var card = document.getElementById('summaryCard');
    if (card) card.innerHTML = html;

    var typeShort = {
      vg: t({ tr: 'Ön Görüşme', de: 'Vorgespräch', en: 'Intro call', ar: 'مقدمة', bs: 'Uvod' }),
      br: t({ tr: 'Yayın Rezervasyonu', de: 'Buchungstermin', en: 'Broadcast booking', ar: 'حجز بث', bs: 'Rezervacija' })
    };

    var msg =
      '*Selsebil.TV Termin Talebi*\n\n' +
      '📋 *' +
      t({ tr: 'Tür', de: 'Art', en: 'Type', ar: 'النوع', bs: 'Vrsta' }) +
      ':* ' +
      (typeShort[state.type] || '-') +
      '\n' +
      '📅 *' +
      t({ tr: 'Tarih', de: 'Datum', en: 'Date', ar: 'التاريخ', bs: 'Datum' }) +
      ':* ' +
      (state.dateLabel || '-') +
      '\n' +
      '🕐 *' +
      t({ tr: 'Saat', de: 'Uhrzeit', en: 'Time', ar: 'الوقت', bs: 'Vrijeme' }) +
      ':* ' +
      (state.time || '-') +
      '\n\n' +
      '👤 *' +
      t({ tr: 'Ad Soyad', de: 'Name', en: 'Name', ar: 'الاسم', bs: 'Ime' }) +
      ':* ' +
      val('termin_fName') +
      '\n' +
      '📱 *Tel:* ' +
      val('termin_fPhone') +
      '\n' +
      '📧 *E-posta:* ' +
      val('termin_fEmail') +
      '\n' +
      '🕌 *' +
      t({ tr: 'Dernek', de: 'Verein', en: 'Association', ar: 'الجمعية', bs: 'Udruženje' }) +
      ':* ' +
      val('termin_fOrg') +
      '\n' +
      '📍 *' +
      t({ tr: 'Şehir', de: 'Stadt', en: 'City', ar: 'المدينة', bs: 'Grad' }) +
      ':* ' +
      (val('termin_fCity') || '-') +
      '\n' +
      '👥 *' +
      t({ tr: 'Katılımcı', de: 'Teilnehmer', en: 'Attendees', ar: 'الحضور', bs: 'Sudionici' }) +
      ':* ' +
      (val('termin_fSize') || '-') +
      '\n' +
      '💶 *' +
      t({ tr: 'Hedef', de: 'Ziel', en: 'Target', ar: 'الهدف', bs: 'Cilj' }) +
      ':* ' +
      (val('termin_fTarget') || '-') +
      '\n' +
      '🌍 *' +
      t({ tr: 'Dil', de: 'Sprache', en: 'Language', ar: 'اللغة', bs: 'Jezik' }) +
      ':* ' +
      meetingLangLabel() +
      '\n\n' +
      '💬 *' +
      t({ tr: 'Not', de: 'Notiz', en: 'Note', ar: 'ملاحظة', bs: 'Napomena' }) +
      ':* ' +
      (val('termin_fNote') || '-');

    var waBtn = document.getElementById('waBtn');
    if (waBtn) {
      waBtn.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
      waBtn.onclick = function () {
        setTimeout(function () {
          goStep(5);
        }, 800);
      };
    }

    var successDetail = document.getElementById('successDetail');
    if (successDetail) {
      successDetail.innerHTML =
        '<div class="termin-success-detail-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        (state.dateLabel || '') +
        ' · ' +
        (state.time || '') +
        '</div>' +
        '<div class="termin-success-detail-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13 19.79 19.79 0 0 1 1.07 4.4 2 2 0 0 1 3.05 2.18h3a2 2 0 0 1 2 1.72"/></svg>' +
        t({
          tr: 'Ekibimiz 24 saat içinde geri döner',
          de: 'Wir melden uns innerhalb von 24 Stunden',
          en: 'Our team will reply within 24 hours',
          ar: 'سنعود إليكم خلال 24 ساعة',
          bs: 'Javljamo se u roku od 24 sata'
        }) +
        '</div>';
    }
  }

  function refreshDynamic() {
    if (window.TerminI18n && window.TerminI18n.apply) window.TerminI18n.apply();
    if (state.curStep === 2) {
      loadPlanning().then(function () {
        renderCal();
      });
    }
    if (state.curStep === 4) renderSummary();
  }

  window.addEventListener('langChanged', refreshDynamic);

  window.TerminWizard = { refresh: refreshDynamic };

  document.addEventListener('DOMContentLoaded', function () {
    loadPlanning().then(function () {
      renderCal();
    });
  });
})();
