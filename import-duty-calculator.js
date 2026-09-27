(function(){
  'use strict';
  var symbols={USD:'$',EUR:'€',GBP:'£',CAD:'C$',AUD:'A$'},ids=['quantity','product-value','freight','insurance','duty-rate','tax-rate'];
  var example={currency:'USD',quantity:1000,productValue:8400,freight:620,insurance:65,dutyRate:6.5,taxRate:0};
  function money(v,c){try{return new Intl.NumberFormat('en-US',{style:'currency',currency:c,maximumFractionDigits:2}).format(Number.isFinite(v)?v:0);}catch(e){return(symbols[c]||'')+(Number.isFinite(v)?v.toFixed(2):'0.00');}}
  function read(id,rule){var input=document.getElementById(id),raw=input.value.trim(),n=raw===''?0:Number(raw),invalid=!Number.isFinite(n)||n<0||(rule==='positive'&&n<=0)||(rule==='percent'&&n>100),err=document.getElementById(id+'-error');input.classList.toggle('input-error',invalid&&raw!=='');if(raw!==''&&!Number.isFinite(n))err.textContent='Enter a valid number.';else if(raw!==''&&n<0)err.textContent='Negative values are not allowed.';else if(rule==='positive'&&raw!==''&&n<=0)err.textContent='Value must be greater than 0.';else if(rule==='percent'&&raw!==''&&n>100)err.textContent='Rate must be 100% or less.';else err.textContent='';return invalid?0:n;}
  function calculate(){
    var c=document.getElementById('currency').value,q=read('quantity','optional'),product=read('product-value','positive'),freight=read('freight','optional'),insurance=read('insurance','optional'),dutyRate=read('duty-rate','percent'),taxRate=read('tax-rate','percent');
    var base=product+freight+insurance,duty=base*dutyRate/100,taxBase=base+duty,tax=taxBase*taxRate/100,total=duty+tax,after=base+total,effective=base>0?total/base*100:0;
    document.querySelectorAll('[data-currency-symbol]').forEach(function(el){el.textContent=symbols[c]||c;});
    document.getElementById('duty-amount').textContent=money(duty,c);
    document.getElementById('total-border-tax').textContent=money(total,c);
    document.getElementById('duty-base').textContent=money(base,c);
    document.getElementById('tax-amount').textContent=money(tax,c);
    document.getElementById('border-per-unit').textContent=q>0?money(total/q,c):'Unavailable';
    document.getElementById('duty-per-unit').textContent=q>0?money(duty/q,c):'Unavailable';
    document.getElementById('after-border').textContent=money(after,c);
    document.getElementById('effective-rate').textContent=effective.toFixed(1)+'%';
    document.getElementById('result-status').textContent=product<=0?'Enter a customs value and duty rate to calculate.':dutyRate===0?'Enter the applicable duty rate for your product and destination market.':'This is a simplified planning estimate; verify classification and customs rules before importing.';
  }
  function setExample(){Object.keys(example).forEach(function(k){var id=k.replace(/[A-Z]/g,function(x){return'-'+x.toLowerCase();}),el=document.getElementById(id);if(el)el.value=example[k];});document.getElementById('currency').value=example.currency;calculate();}
  function reset(){ids.forEach(function(id){document.getElementById(id).value='';});document.getElementById('currency').value='USD';document.querySelectorAll('.field-error').forEach(function(el){el.textContent='';});calculate();}
  ids.forEach(function(id){document.getElementById(id).addEventListener('input',calculate);});document.getElementById('currency').addEventListener('change',calculate);document.getElementById('load-example').addEventListener('click',setExample);document.getElementById('reset-calculator').addEventListener('click',reset);calculate();
})();