(function () {
  var fields = ['selling-price', 'target-margin', 'quantity', 'marketplace-fees', 'marketplace-fee-percent', 'freight', 'duty', 'customs', 'local-delivery', 'other-costs'];
  var symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
  var example = { currency: 'USD', sellingPrice: 29.99, targetMargin: 30, quantity: 1000, marketplaceFees: 1.5, marketplaceFeePercent: 5, freight: 1.2, duty: 0.8, customs: 0.35, localDelivery: 0.9, otherCosts: 0.2 };
  var form = document.getElementById('price-form');

  function addPercentageFeeField() {
    var feeField = document.getElementById('marketplace-fees').closest('.field');
    var field = document.createElement('div');
    field.className = 'field';
    field.innerHTML = '<label for="marketplace-fee-percent">Selling / Marketplace Fee %</label><div class="input-with-suffix"><input id="marketplace-fee-percent" type="number" min="0" max="100" step="0.1" placeholder="e.g. 5"><span>%</span></div><p class="field-error" id="marketplace-fee-percent-error"></p>';
    feeField.parentElement.insertBefore(field, feeField.nextSibling);
  }

  function readNumber(id, rule, label) {
    var input = document.getElementById(id);
    var raw = input.value.trim();
    var number = raw === '' ? 0 : Number(raw);
    var invalid = !Number.isFinite(number) || number < 0 || (rule === 'positive' && number <= 0) || (rule === 'percent' && number > 100);
    var error = document.getElementById(id + '-error');
    input.classList.toggle('input-error', invalid && raw !== '');
    if (raw !== '' && !Number.isFinite(number)) error.textContent = 'Enter a valid number.';
    else if (raw !== '' && number < 0) error.textContent = 'Negative values are not allowed.';
    else if (rule === 'positive' && raw !== '' && number <= 0) error.textContent = label + ' must be greater than 0.';
    else if (rule === 'percent' && raw !== '' && number > 100) error.textContent = 'Margin must be 100% or less.';
    else error.textContent = '';
    return invalid ? 0 : number;
  }

  function money(number, currency) {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 2 }).format(Number.isFinite(number) ? number : 0); }
    catch (error) { return (symbols[currency] || '') + (Number.isFinite(number) ? number.toFixed(2) : '0.00'); }
  }

  function calculate() {
    var sellingPrice = readNumber('selling-price', 'positive', 'Selling price');
    var margin = readNumber('target-margin', 'percent', 'Target margin');
    var quantity = readNumber('quantity', 'positive', 'Quantity');
    var fees = readNumber('marketplace-fees', 'optional', 'Marketplace fees');
    var feePercent = readNumber('marketplace-fee-percent', 'percent', 'Fee percentage');
    var freight = readNumber('freight', 'optional', 'Freight');
    var duty = readNumber('duty', 'optional', 'Import duty');
    var customs = readNumber('customs', 'optional', 'Customs');
    var localDelivery = readNumber('local-delivery', 'optional', 'Local delivery');
    var other = readNumber('other-costs', 'optional', 'Other costs');
    var currency = document.getElementById('currency').value;
    var percentageFeePerUnit = sellingPrice * feePercent / 100;
    var nonProduct = fees + percentageFeePerUnit + freight + duty + customs + localDelivery + other;
    var targetProfit = sellingPrice * margin / 100;
    var targetLanded = sellingPrice - targetProfit;
    var maxSupplier = targetLanded - nonProduct;
    var valid = sellingPrice > 0 && quantity > 0 && margin >= 0 && margin <= 100;
    var supplierDisplay = Math.max(0, maxSupplier);
    var expectedProfit = sellingPrice - (supplierDisplay + nonProduct);
    if (!valid) { supplierDisplay = 0; expectedProfit = 0; }
    var totalProfit = expectedProfit * quantity;
    render({ currency: currency, sellingPrice: sellingPrice, margin: margin, quantity: quantity, fees: fees, feePercent: feePercent, percentageFeePerUnit: percentageFeePerUnit, freight: freight, duty: duty, customs: customs, localDelivery: localDelivery, other: other, nonProduct: nonProduct, targetProfit: targetProfit, targetLanded: targetLanded, maxSupplier: supplierDisplay, maxOrder: supplierDisplay * quantity, expectedProfit: expectedProfit, totalProfit: totalProfit, valid: valid });
  }

  function render(data) {
    document.querySelectorAll('[data-currency-symbol]').forEach(function (element) { element.textContent = symbols[data.currency] || data.currency; });
    document.getElementById('max-unit-price').textContent = money(data.maxSupplier, data.currency);
    document.getElementById('max-order-value').textContent = money(data.maxOrder, data.currency);
    document.getElementById('negotiation-target').textContent = money(data.maxSupplier, data.currency) + ' / unit';
    document.getElementById('target-landed-cost').textContent = money(data.targetLanded, data.currency);
    document.getElementById('expected-profit').textContent = money(data.expectedProfit, data.currency);
    document.getElementById('expected-total-profit').textContent = money(data.totalProfit, data.currency);
    document.getElementById('non-product-cost').textContent = money(data.nonProduct, data.currency);
    document.getElementById('fee-detail').textContent = 'Marketplace fees / unit: ' + money(data.fees, data.currency) + ' per-unit + ' + money(data.percentageFeePerUnit, data.currency) + ' percentage fee = ' + money(data.fees + data.percentageFeePerUnit, data.currency);
    document.getElementById('margin-label').textContent = data.margin.toFixed(1) + '% target margin';
    document.getElementById('target-note').textContent = data.maxSupplier < 0 && data.valid ? 'The target margin is not achievable with these non-product costs at the current selling price.' : 'Your maximum supplier price before the target margin is missed.';
    document.getElementById('result-status').textContent = !data.valid ? 'Enter a selling price, margin and quantity to calculate.' : data.maxSupplier < 0 ? 'Non-product costs exceed the available landed cost budget.' : 'Use this as a supplier negotiation target, not a guaranteed quote.';
    var parts = [{ id: 'supplier-bar', value: data.maxSupplier }, { id: 'cost-bar', value: data.nonProduct }, { id: 'profit-bar', value: data.targetProfit }];
    var denominator = data.sellingPrice > 0 ? data.sellingPrice : 1;
    parts.forEach(function (part) { document.getElementById(part.id).style.width = Math.min(100, Math.max(0, part.value / denominator * 100)) + '%'; });
  }

  function kebab(name) { return name.replace(/[A-Z]/g, function (letter) { return '-' + letter.toLowerCase(); }); }
  function setValues(data) { Object.keys(data).forEach(function (key) { var input = document.getElementById(kebab(key)); if (input) input.value = data[key]; }); calculate(); }
  function reset() { fields.forEach(function (id) { document.getElementById(id).value = ''; }); document.getElementById('currency').value = 'USD'; document.querySelectorAll('.field-error').forEach(function (error) { error.textContent = ''; }); document.querySelectorAll('.input-error').forEach(function (input) { input.classList.remove('input-error'); }); calculate(); }

  addPercentageFeeField();
  var feeDetail = document.createElement('p');
  feeDetail.className = 'fee-detail';
  feeDetail.id = 'fee-detail';
  feeDetail.setAttribute('aria-live', 'polite');
  document.querySelector('.result-metrics').after(feeDetail);
  document.querySelector('label[for="target-margin"]').classList.add('has-help');
  fields.forEach(function (id) { document.getElementById(id).addEventListener('input', calculate); });
  document.getElementById('currency').addEventListener('change', calculate);
  document.getElementById('load-example').addEventListener('click', function () { setValues(example); });
  document.getElementById('reset-calculator').addEventListener('click', reset);
  form.addEventListener('submit', function (event) { event.preventDefault(); calculate(); });
  reset();
})();
