(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();
/* ImportMetric GA4 analytics */
(function (window, document) {
  'use strict';

  var MEASUREMENT_ID = 'G-DEERP83TSF';
  var path = window.location.pathname;
  var toolNames = {
    '/supplier-quote-comparison.html': 'supplier_quote_comparison',
    '/landed-cost-calculator.html': 'landed_cost_calculator',
    '/maximum-purchase-price-calculator.html': 'maximum_purchase_price_calculator',
    '/moq-inventory-risk-calculator.html': 'moq_inventory_risk_calculator'
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(tag);

  function send(name, params) {
    window.gtag('event', name, params || {});
  }

  function currentTool() {
    return toolNames[path] || '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var tool = currentTool();
    var calculatorUsed = false;

    if (tool) {
      var markCalculatorUse = function (method) {
        if (calculatorUsed) return;
        calculatorUsed = true;
        send('calculator_use', { tool_name: tool, interaction_method: method });
      };

      document.addEventListener('input', function (event) {
        if (event.target && event.target.matches('input, select')) markCalculatorUse('manual_input');
      }, { passive: true });

      document.addEventListener('change', function (event) {
        if (event.target && event.target.matches('input, select')) markCalculatorUse('manual_input');
      }, { passive: true });
    }

    if (path === '/import-decision-report.html') {
      send('view_decision_report');
    }

    document.addEventListener('click', function (event) {
      var target = event.target.closest('a, button');
      if (!target) return;

      if (target.id === 'load-example') {
        send('load_example', { tool_name: currentTool() });
        if (tool && !calculatorUsed) {
          calculatorUsed = true;
          send('calculator_use', { tool_name: tool, interaction_method: 'load_example' });
        }
      }

      if (target.id === 'compare-quotes') {
        if (tool && !calculatorUsed) {
          calculatorUsed = true;
          send('calculator_use', { tool_name: tool, interaction_method: 'calculate_button' });
        }
      }

      if (target.matches('.report-button') || target.textContent.trim().indexOf('Add to Decision Report') === 0) {
        send('add_to_decision_report', { tool_name: currentTool() });
      }

      if (target.id === 'print-report') {
        send('print_decision_report');
      }

      if (target.tagName === 'A' && path.indexOf('/guides/') === 0) {
        var href = target.getAttribute('href') || '';
        if (/supplier-quote-comparison\.html|landed-cost-calculator\.html|maximum-purchase-price-calculator\.html|moq-inventory-risk-calculator\.html/.test(href)) {
          send('guide_to_tool_click', {
            guide_path: path,
            destination: href,
            link_text: target.textContent.trim().slice(0, 100)
          });
        }
      }
    });
  });
})(window, document);
