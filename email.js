/* Wiz Mídia — Email Marketing (Brevo + templates gerados por tipo de campanha) */
(function(){
'use strict';
var FN=SUPA_URL+'/functions/v1/brevo';
var NSFN=SUPA_URL+'/functions/v1/nuvemshop';
var SIMPLEFN=SUPA_URL+'/functions/v1/email-simple';
var AUTOFN=SUPA_URL+'/functions/v1/automations';
async function post(u,payload){
  var s=(await sb.auth.getSession()).data.session;
  var r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPA_KEY,Authorization:'Bearer '+(s&&s.access_token||'')},body:JSON.stringify(payload)});
  var j=await r.json().catch(function(){return{};});
  if(!r.ok||j.error){var er=new Error(j.error||('HTTP '+r.status));er.detail=j.detail;er.hstatus=j.status;throw er;}
  return j;
}
function api(p){return post(FN,p);}
function nsapi(p){return post(NSFN,p);}
function simpleapi(p){return post(SIMPLEFN,p);}
function autoapi(p){p=p||{};if(typeof CLIENT!=='undefined'&&IS_ADMIN&&CLIENT&&!p.clientId)p.clientId=CLIENT.id;return post(AUTOFN,p);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

var KINDS={
 promo:{label:'Promoção do mês',subject:'Promoção do mês ☕',headline:'Promoção do mês',sub:'Tudo com 30% OFF na loja toda',body:'',coupon:'',discount:30,cta:'COMPRAR COM DESCONTO',products:true},
 remarketing:{label:'Remarketing (novidades)',subject:'Separamos novidades pra você ☕',headline:'Novidades esperando por você',sub:'Dá uma olhada no que chegou na loja',body:'',coupon:'',discount:0,cta:'VER NOVIDADES',products:true},
 carrinho:{label:'Recuperar carrinho',subject:'Você esqueceu algo no carrinho 👀',headline:'Seu café tá te esperando',sub:'Você deixou itens no carrinho',body:'Volte e finalize sua compra — seu café especial está quase indo embora.',coupon:'',discount:0,cta:'FINALIZAR COMPRA',products:true},
 antigo:{label:'Cliente antigo (reativação)',subject:'A gente sentiu sua falta ☕',headline:'Sentimos sua falta',sub:'Volte com um presente',body:'Faz um tempo que você não pega seu café com a gente. Preparamos um mimo pra te trazer de volta.',coupon:'',discount:30,cta:'QUERO VOLTAR',products:true},
 aniversario:{label:'Aniversariante',subject:'Feliz aniversário! 🎉 Tem presente',headline:'Feliz aniversário, {NOME}!',sub:'Um presente da casa pra você',body:'Hoje é seu dia! Comemore com um café especial e um desconto por nossa conta.',coupon:'',discount:30,cta:'RESGATAR PRESENTE',products:false},
 generico:{label:'Genérico',subject:'',headline:'',sub:'',body:'',coupon:'',discount:0,cta:'SAIBA MAIS',products:true}
};

function css(){
 if(document.getElementById('emailcss'))return;
 var s=document.createElement('style');s.id='emailcss';
 s.textContent='.em-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:720px){.em-grid{grid-template-columns:1fr}}'+
 '.em-f{margin-bottom:10px}.em-f label{display:block;font-size:12px;color:var(--c-mut,#8b98a5);margin:0 0 5px;font-weight:600}'+
 '.em-f input,.em-f select,.em-f textarea{width:100%;background:var(--c-bg2,#fff);border:1px solid var(--c-line,#e3e7ee);border-radius:10px;padding:10px 12px;font-size:14px;color:inherit;font-family:inherit}'+
 '.em-f textarea{min-height:70px;resize:vertical;line-height:1.5}'+
 '.em-lock{background:var(--c-bg,#f6f8fa);border:1px solid var(--c-line,#e3e7ee);border-radius:10px;padding:10px 12px;font-size:14px;display:flex;align-items:center;gap:8px;color:inherit}'+
 '.em-lock svg{width:15px;height:15px;flex:0 0 auto;opacity:.6}'+
 '.em-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px}'+
 '.em-btn{border:1px solid var(--c-line,#e3e7ee);background:var(--c-bg2,#fff);color:inherit;border-radius:10px;padding:10px 15px;font-size:14px;cursor:pointer;font-weight:600}'+
 '.em-btn:hover{border-color:var(--accent)}.em-btn.pri{background:var(--accent);border-color:var(--accent);color:#fff}'+
 '.em-hint{font-size:12.5px;color:var(--c-mut,#8b98a5);margin-top:8px}'+
 '.em-tag{display:inline-block;font-size:12px;padding:3px 9px;border-radius:20px;background:rgba(22,199,154,.14);color:#0a8f6d;font-weight:600}'+
 '.em-chk{display:flex;align-items:center;gap:8px;font-size:14px}.em-chk input{width:auto}'+
 '.em-save{font-size:12px;color:var(--c-mut,#8b98a5);margin-left:auto}'+
 '.em-msg{margin-top:10px;font-size:13.5px;display:none}.em-msg.ok{color:#0a8f6d;display:block}.em-msg.err{color:#c33;display:block}'+
 '.em-tbl{width:100%;border-collapse:collapse;font-size:13.5px}.em-tbl th,.em-tbl td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--c-line,#eee)}.em-tbl th{color:var(--c-mut,#8b98a5);font-weight:600}';
 document.head.appendChild(s);
}
var LOCKICO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

window.renderEmail=async function(box,ctx){
 css();
 ctx=ctx||{};var CLI=ctx.cliente||window.CLIENT;var isAdmin=!!ctx.admin;
 box.innerHTML='<div class="card"><div class="rep-empty">Carregando Email Marketing…</div></div>';
 var st;
 try{st=await api({action:'key_status'});}catch(e){box.innerHTML='<div class="card"><div class="rep-empty">Erro ao conectar: '+esc(e.message)+'</div></div>';return;}

 if(!st.configured){
  if(!isAdmin){box.innerHTML='<div class="card"><div class="ig-empty"><b>Email Marketing</b>O envio ainda está sendo configurado pela Wiz Mídia.</div></div>';return;}
  box.innerHTML='<div class="card csec"><h2>Conectar o Brevo</h2><p class="em-hint">Cole a chave de API v3 do Brevo.</p><div class="em-f" style="margin-top:12px"><label>Chave de API do Brevo</label><input id="emKey" type="password" placeholder="xkeysib-..." autocomplete="off"></div><div class="em-row"><button class="em-btn pri" id="emKeySave">Conectar</button></div><div class="em-msg" id="emMsg"></div></div>';
  document.getElementById('emKeySave').onclick=async function(){var m=document.getElementById('emMsg');var k=document.getElementById('emKey').value.trim();if(!k){m.className='em-msg err';m.textContent='Cole a chave.';return;}var b=this;b.disabled=true;b.textContent='Conectando…';try{await api({action:'save_key',key:k});setTimeout(function(){window.renderEmail(box,ctx);},600);}catch(e){m.className='em-msg err';m.textContent=(e.message==='chave_invalida'?'Chave inválida.':'Erro: '+e.message);b.disabled=false;b.textContent='Conectar';}};
  return;
 }

 var lists=[],senders=[],camps=[],map=null,nsStore=null;
 var R=await Promise.allSettled([
   api({action:'mapping',clientId:CLI.id}),
   api({action:'campaigns',clientId:CLI.id}),
   nsapi({action:'store_status',clientId:CLI.id}),
   isAdmin?api({action:'lists'}):Promise.resolve(null),
   isAdmin?api({action:'senders'}):Promise.resolve(null)
 ]);
 var gv=function(i){return R[i]&&R[i].status==='fulfilled'?R[i].value:null;};
 map=(gv(0)||{}).mapping||null; camps=(gv(1)||{}).campaigns||[]; nsStore=gv(2); lists=(gv(3)||{}).lists||[]; senders=(gv(4)||{}).senders||[];

 var mListId=(map&&map.brevo_list_id)||CLI.brevo_list_id||'';
 var mListName=(map&&map.brevo_list_name)||CLI.brevo_list_name||'';
 var mSN=(map&&map.brevo_sender_name)||CLI.brevo_sender_name||'';
 var mSE=(map&&map.brevo_sender_email)||CLI.brevo_sender_email||'';
 var nsConn=nsStore&&nsStore.connected;
 var SIMPLE_IDS=['b251b2f2-2bdf-4767-b81f-00d0ca09b1c8','6e6acc59-4b3b-4eb0-b70c-5007accf150e']; // clientes de campanha sem loja: Inside English, Fratelli
 var simpleMode=(!nsConn)&&(SIMPLE_IDS.indexOf(String(CLI.id))>=0)&&!!mListId;
 var listInfo=null; if(simpleMode){try{listInfo=await simpleapi({action:'list_info',clientId:CLI.id});}catch(_e){}}
 var SEGS=(CLI.brevo_segments&&typeof CLI.brevo_segments==='object')?CLI.brevo_segments:null;
 var segDefs=SEGS?[['todos','Todos os contatos'],['compradores','Compradores'],['nao','Não compraram'],['d60','Última compra +60 dias']].filter(function(d){return SEGS[d[0]];}):[];
 if(segDefs.length){ if(!mListId||!SEGS[Object.keys(SEGS).find(function(k){return String(SEGS[k])===String(mListId);})||'']){mListId=SEGS.todos;mListName='Todos os contatos';} }

 var h='';
 h+='<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><b style="font-size:16px">Email Marketing</b><span class="em-tag">Brevo conectado'+(st.account?' · '+esc(st.account):'')+'</span>'+(nsConn?'<span class="em-tag">Loja: '+esc(nsStore.storeName||nsStore.storeId)+'</span>':'')+'</div></div>';

 // config envio
 h+='<div class="card csec"><h2>Configuração do envio · '+esc(CLI.name)+'</h2>';
 if(isAdmin){
  var listOpts='<option value="">— escolher lista —</option>'+lists.map(function(l){return '<option value="'+l.id+'" data-n="'+esc(l.name)+'"'+(String(l.id)===String(mListId)?' selected':'')+'>'+esc(l.name)+' ('+l.count+')</option>';}).join('');
  var sendOpts=senders.length?senders.map(function(s){return '<option value="'+esc(s.email)+'" data-n="'+esc(s.name)+'"'+(s.email===mSE?' selected':'')+'>'+esc(s.name)+' &lt;'+esc(s.email)+'&gt;</option>';}).join(''):'<option value="">nenhum remetente</option>';
  h+='<div class="em-grid"><div class="em-f"><label>Lista de destinatários</label><select id="emList">'+listOpts+'</select></div><div class="em-f"><label>Remetente</label><select id="emSender">'+sendOpts+'</select></div></div>';
  if(nsConn)h+='<div class="em-row"><button class="em-btn" id="impCust" style="font-size:13px">Importar clientes da loja pro Brevo</button><span class="em-save" id="impState"></span></div><p class="em-hint">Puxa os clientes da loja Nuvemshop e cria/atualiza a lista deste cliente automaticamente (sem CSV).</p>';
 }else{
  var listCell;
  if(simpleMode){var _c=(listInfo&&listInfo.count!=null)?listInfo.count:null;var _n=(listInfo&&listInfo.name)||mListName||('Lista '+mListId);listCell='<div class="em-lock">'+LOCKICO+'<span>'+esc(_n)+(_c!=null?' · '+_c+' contato'+(_c===1?'':'s'):'')+'</span></div>';}
  else if(segDefs.length){listCell='<select id="emSeg">'+segDefs.map(function(d){var id=SEGS[d[0]];return '<option value="'+id+'" data-n="'+esc(d[1])+'"'+(String(id)===String(mListId)?' selected':'')+'>'+esc(d[1])+'</option>';}).join('')+'</select>';}
  else{listCell='<div class="em-lock">'+LOCKICO+'<span>'+esc(mListName||('Lista '+mListId)||'não configurada')+'</span></div>';}
  h+='<div class="em-grid"><div class="em-f"><label>Lista de destinatários</label>'+listCell+'</div><div class="em-f"><label>Remetente</label><div class="em-lock">'+LOCKICO+'<span>'+(mSE?esc(mSN)+' &lt;'+esc(mSE)+'&gt;':'não configurado')+'</span></div></div></div>';
  if(segDefs.length&&!simpleMode)h+='<p class="em-hint">Escolha para quem enviar: todos, só quem já comprou, quem nunca comprou, ou quem não compra há +60 dias.</p>';
  if(!mListId&&nsConn)h+='<div class="em-row"><button class="em-btn" id="impCust" style="font-size:13px">Importar clientes da loja pro Brevo</button><span class="em-save" id="impState"></span></div><p class="em-hint">Cria a lista deste cliente puxando os clientes da loja Nuvemshop (sem CSV).</p>';
  else if(!mListId||!mSE)h+='<p class="em-hint" style="color:#c33">Configuração pendente — fale com a Wiz Mídia.</p>';
 }
 h+='</div>';

 // CAMPANHAS (seção única de templates)
 if(nsConn){
  var kindOpts=Object.keys(KINDS).map(function(k){return '<option value="'+k+'">'+esc(KINDS[k].label)+'</option>';}).join('');
  h+='<div class="card csec"><h2>Campanhas</h2>'+
     '<div class="em-f"><label>Tipo de campanha</label><select id="cKind">'+kindOpts+'</select></div>'+
     '<div class="em-grid"><div class="em-f"><label>Assunto do e-mail</label><input id="cSubj"></div><div class="em-f"><label>Texto do botão</label><input id="cCta"></div></div>'+
     '<div class="em-grid"><div class="em-f"><label>Objetivo do botão</label><select id="cBtnTarget"><option value="home">Início do site</option><option value="produtos">Página de produtos</option><option value="custom">Link personalizado</option></select></div><div class="em-f" id="cBtnUrlWrap" style="display:none"><label>Link personalizado</label><input id="cBtnUrl" placeholder="https://..."></div></div>'+
     '<div class="em-f"><label>Identificador da campanha (rastreamento) — vira utm_campaign no Google Analytics</label><input id="cUtm" placeholder="ex: promo-2026-09"></div>'+
     '<div class="em-grid"><div class="em-f"><label>Título (topo, se não subir banner)</label><input id="cHead"></div><div class="em-f"><label>Subtítulo</label><input id="cSub"></div></div>'+
     '<div class="em-f"><label>Texto do corpo (opcional)</label><textarea id="cBody"></textarea></div>'+
     '<div class="em-grid"><div class="em-f"><label>Cupom (opcional)</label><input id="cCoupon"></div><div class="em-f"><label>Desconto % (opcional)</label><input id="cDisc" type="number"></div></div>'+
     '<div class="em-grid"><div class="em-f"><label class="em-chk"><input type="checkbox" id="cProds"> Mostrar 4 produtos da loja</label></div><div class="em-f"><label>Banner do topo (opcional)</label><input id="cBanner" type="file" accept="image/*"><button type="button" class="em-btn" id="cBannerClear" style="margin-top:6px;font-size:12px;padding:6px 10px;display:none">✕ remover banner</button></div></div>'+
     '<div class="em-row"><button class="em-btn pri" id="cGen">Gerar prévia</button><span class="em-save" id="cState"></span></div>'+
     '<div id="cPrev" style="margin-top:12px"></div>'+
     '<div class="em-row" style="border-top:1px solid var(--c-line,#eee);padding-top:14px;margin-top:16px"><input id="cTestTo" placeholder="e-mail p/ teste (opcional)" style="width:230px;background:var(--c-bg2,#fff);border:1px solid var(--c-line,#e3e7ee);border-radius:10px;padding:10px 12px;font-size:14px;color:inherit;font-family:inherit"><button class="em-btn" id="cTest">Enviar teste</button><button class="em-btn pri" id="cSend">Enviar campanha</button><button class="em-btn" id="cSched">Agendar em lotes (250/dia)</button></div>'+
     '<div class="em-msg" id="cMsg"></div>'+
     '<div class="em-row" style="border-top:1px solid var(--c-line,#eee);padding-top:12px;margin-top:14px"><button class="em-btn" id="fnBtn" style="font-size:13px">Ajustar lista: usar só o primeiro nome</button><span class="em-save" id="fnState"></span></div>'+
     '<p class="em-hint">Uma vez só: encurta o campo NOME dos contatos da lista pra saudação sair só com o primeiro nome (ex: "Olá, Gabriel!").</p></div>';
 }else if(simpleMode){
  h+='<div class="card csec"><h2>Campanhas</h2><p class="em-hint">Até 3 campanhas salvas. Abra uma, edite e envie. O conteúdo fica guardado pro próximo envio.</p><div id="slotWrap"></div></div>';
 }else{
  h+='<div class="card csec"><h2>Campanhas</h2><p class="em-hint">Conecte a loja Nuvemshop pra montar campanhas com produtos automáticos.</p></div>';
 }

 // Loja Nuvemshop status
 h+='<div class="card csec"><h2>Loja Nuvemshop</h2>'+(nsConn?'<div class="em-lock" style="max-width:520px">'+LOCKICO+'<span>Loja conectada · '+esc(nsStore.storeName||nsStore.storeId)+'</span></div><div class="em-row"><button class="em-btn" id="nsHook" style="font-size:13px">Ativar rastreamento de compras</button><span class="em-save" id="nsHookState"></span></div><p class="em-hint">Liga o rastreio de venda por campanha (registra cliques e casa com os pedidos da loja). Faça uma vez.</p>':'<p class="em-hint">Loja não conectada'+(isAdmin?' (não achei em nuvem_tokens).':'.')+'</p>')+'</div>';

 // relatório
 h+='<div class="card csec"><h2>Campanhas enviadas</h2>';
 if(!camps.length){h+='<div class="rep-empty" style="padding:18px">Nenhuma campanha ainda.</div>';}
 else{
  var stName=function(s){s=(s||'').toLowerCase();if(s==='sent')return['Enviada','#0a8f6d'];if(s==='queued'||s==='inprocess'||s==='in_process'||s==='pending'||s==='in_review')return['Em análise','#2f7bf6'];if(s==='scheduled')return['Agendada','#b8860b'];if(s==='suspended')return['Suspensa','#c33'];if(s==='draft')return['Rascunho','#8b98a5'];if(s==='archive'||s==='archived')return['Arquivada','#8b98a5'];if(s==='canceled'||s==='cancelled')return['Cancelada','#8b98a5'];return[s||'-','#8b98a5'];};
  h+='<div style="overflow:auto"><table class="em-tbl"><thead><tr><th>Assunto</th><th>Status</th><th>Destinatários</th><th>Aberturas</th><th>Cliques</th><th>Inscrição cancelada</th><th>Compras</th><th>Data</th></tr></thead><tbody>';
  camps.forEach(function(c){var base=c.planned||c.sent||0;var op=base?Math.round(c.opens/base*100):0,cl=base?Math.round(c.clicks/base*100):0;var d=c.sentDate?new Date(c.sentDate):null;var ds=d?(String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')):'';var rec=c.receita?(' · R$ '+Number(c.receita).toFixed(2).replace('.',',')):'';var st=stName(c.status);var unsub=c.unsub||0;h+='<tr><td>'+esc(c.subject||c.name||'-')+'</td><td><span style="color:'+st[1]+';font-weight:600">'+esc(st[0])+'</span></td><td>'+base+'</td><td>'+c.opens+' ('+op+'%)</td><td>'+c.clicks+' ('+cl+'%)</td><td>'+unsub+(unsub>0?' <span title="Já removidos do envio automaticamente" style="color:var(--c-mut,#8b98a5);font-size:11px">(bloqueados)</span>':'')+'</td><td><b>'+(c.compras||0)+'</b>'+rec+'</td><td>'+ds+'</td></tr>';});
  h+='</tbody></table></div>';}
 h+='</div>';

 // Emails automáticos enviados (carrinho / reativação / novidades) — mostra o email exato como foi enviado
 h+='<div class="card csec"><h2>Emails automáticos enviados</h2><p class="em-hint">Cada disparo automático de carrinho abandonado, reativação e novidades. Clique em "Ver email" pra ver exatamente como foi enviado (o mesmo HTML que o cliente recebeu).</p><div class="em-row" style="gap:8px;flex-wrap:wrap"><select id="autoTypeF" style="background:var(--c-bg2,#fff);border:1px solid var(--c-line,#e3e7ee);border-radius:10px;padding:9px 12px;font-size:13px;color:inherit;font-family:inherit"><option value="">Todos os tipos</option><option value="carrinho">Carrinho abandonado</option><option value="reativacao">Reativação</option><option value="novidades">Novidades</option></select><button class="em-btn" id="autoReload" style="font-size:13px">Atualizar</button></div><div id="autoSentWrap" style="margin-top:12px"><div class="rep-empty" style="padding:14px">Carregando…</div></div></div>';

 box.innerHTML=h;

 // ===== Emails automáticos enviados: lista + visualizador =====
 async function loadAutoSent(){
   var wrap=document.getElementById('autoSentWrap'); if(!wrap)return;
   var tf=(document.getElementById('autoTypeF')||{}).value||'';
   wrap.innerHTML='<div class="rep-empty" style="padding:14px">Carregando…</div>';
   try{
     var query=sb.from('portal_email_auto_log').select('id,type,ref,email,total,subject,sender,sent_at,converted_at,order_number,order_total,order_id').eq('client_id',CLI.id).order('sent_at',{ascending:false}).limit(500);
     if(tf)query=query.eq('type',tf);
     var res=await query; if(res.error)throw res.error;
     var rows=(res.data||[]).filter(function(r){return !/:nao$/.test(r.ref||'');}); // tira os "movido p/ não-compradores" (não é email)
     if(!rows.length){wrap.innerHTML='<div class="rep-empty" style="padding:14px">Nenhum email automático enviado ainda para este cliente.</div>';return;}
     var stepLbl=function(ref,type){var m=String(ref||'').match(/:([^:]+)$/);var s=m?m[1]:'';if(s==='1')return '1º toque · 1h';if(s==='24')return '2º toque · 24h';if(s==='72')return '3º toque · 72h';if(type==='novidades')return 'campanha';return s||'-';};
     var tipoLbl=function(t){return t==='carrinho'?'Carrinho':t==='reativacao'?'Reativação':t==='novidades'?'Novidades':t;};
     var brl=function(v){return 'R$ '+Number(v||0).toFixed(2).replace('.',',');};
     // ===== Resumo de recuperação: cada pedido conta 1x (dedup por order_id) =====
     var enviados=rows.length, seenOrd={}, pedidos=0, receita=0;
     rows.forEach(function(r){ if(r.converted_at && r.order_id && !seenOrd[r.order_id]){seenOrd[r.order_id]=1;pedidos++;receita+=Number(r.order_total||0);} });
     var taxa=enviados?Math.round(pedidos/enviados*100):0;
     var stat=function(lbl,val,cor){return '<div style="flex:1;min-width:120px;background:var(--c-bg2,#fff);border:1px solid var(--c-line,#e3e7ee);border-radius:12px;padding:12px 14px"><div style="font-size:12px;color:var(--c-mut,#8b98a5);margin-bottom:3px">'+lbl+'</div><div style="font-size:20px;font-weight:700;color:'+(cor||'inherit')+'">'+val+'</div></div>';};
     var html='<div class="em-row" style="gap:10px;flex-wrap:wrap;margin-bottom:14px">'
       +stat('Emails enviados',String(enviados),'')
       +stat('Geraram venda',String(pedidos)+' <span style=\"font-size:13px;font-weight:600;color:var(--c-mut,#8b98a5)\">('+taxa+'%)</span>','#0a8f6d')
       +stat('Receita recuperada',brl(receita),'#0a8f6d')
       +'</div>';
     html+='<div style="overflow:auto"><table class="em-tbl"><thead><tr><th>Data</th><th>Tipo</th><th>Etapa</th><th>Destinatário</th><th>Valor</th><th>Resultado</th><th></th></tr></thead><tbody>';
     rows.forEach(function(r){
       var d=r.sent_at?new Date(r.sent_at):null;
       var ds=d?(String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')):'';
       var val=(r.total!=null&&r.total!=='')?brl(r.total):'';
       var dest=(r.email==='lista')?'Lista inteira':(r.email||'');
       var venceu=!!r.converted_at;
       var rowStyle=venceu?' style="background:rgba(10,143,109,.10)"':'';
       var resultado=venceu
         ? '<span style="display:inline-block;background:#0a8f6d;color:#fff;font-weight:700;font-size:11px;padding:3px 9px;border-radius:999px;white-space:nowrap">✅ Vendeu '+brl(r.order_total)+(r.order_number?(' · #'+esc(r.order_number)):'')+'</span>'
         : '<span style="color:var(--c-mut,#8b98a5)">—</span>';
       html+='<tr'+rowStyle+'><td style="white-space:nowrap">'+esc(ds)+'</td><td>'+esc(tipoLbl(r.type))+'</td><td style="white-space:nowrap">'+esc(stepLbl(r.ref,r.type))+'</td><td>'+esc(dest)+'</td><td style="white-space:nowrap">'+esc(val)+'</td><td style="white-space:nowrap">'+resultado+'</td><td><button class="em-btn" style="font-size:12px;padding:6px 10px" onclick="window.__verEmail(\''+r.id+'\')">Ver email</button></td></tr>';
     });
     html+='</tbody></table></div>';
     html+='<p class="em-hint" style="margin-top:8px">Verde = esse contato comprou depois de receber o email (pedido feito em até 7 dias). Cada pedido conta uma vez no resumo, mesmo que a pessoa tenha recebido mais de um toque.</p>';
     wrap.innerHTML=html;
   }catch(e){wrap.innerHTML='<div class="rep-empty" style="padding:14px;color:#c33">Não consegui carregar os envios ('+esc(e.message||e)+').</div>';}
 }
 window.__verEmail=async function(id){
   try{
     var res=await sb.from('portal_email_auto_log').select('html,subject,sender,email,sent_at').eq('id',id).maybeSingle();
     if(res.error)throw res.error;
     var r=res.data||{};
     if(!r.html){alert('Este email foi enviado antes de a gente começar a guardar o HTML exato. A partir de agora todos ficam salvos e aparecem aqui idênticos ao enviado.');return;}
     var d=r.sent_at?new Date(r.sent_at):null; var ds=d?d.toLocaleString('pt-BR'):'';
     var ov=document.getElementById('emViewOvl');
     if(!ov){ov=document.createElement('div');ov.id='emViewOvl';ov.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(15,25,50,.5);display:flex;align-items:center;justify-content:center;padding:16px';document.body.appendChild(ov);}
     ov.innerHTML='';
     var card=document.createElement('div');card.style.cssText='background:#fff;border-radius:14px;max-width:660px;width:100%;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,.3)';
     card.innerHTML='<div style="padding:14px 16px;border-bottom:1px solid #eee;font-family:system-ui,Arial;color:#1e2d50"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div style="min-width:0"><div style="font-size:12px;color:#8b98a5">De: '+esc(r.sender||'')+'</div><div style="font-size:12px;color:#8b98a5">Para: '+esc(r.email||'')+'</div><div style="font-weight:700;margin-top:4px">'+esc(r.subject||'(sem assunto)')+'</div><div style="font-size:12px;color:#8b98a5;margin-top:2px">'+esc(ds)+'</div></div><button id="emViewClose" style="border:0;background:#f0f3f8;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:18px;line-height:1;flex:none">✕</button></div></div><div style="flex:1;overflow:auto;background:#f4f6fa"><iframe id="emViewFrame" sandbox="allow-same-origin" style="width:100%;height:70vh;border:0;background:#fff"></iframe></div>';
     ov.appendChild(card);
     ov.onclick=function(e){if(e.target===ov)ov.remove();};
     document.getElementById('emViewClose').onclick=function(){ov.remove();};
     document.getElementById('emViewFrame').srcdoc=r.html;
   }catch(e){alert('Erro ao abrir o email: '+(e.message||e));}
 };
 var _atf=document.getElementById('autoTypeF'); if(_atf)_atf.onchange=loadAutoSent;
 var _arl=document.getElementById('autoReload'); if(_arl)_arl.onclick=loadAutoSent;
 loadAutoSent();

 if(isAdmin){
  var saveMapping=function(){var ls=document.getElementById('emList');var listId=ls.value;var listName=(ls.selectedOptions[0]&&ls.selectedOptions[0].getAttribute('data-n'))||'';var se=document.getElementById('emSender');var senderEmail=se.value;var senderName=(se.selectedOptions[0]&&se.selectedOptions[0].getAttribute('data-n'))||'';CLI.brevo_list_id=listId;mListId=listId;mListName=listName;mSN=senderName;mSE=senderEmail;api({action:'save_mapping',clientId:CLI.id,listId:listId,listName:listName,senderName:senderName,senderEmail:senderEmail}).catch(function(){});};
  document.getElementById('emList').onchange=saveMapping;document.getElementById('emSender').onchange=saveMapping;
 }
 var segSel=document.getElementById('emSeg');
 if(segSel)segSel.onchange=function(){mListId=this.value;mListName=(this.selectedOptions[0]&&this.selectedOptions[0].getAttribute('data-n'))||'';};

 var imp=document.getElementById('impCust');
 if(imp)imp.onclick=async function(){var s=document.getElementById('impState');if(!confirm('Puxar os clientes da loja Nuvemshop pro Brevo e usar como lista deste cliente?'))return;this.disabled=true;s.textContent='importando (pode levar ~1 min)…';try{var r=await api({action:'import_customers',clientId:CLI.id});s.textContent='pronto: '+r.count+' contatos na lista "'+r.listName+'"';setTimeout(function(){window.renderEmail(box,ctx);},1600);}catch(e){s.textContent='erro: '+e.message+(e.detail?(' ['+JSON.stringify(e.detail)+']'):'');this.disabled=false;}};

 var nsHook=document.getElementById('nsHook');
 if(nsHook)nsHook.onclick=async function(){var s=document.getElementById('nsHookState');this.disabled=true;s.textContent='ativando…';try{await nsapi({action:'setup_webhook',clientId:CLI.id});await api({action:'setup_webhook'});s.textContent='rastreamento ativo ✓';}catch(e){s.textContent='erro: '+e.message+(e.detail?(' ['+JSON.stringify(e.detail)+']'):'');}this.disabled=false;};

 if(simpleMode){
  var NSLOTS=3, CTA_DEF='Falar no WhatsApp', URL_DEF='https://wa.me/5534999292726';
  var genBy={}, slotData={};
  var fileB64s=function(f){return new Promise(function(res){var rd=new FileReader();rd.onload=function(){res(String(rd.result).split(',')[1]||'');};rd.readAsDataURL(f);});};
  function esc2(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function fieldsHTML(n,d){d=d||{};
   return '<div class="em-grid"><div class="em-f"><label>Assunto do e-mail</label><input id="cSubj'+n+'" value="'+esc2(d.subject||'')+'" placeholder="Ex: Inglês no dia a dia"></div><div class="em-f"><label>Identificador (rastreamento) — opcional</label><input id="cUtm'+n+'" value="'+esc2(d.utm||'')+'"></div></div>'+
    '<div class="em-grid"><div class="em-f"><label>Título (opcional)</label><input id="cHead'+n+'" value="'+esc2(d.headline||'')+'" placeholder="deixe vazio se a imagem já tiver o título"></div><div class="em-f"><label>Subtítulo (opcional)</label><input id="cSub'+n+'" value="'+esc2(d.sub||'')+'"></div></div>'+
    '<div class="em-f"><label>Texto do e-mail</label><textarea id="cBody'+n+'" style="min-height:150px" placeholder="Escreva aqui. Pode usar quebras de linha e emojis.">'+esc2(d.bodyText||'')+'</textarea></div>'+
    '<div class="em-grid"><div class="em-f"><label>Texto do botão</label><input id="cCta'+n+'" value="'+esc2(d.ctaText||CTA_DEF)+'"></div><div class="em-f"><label>Link do botão</label><input id="cBtnUrl'+n+'" value="'+esc2(d.ctaUrl||URL_DEF)+'"></div></div>'+
    '<div class="em-f"><label>Imagem do topo</label>'+(d.bannerUrl?'<div class="em-hint" style="margin:2px 0 6px">Imagem já salva. Escolha outra só se quiser trocar.</div>':'')+'<input id="cBanner'+n+'" type="file" accept="image/*"></div>'+
    '<div class="em-row"><button class="em-btn pri" id="cGen'+n+'">Gerar prévia</button><span class="em-save" id="cState'+n+'"></span></div>'+
    '<div id="cPrev'+n+'" style="margin-top:12px"></div>'+
    '<div class="em-row" style="border-top:1px solid var(--c-line,#eee);padding-top:14px;margin-top:16px"><input id="cTestTo'+n+'" placeholder="e-mail p/ teste (opcional)" style="width:230px;background:var(--c-bg2,#fff);border:1px solid var(--c-line,#e3e7ee);border-radius:10px;padding:10px 12px;font-size:14px;color:inherit;font-family:inherit"><button class="em-btn" id="cTest'+n+'">Enviar teste</button><button class="em-btn pri" id="cSend'+n+'">Enviar campanha</button></div>'+
    '<div class="em-msg" id="cMsg'+n+'"></div>';}
  function curData(n){return {subject:(document.getElementById('cSubj'+n).value||'').trim(),utm:(document.getElementById('cUtm'+n).value||'').trim(),headline:(document.getElementById('cHead'+n).value||'').trim(),sub:(document.getElementById('cSub'+n).value||'').trim(),bodyText:document.getElementById('cBody'+n).value,ctaText:(document.getElementById('cCta'+n).value||'').trim(),ctaUrl:(document.getElementById('cBtnUrl'+n).value||'').trim(),bannerUrl:(slotData[n]&&slotData[n].bannerUrl)||''};}
  function setSub(n,subj){var ss=document.getElementById('slotSub'+n);if(ss)ss.textContent=(subj?subj:'vazia');}
  function bindSlot(n){
   document.getElementById('cGen'+n).onclick=async function(){
    var stt=document.getElementById('cState'+n);var b=this;b.disabled=true;stt.textContent='';b.textContent='Gerando…';
    try{
     var bannerUrl=(slotData[n]&&slotData[n].bannerUrl)||'';var fi=document.getElementById('cBanner'+n);
     if(fi&&fi.files&&fi.files[0]){stt.textContent='subindo imagem…';var f=fi.files[0];var b64=await fileB64s(f);var up=await api({action:'upload_image',clientId:CLI.id,filename:f.name,contentType:f.type,contentBase64:b64});bannerUrl=up.url;}
     var d=curData(n);d.bannerUrl=bannerUrl;slotData[n]=d;
     stt.textContent='montando…';
     var r=await simpleapi({action:'gen_simple',clientId:CLI.id,bannerUrl:bannerUrl,headline:d.headline,sub:d.sub,bodyText:d.bodyText,ctaText:d.ctaText,ctaUrl:d.ctaUrl});
     genBy[n]=r.html;
     await simpleapi({action:'save_slot',clientId:CLI.id,slot:n,data:d});setSub(n,d.subject);
     document.getElementById('cPrev'+n).innerHTML='<div class="em-hint" style="margin-bottom:6px">Prévia (salva ✓):</div><iframe style="width:100%;height:520px;border:1px solid var(--c-line,#e3e7ee);border-radius:10px;background:#fff"></iframe>';
     document.getElementById('cPrev'+n).querySelector('iframe').srcdoc=genBy[n].replace(/\{NOME\}/g,'Ana');
     stt.textContent='prévia pronta ✓';
    }catch(e){stt.textContent='erro: '+e.message+(e.detail?(' ['+JSON.stringify(e.detail)+']'):'');}
    b.disabled=false;b.textContent='Gerar prévia';
   };
   document.getElementById('cTest'+n).onclick=async function(){
    var m=document.getElementById('cMsg'+n);var b=this;var subj=(document.getElementById('cSubj'+n).value||'').trim();
    if(!genBy[n]){m.className='em-msg err';m.textContent='Gere a prévia primeiro.';return;}
    if(!subj){m.className='em-msg err';m.textContent='Preencha o assunto.';return;}
    var to=(document.getElementById('cTestTo'+n).value||'').trim();
    if(to&&!/.+@.+\..+/.test(to)){m.className='em-msg err';m.textContent='E-mail de teste inválido.';return;}
    b.disabled=true;b.textContent='Enviando…';
    try{var r=await api({action:'test',clientId:CLI.id,subject:subj,html:genBy[n],senderName:mSN,senderEmail:mSE,toEmail:to});m.className='em-msg ok';m.textContent='Teste enviado para '+r.to+'.';}
    catch(e){m.className='em-msg err';m.textContent='Erro: '+e.message+(e.detail?(' ['+JSON.stringify(e.detail)+']'):'');}
    b.disabled=false;b.textContent='Enviar teste';
   };
   document.getElementById('cSend'+n).onclick=async function(){
    var m=document.getElementById('cMsg'+n);var b=this;var subj=(document.getElementById('cSubj'+n).value||'').trim();
    if(!genBy[n]){m.className='em-msg err';m.textContent='Gere a prévia primeiro.';return;}
    if(!mListId){m.className='em-msg err';m.textContent='Lista não configurada.';return;}
    if(!subj){m.className='em-msg err';m.textContent='Preencha o assunto.';return;}
    if(!confirm('Enviar a Campanha '+n+' AGORA para a lista "'+(mListName||mListId)+'"?\n\nAssunto: '+subj+'\n\nDispara de verdade. Confirmar?'))return;
    b.disabled=true;b.textContent='Enviando…';
    try{await simpleapi({action:'save_slot',clientId:CLI.id,slot:n,data:curData(n)});var r=await api({action:'send',clientId:CLI.id,listId:mListId,subject:subj,html:genBy[n],senderName:mSN,senderEmail:mSE,utmCampaign:(document.getElementById('cUtm'+n).value||'').trim()});m.className='em-msg ok';m.textContent='Campanha '+n+' criada no Brevo ('+r.recipients+' contatos). No plano free o Brevo envia até 300/dia.';}
    catch(e){m.className='em-msg err';m.textContent='Erro ao enviar: '+e.message+(e.detail?(' ['+JSON.stringify(e.detail)+']'):'');}
    b.disabled=false;b.textContent='Enviar campanha';
   };
  }
  (async function(){
   var wrap=document.getElementById('slotWrap');var got={};
   try{var g=await simpleapi({action:'get_slots',clientId:CLI.id});(g.slots||[]).forEach(function(row){got[row.slot]=row.data||{};});}catch(e){}
   var html='';
   for(var n=1;n<=NSLOTS;n++){slotData[n]=got[n]||{};var subj=(slotData[n].subject||'').trim();
    html+='<div style="border:1px solid var(--c-line,#e3e7ee);border-radius:12px;margin-bottom:10px;overflow:hidden">'+
     '<button type="button" id="slotHdr'+n+'" style="width:100%;text-align:left;background:var(--c-bg,#f6f8fa);border:0;padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;color:inherit;font-family:inherit"><span style="font-weight:700;font-size:15px">Campanha '+n+'</span><span id="slotSub'+n+'" style="font-size:13px;color:var(--c-mut,#8b98a5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">'+(subj?esc2(subj):'vazia')+'</span><span style="font-size:18px;color:var(--c-mut,#8b98a5)" id="slotArr'+n+'">+</span></button>'+
     '<div id="slotBody'+n+'" style="display:none;padding:16px">'+fieldsHTML(n,slotData[n])+'</div></div>';}
   wrap.innerHTML=html;
   for(var k=1;k<=NSLOTS;k++){(function(n){var bd=document.getElementById('slotBody'+n),ar=document.getElementById('slotArr'+n);document.getElementById('slotHdr'+n).onclick=function(){var open=bd.style.display!=='none';bd.style.display=open?'none':'block';ar.textContent=open?'+':'–';};bindSlot(n);})(k);}
  })();
  return;
 }
 if(!nsConn)return;

 var genHtml=null;
 function fileB64(f){return new Promise(function(res){var rd=new FileReader();rd.onload=function(){res(String(rd.result).split(',')[1]||'');};rd.readAsDataURL(f);});}
 function applyKind(k){var d=KINDS[k]||KINDS.generico;document.getElementById('cSubj').value=d.subject;document.getElementById('cHead').value=d.headline;document.getElementById('cSub').value=d.sub;document.getElementById('cBody').value=d.body;document.getElementById('cCoupon').value=d.coupon;document.getElementById('cDisc').value=d.discount||'';document.getElementById('cCta').value=d.cta;document.getElementById('cProds').checked=!!d.products;var ut=document.getElementById('cUtm');if(ut)ut.value=(k+'-'+new Date().toISOString().slice(0,7)).toLowerCase();genHtml=null;document.getElementById('cPrev').innerHTML='';}
 document.getElementById('cKind').onchange=function(){applyKind(this.value);};
 applyKind('promo');
 document.getElementById('cBtnTarget').onchange=function(){document.getElementById('cBtnUrlWrap').style.display=this.value==='custom'?'':'none';};
 var bIn=document.getElementById('cBanner'),bClear=document.getElementById('cBannerClear');
 bIn.onchange=function(){bClear.style.display=(bIn.files&&bIn.files[0])?'':'none';};
 bClear.onclick=function(){bIn.value='';bClear.style.display='none';};

 document.getElementById('cGen').onclick=async function(){
  var stt=document.getElementById('cState');var b=this;b.disabled=true;stt.textContent='';b.textContent='Gerando…';
  try{
   var bannerUrl='';var fi=document.getElementById('cBanner');
   if(fi&&fi.files&&fi.files[0]){stt.textContent='subindo banner…';var f=fi.files[0];var b64=await fileB64(f);var up=await api({action:'upload_image',clientId:CLI.id,filename:f.name,contentType:f.type,contentBase64:b64});bannerUrl=up.url;}
   stt.textContent='montando…';
   var r=await nsapi({action:'gen_template',clientId:CLI.id,bannerUrl:bannerUrl,
     headline:document.getElementById('cHead').value.trim(),sub:document.getElementById('cSub').value.trim(),
     bodyText:document.getElementById('cBody').value.trim(),coupon:document.getElementById('cCoupon').value.trim(),
     discountPct:parseInt(document.getElementById('cDisc').value,10)||0,ctaText:document.getElementById('cCta').value.trim(),
     btnTarget:document.getElementById('cBtnTarget').value,btnUrl:(document.getElementById('cBtnUrl')?document.getElementById('cBtnUrl').value.trim():''),
     utmCampaign:document.getElementById('cUtm').value.trim(),
     showProducts:document.getElementById('cProds').checked,subject:document.getElementById('cSubj').value.trim()});
   genHtml=r.html;
   document.getElementById('cPrev').innerHTML='<div class="em-hint" style="margin-bottom:6px">Prévia — o nome é só exemplo. Na campanha real, cada pessoa recebe o próprio nome (campo NOME da lista).</div><iframe style="width:100%;height:560px;border:1px solid var(--c-line,#e3e7ee);border-radius:10px;background:#fff"></iframe>';
   document.getElementById('cPrev').querySelector('iframe').srcdoc=genHtml.replace(/\{NOME\}/g,'Ana');
   stt.textContent='prévia pronta ✓';
  }catch(e){stt.textContent='erro: '+e.message+(e.detail?(' ['+JSON.stringify(e.detail)+']'):'');}
  b.disabled=false;b.textContent='Gerar prévia';
 };

 document.getElementById('cTest').onclick=async function(){
  var m=document.getElementById('cMsg');var b=this;var subj=document.getElementById('cSubj').value.trim();
  if(!genHtml){m.className='em-msg err';m.textContent='Gere a prévia primeiro.';return;}
  if(!subj){m.className='em-msg err';m.textContent='Preencha o assunto.';return;}
  var to=document.getElementById('cTestTo').value.trim();
  if(to&&!/.+@.+\..+/.test(to)){m.className='em-msg err';m.textContent='E-mail de teste inválido.';return;}
  b.disabled=true;b.textContent='Enviando…';
  try{var r=await api({action:'test',clientId:CLI.id,subject:subj,html:genHtml,senderName:mSN,senderEmail:mSE,toEmail:to});m.className='em-msg ok';m.textContent='Teste enviado para '+r.to+'.';}
  catch(e){m.className='em-msg err';m.textContent='Erro: '+e.message+(e.detail?(' ['+JSON.stringify(e.detail)+']'):'');}
  b.disabled=false;b.textContent='Enviar teste';
 };
 document.getElementById('cSend').onclick=async function(){
  var m=document.getElementById('cMsg');var b=this;var subj=document.getElementById('cSubj').value.trim();
  if(!genHtml){m.className='em-msg err';m.textContent='Gere a prévia primeiro.';return;}
  if(!mListId){m.className='em-msg err';m.textContent='Lista não configurada.';return;}
  if(!subj){m.className='em-msg err';m.textContent='Preencha o assunto.';return;}
  if(!confirm('Enviar AGORA para a lista "'+(mListName||mListId)+'"?\n\nAssunto: '+subj+'\n\nDispara de verdade. Confirmar?'))return;
  b.disabled=true;b.textContent='Enviando…';
  try{var r=await api({action:'send',clientId:CLI.id,listId:mListId,subject:subj,html:genHtml,senderName:mSN,senderEmail:mSE,utmCampaign:(document.getElementById('cUtm')?document.getElementById('cUtm').value.trim():'')});m.className='em-msg ok';m.textContent='Campanha criada no Brevo p/ a lista ('+r.recipients+' contatos). Atenção: no plano free o Brevo envia até 300/dia — confira o andamento no Brevo/relatório.';setTimeout(function(){window.renderEmail(box,ctx);},2600);}
  catch(e){m.className='em-msg err';m.textContent='Erro ao enviar: '+e.message+(e.detail?(' ['+JSON.stringify(e.detail)+']'):'');b.disabled=false;b.textContent='Enviar campanha';}
 };
 var cSched=document.getElementById('cSched');
 if(cSched)cSched.onclick=async function(){
  var m=document.getElementById('cMsg');var b=this;var subj=document.getElementById('cSubj').value.trim();
  if(!genHtml){m.className='em-msg err';m.textContent='Gere a prévia primeiro.';return;}
  if(!subj){m.className='em-msg err';m.textContent='Preencha o assunto.';return;}
  if(!confirm('Agendar em lotes de 250/dia, começando amanhã às 9h?\n\nA lista inteira será dividida e enviada aos poucos, respeitando o limite do Brevo. Confirmar?'))return;
  b.disabled=true;b.textContent='Agendando…';
  try{var r=await api({action:'schedule_batches',clientId:CLI.id,subject:subj,html:genHtml,utmCampaign:(document.getElementById('cUtm')?document.getElementById('cUtm').value.trim():''),perDay:250,hour:9});m.className='em-msg ok';m.textContent='Agendado! '+r.batches+' lotes de até '+r.perDay+' e-mails ('+r.total+' contatos). 1º envio amanhã 9h; o resto nos dias seguintes.';setTimeout(function(){window.renderEmail(box,ctx);},2600);}
  catch(e){m.className='em-msg err';m.textContent='Erro ao agendar: '+e.message+(e.detail?(' ['+JSON.stringify(e.detail)+']'):'');b.disabled=false;b.textContent='Agendar em lotes (250/dia)';}
 };
 var fnBtn=document.getElementById('fnBtn');
 if(fnBtn)fnBtn.onclick=async function(){var s=document.getElementById('fnState');if(!confirm('Ajustar os contatos da lista pra usar só o primeiro nome? Faz uma vez.'))return;this.disabled=true;s.textContent='processando (pode levar ~1 min)…';try{var r=await api({action:'first_names',clientId:CLI.id});s.textContent='pronto: '+r.updated+' de '+r.total+' contatos ajustados';}catch(e){s.textContent='erro: '+e.message+(e.detail?(' ['+JSON.stringify(e.detail)+']'):'');}this.disabled=false;};
};
})();
