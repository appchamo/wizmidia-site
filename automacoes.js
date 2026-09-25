/* Wiz Mídia — Automações de e-mail (fluxos automáticos por gatilho) */
(function(){
'use strict';
var AUTOFN=SUPA_URL+'/functions/v1/automations';
async function post(u,payload,raw){
  var s=(await sb.auth.getSession()).data.session;
  var r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPA_KEY,Authorization:'Bearer '+(s&&s.access_token||'')},body:JSON.stringify(payload)});
  if(raw){return await r.text();}
  var j=await r.json().catch(function(){return{};});
  if(!r.ok||j.error){throw new Error(j.error||('HTTP '+r.status));}
  return j;
}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

function css(){
  if(document.getElementById('autocss'))return;
  var s=document.createElement('style');s.id='autocss';
  s.textContent=
   '.au-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px}'+
   '.au-tag{display:inline-block;font-size:12px;padding:3px 9px;border-radius:20px;background:rgba(22,199,154,.14);color:#0a8f6d;font-weight:600}'+
   '.au-card{border:1px solid var(--c-line,#e3e7ee);border-radius:14px;margin-bottom:12px;background:var(--c-panel,#fff);overflow:hidden}'+
   '.au-top{display:flex;align-items:center;gap:12px;padding:16px;cursor:pointer}'+
   '.au-chev{flex:0 0 auto;width:20px;height:20px;transition:transform .2s;opacity:.5}'+
   '.au-card.open .au-chev{transform:rotate(90deg)}'+
   '.au-title{font-weight:700;font-size:15px}'+
   '.au-desc{font-size:12.5px;color:var(--c-mut,#8b98a5);margin-top:2px}'+
   '.au-body{display:none;padding:0 16px 16px;border-top:1px solid var(--c-line,#eee)}'+
   '.au-card.open .au-body{display:block}'+
   '.au-f{margin-top:14px}.au-f label{display:block;font-size:12px;color:var(--c-mut,#8b98a5);margin:0 0 6px;font-weight:600}'+
   '.au-f input,.au-f select{width:100%;background:var(--c-bg2,#fff);border:1px solid var(--c-line,#e3e7ee);border-radius:10px;padding:10px 12px;font-size:14px;color:inherit;font-family:inherit}'+
   '.au-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}@media(max-width:720px){.au-grid{grid-template-columns:1fr}}'+
   '.au-steps{display:flex;flex-direction:column;gap:8px}'+
   '.au-step{display:flex;align-items:center;gap:10px;background:var(--c-bg,#f6f8fa);border:1px solid var(--c-line,#e3e7ee);border-radius:12px;padding:8px 12px}'+
   '.au-step .n{width:26px;height:26px;flex:0 0 auto;border-radius:50%;background:var(--accent,#16c79a);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center}'+
   '.au-step .txt{font-size:13.5px;color:inherit}'+
   '.au-step input{width:64px;text-align:center;padding:7px 6px}'+
   '.au-step select{width:auto;padding:7px 8px}'+
   '.au-rm{margin-left:auto;border:0;background:transparent;color:#c33;cursor:pointer;font-size:13px}'+
   '.au-add{margin-top:8px;border:1px dashed var(--c-line,#c9ced6);background:transparent;color:inherit;border-radius:10px;padding:9px 14px;font-size:13.5px;cursor:pointer;font-weight:600}'+
   '.au-meta{font-size:12.5px;color:var(--c-mut,#8b98a5);margin-top:12px}'+
   '.au-state{font-size:12px;margin-left:8px}'+
   '.au-prev{width:100%;height:520px;border:1px solid var(--c-line,#e3e7ee);border-radius:12px;margin-top:8px;background:#fff}'+
   '.au-sw{position:relative;width:46px;height:26px;flex:0 0 auto;cursor:pointer}'+
   '.au-sw input{opacity:0;width:0;height:0}'+
   '.au-sl{position:absolute;inset:0;background:#c9ced6;border-radius:26px;transition:.2s}'+
   '.au-sl:before{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s}'+
   '.au-sw input:checked+.au-sl{background:var(--accent,#16c79a)}'+
   '.au-sw input:checked+.au-sl:before{transform:translateX(20px)}';
  document.head.appendChild(s);
}
var CHEV='<svg class="au-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
var ORD=['1º','2º','3º','4º','5º'];
var DIAS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
function toRow(h){ if(h%24===0&&h>=24)return {val:h/24,unit:'dias'}; return {val:h,unit:'horas'}; }
function toHours(val,unit){ var n=parseInt(val,10)||0; return unit==='dias'?n*24:n; }

