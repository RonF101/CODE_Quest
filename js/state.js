(function () {
  'use strict';

  var BASE_STORAGE_KEY = 'codequest_v2';
  var storageNamespace = '';
  var storage = window.CQ_STORAGE;

  var defaults = {
    currentLevel: 0,
    totalXP: 0,
    html: '',
    css: '',
    js: '',
    userName: 'Your Name',
    completedLevels: [],
    questId: 'portfolio'
  };

  var data = Object.assign({}, defaults);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function initDefaults(initial) {
    defaults = Object.assign({}, defaults, clone(initial || {}));
    defaults.questId = storageNamespace || defaults.questId || 'portfolio';
    reset(false);
  }

  function getStorageKey() {
    return storageNamespace ? BASE_STORAGE_KEY + '_' + storageNamespace : BASE_STORAGE_KEY;
  }

  function readSaved(key) {
    if (storage && storage.getJSON) return storage.getJSON(key, null);
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setStorageNamespace(namespace) {
    storageNamespace = String(namespace || '').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'portfolio';
    defaults.questId = storageNamespace;
    data.questId = storageNamespace;
    return getStorageKey();
  }

  function save() {
    data.questId = storageNamespace || data.questId || 'portfolio';
    if (storage && storage.setJSON) {
      storage.setJSON(getStorageKey(), data);
      return;
    }
    try { localStorage.setItem(getStorageKey(), JSON.stringify(data)); } catch (e) {}
  }

  function load() {
    var key = getStorageKey();
    var saved = readSaved(key);

    if (!saved && key !== BASE_STORAGE_KEY) {
      var legacy = readSaved(BASE_STORAGE_KEY);
      if (legacy && legacy.questId === storageNamespace) {
        saved = legacy;
        if (storage && storage.setJSON) storage.setJSON(key, legacy);
        else {
          try { localStorage.setItem(key, JSON.stringify(legacy)); } catch (e) {}
        }
      }
    }

    if (saved) {
      Object.assign(data, clone(defaults), saved);
      data.questId = storageNamespace || data.questId || defaults.questId || 'portfolio';
      if (!Array.isArray(data.completedLevels)) data.completedLevels = [];
    }
    return data;
  }

  function reset(shouldSave) {
    Object.keys(data).forEach(function (key) { delete data[key]; });
    Object.assign(data, clone(defaults));
    if (shouldSave !== false) save();
    return data;
  }

  function setProgress(currentLevel, totalXP) {
    data.currentLevel = currentLevel;
    data.totalXP = totalXP;
    save();
  }

  function updateCode(chapter, code) {
    if (chapter === 'HTML') data.html = code;
    if (chapter === 'CSS') data.css = (data.css + '\n' + code).trim();
    if (chapter === 'JS') data.js = (data.js + '\n' + code).trim();
    save();
  }

  function completeLevel(level) {
    if (!data.completedLevels.includes(level.id)) {
      data.completedLevels.push(level.id);
      data.totalXP += level.xp || 0;
      save();
      return true;
    }
    save();
    return false;
  }

  function setUserName(name) {
    if (name) data.userName = String(name).trim();
    save();
  }

  window.CQ_STATE = {
    data: data,
    initDefaults: initDefaults,
    load: load,
    save: save,
    reset: reset,
    setProgress: setProgress,
    updateCode: updateCode,
    completeLevel: completeLevel,
    setUserName: setUserName,
    setStorageNamespace: setStorageNamespace,
    getStorageKey: getStorageKey,
    storageKey: BASE_STORAGE_KEY,
    baseStorageKey: BASE_STORAGE_KEY
  };
})();
