(function () {
  var fields = ['product-cost', 'quantity', 'origin-cost', 'freight', 'insurance', 'duty-rate', 'customs-fees', 'destination-cost', 'other-costs'];
  var currencySymbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
  var incotermCopy = {
    EXW: 'EXW usually leaves origin handling, export work and main transport to the buyer. Enter the actual costs you know.',
    FOB: 'FOB commonly includes delivery to the export port and loading. Freight, insurance and destination costs may still be yours.',
    CIF: 'CIF commonly includes product cost, insurance and freight to the destination port. Check what customs and delivery remain.',
    DDP: 'DDP may include import clearance, duty and delivery from the seller. Keep entering actual known costs to verify the quote.'
  };
  var colors = ['#0d5c5c', '#ee7257', '#d6a64b', '#7d9b91', '#bd7964', '#5d7772', '#9eaa94', '#c4a66a'];
  var example = { currency: 'USD', productCost: 8400, quantity: 1000, incoterm: 'FOB', originCost: 180, freight: 620, insurance: 65, dutyRate: 6.5, customsFees: 145, destinationCost: 230, otherCosts: 55 };
  var form = document.getElementById('cost-form');

  function value(id, positive, label) {
    var input = document.getElementById(id);
    var raw = input.value.trim();
    var number = raw === '' ? 0 : Number(raw);
    var invalid = !Number.isFinite(number) || number < 0 || (positive && number <= 0);
    var error = document.getElementById(id + '-error');
    input.classList.toggle('input-error', invalid && raw !== '');
    if (raw !== '' && !Number.isFinite(number)) error.textContent = 'Enter a valid number.';
    else if (raw !== '' && number < 0) error.textContent = 'Negative values are not allowed.';
    else if (positive && raw !== '' && number <= 0) error.textContent = label + ' must be greater than 0.';
    else error.textContent = '';
    return invalid ? 0 : number;
  }

  function formatMoney(number, currency) {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 2 }).format(Number.isFinite(number) ? number : 0); }
    catch (error) { return (currencySymbols[currency] || '') + (Number.isFinite(number) ? number.toFixed(2) : '0.00'); }
  }

  function calculate() {
    var product = value('product-cost', true, 'Product cost');
    var quantity = value('quantity', true, 'Quantity');
    var origin = value('origin-cost', false, 'Origin cost');
    var freight = value('freight', false, 'Freight');
    var insurance = value('insurance', false, 'Insurance');
    var dutyRate = value('duty-rate', false, 'Duty rate');
    var customs = value('customs-fees', false, 'Customs fees');
    var destination = value('destination-cost', false, 'Destination cost');
    var other = value('other-costs', false, 'Other costs');
    var currency = document.getElementById('currency').value;
    var dutyBase = product + freight + insurance;
    var duty = dutyBase * (dutyRate / 100);
    var logistics = origin + freight + insurance + destination;
    var nonProduct = logistics + duty + customs + other;
    var total = product + nonProduct;
    var valid = product > 0 && quantity > 0;
    var unit = valid ? total / quantity : 0;
    var totalSafe = Number.isFinite(total) ? total : 0;
    var percentProduct = totalSafe > 0 ? product / totalSafe * 100 : 0;
    var percentNonProduct = totalSafe > 0 ? nonProduct / totalSafe * 100 : 0;
    render({ currency: currency, product: product, quantity: quantity, origin: origin, freight: freight, insurance: insurance, dutyRate: dutyRate, dutyBase: dutyBase, duty: duty, customs: customs, destination: destination, other: other, logistics: logistics, nonProduct: nonProduct, total: totalSafe, unit: Number.isFinite(unit) ? unit : 0, percentProduct: percentProduct, percentNonProduct: percentNonProduct, valid: valid });
  }

  function render(result) {
    document.querySelectorAll('[data-currency-symbol]').forEach(function (element) { element.textContent = currencySymbols[result.currency] || result.currency; });
    document.getElementById('total-landed-cost').textContent = formatMoney(result.total, result.currency);
    document.getElementById('landed-cost-unit').textContent = formatMoney(result.unit, result.currency);
    document.getElementById('duty-amount').textContent = formatMoney(result.duty, result.currency);
    document.getElementById('duty-base-label').textContent = 'Based on a ' + formatMoney(result.dutyBase, result.currency) + ' duty base';
    document.getElementById('logistics-cost').textContent = formatMoney(result.logistics, result.currency);
    document.getElementById('non-product-cost').textContent = formatMoney(result.nonProduct, result.currency);
    document.getElementById('non-product-percent').textContent = result.percentNonProduct.toFixed(1) + '%';
    document.getElementById('product-percent').textContent = result.percentProduct.toFixed(1) + '%';
    document.getElementById('additional-cost').textContent = formatMoney(result.nonProduct, result.currency);
    document.getElementById('result-status').textContent = result.valid ? 'Estimate based on the costs entered above.' : 'Enter a product cost and quantity to calculate.';
    var parts = [{ label: 'Product', value: result.product }, { label: 'Origin', value: result.origin }, { label: 'Freight', value: result.freight }, { label: 'Insurance', value: result.insurance }, { label: 'Duty', value: result.duty }, { label: 'Customs', value: result.customs }, { label: 'Destination', value: result.destination }, { label: 'Other', value: result.other }];
    document.getElementById('breakdown-list').innerHTML = parts.map(function (part, index) { var percent = result.total > 0 ? part.value / result.total * 100 : 0; return '<div class="breakdown-row"><label>' + part.label + '</label><div class="breakdown-track"><div class="breakdown-fill" style="width:' + Math.min(100, Math.max(0, percent)) + '%;background:' + colors[index] + '"></div></div><span class="breakdown-percent">' + percent.toFixed(1) + '%</span><strong>' + formatMoney(part.value, result.currency) + '</strong></div>'; }).join('');
  }

  function kebabCase(name) { return name.replace(/[A-Z]/g, function (letter) { return '-' + letter.toLowerCase(); }); }
  function setValues(data) { Object.keys(data).forEach(function (key) { var input = document.getElementById(kebabCase(key)); if (input) input.value = data[key]; }); document.getElementById('incoterm-context').textContent = incotermCopy[document.getElementById('incoterm').value]; calculate(); }
  function reset() { fields.forEach(function (id) { document.getElementById(id).value = ''; }); document.getElementById('currency').value = 'USD'; document.getElementById('incoterm').value = 'EXW'; document.querySelectorAll('.field-error').forEach(function (error) { error.textContent = ''; }); document.querySelectorAll('.input-error').forEach(function (input) { input.classList.remove('input-error'); }); document.getElementById('incoterm-context').textContent = incotermCopy.EXW; calculate(); }

  fields.forEach(function (id) { document.getElementById(id).addEventListener('input', calculate); });
  document.getElementById('currency').addEventListener('change', calculate);
  document.getElementById('incoterm').addEventListener('change', function () { document.getElementById('incoterm-context').textContent = incotermCopy[this.value]; calculate(); });
  document.getElementById('load-example').addEventListener('click', function () { setValues(example); });
  document.getElementById('reset-calculator').addEventListener('click', reset);
  form.addEventListener('submit', function (event) { event.preventDefault(); calculate(); });
  reset();
})();
