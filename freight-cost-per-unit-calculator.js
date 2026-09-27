(function(){
  'use strict';
  var symbols={USD:'$',EUR:'€',GBP:'£',CAD:'C$',AUD:'A$'};
  var ids=['quantity','product-cost','origin-cost','freight','insurance','clearance','destination','other-costs'];
  var example={currency:'USD',quantity:1000,productCost:8400,originCost:180,freight:620,insurance:65,clearance:145,destination:230,otherCosts:55};
  function money(v,c){try{return new Intl.NumberFormat('en-US',{style:'currency',currency:c,maximumFractionDigits:2}).format(Number.isFinite(v)?v:0);}catch(e){return(symbols[c]||'')+(Number.isFinite(v)?v.toFixed(2):'0.00');}}
  function read(id,positive){var input=document.getElementById(id),raw=input.value.trim(),n=raw===''?0:Number(raw),invalid=!Number.isFinite(n)||n<0||(positive&&n<=0),err=document.getElementById(id+'-error');input.classList.toggle('input-error',invalid&&raw!=='');if(raw!==''&&!Number.isFinite(n))err.textContent='Enter a valid number.';else if(raw!==''&&n<0)err.textContent='Negative values are not allowed.';else if(positive&&raw!==''&&n<=0)err.textContent='Quantity must be greater than 0.';else err.textContent='';return invalid?0:n;}
  function calculate(){
    var c=document.getElementById('currency').value,q=read('quantity',true),product=read('product-cost',false),origin=read('origin-cost',false),freight=read('freight',false),insurance=read('insurance',false),clearance=read('clearance',false),destination=read('destination',false),other=read('other-costs',false);
    var total=origin+freight+insurance+clearance+destination+other, per=q>0?total/q:0, productPer=q>0?product/q:0, combined=q>0?(product+total)/q:0, pct=product>0?total/product*100:null;
    document.querySelectorAll('[data-currency-symbol]').forEach(function(el){el.textContent=symbols[c]||c;});
    document.getElementById('total-logistics').textContent=money(total,c);
    document.getElementById('cost-per-unit').textContent=money(per,c);
    document.getElementById('freight-per-unit').textContent=money(q>0?(freight+insurance)/q:0,c);
    document.getElementById('ground-per-unit').textContent=money(q>0?(origin+destination)/q:0,c);
    document.getElementById('other-per-unit').textContent=money(q>0?(clearance+other)/q:0,c);
    document.getElementById('logistics-percent').textContent=pct===null?'Unavailable':pct.toFixed(1)+'%';
    document.getElementById('combined-per-unit').textContent=money(combined,c);
    document.getElementById('product-per-unit').textContent=money(productPer,c);
    document.getElementById('result-status').textContent=q<=0?'Enter an order quantity and logistics costs to calculate.':total===0?'Add one or more logistics costs to calculate the unit impact.':'Use the per-unit result when comparing supplier quotes or checking margin.';
  }
  function setExample(){Object.keys(example).forEach(function(k){var id=k.replace(/[A-Z]/g,function(x){return'-'+x.toLowerCase();}),el=document.getElementById(id);if(el)el.value=example[k];});document.getElementById('currency').value=example.currency;calculate();}
  function reset(){ids.forEach(function(id){document.getElementById(id).value='';});document.getElementById('currency').value='USD';document.querySelectorAll('.field-error').forEach(function(el){el.textContent='';});calculate();}
  ids.forEach(function(id){document.getElementById(id).addEventListener('input',calculate);});document.getElementById('currency').addEventListener('change',calculate);document.getElementById('load-example').addEventListener('click',setExample);document.getElementById('reset-calculator').addEventListener('click',reset);calculate();
})();