/* ═══════════════════════════════════════════════════════════
   creaDIG — Termin-Wizard (Logik portiert von Selsebil termin)
   4 Schritte + Success · statische Verfügbarkeit · WhatsApp-Versand
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ▼▼ HIER ANPASSEN ▼▼ ─────────────────────────────────────── */
  var WA_NUMBER = '41765045879';          // creaDIG WhatsApp · +41 76 504 58 79
  var AVAIL_DAYS = [1, 2, 3];             // empfohlene Wochentage (Mo=0,Di=1,Mi=2,Do=3,Fr=4) → Di/Mi/Do
  var TIME_SLOTS_VG = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  var TIME_SLOTS_AR = ['10:00', '11:00', '14:00', '15:00', '16:00'];
  /* ▲▲ ──────────────────────────────────────────────────────── */

  var MONTHS = {
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };
  var DAYS = {
    de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    tr: ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'],
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  };

  var state = { type: null, date: null, dateLabel: null, time: null, meetingLang: 'de', curStep: 1 };
  var now = new Date();
  var calYear = now.getFullYear();
  var calMonth = now.getMonth();

  function lang() {
    var l = document.documentElement.getAttribute('data-lang');
    if (l === 'de' || l === 'tr' || l === 'en') return l;
    try {
      if (localStorage.getItem('creadig_lang_chosen') === '1') {
        var s = localStorage.getItem('creadig_lang');
        if (s === 'tr' || s === 'en' || s === 'de') return s;
      }
    } catch (e) {}
    return 'de';
  }
  function t(obj) { if (!obj) return ''; var l = lang(); return obj[l] || obj.de || ''; }

  /* ── STEP 1: Typ ── */
  function selectType(type) {
    state.type = type;
    ['vg', 'ar'].forEach(function (k) {
      var c = document.getElementById('card-' + k);
      if (c) c.classList.toggle('selected', k === type);
    });
    var b = document.getElementById('btn1');
    if (b) b.disabled = false;
  }
  window.selectType = selectType;

  /* ── Navigation ── */
  function goStep(n) {
    if (n === 3 && !validateStep2()) return;
    if (n === 4 && !validateStep3()) return;
    var cur = document.getElementById('s' + state.curStep);
    if (cur) cur.classList.remove('active');
    state.curStep = n;
    var next = document.getElementById('s' + n);
    if (next) next.classList.add('active');
    updateProgress(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (n === 2) renderCal();
    if (n === 4) renderSummary();
  }
  window.goStep = goStep;

  function updateProgress(n) {
    var pct = { 1: 25, 2: 50, 3: 75, 4: 95, 5: 100 };
    var fill = document.getElementById('progFill');
    if (fill) fill.style.width = (pct[n] || 25) + '%';
    [1, 2, 3, 4].forEach(function (i) {
      var dot = document.getElementById('sdot' + i);
      if (dot) { dot.classList.remove('active', 'done'); if (i < n) dot.classList.add('done'); else if (i === n) dot.classList.add('active'); }
      var line = document.getElementById('sline' + i);
      if (line) line.classList.toggle('done', i < n);
    });
  }

  /* ── STEP 2: Kalender ── */
  function renderCal() {
    var grid = document.getElementById('calGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var L = lang(), months = MONTHS[L] || MONTHS.de, days = DAYS[L] || DAYS.de;
    var today = new Date(); today.setHours(0, 0, 0, 0);

    days.forEach(function (d) {
      var el = document.createElement('div'); el.className = 'tm-cal-dayname'; el.textContent = d; grid.appendChild(el);
    });

    var first = new Date(calYear, calMonth, 1).getDay();
    var firstMon = first === 0 ? 6 : first - 1;
    var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    for (var i = 0; i < firstMon; i++) { var e = document.createElement('div'); e.className = 'tm-cal-day empty'; grid.appendChild(e); }

    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(calYear, calMonth, d);
      var dow = date.getDay(); var dowMon = dow === 0 ? 6 : dow - 1;
      var isPast = date < today;
      var isAvail = AVAIL_DAYS.indexOf(dowMon) !== -1 && !isPast;
      var dateStr = calYear + '-' + (calMonth < 9 ? '0' : '') + (calMonth + 1) + '-' + (d < 10 ? '0' : '') + d;
      var isToday = date.getTime() === today.getTime();
      var isSelected = state.date === dateStr;

      var cell = document.createElement('div');
      cell.className = 'tm-cal-day' + (isPast ? ' disabled' : '') + (isToday ? ' today' : '') + (isAvail ? ' has-slots' : '') + (isSelected ? ' selected' : '');
      cell.textContent = d;
      if (!isPast) {
        (function (ds, dayNum, mon, yr) {
          cell.addEventListener('click', function () {
            state.date = ds;
            state.dateLabel = dayNum + '. ' + months[mon] + ' ' + yr;
            state.time = null;
            renderCal(); renderTimeSlots();
            var b = document.getElementById('btn2'); if (b) b.disabled = true;
          });
        })(dateStr, d, calMonth, calYear);
      }
      grid.appendChild(cell);
    }
    var m = document.getElementById('calMonth'); if (m) m.textContent = months[calMonth] + ' ' + calYear;
  }

  function renderTimeSlots() {
    var section = document.getElementById('timeSection'), grid = document.getElementById('timeGrid');
    if (!section || !grid) return;
    section.style.display = 'block'; grid.innerHTML = '';
    var slots = state.type === 'ar' ? TIME_SLOTS_AR : TIME_SLOTS_VG;
    slots.forEach(function (slot) {
      var el = document.createElement('div'); el.className = 'tm-slot'; el.textContent = slot;
      el.addEventListener('click', function () {
        state.time = slot;
        grid.querySelectorAll('.tm-slot').forEach(function (s) { s.classList.remove('selected'); });
        el.classList.add('selected');
        var b = document.getElementById('btn2'); if (b) b.disabled = false;
      });
      grid.appendChild(el);
    });
  }

  function validateStep2() {
    if (!state.date) { alert(t({ de: 'Bitte wählen Sie ein Datum.', tr: 'Lütfen bir tarih seçin.', en: 'Please select a date.' })); return false; }
    if (!state.time) { alert(t({ de: 'Bitte wählen Sie eine Uhrzeit.', tr: 'Lütfen bir saat seçin.', en: 'Please select a time.' })); return false; }
    return true;
  }

  function calPrev() { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCal(); }
  function calNext() { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCal(); }
  window.calPrev = calPrev; window.calNext = calNext;

  /* ── STEP 3: Formular ── */
  function selectMeetingRadio(el) {
    var g = document.getElementById('terminMeetingLang'); if (!g) return;
    g.querySelectorAll('.tm-radio-item').forEach(function (r) { r.classList.remove('selected'); });
    el.classList.add('selected');
    state.meetingLang = el.getAttribute('data-val') || 'de';
  }
  window.selectMeetingRadio = selectMeetingRadio;

  function validateStep3() {
    var req = ['termin_fName', 'termin_fPhone', 'termin_fEmail', 'termin_fOrg'];
    var ok = true, firstBad = null;
    req.forEach(function (id) {
      var el = document.getElementById(id); if (!el) return;
      var bad = !el.value.trim();
      if (id === 'termin_fEmail' && el.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) bad = true;
      el.classList.toggle('invalid', bad);
      if (bad && !firstBad) firstBad = el;
      if (bad) ok = false;
    });
    if (!ok) {
      if (firstBad) firstBad.focus();
      alert(t({ de: 'Bitte füllen Sie die Pflichtfelder korrekt aus.', tr: 'Lütfen zorunlu alanları doğru doldurun.', en: 'Please fill in the required fields correctly.' }));
    }
    return ok;
  }

  function val(id) {
    var el = document.getElementById(id); if (!el) return '';
    if (el.tagName === 'SELECT') { var o = el.options[el.selectedIndex]; return (o && o.value) ? o.text : ''; }
    return el.value.trim();
  }

  function meetingLangLabel() {
    var map = { de: { de: 'Deutsch', tr: 'Türkisch', 'de-tr': 'Deutsch + Türkisch' },
                tr: { de: 'Almanca', tr: 'Türkçe', 'de-tr': 'Almanca + Türkçe' },
                en: { de: 'German', tr: 'Turkish', 'de-tr': 'German + Turkish' } };
    var L = lang(); return (map[L] || map.de)[state.meetingLang] || state.meetingLang;
  }

  /* ── STEP 4: Zusammenfassung + WhatsApp ── */
  function renderSummary() {
    var typeLabel = t(state.type === 'ar'
      ? { de: 'Architecture-Gespräch', tr: 'Architecture Görüşmesi', en: 'Architecture call' }
      : { de: 'Kostenlose Erstberatung', tr: 'Ücretsiz Ön Görüşme', en: 'Free initial consultation' });

    var rows = [
      { k: t({ de: 'Terminart', tr: 'Termin Türü', en: 'Appointment type' }), v: typeLabel, cls: 'accent' },
      { k: t({ de: 'Wunschtermin', tr: 'Tarih', en: 'Preferred date' }), v: state.dateLabel || '-' },
      { k: t({ de: 'Uhrzeit', tr: 'Saat', en: 'Time' }), v: state.time || '-' },
      { k: t({ de: 'Name', tr: 'Ad Soyad', en: 'Name' }), v: val('termin_fName') },
      { k: t({ de: 'Telefon', tr: 'Telefon', en: 'Phone' }), v: val('termin_fPhone') },
      { k: t({ de: 'E-Mail', tr: 'E-posta', en: 'Email' }), v: val('termin_fEmail') },
      { k: t({ de: 'Unternehmen', tr: 'Şirket', en: 'Company' }), v: val('termin_fOrg') },
      { k: t({ de: 'Stadt / Region', tr: 'Şehir', en: 'City / Region' }), v: val('termin_fCity') || '-' },
      { k: t({ de: 'Interesse', tr: 'İlgi Alanı', en: 'Interest' }), v: val('termin_fInterest') || '-' },
      { k: t({ de: 'Unternehmensgröße', tr: 'Şirket Büyüklüğü', en: 'Company size' }), v: val('termin_fSize') || '-' },
      { k: t({ de: 'Sprache', tr: 'Dil', en: 'Language' }), v: meetingLangLabel() },
      { k: t({ de: 'Nachricht', tr: 'Mesaj', en: 'Message' }), v: val('termin_fNote') || '-' }
    ];
    var html = '';
    rows.forEach(function (r) {
      html += '<div class="tm-sum-row"><div class="tm-sum-key">' + r.k + '</div><div class="tm-sum-val' + (r.cls ? ' ' + r.cls : '') + '">' + escapeHtml(r.v) + '</div></div>';
    });
    var card = document.getElementById('summaryCard'); if (card) card.innerHTML = html;

    var msg =
      '*creaDIG — ' + t({ de: 'Terminanfrage', tr: 'Termin Talebi', en: 'Appointment request' }) + '*\n\n' +
      '📋 *' + t({ de: 'Art', tr: 'Tür', en: 'Type' }) + ':* ' + typeLabel + '\n' +
      '📅 *' + t({ de: 'Wunschtermin', tr: 'Tarih', en: 'Date' }) + ':* ' + (state.dateLabel || '-') + '\n' +
      '🕐 *' + t({ de: 'Uhrzeit', tr: 'Saat', en: 'Time' }) + ':* ' + (state.time || '-') + '\n\n' +
      '👤 *' + t({ de: 'Name', tr: 'Ad Soyad', en: 'Name' }) + ':* ' + val('termin_fName') + '\n' +
      '🏢 *' + t({ de: 'Unternehmen', tr: 'Şirket', en: 'Company' }) + ':* ' + val('termin_fOrg') + '\n' +
      '📍 *' + t({ de: 'Stadt', tr: 'Şehir', en: 'City' }) + ':* ' + (val('termin_fCity') || '-') + '\n' +
      '📧 *E-Mail:* ' + val('termin_fEmail') + '\n' +
      '📱 *' + t({ de: 'Telefon', tr: 'Telefon', en: 'Phone' }) + ':* ' + val('termin_fPhone') + '\n\n' +
      '💡 *' + t({ de: 'Interesse', tr: 'İlgi', en: 'Interest' }) + ':* ' + (val('termin_fInterest') || '-') + '\n' +
      '👥 *' + t({ de: 'Größe', tr: 'Büyüklük', en: 'Size' }) + ':* ' + (val('termin_fSize') || '-') + '\n' +
      '🌍 *' + t({ de: 'Sprache', tr: 'Dil', en: 'Language' }) + ':* ' + meetingLangLabel() + '\n\n' +
      '💬 *' + t({ de: 'Nachricht', tr: 'Mesaj', en: 'Message' }) + ':* ' + (val('termin_fNote') || '-');

    var waBtn = document.getElementById('waBtn');
    if (waBtn) {
      waBtn.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
      waBtn.onclick = function () { setTimeout(function () { goStep(5); }, 800); };
    }

    var sd = document.getElementById('successDetail');
    if (sd) {
      sd.innerHTML =
        '<div class="tm-success-detail-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' + (state.dateLabel || '') + ' · ' + (state.time || '') + '</div>' +
        '<div class="tm-success-detail-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
        t({ de: 'Wir melden uns innerhalb von 24 Stunden', tr: 'Ekibimiz 24 saat içinde geri döner', en: 'We reply within 24 hours' }) + '</div>';
    }
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function refresh() { if (state.curStep === 2) renderCal(); if (state.curStep === 4) renderSummary(); }
  window.addEventListener('langChanged', refresh);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderCal);
  else renderCal();
})();
