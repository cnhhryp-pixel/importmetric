(function(){
'use strict';
var ids=['current-inventory','monthly-sales','incoming-quantity','lead-time','target-coverage'];
var example={currentInventory:1200,monthlySales:500,incomingQuantity:1500,leadTime:45,targetCoverage:3};
function read(id,positive){var el=document.getElementById(id),raw=el.value.trim(),n=raw===''?0:Number(raw),bad=!Number.isFinite(n)||n<0||(positive&&n<=0),err=document.getElementById(id+'-error');el.classList.toggle('input-error',bad&&raw!=='');if(raw!==''&&!Number.isFinite(n))err.textContent='Enter a valid number.';else if(raw!==''&&n<0)err.textContent='Negative values are not allowed.';else if(positive&&raw!==''&&n<=0)err.textContent='Value must be greater than 0.';else err.textContent='';return bad?0:n;}
function calc(){var current=read('current-inventory',false),sales=read('monthly-sales',true),incoming=read('incoming-quantity',false),lead=read('lead-time',false),targetCoverage=read('target-coverage',false);
var currentMonths=sales>0?current/sales:null,currentDays=currentMonths===null?null:currentMonths*30,leadDemand=sales>0?sales*lead/30:0,before=Math.max(0,current-leadDemand),after=before+incoming,arrivalMonths=sales>0?after/sales:null,target=sales*targetCoverage,gap=after-target;
document.getElementById('current-months').textContent=currentMonths===null?'Unavailable':currentMonths.toFixed(1)+' months';
document.getElementById('arrival-months').textContent=arrivalMonths===null?'Unavailable':arrivalMonths.toFixed(1)+' months';
document.getElementById('current-days').textContent=currentDays===null?'Unavailable':Math.round(currentDays)+' days';
document.getElementById('lead-demand').textContent=Math.round(leadDemand)+' units';
document.getElementById('before-arrival').textContent=Math.round(before)+' units';
document.getElementById('after-arrival').textContent=Math.round(after)+' units';
document.getElementById('target-stock').textContent=Math.round(target)+' units';
document.getElementById('target-gap').textContent=(gap>0?'+':'')+Math.round(gap)+' units';
document.getElementById('result-status').textContent=sales<=0?'Enter current inventory and expected monthly sales to calculate.':current<leadDemand&&lead>0?'At the entered sales rate, current inventory may be exhausted before the incoming order arrives.':'Review coverage against lead time and your target stock level.';
}
function setExample(){Object.keys(example).forEach(function(k){var id=k.replace(/[A-Z]/g,function(x){return'-'+x.toLowerCase();}),el=document.getElementById(id);if(el)el.value=example[k];});calc();}
function reset(){ids.forEach(function(id){document.getElementById(id).value='';});document.querySelectorAll('.field-error').forEach(function(el){el.textContent='';});calc();}
ids.forEach(function(id){document.getElementById(id).addEventListener('input',calc);});document.getElementById('load-example').addEventListener('click',setExample);document.getElementById('reset-calculator').addEventListener('click',reset);calc();
})();