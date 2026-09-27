(function () {
  'use strict';
  var symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
  var ids = ['quantity','selling-price','supplier-cost','freight','duty','selling-fees','other-costs'];
  var example = { currency:'USD', quantity:1000, sellingPrice:29.99, supplierCost:12.50, freight:1.80, duty:0.75, sellingFees:3.00, otherCosts:0.45 };

  function money(value, currency) {
    try { return new Intl.NumberFormat('en-US',{style:'currency',currency:currency,maximumFractionDigits:2}).format(Number.isFinite(value)?value:0); }
    catch(e) { return (symbols[currency]||'') + (Number.isFinite(value)?value.toFixed(2):'0.00'); }
  }
  function read(id, positive) {
    var input=document.getElementById(id), raw=input.value.trim(), n=raw===''?0:Number(raw);
    var invalid=!Number.isFinite(n)||n<0||(positive&&n<=0), err=document.getElementById(id+'-error');
    input.classList.toggle('input-error',invalid&&raw!=='');
    if(raw!==''&&!Number.isFinite(n)) err.textContent='Enter a valid number.';
    else if(raw!==''&&n<0) err.textContent='Negative values are not allowed.';
    else if(positive&&raw!==''&&n<=0) err.textContent='Value must be greater than 0.';
    else err.textContent='';
    return invalid?0:n;
  }
  function calculate() {
    var currency=document.getElementById('currency').value;
    var quantity=read('quantity',false), selling=read('selling-price',true), supplier=read('supplier-cost',false);
    var freight=read('freight',false), duty=read('duty',false), fees=read('selling-fees',false), other=read('other-costs',false);
    var nonSupplier=freight+duty+fees+other, totalCost=supplier+nonSupplier, profit=selling-totalCost;
    var margin=selling>0?profit/selling*100:0, markup=totalCost>0?profit/totalCost*100:0;
    var valid=selling>0;
    document.querySelectorAll('[data-currency-symbol]').forEach(function(el){el.textContent=symbols[currency]||currency;});
    document.getElementById('profit-margin').textContent=(valid?margin:0).toFixed(1)+'%';
    document.getElementById('profit-unit').textContent=money(valid?profit:0,currency);
    document.getElementById('total-cost-unit').textContent=money(totalCost,currency);
    document.getElementById('markup').textContent=(valid&&totalCost>0?markup:0).toFixed(1)+'%';
    document.getElementById('total-revenue').textContent=money(valid?selling*quantity:0,currency);
    document.getElementById('total-profit').textContent=money(valid?profit*quantity:0,currency);
    document.getElementById('break-even').textContent=money(totalCost,currency);
    document.getElementById('non-supplier-cost').textContent=money(nonSupplier,currency);
    document.getElementById('result-status').textContent=!valid?'Enter a selling price and supplier cost to calculate.':profit<0?'The entered selling price is below your total entered cost per unit.':'Use the result to compare pricing and sourcing scenarios before ordering.';
  }
  function setExample(){
    document.getElementById('currency').value=example.currency;
    document.getElementById('quantity').value=example.quantity;
    document.getElementById('selling-price').value=example.sellingPrice;
    document.getElementById('supplier-cost').value=example.supplierCost;
    document.getElementById('freight').value=example.freight;
    document.getElementById('duty').value=example.duty;
    document.getElementById('selling-fees').value=example.sellingFees;
    document.getElementById('other-costs').value=example.otherCosts;
    calculate();
  }
  function reset(){
    ids.forEach(function(id){document.getElementById(id).value='';});
    document.getElementById('currency').value='USD';
    document.querySelectorAll('.field-error').forEach(function(el){el.textContent='';});
    calculate();
  }
  ids.forEach(function(id){document.getElementById(id).addEventListener('input',calculate);});
  document.getElementById('currency').addEventListener('change',calculate);
  document.getElementById('load-example').addEventListener('click',setExample);
  document.getElementById('reset-calculator').addEventListener('click',reset);
  calculate();
})();