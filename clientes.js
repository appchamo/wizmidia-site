/* ===========================================================
   ABA CLIENTES — base de clientes de ecommerce
   Uso:  window.renderClientes(box, {cliente:CLIENT_ID, admin:true})
   Fala com a edge function ec-clientes.
   =========================================================== */
(function(){
'use strict';

var S = {
  cliente:'', nomeLoja:'', admin:false, box:null,
  aba:'lista',
  itens:[], total:0, pagina:0, porPagina:50,
  busca:'', ordem:'ultima', filtros:{},
  resumo:null, segmentos:[], carregando:false,
  campanhas:[],
  nuvem:null,                    // {conectado:bool, store_name}
  csv:null                       // {cabecalho:[], linhas:[[]], mapa:{}}
};

/* ---------- utilidades ---------- */
function esc(t){ return (t==null?'':String(t)).replace(/[&<>"]/g,function(m){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; }); }
function dinheiro(v){
  var n=Number(v)||0;
  return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function numero(v){ return (Number(v)||0).toLocaleString('pt-BR'); }
function dias(iso){
  if(!iso) return null;
  return Math.floor((Date.now()-Date.parse(iso))/86400000);
}
function quando(iso){
  if(!iso) return '—';
  var d=dias(iso);
  if(d===0) return 'hoje';
  if(d===1) return 'ontem';
  if(d<30) return d+' dias';
  if(d<365){ var m=Math.floor(d/30); return m+(m===1?' mês':' meses'); }
  var a=Math.floor(d/365);
  return a+(a===1?' ano':' anos');
}
function dataBR(iso){
  if(!iso) return '—';
  try{ return new Date(iso).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'}); }
  catch(e){ return '—'; }
}
function foneBonito(f){
  var d=String(f||'').replace(/\D/g,'');
  if(d.length===13) d=d.slice(2);
  if(d.length===11) return '('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7);
  if(d.length===10) return '('+d.slice(0,2)+') '+d.slice(2,6)+'-'+d.slice(6);
  return f||'—';
}
function iniciais(n){
  n=(n||'?').trim(); var p=n.split(/\s+/);
  return ((p[0]||'?')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase();
}
var COR=[['#d6e9ff','#2f6bd8'],['#ffe0d6','#d8592f'],['#e2d6ff','#6b2fd8'],['#d6fff0','#12876b'],
         ['#fff0d6','#b57d16'],['#ffd6ea','#c22f7a'],['#d6f5ff','#1785a3'],['#e9ffd6','#4a8a12']];
function corDe(s){ var h=0,n=(s||'?'); for(var i=0;i<n.length;i++) h=(h*31+n.charCodeAt(i))>>>0; return COR[h%COR.length]; }

/* toast simples, reaproveita o do portal se existir */
function aviso(txt,tipo){
  if(window.toast){ try{ return window.toast(txt,tipo); }catch(e){} }
  var el=document.createElement('div');
  el.className='ec-toast'+(tipo==='erro'?' erro':'');
  el.textContent=txt;
  document.body.appendChild(el);
  setTimeout(function(){ el.classList.add('sai'); setTimeout(function(){ el.remove(); },300); },3500);
}

/* ---------- chamada da API ---------- */
/* o portal declara SUPA_URL, SUPA_KEY e sb com "const" no topo do script.
   const no topo NAO vira window.X — so da pra alcancar pelo nome, com typeof. */
function global(nome){
  try{ var v = (0,eval)('typeof '+nome+'!=="undefined" ? '+nome+' : undefined'); return v; }
  catch(e){ return undefined; }
}
function clienteSupabase(){
  return global('sb') || global('supa') || global('supabaseClient') ||
         window.sb || window.supabaseClient || null;
}
async function api(corpo, slug){
  slug = slug || 'ec-clientes';
  var token='', url='', chave='';
  var cli=null;
  try{
    cli = clienteSupabase();
    if(cli && cli.auth && cli.auth.getSession){
      var ses = await cli.auth.getSession();
      token = (ses && ses.data && ses.data.session && ses.data.session.access_token) || '';
    }
  }catch(e){}
  try{
    url   = global('SUPA_URL') || global('SUPABASE_URL') || window.SUPA_URL || window.SUPABASE_URL
            || (cli && (cli.supabaseUrl || cli.restUrl)) || '';
    chave = global('SUPA_KEY') || global('SUPABASE_KEY') || window.SUPA_KEY || window.SUPABASE_KEY
            || (cli && (cli.supabaseKey || cli.anonKey)) || '';
  }catch(e){}
  if(url) url=String(url).replace(/\/rest\/v1\/?$/,'');
  if(!url) return {error:'não achei a conexão do Supabase nesta página — recarrega a página; se continuar, me avisa'};
  try{
    var r = await fetch(url.replace(/\/$/,'')+'/functions/v1/'+slug,{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':chave,'Authorization':'Bearer '+token},
      body:JSON.stringify(corpo)
    });
    var j = await r.json();
    if(r.status===401) return {error:'sua sessão expirou ou você não é admin — faz login de novo'};
    return j;
  }catch(e){ return {error:String(e && e.message || e)}; }
}
/* atalho pro motor de disparo */
function apiD(corpo){ return api(corpo,'ec-disparo'); }
/* atalho pro sync Nuvemshop */
function apiN(corpo){ return api(corpo,'ec-nuvem'); }

/* ===========================================================
   CSV — leitura no navegador
   =========================================================== */
/* separa respeitando aspas: a;"b;c";d  ->  [a, b;c, d] */
function lerCSV(texto){
  texto = texto.replace(/^﻿/,'');                 // tira o BOM
  var sep = detectaSep(texto);
  var linhas=[], campo='', linha=[], dentro=false;
  for(var i=0;i<texto.length;i++){
    var c=texto[i], prox=texto[i+1];
    if(dentro){
      if(c==='"' && prox==='"'){ campo+='"'; i++; }
      else if(c==='"'){ dentro=false; }
      else campo+=c;
    }else{
      if(c==='"'){ dentro=true; }
      else if(c===sep){ linha.push(campo); campo=''; }
      else if(c==='\n'){ linha.push(campo); linhas.push(linha); linha=[]; campo=''; }
      else if(c==='\r'){ /* ignora */ }
      else campo+=c;
    }
  }
  if(campo!=='' || linha.length){ linha.push(campo); linhas.push(linha); }
  linhas = linhas.filter(function(l){ return l.some(function(x){ return String(x).trim()!==''; }); });
  return linhas;
}
function detectaSep(t){
  var amostra=t.split('\n').slice(0,5).join('\n');
  var cand=[';',',','\t','|'], melhor=';', max=-1;
  cand.forEach(function(s){
    var n=(amostra.split(s).length-1);
    if(n>max){ max=n; melhor=s; }
  });
  return melhor;
}
/* a Tray costuma exportar em ISO-8859-1; detecta e relê se vier torto */
function leArquivo(file){
  return new Promise(function(ok,falha){
    var fr=new FileReader();
    fr.onerror=function(){ falha(new Error('não consegui ler o arquivo')); };
    fr.onload=function(){
      var buf=fr.result;
      var txt=new TextDecoder('utf-8').decode(buf);
      if(txt.indexOf('�')>=0){                    // caractere quebrado = não era UTF-8
        try{ txt=new TextDecoder('iso-8859-1').decode(buf); }catch(e){}
      }
      ok(txt);
    };
    fr.readAsArrayBuffer(file);
  });
}

/* de-para de colunas: aceita os nomes que a Tray e as outras plataformas usam */
// obs: os aliases sao comparados JA normalizados (achata): minusculo, sem acento,
// hifen/pontuacao viram espaco. Por isso 'e mail' e nao 'e-mail'.
var CAMPOS=[
  // --- identificacao da pessoa ---
  {k:'nome',       rot:'Nome',            alias:['nome','name','cliente','nome cliente','nome do cliente','nome completo','comprador','razao social','destinatario','nome do comprador']},
  {k:'email',      rot:'E-mail',          alias:['email','e mail','mail','email do cliente','e mail do cliente','email cliente']},
  {k:'telefone',   rot:'Telefone',        alias:['telefone','celular','fone','whatsapp','tel','telefone celular','celular cliente','telefone cliente','telefone principal','telefone 2','telefone 1','celular 2','fone 2','telefone secundario','telefone comercial','telefone residencial','contato','ddd telefone']},
  {k:'cpf_cnpj',   rot:'CPF/CNPJ',        alias:['cpf','cnpj','cpf cnpj','documento','doc']},
  {k:'cidade',     rot:'Cidade',          alias:['cidade','city','municipio']},
  {k:'uf',         rot:'UF',              alias:['uf','estado','state']},
  {k:'externo_id', rot:'ID do cliente',   alias:['id','codigo','codigo cliente','id do cliente','codigo do cliente','id cliente','cliente id','customer id']},
  // --- resumo do cliente (planilha de CLIENTES da Tray ja traz pronto) ---
  {k:'pedidos_qtd',   rot:'Qtd. de pedidos',   alias:['total pedidos','total de pedidos','quantidade de pedidos','qtd pedidos','qtde pedidos','numero de pedidos','n pedidos','pedidos realizados','total de compras','numero de compras','compras']},
  {k:'ultima_compra', rot:'Última compra',     alias:['ultima compra','data ultima compra','ultima compra em','compra mais recente']},
  {k:'primeira_compra',rot:'Primeira compra',  alias:['primeira compra','data primeira compra','primeira compra em']},
  {k:'total_gasto',   rot:'Total gasto (R$)',  alias:['total gasto','valor gasto','total comprado','valor total gasto','total investido','ltv']},
  {k:'opt_email',     rot:'Aceita e-mail / newsletter', alias:['newsletter','aceita newsletter','assina newsletter','recebe newsletter','aceita email','recebe email','email marketing','opt in','optin']},
  // --- linha de PEDIDO (planilha de pedidos da Tray) ---
  {k:'pedido_id',  rot:'Nº do pedido',    alias:['pedido','numero do pedido','id do pedido','n do pedido','order','order id','codigo do pedido','id pedido']},
  {k:'valor',      rot:'Valor do pedido', alias:['valor','total','valor total','total do pedido','valor do pedido','valor pedido','total geral','vl total','vl pedido','preco total','valor pago','total pago']},
  {k:'data_pedido',rot:'Data do pedido',  alias:['data do pedido','data pedido','data de criacao','criado em','data compra','data da compra','date','data pedido em']},
  {k:'situacao',   rot:'Situação',        alias:['situacao','status','status do pedido','status pedido','situacao do pedido','situacao pedido']},
  {k:'itens',      rot:'Qtd. de itens',   alias:['itens','quantidade','qtd','qtde','quantidade de itens','n itens']}
];
function achata(s){
  return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
}
/* tenta casar cada coluna da planilha com um campo nosso */
function adivinhaMapa(cabecalho){
  var mapa={}, usados={};
  CAMPOS.forEach(function(c){
    for(var i=0;i<cabecalho.length;i++){
      if(usados[i]) continue;
      var h=achata(cabecalho[i]);
      if(c.alias.indexOf(h)>=0){ mapa[c.k]=i; usados[i]=1; return; }
    }
    // segunda passada: aceita "contém"
    for(var j=0;j<cabecalho.length;j++){
      if(usados[j]) continue;
      var h2=achata(cabecalho[j]);
      for(var a=0;a<c.alias.length;a++){
        if(c.alias[a].length>=4 && h2.indexOf(c.alias[a])>=0){ mapa[c.k]=j; usados[j]=1; return; }
      }
    }
  });
  return mapa;
}
/* na Tray o telefone bom as vezes cai em "Telefone 2" e a "Telefone principal" vem vazia.
   Depois de adivinhar, olho as colunas de telefone e fico com a que tem mais dado preenchido. */
function ajustaTelefone(mapa, cabecalho, linhas){
  var chaves=['telefone','celular','fone','whatsapp','tel'];
  var cands=[];
  for(var i=0;i<cabecalho.length;i++){
    var h=achata(cabecalho[i]);
    var bate=chaves.some(function(k){ return h.indexOf(k)>=0; });
    if(!bate) continue;
    // nao rouba coluna ja usada por outro campo (ex.: nao mexe em nada que nao seja telefone)
    var usadaPorOutro=Object.keys(mapa).some(function(k){ return k!=='telefone' && mapa[k]===i; });
    if(usadaPorOutro) continue;
    var amostra=linhas.slice(0,300), cheias=0;
    for(var r=0;r<amostra.length;r++){
      var v=String(amostra[r][i]==null?'':amostra[r][i]).replace(/\D/g,'');
      if(v.length>=8) cheias++;
    }
    cands.push({i:i, cheias:cheias});
  }
  if(!cands.length) return mapa;
  cands.sort(function(a,b){ return b.cheias-a.cheias; });
  var melhor=cands[0];
  if(melhor.cheias>0 && mapa.telefone!==melhor.i){
    var atual = mapa.telefone!=null ? (cands.filter(function(c){return c.i===mapa.telefone;})[0]||{cheias:0}).cheias : 0;
    // troca se a atual esta vazia/fraca e a melhor tem bem mais dado
    if(melhor.cheias >= atual*2 || (mapa.telefone==null)) mapa.telefone=melhor.i;
  }
  return mapa;
}

/* ===========================================================
   TELA
   =========================================================== */
function css(){
  if(document.getElementById('ec-css')) return;
  var s=document.createElement('style'); s.id='ec-css';
  s.textContent = ''
+'.ec{--v:#00a884;--l:#e9edef;--t:#111b21;--m:#667781;font-family:inherit;color:var(--t);color-scheme:light}'
+'.ec *{box-sizing:border-box}'
/* o portal roda em color-scheme dark: sem isso o navegador pinta o texto dos campos de claro
   e some com tudo em cima do fundo branco */
+'.ec-modal{color-scheme:light}'
+'.ec select,.ec input,.ec textarea,.ec-modal select,.ec-modal input,.ec-modal textarea{'
+'color:#111b21;-webkit-text-fill-color:#111b21;background-color:#fff;opacity:1}'
+'.ec option,.ec-modal option{color:#111b21;background-color:#fff}'
+'.ec input::placeholder,.ec-modal input::placeholder{color:#8696a0;-webkit-text-fill-color:#8696a0;opacity:1}'
+'.ec-busca input{background-color:transparent}'
+'.ec-topo{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}'
+'.ec-topo h2{margin:0;font-size:20px;font-weight:700;letter-spacing:-.2px}'
+'.ec-topo .sub{color:var(--m);font-size:13px}'
+'.ec-topo .dir{margin-left:auto;display:flex;gap:8px}'
+'.ec-bt{border:1px solid var(--l);background:#fff;color:var(--t);border-radius:8px;padding:8px 14px;'
+'font-size:13.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;font-family:inherit}'
+'.ec-bt:hover{background:#f5f6f6}'
+'.ec-bt.pri{background:var(--v);border-color:var(--v);color:#fff}'
+'.ec-bt.pri:hover{background:#019273}'
+'.ec-bt:disabled{opacity:.5;cursor:default}'
+'.ec-bt svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
/* KPIs */
+'.ec-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px}'
+'.ec-kpi{background:#fff;border:1px solid var(--l);border-radius:10px;padding:13px 15px}'
+'.ec-kpi .r{font-size:11.5px;color:var(--m);font-weight:600;text-transform:uppercase;letter-spacing:.03em}'
+'.ec-kpi .v{font-size:23px;font-weight:700;margin-top:3px;letter-spacing:-.5px}'
+'.ec-kpi .p{font-size:11.5px;color:var(--m);margin-top:1px}'
+'.ec-kpi.dest .v{color:var(--v)}'
+'.ec-kpi.alerta .v{color:#c1121f}'
/* abas */
+'.ec-abas{display:flex;gap:5px;border-bottom:1px solid var(--l);margin-bottom:14px}'
+'.ec-aba{padding:9px 15px;font-size:13.5px;font-weight:600;color:var(--m);background:none;border:0;'
+'border-bottom:2px solid transparent;cursor:pointer;margin-bottom:-1px;font-family:inherit}'
+'.ec-aba.on{color:var(--v);border-bottom-color:var(--v)}'
/* filtros */
+'.ec-filtros{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}'
+'.ec-busca{flex:1;min-width:200px;display:flex;align-items:center;gap:9px;background:#f5f6f6;'
+'border-radius:8px;padding:0 13px;height:38px}'
+'.ec-busca svg{width:16px;height:16px;fill:none;stroke:var(--m);stroke-width:2;flex:none}'
+'.ec-busca input{flex:1;background:none;border:0;outline:0;font-size:14px;color:var(--t);font-family:inherit;height:100%}'
+'.ec-sel{height:38px;border:1px solid var(--l);border-radius:8px;padding:0 10px;font-size:13.5px;'
+'background:#fff;color:var(--t);font-family:inherit;cursor:pointer}'
+'.ec-chips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}'
+'.ec-chip{font-size:12.5px;font-weight:600;padding:6px 12px;border-radius:16px;background:#f0f2f5;'
+'color:#3b4a54;border:0;cursor:pointer;font-family:inherit}'
+'.ec-chip:hover{background:#e6e9ec}'
+'.ec-chip.on{background:#d9fdd3;color:#02735e}'
+'.ec-chip .n{opacity:.7;margin-left:5px;font-weight:700}'
/* tabela */
+'.ec-tab{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--l);border-radius:10px;overflow:hidden}'
+'.ec-tab th{text-align:left;font-size:11.5px;font-weight:700;color:var(--m);text-transform:uppercase;'
+'letter-spacing:.03em;padding:11px 13px;border-bottom:1px solid var(--l);background:#fafafa;white-space:nowrap}'
+'.ec-tab td{padding:11px 13px;border-bottom:1px solid #f2f4f5;font-size:13.5px;vertical-align:middle}'
+'.ec-tab tr:last-child td{border-bottom:0}'
+'.ec-tab tbody tr{cursor:pointer}'
+'.ec-tab tbody tr:hover{background:#f7f9f9}'
+'.ec-pessoa{display:flex;align-items:center;gap:10px;min-width:0}'
+'.ec-av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;'
+'font-size:12px;font-weight:700;flex:none}'
+'.ec-pessoa .n{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
+'.ec-pessoa .e{font-size:12px;color:var(--m);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
+'.ec-num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}'
+'.ec-tag{display:inline-block;font-size:11px;font-weight:700;padding:2px 7px;border-radius:5px;white-space:nowrap}'
+'.ec-tag.frio{background:#fdecea;color:#c1121f}'
+'.ec-tag.morno{background:#fff4e0;color:#b06f00}'
+'.ec-tag.quente{background:#e4f7ed;color:#0d7a4a}'
+'.ec-tag.novo{background:#eef2ff;color:#3b4ac4}'
+'.ec-canais{display:flex;gap:5px}'
+'.ec-canais span{width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}'
+'.ec-canais .wa{background:#e4f7ed;color:#0d7a4a}'
+'.ec-canais .em{background:#eef2ff;color:#3b4ac4}'
+'.ec-canais .off{background:#f0f2f5;color:#b7c0c5}'
/* paginacao */
+'.ec-pag{display:flex;align-items:center;gap:10px;justify-content:flex-end;margin-top:12px;font-size:13px;color:var(--m)}'
/* vazio */
+'.ec-vazio{background:#fff;border:1px dashed var(--l);border-radius:12px;padding:44px 30px;text-align:center}'
+'.ec-vazio h3{margin:0 0 7px;font-size:17px;font-weight:700}'
+'.ec-vazio p{margin:0 auto 18px;font-size:13.5px;color:var(--m);max-width:440px;line-height:1.6}'
/* modal */
+'.ec-modal{position:fixed;inset:0;background:rgba(11,20,26,.45);display:flex;align-items:center;'
+'justify-content:center;padding:24px;z-index:9999}'
+'.ec-cx{background:#fff;border-radius:14px;max-width:820px;width:100%;max-height:88vh;overflow:auto;'
+'box-shadow:0 20px 60px rgba(0,0,0,.25)}'
+'.ec-cx .cab{display:flex;align-items:center;gap:12px;padding:18px 22px;border-bottom:1px solid var(--l);'
+'position:sticky;top:0;background:#fff;z-index:1}'
+'.ec-cx .cab h3{margin:0;font-size:17px;font-weight:700;flex:1}'
+'.ec-cx .cab .x{width:32px;height:32px;border-radius:50%;border:0;background:#f0f2f5;cursor:pointer;'
+'font-size:17px;color:var(--m);line-height:1}'
+'.ec-cx .corpo{padding:20px 22px}'
+'.ec-cx .rodape{padding:14px 22px;border-top:1px solid var(--l);display:flex;gap:9px;justify-content:flex-end;'
+'position:sticky;bottom:0;background:#fff}'
/* importacao */
+'.ec-solta{border:2px dashed var(--l);border-radius:12px;padding:34px;text-align:center;cursor:pointer;transition:.15s}'
+'.ec-solta:hover,.ec-solta.sobre{border-color:var(--v);background:#f2fbf8}'
+'.ec-solta p{margin:8px 0 0;font-size:13px;color:var(--m)}'
+'.ec-mapa{display:grid;grid-template-columns:1fr 1fr;gap:9px 14px;margin-top:6px}'
+'.ec-mapa label{font-size:12.5px;font-weight:600;color:var(--m);display:block;margin-bottom:3px}'
+'.ec-mapa select{width:100%;height:36px;border:1px solid var(--l);border-radius:7px;padding:0 8px;'
+'font-size:13px;background:#fff;font-family:inherit}'
+'.ec-mapa .achou select{border-color:#a8e0cd;background:#f7fdfb}'
+'.ec-previa{margin-top:16px;overflow-x:auto;border:1px solid var(--l);border-radius:9px}'
+'.ec-previa table{border-collapse:collapse;font-size:12px;width:100%}'
+'.ec-previa th{background:#fafafa;padding:7px 10px;text-align:left;font-weight:700;color:var(--m);'
+'border-bottom:1px solid var(--l);white-space:nowrap}'
+'.ec-previa td{padding:6px 10px;border-bottom:1px solid #f2f4f5;white-space:nowrap;max-width:200px;'
+'overflow:hidden;text-overflow:ellipsis}'
+'.ec-barra{height:7px;background:#f0f2f5;border-radius:4px;overflow:hidden;margin:14px 0 8px}'
+'.ec-barra i{display:block;height:100%;background:var(--v);transition:width .25s}'
/* ficha */
+'.ec-ficha-topo{display:flex;gap:14px;align-items:center;margin-bottom:18px}'
+'.ec-ficha-topo .ec-av{width:52px;height:52px;font-size:17px}'
+'.ec-ficha-topo .nm{font-size:19px;font-weight:700}'
+'.ec-ficha-topo .ct{font-size:13px;color:var(--m);margin-top:2px}'
+'.ec-mini{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:9px;margin-bottom:18px}'
+'.ec-mini div{background:#f7f9f9;border-radius:9px;padding:11px 13px}'
+'.ec-mini .r{font-size:11px;color:var(--m);font-weight:600;text-transform:uppercase}'
+'.ec-mini .v{font-size:17px;font-weight:700;margin-top:2px}'
/* segmentos */
+'.ec-segs{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:11px}'
+'.ec-seg{background:#fff;border:1px solid var(--l);border-radius:11px;padding:14px 15px;cursor:pointer;position:relative}'
+'.ec-seg:hover{border-color:#c8d0d4}'
+'.ec-seg .n{font-weight:700;font-size:14.5px;margin-bottom:3px;padding-right:22px}'
+'.ec-seg .q{font-size:22px;font-weight:700;color:var(--v);letter-spacing:-.5px}'
+'.ec-seg .d{font-size:12px;color:var(--m);margin-top:2px;line-height:1.45}'
+'.ec-seg .lixo{position:absolute;top:10px;right:10px;border:0;background:none;color:#b7c0c5;cursor:pointer;'
+'font-size:15px;padding:2px 5px;border-radius:5px;line-height:1}'
+'.ec-seg .lixo:hover{background:#fdecea;color:#c1121f}'
+'.ec-seg.novo{border-style:dashed;display:flex;align-items:center;justify-content:center;color:var(--m);'
+'font-weight:600;font-size:13.5px;min-height:104px}'
/* toast */
+'.ec-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#111b21;color:#fff;'
+'padding:12px 20px;border-radius:9px;font-size:13.5px;z-index:10000;box-shadow:0 8px 24px rgba(0,0,0,.25);'
+'max-width:90vw;transition:opacity .3s}'
+'.ec-toast.erro{background:#c1121f}'
+'.ec-toast.sai{opacity:0}'
/* disparo */
+'.ec-bt.disp{background:#00a884;border-color:#00a884;color:#fff}'
+'.ec-bt.disp:hover{background:#019c7c;border-color:#019c7c}'
+'.ec-bt.disp svg{stroke:#fff}'
+'.ec-bt.nuvem{background:#2d6cdf;border-color:#2d6cdf;color:#fff}'
+'.ec-bt.nuvem:hover{background:#245bc0;border-color:#245bc0}'
+'.ec-bt.nuvem svg{stroke:#fff}'
+'.ec-barra.ind{position:relative}'
+'.ec-barra.ind i{position:absolute;width:40%;left:-40%;background:var(--v);animation:ecslide 1.1s infinite ease-in-out}'
+'@keyframes ecslide{0%{left:-40%}100%{left:100%}}'
+'.ec-bt.disp.mini{margin-top:10px;padding:5px 10px;font-size:12px;width:100%;justify-content:center}'
+'.ec-dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;background:#f7f9fa;border:1px solid var(--l);'
+'border-radius:10px;padding:12px 14px;margin:2px 0 14px;font-size:13.5px}'
+'.ec-dl span{color:var(--m)}.ec-dl b{color:#111b21;text-align:right}'
+'.ec-alerta{background:#fff8e6;border:1px solid #ffe08a;border-radius:9px;padding:12px 14px;'
+'font-size:13px;color:#7a5b00;line-height:1.5;margin:0 0 14px}'
+'.ec-lb{display:block;font-size:12.5px;font-weight:600;color:var(--m);margin:12px 0 6px}'
+'.ec-canais{display:flex;gap:8px;margin-bottom:4px}'
+'.ec-canal{border:1px solid var(--l);background:#fff;border-radius:8px;padding:8px 14px;font-size:13px;'
+'font-weight:600;color:#111b21;cursor:pointer}'
+'.ec-canal.on{border-color:#00a884;background:#e7f7f2;color:#017a5e}'
+'.ec-canal.off{opacity:.5;cursor:not-allowed}'
+'.ec-vazio{background:#f7f9fa;border:1px dashed var(--l);border-radius:9px;padding:14px;font-size:13px;color:var(--m);line-height:1.5}'
+'.ec-tplview{margin-top:10px}'
+'.ec-bolha{background:#d9fdd3;border-radius:8px 8px 8px 2px;padding:10px 12px;font-size:13.5px;color:#111b21;line-height:1.5;white-space:normal}'
+'.ec-camp-wrap{overflow-x:auto;margin-top:6px}'
+'.ec-camp{width:100%;border-collapse:collapse;font-size:13.5px}'
+'.ec-camp th{text-align:left;color:var(--m);font-weight:600;font-size:12px;padding:9px 12px;border-bottom:1px solid var(--l)}'
+'.ec-camp td{padding:11px 12px;border-bottom:1px solid #f0f2f5;vertical-align:top}'
+'@media(max-width:760px){.ec-mapa{grid-template-columns:1fr}.ec-tab .some{display:none}}';
  document.head.appendChild(s);
}

/* ---------- KPIs ---------- */
function kpisHTML(){
  var r=S.resumo;
  if(!r) return '<div class="ec-kpis">'+Array(5).fill('<div class="ec-kpi"><div class="r">—</div><div class="v">·</div></div>').join('')+'</div>';
  var alcance = (r.com_whatsapp||0) + (r.com_email||0);
  return '<div class="ec-kpis">'
  +'<div class="ec-kpi"><div class="r">Clientes</div><div class="v">'+numero(r.total)+'</div>'
    +'<div class="p">'+numero(r.compradores)+' já compraram</div></div>'
  +'<div class="ec-kpi dest"><div class="r">Faturamento</div><div class="v">'+dinheiro(r.faturamento)+'</div>'
    +'<div class="p">ticket médio '+dinheiro(r.ticket_medio)+'</div></div>'
  +'<div class="ec-kpi"><div class="r">Recompra</div><div class="v">'+(r.recompra_pct||0)+'%</div>'
    +'<div class="p">compraram mais de uma vez</div></div>'
  +'<div class="ec-kpi alerta"><div class="r">Sumidos 90d</div><div class="v">'+numero(r.sumidos_90)+'</div>'
    +'<div class="p">'+numero(r.sumidos_180)+' há mais de 6 meses</div></div>'
  +'<div class="ec-kpi"><div class="r">Dá pra falar com</div><div class="v">'+numero(r.com_whatsapp)+'</div>'
    +'<div class="p">no WhatsApp · '+numero(r.com_email)+' por e-mail</div></div>'
  +'</div>';
}

/* ---------- lista ---------- */
function tagTemperatura(c){
  if(!c.pedidos) return '<span class="ec-tag novo">sem compra</span>';
  var d=dias(c.ultima_compra);
  if(d==null) return '';
  if(d<=30)  return '<span class="ec-tag quente">ativo</span>';
  if(d<=90)  return '<span class="ec-tag morno">esfriando</span>';
  return '<span class="ec-tag frio">sumido</span>';
}
function linhaHTML(c){
  var cor=corDe(c.nome||c.email||c.id);
  return '<tr onclick="ecFicha(\''+c.id+'\')">'
  +'<td><div class="ec-pessoa">'
    +'<div class="ec-av" style="background:'+cor[0]+';color:'+cor[1]+'">'+esc(iniciais(c.nome||c.email))+'</div>'
    +'<div style="min-width:0"><div class="n">'+esc(c.nome||'(sem nome)')+'</div>'
    +'<div class="e">'+esc(c.email||foneBonito(c.telefone))+'</div></div></div></td>'
  +'<td class="some">'+esc(c.cidade||'—')+(c.uf?'/'+esc(c.uf):'')+'</td>'
  +'<td class="ec-num">'+numero(c.pedidos)+'</td>'
  +'<td class="ec-num">'+dinheiro(c.total_gasto)+'</td>'
  +'<td class="ec-num some">'+dinheiro(c.ticket_medio)+'</td>'
  +'<td class="ec-num">'+(c.ultima_compra?quando(c.ultima_compra):'—')+'</td>'
  +'<td>'+tagTemperatura(c)+'</td>'
  +'<td class="some"><div class="ec-canais">'
    +'<span class="'+(c.telefone&&c.aceita_wa?'wa':'off')+'" title="WhatsApp">W</span>'
    +'<span class="'+(c.email&&c.aceita_email?'em':'off')+'" title="E-mail">@</span>'
  +'</div></td>'
  +'</tr>';
}
function listaHTML(){
  if(S.carregando) return '<div class="ec-vazio"><p>Carregando…</p></div>';
  if(!S.total && !S.busca && !Object.keys(S.filtros).length){
    return '<div class="ec-vazio">'
    +'<h3>Nenhum cliente ainda</h3>'
    +'<p>Baixe a planilha de clientes no painel da Tray e suba aqui. Eu identifico as colunas sozinho — '
    +'nome, e-mail, telefone, pedido, valor e data. Se a planilha trouxer os pedidos, o valor gasto e a última compra saem prontos.</p>'
    +'<button class="ec-bt pri" onclick="ecImportar()">Importar planilha</button></div>';
  }
  if(!S.itens.length) return '<div class="ec-vazio"><h3>Nada com esse filtro</h3>'
    +'<p>Tente afrouxar a busca ou limpar os filtros.</p>'
    +'<button class="ec-bt" onclick="ecLimpaFiltros()">Limpar filtros</button></div>';

  var de=S.pagina*S.porPagina+1, ate=Math.min(S.total,de+S.itens.length-1);
  return '<table class="ec-tab"><thead><tr>'
  +'<th>Cliente</th><th class="some">Cidade</th><th class="ec-num">Pedidos</th>'
  +'<th class="ec-num">Total gasto</th><th class="ec-num some">Ticket</th>'
  +'<th class="ec-num">Última compra</th><th>Situação</th><th class="some">Canais</th>'
  +'</tr></thead><tbody>'+S.itens.map(linhaHTML).join('')+'</tbody></table>'
  +'<div class="ec-pag">'
    +'<span>'+numero(de)+'–'+numero(ate)+' de '+numero(S.total)+'</span>'
    +'<button class="ec-bt" onclick="ecPagina(-1)"'+(S.pagina<=0?' disabled':'')+'>Anterior</button>'
    +'<button class="ec-bt" onclick="ecPagina(1)"'+(ate>=S.total?' disabled':'')+'>Próxima</button>'
  +'</div>';
}

/* ---------- filtros rápidos ---------- */
var RAPIDOS=[
  {k:'todos',   rot:'Todos',            f:{}},
  {k:'ativos',  rot:'Ativos (30d)',     f:{dias_ate:30,min_pedidos:1}},
  {k:'sumidos', rot:'Sumidos (90d+)',   f:{dias_sem_comprar:90,min_pedidos:1}},
  {k:'vip',     rot:'VIP (3+ pedidos)', f:{min_pedidos:3}},
  {k:'unica',   rot:'Compraram 1x',     f:{min_pedidos:1,max_pedidos:1}},
  {k:'semcompra',rot:'Sem compra',      f:{nunca_comprou:true}},
  {k:'wa',      rot:'Com WhatsApp',     f:{so_com_wa:true}},
  {k:'email',   rot:'Com e-mail',       f:{so_com_email:true}}
];
function chipsHTML(){
  var atual=JSON.stringify(S.filtros);
  return '<div class="ec-chips">'+RAPIDOS.map(function(r){
    var on = JSON.stringify(r.f)===atual;
    return '<button class="ec-chip'+(on?' on':'')+'" onclick="ecRapido(\''+r.k+'\')">'+esc(r.rot)+'</button>';
  }).join('')+'</div>';
}

/* ---------- tela toda ---------- */
function pinta(){
  if(!S.box) return;
  var h='<div class="ec">'
  +'<div class="ec-topo">'
    +'<div><h2>Clientes da loja</h2>'
    +'<div class="sub">'+(S.nomeLoja?esc(S.nomeLoja)+' · ':'')
    +(S.resumo&&S.resumo.ultima_importacao
        ? 'atualizado '+quando(S.resumo.ultima_importacao)
        : 'quem já comprou na loja')+'</div></div>'
    +'<div class="dir">'
      +'<button class="ec-bt" onclick="ecExportar()">Exportar CSV</button>'
      +((S.nuvem&&S.nuvem.conectado)
        ? '<button class="ec-bt nuvem" onclick="ecPuxarNuvem()" title="Puxar clientes e pedidos da Nuvemshop">'
          +'<svg viewBox="0 0 24 24"><path d="M17.5 19a4.5 4.5 0 1 0 0-9 5.5 5.5 0 0 0-10.9 1.2A4 4 0 0 0 6.5 19Z"/><path d="M12 12v6"/><polyline points="9 15 12 18 15 15"/></svg>'
          +'Puxar da Nuvemshop</button>'
        : '')
      +'<button class="ec-bt disp" onclick="ecDisparar()">'
        +'<svg viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg>'
        +'Disparar</button>'
      +'<button class="ec-bt pri" onclick="ecImportar()">'
        +'<svg viewBox="0 0 24 24"><path d="M12 16V4"/><polyline points="7 9 12 4 17 9"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>'
        +'Importar planilha</button>'
    +'</div>'
  +'</div>'
  + kpisHTML()
  +'<div class="ec-abas">'
    +'<button class="ec-aba'+(S.aba==='lista'?' on':'')+'" onclick="ecAba(\'lista\')">Lista</button>'
    +'<button class="ec-aba'+(S.aba==='segmentos'?' on':'')+'" onclick="ecAba(\'segmentos\')">Segmentos</button>'
    +'<button class="ec-aba'+(S.aba==='campanhas'?' on':'')+'" onclick="ecAba(\'campanhas\')">Campanhas</button>'
  +'</div>';

  if(S.aba==='campanhas'){
    h+=campanhasHTML();
  }else if(S.aba==='lista'){
    h+='<div class="ec-filtros">'
      +'<div class="ec-busca">'
        +'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.2" y1="16.2" x2="21" y2="21"/></svg>'
        +'<input type="text" id="ecBusca" placeholder="Buscar por nome, e-mail ou telefone" value="'+esc(S.busca)+'">'
      +'</div>'
      +'<select class="ec-sel" id="ecOrdem" onchange="ecOrdena(this.value)">'
        +'<option value="ultima"'+(S.ordem==='ultima'?' selected':'')+'>Última compra</option>'
        +'<option value="gasto"'+(S.ordem==='gasto'?' selected':'')+'>Quem mais gastou</option>'
        +'<option value="pedidos"'+(S.ordem==='pedidos'?' selected':'')+'>Mais pedidos</option>'
        +'<option value="nome"'+(S.ordem==='nome'?' selected':'')+'>Nome A–Z</option>'
      +'</select>'
    +'</div>'
    + chipsHTML()
    + listaHTML();
  }else{
    h+=segmentosHTML();
  }
  h+='</div>';
  S.box.innerHTML=h;

  var b=document.getElementById('ecBusca');
  if(b){
    b.oninput=function(){
      clearTimeout(S._t);
      S._t=setTimeout(function(){ S.busca=b.value; S.pagina=0; carregaLista(); },350);
    };
  }
}

/* ---------- segmentos ---------- */
function descreveRegra(r){
  var p=[];
  if(r.dias_sem_comprar) p.push('sem comprar há '+r.dias_sem_comprar+'+ dias');
  if(r.dias_ate) p.push('comprou nos últimos '+r.dias_ate+' dias');
  if(r.min_pedidos) p.push(r.min_pedidos+'+ pedidos');
  if(r.max_pedidos) p.push('até '+r.max_pedidos+' pedidos');
  if(r.min_gasto) p.push('gastou '+dinheiro(r.min_gasto)+'+');
  if(r.nunca_comprou) p.push('nunca comprou');
  if(r.uf) p.push('de '+r.uf);
  if(r.so_com_wa) p.push('com WhatsApp');
  if(r.so_com_email) p.push('com e-mail');
  return p.length?p.join(' · '):'a base toda';
}
function segmentosHTML(){
  var h='<div class="ec-segs">';
  S.segmentos.forEach(function(s){
    h+='<div class="ec-seg" onclick="ecUsaSegmento(\''+s.id+'\')">'
      +'<button class="lixo" onclick="event.stopPropagation();ecApagaSegmento(\''+s.id+'\')" title="Apagar">×</button>'
      +'<div class="n">'+esc(s.nome)+'</div>'
      +'<div class="q">'+numero(s.quantos)+'</div>'
      +'<div class="d">'+esc(descreveRegra(s.regra||{}))+'</div>'
      +'<button class="ec-bt disp mini" onclick="event.stopPropagation();ecDisparar('+"'"+s.id+"'"+',\''+esc((s.nome||'').replace(/\'/g,''))+'\')" title="Disparar pra esse grupo">'
        +'<svg viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg>Disparar</button>'
    +'</div>';
  });
  h+='<div class="ec-seg novo" onclick="ecNovoSegmento()">+ Novo segmento</div></div>';
  if(!S.segmentos.length){
    h+='<p style="color:#667781;font-size:13px;margin-top:16px;line-height:1.6">'
     +'Segmento é um recorte salvo da base — "quem não compra há 90 dias", "quem já gastou mais de R$ 500". '
     +'Serve pra você abrir a lista pronta e, depois, disparar remarketing só pra esse grupo.</p>';
  }
  return h;
}

/* ===========================================================
   AÇÕES (globais, chamadas pelo HTML)
   =========================================================== */
window.ecAba=function(a){ S.aba=a; pinta(); if(a==='segmentos') carregaSegmentos(); if(a==='campanhas') carregaCampanhas(); };
window.ecOrdena=function(v){ S.ordem=v; S.pagina=0; carregaLista(); };
window.ecPagina=function(d){ S.pagina=Math.max(0,S.pagina+d); carregaLista(); };
window.ecLimpaFiltros=function(){ S.filtros={}; S.busca=''; S.pagina=0; carregaLista(); };
window.ecRapido=function(k){
  var r=RAPIDOS.filter(function(x){ return x.k===k; })[0];
  S.filtros = r ? JSON.parse(JSON.stringify(r.f)) : {};
  S.pagina=0; carregaLista();
};
window.ecUsaSegmento=function(id){
  var s=S.segmentos.filter(function(x){ return x.id===id; })[0];
  if(!s) return;
  S.filtros=s.regra||{}; S.aba='lista'; S.pagina=0; carregaLista();
};
window.ecApagaSegmento=async function(id){
  var s=S.segmentos.filter(function(x){ return x.id===id; })[0];
  if(!s) return;
  if(!confirm('Apagar o segmento "'+s.nome+'"? Os clientes continuam na base, só a regra some.')) return;
  var r=await api({action:'apagar_segmento',id:id});
  if(r.error) return aviso(r.error,'erro');
  carregaSegmentos();
};

/* ---------- carregamentos ---------- */
async function carregaResumo(){
  var r=await api({action:'resumo',client_id:S.cliente});
  if(!r.error) S.resumo=r;
  pinta();
}
async function carregaLista(){
  S.carregando=true; pinta();
  var r=await api({action:'listar',client_id:S.cliente,busca:S.busca,ordem:S.ordem,
                   filtros:S.filtros,pagina:S.pagina,por_pagina:S.porPagina});
  S.carregando=false;
  if(r.error){ aviso(r.error,'erro'); S.itens=[]; S.total=0; }
  else { S.itens=r.itens||[]; S.total=r.total||0; }
  pinta();
}
async function carregaSegmentos(){
  var r=await api({action:'segmentos',client_id:S.cliente});
  if(!r.error) S.segmentos=r.itens||[];
  if(S.aba==='segmentos') pinta();
}

/* ---------- ficha do cliente ---------- */
window.ecFicha=async function(id){
  var r=await api({action:'ficha',customer_id:id});
  if(r.error) return aviso(r.error,'erro');
  var c=r.cliente, peds=r.pedidos||[], cor=corDe(c.nome||c.email||c.id);
  var h='<div class="ec-modal" onclick="if(event.target===this)this.remove()"><div class="ec-cx ec">'
  +'<div class="cab"><h3>Ficha do cliente</h3>'
    +'<button class="x" onclick="this.closest(\'.ec-modal\').remove()">×</button></div>'
  +'<div class="corpo">'
    +'<div class="ec-ficha-topo">'
      +'<div class="ec-av" style="background:'+cor[0]+';color:'+cor[1]+'">'+esc(iniciais(c.nome||c.email))+'</div>'
      +'<div><div class="nm">'+esc(c.nome||'(sem nome)')+'</div>'
      +'<div class="ct">'+esc(c.email||'sem e-mail')+' · '+esc(c.telefone?foneBonito(c.telefone):'sem telefone')
      + (c.cidade?' · '+esc(c.cidade)+(c.uf?'/'+esc(c.uf):''):'')+'</div></div>'
    +'</div>'
    +'<div class="ec-mini">'
      +'<div><div class="r">Pedidos</div><div class="v">'+numero(c.pedidos)+'</div></div>'
      +'<div><div class="r">Total gasto</div><div class="v">'+dinheiro(c.total_gasto)+'</div></div>'
      +'<div><div class="r">Ticket médio</div><div class="v">'+dinheiro(c.ticket_medio)+'</div></div>'
      +'<div><div class="r">Última compra</div><div class="v" style="font-size:14px">'+dataBR(c.ultima_compra)+'</div></div>'
      +'<div><div class="r">Cliente desde</div><div class="v" style="font-size:14px">'+dataBR(c.primeira_compra)+'</div></div>'
    +'</div>';
  if(peds.length){
    h+='<div style="font-size:12px;font-weight:700;color:#667781;text-transform:uppercase;margin-bottom:8px">Pedidos</div>'
     +'<table class="ec-tab"><thead><tr><th>Pedido</th><th>Data</th><th>Situação</th><th class="ec-num">Valor</th></tr></thead><tbody>'
     + peds.map(function(p){
         return '<tr style="cursor:default"><td>'+esc(p.externo_id||'—')+'</td><td>'+dataBR(p.feito_em)+'</td>'
              +'<td>'+esc(p.situacao||'—')+'</td><td class="ec-num">'+dinheiro(p.valor)+'</td></tr>';
       }).join('')
     +'</tbody></table>';
  }else{
    h+='<p style="color:#667781;font-size:13px">Nenhum pedido importado para este cliente.</p>';
  }
  h+='</div></div></div>';
  var d=document.createElement('div'); d.innerHTML=h; document.body.appendChild(d.firstChild);
};

/* ---------- novo segmento ---------- */
window.ecNovoSegmento=function(){
  var h='<div class="ec-modal" onclick="if(event.target===this)this.remove()"><div class="ec-cx ec" style="max-width:520px">'
  +'<div class="cab"><h3>Novo segmento</h3><button class="x" onclick="this.closest(\'.ec-modal\').remove()">×</button></div>'
  +'<div class="corpo">'
    +'<label style="font-size:12.5px;font-weight:600;color:#667781">Nome do segmento</label>'
    +'<input id="segNome" class="ec-sel" style="width:100%;margin:4px 0 16px" placeholder="Ex: Sumidos há 3 meses">'
    +'<div class="ec-mapa">'
      +'<div><label>Sem comprar há (dias)</label><input id="segSem" class="ec-sel" style="width:100%" type="number" min="0" placeholder="90"></div>'
      +'<div><label>Comprou nos últimos (dias)</label><input id="segAte" class="ec-sel" style="width:100%" type="number" min="0" placeholder="—"></div>'
      +'<div><label>Mínimo de pedidos</label><input id="segMinP" class="ec-sel" style="width:100%" type="number" min="0" placeholder="1"></div>'
      +'<div><label>Máximo de pedidos</label><input id="segMaxP" class="ec-sel" style="width:100%" type="number" min="0" placeholder="—"></div>'
      +'<div><label>Gastou pelo menos (R$)</label><input id="segMinG" class="ec-sel" style="width:100%" type="number" min="0" placeholder="—"></div>'
      +'<div><label>UF</label><input id="segUF" class="ec-sel" style="width:100%" maxlength="2" placeholder="MG"></div>'
    +'</div>'
    +'<div style="margin-top:12px;display:flex;gap:16px;font-size:13px">'
      +'<label><input type="checkbox" id="segWa"> só com WhatsApp</label>'
      +'<label><input type="checkbox" id="segEmail"> só com e-mail</label>'
    +'</div>'
    +'<div id="segPrevia" style="margin-top:16px;padding:12px 14px;background:#f7f9f9;border-radius:9px;font-size:13px;color:#667781">'
      +'Preencha os campos pra ver quantos clientes entram.</div>'
  +'</div>'
  +'<div class="rodape">'
    +'<button class="ec-bt" onclick="this.closest(\'.ec-modal\').remove()">Cancelar</button>'
    +'<button class="ec-bt pri" onclick="ecSalvaSegmento()">Salvar segmento</button>'
  +'</div></div></div>';
  var d=document.createElement('div'); d.innerHTML=h; document.body.appendChild(d.firstChild);
  ['segSem','segAte','segMinP','segMaxP','segMinG','segUF','segWa','segEmail'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.addEventListener('input',function(){ clearTimeout(S._sp); S._sp=setTimeout(ecPreviaSegmento,400); });
  });
};
function regraDoForm(){
  var v=function(id){ var e=document.getElementById(id); return e?e.value.trim():''; };
  var c=function(id){ var e=document.getElementById(id); return !!(e&&e.checked); };
  var r={};
  if(v('segSem'))  r.dias_sem_comprar=Number(v('segSem'));
  if(v('segAte'))  r.dias_ate=Number(v('segAte'));
  if(v('segMinP')) r.min_pedidos=Number(v('segMinP'));
  if(v('segMaxP')) r.max_pedidos=Number(v('segMaxP'));
  if(v('segMinG')) r.min_gasto=Number(v('segMinG'));
  if(v('segUF'))   r.uf=v('segUF').toUpperCase();
  if(c('segWa'))    r.so_com_wa=true;
  if(c('segEmail')) r.so_com_email=true;
  return r;
}
window.ecPreviaSegmento=async function(){
  var el=document.getElementById('segPrevia'); if(!el) return;
  var r=await api({action:'previa_segmento',client_id:S.cliente,regra:regraDoForm()});
  if(r.error){ el.textContent=r.error; return; }
  el.innerHTML='<b style="color:#111b21;font-size:18px">'+numero(r.quantos)+'</b> clientes entram nesse recorte<br>'
    +'<span style="font-size:12px">dá pra alcançar '+numero(r.com_whatsapp)+' no WhatsApp e '+numero(r.com_email)+' por e-mail</span>';
};
window.ecSalvaSegmento=async function(){
  var nome=(document.getElementById('segNome')||{}).value||'';
  if(!nome.trim()) return aviso('Dá um nome pro segmento.','erro');
  var r=await api({action:'salvar_segmento',client_id:S.cliente,nome:nome.trim(),regra:regraDoForm()});
  if(r.error) return aviso(r.error,'erro');
  var m=document.querySelector('.ec-modal'); if(m) m.remove();
  aviso('Segmento salvo.');
  carregaSegmentos();
};

/* ===========================================================
   DISPARO (remarketing) — Fase 1: WhatsApp
   =========================================================== */
var D={seg_id:null,seg_nome:'',regra:{},templates:[],template:null,previa:0,waba:null,precisa_coex:false,erro_meta:'',rodando:false};

window.ecDisparar=async function(seg_id, seg_nome){
  D.seg_id=seg_id||null; D.seg_nome=seg_nome||''; D.template=null; D.templates=[]; D.previa=0;
  D.waba=null; D.precisa_coex=false; D.erro_meta=''; D.rodando=false;
  if(seg_id){
    var s=(S.segmentos||[]).filter(function(x){return x.id===seg_id;})[0];
    D.regra=(s&&s.regra)||{}; if(!D.seg_nome&&s) D.seg_nome=s.nome;
  }else{
    D.regra=Object.assign({},S.filtros||{});
    D.seg_nome=descreveRegra(D.regra);
  }
  abreDispModal();
  var res=await Promise.all([
    apiD({action:'waba_status',client_id:S.cliente}),
    apiD({action:'templates',client_id:S.cliente}),
    apiD({action:'previa',client_id:S.cliente,canal:'whatsapp',regra:D.regra})
  ]);
  var st=res[0]||{}, tpl=res[1]||{}, pv=res[2]||{};
  D.waba=st; D.templates=(tpl.itens)||[];
  D.precisa_coex=(!st.conectado)||(!!tpl.precisa_coex);
  D.erro_meta=tpl.erro_meta||'';
  D.previa=pv.quantos||0;
  pintaDispForm();
};
function abreDispModal(){
  if(document.getElementById('ecDisp')) return;
  var h='<div class="ec-modal" id="ecDisp"><div class="ec-cx ec">'
   +'<div class="cab"><h3>Disparar remarketing</h3>'
     +'<button class="x" onclick="document.getElementById(\'ecDisp\').remove()">×</button></div>'
   +'<div class="corpo" id="ecDispCorpo"><p style="color:#667781">Carregando…</p></div>'
   +'</div></div>';
  var d=document.createElement('div'); d.innerHTML=h; document.body.appendChild(d.firstChild);
}
function pintaDispForm(){
  var box=document.getElementById('ecDispCorpo'); if(!box) return;
  var h='<div class="ec-dl"><span>Grupo</span><b>'+esc(D.seg_nome||'a base toda')+'</b>'
    +'<span>Alcançáveis no WhatsApp</span><b>'+numero(D.previa)+'</b></div>';
  if(D.precisa_coex){
    h+='<div class="ec-alerta">⚠️ O WhatsApp da loja ainda não está conectado à API oficial. '
     +'Enquanto não ligar (Coex), o disparo não sai — mas você já deixa tudo montado aqui.</div>';
  }
  h+='<label class="ec-lb">Canal</label><div class="ec-canais">'
    +'<button class="ec-canal on" type="button">WhatsApp</button>'
    +'<button class="ec-canal off" type="button" disabled>E-mail (em breve)</button></div>';
  h+='<label class="ec-lb">Mensagem (template aprovado)</label>';
  if(!D.templates.length){
    h+='<div class="ec-vazio">'+(D.precisa_coex
        ?'Os templates vão aparecer aqui quando a WhatsApp da loja conectar.'
        :(D.erro_meta?'Não consegui ler os templates: '+esc(D.erro_meta)
          :'Nenhum template de marketing aprovado ainda. Crie e aprove um na Meta.'))+'</div>';
  }else{
    h+='<select class="ec-sel" id="ecDispTpl" style="width:100%" onchange="ecDispPreview()">'
      +'<option value="">— escolher —</option>';
    D.templates.forEach(function(t){ h+='<option value="'+esc(t.name)+'">'+esc(t.name)+' ('+esc(t.category||'')+')</option>'; });
    h+='</select><div class="ec-tplview" id="ecDispView"></div>';
  }
  h+='<label class="ec-lb">Nome do disparo</label>'
   +'<input class="ec-sel" id="ecDispNome" style="width:100%" placeholder="Ex: Recuperar sumidos 90d" value="'+esc('Disparo '+(D.seg_nome||'')).slice(0,60)+'">';
  box.innerHTML=h;
  var cx=box.parentNode, rod=cx.querySelector('.rodape'); if(rod) rod.remove();
  var r=document.createElement('div'); r.className='rodape';
  var pode=D.templates.length>0 && D.previa>0 && !D.precisa_coex;
  r.innerHTML='<button class="ec-bt" onclick="document.getElementById(\'ecDisp\').remove()">Cancelar</button>'
   +'<button class="ec-bt pri" id="ecDispVai" '+(pode?'':'disabled')+' onclick="ecDispConfirma()">Disparar pra '+numero(D.previa)+'</button>';
  cx.appendChild(r);
}
window.ecDispPreview=function(){
  var sel=document.getElementById('ecDispTpl'), view=document.getElementById('ecDispView');
  if(!sel||!view) return;
  D.template=sel.value||null;
  var t=(D.templates||[]).filter(function(x){return x.name===D.template;})[0];
  view.innerHTML=t?('<div class="ec-bolha">'+esc(t.corpo||'').replace(/\{\{1\}\}/g,'{nome}').replace(/\n/g,'<br>')+'</div>'):'';
};
window.ecDispConfirma=async function(){
  if(D.rodando) return;
  var tpl=(document.getElementById('ecDispTpl')||{}).value||'';
  if(!tpl) return aviso('Escolhe o template.','erro');
  var nome=(document.getElementById('ecDispNome')||{}).value||('Disparo '+(D.seg_nome||''));
  var t=(D.templates||[]).filter(function(x){return x.name===tpl;})[0];
  var params=[]; if(t&&t.vars>=1){ params.push('{nome}'); for(var i=1;i<t.vars;i++) params.push('-'); }
  if(!confirm('Confirmar disparo de "'+tpl+'" pra '+D.previa+' pessoas no WhatsApp?')) return;
  D.rodando=true;
  var box=document.getElementById('ecDispCorpo');
  box.innerHTML='<div id="ecDispProg"><div class="ec-barra"><i id="ecDispBarra" style="width:0%"></i></div>'
    +'<div id="ecDispTxt" style="font-size:13px;color:#667781;margin-top:8px">Criando campanha…</div></div>';
  var cx=box.parentNode, rod=cx.querySelector('.rodape'); if(rod) rod.innerHTML='';
  var cr=await apiD({action:'criar',client_id:S.cliente,canal:'whatsapp',template:tpl,nome:nome,
    segment_id:D.seg_id||null, regra:D.seg_id?null:D.regra, params:params});
  if(cr.error||!cr.campaign_id){ D.rodando=false; box.innerHTML='<div class="ec-alerta">'+esc(cr.error||'não deu pra criar a campanha')+'</div>';
    var rb=cx.querySelector('.rodape'); if(rb) rb.innerHTML='<button class="ec-bt" onclick="document.getElementById(\'ecDisp\').remove()">Fechar</button>'; return; }
  var cid=cr.campaign_id, alvos=cr.alvos||D.previa, feito=0, guard=0;
  while(guard++<300){
    var r=await apiD({action:'enviar_lote',campaign_id:cid,tam:60});
    if(r.error){ box.innerHTML='<div class="ec-alerta">Parou: '+esc(r.error)+'</div>'; break; }
    feito=(r.enviados||0)+(r.falhas||0);
    var pct=alvos?Math.round(feito/alvos*100):100;
    var bar=document.getElementById('ecDispBarra'); if(bar) bar.style.width=Math.min(100,pct)+'%';
    var txt=document.getElementById('ecDispTxt'); if(txt) txt.textContent='Enviados '+numero(r.enviados||0)+' · falhas '+numero(r.falhas||0)+' · faltam '+numero(r.restantes||0);
    if(r.done) break;
  }
  D.rodando=false;
  var rr=await apiD({action:'campanhas',client_id:S.cliente}); S.campanhas=(rr&&rr.itens)||[];
  box.innerHTML='<div style="text-align:center;padding:14px 0"><div style="font-size:34px">📣</div>'
   +'<h3 style="margin:8px 0 4px;font-size:18px">Disparo concluído</h3></div>';
  var r2=cx.querySelector('.rodape'); if(r2) r2.innerHTML='<button class="ec-bt pri" onclick="document.getElementById(\'ecDisp\').remove();ecAba(\'campanhas\')">Ver campanhas</button>';
};
async function carregaCampanhas(){
  var r=await apiD({action:'campanhas',client_id:S.cliente});
  S.campanhas=(r&&r.itens)||[];
  if(S.aba==='campanhas') pinta();
}
function campanhasHTML(){
  if(!S.campanhas.length){
    return '<div class="ec-vazio" style="margin-top:16px">Nenhum disparo ainda. Vá em <b>Segmentos</b> ou na <b>Lista</b>, '
      +'escolha o grupo e clique em <b>Disparar</b>.</div>';
  }
  var h='<div class="ec-camp-wrap"><table class="ec-camp"><thead><tr>'
    +'<th>Disparo</th><th>Canal</th><th>Status</th><th class="ec-num">Alvos</th><th class="ec-num">Enviados</th><th class="ec-num">Falhas</th><th>Quando</th>'
    +'</tr></thead><tbody>';
  S.campanhas.forEach(function(c){
    var st=c.status||'';
    var cor= st==='enviada'?'#12876b': st==='enviando'?'#b57d16': st==='bloqueado'?'#c1121f':'#667781';
    h+='<tr><td><b>'+esc(c.nome||'—')+'</b>'+(c.template?'<br><span style="color:#8696a0;font-size:12px">'+esc(c.template)+'</span>':'')+'</td>'
     +'<td>'+esc(c.canal||'')+'</td>'
     +'<td><span style="color:'+cor+';font-weight:600">'+esc(st)+'</span>'+(c.erro?'<br><span style="color:#c1121f;font-size:11px">'+esc(c.erro)+'</span>':'')+'</td>'
     +'<td class="ec-num">'+numero(c.alvos||0)+'</td>'
     +'<td class="ec-num">'+numero(c.enviados||0)+'</td>'
     +'<td class="ec-num">'+numero(c.falhas||0)+'</td>'
     +'<td>'+(c.criada_em?dataBR(c.criada_em):'—')+'</td></tr>';
  });
  h+='</tbody></table></div>';
  return h;
}

/* ===========================================================
   NUVEMSHOP — puxar clientes + pedidos automático
   =========================================================== */
window.ecPuxarNuvem=function(){
  var loja=(S.nuvem&&S.nuvem.store_name)||'sua loja';
  var h='<div class="ec-modal" id="ecNuv"><div class="ec-cx ec">'
   +'<div class="cab"><h3>Puxar da Nuvemshop</h3>'
     +'<button class="x" onclick="document.getElementById(\'ecNuv\').remove()">×</button></div>'
   +'<div class="corpo" id="ecNuvCorpo">'
     +'<p style="font-size:13.5px;color:#111b21;line-height:1.5">Vou puxar os <b>clientes</b> e os <b>pedidos pagos</b> de <b>'+esc(loja)+'</b> '
     +'direto da Nuvemshop. Os pedidos trazem valor e data, então total gasto, última compra e nº de pedidos vêm prontos.</p>'
     +'<p style="font-size:12.5px;color:#667781;margin-top:8px">Pode rodar quantas vezes quiser — o que já existe é atualizado, não duplica.</p>'
   +'</div></div></div>';
  var d=document.createElement('div'); d.innerHTML=h; document.body.appendChild(d.firstChild);
  var cx=document.getElementById('ecNuvCorpo').parentNode;
  var r=document.createElement('div'); r.className='rodape';
  r.innerHTML='<button class="ec-bt" onclick="document.getElementById(\'ecNuv\').remove()">Cancelar</button>'
   +'<button class="ec-bt nuvem" id="ecNuvVai" onclick="ecNuvRoda()">Puxar agora</button>';
  cx.appendChild(r);
};
window.ecNuvRoda=async function(){
  var box=document.getElementById('ecNuvCorpo'); if(!box) return;
  var bt=document.getElementById('ecNuvVai'); if(bt){ bt.disabled=true; bt.textContent='Puxando…'; }
  box.innerHTML='<div class="ec-barra ind"><i></i></div>'
    +'<div id="ecNuvTxt" style="font-size:13px;color:#667781;margin-top:10px">Conectando na Nuvemshop…</div>';
  var fase='customers', pagina=1, cli=0, ped=0, guard=0, erro=null;
  while(guard++<300){
    var r=await apiN({action:'sync',client_id:S.cliente,fase:fase,pagina:pagina});
    if(r.error){ erro=r.error; break; }
    cli+=(r.novos_clientes||0); ped+=(r.novos_pedidos||0);
    var txt=document.getElementById('ecNuvTxt');
    if(txt) txt.innerHTML=(fase==='customers'?'Puxando clientes':'Puxando pedidos')
      +'… <b>'+numero(cli)+'</b> clientes · <b>'+numero(ped)+'</b> pedidos';
    if(r.done) break;
    fase=r.prox_fase; pagina=r.prox_pagina;
  }
  var cx=box.parentNode; var rod=cx.querySelector('.rodape');
  if(erro){
    box.innerHTML='<div class="ec-alerta">Parou: '+esc(erro)+'</div>';
    if(rod) rod.innerHTML='<button class="ec-bt" onclick="document.getElementById(\'ecNuv\').remove()">Fechar</button>';
    return;
  }
  box.innerHTML='<div style="text-align:center;padding:14px 0"><div style="font-size:34px">☁️</div>'
   +'<h3 style="margin:8px 0 4px;font-size:18px">Sincronizado</h3>'
   +'<p style="color:#667781;font-size:13px;margin:0"><b>'+numero(cli)+'</b> clientes novos · <b>'+numero(ped)+'</b> pedidos novos</p></div>';
  if(rod) rod.innerHTML='<button class="ec-bt pri" onclick="document.getElementById(\'ecNuv\').remove();ecRecarrega()">Ver os clientes</button>';
};

/* ===========================================================
   IMPORTAÇÃO
   =========================================================== */
window.ecImportar=function(){
  var h='<div class="ec-modal" id="ecImp"><div class="ec-cx ec">'
  +'<div class="cab"><h3>Importar planilha de clientes</h3>'
    +'<button class="x" onclick="document.getElementById(\'ecImp\').remove()">×</button></div>'
  +'<div class="corpo" id="ecImpCorpo">'
    +'<div class="ec-solta" id="ecSolta">'
      +'<div style="font-size:15px;font-weight:600">Solte o arquivo aqui ou clique pra escolher</div>'
      +'<p>CSV ou TXT exportado da Tray, Nuvemshop ou qualquer planilha.<br>'
      +'Se o arquivo estiver em Excel, salve como CSV antes.</p>'
      +'<input type="file" id="ecArq" accept=".csv,.txt,text/csv,text/plain" style="display:none">'
    +'</div>'
  +'</div></div></div>';
  var d=document.createElement('div'); d.innerHTML=h; document.body.appendChild(d.firstChild);
  var solta=document.getElementById('ecSolta'), arq=document.getElementById('ecArq');
  solta.onclick=function(){ arq.click(); };
  arq.onchange=function(){ if(arq.files[0]) recebeArquivo(arq.files[0]); };
  ['dragenter','dragover'].forEach(function(e){
    solta.addEventListener(e,function(ev){ ev.preventDefault(); solta.classList.add('sobre'); });
  });
  ['dragleave','drop'].forEach(function(e){
    solta.addEventListener(e,function(ev){ ev.preventDefault(); solta.classList.remove('sobre'); });
  });
  solta.addEventListener('drop',function(ev){
    var f=ev.dataTransfer.files[0]; if(f) recebeArquivo(f);
  });
};

async function recebeArquivo(file){
  var corpo=document.getElementById('ecImpCorpo');
  corpo.innerHTML='<p style="color:#667781">Lendo '+esc(file.name)+'…</p>';
  var txt;
  try{ txt=await leArquivo(file); }
  catch(e){ corpo.innerHTML='<p style="color:#c1121f">Não consegui ler o arquivo.</p>'; return; }
  var linhas=lerCSV(txt);
  if(linhas.length<2){
    corpo.innerHTML='<p style="color:#c1121f">A planilha tem menos de duas linhas — precisa do cabeçalho e pelo menos um cliente.</p>';
    return;
  }
  S.csv={cabecalho:linhas[0],linhas:linhas.slice(1),veioSalvo:false};
  S.csv.mapa=adivinhaMapa(S.csv.cabecalho);
  S.csv.mapa=ajustaTelefone(S.csv.mapa,S.csv.cabecalho,S.csv.linhas);
  // se ele ja corrigiu o de-para dessa mesma planilha antes, usa o que ele escolheu
  var salvo=leMapaSalvo(S.csv.cabecalho);
  if(salvo){ S.csv.mapa=salvo; S.csv.veioSalvo=true; }
  pintaMapa();
}

/* guarda o de-para por loja + formato de planilha, pra nao ter que refazer toda vez */
function chaveMapa(cab){
  var assinatura=cab.map(achata).join('|');
  var h=0; for(var i=0;i<assinatura.length;i++) h=(h*31+assinatura.charCodeAt(i))>>>0;
  return 'ec-mapa-'+S.cliente+'-'+h;
}
function leMapaSalvo(cab){
  try{
    var v=localStorage.getItem(chaveMapa(cab));
    if(!v) return null;
    var m=JSON.parse(v);
    // so aceita se os indices ainda existem nessa planilha
    var ok=Object.keys(m).every(function(k){ return m[k]>=0 && m[k]<cab.length; });
    return ok?m:null;
  }catch(e){ return null; }
}
function salvaMapa(cab,mapa){
  try{ localStorage.setItem(chaveMapa(cab),JSON.stringify(mapa)); }catch(e){}
}

function pintaMapa(){
  var corpo=document.getElementById('ecImpCorpo');
  var cab=S.csv.cabecalho, mapa=S.csv.mapa, n=S.csv.linhas.length;
  var achou=Object.keys(mapa).length;

  var h='<p style="font-size:13.5px;margin:0 0 4px"><b>'+numero(n)+'</b> linhas na planilha · '
    + (S.csv.veioSalvo
        ? 'usei o de-para que você ajustou da última vez.'
        : 'reconheci <b>'+achou+'</b> de '+cab.length+' colunas.')
    +'</p>'
    +'<p style="font-size:12.5px;color:#667781;margin:0 0 16px">Confere aí embaixo. O que estiver errado, corrige no seletor — '
    +'eu guardo a correção e na próxima importação dessa planilha já vem pronto. O que não usar, deixa em "não usar".</p>'
    +'<div class="ec-mapa">';
  CAMPOS.forEach(function(c){
    var sel=mapa[c.k];
    h+='<div'+(sel!=null?' class="achou"':'')+'><label>'+esc(c.rot)+'</label><select data-k="'+c.k+'">'
      +'<option value="">— não usar —</option>'
      + cab.map(function(x,i){
          return '<option value="'+i+'"'+(sel===i?' selected':'')+'>'+esc(String(x).slice(0,60))+'</option>';
        }).join('')
      +'</select></div>';
  });
  h+='</div>';

  // prévia das 5 primeiras
  h+='<div class="ec-previa"><table><thead><tr>'
   + cab.map(function(x){ return '<th>'+esc(String(x).slice(0,30))+'</th>'; }).join('')
   +'</tr></thead><tbody>'
   + S.csv.linhas.slice(0,5).map(function(l){
       return '<tr>'+cab.map(function(_,i){ return '<td>'+esc(String(l[i]==null?'':l[i]).slice(0,40))+'</td>'; }).join('')+'</tr>';
     }).join('')
   +'</tbody></table></div>';

  h+='<div id="ecProg" style="display:none"><div class="ec-barra"><i id="ecBarra" style="width:0%"></i></div>'
   +'<div id="ecProgTxt" style="font-size:12.5px;color:#667781"></div></div>';

  corpo.innerHTML=h;

  var rod=corpo.parentNode.querySelector('.rodape');
  if(rod) rod.remove();
  var r=document.createElement('div');
  r.className='rodape';
  r.innerHTML='<button class="ec-bt" onclick="document.getElementById(\'ecImp\').remove()">Cancelar</button>'
    +'<button class="ec-bt pri" id="ecVai" onclick="ecRodaImport()">Importar '+numero(n)+' linhas</button>';
  corpo.parentNode.appendChild(r);

  corpo.querySelectorAll('select[data-k]').forEach(function(s){
    s.onchange=function(){
      var k=s.getAttribute('data-k'), v=s.value;
      if(v==='') delete S.csv.mapa[k]; else S.csv.mapa[k]=Number(v);
      salvaMapa(S.csv.cabecalho,S.csv.mapa);
    };
  });
}

window.ecRodaImport=async function(){
  var mapa=S.csv.mapa;
  if(mapa.nome==null && mapa.email==null && mapa.telefone==null && mapa.externo_id==null){
    return aviso('Preciso de pelo menos uma coluna que identifique a pessoa: e-mail, telefone ou id.','erro');
  }
  var bt=document.getElementById('ecVai'); if(bt){ bt.disabled=true; bt.textContent='Importando…'; }
  document.getElementById('ecProg').style.display='';

  var linhas=S.csv.linhas.map(function(l){
    var o={};
    Object.keys(mapa).forEach(function(k){ o[k]= l[mapa[k]]==null?'':String(l[mapa[k]]).trim(); });
    return o;
  });

  var LOTE=300, total=linhas.length, feitas=0;
  var soma={pessoas_novas:0,pessoas_atualizadas:0,pedidos_novos:0,pedidos_repetidos:0,ignoradas:0,motivos:{}};
  for(var i=0;i<total;i+=LOTE){
    var pedaco=linhas.slice(i,i+LOTE);
    var r=await api({action:'importar',client_id:S.cliente,origem:'tray',linhas:pedaco});
    if(r.error){
      aviso('Parou na linha '+(i+1)+': '+r.error,'erro');
      break;
    }
    ['pessoas_novas','pessoas_atualizadas','pedidos_novos','pedidos_repetidos','ignoradas'].forEach(function(k){
      soma[k]+=(r[k]||0);
    });
    Object.keys(r.motivos||{}).forEach(function(m){ soma.motivos[m]=(soma.motivos[m]||0)+r.motivos[m]; });
    feitas=Math.min(total,i+LOTE);
    var pct=Math.round(feitas/total*100);
    document.getElementById('ecBarra').style.width=pct+'%';
    document.getElementById('ecProgTxt').textContent=numero(feitas)+' de '+numero(total)+' linhas ('+pct+'%)';
  }
  mostraResultado(soma,feitas,total);
};

function mostraResultado(s,feitas,total){
  var corpo=document.getElementById('ecImpCorpo');
  var mot=Object.keys(s.motivos||{});
  var h='<div style="text-align:center;padding:10px 0 4px">'
   +'<div style="font-size:34px">✅</div>'
   +'<h3 style="margin:8px 0 4px;font-size:18px">Importação concluída</h3>'
   +'<p style="color:#667781;font-size:13px;margin:0">'+numero(feitas)+' de '+numero(total)+' linhas processadas</p>'
   +'</div>'
   +'<div class="ec-mini" style="margin-top:18px">'
    +'<div><div class="r">Clientes novos</div><div class="v">'+numero(s.pessoas_novas)+'</div></div>'
    +'<div><div class="r">Atualizados</div><div class="v">'+numero(s.pessoas_atualizadas)+'</div></div>'
    +'<div><div class="r">Pedidos novos</div><div class="v">'+numero(s.pedidos_novos)+'</div></div>'
    +'<div><div class="r">Pedidos repetidos</div><div class="v">'+numero(s.pedidos_repetidos)+'</div></div>'
   +'</div>';
  if(s.ignoradas){
    h+='<div style="background:#fff8e6;border:1px solid #ffe08a;border-radius:9px;padding:13px 15px;font-size:13px">'
     +'<b>'+numero(s.ignoradas)+' linhas ficaram de fora.</b><ul style="margin:7px 0 0;padding-left:18px;color:#667781">'
     + mot.map(function(m){ return '<li>'+esc(m)+': '+numero(s.motivos[m])+'</li>'; }).join('')
     +'</ul></div>';
  }
  corpo.innerHTML=h;
  var rod=corpo.parentNode.querySelector('.rodape');
  if(rod) rod.innerHTML='<button class="ec-bt pri" onclick="document.getElementById(\'ecImp\').remove();ecRecarrega()">Ver os clientes</button>';
}
window.ecRecarrega=function(){ S.pagina=0; carregaResumo(); carregaLista(); carregaSegmentos(); };

/* ---------- exportar ---------- */
window.ecExportar=async function(){
  aviso('Montando o arquivo…');
  var todas=[], pagina=0;
  while(pagina<100){
    var r=await api({action:'listar',client_id:S.cliente,busca:S.busca,ordem:S.ordem,
                     filtros:S.filtros,pagina:pagina,por_pagina:200});
    if(r.error){ return aviso(r.error,'erro'); }
    todas=todas.concat(r.itens||[]);
    if(todas.length>=(r.total||0) || !(r.itens||[]).length) break;
    pagina++;
  }
  var cab=['Nome','E-mail','Telefone','Cidade','UF','Pedidos','Total gasto','Ticket medio','Primeira compra','Ultima compra'];
  var linhas=todas.map(function(c){
    return [c.nome||'',c.email||'',c.telefone||'',c.cidade||'',c.uf||'',
            c.pedidos||0,String(c.total_gasto||0).replace('.',','),String(c.ticket_medio||0).replace('.',','),
            dataBR(c.primeira_compra),dataBR(c.ultima_compra)];
  });
  var csv=[cab].concat(linhas).map(function(l){
    return l.map(function(x){
      var s=String(x==null?'':x);
      return /[";\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s;
    }).join(';');
  }).join('\r\n');
  var blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='clientes-'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1000);
  aviso(numero(todas.length)+' clientes exportados.');
};

/* ===========================================================
   ENTRADA
   =========================================================== */
window.renderClientes=function(box,opt){
  opt=opt||{};
  css();
  S.box=box;
  // o portal passa o objeto CLIENT; o admin pode passar so o id
  var c=opt.cliente;
  S.cliente = (c && typeof c==='object') ? (c.id||'') : (c||'');
  S.nomeLoja = (c && typeof c==='object') ? (c.name||'') : '';
  S.admin=!!opt.admin;
  S.pagina=0; S.busca=''; S.filtros={}; S.itens=[]; S.total=0; S.resumo=null;
  if(!S.cliente){
    box.innerHTML='<div class="ec"><div class="ec-vazio"><h3>Escolhe um cliente</h3>'
      +'<p>A base de clientes é por loja. Selecione o cliente na barra de cima.</p></div></div>';
    return;
  }
  pinta();
  carregaResumo();
  carregaLista();
  carregaSegmentos();
  carregaFonte();
};
/* descobre se a loja tem Nuvemshop conectada, pra mostrar o botão de puxar */
async function carregaFonte(){
  try{
    var r=await apiN({action:'fonte',client_id:S.cliente});
    S.nuvem = (r&&!r.error) ? {conectado:!!r.nuvemshop, store_name:r.store_name} : null;
  }catch(e){ S.nuvem=null; }
  if(S.nuvem&&S.nuvem.conectado) pinta();
}

})();
