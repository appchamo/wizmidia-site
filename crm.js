/* CRM do Portal Wiz - fase 1 completa
   Usa os tokens do dashboard do cliente (--c-*), com fallback claro. */
(function(){
'use strict';

var CSS = `
.crm{
  --k-bg:      var(--c-bg,    #eef2f7);
  --k-panel:   var(--c-panel, #ffffff);
  --k-ink:     var(--c-ink,   #1c2330);
  --k-mut:     var(--c-mut,   #7c8698);
  --k-line:    var(--c-line,  #e8edf4);
  --k-acc:     var(--c-acc,   #3b5bdb);
  --k-soft:    rgba(124,134,152,.09);
  --k-alerta:  #d1495b;
  --k-alerta-s:rgba(209,73,91,.10);
  color: var(--k-ink);
}
.crm *{box-sizing:border-box}
/* nada de selecionar texto ao arrastar; dentro da ficha volta ao normal */
.crm-board,.crm-lista,.crm-tabs,.crm-et,.crm-col,.crm-card,.crm-linha,.crm-badge{
  -webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.crm-modal,.crm-modal *{-webkit-user-select:text;user-select:text}
.crm-inp{-webkit-user-select:text;user-select:text}
.crm-topo{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px}
.crm-tabs{display:flex;gap:4px;background:var(--k-soft);padding:4px;border-radius:12px}
.crm-tab{padding:8px 16px;border-radius:9px;border:0;background:transparent;font-size:13.5px;font-weight:600;
  color:var(--k-mut);cursor:pointer;font-family:inherit;transition:.15s;white-space:nowrap}
.crm-tab:hover{color:var(--k-ink)}
.crm-tab.on{background:var(--k-panel);color:var(--k-ink);box-shadow:0 1px 3px rgba(28,35,48,.10)}
.crm-tab:focus-visible{outline:2px solid var(--k-acc);outline-offset:1px}

.crm-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
.crm-inp{padding:10px 13px;border-radius:11px;border:1px solid var(--k-line);background:var(--k-panel);
  color:var(--k-ink);font-size:14px;font-family:inherit;min-width:0}
.crm-inp::placeholder{color:var(--k-mut)}
.crm-inp:focus{outline:2px solid var(--k-acc);outline-offset:-1px;border-color:transparent}
.crm-inp.cresce{flex:1;min-width:200px}
.crm-inp[type=color]{padding:3px;width:44px;height:40px;cursor:pointer;flex:none}
.crm-btn{padding:10px 16px;border-radius:11px;border:1px solid var(--k-line);background:var(--k-panel);
  color:var(--k-ink);font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;text-decoration:none;
  display:inline-flex;align-items:center;justify-content:center;gap:7px;white-space:nowrap;transition:.15s}
.crm-btn:hover{border-color:var(--k-mut)}
.crm-btn.pri{background:var(--k-acc);color:#fff;border-color:var(--k-acc)}
.crm-btn.pri:hover{filter:brightness(1.07)}
.crm-btn.perigo{color:var(--k-alerta);border-color:var(--k-alerta-s)}
.crm-btn.perigo:hover{background:var(--k-alerta-s);border-color:var(--k-alerta)}
.crm-btn:disabled{opacity:.55;cursor:default}
.crm-btn:focus-visible{outline:2px solid var(--k-acc);outline-offset:2px}
.crm-btn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

.crm-board{display:flex;gap:14px;overflow-x:auto;padding:2px 2px 14px;align-items:stretch;scroll-snap-type:x proximity}
.crm-col{flex:0 0 272px;scroll-snap-align:start;background:var(--k-soft);border-radius:16px;padding:0 12px 12px;
  display:flex;flex-direction:column;min-height:280px;max-height:min(64vh,620px);
  border-top:3px solid var(--cc,var(--k-line));transition:background .18s}
.crm-col.alvo{box-shadow:inset 0 0 0 2px var(--cc,var(--k-acc));background:var(--cs,var(--k-soft))}
.crm-col-h{display:flex;align-items:center;gap:8px;padding:13px 4px 11px;flex:none}
.crm-col-h b{font-size:13.5px;font-weight:700;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;color:var(--k-ink)}
.crm-col-n{font-size:12px;font-weight:800;font-variant-numeric:tabular-nums;
  color:var(--cc,var(--k-mut));background:var(--cs,var(--k-panel));padding:3px 9px;border-radius:99px}
.crm-pt{width:9px;height:9px;border-radius:50%;flex:none;box-shadow:0 0 0 3px var(--cs,transparent)}
.crm-col-sum{font-size:11px;font-weight:700;color:#0b7a5a;background:rgba(18,184,134,.12);padding:2px 7px;border-radius:99px;font-variant-numeric:tabular-nums;flex:none}
.crm-fila{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:7px;padding:1px}

.crm-card{background:var(--k-panel);border:1px solid var(--k-line);border-left:3px solid var(--cc,var(--k-line));
  border-radius:11px;padding:8px 10px;
  cursor:grab;touch-action:none;display:flex;flex-direction:column;gap:5px;
  box-shadow:0 1px 2px rgba(28,35,48,.05);transition:box-shadow .16s,border-color .16s,transform .16s;flex:none}
.crm-card:hover{box-shadow:0 5px 16px rgba(28,35,48,.11);transform:translateY(-1px)}
.crm-card:active{cursor:grabbing}
.crm-card .cab{display:flex;align-items:center;gap:7px}
.crm-card .cab .txt{min-width:0;flex:1}
.crm-av{width:27px;height:27px;border-radius:8px;flex:none;display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:800;color:#fff;background:var(--av,#8b97ad);letter-spacing:.4px;
  text-transform:uppercase;box-shadow:0 2px 6px rgba(28,35,48,.14)}
.crm-card:focus-visible{outline:2px solid var(--k-acc);outline-offset:1px}
.crm-card.arrastando{opacity:.3}
.crm-card .nm{font-weight:700;font-size:13px;line-height:1.2;color:var(--k-ink);word-break:break-word}
.crm-card .fone{font-size:11.5px;color:var(--k-mut);font-variant-numeric:tabular-nums}
.crm-card .chip{display:inline-block;max-width:100%;font-size:10.5px;color:var(--k-mut);background:var(--k-soft);
  padding:2px 7px;border-radius:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crm-card .rodape{display:flex;align-items:center;gap:5px;margin-top:0}
.crm-card .idade{font-size:11.5px;color:var(--k-mut);margin-left:auto}
.crm-parado{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--k-alerta);
  background:var(--k-alerta-s);padding:3px 8px;border-radius:7px;font-weight:600;align-self:flex-start}
.crm-mini{width:26px;height:26px;border-radius:8px;border:1px solid var(--k-line);background:var(--k-panel);
  display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--k-mut);flex:none;
  text-decoration:none;transition:.15s}
.crm-mini:hover{color:var(--k-acc);border-color:var(--k-acc)}
.crm-mini svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.crm-fly{position:fixed;z-index:9999;pointer-events:none;width:252px;opacity:.96;
  box-shadow:0 12px 32px rgba(28,35,48,.22);transform:rotate(1.5deg)}

.crm-vazio{padding:22px 14px;text-align:center;color:var(--k-mut);font-size:13px;line-height:1.55}
.crm-vazio b{display:block;color:var(--k-ink);font-size:14.5px;margin-bottom:4px;font-weight:700}
.crm-vazio-col{padding:16px 8px;text-align:center;color:var(--k-mut);font-size:12.5px}

.crm-hoje{display:flex;flex-direction:column;gap:9px}
.crm-hj{display:flex;align-items:center;gap:13px;padding:13px 15px;border:1px solid var(--k-line);
  border-left:3px solid var(--cc,var(--k-mut));border-radius:13px;background:var(--k-panel);transition:.15s}
.crm-hj:hover{box-shadow:0 4px 12px rgba(28,35,48,.08)}
.crm-hj .txt{flex:1;min-width:0}
.crm-hj .nm{font-weight:700;font-size:14.5px;color:var(--k-ink);cursor:pointer}
.crm-hj .nm:hover{color:var(--k-acc)}
.crm-hj .sub{font-size:12.5px;color:var(--k-mut);margin-top:3px}
.crm-hj .acts{display:flex;gap:6px;flex:none}
.crm-quando{font-size:12px;font-weight:700;padding:4px 10px;border-radius:99px;white-space:nowrap;flex:none}
.q-atraso{background:var(--k-alerta-s);color:var(--k-alerta)}
.q-hoje{background:rgba(245,166,35,.16);color:#9a6208}
.q-frente{background:var(--k-soft);color:var(--k-mut)}
.crm-grupo{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  color:var(--k-mut);margin:14px 0 2px}
.crm-grupo:first-child{margin-top:0}
.crm-resp{display:flex;gap:20px;flex-wrap:wrap;padding:13px 15px;border:1px solid var(--k-line);
  border-radius:13px;background:var(--k-panel);margin-bottom:16px}
.crm-resp div{min-width:96px}
.crm-resp .n{font-size:18px;font-weight:800;color:var(--k-ink);line-height:1.15}
.crm-resp .l{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--k-mut);margin-top:3px}
.crm-sw{display:flex;align-items:center;gap:13px;padding:14px;border:1px solid var(--k-line);
  border-radius:13px;background:var(--k-panel);margin-top:12px}
.crm-sw .txt{flex:1;min-width:0}
.crm-sw .t{font-weight:700;font-size:14px;color:var(--k-ink)}
.crm-sw .s{font-size:12.8px;color:var(--k-mut);margin-top:3px;line-height:1.5}
.crm-tab .cnt{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;
  padding:0 5px;margin-left:6px;border-radius:99px;background:var(--k-alerta);color:#fff;
  font-size:10.5px;font-weight:800;vertical-align:1px}
.crm-card .tar{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;padding:3px 8px;
  border-radius:7px;font-weight:600;align-self:flex-start}
.crm-lista{display:flex;flex-direction:column;gap:8px}
.crm-linha{display:flex;align-items:center;gap:13px;padding:11px 15px;border:1px solid var(--k-line);
  border-radius:13px;background:var(--k-panel);cursor:pointer;transition:.15s}
.crm-linha:hover{border-color:var(--k-mut);box-shadow:0 4px 12px rgba(28,35,48,.08);transform:translateY(-1px)}
.crm-linha .crm-av{width:38px;height:38px;border-radius:11px;font-size:13.5px}
.crm-linha:focus-visible{outline:2px solid var(--k-acc);outline-offset:1px}
.crm-linha .nm{font-weight:700;font-size:14.5px;color:var(--k-ink)}
.crm-linha .sub{font-size:12.5px;color:var(--k-mut);margin-top:2px}
.crm-badge{font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:99px;white-space:nowrap;flex:none}

.crm-bg{position:fixed;inset:0;background:rgba(20,26,38,.55);z-index:9000;display:flex;
  align-items:flex-end;justify-content:center;backdrop-filter:blur(2px)}
.crm-modal{background:var(--k-panel);color:var(--k-ink);width:100%;max-width:520px;max-height:92vh;
  overflow-y:auto;border-radius:20px 20px 0 0;padding:24px;box-shadow:0 -8px 40px rgba(20,26,38,.3)}
.crm-modal h3{margin:0 0 4px;font-size:20px;font-weight:800;color:var(--k-ink);letter-spacing:-.2px}
.crm-modal .sub{color:var(--k-mut);font-size:13.5px;margin-bottom:18px;line-height:1.5}
.crm-campo{margin-bottom:16px}
.crm-campo label{display:block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  color:var(--k-mut);margin-bottom:6px}
.crm-campo .crm-inp{width:100%}
.crm-dupla{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.crm-ret{border:1px solid var(--k-line);border-radius:13px;padding:14px;margin-bottom:16px;background:var(--k-soft)}
.crm-ret.marcado{background:rgba(245,166,35,.07);border-color:rgba(245,166,35,.35)}
.crm-ret.atrasado{background:var(--k-alerta-s);border-color:rgba(209,73,91,.35)}
.crm-ret-t{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  color:var(--k-mut);margin-bottom:9px}
.crm-ret-q{font-size:15px;font-weight:700;color:var(--k-ink);margin-bottom:3px}
.crm-ret-s{font-size:12.5px;color:var(--k-mut);margin-bottom:11px}
.crm-fecha .crm-ret-q{font-size:17px}
.crm-motivos{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:6px}
.crm-motivo{padding:8px 13px;border-radius:10px;border:1px solid var(--k-line);background:var(--k-panel);
  color:var(--k-ink);font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:.14s}
.crm-motivo:hover{border-color:var(--k-mut)}
.crm-motivo.on{background:var(--k-acc);color:#fff;border-color:var(--k-acc)}
.crm-atalhos{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.crm-atalho{padding:6px 11px;border-radius:9px;border:1px solid var(--k-line);background:var(--k-panel);
  color:var(--k-ink);font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit}
.crm-atalho:hover{border-color:var(--k-acc);color:var(--k-acc)}
.crm-tl{border-top:1px solid var(--k-line);padding-top:16px;display:flex;flex-direction:column;gap:13px}
.crm-tl-t{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--k-mut)}
.crm-ev{display:grid;grid-template-columns:auto 1fr;gap:11px;font-size:13.5px;line-height:1.5;color:var(--k-ink)}
.crm-ev .pt{width:7px;height:7px;border-radius:50%;background:var(--k-line);margin-top:7px;box-shadow:0 0 0 3px var(--k-soft)}
.crm-ev .q{color:var(--k-mut);font-size:11.5px;margin-top:3px}

.crm-kpi .v{color:var(--kc,inherit)!important}
.crm-kpi{border-left:3px solid var(--kc,var(--k-acc,#3b5bdb))}
.crm-fic{display:flex;align-items:center;gap:13px;margin-bottom:6px}
.crm-fic .crm-av{width:46px;height:46px;border-radius:13px;font-size:16px}
.crm-secao{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  color:var(--k-mut);margin:24px 0 11px}
.crm-secao:first-child{margin-top:0}
.crm-fnl{display:flex;flex-direction:column;gap:7px}
.crm-fnl-l{display:grid;grid-template-columns:132px 1fr auto;gap:12px;align-items:center}
.crm-fnl-n{font-size:13.5px;font-weight:700;color:var(--k-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crm-fnl-b{height:30px;border-radius:9px;background:var(--k-soft);overflow:hidden;position:relative}
.crm-fnl-f{height:100%;border-radius:9px;transition:width .45s cubic-bezier(.2,.7,.3,1)}
.crm-fnl-v{font-size:13px;font-weight:700;color:var(--k-ink);font-variant-numeric:tabular-nums;white-space:nowrap}
.crm-fnl-p{font-size:11.5px;color:var(--k-mut);font-weight:600}
.crm-tab2{width:100%;border-collapse:collapse;font-size:13.5px}
.crm-tab2 th{text-align:left;padding:9px 11px;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;
  color:var(--k-mut);border-bottom:1px solid var(--k-line);font-weight:700}
.crm-tab2 td{padding:11px;border-bottom:1px solid var(--k-line);color:var(--k-ink)}
.crm-tab2 tr:last-child td{border-bottom:0}
.crm-tab2 .num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.crm-caixa{border:1px solid var(--k-line);border-radius:13px;background:var(--k-panel);overflow:hidden}
.crm-nota{font-size:12.8px;color:var(--k-mut);line-height:1.55;margin-top:10px;max-width:70ch}
.crm-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9500;
  background:var(--k-ink,#1c2330);color:#fff;padding:13px 16px;border-radius:13px;display:flex;align-items:center;
  gap:14px;font-size:13.5px;box-shadow:0 10px 30px rgba(20,26,38,.3);max-width:calc(100vw - 32px)}
.crm-toast button{background:none;border:0;color:#8fb4ff;font-weight:700;font-size:13.5px;cursor:pointer;
  font-family:inherit;padding:0;white-space:nowrap}

.crm-et{display:flex;align-items:center;gap:9px;padding:11px 13px;border:1px solid var(--k-line);
  border-radius:13px;background:var(--k-panel);margin-bottom:8px}
.crm-setas{display:flex;flex-direction:column;gap:1px}
.crm-seta{width:24px;height:19px;border:1px solid var(--k-line);background:var(--k-panel);border-radius:6px;
  cursor:pointer;color:var(--k-mut);display:flex;align-items:center;justify-content:center;padding:0}
.crm-seta:hover{color:var(--k-ink)}
.crm-seta:disabled{opacity:.3;cursor:default}
.crm-seta svg{width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

.crm-imp{border:1px dashed var(--k-line);border-radius:14px;padding:20px;text-align:center;color:var(--k-mut);
  font-size:13.5px;line-height:1.6;background:var(--k-soft)}
.crm-prev{max-height:220px;overflow:auto;border:1px solid var(--k-line);border-radius:12px;margin-top:12px}
.crm-prev table{width:100%;border-collapse:collapse;font-size:12.5px}
.crm-prev th{position:sticky;top:0;background:var(--k-soft);text-align:left;padding:8px 10px;font-size:10.5px;
  text-transform:uppercase;letter-spacing:.05em;color:var(--k-mut)}
.crm-prev td{padding:7px 10px;border-top:1px solid var(--k-line);color:var(--k-ink)}

@media(min-width:640px){.crm-bg{align-items:center}.crm-modal{border-radius:20px}}
@media(max-width:560px){
  .crm-col{flex:0 0 84vw;max-height:none}
  .crm-modal{padding:20px}
  .crm-dupla{grid-template-columns:1fr}
}
`;
function estilo(){ if(document.getElementById('crmCss'))return;
  var s=document.createElement('style'); s.id='crmCss'; s.textContent=CSS; document.head.appendChild(s); }

var E = (window.esc||function(s){return (s||'').replace(/[&<>"]/g,function(m){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];});});
function so(t){ return (t||'').replace(/\D/g,''); }
/* mesma normalizacao do banco (crm_fone): tira o +55 do DDI */
function norm(t){ var n=so(t); if((n.length===12||n.length===13)&&n.indexOf('55')===0)n=n.slice(2); return n; }
function sac(s){ return (s||'').toString().normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); }
function fone(t){
  var n=so(t); if(!n) return '';
  if((n.length===13||n.length===12) && n.indexOf('55')===0) n=n.slice(2);
  if(n.length===11) return '('+n.slice(0,2)+') '+n.slice(2,7)+'-'+n.slice(7);
  if(n.length===10) return '('+n.slice(0,2)+') '+n.slice(2,6)+'-'+n.slice(6);
  return t;
}
function dinheiro(v){
  if(v==null||v==='') return '';
  var n=Number(v); if(!isFinite(n)) return '';
  return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function lerDinheiro(t){
  t=(t||'').toString().replace(/[^0-9,.-]/g,'');
  if(t.indexOf(',')>-1 && t.indexOf('.')>-1) t=t.replace(/\./g,'').replace(',','.');
  else if(t.indexOf(',')>-1) t=t.replace(',','.');
  var n=parseFloat(t);
  return isFinite(n)?n:null;
}
function zap(t){ var n=so(t); if(!n)return ''; if(n.length<=11)n='55'+n; return 'https://wa.me/'+n; }
function dias(iso){ return Math.floor((Date.now()-new Date(iso).getTime())/86400000); }
function desde(iso){
  if(!iso)return '';
  var d=dias(iso);
  if(d<=0)return 'hoje'; if(d===1)return 'ontem'; if(d<30)return d+'d';
  var m=Math.floor(d/30); return m+(m===1?' mês':' meses');
}
function quando(iso){
  try{ return new Date(iso).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }
  catch(e){ return ''; }
}
/* cor estavel por pessoa + inicial, so pra dar rosto a lista */
var PALETA=['#3b5bdb','#7c5cff','#0ca678','#e8590c','#d6336c','#1098ad','#f08c00','#4c6ef5','#9c36b5','#2b8a3e'];
function avCor(nome){
  var t=sac(nome)||'x', h=0;
  for(var i=0;i<t.length;i++){ h=(h*31+t.charCodeAt(i))>>>0; }
  return PALETA[h%PALETA.length];
}
function inicial(nome){
  var ps=(nome||'').trim().split(/[\s._-]+/).filter(function(x){ return /[a-zA-Z0-9À-ÿ]/.test(x); });
  if(!ps.length) return '?';
  var a=ps[0][0]||'';
  var b=ps.length>1?(ps[ps.length-1][0]||''):'';
  return (a+b).slice(0,2);
}
/* hex + transparencia, pro fundo suave da cor da etapa */
function suave(hex){ return (hex||'#8b97ad')+'1f'; }

var ICO={
  fone:'<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  zap:'<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/></svg>',
  rel:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
  lapis:'<svg viewBox="0 0 24 24"><path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
  mais:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  cima:'<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>',
  baixo:'<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>'
};

/* aviso com opcao de desfazer */
var toastAtual=null;
function aviso(msg, acao, rotulo){
  if(toastAtual){ toastAtual.remove(); toastAtual=null; }
  var t=document.createElement('div'); t.className='crm-toast';
  t.innerHTML='<span>'+E(msg)+'</span>'+(acao?'<button type="button">'+E(rotulo||'Desfazer')+'</button>':'');
  document.body.appendChild(t); toastAtual=t;
  var fim=setTimeout(function(){ if(t.parentNode)t.remove(); if(toastAtual===t)toastAtual=null; }, acao?7000:3500);
  var b=t.querySelector('button');
  if(b) b.onclick=function(){ clearTimeout(fim); t.remove(); toastAtual=null; acao(); };
}

var S = { aba:'funil', etapas:[], contatos:[], busca:'', filtro:'', cid:null, cliente:null,
          admin:false, leitura:false, limite:400, temMais:false, verArquivados:false,
          tarefas:[], vendedores:[], dono:'', lembrete:null, resposta:null,
          motivos:[], resultados:null, ads:null };
function podeEditar(){ return !S.leitura; }
function tarefaDe(id){ return S.tarefas.find(function(t){ return t.contact_id===id; }); }
function atrasada(t){ return t && new Date(t.vence_em) < new Date(); }
function paraHoje(t){
  if(!t) return false;
  var d=new Date(t.vence_em), h=new Date();
  return d.toDateString()===h.toDateString();
}
function quandoCurto(iso){
  var d=new Date(iso), h=new Date();
  var dia=new Date(d); dia.setHours(0,0,0,0);
  var hoje=new Date(h); hoje.setHours(0,0,0,0);
  var dif=Math.round((dia-hoje)/86400000);
  var hora=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  if(dif===0) return 'hoje '+hora;
  if(dif===1) return 'amanhã '+hora;
  if(dif===-1) return 'ontem '+hora;
  if(dif<0) return Math.abs(dif)+' dias atrás';
  if(dif<7) return 'em '+dif+' dias';
  return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+hora;
}
function paraInput(d){
  var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
  return z.toISOString().slice(0,16);
}
function contaAtrasadas(){ return S.tarefas.filter(atrasada).length; }
function contaHoje(){ return S.tarefas.filter(function(t){ return atrasada(t)||paraHoje(t); }).length; }

async function salvarTarefa(contato, quando, donoId, titulo){
  var dono = S.vendedores.find(function(v){ return v.id===donoId; });
  var reg = { client_id:S.cid, contact_id:contato.id, titulo:(titulo||'Retornar').trim()||'Retornar',
              vence_em:new Date(quando).toISOString(), dono_id:donoId||null,
              dono_nome:dono?dono.name:null, criada_por:quemSou(),
              lembrete_em:new Date(quando).toISOString(), lembrete_enviado:false, feita:false };
  var velha = tarefaDe(contato.id);
  var r = velha ? await sb.from('crm_tasks').update(reg).eq('id',velha.id).select().maybeSingle()
                : await sb.from('crm_tasks').insert(reg).select().maybeSingle();
  if(r.error){ aviso('Não consegui marcar o retorno: '+r.error.message); return null; }
  S.tarefas = S.tarefas.filter(function(t){ return t.contact_id!==contato.id; });
  if(r.data) S.tarefas.push(r.data);
  await registrar(contato.id,'nota','Retorno marcado para '+quandoCurto(reg.vence_em)
    +(dono?' com '+dono.name:'')+'.');
  return r.data;
}
async function concluirTarefa(t, silencioso){
  var r = await sb.from('crm_tasks').update({feita:true}).eq('id',t.id);
  if(r.error){ aviso('Não consegui concluir: '+r.error.message); return false; }
  S.tarefas = S.tarefas.filter(function(x){ return x.id!==t.id; });
  await registrar(t.contact_id,'nota','Retorno concluído.');
  if(!silencioso) aviso('Retorno concluído', async function(){
    await sb.from('crm_tasks').update({feita:false}).eq('id',t.id);
    await carregar(); pintar();
  });
  return true;
}
async function adiarTarefa(t, dias){
  var base = new Date(t.vence_em);
  var agora = new Date();
  if(base < agora) base = agora;
  base.setDate(base.getDate()+dias);
  var r = await sb.from('crm_tasks').update({vence_em:base.toISOString(), lembrete_em:base.toISOString(), lembrete_enviado:false}).eq('id',t.id).select().maybeSingle();
  if(r.error){ aviso('Não consegui adiar: '+r.error.message); return; }
  S.tarefas = S.tarefas.map(function(x){ return x.id===t.id ? r.data : x; });
  aviso('Adiado para '+quandoCurto(r.data.vence_em));
}
function quemSou(){ return S.admin?'Wiz':'cliente'; }
function etapaDe(c){ return S.etapas.find(function(e){return e.id===c.stage_id;}); }
function aberta(c){ var e=etapaDe(c); return e&&e.tipo==='aberto'; }

async function carregar(){
  S.resultados = null;
  S.cid = (S.cliente&&S.cliente.id)||null;
  if(!S.cid) return {message:'cliente não identificado'};
  var a = await sb.from('crm_stages').select('*').eq('client_id',S.cid).order('ordem');
  var b = await sb.from('crm_contacts').select('*').eq('client_id',S.cid).eq('arquivado',!!S.verArquivados)
            .order('ultimo_evento_em',{ascending:false}).limit(S.limite+1);
  S.etapas = a.data||[];
  var lista = b.data||[];
  S.temMais = lista.length > S.limite;
  S.contatos = S.temMais ? lista.slice(0,S.limite) : lista;

  var t = await sb.from('crm_tasks')
            .select('*, contato:crm_contacts(id,nome,telefone,stage_id,arquivado)')
            .eq('client_id',S.cid).eq('feita',false).order('vence_em');
  // tarefa de contato arquivado nao aparece na lista do dia
  S.tarefas = (t.data||[]).filter(function(x){ return x.contato && !x.contato.arquivado; });
  var v = await sb.from('portal_client_members').select('*').eq('client_id',S.cid).eq('active',true).order('name');
  S.vendedores = v.data||[];
  try{ var lg = await sb.rpc('crm_lembrete_get',{p_client:S.cid}); S.lembrete = lg.data||null; }catch(e){ S.lembrete=null; }
  try{ var tr = await sb.rpc('crm_tempo_resposta',{p_client:S.cid, p_dias:90});
       S.resposta = (tr.data&&tr.data[0])||null; }catch(e){ S.resposta=null; }
  var mt = await sb.from('crm_reasons').select('*').eq('client_id',S.cid).eq('ativo',true).order('ordem');
  S.motivos = mt.data||[];
  return (a.error||b.error);
}

async function registrar(contatoId, tipo, texto, extra){
  var reg = {client_id:S.cid, contact_id:contatoId, tipo:tipo, texto:texto, autor:quemSou()};
  if(extra) for(var k in extra) reg[k]=extra[k];
  return sb.from('crm_events').insert(reg);
}

async function mover(contato, etapaId, silencioso){
  var de = etapaDe(contato);
  var para = S.etapas.find(function(e){return e.id===etapaId;});
  if(!para || (de&&de.id===para.id)) return;
  var antes = contato.stage_id;
  contato.stage_id = etapaId;
  var r = await sb.from('crm_contacts').update({stage_id:etapaId}).eq('id',contato.id);
  if(r.error){ contato.stage_id = antes; pintar(); aviso('Não consegui mover: '+r.error.message); return; }
  await registrar(contato.id,'etapa','Moveu de '+((de&&de.nome)||'—')+' para '+para.nome+'.',
                  {de_stage:(de&&de.nome)||null, para_stage:para.nome});
  contato.ultimo_evento_em = new Date().toISOString();
  if(para.tipo==='ganho' || para.tipo==='perdido'){
    // fecha a tarefa aberta: nao faz sentido lembrar de retornar quem ja fechou
    var ta = tarefaDe(contato.id);
    if(ta){ await sb.from('crm_tasks').update({feita:true}).eq('id',ta.id);
            S.tarefas = S.tarefas.filter(function(x){ return x.id!==ta.id; }); }
    if(podeEditar() && !silencioso){ fecharNegocio(contato, para, antes); return; }
  }
  if(!silencioso && antes){
    aviso((contato.nome||'Contato')+' foi para '+para.nome, function(){
      mover(contato, antes, true).then(pintar);
    });
  }
}

/* ---------- fechamento: valor no ganho, motivo na perda ---------- */
function fecharNegocio(c, etapa, etapaAntes){
  var ganhou = etapa.tipo==='ganho';
  var escolhido = null;
  var bg = abrirModal('<div class="crm-fecha">'
    +'<h3>'+(ganhou?'Fechou com ':'Perdeu ')+E(c.nome||'esse contato')+'</h3>'
    +'<div class="sub">'+(ganhou
        ? 'Anote quanto essa venda valeu. É o que permite dizer, no fim do mês, quanto o anúncio trouxe de faturamento.'
        : 'Diga por que não foi. Sem isso não existe relatório de perda — e é aí que aparece o padrão.')+'</div>'
    +(ganhou
      ? '<div class="crm-campo"><label>Valor da venda</label>'
        +'<input class="crm-inp" id="fzValor" inputmode="decimal" placeholder="R$ 0,00" style="width:100%" autofocus></div>'
      : '<div class="crm-campo"><label>Motivo</label><div class="crm-motivos" id="fzMotivos">'
        + (S.motivos.length
            ? S.motivos.map(function(m){ return '<button class="crm-motivo" data-m="'+m.id+'">'+E(m.nome)+'</button>'; }).join('')
            : '<span style="font-size:13px;color:var(--k-mut)">Nenhum motivo cadastrado ainda — escreva abaixo, ou monte a lista em Ajustes.</span>')
        +'</div>'
        +'<input class="crm-inp" id="fzOutro" placeholder="ou escreva o motivo" style="width:100%;margin-top:8px"></div>')
    +'<div class="crm-campo"><label>Observação</label>'
      +'<textarea class="crm-inp" id="fzNota" rows="2" placeholder="opcional" style="width:100%"></textarea></div>'
    +'<div style="display:flex;gap:8px">'
      +'<button class="crm-btn" id="fzPular" style="flex:1">Pular</button>'
      +'<button class="crm-btn pri" id="fzOk" style="flex:1">Salvar</button></div>'
    +'<button class="crm-btn" id="fzVolta" style="width:100%;margin-top:8px">Não era pra ter movido — desfazer</button>'
    +'</div>');

  bg.querySelectorAll('.crm-motivo').forEach(function(b){
    b.onclick=function(){
      bg.querySelectorAll('.crm-motivo').forEach(function(x){ x.classList.toggle('on', x===b); });
      escolhido = b.dataset.m;
      var o=bg.querySelector('#fzOutro'); if(o) o.value='';
    };
  });
  var outro=bg.querySelector('#fzOutro');
  if(outro) outro.oninput=function(){
    if(outro.value.trim()){ bg.querySelectorAll('.crm-motivo').forEach(function(x){ x.classList.remove('on'); }); escolhido=null; }
  };

  bg.querySelector('#fzPular').onclick=function(){ bg.fechar(); pintar(); };
  bg.querySelector('#fzVolta').onclick=async function(){
    bg.fechar();
    if(etapaAntes) await mover(c, etapaAntes, true);
    pintar();
  };
  bg.querySelector('#fzOk').onclick=async function(){
    var b=bg.querySelector('#fzOk'); b.disabled=true;
    var novo={};
    var resumo='';
    if(ganhou){
      var v=lerDinheiro(bg.querySelector('#fzValor').value);
      novo.valor=v;
      resumo = v!=null ? ('Venda fechada em '+dinheiro(v)+'.') : 'Venda fechada.';
    } else {
      var txt=(bg.querySelector('#fzOutro').value||'').trim();
      novo.motivo_id = escolhido||null;
      novo.motivo_txt = txt||null;
      var nome = escolhido ? (S.motivos.find(function(m){return m.id===escolhido;})||{}).nome : txt;
      resumo = nome ? ('Perdido: '+nome+'.') : 'Marcado como perdido.';
    }
    var r=await sb.from('crm_contacts').update(novo).eq('id',c.id);
    b.disabled=false;
    if(r.error){ aviso('Não consegui salvar: '+r.error.message); return; }
    Object.keys(novo).forEach(function(k){ c[k]=novo[k]; });
    var obs=(bg.querySelector('#fzNota').value||'').trim();
    await registrar(c.id,'nota', resumo+(obs?(' '+obs):''));
    bg.fechar(); await carregar(); pintar(); montarCabecalho();
    aviso(resumo);
  };
}

/* ---------- funil ---------- */
function cartao(c){
  var parado = aberta(c) ? dias(c.ultimo_evento_em) : 0;
  var t = so(c.telefone);
  var et = etapaDe(c);
  var cc = (et&&et.cor)||'#8b97ad';
  return '<div class="crm-card" data-id="'+c.id+'" tabindex="0" role="button" style="--cc:'+E(cc)+'">'
    +'<div class="cab"><span class="crm-av" style="--av:'+E(avCor(c.nome))+'">'+E(inicial(c.nome))+'</span>'
    +'<div class="txt"><div class="nm">'+E(c.nome||'Sem nome')+'</div>'
    +(c.telefone?'<div class="fone">'+E(fone(c.telefone))+'</div>':'')
    +'</div></div>'
    +(c.campanha?'<span class="chip">'+E(c.campanha)+'</span>':'')
    +(function(){
       var t=tarefaDe(c.id);
       if(t){
         var cls = atrasada(t)?'q-atraso':(paraHoje(t)?'q-hoje':'q-frente');
         return '<span class="tar '+cls+'">'+ICO.rel+' '+E(quandoCurto(t.vence_em))+'</span>';
       }
       return parado>=3?'<span class="crm-parado">'+ICO.rel+' parado há '+parado+' dias</span>':'';
     })()
    +'<div class="rodape">'
      +(t?'<a class="crm-mini" href="tel:'+E(t)+'" title="Ligar" onclick="event.stopPropagation()">'+ICO.fone+'</a>'
         +'<a class="crm-mini" href="'+E(zap(c.telefone))+'" target="_blank" rel="noopener" title="WhatsApp" onclick="event.stopPropagation()">'+ICO.zap+'</a>':'')
      +(c.valor!=null?'<span class="crm-badge" style="background:rgba(18,184,134,.14);color:#0b7a5a">'+E(dinheiro(c.valor))+'</span>':'')
      +'<span class="idade">'+E(desde(c.entrou_em))+'</span>'
    +'</div></div>';
}

function pintarFunil(){
  var box = document.getElementById('crmBoard'); if(!box) return;
  if(!S.etapas.length){ box.innerHTML='<div class="crm-vazio"><b>Funil ainda não configurado</b>Abra Ajustes para criar as etapas.</div>'; return; }
  box.innerHTML = S.etapas.map(function(e){
    var lista = S.contatos.filter(function(c){ return c.stage_id===e.id; });
    var cc=e.cor||'#8b97ad';
    var soma=lista.reduce(function(a,c){return a+(Number(c.valor)||0);},0);
    return '<div class="crm-col" data-etapa="'+e.id+'" style="--cc:'+E(cc)+';--cs:'+E(suave(cc))+'">'
      +'<div class="crm-col-h"><span class="crm-pt" style="background:'+E(cc)+'"></span>'
        +'<b>'+E(e.nome)+'</b><span class="crm-col-n">'+lista.length+'</span>'+(soma>0?'<span class="crm-col-sum">'+E(dinheiro(soma))+'</span>':'')+'</div>'
      +'<div class="crm-fila">'
      + (lista.length? lista.map(cartao).join('') : '<div class="crm-vazio-col">nenhum contato aqui</div>')
      +'</div></div>';
  }).join('');
  ligarArrasto();
  box.querySelectorAll('.crm-card').forEach(function(el){
    el.addEventListener('click', function(){ if(!el.dataset.moveu) abrirFicha(el.dataset.id); });
    el.addEventListener('keydown', function(ev){
      if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); abrirFicha(el.dataset.id); } });
  });
}

function ligarArrasto(){
  if(!podeEditar()) return;
  var box=document.getElementById('crmBoard'); if(!box) return;
  box.querySelectorAll('.crm-card').forEach(function(el){
    el.addEventListener('pointerdown', function(ev){
      if(ev.target.closest('a')) return;
      var x0=ev.clientX, y0=ev.clientY, fly=null, alvo=null, moveu=false;
      delete el.dataset.moveu;
      var r=el.getBoundingClientRect(), dx=x0-r.left, dy=y0-r.top;
      function mv(e){
        if(!moveu && Math.abs(e.clientX-x0)+Math.abs(e.clientY-y0) < 8) return;
        if(!moveu){
          moveu=true;
          try{ el.setPointerCapture(ev.pointerId); }catch(_e){}
          el.classList.add('arrastando');
          fly=el.cloneNode(true); fly.className='crm-card crm-fly'; document.body.appendChild(fly);
        }
        fly.style.left=(e.clientX-dx)+'px'; fly.style.top=(e.clientY-dy)+'px';
        fly.style.display='none';
        var sob=document.elementFromPoint(e.clientX,e.clientY);
        fly.style.display='';
        var col=(sob&&sob.closest)?sob.closest('.crm-col'):null;
        if(col!==alvo){ if(alvo)alvo.classList.remove('alvo'); alvo=col; if(alvo)alvo.classList.add('alvo'); }
      }
      function up(){
        document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up);
        el.classList.remove('arrastando'); if(fly)fly.remove(); if(alvo)alvo.classList.remove('alvo');
        if(!moveu) return;
        el.dataset.moveu='1'; setTimeout(function(){ delete el.dataset.moveu; },220);
        if(!alvo) return;
        var c=S.contatos.find(function(x){return x.id===el.dataset.id;});
        if(c) mover(c, alvo.dataset.etapa).then(pintar);
      }
      document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up);
    });
  });
}

/* ---------- modal base ---------- */
function abrirModal(html){
  var bg=document.createElement('div'); bg.className='crm-bg crm';
  bg.innerHTML='<div class="crm-modal" role="dialog" aria-modal="true">'+html+'</div>';
  document.body.appendChild(bg);
  function esc(e){ if(e.key==='Escape') fechar(); }
  function fechar(){ bg.remove(); document.removeEventListener('keydown',esc); }
  document.addEventListener('keydown',esc);
  bg.addEventListener('click', function(e){ if(e.target===bg) fechar(); });
  bg.fechar=fechar;
  return bg;
}

/* ---------- ficha ---------- */
async function abrirFicha(id){
  var c = S.contatos.find(function(x){return x.id===id;}); if(!c) return;
  var ev = await sb.from('crm_events').select('*').eq('contact_id',id).order('created_at',{ascending:false}).limit(60);
  var eventos = ev.data||[];
  var opts = S.etapas.map(function(e){
    return '<option value="'+e.id+'"'+(e.id===c.stage_id?' selected':'')+'>'+E(e.nome)+'</option>'; }).join('');
  var t = so(c.telefone);
  var linha2=[]; if(c.telefone)linha2.push(fone(c.telefone)); if(c.email)linha2.push(c.email); if(c.cidade)linha2.push(c.cidade);

  var bg = abrirModal(
     '<div class="crm-fic">'
    +'<span class="crm-av" style="--av:'+E(avCor(c.nome))+'">'+E(inicial(c.nome))+'</span>'
    +'<h3 style="flex:1;margin:0">'+E(c.nome||'Sem nome')+'</h3>'
    +(podeEditar()?'<button class="crm-mini" id="fEditar" title="Editar dados">'+ICO.lapis+'</button>':'')
    +'</div>'
    +'<div class="sub">'+E(linha2.join(' · ')||'sem contato cadastrado')+'</div>'
    +(t?'<div style="display:flex;gap:8px;margin-bottom:18px">'
      +'<a class="crm-btn" href="tel:'+E(t)+'">'+ICO.fone+'Ligar</a>'
      +'<a class="crm-btn" href="'+E(zap(c.telefone))+'" target="_blank" rel="noopener">'+ICO.zap+'WhatsApp</a></div>':'')
    +'<div id="fEdicao"></div>'
    +'<div class="crm-campo"><label>Etapa</label><select class="crm-inp" id="fEtapa"'+(podeEditar()?'':' disabled')+'>'+opts+'</select></div>'
    +'<div id="fRetorno"></div>'
    +(function(){
       var e=etapaDe(c);
       if(!e) return '';
       if(e.tipo==='ganho'){
         return '<div class="crm-campo"><label>Valor da venda</label>'
           +'<div style="display:flex;gap:8px;align-items:center">'
           +'<input class="crm-inp" id="fValor" inputmode="decimal" style="flex:1" value="'+E(c.valor!=null?dinheiro(c.valor):'')+'" placeholder="R$ 0,00"'+(podeEditar()?'':' disabled')+'>'
           +(podeEditar()?'<button class="crm-btn" id="fValorOk">Salvar</button>':'')+'</div></div>';
       }
       if(e.tipo==='perdido'){
         var nome = c.motivo_id ? (S.motivos.find(function(m){return m.id===c.motivo_id;})||{}).nome : c.motivo_txt;
         return '<div class="crm-campo"><label>Motivo da perda</label>'
           +'<div style="font-size:14px">'+E(nome||'não informado')+'</div></div>';
       }
       return '';
     })()
    +(c.campanha?'<div class="crm-campo"><label>Veio de</label><div style="font-size:14px">'+E(c.campanha)+'</div></div>':'')
    +(podeEditar()?'<div class="crm-campo"><label>Anotação</label>'
      +'<textarea class="crm-inp" id="fNota" rows="2" placeholder="O que ficou combinado?"></textarea>'
      +'<button class="crm-btn pri" id="fAdd" style="margin-top:9px">Anotar</button></div>':'')
    +'<div class="crm-tl"><div class="crm-tl-t">Histórico</div><div id="fTl" style="display:flex;flex-direction:column;gap:13px">'
      + (eventos.length? eventos.map(function(e){
        return '<div class="crm-ev"><span class="pt"></span><div>'+E(e.texto||e.tipo)
          +'<div class="q">'+quando(e.created_at)+(e.autor?' · '+E(e.autor):'')+'</div></div></div>';
      }).join('') : '<div style="font-size:13px;color:var(--k-mut)">Nada registrado ainda.</div>') +'</div></div>'
    +'<div style="display:flex;gap:8px;margin-top:20px">'
      +(podeEditar()?'<button class="crm-btn'+(c.arquivado?'':' perigo')+'" id="fArquivar">'
        +(c.arquivado?'Tirar do arquivo':'Arquivar')+'</button>':'')
      +'<button class="crm-btn" id="fFechar" style="flex:1">Fechar</button></div>');

  function vendedorOpts(sel){
    return '<option value="">— sem dono —</option>'+S.vendedores.map(function(v){
      return '<option value="'+v.id+'"'+(v.id===sel?' selected':'')+'>'+E(v.name)+'</option>'; }).join('');
  }
  function pintarRetorno(){
    var alvo = bg.querySelector('#fRetorno'); if(!alvo) return;
    var t = tarefaDe(c.id);
    if(!podeEditar()){
      alvo.innerHTML = t ? '<div class="crm-ret marcado"><div class="crm-ret-t">Retorno</div>'
        +'<div class="crm-ret-q">'+E(quandoCurto(t.vence_em))+'</div>'
        +'<div class="crm-ret-s">'+E(t.titulo||'Retornar')+(t.dono_nome?' · com '+E(t.dono_nome):'')+'</div></div>' : '';
      return;
    }
    if(t){
      alvo.innerHTML='<div class="crm-ret '+(atrasada(t)?'atrasado':'marcado')+'">'
        +'<div class="crm-ret-t">'+(atrasada(t)?'Retorno atrasado':'Retorno marcado')+'</div>'
        +'<div class="crm-ret-q">'+E(quandoCurto(t.vence_em))+'</div>'
        +'<div class="crm-ret-s">'+E(t.titulo||'Retornar')+(t.dono_nome?' · com '+E(t.dono_nome):' · sem dono')+'</div>'
        +'<div style="display:flex;gap:7px;flex-wrap:wrap">'
        +'<button class="crm-btn pri" id="rFeito">Marcar como feito</button>'
        +'<button class="crm-btn" id="rAdia">Adiar 1 dia</button>'
        +'<button class="crm-btn" id="rTroca">Remarcar</button></div></div>';
      alvo.querySelector('#rFeito').onclick=async function(){
        var b=alvo.querySelector('#rFeito'); b.disabled=true;
        if(await concluirTarefa(t)){ pintarRetorno(); montarCabecalho(); } else b.disabled=false;
      };
      alvo.querySelector('#rAdia').onclick=async function(){
        var b=alvo.querySelector('#rAdia'); b.disabled=true;
        await adiarTarefa(t,1); pintarRetorno(); montarCabecalho();
      };
      alvo.querySelector('#rTroca').onclick=function(){ formRetorno(t); };
      return;
    }
    formRetorno(null);
  }
  function formRetorno(t){
    var alvo = bg.querySelector('#fRetorno');
    var base = t ? new Date(t.vence_em) : (function(){ var d=new Date(); d.setDate(d.getDate()+1); d.setHours(9,0,0,0); return d; })();
    alvo.innerHTML='<div class="crm-ret">'
      +'<div class="crm-ret-t">'+(t?'Remarcar o retorno':'Marcar um retorno')+'</div>'
      +'<div class="crm-atalhos">'
        +'<button class="crm-atalho" data-d="0">Hoje mais tarde</button>'
        +'<button class="crm-atalho" data-d="1">Amanhã</button>'
        +'<button class="crm-atalho" data-d="3">Em 3 dias</button>'
        +'<button class="crm-atalho" data-d="7">Semana que vem</button>'
      +'</div>'
      +'<div class="crm-campo" style="margin-bottom:11px"><label>Quando</label>'
        +'<input class="crm-inp" type="datetime-local" id="rQuando" value="'+paraInput(base)+'" style="width:100%"></div>'
      +'<div class="crm-campo" style="margin-bottom:11px"><label>O que fazer</label>'
        +'<input class="crm-inp" id="rTitulo" style="width:100%" placeholder="Retornar" value="'+E(t?(t.titulo||''):'')+'"></div>'
      +(S.vendedores.length?'<div class="crm-campo" style="margin-bottom:11px"><label>Quem fica responsável</label>'
        +'<select class="crm-inp" id="rDono" style="width:100%">'+vendedorOpts(t?t.dono_id:c.responsavel_id)+'</select></div>'
        :'<div class="crm-ret-s">Cadastre vendedores em Ajustes para dizer de quem é o retorno.</div>')
      +'<div style="display:flex;gap:7px">'
        +'<button class="crm-btn pri" id="rSalvar" style="flex:1">'+(t?'Remarcar':'Marcar retorno')+'</button>'
        +(t?'<button class="crm-btn" id="rVolta">Cancelar</button>':'')+'</div></div>';
    alvo.querySelectorAll('.crm-atalho').forEach(function(b){
      b.onclick=function(){
        var d=new Date();
        var n=Number(b.dataset.d);
        if(n===0){ d.setHours(d.getHours()+3,0,0,0); }
        else { d.setDate(d.getDate()+n); d.setHours(9,0,0,0); }
        alvo.querySelector('#rQuando').value=paraInput(d);
      };
    });
    var vb=alvo.querySelector('#rVolta'); if(vb) vb.onclick=pintarRetorno;
    alvo.querySelector('#rSalvar').onclick=async function(){
      var b=alvo.querySelector('#rSalvar');
      var q=alvo.querySelector('#rQuando').value;
      if(!q){ aviso('Escolha a data e a hora do retorno'); return; }
      var dono=alvo.querySelector('#rDono'); 
      b.disabled=true;
      var r=await salvarTarefa(c, q, dono?dono.value:null, alvo.querySelector('#rTitulo').value);
      b.disabled=false;
      if(!r) return;
      pintarRetorno(); montarCabecalho();
      aviso('Retorno marcado para '+quandoCurto(r.vence_em));
    };
  }
  pintarRetorno();

  function fecharEPintar(){ bg.fechar(); pintar(); }
  bg.querySelector('#fFechar').onclick = fecharEPintar;
  var sel = bg.querySelector('#fEtapa');
  if(sel) sel.onchange = function(){ mover(c, sel.value).then(fecharEPintar); };

  var bv = bg.querySelector('#fValorOk');
  if(bv) bv.onclick=async function(){
    bv.disabled=true;
    var v=lerDinheiro(bg.querySelector('#fValor').value);
    var r=await sb.from('crm_contacts').update({valor:v}).eq('id',c.id);
    bv.disabled=false;
    if(r.error){ aviso('Não consegui salvar: '+r.error.message); return; }
    c.valor=v; S.resultados=null;
    bg.querySelector('#fValor').value = v!=null?dinheiro(v):'';
    await registrar(c.id,'nota', v!=null?('Valor da venda: '+dinheiro(v)+'.'):'Valor da venda apagado.');
    aviso(v!=null?('Valor salvo: '+dinheiro(v)):'Valor apagado');
  };

  var add = bg.querySelector('#fAdd');
  if(add) add.onclick = async function(){
    var campo = bg.querySelector('#fNota'); var txt = campo.value.trim(); if(!txt) return;
    add.disabled = true;
    var r = await registrar(c.id,'nota',txt);
    add.disabled = false;
    if(r.error){ aviso('Não consegui salvar: '+r.error.message); return; }
    campo.value='';
    bg.querySelector('#fTl').insertAdjacentHTML('afterbegin',
      '<div class="crm-ev"><span class="pt"></span><div>'+E(txt)+'<div class="q">agora · '+E(quemSou())+'</div></div></div>');
    c.ultimo_evento_em = new Date().toISOString();
  };

  var arq = bg.querySelector('#fArquivar');
  if(arq) arq.onclick = async function(){
    var indo = !c.arquivado;                 // true = arquivando, false = tirando do arquivo
    arq.disabled=true;
    var r = await sb.from('crm_contacts').update({arquivado:indo}).eq('id',c.id);
    arq.disabled=false;
    if(r.error){ aviso('Não consegui '+(indo?'arquivar':'restaurar')+': '+r.error.message); return; }
    if(indo){
      var ta = tarefaDe(c.id);
      if(ta){ await sb.from('crm_tasks').update({feita:true}).eq('id',ta.id);
              S.tarefas = S.tarefas.filter(function(x){ return x.id!==ta.id; }); }
    }
    await registrar(c.id,'nota', indo?'Contato arquivado.':'Contato tirado do arquivo.');
    c.arquivado = indo;
    S.contatos = S.contatos.filter(function(x){ return x.id!==c.id; });
    bg.fechar(); pintar();
    aviso((c.nome||'Contato')+(indo?' arquivado':' voltou para a lista'), async function(){
      await sb.from('crm_contacts').update({arquivado:!indo}).eq('id',c.id);
      await carregar(); pintar();
    });
  };

  var ed = bg.querySelector('#fEditar');
  if(ed) ed.onclick = function(){
    var alvo = bg.querySelector('#fEdicao');
    if(alvo.dataset.aberto){ alvo.innerHTML=''; delete alvo.dataset.aberto; return; }
    alvo.dataset.aberto='1';
    alvo.innerHTML =
       '<div class="crm-campo"><label>Nome</label><input class="crm-inp" id="eNome" value="'+E(c.nome||'')+'"></div>'
      +'<div class="crm-dupla">'
      +'<div class="crm-campo"><label>Telefone</label><input class="crm-inp" id="eFone" value="'+E(c.telefone||'')+'"></div>'
      +'<div class="crm-campo"><label>Cidade</label><input class="crm-inp" id="eCidade" value="'+E(c.cidade||'')+'"></div>'
      +'</div>'
      +'<div class="crm-campo"><label>E-mail</label><input class="crm-inp" id="eEmail" type="email" value="'+E(c.email||'')+'"></div>'
      +(S.vendedores.length?'<div class="crm-campo"><label>Responsável</label>'
        +'<select class="crm-inp" id="eResp" style="width:100%">'+vendedorOpts(c.responsavel_id)+'</select></div>':'')
      +'<button class="crm-btn pri" id="eSalvar" style="margin-bottom:16px">Salvar dados</button>';
    alvo.querySelector('#eSalvar').onclick = async function(){
      var b=alvo.querySelector('#eSalvar'); b.disabled=true;
      var selResp=alvo.querySelector('#eResp');
      var novo={
        nome:(alvo.querySelector('#eNome').value||'').trim()||'Sem nome',
        telefone:(alvo.querySelector('#eFone').value||'').trim()||null,
        cidade:(alvo.querySelector('#eCidade').value||'').trim()||null,
        email:(alvo.querySelector('#eEmail').value||'').trim()||null
      };
      if(selResp) novo.responsavel_id = selResp.value || null;
      var mudou=[];
      if(novo.nome!==(c.nome||''))          mudou.push('nome');
      if((novo.telefone||'')!==(c.telefone||'')) mudou.push('telefone');
      if((novo.email||'')!==(c.email||''))   mudou.push('e-mail');
      if((novo.cidade||'')!==(c.cidade||'')) mudou.push('cidade');
      if(selResp && (novo.responsavel_id||'')!==(c.responsavel_id||'')) mudou.push('responsável');
      var r = await sb.from('crm_contacts').update(novo).eq('id',c.id);
      b.disabled=false;
      if(r.error){
        aviso(String(r.error.message).indexOf('crm_contacts_tel_unico')>=0
          ? 'Já existe outro contato com esse telefone.' : 'Não consegui salvar: '+r.error.message);
        return;
      }
      Object.keys(novo).forEach(function(k){ c[k]=novo[k]; });
      if(mudou.length) await registrar(c.id,'nota','Dados atualizados: '+mudou.join(', ')+'.');
      bg.fechar(); pintar();
      aviso('Dados de '+E(c.nome)+' atualizados');
    };
  };
}

/* ---------- hoje ---------- */
function linhaHoje(t){
  var c = S.contatos.find(function(x){ return x.id===t.contact_id; }) || t.contato;
  var nome = (c && c.nome) || 'Sem nome';
  var e = c ? etapaDe(c) : null;
  var cc = (e&&e.cor) || '#8b97ad';
  var cls = atrasada(t) ? 'q-atraso' : (paraHoje(t) ? 'q-hoje' : 'q-frente');
  var tel = c ? so(c.telefone) : '';
  var sub = [];
  if(c && c.telefone) sub.push(fone(c.telefone));
  if(e) sub.push(e.nome);
  if(t.dono_nome) sub.push('com '+t.dono_nome);
  return '<div class="crm-hj" data-t="'+t.id+'" style="--cc:'+E(cc)+'">'
    +'<span class="crm-quando '+cls+'">'+E(quandoCurto(t.vence_em))+'</span>'
    +'<div class="txt"><div class="nm" data-abre="'+E(t.contact_id)+'">'+E(nome)+'</div>'
    +'<div class="sub">'+E(t.titulo||'Retornar')+(sub.length?' · '+E(sub.join(' · ')):'')+'</div></div>'
    +'<div class="acts">'
      +(tel?'<a class="crm-mini" href="tel:'+E(tel)+'" title="Ligar">'+ICO.fone+'</a>'
           +'<a class="crm-mini" href="'+E(zap(c.telefone))+'" target="_blank" rel="noopener" title="WhatsApp">'+ICO.zap+'</a>':'')
      +(podeEditar()?'<button class="crm-btn" data-feito="'+t.id+'">Feito</button>'
        +'<button class="crm-btn" data-adia="'+t.id+'" title="Adiar 1 dia">+1d</button>':'')
    +'</div></div>';
}
function respostaHTML(){
  var r=S.resposta; if(!r) return '';
  var total=Number(r.respondidos||0)+Number(r.sem_resposta||0);
  if(!total) return '';
  var med=r.mediana_min;
  var texto;
  if(med==null) texto='—';
  else if(med<60) texto=Math.round(med)+' min';
  else if(med<1440) texto=(Math.round(med/6)/10).toString().replace('.',',')+' h';
  else texto=Math.round(med/1440)+' dias';
  return '<div class="crm-resp">'
    +'<div><div class="n">'+texto+'</div><div class="l">Tempo até o 1º retorno</div></div>'
    +'<div><div class="n">'+r.ate_5min+'</div><div class="l">em até 5 min</div></div>'
    +'<div><div class="n">'+r.ate_1h+'</div><div class="l">em até 1 hora</div></div>'
    +'<div><div class="n">'+r.sem_resposta+'</div><div class="l">nunca respondidos</div></div>'
    +'</div>';
}
function pintarHoje(){
  var box=document.getElementById('crmHoje'); if(!box) return;
  var lista = S.tarefas.slice().sort(function(a,b){ return new Date(a.vence_em)-new Date(b.vence_em); });
  if(!lista.length){
    box.innerHTML=respostaHTML()+'<div class="crm-vazio"><b>Nada marcado para retornar</b>'
      +'Abra a ficha de um contato e marque quando falar com ele de novo. '
      +'O que estiver atrasado aparece aqui em cima.</div>';
    return;
  }
  var atrasados = lista.filter(atrasada);
  var hoje = lista.filter(function(t){ return !atrasada(t) && paraHoje(t); });
  var frente = lista.filter(function(t){ return !atrasada(t) && !paraHoje(t); });
  var h=respostaHTML();
  if(atrasados.length) h+='<div class="crm-grupo">Atrasado — '+atrasados.length+'</div>'+atrasados.map(linhaHoje).join('');
  if(hoje.length)      h+='<div class="crm-grupo">Hoje</div>'+hoje.map(linhaHoje).join('');
  if(frente.length)    h+='<div class="crm-grupo">Próximos dias</div>'+frente.map(linhaHoje).join('');
  box.innerHTML=h;

  box.querySelectorAll('[data-abre]').forEach(function(el){
    el.onclick=function(){ abrirFicha(el.dataset.abre); };
  });
  box.querySelectorAll('[data-feito]').forEach(function(b){
    b.onclick=async function(){ b.disabled=true;
      var t=S.tarefas.find(function(x){ return x.id===b.dataset.feito; });
      if(t && await concluirTarefa(t)) { montarCabecalho(); pintar(); } else b.disabled=false; };
  });
  box.querySelectorAll('[data-adia]').forEach(function(b){
    b.onclick=async function(){ b.disabled=true;
      var t=S.tarefas.find(function(x){ return x.id===b.dataset.adia; });
      if(t) await adiarTarefa(t,1);
      montarCabecalho(); pintar(); };
  });
}

/* ---------- resultados ---------- */
var CORES_TIPO={aberto:'#3b5bdb', ganho:'#12b886', perdido:'#e0567a'};
function pct(a,b){ return b>0 ? Math.round(a/b*1000)/10 : 0; }
function pctTxt(a,b){ return String(pct(a,b)).replace('.',',')+'%'; }

async function pintarResultados(){
  var box=document.getElementById('crmResult'); if(!box) return;
  if(!S.resultados){
    var r=await sb.rpc('crm_resultados',{p_client:S.cid, p_dias:S.diasResult||90});
    if(r.error){ box.innerHTML='<div class="crm-vazio"><b>Não consegui somar</b>'+E(r.error.message)+'</div>'; return; }
    S.resultados=r.data;
  }
  var d=S.resultados;
  if(!d || !d.contatos){
    box.innerHTML='<div class="crm-vazio"><b>Ainda não há o que somar</b>'
      +'Assim que os contatos começarem a andar pelo funil, os números aparecem aqui.</div>';
    return;
  }

  var topo = (d.funil&&d.funil.length) ? Number(d.funil[0].quantos)||d.contatos : d.contatos;
  var h='';

  // --- números do período
  var invest = S.ads && S.ads.investido;
  var custoVenda = (invest && d.ganhos) ? invest/d.ganhos : null;
  var ticket = d.com_valor ? Number(d.valor_ganho)/d.com_valor : null;
  h+='<div class="rep-kpis csec" style="margin-top:0">'
    +'<div class="rep-kpi crm-kpi" style="--kc:#12b886"><div class="l">Vendas fechadas</div><div class="v">'+d.ganhos+'</div></div>'
    +'<div class="rep-kpi crm-kpi" style="--kc:#0ca678"><div class="l">Faturamento</div><div class="v">'
      +(Number(d.valor_ganho)>0?E(dinheiro(d.valor_ganho)):'—')+'</div></div>'
    +'<div class="rep-kpi crm-kpi" style="--kc:#7c5cff"><div class="l">Ticket médio</div><div class="v">'
      +(ticket?E(dinheiro(ticket)):'—')+'</div></div>'
    +'<div class="rep-kpi crm-kpi" style="--kc:#e8590c"><div class="l">Custo por venda</div><div class="v">'
      +(custoVenda?E(dinheiro(custoVenda)):'—')+'</div></div>'
    +'</div>';

  if(Number(d.valor_ganho)===0 && d.ganhos>0){
    h+='<div class="crm-nota">Nenhuma das '+d.ganhos+' vendas tem valor informado ainda. '
      +'Arraste um contato para Ganho e anote quanto valeu — é o que enche esses números.</div>';
  }

  // --- funil
  h+='<div class="crm-secao">Onde os contatos param</div><div class="crm-caixa" style="padding:16px"><div class="crm-fnl">';
  (d.funil||[]).forEach(function(f){
    var q=Number(f.quantos)||0;
    var cor=CORES_TIPO[f.tipo]||'#8b97ad';
    h+='<div class="crm-fnl-l">'
      +'<div class="crm-fnl-n">'+E(f.etapa)+'</div>'
      +'<div class="crm-fnl-b"><div class="crm-fnl-f" style="width:'+(topo?Math.max(q/topo*100,1.5):0)+'%;background:'+E(cor)+'"></div></div>'
      +'<div class="crm-fnl-v">'+q+' <span class="crm-fnl-p">'+pctTxt(q,topo)+'</span></div>'
      +'</div>';
  });
  h+='</div></div>';
  h+='<div class="crm-nota">De cada 100 contatos que entram, <b>'+pct(d.ganhos,topo)+'</b> fecham. '
    +(d.dias_ate_fechar!=null?('Quem fecha leva em média <b>'+String(d.dias_ate_fechar).replace('.',',')+' dias</b> do primeiro contato até o sim.'):'')
    +'</div>';

  // --- campanhas
  if((d.campanhas||[]).length){
    h+='<div class="crm-secao">De onde vieram</div><div class="crm-caixa"><table class="crm-tab2">'
      +'<thead><tr><th>Campanha</th><th class="num">Contatos</th><th class="num">Fechou</th><th class="num">Taxa</th><th class="num">Faturou</th></tr></thead><tbody>';
    d.campanhas.forEach(function(c){
      h+='<tr><td>'+E(c.nome)+'</td>'
        +'<td class="num">'+c.contatos+'</td>'
        +'<td class="num">'+c.ganhos+'</td>'
        +'<td class="num">'+pctTxt(c.ganhos,c.contatos)+'</td>'
        +'<td class="num">'+(Number(c.valor)>0?E(dinheiro(c.valor)):'—')+'</td></tr>';
    });
    h+='</tbody></table></div>';
    if(d.campanhas.length===1){
      h+='<div class="crm-nota">Só existe uma campanha na base, então não há o que comparar ainda. '
        +'Com duas ou mais, esta tabela mostra qual traz contato que fecha — não só qual traz contato barato.</div>';
    }
  }

  // --- motivos de perda
  h+='<div class="crm-secao">Por que os negócios caem</div>';
  if((d.motivos||[]).length){
    var totalPerda=d.motivos.reduce(function(a,m){ return a+Number(m.quantos); },0);
    h+='<div class="crm-caixa" style="padding:16px"><div class="crm-fnl">';
    d.motivos.forEach(function(m){
      var q=Number(m.quantos);
      h+='<div class="crm-fnl-l">'
        +'<div class="crm-fnl-n">'+E(m.nome)+'</div>'
        +'<div class="crm-fnl-b"><div class="crm-fnl-f" style="width:'+Math.max(q/totalPerda*100,1.5)+'%;background:#e0567a"></div></div>'
        +'<div class="crm-fnl-v">'+q+' <span class="crm-fnl-p">'+pctTxt(q,totalPerda)+'</span></div>'
        +'</div>';
    });
    h+='</div></div>';
  } else {
    h+='<div class="crm-vazio" style="text-align:left"><b>Nenhuma perda registrada</b>'
      +'Quando marcar um contato como Perdido, o portal pergunta o motivo. É isso que enche este quadro.</div>';
  }

  // --- de onde vem cada numero
  h+='<div class="crm-nota" style="margin-top:22px;padding-top:16px;border-top:1px solid var(--k-line)">'
    +'<b>De onde vêm estes números:</b> contagem dos últimos '+(d.dias||90)+' dias, direto do seu funil. '
    +(invest
       ? ('O custo por venda usa o investimento em anúncios do período que aparece na Visão Geral ('+E(dinheiro(invest))+') dividido pelas vendas fechadas. É o gasto total do cliente, não o gasto de uma campanha — o Meta não devolve gasto por campanha de formulário separado.')
       : 'O custo por venda aparece quando o relatório de anúncios estiver carregado.')
    +'</div>';

  box.innerHTML=h;
}

/* ---------- lista ---------- */
function filtrados(){
  var q=sac(S.busca).trim(); var qt=norm(S.busca);
  return S.contatos.filter(function(c){
    if(S.filtro && c.stage_id!==S.filtro) return false;
    if(S.dono==='__sem__'){ if(c.responsavel_id) return false; }
    else if(S.dono && c.responsavel_id!==S.dono) return false;
    if(!q) return true;
    if(sac(c.nome).indexOf(q)>=0) return true;
    if(qt && (c.telefone_norm||norm(c.telefone)).indexOf(qt)>=0) return true;
    if(sac(c.email).indexOf(q)>=0) return true;
    if(sac(c.cidade).indexOf(q)>=0) return true;
    return false;
  });
}
function pintarLista(){
  var box=document.getElementById('crmLista'); if(!box) return;
  var lista=filtrados();
  var cab=document.getElementById('crmConta');
  if(cab) cab.textContent = lista.length+(lista.length===1?' contato':' contatos')
    + (S.verArquivados?(lista.length===1?' arquivado':' arquivados'):'')
    + (S.temMais?' (mostrando os '+S.limite+' mais recentes)':'');
  if(!lista.length){ box.innerHTML='<div class="crm-vazio"><b>Nenhum contato encontrado</b>'
    +(S.busca?'Tente outro nome, telefone ou cidade.':'Cadastre o primeiro no botão acima.')+'</div>'; return; }
  box.innerHTML = lista.map(function(c){
    var e=etapaDe(c);
    return '<div class="crm-linha" data-id="'+c.id+'" tabindex="0" role="button">'
      +'<span class="crm-av" style="--av:'+E(avCor(c.nome))+'">'+E(inicial(c.nome))+'</span>'
      +'<div style="flex:1;min-width:0"><div class="nm">'+E(c.nome||'Sem nome')+'</div>'
      +'<div class="sub">'+(c.telefone?E(fone(c.telefone))+' · ':'')+'entrou '+E(desde(c.entrou_em))+'</div></div>'
      +(e?'<span class="crm-badge" style="background:'+E(e.cor)+'1f;color:'+E(e.cor)+'">'+E(e.nome)+'</span>':'')
      +'</div>';
  }).join('')
  + (S.temMais&&!S.busca ? '<button class="crm-btn" id="crmMais" style="margin-top:6px">Carregar mais contatos</button>' : '');
  box.querySelectorAll('.crm-linha').forEach(function(el){
    el.onclick=function(){ abrirFicha(el.dataset.id); };
    el.onkeydown=function(ev){ if(ev.key==='Enter'){ abrirFicha(el.dataset.id); } };
  });
  var mais=document.getElementById('crmMais');
  if(mais) mais.onclick=async function(){ mais.disabled=true; S.limite+=400; await carregar(); pintarLista(); };
}

/* ---------- novo contato ---------- */
function novoContato(){
  var opts=S.etapas.map(function(e){ return '<option value="'+e.id+'">'+E(e.nome)+'</option>'; }).join('');
  var bg=abrirModal('<h3>Novo contato</h3><div class="sub">Para quem chegou por indicação, telefone ou balcão.</div>'
    +'<div class="crm-campo"><label>Nome</label><input class="crm-inp" id="nNome" placeholder="Nome da pessoa" autofocus></div>'
    +'<div class="crm-dupla">'
    +'<div class="crm-campo"><label>Telefone</label><input class="crm-inp" id="nFone" placeholder="(34) 99999-9999"></div>'
    +'<div class="crm-campo"><label>Cidade</label><input class="crm-inp" id="nCidade" placeholder="Patrocínio"></div>'
    +'</div>'
    +'<div class="crm-campo"><label>E-mail</label><input class="crm-inp" id="nEmail" type="email" placeholder="opcional"></div>'
    +'<div class="crm-campo"><label>Etapa</label><select class="crm-inp" id="nEtapa">'+opts+'</select></div>'
    +'<div style="display:flex;gap:8px"><button class="crm-btn" id="nCancelar" style="flex:1">Cancelar</button>'
    +'<button class="crm-btn pri" id="nSalvar" style="flex:1">Cadastrar</button></div>');
  bg.querySelector('#nCancelar').onclick=bg.fechar;
  bg.querySelector('#nSalvar').onclick=async function(){
    var b=bg.querySelector('#nSalvar');
    var nome=(bg.querySelector('#nNome').value||'').trim();
    if(!nome){ aviso('Falta o nome do contato'); return; }
    b.disabled=true;
    var r=await sb.from('crm_contacts').insert({
      client_id:S.cid, nome:nome,
      telefone:(bg.querySelector('#nFone').value||'').trim()||null,
      cidade:(bg.querySelector('#nCidade').value||'').trim()||null,
      email:(bg.querySelector('#nEmail').value||'').trim()||null,
      origem:'manual', stage_id:bg.querySelector('#nEtapa').value
    }).select().maybeSingle();
    b.disabled=false;
    if(r.error){ aviso(String(r.error.message).indexOf('crm_contacts_tel_unico')>=0
      ? 'Já existe um contato com esse telefone.' : 'Não consegui cadastrar: '+r.error.message); return; }
    if(r.data) await registrar(r.data.id,'criado','Cadastrado à mão.');
    bg.fechar(); await carregar(); pintar();
    aviso(nome+' foi cadastrado');
  };
}

/* ---------- importar planilha ---------- */
function lerCSV(txt){
  var sep = (txt.split('\n')[0].split(';').length > txt.split('\n')[0].split(',').length) ? ';' : ',';
  var linhas=[], campo='', atual=[], aspas=false;
  for(var i=0;i<txt.length;i++){
    var ch=txt[i];
    if(aspas){
      if(ch==='"'&&txt[i+1]==='"'){ campo+='"'; i++; }
      else if(ch==='"'){ aspas=false; }
      else campo+=ch;
    } else if(ch==='"'){ aspas=true; }
    else if(ch===sep){ atual.push(campo); campo=''; }
    else if(ch==='\n'){ atual.push(campo); linhas.push(atual); atual=[]; campo=''; }
    else if(ch!=='\r'){ campo+=ch; }
  }
  if(campo||atual.length){ atual.push(campo); linhas.push(atual); }
  return linhas.filter(function(l){ return l.some(function(x){ return (x||'').trim(); }); });
}
function acharColuna(cab, nomes){
  for(var i=0;i<cab.length;i++){
    var h=sac(cab[i]).trim();
    for(var j=0;j<nomes.length;j++){ if(h===nomes[j]||h.indexOf(nomes[j])>=0) return i; }
  }
  return -1;
}
function importar(){
  var bg=abrirModal('<h3>Importar planilha</h3>'
    +'<div class="sub">Um arquivo CSV com uma linha por pessoa. A primeira linha precisa ter os títulos das colunas.</div>'
    +'<div class="crm-imp" id="iZona">Escolha o arquivo CSV<br><span style="font-size:12px">'
    +'Reconheço as colunas: <b>nome</b>, <b>telefone</b>, <b>email</b>, <b>cidade</b></span><br><br>'
    +'<input type="file" id="iArq" accept=".csv,text/csv"></div>'
    +'<div id="iPrev"></div>'
    +'<div style="display:flex;gap:8px;margin-top:18px"><button class="crm-btn" id="iCancelar" style="flex:1">Cancelar</button>'
    +'<button class="crm-btn pri" id="iOk" style="flex:1" disabled>Importar</button></div>');
  bg.querySelector('#iCancelar').onclick=bg.fechar;
  var prontos=[];
  bg.querySelector('#iArq').onchange=function(ev){
    var f=ev.target.files[0]; if(!f) return;
    var fr=new FileReader();
    fr.onload=function(){
      var linhas=lerCSV(String(fr.result||''));
      if(linhas.length<2){ bg.querySelector('#iPrev').innerHTML='<div class="crm-vazio">Arquivo vazio ou sem linhas de dados.</div>'; return; }
      var cab=linhas[0];
      var iN=acharColuna(cab,['nome','name','contato']);
      var iT=acharColuna(cab,['telefone','fone','celular','whatsapp','phone']);
      var iE=acharColuna(cab,['email','e-mail']);
      var iC=acharColuna(cab,['cidade','city','municipio']);
      if(iN<0&&iT<0){
        bg.querySelector('#iPrev').innerHTML='<div class="crm-vazio"><b>Não achei as colunas</b>'
          +'A planilha precisa de pelo menos uma coluna <b>nome</b> ou <b>telefone</b>.<br>'
          +'Encontrei: '+E(cab.join(', '))+'</div>';
        return;
      }
      var vistos={}; prontos=[];
      S.contatos.forEach(function(c){ if(c.telefone_norm) vistos[c.telefone_norm]=1; });
      var repetidos=0;
      linhas.slice(1).forEach(function(l){
        var tel=iT>=0?(l[iT]||'').trim():'';
        var tn=norm(tel);
        if(tn && vistos[tn]){ repetidos++; return; }
        if(tn) vistos[tn]=1;
        var nome=iN>=0?(l[iN]||'').trim():'';
        if(!nome && !tn) return;
        prontos.push({ nome:nome||'Sem nome', telefone:tel||null,
          email:iE>=0?((l[iE]||'').trim()||null):null, cidade:iC>=0?((l[iC]||'').trim()||null):null });
      });
      var amostra=prontos.slice(0,8);
      bg.querySelector('#iPrev').innerHTML =
         '<div style="font-size:13.5px;margin-top:14px"><b>'+prontos.length+'</b> contato(s) prontos para entrar'
        +(repetidos?' · <span style="color:var(--k-mut)">'+repetidos+' já existem e serão pulados</span>':'')+'</div>'
        +(amostra.length?'<div class="crm-prev"><table><thead><tr><th>Nome</th><th>Telefone</th><th>Cidade</th></tr></thead><tbody>'
          +amostra.map(function(p){ return '<tr><td>'+E(p.nome)+'</td><td>'+E(fone(p.telefone)||'—')+'</td><td>'+E(p.cidade||'—')+'</td></tr>'; }).join('')
          +'</tbody></table></div>':'');
      bg.querySelector('#iOk').disabled = !prontos.length;
    };
    fr.readAsText(f,'UTF-8');
  };
  bg.querySelector('#iOk').onclick=async function(){
    var b=bg.querySelector('#iOk'); b.disabled=true; b.textContent='Importando…';
    var et=S.etapas.filter(function(e){return e.tipo==='aberto';})[0];
    var ok=0, falhou=0;
    for(var i=0;i<prontos.length;i+=50){
      var lote=prontos.slice(i,i+50).map(function(p){
        return {client_id:S.cid, nome:p.nome, telefone:p.telefone, email:p.email, cidade:p.cidade,
                origem:'planilha', stage_id: et?et.id:null};
      });
      var r=await sb.from('crm_contacts').insert(lote).select('id');
      var novos=[];
      if(r.error){
        // um contato ruim nao pode derrubar os outros 49: tenta um a um
        for(var k=0;k<lote.length;k++){
          var u=await sb.from('crm_contacts').insert(lote[k]).select('id').maybeSingle();
          if(u.error||!u.data) falhou++; else novos.push(u.data.id);
        }
      } else { novos=(r.data||[]).map(function(x){ return x.id; }); }
      ok+=novos.length;
      if(novos.length){
        await sb.from('crm_events').insert(novos.map(function(cid){
          return {client_id:S.cid, contact_id:cid, tipo:'criado',
                  texto:'Veio de uma planilha importada.', autor:quemSou()};
        }));
      }
    }
    bg.fechar(); await carregar(); pintar();
    aviso(ok+' contato(s) importados'+(falhou?' · '+falhou+' falharam':''));
  };
}

/* ---------- exportar ---------- */
function exportar(){
  var lista=filtrados();
  if(!lista.length){ aviso('Nada para exportar com esse filtro'); return; }
  function q(v){ v=(v==null?'':String(v)); return /[";\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
  var cab=['Nome','Telefone','E-mail','Cidade','Etapa','Origem','Campanha','Entrou em','Ultimo movimento'];
  var linhas=[cab.join(';')].concat(lista.map(function(c){
    var e=etapaDe(c);
    return [c.nome, c.telefone?fone(c.telefone):'', c.email, c.cidade, e?e.nome:'',
            c.origem, c.campanha, quando(c.entrou_em), quando(c.ultimo_evento_em)].map(q).join(';');
  }));
  var blob=new Blob(['\ufeff'+linhas.join('\r\n')],{type:'text/csv;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url; a.download='contatos-'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 1500);
  aviso(lista.length+' contato(s) exportados');
}

/* ---------- ajustes ---------- */
function pintarAjustes(){
  var box=document.getElementById('crmAjustes'); if(!box) return;
  var usados={};
  S.contatos.forEach(function(c){ usados[c.stage_id]=(usados[c.stage_id]||0)+1; });
  box.innerHTML = '<div style="font-size:13.5px;color:var(--k-mut);margin-bottom:16px;max-width:62ch">'
    +'As etapas do seu funil, na ordem em que aparecem. Mude o nome, a cor ou a posição.</div>'
    + S.etapas.map(function(e,i){
      return '<div class="crm-et" data-et="'+e.id+'">'
        +'<div class="crm-setas">'
          +'<button class="crm-seta" data-sobe="'+e.id+'"'+(i===0?' disabled':'')+' title="Subir">'+ICO.cima+'</button>'
          +'<button class="crm-seta" data-desce="'+e.id+'"'+(i===S.etapas.length-1?' disabled':'')+' title="Descer">'+ICO.baixo+'</button>'
        +'</div>'
        +'<input class="crm-inp" type="color" data-cor="'+e.id+'" value="'+E(e.cor||'#3b5bdb')+'"'+(podeEditar()?'':' disabled')+'>'
        +'<input class="crm-inp" data-nome="'+e.id+'" value="'+E(e.nome)+'" style="flex:1"'+(podeEditar()?'':' disabled')+'>'
        +'<span class="crm-badge" style="background:var(--k-soft);color:var(--k-mut)">'
          +(e.tipo==='ganho'?'fecha ganho':e.tipo==='perdido'?'fecha perdido':'em aberto')
          +' · '+(usados[e.id]||0)+'</span>'
        +(podeEditar()?'<button class="crm-mini" data-apaga="'+e.id+'" title="Apagar etapa" style="color:var(--k-alerta)">✕</button>':'')
        +'</div>';
    }).join('')
    + (podeEditar()?'<div style="display:flex;gap:8px;margin-top:14px">'
        +'<button class="crm-btn" id="ajNova"'+(S.etapas.length>=8?' disabled title="Máximo de 8 etapas"':'')+'>'+ICO.mais+'Nova etapa'+(S.etapas.length>=8?' (máx. 8)':'')+'</button>'
        +'<button class="crm-btn pri" id="ajSalvar">Salvar alterações</button></div>':'')
    + vendedoresHTML();

  box.querySelectorAll('[data-sobe]').forEach(function(b){
    b.onclick=function(){ trocar(b.dataset.sobe,-1); };
  });
  box.querySelectorAll('[data-desce]').forEach(function(b){
    b.onclick=function(){ trocar(b.dataset.desce,1); };
  });
  box.querySelectorAll('[data-apaga]').forEach(function(b){
    b.onclick=function(){ apagarEtapa(b.dataset.apaga); };
  });
  var nova=document.getElementById('ajNova'); if(nova) nova.onclick=novaEtapa;
  var sv=document.getElementById('ajSalvar');
  if(sv) sv.onclick=async function(){
    sv.disabled=true; var falhas=0;
    var campos=box.querySelectorAll('input[data-nome]');
    for(var i=0;i<campos.length;i++){
      var id=campos[i].dataset.nome;
      var nome=campos[i].value.trim(); if(!nome) continue;
      var cor=box.querySelector('input[data-cor="'+id+'"]').value;
      var r=await sb.from('crm_stages').update({nome:nome, cor:cor}).eq('id',id);
      if(r.error) falhas++;
    }
    sv.disabled=false;
    await carregar(); pintar();
    aviso(falhas?'Alguma etapa não salvou':'Etapas salvas');
  };

  ligarVendedores(box);
  ligarMotivos(box);
  ligarSwitch();

  async function trocar(id, dir){
    var i=S.etapas.findIndex(function(e){return e.id===id;});
    var j=i+dir; if(j<0||j>=S.etapas.length) return;
    var ordem=S.etapas.map(function(e){return e.id;});
    var tmp=ordem[i]; ordem[i]=ordem[j]; ordem[j]=tmp;
    var r=await sb.rpc('crm_reordenar',{p_etapas:ordem});
    if(r.error){ aviso('Não consegui reordenar: '+r.error.message); return; }
    await carregar(); pintar();
  }
}

function vendedoresHTML(){
  var usados={};
  S.contatos.forEach(function(c){ if(c.responsavel_id) usados[c.responsavel_id]=(usados[c.responsavel_id]||0)+1; });
  var h='<div style="border-top:1px solid var(--k-line);margin-top:26px;padding-top:22px">'
    +'<div style="font-size:15px;font-weight:800;margin-bottom:5px">Quem atende</div>'
    +'<div style="font-size:13.5px;color:var(--k-mut);margin-bottom:16px;max-width:62ch">'
    +'As pessoas que falam com os contatos. Serve para dizer de quem é cada retorno e cobrar depois. '
    +'Elas não ganham login separado — o acesso continua sendo um por empresa.</div>';
  if(!S.vendedores.length){
    h+='<div class="crm-vazio" style="text-align:left"><b>Ninguém cadastrado</b>'
      +'Sem vendedor, o retorno fica sem dono e ninguém é cobrado por ele.</div>';
  } else {
    h+=S.vendedores.map(function(v){
      return '<div class="crm-et" data-v="'+v.id+'">'
        +'<span class="crm-av" style="--av:'+E(avCor(v.name))+';width:30px;height:30px;border-radius:9px;font-size:11.5px">'+E(inicial(v.name))+'</span>'
        +'<input class="crm-inp" data-vnome="'+v.id+'" value="'+E(v.name)+'" style="flex:1"'+(podeEditar()?'':' disabled')+'>'
        +'<span class="crm-badge" style="background:var(--k-soft);color:var(--k-mut)">'+(usados[v.id]||0)+' contato(s)</span>'
        +(podeEditar()?'<button class="crm-mini" data-vsai="'+v.id+'" title="Tirar da equipe" style="color:var(--k-alerta)">✕</button>':'')
        +'</div>';
    }).join('');
  }
  if(podeEditar()){
    h+='<div style="display:flex;gap:8px;margin-top:12px">'
      +'<input class="crm-inp cresce" id="vNovo" placeholder="Nome de quem atende" style="flex:1">'
      +'<button class="crm-btn" id="vAdd">'+ICO.mais+'Adicionar</button>'
      +(S.vendedores.length?'<button class="crm-btn pri" id="vSalvar">Salvar nomes</button>':'')
      +'</div>';
  }
  h+=motivosHTML();
  h+=lembreteHTML();
  return h+'</div>';
}
function motivosHTML(){
  var h='<div style="border-top:1px solid var(--k-line);margin-top:26px;padding-top:22px">'
    +'<div style="font-size:15px;font-weight:800;margin-bottom:5px">Motivos de perda</div>'
    +'<div style="font-size:13.5px;color:var(--k-mut);margin-bottom:16px;max-width:62ch">'
    +'Quando um contato vai para Perdido, o portal pergunta o porquê usando esta lista. '
    +'É o que faz aparecer o padrão — se metade cai por preço, o problema não é o anúncio.</div>';
  if(!S.motivos.length){
    h+='<div class="crm-vazio" style="text-align:left"><b>Nenhum motivo cadastrado</b>'
      +'Sem lista, cada perda vira um texto solto e não sai relatório.</div>'
      +(podeEditar()?'<button class="crm-btn pri" id="mtPadrao" style="margin-top:10px">Usar a lista sugerida</button>':'');
  } else {
    h+=S.motivos.map(function(m){
      return '<div class="crm-et" data-mt="'+m.id+'">'
        +'<input class="crm-inp" data-mnome="'+m.id+'" value="'+E(m.nome)+'" style="flex:1"'+(podeEditar()?'':' disabled')+'>'
        +(podeEditar()?'<button class="crm-mini" data-msai="'+m.id+'" title="Tirar da lista" style="color:var(--k-alerta)">✕</button>':'')
        +'</div>';
    }).join('');
    if(podeEditar()){
      h+='<div style="display:flex;gap:8px;margin-top:12px">'
        +'<input class="crm-inp cresce" id="mtNovo" placeholder="Novo motivo" style="flex:1">'
        +'<button class="crm-btn" id="mtAdd">'+ICO.mais+'Adicionar</button>'
        +'<button class="crm-btn pri" id="mtSalvar">Salvar nomes</button></div>';
    }
  }
  return h+'</div>';
}
function ligarMotivos(box){
  var pd=document.getElementById('mtPadrao');
  if(pd) pd.onclick=async function(){
    pd.disabled=true;
    var r=await sb.rpc('crm_motivos_padrao',{p_client:S.cid});
    if(r.error){ pd.disabled=false; aviso('Não consegui: '+r.error.message); return; }
    await carregar(); pintar(); aviso(r.data+' motivos criados');
  };
  var add=document.getElementById('mtAdd');
  if(add) add.onclick=async function(){
    var campo=document.getElementById('mtNovo');
    var nome=(campo.value||'').trim();
    if(!nome){ aviso('Escreva o motivo'); return; }
    add.disabled=true;
    var ordem=(S.motivos.length?Math.max.apply(null,S.motivos.map(function(m){return m.ordem||0;})):0)+1;
    var r=await sb.from('crm_reasons').insert({client_id:S.cid, nome:nome, ordem:ordem, ativo:true});
    add.disabled=false;
    if(r.error){ aviso('Não consegui adicionar: '+r.error.message); return; }
    campo.value='';
    await carregar(); pintar();
  };
  var sv=document.getElementById('mtSalvar');
  if(sv) sv.onclick=async function(){
    sv.disabled=true; var falhas=0;
    var campos=box.querySelectorAll('input[data-mnome]');
    for(var i=0;i<campos.length;i++){
      var nome=campos[i].value.trim(); if(!nome) continue;
      var r=await sb.from('crm_reasons').update({nome:nome}).eq('id',campos[i].dataset.mnome);
      if(r.error) falhas++;
    }
    sv.disabled=false;
    await carregar(); pintar();
    aviso(falhas?'Algum motivo não salvou':'Motivos salvos');
  };
  box.querySelectorAll('[data-msai]').forEach(function(b){
    b.onclick=async function(){
      var m=S.motivos.find(function(x){ return x.id===b.dataset.msai; });
      if(!confirm('Tirar "'+(m?m.nome:'esse motivo')+'" da lista?\n\nAs perdas já registradas com ele continuam no relatório.')) return;
      b.disabled=true;
      var r=await sb.from('crm_reasons').update({ativo:false}).eq('id',b.dataset.msai);
      if(r.error){ b.disabled=false; aviso('Não consegui: '+r.error.message); return; }
      await carregar(); pintar();
    };
  });
}
function lembreteHTML(){
  if(!podeEditar()) return '';
  var lg=S.lembrete||{};
  var temFone=!!(lg.telefone||'').trim();
  return '<div style="border-top:1px solid var(--k-line);margin-top:26px;padding-top:22px">'
    +'<div style="font-size:15px;font-weight:800;margin-bottom:5px">Aviso no WhatsApp</div>'
    +'<div style="font-size:13.5px;color:var(--k-mut);max-width:62ch">'
    +'Quando um retorno chega na hora marcada, o robô da Wiz manda a lista no seu WhatsApp. '
    +'Vários retornos da mesma hora viram uma mensagem só.</div>'
    +'<div class="crm-sw"><div class="txt">'
      +'<div class="t">'+(lg.ligado?'Ligado':'Desligado')+'</div>'
      +'<div class="s">'+(temFone
          ? ('Vai para '+E(fone(lg.telefone))+'. Para trocar o número, fale com a Wiz.')
          : 'Não há WhatsApp cadastrado para este cliente — fale com a Wiz para cadastrar.')+'</div>'
    +'</div>'
    +'<button class="crm-btn '+(lg.ligado?'':'pri')+'" id="swLembrete"'+(temFone?'':' disabled')+'>'
      +(lg.ligado?'Desligar':'Ligar')+'</button></div></div>';
}
function ligarSwitch(){
  var b=document.getElementById('swLembrete'); if(!b) return;
  b.onclick=async function(){
    var ligar = !(S.lembrete&&S.lembrete.ligado);
    if(ligar && !confirm('Ligar o aviso no WhatsApp?\n\nA partir de agora, todo retorno que chegar na hora marcada vira uma mensagem no número cadastrado.')) return;
    b.disabled=true;
    var r=await sb.rpc('crm_lembrete_set',{p_client:S.cid, p_on:ligar});
    b.disabled=false;
    if(r.error){ aviso('Não consegui mudar: '+r.error.message); return; }
    S.lembrete = S.lembrete||{}; S.lembrete.ligado = ligar;
    pintarAjustes();
    aviso(ligar?'Aviso no WhatsApp ligado':'Aviso no WhatsApp desligado');
  };
}
function ligarVendedores(box){
  var add=document.getElementById('vAdd');
  if(add) add.onclick=async function(){
    var campo=document.getElementById('vNovo');
    var nome=(campo.value||'').trim();
    if(!nome){ aviso('Escreva o nome'); return; }
    add.disabled=true;
    var r=await sb.from('portal_client_members').insert({client_id:S.cid, name:nome, active:true});
    add.disabled=false;
    if(r.error){ aviso('Não consegui adicionar: '+r.error.message); return; }
    campo.value='';
    await carregar(); pintar(); aviso(nome+' entrou na equipe');
  };
  var sv=document.getElementById('vSalvar');
  if(sv) sv.onclick=async function(){
    sv.disabled=true; var falhas=0;
    var campos=box.querySelectorAll('input[data-vnome]');
    for(var i=0;i<campos.length;i++){
      var nome=campos[i].value.trim(); if(!nome) continue;
      var r=await sb.from('portal_client_members').update({name:nome}).eq('id',campos[i].dataset.vnome);
      if(r.error) falhas++;
    }
    sv.disabled=false;
    await carregar(); pintar();
    aviso(falhas?'Algum nome não salvou':'Nomes salvos');
  };
  box.querySelectorAll('[data-vsai]').forEach(function(b){
    b.onclick=async function(){
      var v=S.vendedores.find(function(x){ return x.id===b.dataset.vsai; });
      var quantos=S.contatos.filter(function(c){ return c.responsavel_id===b.dataset.vsai; }).length;
      var msg='Tirar '+(v?v.name:'essa pessoa')+' da equipe?';
      if(quantos) msg+='\n\n'+quantos+' contato(s) ficam sem responsável. O histórico não muda.';
      if(!confirm(msg)) return;
      b.disabled=true;
      var r=await sb.from('portal_client_members').update({active:false}).eq('id',b.dataset.vsai);
      if(r.error){ b.disabled=false; aviso('Não consegui: '+r.error.message); return; }
      await carregar(); pintar();
      aviso((v?v.name:'Pessoa')+' saiu da equipe', async function(){
        await sb.from('portal_client_members').update({active:true}).eq('id',b.dataset.vsai);
        await carregar(); pintar();
      });
    };
  });
}

function novaEtapa(){
  if(S.etapas.length>=8){ aviso('Máximo de 8 etapas no funil. Apague uma antes de criar outra.'); return; }
  var bg=abrirModal('<h3>Nova etapa</h3><div class="sub">Ela entra no fim do funil; depois é só usar as setas para mover.</div>'
    +'<div class="crm-campo"><label>Nome</label><input class="crm-inp" id="etNome" placeholder="Ex: Visita agendada" autofocus></div>'
    +'<div class="crm-campo"><label>Tipo</label><select class="crm-inp" id="etTipo">'
      +'<option value="aberto">Em aberto — o contato ainda está andando</option>'
      +'<option value="ganho">Fecha como ganho</option>'
      +'<option value="perdido">Fecha como perdido</option></select></div>'
    +'<div class="crm-campo"><label>Cor</label><input class="crm-inp" type="color" id="etCor" value="#7c5cff"></div>'
    +'<div style="display:flex;gap:8px"><button class="crm-btn" id="etCancelar" style="flex:1">Cancelar</button>'
    +'<button class="crm-btn pri" id="etOk" style="flex:1">Criar</button></div>');
  bg.querySelector('#etCancelar').onclick=bg.fechar;
  bg.querySelector('#etOk').onclick=async function(){
    var nome=(bg.querySelector('#etNome').value||'').trim();
    if(!nome){ aviso('Falta o nome da etapa'); return; }
    var b=bg.querySelector('#etOk'); b.disabled=true;
    var ordem=(S.etapas.length?Math.max.apply(null,S.etapas.map(function(e){return e.ordem;})):0)+1;
    var r=await sb.from('crm_stages').insert({client_id:S.cid, nome:nome, ordem:ordem,
      cor:bg.querySelector('#etCor').value, tipo:bg.querySelector('#etTipo').value});
    b.disabled=false;
    if(r.error){ aviso('Não consegui criar: '+r.error.message); return; }
    bg.fechar(); await carregar(); pintar(); aviso('Etapa "'+nome+'" criada');
  };
}

function apagarEtapa(id){
  var e=S.etapas.find(function(x){return x.id===id;}); if(!e) return;
  var quantos=S.contatos.filter(function(c){ return c.stage_id===id; }).length;
  var outras=S.etapas.filter(function(x){ return x.id!==id; });
  if(!outras.length){ aviso('O funil precisa de pelo menos uma etapa'); return; }
  var opts=outras.map(function(x){ return '<option value="'+x.id+'">'+E(x.nome)+'</option>'; }).join('');
  var bg=abrirModal('<h3>Apagar "'+E(e.nome)+'"</h3>'
    +'<div class="sub">'+(quantos
        ? 'Essa etapa tem <b>'+quantos+'</b> contato(s). Escolha para onde eles vão — ninguém se perde.'
        : 'Não há contatos nessa etapa.')+'</div>'
    +(quantos?'<div class="crm-campo"><label>Mover os contatos para</label>'
      +'<select class="crm-inp" id="apDestino">'+opts+'</select></div>':'')
    +'<div style="display:flex;gap:8px"><button class="crm-btn" id="apCancelar" style="flex:1">Cancelar</button>'
    +'<button class="crm-btn perigo" id="apOk" style="flex:1">Apagar etapa</button></div>');
  bg.querySelector('#apCancelar').onclick=bg.fechar;
  bg.querySelector('#apOk').onclick=async function(){
    var b=bg.querySelector('#apOk'); b.disabled=true;
    var dest=quantos?bg.querySelector('#apDestino').value:null;
    var r=await sb.rpc('crm_apagar_etapa',{p_etapa:id, p_destino:dest});
    b.disabled=false;
    if(r.error){ aviso('Não consegui apagar: '+r.error.message); return; }
    bg.fechar(); await carregar(); pintar();
    aviso('Etapa apagada'+(quantos?' e '+quantos+' contato(s) movidos':''));
  };
}

/* ---------- cabecalho ---------- */
function kpisHTML(){
  var _dd=S.diasResult||90; var _lim=Date.now()-_dd*86400000;
  var _base=S.contatos.filter(function(c){ return c.entrou_em && new Date(c.entrou_em).getTime()>=_lim; });
  var total=_base.length;
  var ganhos=_base.filter(function(c){ var e=etapaDe(c); return e&&e.tipo==='ganho'; }).length;
  var atrasadas=contaAtrasadas();
  var fecha = total? Math.round(ganhos/total*1000)/10 : 0;
  var corAtraso = atrasadas? '#d1495b' : '#7c8698';
  return '<div class="rep-kpis csec" id="crmKpis" style="margin-top:0">'
    +'<div class="rep-kpi crm-kpi" style="--kc:#3b5bdb"><div class="l">Contatos</div><div class="v">'+total+(S.temMais?'+':'')+'</div></div>'
    +'<div class="rep-kpi crm-kpi" style="--kc:#12b886"><div class="l">Ganhos</div><div class="v">'+ganhos+'</div></div>'
    +'<div class="rep-kpi crm-kpi" style="--kc:#7c5cff"><div class="l">Taxa de fechamento</div><div class="v">'
      +String(fecha).replace('.',',')+'%</div></div>'
    +'<div class="rep-kpi crm-kpi" style="--kc:'+corAtraso+'"><div class="l">Retornos atrasados</div><div class="v">'+atrasadas+'</div></div>'
    +'</div>';
}
function montarCabecalho(){
  var k=document.getElementById('crmKpis');
  if(k) k.outerHTML=kpisHTML();
  var tab=document.querySelector('.crm-tab[data-a="hoje"]');
  if(tab){
    var n=contaHoje(), c=tab.querySelector('.cnt');
    if(n){ if(c) c.textContent=n; else tab.insertAdjacentHTML('beforeend','<span class="cnt">'+n+'</span>'); }
    else if(c) c.remove();
  }
}

/* ---------- montagem ---------- */
function pintar(){
  if(S.aba==='funil') pintarFunil();
  else if(S.aba==='hoje') pintarHoje();
  else if(S.aba==='result') pintarResultados();
  else if(S.aba==='lista') pintarLista();
  else pintarAjustes();
}

async function renderCRM(box, ctx){
  estilo();
  if(ctx){ S.cliente=ctx.cliente||null; S.admin=!!ctx.admin; S.leitura=!!ctx.somenteLeitura; S.ads=ctx.ads||null; S.diasResult=ctx.dias||(ctx.ads&&ctx.ads.dias)||90; }
  box.innerHTML='<div class="card"><div class="rep-empty">Carregando o funil…</div></div>';
  var erro = await carregar();
  if(erro){ box.innerHTML='<div class="card"><div class="rep-empty">Não consegui abrir o CRM: '+E(erro.message||'')+'</div></div>'; return; }

  var abas=[['funil','Funil'],['hoje','Hoje'],['lista','Contatos'],['result','Resultados'],['ajustes','Ajustes']];
  var h=kpisHTML();
  h+='<div class="card csec crm"><div class="crm-topo"><div class="crm-tabs" id="crmTabs">'
    + abas.map(function(a){
        var n = a[0]==='hoje' ? contaHoje() : 0;
        return '<button class="crm-tab'+(S.aba===a[0]?' on':'')+'" data-a="'+a[0]+'">'+a[1]
          + (n?'<span class="cnt">'+n+'</span>':'') + '</button>'; }).join('')
    +'</div></div><div id="crmPainel"></div></div>';
  box.innerHTML=h;

  function montarPainel(){
    var p=document.getElementById('crmPainel'); if(!p) return;
    if(S.aba==='hoje'){
      p.innerHTML='<div class="crm-hoje" id="crmHoje"></div>';
    }
    else if(S.aba==='result'){
      p.innerHTML='<div id="crmResult"><div class="crm-vazio">Somando…</div></div>';
    }
    else if(S.aba==='funil'){
      p.innerHTML='<div class="crm-board" id="crmBoard"></div>'
        +'<div style="font-size:12.5px;color:var(--k-mut);margin-top:8px">'
        +(podeEditar()?'Arraste o cartão para mudar de etapa, ou toque para abrir a ficha.':'Toque no cartão para abrir a ficha.')+'</div>';
    }
    else if(S.aba==='lista'){
      var opt='<option value="">Todas as etapas</option>'+S.etapas.map(function(e){
        return '<option value="'+e.id+'"'+(S.filtro===e.id?' selected':'')+'>'+E(e.nome)+'</option>'; }).join('');
      p.innerHTML='<div class="crm-bar">'
        +'<input class="crm-inp cresce" id="crmBusca" placeholder="Buscar por nome, telefone, e-mail ou cidade" value="'+E(S.busca)+'">'
        +'<select class="crm-inp" id="crmFiltro">'+opt+'</select>'
        +(S.vendedores.length?'<select class="crm-inp" id="crmDono"><option value="">Todos os responsáveis</option>'
          +'<option value="__sem__"'+(S.dono==='__sem__'?' selected':'')+'>Sem responsável</option>'
          +S.vendedores.map(function(v){ return '<option value="'+v.id+'"'+(S.dono===v.id?' selected':'')+'>'+E(v.name)+'</option>'; }).join('')
          +'</select>':'')
        +(podeEditar()?'<button class="crm-btn pri" id="crmNovo">'+ICO.mais+'Novo contato</button>'
          +'<button class="crm-btn" id="crmImp">Importar planilha</button>':'')
        +'<button class="crm-btn" id="crmExp">Exportar CSV</button>'
        +'<button class="crm-btn" id="crmArq">'+(S.verArquivados?'Ver ativos':'Ver arquivados')+'</button>'
        +'</div><div id="crmConta" style="font-size:12.5px;color:var(--k-mut);margin-bottom:10px"></div>'
        +'<div class="crm-lista" id="crmLista"></div>';
      var bu=document.getElementById('crmBusca');
      bu.oninput=function(){ S.busca=bu.value; pintarLista(); };
      document.getElementById('crmFiltro').onchange=function(e){ S.filtro=e.target.value; pintarLista(); };
      var sd=document.getElementById('crmDono');
      if(sd) sd.onchange=function(e){ S.dono=e.target.value; pintarLista(); };
      var nv=document.getElementById('crmNovo'); if(nv) nv.onclick=novoContato;
      var im=document.getElementById('crmImp'); if(im) im.onclick=importar;
      var ex=document.getElementById('crmExp'); if(ex) ex.onclick=exportar;
      var ar=document.getElementById('crmArq');
      if(ar) ar.onclick=async function(){
        ar.disabled=true; S.verArquivados=!S.verArquivados; S.limite=400;
        await carregar(); montarPainel();
      };
    }
    else { p.innerHTML='<div id="crmAjustes"></div>'; }
    pintar();
  }

  box.querySelectorAll('.crm-tab').forEach(function(b){
    b.onclick=async function(){
      var voltando = S.verArquivados && b.dataset.a!=='lista';
      S.aba=b.dataset.a;
      box.querySelectorAll('.crm-tab').forEach(function(x){ x.classList.toggle('on', x===b); });
      if(voltando){ S.verArquivados=false; await carregar(); }
      montarPainel(); };
  });
  montarPainel();
}

window.renderCRM = renderCRM;
})();