window.renderAutomacoes=async function(box,ctx){
  css();
  var CLI=ctx.cliente, admin=ctx.admin;
  box.innerHTML='<div class="card"><div class="rep-empty">Carregando automações…</div></div>';
  var res;
  try{ res=await post(AUTOFN,{action:'list',clientId:admin?CLI.id:undefined}); }
  catch(e){ box.innerHTML='<div class="card"><div class="rep-empty" style="color:#c33">Erro ao carregar: '+esc(e.message)+'</div></div>'; return; }
  var list=(res&&res.automations)||[];
  var h='<div class="card"><div class="au-head"><b style="font-size:16px">Automações de e-mail</b><span class="au-tag">'+esc(CLI.name)+'</span></div>'+
        '<p class="au-desc">E-mails que disparam sozinhos quando acontece um gatilho na sua loja. Clique numa automação pra abrir as configurações e ver a prévia.</p></div>';
  if(!list.length){ h+='<div class="card"><div class="rep-empty">Nenhuma automação disponível ainda.</div></div>'; box.innerHTML=h; return; }
  h+='<div class="card">';
  list.forEach(function(a){
    h+='<div class="au-card" data-t="'+a.type+'">'+
        '<div class="au-top">'+CHEV+
          '<div style="flex:1"><div class="au-title">'+esc(a.label)+'</div><div class="au-desc">'+esc(a.desc)+'</div></div>'+
          '<label class="au-sw" onclick="event.stopPropagation()"><input type="checkbox" class="auOn"'+(a.enabled?' checked':'')+'><span class="au-sl"></span></label>'+
        '</div>'+
        '<div class="au-body">'+
          '<div class="au-f"><label>Assunto do e-mail</label><input class="auSubj" value="'+esc(a.subject)+'"></div>'+
          '<div class="auCfg"></div>'+
          '<div class="au-meta">Status: <b class="auLbl">'+(a.enabled?'Ligado':'Desligado')+'</b> · Já enviados: <b>'+(a.sent_count||0)+'</b><span class="au-state auState"></span></div>'+
          '<div class="au-f"><label>Prévia do e-mail</label><iframe class="au-prev" data-loaded="0"></iframe></div>'+
        '</div>'+
       '</div>';
  });
  h+='</div>';
  box.innerHTML=h;

  box.querySelectorAll('.au-card').forEach(function(row,i){
    var a=list[i];
    var type=row.getAttribute('data-t');
    var top=row.querySelector('.au-top');
    var on=row.querySelector('.auOn'), subj=row.querySelector('.auSubj');
    var cfgWrap=row.querySelector('.auCfg');
    var lbl=row.querySelector('.auLbl'), state=row.querySelector('.auState');
    var iframe=row.querySelector('.au-prev');

    function flash(){state.textContent=' · salvando…';}
    function done(){state.textContent=' · salvo ✓';setTimeout(function(){state.textContent='';},1500);}
    function fail(e){state.textContent=' · erro: '+e.message;}
    function saveBase(extra){lbl.textContent=on.checked?'Ligado':'Desligado';flash();var p={action:'save',type:type,enabled:on.checked,subject:subj.value,clientId:admin?CLI.id:undefined};for(var k in extra)p[k]=extra[k];return post(AUTOFN,p).then(done).catch(fail);}

    // ------ config por tipo ------
    if(type==='novidades'){
      var diasOpt=DIAS.map(function(d,idx){return '<option value="'+idx+'"'+(idx===a.weekday?' selected':'')+'>'+d+'</option>';}).join('');
      var horOpt='';for(var hh=6;hh<=22;hh++){horOpt+='<option value="'+hh+'"'+(hh===a.hour?' selected':'')+'>'+hh+'h</option>';}
      cfgWrap.innerHTML='<div class="au-grid">'+
        '<div class="au-f"><label>Dia do envio</label><select class="nvDia">'+diasOpt+'</select></div>'+
        '<div class="au-f"><label>Horário</label><select class="nvHora">'+horOpt+'</select></div>'+
        '<div class="au-f"><label>Nº de produtos</label><input class="nvQtd" type="number" min="1" max="8" value="'+(a.count||4)+'"></div>'+
      '</div><div class="au-meta">Envia toda <b class="nvLbl"></b> pra toda a base.</div>';
      var dia=cfgWrap.querySelector('.nvDia'),hor=cfgWrap.querySelector('.nvHora'),qtd=cfgWrap.querySelector('.nvQtd'),nvLbl=cfgWrap.querySelector('.nvLbl');
      function nvRefresh(){nvLbl.textContent=DIAS[parseInt(dia.value,10)]+' às '+hor.value+'h';}
      nvRefresh();
      function nvSave(){nvRefresh();saveBase({weekday:parseInt(dia.value,10),hour:parseInt(hor.value,10),count:parseInt(qtd.value,10)});}
      dia.onchange=nvSave;hor.onchange=nvSave;qtd.onchange=nvSave;
      on.onchange=nvSave;
      subj.onblur=function(){if(on.checked)nvSave();};
    } else {
      var steps=(a.steps&&a.steps.length?a.steps.slice():[1,24]).map(function(x){return parseInt(x,10);});
      var whenTxt=type==='reativacao'?'depois da última compra do cliente':'depois que a pessoa abandona o carrinho';
      cfgWrap.innerHTML='<div class="au-f"><label>Quando dispara — '+whenTxt+'</label><div class="au-steps"></div><button class="au-add" type="button">+ Adicionar disparo</button></div>';
      var stepsWrap=cfgWrap.querySelector('.au-steps'), addBtn=cfgWrap.querySelector('.au-add');
      function collect(){var arr=[];stepsWrap.querySelectorAll('.au-step').forEach(function(st){var hrs=toHours(st.querySelector('input').value,st.querySelector('select').value);if(hrs>0&&hrs<=8760)arr.push(hrs);});return arr.sort(function(x,y){return x-y;});}
      function stSave(){steps=collect();saveBase({steps:steps});}
      function renderSteps(){
        stepsWrap.innerHTML=steps.map(function(hrs,idx){var rw=toRow(hrs);return '<div class="au-step"><span class="n">'+(idx+1)+'</span><span class="txt">'+(ORD[idx]||(idx+1)+'º')+' disparo &mdash;</span><input type="number" min="1" value="'+rw.val+'"><select><option value="horas"'+(rw.unit==='horas'?' selected':'')+'>horas</option><option value="dias"'+(rw.unit==='dias'?' selected':'')+'>dias</option></select><span class="txt">depois</span>'+(steps.length>1?'<button class="au-rm" type="button">remover</button>':'')+'</div>';}).join('');
        stepsWrap.querySelectorAll('.au-step').forEach(function(st,idx){st.querySelector('input').onchange=stSave;st.querySelector('select').onchange=stSave;var rm=st.querySelector('.au-rm');if(rm)rm.onclick=function(){steps.splice(idx,1);renderSteps();stSave();};});
      }
      addBtn.onclick=function(){steps.push(24);renderSteps();stSave();};
      renderSteps();
      on.onchange=function(){saveBase({steps:steps});};
      subj.onblur=function(){if(on.checked)saveBase({steps:steps});};
    }

    async function loadPrev(){ if(iframe.getAttribute('data-loaded')==='1')return; try{var html=await post(AUTOFN,{action:'preview',type:type,clientId:admin?CLI.id:undefined},true);iframe.srcdoc=html;iframe.setAttribute('data-loaded','1');}catch(e){} }
    top.onclick=function(){row.classList.toggle('open');if(row.classList.contains('open'))loadPrev();};
  });
};
})();

