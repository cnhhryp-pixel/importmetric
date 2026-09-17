(function () {
  var supplierList = document.getElementById('supplier-list');
  var comparisonBody = document.getElementById('comparison-body');
  var currencyAlert = document.getElementById('currency-alert');
  var comparisonNotice = document.getElementById('comparison-notice');
  var supplierCount = document.getElementById('supplier-count');
  var supplierNumber = 0;
  var lastSuppliers = [];
  var selectedSupplierId = '';
  var exampleData = [
    { name: 'Supplier A', currency: 'USD', unitPrice: 8.4, quantity: 1000, moq: 500, incoterm: 'FOB', freight: 420, duty: 180, other: 65, leadTime: 28 },
    { name: 'Supplier B', currency: 'USD', unitPrice: 7.95, quantity: 1000, moq: 1000, incoterm: 'CIF', freight: 690, duty: 205, other: 40, leadTime: 35 }
  ];

  function addSupplier(values) {
    supplierNumber += 1;
    var id = supplierNumber;
    var data = values || { name: 'Supplier ' + String.fromCharCode(64 + id), currency: 'USD', unitPrice: '', quantity: '', moq: '', incoterm: 'FOB', freight: '', duty: '', other: '', leadTime: '' };
    var card = document.createElement('article');
    card.className = 'supplier-card';
    card.dataset.supplierId = id;
    card.innerHTML = '<div class="supplier-card-header"><h3><span class="supplier-index">0' + id + '</span><span class="supplier-title"></span></h3><button class="remove-supplier" type="button">Remove Supplier</button></div>' +
      '<p class="card-warning" hidden>Quantity is below this supplier\'s MOQ.</p>' +
      '<div class="field-grid">' +
      field('name', 'Supplier Name', 'text', data.name, 'e.g. Acme Trading') +
      field('currency', 'Currency', 'select', data.currency) +
      field('unitPrice', 'Unit Price', 'number', data.unitPrice, '0.00', '0.01') +
      field('quantity', 'Quantity', 'number', data.quantity, 'e.g. 1000', '1') +
      field('moq', 'MOQ', 'number', data.moq, 'e.g. 500', '1') +
      field('incoterm', 'Incoterm', 'incoterm', data.incoterm) +
      field('freight', 'Shipping / Freight Cost', 'number', data.freight, '0.00', '0.01') +
      field('duty', 'Duty & Tax', 'number', data.duty, '0.00', '0.01') +
      field('other', 'Other Costs', 'number', data.other, '0.00', '0.01') +
      field('leadTime', 'Lead Time (days)', 'number', data.leadTime, 'e.g. 30', '1') +
      '</div>';
    supplierList.appendChild(card);
    Object.keys(data).forEach(function (name) {
      var input = card.querySelector('[data-field="' + name + '"]');
      if (input) input.value = data[name] === undefined ? '' : data[name];
    });
    card.querySelector('.remove-supplier').addEventListener('click', function () { if (supplierList.children.length > 2) { card.remove(); update(); } });
    card.querySelectorAll('input, select').forEach(function (input) { input.addEventListener('input', update); input.addEventListener('change', update); });
    update();
  }

  function field(name, label, type, value, placeholder, step) {
    var id = 'supplier-' + supplierNumber + '-' + name;
    var control;
    if (type === 'select') {
      control = '<select id="' + id + '" data-field="' + name + '"><option>USD</option><option>EUR</option><option>GBP</option><option>CNY</option><option>CAD</option><option>AUD</option><option>JPY</option></select>';
    } else if (type === 'incoterm') {
      control = '<select id="' + id + '" data-field="' + name + '"><option>EXW</option><option>FOB</option><option>CIF</option><option>DDP</option></select>';
    } else {
      control = '<input id="' + id + '" data-field="' + name + '" type="' + type + '"' + (type === 'number' ? ' min="0" step="' + (step || '0.01') + '"' : '') + ' placeholder="' + (placeholder || '') + '">';
    }
    return '<div class="field"><label for="' + id + '">' + label + '</label>' + control + '<p class="field-error" data-error-for="' + name + '"></p></div>';
  }

  function numberValue(input, requirePositive, label) {
    var raw = input.value.trim();
    var value = raw === '' ? 0 : Number(raw);
    var invalid = !Number.isFinite(value) || value < 0 || (requirePositive && value <= 0);
    input.classList.toggle('input-error', invalid && raw !== '');
    var error = input.parentElement.querySelector('.field-error');
    if (raw !== '' && !Number.isFinite(value)) error.textContent = 'Enter a valid number.';
    else if (raw !== '' && value < 0) error.textContent = 'Negative values are not allowed.';
    else if (requirePositive && raw !== '' && value <= 0) error.textContent = label + ' must be greater than 0.';
    else error.textContent = '';
    return invalid ? 0 : value;
  }

  function readSuppliers() {
    return Array.from(supplierList.children).map(function (card) {
      var get = function (name) { return card.querySelector('[data-field="' + name + '"]'); };
      var quantity = numberValue(get('quantity'), true, 'Quantity');
      var moq = numberValue(get('moq'), false, 'MOQ');
      var unitPrice = numberValue(get('unitPrice'), true, 'Unit Price');
      var freight = numberValue(get('freight'), false, 'Shipping / Freight Cost');
      var duty = numberValue(get('duty'), false, 'Duty & Tax');
      var other = numberValue(get('other'), false, 'Other Costs');
      var leadTime = numberValue(get('leadTime'), false, 'Lead Time');
      var name = get('name').value.trim() || 'Unnamed supplier';
      card.querySelector('.supplier-title').textContent = name;
      return { card: card, name: name, currency: get('currency').value, unitPrice: unitPrice, quantity: quantity, moq: moq, incoterm: get('incoterm').value, freight: freight, duty: duty, other: other, leadTime: leadTime, productCost: unitPrice * quantity, totalCost: unitPrice * quantity + freight + duty + other };
    });
  }

  function money(value, currency) {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0); }
    catch (error) { return currency + ' ' + (Number.isFinite(value) ? value.toFixed(2) : '0.00'); }
  }

  function update() {
    var suppliers = readSuppliers();
    lastSuppliers = suppliers;
    var selector = document.getElementById('report-supplier-select');
    if (selector) {
      var current = selector.value;
      selector.innerHTML = '<option value="">Select supplier to report</option>' + suppliers.map(function (item) { return '<option value="' + item.card.dataset.supplierId + '">' + escapeHtml(item.name) + '</option>'; }).join('');
      selector.value = suppliers.some(function (item) { return item.card.dataset.supplierId === current; }) ? current : '';
    }
    var validSuppliers = suppliers.filter(function (item) { return item.quantity > 0 && item.unitPrice > 0; });
    var currencies = suppliers.map(function (item) { return item.currency; }).filter(function (value, index, values) { return values.indexOf(value) === index; });
    var currencyMismatch = currencies.length > 1;
    var comparable = !currencyMismatch && validSuppliers.length >= 2;
    currencyAlert.hidden = !currencyMismatch;
    var lowestTotal = comparable ? Math.min.apply(null, validSuppliers.map(function (item) { return item.totalCost; })) : Infinity;
    var lowestUnit = comparable ? Math.min.apply(null, validSuppliers.map(function (item) { return item.totalCost / item.quantity; })) : Infinity;
    var lowestTotalCount = comparable ? validSuppliers.filter(function (item) { return item.totalCost === lowestTotal; }).length : 0;
    var lowestUnitCount = comparable ? validSuppliers.filter(function (item) { return item.totalCost / item.quantity === lowestUnit; }).length : 0;
    comparisonBody.innerHTML = suppliers.map(function (item) {
      var effective = item.quantity > 0 ? item.totalCost / item.quantity : 0;
      var belowMoq = item.quantity > 0 && item.moq > 0 && item.quantity < item.moq;
      var totalClass = comparable && item.quantity > 0 && item.unitPrice > 0 && item.totalCost === lowestTotal ? 'is-lowest' : '';
      var unitClass = comparable && item.quantity > 0 && item.unitPrice > 0 && effective === lowestUnit ? 'is-lowest' : '';
      var moqClass = belowMoq ? 'is-warning' : '';
      item.card.querySelector('.card-warning').hidden = !belowMoq;
      return '<tr><td>' + escapeHtml(item.name) + (belowMoq ? '<span class="row-warning">Quantity is below this supplier\'s MOQ.</span>' : '') + '</td><td>' + money(item.unitPrice, item.currency) + '</td><td>' + money(item.productCost, item.currency) + '</td><td>' + money(item.freight, item.currency) + '</td><td>' + money(item.duty, item.currency) + '</td><td>' + money(item.other, item.currency) + '</td><td class="' + totalClass + '">' + money(item.totalCost, item.currency) + '</td><td class="' + unitClass + '">' + money(effective, item.currency) + '</td><td class="' + moqClass + '">' + formatNumber(item.moq) + '</td><td>' + formatNumber(item.leadTime) + (item.leadTime ? ' days' : '') + '</td><td>' + item.incoterm + '</td></tr>';
    }).join('');
    supplierCount.textContent = suppliers.length + (suppliers.length === 1 ? ' supplier' : ' suppliers');
    Array.from(supplierList.querySelectorAll('.remove-supplier')).forEach(function (button) { button.disabled = suppliers.length <= 2; });
    if (currencyMismatch) comparisonNotice.textContent = 'Quotes use different currencies. Convert them to the same currency before comparing costs.';
    else if (validSuppliers.length < 2) comparisonNotice.textContent = 'Enter quote details above, then compare suppliers.';
    else {
      var messages = ['Lowest cost highlights are based on the quotes currently entered.'];
      if (lowestTotalCount > 1) messages.push('Tie: lowest total cost is shared by ' + lowestTotalCount + ' suppliers.');
      if (lowestUnitCount > 1) messages.push('Tie: lowest effective cost per unit is shared by ' + lowestUnitCount + ' suppliers.');
      comparisonNotice.textContent = messages.join(' ');
    }
  }

  function formatNumber(value) { return Number.isFinite(value) && value > 0 ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) : '-'; }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, function (character) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]; }); }
  function reset() { supplierList.innerHTML = ''; supplierNumber = 0; addSupplier(); addSupplier(); }
  function loadExample() { supplierList.innerHTML = ''; supplierNumber = 0; exampleData.forEach(addSupplier); }

  document.getElementById('add-supplier').addEventListener('click', function () { addSupplier(); });
  document.getElementById('reset-quotes').addEventListener('click', reset);
  document.getElementById('load-example').addEventListener('click', loadExample);
  document.getElementById('compare-quotes').addEventListener('click', function () { document.querySelector('.results-section').scrollIntoView({ behavior: 'smooth', block: 'start' }); update(); });
  var reportControls = document.createElement('div');
  reportControls.className = 'supplier-report-controls';
  reportControls.innerHTML = '<label for="report-supplier-select">Report supplier</label><select id="report-supplier-select"><option value="">Select supplier to report</option></select>';
  document.querySelector('.results-heading').appendChild(reportControls);
  if (window.ImportMetricDecisionReport) window.ImportMetricDecisionReport.showAction(document.querySelector('.results-heading'), 'supplierQuote', function () { var id = document.getElementById('report-supplier-select').value; var item = lastSuppliers.find(function (supplier) { return supplier.card.dataset.supplierId === id; }); if (!item || item.quantity <= 0 || item.unitPrice <= 0) return { valid: false }; return { supplierName: item.name, currency: item.currency, unitPrice: item.unitPrice, quantity: item.quantity, moq: item.moq, effectiveCostPerUnit: item.quantity > 0 ? item.totalCost / item.quantity : null, totalCost: item.totalCost, leadTime: item.leadTime, incoterm: item.incoterm }; }, 'Supplier quote');
  reset();
})();