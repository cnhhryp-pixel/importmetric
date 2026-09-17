(function (window) {
  'use strict';
  var STORAGE_KEY = 'importmetricDecisionReportV1';
  var VERSION = 1;
  var empty = { version: VERSION, updatedAt: '', project: { productName: '', supplierName: '', currency: '' }, supplierQuote: null, landedCost: null, priceCeiling: null, moqRisk: null };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function clean(value) { return value === undefined || value === null || (typeof value === 'number' && !Number.isFinite(value)) ? null : value; }
  function read() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(empty);
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== VERSION || typeof parsed !== 'object') return clone(empty);
      var report = clone(empty);
      ['project', 'supplierQuote', 'landedCost', 'priceCeiling', 'moqRisk'].forEach(function (key) { if (parsed[key] && typeof parsed[key] === 'object') report[key] = Object.assign(report[key] || {}, parsed[key]); });
      report.version = VERSION;
      report.updatedAt = typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '';
      return report;
    } catch (error) { return clone(empty); }
  }
  function saveSection(section, data) {
    var report = read();
    if (!['supplierQuote', 'landedCost', 'priceCeiling', 'moqRisk'].includes(section)) return false;
    report[section] = Object.keys(data || {}).reduce(function (result, key) { var value = clean(data[key]); if (value !== null) result[key] = value; return result; }, {});
    report.updatedAt = new Date().toISOString();
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(report)); return true; } catch (error) { return false; }
  }
  function updateProject(project) { var report = read(); report.project = { productName: String(project.productName || '').slice(0, 120), supplierName: String(project.supplierName || '').slice(0, 120), currency: String(project.currency || '').slice(0, 8) }; report.updatedAt = new Date().toISOString(); try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(report)); return true; } catch (error) { return false; } }
  function clear() { try { window.localStorage.removeItem(STORAGE_KEY); return true; } catch (error) { return false; } }
  function showAction(container, section, getData, label) {
    var wrap = document.createElement('div'); wrap.className = 'report-action';
    var button = document.createElement('button'); button.type = 'button'; button.className = 'button report-button'; button.textContent = 'Add to Decision Report';
    var status = document.createElement('span'); status.className = 'report-action-status'; status.setAttribute('aria-live', 'polite');
    button.addEventListener('click', function () { var data = getData(); if (!data || data.valid === false) { status.textContent = 'Complete the required inputs before saving.'; return; } if (saveSection(section, data)) status.innerHTML = (label || 'Current results') + ' saved. <a href="import-decision-report.html">View Decision Report</a>'; else status.textContent = 'Report storage is unavailable in this browser.'; });
    wrap.appendChild(button); wrap.appendChild(status); container.appendChild(wrap); return wrap;
  }
  window.ImportMetricDecisionReport = { key: STORAGE_KEY, read: read, saveSection: saveSection, updateProject: updateProject, clear: clear, showAction: showAction };
})(window);
