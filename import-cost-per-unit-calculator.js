(function(){
'use strict';
var symbols={USD:'$',EUR:'€',GBP:'£',CAD:'C$',AUD:'A$'},ids=['quantity','product-cost','origin-cost','freight','insurance','duty','customs','destination','other-costs'];
var example={currency:'USD',quantity:1000,productCost:8400,originCost:180,freight:620,insurance:65,duty:590.53,customs:145,destination:230,otherCosts:55};
function money(v,c){try{return new Intl.NumberFormat('en-US',{style:'currency',currency:c,maximumFractionDigits:2}).format(Number.isFinite(v)?v:0);}catch(e){return(symbols[c]||'')+(Number.isFinite(v)?v.toFixed(2):'0.00');}}
function read(id,positive){var el=document.getElementById(id),raw=el.value.trim(),n=raw===''?0:Number(raw),bad=!Number.isFinite(n)||n<0||(positive&&n<=0),err=document.getElementById(id+'-error');el.classList.toggle('input-error',bad&&raw!=='');if(raw!==''&&!Number.isFinite(n))err.textContent='Enter a valid number.';else if(raw!==''&&n<0)err.textContent='Negative values are not allowed.';else if(positive&&raw!==''&&n<=0)err.textContent='Value must be greater than 0.';else err.textContent='';return bad?0:n;}
function calc(){var c=document.getElementById('currency').value,q=read('quantity',true),product=read('product-cost',true),origin=read('origin-cost',false),freight=read('freight',false),insurance=read('insurance',false),duty=read('duty',false),customs=read('customs',false),destination=read('destination',false),other=read('other-costs',false);
var nonProduct=origin+freight+insurance+duty+customs+destination+other,total=product+nonProduct,unit=q>0?total/q:0;
document.querySelectorAll('[data-currency-symbol]').forEach(function(el){el.textContent=symbols[c]||c;});
document.getElementById('total-import-cost').textContent=money(total,c);document.getElementById('import-cost-unit').textContent=money(unit,c);
document.getElementById('product-unit').textContent=money(q>0?product/q:0,c);document.getElementById('non-product-unit').textContent=money(q>0?nonProduct/q:0,c);
document.getElementById('shipping-unit').textContent=money(q>0?(freight+insurance)/q:0,c);document.getElementById('border-unit').textContent=money(q>0?(duty+customs)/q:0,c);document.getElementById('other-unit').textContent=money(q>0?(origin+destination+other)/q:0,c);
document.getElementById('non-product-share').textContent=total>0?(nonProduct/total*100).toFixed(1)+'%':'0.0%';
document.getElementById('result-status').textContent=q<=0||product<=0?'Enter product cost and quantity to calculate.':'Use the unit cost when comparing quotes, setting prices or reviewing margin.';
}
function setExample(){Object.keys(example).forEach(function(k){var id=k.replace(/[A-Z]/g,function(x){return'-'+x.toLowerCase();}),el=document.getElementById(id);if(el)el.value=example[k];});document.getElementById('currency').value=example.currency;calc();}
function reset(){ids.forEach(function(id){document.getElementById(id).value='';});document.getElementById('currency').value='USD';document.querySelectorAll('.field-error').forEach(function(el){el.textContent='';});calc();}
ids.forEach(function(id){document.getElementById(id).addEventListener('input',calc);});document.getElementById('currency').addEventListener('change',calc);document.getElementById('load-example').addEventListener('click',setExample);document.getElementById('reset-calculator').addEventListener('click',reset);calc();
})();