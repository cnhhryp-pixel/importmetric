(function(){
'use strict';
var symbols={USD:'$',EUR:'€',GBP:'£',CAD:'C$',AUD:'A$'},ids=['supplier-moq','unit-price','monthly-sales','current-inventory','target-coverage'];
var example={currency:'USD',supplierMoq:3000,unitPrice:4.50,monthlySales:500,currentInventory:200,targetCoverage:3};
function money(v,c){try{return new Intl.NumberFormat('en-US',{style:'currency',currency:c,maximumFractionDigits:2}).format(Number.isFinite(v)?v:0);}catch(e){return(symbols[c]||'')+(Number.isFinite(v)?v.toFixed(2):'0.00');}}
function read(id,positive){var el=document.getElementById(id),raw=el.value.trim(),n=raw===''?0:Number(raw),bad=!Number.isFinite(n)||n<0||(positive&&n<=0),err=document.getElementById(id+'-error');el.classList.toggle('input-error',bad&&raw!=='');if(raw!==''&&!Number.isFinite(n))err.textContent='Enter a valid number.';else if(raw!==''&&n<0)err.textContent='Negative values are not allowed.';else if(positive&&raw!==''&&n<=0)err.textContent='Value must be greater than 0.';else err.textContent='';return bad?0:n;}
function calc(){var c=document.getElementById('currency').value,moq=read('supplier-moq',true),price=read('unit-price',false),sales=read('monthly-sales',true),inventory=read('current-inventory',false),coverage=read('target-coverage',false),orderValue=moq*price,post=inventory+moq,target=Math.max(0,Math.ceil(sales*coverage-inventory)),excess=Math.max(0,moq-target),gap=moq-target,months=sales>0?post/sales:null;
document.querySelectorAll('[data-currency-symbol]').forEach(function(el){el.textContent=symbols[c]||c;});
document.getElementById('order-value').textContent=money(orderValue,c);
document.getElementById('months-coverage').textContent=months===null?'Unavailable':months.toFixed(1)+' months';
document.getElementById('post-inventory').textContent=Math.round(post)+' units';
document.getElementById('target-purchase').textContent=Math.round(target)+' units';
document.getElementById('excess-units').textContent=Math.round(excess)+' units';
document.getElementById('excess-cash').textContent=money(excess*price,c);
document.getElementById('moq-gap').textContent=(gap>0?'+':'')+Math.round(gap)+' units';
document.getElementById('cash-per-month').textContent=sales>0&&price>0?money(orderValue/(sales*price),c)+' of product-cost months':'Unavailable';
document.getElementById('result-status').textContent=moq<=0||sales<=0?'Enter MOQ, price and expected monthly sales to calculate.':gap>0?'The supplier MOQ is above the quantity implied by your target coverage.':'The supplier MOQ is at or below the quantity implied by your target coverage.';
}
function setExample(){Object.keys(example).forEach(function(k){var id=k.replace(/[A-Z]/g,function(x){return'-'+x.toLowerCase();}),el=document.getElementById(id);if(el)el.value=example[k];});document.getElementById('currency').value=example.currency;calc();}
function reset(){ids.forEach(function(id){document.getElementById(id).value='';});document.getElementById('currency').value='USD';document.querySelectorAll('.field-error').forEach(function(el){el.textContent='';});calc();}
ids.forEach(function(id){document.getElementById(id).addEventListener('input',calc);});document.getElementById('currency').addEventListener('change',calc);document.getElementById('load-example').addEventListener('click',setExample);document.getElementById('reset-calculator').addEventListener('click',reset);calc();
})();