(function(){
  'use strict';
  var body=document.getElementById('template-body'), status=document.getElementById('template-status');
  var fields=[
    ['supplier','text','Supplier name'],['unitPrice','number','0.00'],['moq','number','0'],['incoterm','select','FOB'],
    ['leadTime','number','0'],['freight','number','0.00'],['duty','number','0.00'],['other','number','0.00'],['notes','text','Specification / payment / packaging notes']
  ];
  var example=[
    {supplier:'Supplier A',unitPrice:'8.40',moq:'500',incoterm:'FOB',leadTime:'28',freight:'420',duty:'180',other:'65',notes:'30% deposit / 70% before shipment'},
    {supplier:'Supplier B',unitPrice:'7.95',moq:'1000',incoterm:'CIF',leadTime:'35',freight:'690',duty:'205',other:'40',notes:'Check destination charges separately'},
    {supplier:'Supplier C',unitPrice:'8.15',moq:'800',incoterm:'EXW',leadTime:'25',freight:'',duty:'',other:'',notes:'Origin pickup and export costs not yet normalized'}
  ];
  function esc(s){return String(s==null?'':s).replace(/"/g,'""');}
  function addRow(data){
    data=data||{}; var tr=document.createElement('tr');
    fields.forEach(function(f){
      var td=document.createElement('td'), el;
      if(f[1]==='select'){el=document.createElement('select');['EXW','FCA','FOB','CFR','CIF','DAP','DDP','Other'].forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;el.appendChild(o);});el.value=data[f[0]]||'FOB';}
      else{el=document.createElement('input');el.type=f[1];el.placeholder=f[2];if(f[1]==='number'){el.min='0';el.step=f[0]==='moq'||f[0]==='leadTime'?'1':'0.01';}el.value=data[f[0]]||'';if(f[0]==='notes')el.className='notes-input';}
      el.dataset.field=f[0];td.appendChild(el);tr.appendChild(td);
    });
    var td=document.createElement('td'), btn=document.createElement('button');btn.type='button';btn.className='remove-template-row';btn.setAttribute('aria-label','Remove supplier row');btn.textContent='×';btn.addEventListener('click',function(){if(body.children.length>1){tr.remove();message('Supplier row removed.');}});td.appendChild(btn);tr.appendChild(td);body.appendChild(tr);
  }
  function rows(){return Array.from(body.querySelectorAll('tr')).map(function(tr){var o={};tr.querySelectorAll('[data-field]').forEach(function(el){o[el.dataset.field]=el.value;});return o;});}
  function csv(){
    var headers=['Supplier','Unit Price','MOQ','Incoterm','Lead Time (days)','Freight','Duty / Tax','Other Costs','Notes'];
    var keys=['supplier','unitPrice','moq','incoterm','leadTime','freight','duty','other','notes'];
    return [headers.map(function(v){return '"'+esc(v)+'"';}).join(',')].concat(rows().map(function(r){return keys.map(function(k){return '"'+esc(r[k])+'"';}).join(',');})).join('\r\n');
  }
  function message(t){status.textContent=t;window.clearTimeout(message.timer);message.timer=window.setTimeout(function(){status.textContent='';},3500);}
  document.getElementById('add-template-row').addEventListener('click',function(){addRow();message('Supplier row added.');});
  document.getElementById('load-template-example').addEventListener('click',function(){body.innerHTML='';example.forEach(addRow);message('Example supplier quotes loaded.');});
  document.getElementById('download-csv').addEventListener('click',function(){var blob=new Blob([csv()],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='supplier-quote-comparison-template.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);message('CSV downloaded.');});
  document.getElementById('copy-csv').addEventListener('click',function(){var value=csv();if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(value).then(function(){message('CSV copied to clipboard.');},function(){fallback(value);});}else fallback(value);});
  function fallback(value){var ta=document.createElement('textarea');ta.value=value;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');message('CSV copied to clipboard.');}catch(e){message('Copy failed. Use Download CSV instead.');}ta.remove();}
  addRow();addRow();addRow();
})();