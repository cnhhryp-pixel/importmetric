(function () {
  var fields = ['supplier-moq', 'supplier-price', 'monthly-sales', 'current-inventory', 'purchase-budget', 'target-coverage', 'storage-cost'];
  var symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
  var example = { currency: 'USD', supplierMoq: 3000, supplierPrice: 4.5, monthlySales: 500, currentInventory: 200, purchaseBudget: 10000, targetCoverage: 3, storageCost: 0.1 };
  var form = document.getElementById('moq-form');

  function readNumber(id, label) {
    var input = document.getElementById(id);
    var raw = input.value.trim();
    var number = raw === '' ? 0 : Number(raw);
    var invalid = !Number.isFinite(number) || number < 0;
    var error = document.getElementById(id + '-error');
    input.classList.toggle('input-error', invalid && raw !== '');
    if (raw !== '' && !Number.isFinite(number)) error.textContent = 'Enter a valid number.';
    else if (raw !== '' && number < 0) error.textContent = 'Negative values are not allowed.';
    else error.textContent = '';
    return invalid ? 0 : number;
  }

  function money(number, currency) {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 2 }).format(Number.isFinite(number) ? number : 0); }
    catch (error) { return (symbols[currency] || '') + (Number.isFinite(number) ? number.toFixed(2) : '0.00'); }
  }
  function units(number) { return Number.isFinite(number) ? Math.round(number).toLocaleString('en-US') : '0'; }

  function calculate() {
    var moq = readNumber('supplier-moq', 'Supplier MOQ');
    var price = readNumber('supplier-price', 'Supplier price');
    var monthlySales = readNumber('monthly-sales', 'Monthly sales');
    var currentInventory = readNumber('current-inventory', 'Current inventory');
    var budget = readNumber('purchase-budget', 'Purchase budget');
    var coverage = readNumber('target-coverage', 'Target coverage');
    var storage = readNumber('storage-cost', 'Storage cost');
    var currency = document.getElementById('currency').value;
    var orderValue = moq * price;
    var totalAfterOrder = currentInventory + moq;
    var months = monthlySales > 0 ? totalAfterOrder / monthlySales : null;
    var targetQuantity = monthlySales * coverage;
    var targetPurchase = Math.max(0, targetQuantity - currentInventory);
    var excessUnits = Math.max(0, moq - targetPurchase);
    var excessCash = excessUnits * price;
    var shortfall = Math.max(0, orderValue - budget);
    var remaining = Math.max(0, budget - orderValue);
    var storageEstimate = totalAfterOrder * storage;
    render({ currency: currency, moq: moq, price: price, monthlySales: monthlySales, currentInventory: currentInventory, budget: budget, coverage: coverage, storage: storage, orderValue: orderValue, totalAfterOrder: totalAfterOrder, months: months, targetQuantity: targetQuantity, targetPurchase: targetPurchase, excessUnits: excessUnits, excessCash: excessCash, shortfall: shortfall, remaining: remaining, storageEstimate: storageEstimate });
  }

  function render(data) {
    document.querySelectorAll('[data-currency-symbol]').forEach(function (element) { element.textContent = symbols[data.currency] || data.currency; });
    document.getElementById('moq-order-value').textContent = money(data.orderValue, data.currency);
    document.getElementById('months-inventory').textContent = data.months === null ? 'Unavailable' : data.months.toFixed(1) + ' mo';
    document.getElementById('target-purchase-quantity').textContent = units(data.targetPurchase);
    document.getElementById('negotiation-target').textContent = units(data.targetPurchase) + ' units';
    document.getElementById('negotiation-large').textContent = units(data.targetPurchase) + ' units';
    document.getElementById('excess-units').textContent = units(data.excessUnits);
    document.getElementById('excess-cash').textContent = money(data.excessCash, data.currency);
    document.getElementById('storage-estimate').textContent = money(data.storageEstimate, data.currency);
    document.getElementById('total-inventory').textContent = units(data.totalAfterOrder) + ' units';
    var overBudget = data.orderValue > data.budget;
    document.getElementById('budget-label').textContent = overBudget ? 'BUDGET SHORTFALL' : 'BUDGET REMAINING';
    document.getElementById('budget-result').textContent = money(overBudget ? data.shortfall : data.remaining, data.currency);
    document.getElementById('result-status').textContent = data.months === null ? 'Monthly sales are zero, so inventory coverage is unavailable.' : 'Coverage is based on the full post-order inventory estimate.';
    var signals = [];
    signals.push(data.moq > data.targetPurchase ? 'Supplier MOQ is above your target purchase quantity.' : 'Supplier MOQ is within your target purchase quantity.');
    signals.push(overBudget ? 'This MOQ exceeds your available purchase budget.' : 'This MOQ fits within your available purchase budget.');
    document.getElementById('decision-signals').innerHTML = signals.map(function (message, index) { return '<div class="decision-signal ' + (index === 0 && data.moq <= data.targetPurchase || index === 1 && !overBudget ? 'is-good' : '') + '">' + message + '</div>'; }).join('');
  }

  function kebab(name) { return name.replace(/[A-Z]/g, function (letter) { return '-' + letter.toLowerCase(); }); }
  function setValues(data) { Object.keys(data).forEach(function (key) { var input = document.getElementById(kebab(key)); if (input) input.value = data[key]; }); calculate(); }
  function reset() { fields.forEach(function (id) { document.getElementById(id).value = ''; }); document.getElementById('currency').value = 'USD'; document.querySelectorAll('.field-error').forEach(function (error) { error.textContent = ''; }); document.querySelectorAll('.input-error').forEach(function (input) { input.classList.remove('input-error'); }); calculate(); }

  fields.forEach(function (id) { document.getElementById(id).addEventListener('input', calculate); });
  document.getElementById('currency').addEventListener('change', calculate);
  document.getElementById('load-example').addEventListener('click', function () { setValues(example); });
  document.getElementById('reset-calculator').addEventListener('click', reset);
  form.addEventListener('submit', function (event) { event.preventDefault(); calculate(); });
  reset();
})();
