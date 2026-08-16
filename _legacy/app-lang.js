/**
 * creaDIG — client-side i18n (DE default, EN/TR/AR/RU)
 */
(function (global) {
  const LANG_KEY = 'creadig_lang';
  const LANG_CHOSEN_KEY = 'creadig_lang_chosen';
  const VALID = ['de', 'en', 'tr', 'ar', 'ru'];
  const DEFAULT = 'de';

  const LANGS = {
    de: { label: 'DE', dir: 'ltr', htmlLang: 'de-DE' },
    en: { label: 'EN', dir: 'ltr', htmlLang: 'en' },
    tr: { label: 'TR', dir: 'ltr', htmlLang: 'tr' },
    ar: { label: 'AR', dir: 'rtl', htmlLang: 'ar' },
    ru: { label: 'RU', dir: 'ltr', htmlLang: 'ru' },
  };

  function getSavedLang() {
    if (localStorage.getItem(LANG_CHOSEN_KEY) !== '1') return DEFAULT;
    const saved = localStorage.getItem(LANG_KEY);
    return VALID.includes(saved) ? saved : DEFAULT;
  }

  const PAGE_TITLE = {
    de: 'creaDIG — Digitalagentur & Business Architecture | DACH',
    en: 'creaDIG — Digital Agency & Business Architecture | DACH',
    tr: 'creaDIG — Dijital Ajans & İş Mimarisi | DACH',
    ar: 'creaDIG — هندسة أعمال وعمليات | DACH',
    ru: 'creaDIG — Digital-агентство и бизнес-архитектура | DACH',
  };

  function applyDataLang(lang) {
    const L = VALID.includes(lang) ? lang : DEFAULT;
    document.title = PAGE_TITLE[L] || PAGE_TITLE.de;

    document.querySelectorAll('[data-de], [data-html-de]').forEach((el) => {
      const htmlKey = 'data-html-' + L;
      const textKey = 'data-' + L;

      if (el.hasAttribute(htmlKey)) {
        el.innerHTML = el.getAttribute(htmlKey) || el.getAttribute('data-html-de') || '';
        return;
      }

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const ph = el.getAttribute(textKey);
        if (ph != null) el.placeholder = ph;
        return;
      }

      if (el.tagName === 'OPTION') {
        const t = el.getAttribute(textKey);
        if (t != null) el.textContent = t;
        return;
      }

      const t = el.getAttribute(textKey);
      if (t != null) el.textContent = t;
    });

    document.querySelectorAll('[id^="lm-"]').forEach((btn) => {
      btn.classList.toggle('ac', btn.id === 'lm-' + L);
    });
    document.querySelectorAll('.mob-lb').forEach((btn) => {
      btn.classList.toggle('ac', btn.dataset.lang === L);
    });

    const label = document.getElementById('langLabel');
    if (label) label.textContent = LANGS[L].label;
  }

  function closeLangMenu() {
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.remove('open');
  }

  function selectLang(lang, userChoice) {
    const L = VALID.includes(lang) ? lang : DEFAULT;
    const info = LANGS[L];

    document.documentElement.lang = info.htmlLang;
    document.documentElement.dir = info.dir;
    document.documentElement.setAttribute('data-lang', L);

    if (userChoice) {
      localStorage.setItem(LANG_KEY, L);
      localStorage.setItem(LANG_CHOSEN_KEY, '1');
    }

    applyDataLang(L);
    closeLangMenu();
    global.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: L } }));
  }

  function toggleLangMenu() {
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.toggle('open');
  }

  function t(obj) {
    const lang = document.documentElement.getAttribute('data-lang') || getSavedLang();
    return (obj && (obj[lang] || obj.de)) || '';
  }

  function initLangUI() {
    const lang = getSavedLang();
    const info = LANGS[lang];
    document.documentElement.lang = info.htmlLang;
    document.documentElement.dir = info.dir;
    document.documentElement.setAttribute('data-lang', lang);
    applyDataLang(lang);

    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('langWrap');
      if (wrap && !wrap.contains(e.target)) closeLangMenu();
    });
  }

  global.getSavedLang = getSavedLang;
  global.applyDataLang = applyDataLang;
  global.selectLang = selectLang;
  global.toggleLangMenu = toggleLangMenu;
  global.closeLangMenu = closeLangMenu;
  global.t = t;
  global.CreadigLang = { LANGS, VALID, DEFAULT, LANG_KEY, LANG_CHOSEN_KEY };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLangUI);
  } else {
    initLangUI();
  }
})(window);
