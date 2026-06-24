(function (global) {
  'use strict';

  var cache = null;
  var cacheAt = 0;
  var TTL = 45000;

  function apiUrl(path) {
    var base = '';
    if (typeof location !== 'undefined' && location.origin && location.protocol !== 'file:') {
      base = location.origin;
    }
    return base + path;
  }

  function fetchAvailability(force) {
    var now = Date.now();
    if (!force && cache && now - cacheAt < TTL) {
      return Promise.resolve(cache);
    }
    return fetch(apiUrl('/api/termin-availability'), { cache: 'no-store' })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        cache = data || { planning: [], entries: [] };
        cacheAt = now;
        return cache;
      })
      .catch(function () {
        return { planning: [], entries: [], configured: false };
      });
  }

  function planningSet(data) {
    var set = {};
    (data.planning || []).forEach(function (p) {
      if (p && p.date) set[p.date] = p;
    });
    return set;
  }

  global.TerminAvailability = {
    fetch: fetchAvailability,
    planningSet: planningSet,
    invalidate: function () {
      cache = null;
      cacheAt = 0;
    }
  };
})(typeof window !== 'undefined' ? window : global);
