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
 document.head.appendChild(s);
}
var ICO_WA='<svg class="ic" viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l2-5.2A8.4 8.4 0 1 1 21 11.5z"/></svg>';

window.renderWhatsApp=async function(box,ctx){
 css();
 ctx=ctx||{};var CLI=ctx.cliente||window.CLIENT;var isAdmin=!!ctx.admin;
 box.innerHTML='<div class="card"><div class="rep-empty">Carregando WhatsApp…</div></div>';
 var camps=[],envios=[],pedidos=[];
 try{
  var r1=await sb.from('wa_campanhas').select('*').eq('client_id',CLI.id).order('inicio',{ascending:false});
  camps=r1.data||[];
  if(camps.length){
   var minIni=camps.reduce(function(m,c){return c.inicio<m?c.inicio:m;},camps[0].inicio);
   var r2=await sb.from('wa_envios').select('campanha_id,wa,nome,status,erro,clique,clique_em,optout,enviado_em,entregue_em,lido_em').eq('client_id',CLI.id).neq('status','teste').limit(20000);
   envios=r2.data||[];
   var r3=await sb.from('ns_pedidos').select('order_id,numero,nome,wa,total,cupom,feito_em').eq('client_id',CLI.id).eq('pago',true).gte('feito_em',minIni).order('feito_em',{ascending:false}).limit(5000);
   pedidos=r3.data||[];
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
  var vend=ped.filter(function(p){return (p.wa&&keys[waKey(p.wa)])||(cup&&p.cupom===cup);});
  var vendRec=vend.filter(function(p){return p.wa&&keys[waKey(p.wa)];});
  var vendCup=vend.filter(function(p){return cup&&p.cupom===cup;});
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
   '<div class="wa-kpi win"><div class="l">Vendas</div><div class="v">'+vend.length+'</div><div class="s">'+vendRec.length+' de quem recebeu · '+vendCup.length+' c/ cupom</div></div>'+
   '<div class="wa-kpi win"><div class="l">Receita</div><div class="v">'+money(rec)+'</div></div>'+
   '<div class="wa-kpi"><div class="l">Custo</div><div class="v">'+money(custo)+'</div><div class="s">'+money(c.custo_unit||0)+'/msg</div></div>'+
   '<div class="wa-kpi win"><div class="l">ROAS</div><div class="v">'+(custo?roas.toFixed(1)+'x':'—')+'</div></div>'+
  '</div>';
  if(cli.length){h+='<table class="wa-tbl"><thead><tr><th>Quem respondeu</th><th>Botão</th><th>Quando</th></tr></thead><tbody>'+cli.slice(0,20).map(function(e){return '<tr><td>'+esc(e.nome||e.wa)+'</td><td>'+esc(e.clique)+'</td><td>'+fdt(e.clique_em)+'</td></tr>';}).join('')+'</tbody></table>';}
  if(vend.length){h+='<div class="wa-list">'+vend.slice(0,15).map(function(p){return '<div class="wa-li"><span class="n">'+esc(p.nome||p.wa||'')+' <span class="m">#'+esc(p.numero)+(p.cupom?' · cupom '+esc(p.cupom):'')+'</span></span><span class="m">'+fdt(p.feito_em)+'</span><span class="v">'+money(p.total)+'</span></div>';}).join('')+'</div>';}
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
 html+='<div class="card csec"><h2>'+ICO_WA+'Campanhas de WhatsApp</h2>'+cards+
  '<div class="wa-hint">Como contamos: <b>venda atribuída</b> = pedido pago na loja dentro da janela da campanha feito por um número que recebeu a mensagem <i>ou</i> usando o cupom da campanha. <b>Respostas</b> são toques nos botões de resposta rápida; a Meta não informa cliques no botão de link ("Ver os cafés"). Entregas e leituras atualizam em tempo real pelo webhook; pedidos da loja sincronizam a cada 30 min.</div></div>';
 box.innerHTML=html;
 if(isAdmin){box.querySelectorAll('.wa-cu').forEach(function(inp){inp.onchange=async function(){var v=Number(inp.value)||0;try{await sb.from('wa_campanhas').update({custo_unit:v}).eq('id',inp.dataset.camp);window.renderWhatsApp(box,ctx);}catch(e){alert('Não salvou: '+(e.message||e));}};});}
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
