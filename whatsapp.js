/* Wiz Mídia — WhatsApp API: campanhas (disparos), entregas, respostas, vendas atribuídas e ROAS */
(function(){
'use strict';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function money(v){return 'R$ '+(Number(v)||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function pct(a,b){return b?Math.round(a/b*100)+'%':'—';}
function fdt(s){if(!s)return '';var d=new Date(s);var p=function(n){return String(n).padStart(2,'0');};return p(d.getDate())+'/'+p(d.getMonth()+1)+' '+p(d.getHours())+':'+p(d.getMinutes());}
function waKey(n){var d=String(n||'').replace(/\D/g,'');if(d.length<10)return d;var s=(d.indexOf('55')===0&&d.length>=12)?d.slice(2):d;return '55'+s.slice(0,2)+s.slice(-8);}
function css(){
 if(document.getElementById('wacss'))return;
 var s=document.createElement('style');s.id='wacss';
 s.textContent='.wa-camp{border:1px solid var(--c-line,#e3e7ee);border-radius:14px;padding:16px;margin-top:12px;background:var(--c-bg2,#fff)}'+
 '.wa-camp-h{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.wa-camp-h b{font-size:15px}.wa-camp-h .wa-dt{font-size:12.5px;color:var(--c-mut,#8b98a5)}'+
 '.wa-tag{display:inline-block;font-size:11.5px;padding:3px 9px;border-radius:20px;background:rgba(37,211,102,.14);color:#128c4a;font-weight:600}'+
 '.wa-tag.tpl{background:rgba(99,102,241,.12);color:#4f46e5}'+
 '.wa-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px;margin-top:12px}'+
 '.wa-kpi{background:var(--c-bg,#f6f8fa);border:1px solid var(--c-line,#e3e7ee);border-radius:10px;padding:10px 12px}.wa-kpi .l{font-size:11.5px;color:var(--c-mut,#8b98a5);font-weight:600}.wa-kpi .v{font-size:20px;font-weight:700;margin-top:2px}.wa-kpi .s{font-size:11.5px;color:var(--c-mut,#8b98a5)}'+
 '.wa-kpi.win{border-color:#16a34a}.wa-kpi.win .l{color:#16a34a}'+
 '.wa-fun{display:flex;gap:6px;margin-top:12px;flex-wrap:wrap}.wa-fun span{flex:1;min-width:90px;text-align:center;font-size:12px;padding:8px 6px;border-radius:8px;background:rgba(37,211,102,.10);color:#128c4a}.wa-fun span b{display:block;font-size:16px}'+
 '.wa-tbl{width:100%;border-collapse:collapse;font-size:13.5px;margin-top:10px}.wa-tbl th,.wa-tbl td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--c-line,#eee)}.wa-tbl th{color:var(--c-mut,#8b98a5);font-weight:600;font-size:12px}'+
 '.wa-hint{font-size:12.5px;color:var(--c-mut,#8b98a5);margin-top:10px;line-height:1.5}'+
 '.wa-cost{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--c-mut,#8b98a5)}.wa-cost input{width:70px;border:1px solid var(--c-line,#e3e7ee);border-radius:8px;padding:4px 6px;font-size:12.5px;background:var(--c-bg2,#fff);color:inherit}'+
 '.wa-list{margin-top:8px}.wa-li{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--c-line,#eee);font-size:13.5px}.wa-li:last-child{border-bottom:0}.wa-li .n{flex:1}.wa-li .m{color:var(--c-mut,#8b98a5);font-size:12px}.wa-li .v{font-weight:700}';
 s.textContent+='.wa-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px}'+
 '.wa-modal{background:var(--c-bg2,#fff);color:inherit;border-radius:16px;max-width:460px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);color-scheme:light}'+
 '.wa-modal .mh{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid var(--c-line,#eee)}.wa-modal .mh h3{margin:0;font-size:17px}.wa-modal .mx{background:none;border:0;font-size:22px;cursor:pointer;color:var(--c-mut,#8b98a5);line-height:1}'+
 '.wa-modal .mb{padding:16px 18px}.wa-modal .mf{padding:14px 18px;border-top:1px solid var(--c-line,#eee);display:flex;gap:10px;justify-content:flex-end}'+
 '.wa-lb{display:block;font-size:12.5px;color:var(--c-mut,#8b98a5);font-weight:600;margin:12px 0 5px}'+
 '.wa-selff,.wa-inn{width:100%;border:1px solid var(--c-line,#e3e7ee);border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;background:#fff;color:#111b21;-webkit-text-fill-color:#111b21}'+
 '.wa-bt{border:1px solid var(--c-line,#e3e7ee);background:var(--c-bg2,#fff);color:inherit;border-radius:10px;padding:9px 16px;font-size:14px;cursor:pointer;font-weight:600}.wa-bt.pri{background:#00a884;border-color:#00a884;color:#fff}.wa-bt:disabled{opacity:.5;cursor:not-allowed}'+
 '.wa-dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;background:var(--c-bg,#f6f8fa);border:1px solid var(--c-line,#eee);border-radius:10px;padding:10px 12px;font-size:13.5px}.wa-dl b{text-align:right}'+
 '.wa-tplv{margin-top:8px;background:#e7f7f2;border:1px solid #bfe9dd;border-radius:10px;padding:10px 12px;font-size:13px;color:#0a5c47;white-space:pre-wrap;line-height:1.5}'+
 '.wa-alerta{background:#fff6e5;border:1px solid #ffe0a3;border-radius:10px;padding:10px 12px;font-size:13px;color:#8a5a00;margin-top:10px}'+
 '.wa-bar{height:10px;background:var(--c-line,#eee);border-radius:6px;overflow:hidden;margin-top:12px}.wa-bar i{display:block;height:100%;background:#00a884;width:0;transition:width .3s}';
 document.head.appendChild(s);
}
var ICO_WA='<svg class="ic" viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l2-5.2A8.4 8.4 0 1 1 21 11.5z"/></svg>';

window.renderWhatsApp=async function(box,ctx){
 css();
 ctx=ctx||{};var CLI=ctx.cliente||window.CLIENT;var isAdmin=!!ctx.admin;

 // ===== Nova campanha de WhatsApp por público (reaproveita o motor ec-disparo da aba Clientes da loja) =====
 var PUBLICOS=[
  {k:'todos',       rot:'Todos os clientes',        regra:{}},
  {k:'compradores', rot:'Compradores',              regra:{min_pedidos:1}},
  {k:'nao',         rot:'Não compraram',            regra:{nunca_comprou:true}},
  {k:'d60',         rot:'Última compra +60 dias',   regra:{dias_sem_comprar:60,min_pedidos:1}},
  {k:'d45',         rot:'Última compra +45 dias',   regra:{dias_sem_comprar:45,min_pedidos:1}}
 ];
 function wglobal(n){try{return (0,eval)('typeof '+n+'!=="undefined"?'+n+':undefined');}catch(e){return undefined;}}
 async function apiD(corpo){
  var token='',url='',chave='';
  try{var ses=await sb.auth.getSession();token=(ses&&ses.data&&ses.data.session&&ses.data.session.access_token)||'';}catch(e){}
  url=wglobal('SUPA_URL')||wglobal('SUPABASE_URL')||window.SUPA_URL||window.SUPABASE_URL||'';
  chave=wglobal('SUPA_KEY')||wglobal('SUPABASE_KEY')||window.SUPA_KEY||window.SUPABASE_KEY||'';
  if(url)url=String(url).replace(/\/rest\/v1\/?$/,'').replace(/\/$/,'');
  if(!url)return {error:'não achei a conexão do Supabase — recarrega a página'};
  try{
   var r=await fetch(url+'/functions/v1/ec-disparo',{method:'POST',headers:{'Content-Type':'application/json','apikey':chave,'Authorization':'Bearer '+token},body:JSON.stringify(corpo)});
   var j=await r.json();
   if(r.status===401)return {error:'sua sessão expirou ou você não é admin — faz login de novo'};
   return j;
  }catch(e){return {error:String(e&&e.message||e)};}
 }
 async function waAbreDisparo(preset){
  var regra=preset.regra,label=preset.rot;
  var mask=document.createElement('div');mask.className='wa-mask';
  mask.innerHTML='<div class="wa-modal"><div class="mh"><h3>Disparar campanha</h3><button class="mx" type="button">×</button></div><div class="mb" id="waMB"><p style="color:var(--c-mut,#8b98a5)">Carregando…</p></div><div class="mf" id="waMF"></div></div>';
  document.body.appendChild(mask);
  var close=function(){mask.remove();};
  mask.querySelector('.mx').onclick=close;mask.onclick=function(e){if(e.target===mask)close();};
  var mb=mask.querySelector('#waMB'),mf=mask.querySelector('#waMF');
  var res=await Promise.all([
   apiD({action:'waba_status',client_id:CLI.id}),
   apiD({action:'templates',client_id:CLI.id}),
   apiD({action:'previa',client_id:CLI.id,canal:'whatsapp',regra:regra})
  ]);
  var st=res[0]||{},tpl=res[1]||{},pv=res[2]||{};
  var templates=(tpl.itens)||[];
  var precisaCoex=(!st.conectado)||(!!tpl.precisa_coex);
  var erroMeta=tpl.erro_meta||'';
  var previa=pv.quantos||0;
  var nf=function(n){return (Number(n)||0).toLocaleString('pt-BR');};
  var h='<div class="wa-dl"><span>Público</span><b>'+esc(label)+'</b><span>Alcançáveis no WhatsApp</span><b>'+nf(previa)+'</b></div>';
  if(precisaCoex)h+='<div class="wa-alerta">⚠️ O WhatsApp da loja ainda não está conectado à API oficial (Coex). Enquanto não ligar, o disparo não sai.</div>';
  h+='<label class="wa-lb">Mensagem (template aprovado)</label>';
  if(!templates.length){
   h+='<div class="wa-alerta" style="background:var(--c-bg,#f6f8fa);border-color:var(--c-line,#e3e7ee);color:var(--c-mut,#8b98a5)">'+(precisaCoex?'Os templates aparecem aqui quando o WhatsApp da loja conectar.':(erroMeta?'Não consegui ler os templates: '+esc(erroMeta):'Nenhum template de marketing aprovado ainda. Crie e aprove um na Meta.'))+'</div>';
  }else{
   h+='<select class="wa-selff" id="waTpl"><option value="">— escolher —</option>'+templates.map(function(t){return '<option value="'+esc(t.name)+'">'+esc(t.name)+' ('+esc(t.category||'')+')</option>';}).join('')+'</select><div class="wa-tplv" id="waTplV" style="display:none"></div>';
  }
  h+='<label class="wa-lb">Nome do disparo</label><input class="wa-inn" id="waNome" value="'+esc(('Disparo '+label).slice(0,60))+'">';
  mb.innerHTML=h;
  var pode=templates.length>0&&previa>0&&!precisaCoex;
  mf.innerHTML='<button class="wa-bt" type="button" id="waCanc">Cancelar</button><button class="wa-bt pri" type="button" id="waVai"'+(pode?'':' disabled')+'>Disparar pra '+nf(previa)+'</button>';
  mf.querySelector('#waCanc').onclick=close;
  var tplSel=mb.querySelector('#waTpl');
  if(tplSel)tplSel.onchange=function(){var t=templates.filter(function(x){return x.name===tplSel.value;})[0];var v=mb.querySelector('#waTplV');if(t){v.style.display='';v.textContent=(t.corpo||'').replace(/\{\{1\}\}/g,'{nome}');}else{v.style.display='none';}};
  var vai=mf.querySelector('#waVai');
  if(vai)vai.onclick=async function(){
   var tplName=(tplSel&&tplSel.value)||'';if(!tplName){alert('Escolhe o template.');return;}
   var nome=(mb.querySelector('#waNome')||{}).value||('Disparo '+label);
   var t=templates.filter(function(x){return x.name===tplName;})[0];
   var params=[];if(t&&t.vars>=1){params.push('{nome}');for(var i=1;i<t.vars;i++)params.push('-');}
   if(!confirm('Confirmar disparo de "'+tplName+'" pra '+previa+' pessoas no WhatsApp?'))return;
   mb.innerHTML='<div id="waProgTxt" style="font-size:13px;color:var(--c-mut,#8b98a5)">Criando campanha…</div><div class="wa-bar"><i id="waBar"></i></div>';
   mf.innerHTML='';
   var cr=await apiD({action:'criar',client_id:CLI.id,canal:'whatsapp',template:tplName,nome:nome,segment_id:null,regra:regra,params:params});
   if(cr.error||!cr.campaign_id){mb.innerHTML='<div class="wa-alerta">'+esc(cr.error||'não deu pra criar a campanha')+'</div>';mf.innerHTML='<button class="wa-bt" type="button" id="waFe">Fechar</button>';mf.querySelector('#waFe').onclick=close;return;}
   var cid=cr.campaign_id,alvos=cr.alvos||previa,guard=0;
   while(guard++<300){
    var rr=await apiD({action:'enviar_lote',campaign_id:cid,tam:60});
    if(rr.error){mb.innerHTML='<div class="wa-alerta">Parou: '+esc(rr.error)+'</div>';break;}
    var feito=(rr.enviados||0)+(rr.falhas||0),pc=alvos?Math.round(feito/alvos*100):100;
    var bar=mb.querySelector('#waBar');if(bar)bar.style.width=Math.min(100,pc)+'%';
    var tx=mb.querySelector('#waProgTxt');if(tx)tx.textContent='Enviados '+nf(rr.enviados||0)+' · falhas '+nf(rr.falhas||0)+' · faltam '+nf(rr.restantes||0);
    if(rr.done)break;
   }
   mb.innerHTML='<div style="text-align:center;padding:10px 0"><div style="font-size:34px">📣</div><h3 style="margin:8px 0 2px;font-size:18px">Disparo concluído</h3></div>';
   mf.innerHTML='<button class="wa-bt pri" type="button" id="waFim">Ver resultados</button>';
   mf.querySelector('#waFim').onclick=function(){close();window.renderWhatsApp(box,ctx);};
  };
 }

 box.innerHTML='<div class="card"><div class="rep-empty">Carregando WhatsApp…</div></div>';
 var camps=[],envios=[],pedidos=[],rastreios=[];
 try{
  var r1=await sb.from('wa_campanhas').select('*').eq('client_id',CLI.id).order('inicio',{ascending:false});
  camps=r1.data||[];
  if(camps.length){
   var minIni=camps.reduce(function(m,c){return c.inicio<m?c.inicio:m;},camps[0].inicio);
   var r2=await sb.from('wa_envios').select('campanha_id,wa,nome,msgid,status,erro,clique,clique_em,optout,enviado_em,entregue_em,lido_em').eq('client_id',CLI.id).neq('status','teste').limit(20000);
   envios=r2.data||[];
   var r3=await sb.from('ns_pedidos').select('order_id,numero,nome,wa,total,cupom,feito_em').eq('client_id',CLI.id).eq('pago',true).gte('feito_em',minIni).order('feito_em',{ascending:false}).limit(5000);
   pedidos=r3.data||[];
   var r4=await sb.from('ns_pedidos').select('order_id,numero,nome,rastreio_cod,rastreio_url,enviado_em,wa_rastreio_em,wa_rastreio_msgid,wa_rastreio_erro').eq('client_id',CLI.id).not('rastreio_cod','is',null).order('enviado_em',{ascending:false}).limit(60);
   rastreios=r4.data||[];
  }
 }catch(e){box.innerHTML='<div class="card"><div class="rep-empty">Erro ao carregar: '+esc(e.message||e)+'</div></div>';return;}

 if(!camps.length){
  box.innerHTML='<div class="card"><div class="ig-empty"><div class="ig-emico soft">'+ICO_WA+'</div><b>WhatsApp API</b>'+(CLI.wa_phone_number_id?'O número está conectado. Assim que a primeira campanha for disparada, os resultados aparecem aqui: envios, entregas, respostas, vendas e ROAS.':'O número do WhatsApp ainda não foi conectado à API. Fale com a Wiz Mídia pra ativar.')+'</div></div>';
  return;
 }

 // agrega por campanha
 var tot={env:0,ent:0,lid:0,cli:0,opt:0,fal:0,vn:0,vr:0,custo:0,vcn:0,vcr:0};
 var cards=camps.map(function(c){
  var ev=envios.filter(function(e){return e.campanha_id===c.id;});
  if(c.tipo==='rastreio'){
   var byMsg={};ev.forEach(function(e){if(e.msgid)byMsg[e.msgid]=e;});
   var avisados=rastreios.filter(function(p){return p.wa_rastreio_em;});
   var entR=avisados.filter(function(p){var e=byMsg[p.wa_rastreio_msgid];return e&&(e.entregue_em||e.lido_em);}).length;
   var lidR=avisados.filter(function(p){var e=byMsg[p.wa_rastreio_msgid];return e&&e.lido_em;}).length;
   var semFone=rastreios.filter(function(p){return !p.wa_rastreio_em&&p.wa_rastreio_erro==='sem_telefone';}).length;
   var falhR=rastreios.filter(function(p){return !p.wa_rastreio_em&&p.wa_rastreio_erro&&p.wa_rastreio_erro!=='sem_telefone';}).length;
   tot.env+=avisados.length;tot.ent+=entR;tot.lid+=lidR;
   var h2='<div class="wa-camp"><div class="wa-camp-h"><b>'+esc(c.nome)+'</b><span class="wa-tag tpl">'+esc(c.template||'')+'</span><span class="wa-dt">dispara sozinho quando o pedido é marcado como enviado na loja</span></div>';
   h2+='<div class="wa-kpis">'+
    '<div class="wa-kpi"><div class="l">Avisos enviados</div><div class="v">'+avisados.length+'</div></div>'+
    '<div class="wa-kpi"><div class="l">Entregues</div><div class="v">'+entR+'</div><div class="s">'+pct(entR,avisados.length)+'</div></div>'+
    '<div class="wa-kpi"><div class="l">Lidos</div><div class="v">'+lidR+'</div><div class="s">'+pct(lidR,avisados.length)+'</div></div>'+
    '<div class="wa-kpi"><div class="l">Não enviados</div><div class="v">'+(semFone+falhR)+'</div><div class="s">'+semFone+' sem telefone · '+falhR+' com erro</div></div>'+
   '</div>';
   if(rastreios.length){
    h2+='<table class="wa-tbl"><thead><tr><th>Pedido</th><th>Cliente</th><th>Código</th><th>Enviado</th><th>Aviso</th></tr></thead><tbody>'+rastreios.slice(0,20).map(function(p){
     var e=byMsg[p.wa_rastreio_msgid];var st=p.wa_rastreio_em?(e&&e.lido_em?'✓ lido':(e&&e.entregue_em?'✓ entregue':'enviado '+fdt(p.wa_rastreio_em))):(p.wa_rastreio_erro==='sem_telefone'?'sem telefone':(p.wa_rastreio_erro?'erro':'—'));
     return '<tr><td>#'+esc(p.numero)+'</td><td>'+esc(p.nome||'')+'</td><td>'+(p.rastreio_url?'<a href="'+esc(p.rastreio_url)+'" target="_blank">'+esc(p.rastreio_cod)+'</a>':esc(p.rastreio_cod||''))+'</td><td>'+fdt(p.enviado_em)+'</td><td>'+st+'</td></tr>';}).join('')+'</tbody></table>';
    h2+='<div class="wa-hint">"—" = pedido enviado antes da ativação do aviso automático (não recebe mensagem).</div>';
   } else { h2+='<div class="wa-hint">Nenhum pedido enviado ainda desde a ativação.</div>'; }
   return h2+'</div>';
  }
  var env=ev.filter(function(e){return e.status!=='falhou';});
  var ent=env.filter(function(e){return e.entregue_em||e.lido_em;});
  var lid=env.filter(function(e){return e.lido_em;});
  var opt=env.filter(function(e){return e.optout;});
  var cli=env.filter(function(e){return e.clique&&!e.optout;});
  var fal=ev.length-env.length;
  var keys={};env.forEach(function(e){keys[waKey(e.wa)]=1;});
  var ini=new Date(c.inicio).getTime(),fim=c.fim?new Date(c.fim).getTime():ini+(c.janela_dias||7)*864e5;
  var cup=(c.cupom||'').toUpperCase();
  var ped=pedidos.filter(function(p){var t=new Date(p.feito_em).getTime();return t>=ini&&t<=fim;});
  var excl=!!c.cupom_exclusivo;
  var vendRec=ped.filter(function(p){return p.wa&&keys[waKey(p.wa)];});
  var vendCup=ped.filter(function(p){return cup&&p.cupom===cup;});
  var cupSem=vendCup.filter(function(p){return !(p.wa&&keys[waKey(p.wa)]);});
  var vend=excl?ped.filter(function(p){return (p.wa&&keys[waKey(p.wa)])||(cup&&p.cupom===cup);}):vendRec;
  var rec=vend.reduce(function(s,p){return s+(Number(p.total)||0);},0);
  var custo=env.length*(Number(c.custo_unit)||0);
  var roas=custo?rec/custo:0;
  tot.env+=env.length;tot.ent+=ent.length;tot.lid+=lid.length;tot.cli+=cli.length;tot.opt+=opt.length;tot.fal+=fal;tot.vn+=vend.length;tot.vr+=rec;tot.custo+=custo;tot.vcn+=vendCup.length;
  var h='<div class="wa-camp"><div class="wa-camp-h"><b>'+esc(c.nome)+'</b><span class="wa-tag tpl">'+esc(c.template||'template')+'</span>'+(cup?'<span class="wa-tag">cupom '+esc(cup)+'</span>':'')+'<span class="wa-dt">'+fdt(c.inicio)+' · janela de '+(c.janela_dias||7)+' dias</span></div>';
  h+='<div class="wa-kpis">'+
   '<div class="wa-kpi"><div class="l">Enviados</div><div class="v">'+env.length+'</div>'+(fal?'<div class="s">'+fal+' falharam</div>':'')+'</div>'+
   '<div class="wa-kpi"><div class="l">Entregues</div><div class="v">'+ent.length+'</div><div class="s">'+pct(ent.length,env.length)+'</div></div>'+
   '<div class="wa-kpi"><div class="l">Lidos</div><div class="v">'+lid.length+'</div><div class="s">'+pct(lid.length,env.length)+'</div></div>'+
   '<div class="wa-kpi"><div class="l">Respostas</div><div class="v">'+cli.length+'</div><div class="s">'+opt.length+' pediram sair</div></div>'+
   '<div class="wa-kpi win"><div class="l">Vendas</div><div class="v">'+vend.length+'</div><div class="s">'+(excl?vendRec.length+' de quem recebeu · '+vendCup.length+' c/ cupom':'de quem recebeu a mensagem')+'</div></div>'+
   '<div class="wa-kpi win"><div class="l">Receita</div><div class="v">'+money(rec)+'</div></div>'+
   '<div class="wa-kpi"><div class="l">Custo</div><div class="v">'+money(custo)+'</div><div class="s">'+money(c.custo_unit||0)+'/msg</div></div>'+
   '<div class="wa-kpi win"><div class="l">ROAS</div><div class="v">'+(custo?roas.toFixed(1)+'x':'—')+'</div></div>'+
  '</div>';
  if(cli.length){h+='<table class="wa-tbl"><thead><tr><th>Quem respondeu</th><th>Botão</th><th>Quando</th></tr></thead><tbody>'+cli.slice(0,20).map(function(e){return '<tr><td>'+esc(e.nome||e.wa)+'</td><td>'+esc(e.clique)+'</td><td>'+fdt(e.clique_em)+'</td></tr>';}).join('')+'</tbody></table>';}
  if(vend.length){h+='<div class="wa-list">'+vend.slice(0,15).map(function(p){return '<div class="wa-li"><span class="n">'+esc(p.nome||p.wa||'')+' <span class="m">#'+esc(p.numero)+(p.cupom?' · cupom '+esc(p.cupom):'')+'</span></span><span class="m">'+fdt(p.feito_em)+'</span><span class="v">'+money(p.total)+'</span></div>';}).join('')+'</div>';}
  if(cup&&!excl&&cupSem.length){h+='<div class="wa-hint">Outras '+cupSem.length+' venda(s) usaram o cupom '+esc(cup)+' sem ter recebido esta mensagem (vieram por outro canal) — não entram na conta do WhatsApp.</div>';}
  if(isAdmin){h+='<div class="wa-hint"><span class="wa-cost">Custo por mensagem: R$ <input type="number" step="0.01" value="'+esc(c.custo_unit||0)+'" data-camp="'+c.id+'" class="wa-cu"> <span>(estimativa — ajuste pelo valor real da fatura da Meta)</span></span></div>';}
  return h+'</div>';
 }).join('');

 var roasT=tot.custo?(tot.vr/tot.custo).toFixed(1)+'x':'—';
 var html='<div class="rep-kpis csec">'+
  '<div class="rep-kpi"><div class="l">Mensagens enviadas</div><div class="v">'+tot.env.toLocaleString('pt-BR')+'</div></div>'+
  '<div class="rep-kpi"><div class="l">Entregues</div><div class="v">'+tot.ent.toLocaleString('pt-BR')+'</div></div>'+
  '<div class="rep-kpi"><div class="l">Lidas</div><div class="v">'+tot.lid.toLocaleString('pt-BR')+'</div></div>'+
  '<div class="rep-kpi"><div class="l">Respostas</div><div class="v">'+tot.cli.toLocaleString('pt-BR')+'</div></div>'+
  '<div class="rep-kpi rep-kpi-loja"><div class="l">Vendas atribuídas</div><div class="v">'+tot.vn.toLocaleString('pt-BR')+'</div></div>'+
  '<div class="rep-kpi rep-kpi-loja"><div class="l">Receita</div><div class="v">'+money(tot.vr)+'</div></div>'+
  '<div class="rep-kpi rep-kpi-loja"><div class="l">ROAS</div><div class="v">'+roasT+'</div></div>'+
 '</div>';
 html+='<div class="card csec"><h2>'+ICO_WA+'Nova campanha de WhatsApp</h2>'+
  '<p class="wa-hint" style="margin-top:0">Escolha o público e dispare um template aprovado pra base de clientes da loja. Usa a mesma base e motor de segmentos da aba "Clientes da loja".</p>'+
  '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-top:8px">'+
   '<div style="flex:1;min-width:220px"><label class="wa-lb" style="margin-top:0">Público</label>'+
    '<select class="wa-selff" id="waPub">'+PUBLICOS.map(function(p){return '<option value="'+p.k+'">'+esc(p.rot)+'</option>';}).join('')+'</select></div>'+
   '<button class="wa-bt pri" type="button" id="waNova">Montar disparo →</button>'+
  '</div></div>';
 html+='<div class="card csec"><h2>'+ICO_WA+'Campanhas de WhatsApp</h2>'+cards+
  '<div class="wa-hint">Como contamos: <b>venda atribuída</b> = pedido pago na loja dentro da janela da campanha feito por um número que recebeu a mensagem (quando o cupom é exclusivo do WhatsApp, vendas com o cupom também contam). <b>Respostas</b> são toques nos botões de resposta rápida; a Meta não informa cliques no botão de link ("Ver os cafés"). Entregas e leituras atualizam em tempo real pelo webhook; pedidos da loja sincronizam a cada 30 min.</div></div>';
 box.innerHTML=html;
 if(isAdmin){box.querySelectorAll('.wa-cu').forEach(function(inp){inp.onchange=async function(){var v=Number(inp.value)||0;try{await sb.from('wa_campanhas').update({custo_unit:v}).eq('id',inp.dataset.camp);window.renderWhatsApp(box,ctx);}catch(e){alert('Não salvou: '+(e.message||e));}};});}
 var nova=box.querySelector('#waNova');
 if(nova)nova.onclick=function(){var k=(box.querySelector('#waPub')||{}).value;var p=PUBLICOS.filter(function(x){return x.k===k;})[0]||PUBLICOS[0];waAbreDisparo(p);};
 // conta quantas pessoas (alcançáveis no WhatsApp) tem em cada público e mostra entre parênteses
 (function(){var sel=box.querySelector('#waPub');if(!sel)return;PUBLICOS.forEach(function(p,i){apiD({action:'previa',client_id:CLI.id,canal:'whatsapp',regra:p.regra}).then(function(pv){var n=(pv&&pv.quantos!=null)?pv.quantos:null;var opt=sel.options[i];if(opt&&n!=null)opt.textContent=p.rot+' ('+Number(n).toLocaleString('pt-BR')+')';}).catch(function(){});});})();
};
})();

// Integra na aba "WhatsApp API" do portal mesmo sem alteração no index.html: substitui o placeholder "Em breve".
(function(){
 var orig=window.cliSoon;
 if(typeof orig!=='function'||orig.__wa)return;
 var f=function(k){
  if(k==='whatsapp'&&window.renderWhatsApp&&typeof CLIENT!=='undefined'&&CLIENT){
   setTimeout(function(){var b=document.getElementById('repContent');if(b)window.renderWhatsApp(b,{cliente:CLIENT,admin:(typeof IS_ADMIN!=='undefined')&&IS_ADMIN});},0);
   return '<div class="card"><div class="rep-empty">Carregando WhatsApp…</div></div>';
  }
  return orig.apply(this,arguments);
 };
 f.__wa=true;window.cliSoon=f;
})();