/* === Wiz patch (Ki Pizza e-commerce): Conversoes + Funil usam dados da Meta quando Google/GA4 esta zerado === */
(function(){
  try{
    if(typeof isAdsSale==='function' && !isAdsSale.__wizKiPizza){
      var _ias=isAdsSale;
      var _iasNew=function(l){ if(typeof CLIENT!=='undefined'&&CLIENT&&CLIENT.slug==='kipizza'&&/^faturamento$/i.test((l||'').trim()))return false; return _ias(l); };
      _iasNew.__wizKiPizza=true;
      isAdsSale=_iasNew;
    }
    if(typeof buildTotal==='function' && !buildTotal.__wizMetaPatch){
      var _bt=buildTotal;
      var _btp=function(D){
        var R=_bt(D);
        try{
          var T=R&&R.TOTAL;
          if(T&&T.kpis&&T.kpis.length){
            var cv=T.kpis.find(function(k){return /^convers[õo]es?$/i.test((k.l||'').trim());});
            var cp=T.kpis.find(function(k){return /^compras$/i.test((k.l||'').trim());});
            if(cv&&cp){var cvn=repNum(cv.v),cpn=repNum(cp.v);if(cvn===0&&cpn>0)cv.v=String(Math.round(cpn));}
          }
        }catch(e){}
        if(typeof CLIENT!=='undefined'&&CLIENT&&CLIENT.slug==='kipizza'){try{var T2=R&&R.TOTAL;if(T2&&T2.kpis){T2.kpis=T2.kpis.filter(function(k){return !/^visualiza[çc][õo]es (org[âa]nicas|de an[úu]ncios)$/i.test((k.l||'').trim());});if(!T2.kpis.some(function(k){return /^visitas ao perfil$/i.test((k.l||'').trim());})){var ig=(D&&D.INSTAGRAM&&D.INSTAGRAM.igstats)||[];var vp=ig.find(function(x){return /^visitas ao perfil$/i.test((x.l||'').trim());});if(vp)T2.kpis.push({l:'Visitas ao perfil',v:vp.v});}var pick=function(re){var i=T2.kpis.findIndex(function(k){return re.test((k.l||'').trim());});return i>=0?T2.kpis.splice(i,1)[0]:null;};var a=pick(/^visualiza[çc][õo]es$/i),b=pick(/^faturamento$/i),cc=pick(/^visitas ao perfil$/i);var head=[];if(a)head.push(a);if(b)head.push(b);if(cc)head.push(cc);T2.kpis=head.concat(T2.kpis);}}catch(e){}}
        return R;
      };
      _btp.__wizMetaPatch=true;
      buildTotal=_btp;
    }
    if(typeof injectFunnel==='function' && !injectFunnel.__wizMetaPatch){
      var _inj=async function(){
        try{
          var el=document.getElementById('repFunnel');if(!el)return;
          var sess=(await sb.auth.getSession()).data.session;if(!sess)return;
          var H={'Content-Type':'application/json',apikey:SUPA_KEY,Authorization:'Bearer '+sess.access_token};
          var days=REP.range||30;
          var pair=await Promise.all([
            fetch(SUPA_URL+'/functions/v1/ga4-stats',{method:'POST',headers:H,body:JSON.stringify({clientId:CLIENT.id,days:days})}).then(function(r){return r.json();}).catch(function(){return null;}),
            fetch(SUPA_URL+'/functions/v1/loja-stats',{method:'POST',headers:H,body:JSON.stringify({clientId:CLIENT.id,days:days})}).then(function(r){return r.json();}).catch(function(){return null;})
          ]);
          var g=pair[0],l=pair[1];
          if(document.getElementById('repFunnel')!==el)return;
          var St=REP.D['TOTAL']||REP.D[REP.source]||{};
          var kv=function(re){var k=(St.kpis||[]).find(function(k){return re.test((k.l||'').trim());});return k?repNum(k.v):0;};
          var gaOk=!!(g&&g.ok&&g.connected);
          var gaSess=gaOk?(g.sessions||0):0,gaCart=gaOk?(g.addToCarts||0):0,gaPur=gaOk?(g.purchases||0):0;
          var lojaOk=!!(l&&l.ok&&l.connected);
          if(gaOk&&(gaCart>0||gaPur>0)){
            var alc=kv(/^alcance/i);
            var comp=lojaOk?l.orders:gaPur;
            var st=[];
            if(alc)st.push({l:'Alcance',v:alc});
            st.push({l:'Visitas',v:gaSess});
            st.push({l:'Adição ao carrinho',v:gaCart});
            st.push({l:'Compras',v:comp||0});
            renderFunnel(st);return;
          }
          var adic=kv(/^adi[cç][õo]es ao carrinho/i),compMeta=kv(/^compras$/i);
          var compras=lojaOk?l.orders:compMeta;
          if(!(adic>0||compras>0))return;
          var alcance=kv(/^alcance/i),cliques=kv(/^cliques( no link)?$/i);
          var steps=[];
          if(alcance)steps.push({l:'Alcance',v:alcance});
          if(cliques)steps.push({l:'Cliques',v:cliques});
          if(adic)steps.push({l:'Adição ao carrinho',v:adic});
          steps.push({l:'Compras',v:compras||0});
          renderFunnel(steps);
        }catch(e){}
      };
      _inj.__wizMetaPatch=true;
      injectFunnel=_inj;
    }
  }catch(e){}
})();

/* === Wiz patch: oculta a aba "Google Ads" para clientes sem conta Google configurada === */
(function(){
  try{
    if(typeof buildCliNav==='function' && !buildCliNav.__wizGoogleGate){
      var _bcn=buildCliNav;
      var _bcnGate=function(){
        var r=_bcn.apply(this,arguments);
        try{
          var gid=String((typeof CLIENT!=='undefined'&&CLIENT&&CLIENT.google_customer)||'').replace(/\D/g,'');
          if(!gid){
            var nav=document.getElementById('cliNav');
            if(nav){var g=nav.querySelector('.cnav[data-k="google"]');if(g)g.remove();}
          }
        }catch(e){}
        return r;
      };
      _bcnGate.__wizGoogleGate=true;
      buildCliNav=_bcnGate;
    }
  }catch(e){}
})();
