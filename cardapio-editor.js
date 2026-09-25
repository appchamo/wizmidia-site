/* ===== Editor de Cardápio — Portal Wiz Mídia =====
   Depende de: sb (supabase client), CLIENT, toast(), esc() do index.html  */
(function(){
'use strict';

var MN = { board:null, page:null, boards:[], pages:[], hots:{}, settings:null, drawing:false };
window.MN = MN;

/* ---------- CSS ---------- */
var css = document.createElement('style');
css.textContent = `
.mn-wrap{max-width:1100px;margin:0 auto;padding-bottom:40px}
.mn-card{background:var(--panel,#1b2231);border:1px solid var(--line,#2b3448);border-radius:14px;padding:18px;margin-bottom:16px}
.mn-card h2{font-size:15px;font-weight:800;display:flex;align-items:center;gap:8px;margin-bottom:14px}
.mn-card h2 .mn-tag{margin-left:auto;font-size:11px;font-weight:700;color:var(--muted,#8b97ad);text-transform:uppercase;letter-spacing:.5px}
.mn-row{display:flex;gap:12px;flex-wrap:wrap}
.mn-f{flex:1;min-width:180px;margin-bottom:12px}
.mn-f label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted,#8b97ad);font-weight:700;margin-bottom:6px}
.mn-f input,.mn-f textarea,.mn-f select{width:100%;background:var(--panel2,#151b28);border:1px solid var(--line,#2b3448);border-radius:10px;padding:11px 12px;font-size:13.5px;color:var(--txt,#e7edf5);font-family:inherit}
.mn-f textarea{min-height:80px;resize:vertical}
.mn-f input:focus,.mn-f textarea:focus{outline:none;border-color:var(--accent,#3b82f6)}
.mn-btn{background:var(--accent,#3b82f6);color:#fff;border:none;border-radius:10px;padding:11px 16px;font-weight:700;font-size:13.5px;display:inline-flex;align-items:center;gap:7px}
.mn-btn.ghost{background:rgba(255,255,255,.06);border:1px solid var(--line,#2b3448);color:var(--txt,#e7edf5)}
.mn-btn.danger{background:rgba(214,69,69,.14);border:1px solid rgba(214,69,69,.35);color:#ff6b6b}
.mn-btn:disabled{opacity:.55}
.mn-btn.sm{padding:7px 11px;font-size:12px;border-radius:9px}
.mn-boards{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:14px}
.mn-board{border:1px solid var(--line,#2b3448);border-radius:13px;overflow:hidden;background:var(--panel2,#151b28)}
.mn-board .cv{aspect-ratio:16/10;background:#0e1420 center/cover no-repeat;position:relative;display:flex;align-items:center;justify-content:center;color:var(--muted,#8b97ad);font-size:12px}
.mn-board .bd{padding:12px}
.mn-board .bt{font-weight:800;font-size:14.5px}
.mn-board .bs{font-size:12px;color:var(--muted,#8b97ad);margin-top:3px;line-height:1.35;min-height:16px}
.mn-board .ba{display:flex;gap:6px;margin-top:11px;flex-wrap:wrap}
.mn-pill{font-size:11px;font-weight:700;padding:3px 8px;border-radius:99px;background:rgba(22,201,141,.14);color:#16c98d;border:1px solid rgba(22,201,141,.3)}
.mn-pill.off{background:rgba(255,255,255,.06);color:var(--muted,#8b97ad);border-color:var(--line,#2b3448)}
.mn-pages{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.mn-page{border:1px solid var(--line,#2b3448);border-radius:11px;overflow:hidden;background:var(--panel2,#151b28);position:relative}
.mn-page img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;background:#0e1420}
.mn-page .pn{position:absolute;top:7px;left:7px;background:rgba(0,0,0,.72);border-radius:7px;padding:3px 8px;font-size:11px;font-weight:800}
.mn-page .hp{position:absolute;top:7px;right:7px;background:rgba(201,162,39,.9);color:#191100;border-radius:7px;padding:3px 8px;font-size:11px;font-weight:800}
.mn-page .pa{display:flex;gap:5px;padding:8px}
.mn-drop{border:2px dashed var(--line,#2b3448);border-radius:12px;padding:26px;text-align:center;color:var(--muted,#8b97ad);font-size:13px;cursor:pointer}
.mn-drop:hover{border-color:var(--accent,#3b82f6);color:var(--txt,#e7edf5)}
.mn-crumb{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted,#8b97ad);margin-bottom:14px;flex-wrap:wrap}
.mn-crumb a{color:var(--accent,#3b82f6);cursor:pointer;font-weight:700;text-decoration:none}
.mn-stage{position:relative;display:inline-block;max-width:100%;border-radius:12px;overflow:hidden;border:1px solid var(--line,#2b3448);background:#0b0f18}
.mn-stage img{display:block;max-width:100%;height:auto;user-select:none;-webkit-user-drag:none}
.mn-stage.draw{cursor:crosshair}
.mn-hot{position:absolute;border:1.5px solid #c9a227;background:rgba(201,162,39,.18);border-radius:8px;cursor:pointer;display:flex;align-items:flex-start;justify-content:flex-start}
.mn-hot b{font-size:10.5px;background:#c9a227;color:#191100;padding:2px 6px;border-radius:6px;margin:-1px 0 0 -1px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mn-hot.new{border-style:dashed;background:rgba(59,130,246,.2);border-color:#3b82f6}
.mn-hint{font-size:12.5px;color:var(--muted,#8b97ad);margin:10px 0 0;line-height:1.5}
.mn-ov{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:120;display:none;align-items:center;justify-content:center;padding:16px}
.mn-ov.on{display:flex}
.mn-modal{background:var(--panel,#1b2231);border:1px solid var(--line,#2b3448);border-radius:16px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto}
.mn-modal .mh{display:flex;align-items:center;padding:16px 18px;border-bottom:1px solid var(--line,#2b3448);font-weight:800;font-size:15px}
.mn-modal .mh button{margin-left:auto;background:none;border:none;color:var(--muted,#8b97ad);font-size:20px;line-height:1}
.mn-modal .mb{padding:18px}
.mn-modal .mf{display:flex;gap:10px;padding:14px 18px;border-top:1px solid var(--line,#2b3448)}
.mn-thumbs{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.mn-thumb{position:relative;width:74px;height:74px;border-radius:9px;overflow:hidden;border:1px solid var(--line,#2b3448)}
.mn-thumb img{width:100%;height:100%;object-fit:cover}
.mn-thumb button{position:absolute;top:2px;right:2px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,.75);color:#fff;border:none;font-size:13px;line-height:1}
.mn-empty{text-align:center;color:var(--muted,#8b97ad);font-size:13px;padding:26px 10px;line-height:1.6}
.mn-link{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--panel2,#151b28);border:1px solid var(--line,#2b3448);border-radius:11px;padding:12px 14px;font-size:13px;margin-bottom:16px}
.mn-link b{font-weight:800}
.mn-link .u{color:var(--accent,#3b82f6);word-break:break-all}
`;
document.head.appendChild(css);

/* ---------- helpers ---------- */
function E(s){return (s==null?'':String(s)).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function say(m){ if(window.toast) window.toast(m); }
function busy(btn,on,txt){ if(!btn)return; btn.disabled=on; if(on){btn.dataset.old=btn.textContent;btn.textContent=txt||'Aguarde...';} else if(btn.dataset.old){btn.textContent=btn.dataset.old;} }

/* Comprime no navegador: redimensiona e converte para JPEG.
   Página de cardápio precisa de mais resolução (texto); foto de produto, menos. */
function compress(file, maxW, quality){
  return new Promise(function(resolve){
    if(!/^image\//.test(file.type||'')) return resolve(file);
    var url=URL.createObjectURL(file);
    var img=new Image();
    img.onload=function(){
      try{
        var w=img.naturalWidth, h=img.naturalHeight;
        if(w>maxW){ h=Math.round(h*maxW/w); w=maxW; }
        var c=document.createElement('canvas'); c.width=w; c.height=h;
        var x=c.getContext('2d');
        x.fillStyle='#fff'; x.fillRect(0,0,w,h);          // fundo p/ PNG transparente
        x.drawImage(img,0,0,w,h);
        c.toBlob(function(b){
          URL.revokeObjectURL(url);
          if(!b || b.size>=file.size*0.98) return resolve(file); // não piorou nada? manda o original
          b.name=(file.name||'img').replace(/\.[^.]+$/,'')+'.jpg';
          resolve(b);
        },'image/jpeg',quality||0.82);
      }catch(e){ URL.revokeObjectURL(url); resolve(file); }
    };
    img.onerror=function(){ URL.revokeObjectURL(url); resolve(file); };
    img.src=url;
  });
}

async function upload(file, folder, maxW){
  var f=await compress(file, maxW||1500, 0.82);
  var ext=((f.name||file.name||'x.jpg').split('.').pop()||'jpg').toLowerCase();
  var path=(CLIENT.id)+'/'+(folder||'geral')+'/'+Date.now()+'_'+Math.random().toString(36).slice(2,7)+'.'+ext;
  var r=await sb.storage.from('cardapio').upload(path,f,{upsert:true,contentType:f.type||'image/jpeg'});
  if(r.error) throw new Error(r.error.message);
  return sb.storage.from('cardapio').getPublicUrl(path).data.publicUrl;
}

/* ordena "Prancheta 2" antes de "Prancheta 10" e "Prancheta 11" antes de "Prancheta 11 copiar" */
function sortByName(files){
  return files.slice().sort(function(a,b){
    return (a.name||'').localeCompare((b.name||''),'pt',{numeric:true,sensitivity:'base'});
  });
}
function pickFiles(multiple, cb){
  var i=document.createElement('input');
  i.type='file'; i.accept='image/*'; if(multiple)i.multiple=true;
  i.onchange=function(){ if(i.files&&i.files.length) cb(sortByName([].slice.call(i.files))); };
  i.click();
}

/* ---------- carga ---------- */
async function loadAll(){
  var r=await Promise.all([
    sb.from('menu_settings').select('*').eq('client_id',CLIENT.id).maybeSingle(),
    sb.from('menu_boards').select('*').eq('client_id',CLIENT.id).order('sort')
  ]);
  MN.settings=r[0].data||{client_id:CLIENT.id,hero_title:CLIENT.name,hero_sub:'Toque para escolher o cardápio',wa_label:'Dúvidas? Fale conosco!'};
  MN.boards=r[1].data||[];
}
async function loadPages(boardId){
  var p=await sb.from('menu_pages').select('*').eq('board_id',boardId).order('sort');
  MN.pages=p.data||[];
  MN.hots={};
  if(MN.pages.length){
    var h=await sb.from('menu_hotspots').select('*').in('page_id',MN.pages.map(function(x){return x.id;}));
    (h.data||[]).forEach(function(x){ (MN.hots[x.page_id]=MN.hots[x.page_id]||[]).push(x); });
  }
}

/* ---------- entrada ---------- */
window.renderCardapio = async function(box){
  if(!box) return;
  box.innerHTML='<div class="mn-wrap"><div class="mn-card"><div class="mn-empty">Carregando cardápio...</div></div></div>';
  try{ await loadAll(); }catch(e){ box.innerHTML='<div class="mn-wrap"><div class="mn-card"><div class="mn-empty">Erro ao carregar: '+E(e.message)+'</div></div></div>'; return; }
  MN.box=box; viewHome();
};

/* ---------- tela: configurações + lista de cardápios ---------- */
function viewHome(){
  MN.board=null; MN.page=null;
  var s=MN.settings, url=location.origin+'/cardapio/'+CLIENT.slug;
  var h='<div class="mn-wrap">';
  h+='<div class="mn-link"><b>Link público (QR Code):</b> <span class="u">'+E(url)+'</span>'
    +'<button class="mn-btn sm ghost" id="mnCopy">Copiar</button>'
    +'<a class="mn-btn sm ghost" href="'+E(url)+'" target="_blank" style="text-decoration:none">Abrir</a>'
    +'<button class="mn-btn sm ghost" id="mnQr">Gerar QR Code</button></div>';

  h+='<div class="mn-card"><h2>Tela inicial <span class="mn-tag">o que o cliente vê ao ler o QR</span></h2>';
  h+='<div class="mn-row"><div class="mn-f"><label>Título</label><input id="mnT" value="'+E(s.hero_title||'')+'" placeholder="SEIKO"></div>'
    +'<div class="mn-f"><label>Frase abaixo do título</label><input id="mnS" value="'+E(s.hero_sub||'')+'" placeholder="Toque para escolher o cardápio"></div></div>';
  h+='<div class="mn-row"><div class="mn-f"><label>WhatsApp (só números, com DDI)</label><input id="mnW" value="'+E(s.wa_phone||'')+'" placeholder="5534999999999"></div>'
    +'<div class="mn-f"><label>Texto do botão WhatsApp</label><input id="mnWL" value="'+E(s.wa_label||'')+'" placeholder="Dúvidas? Fale conosco!"></div></div>';
  h+='<div class="mn-f"><label>Imagem de fundo</label>'
    +'<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'
    +(s.hero_bg?'<img src="'+E(s.hero_bg)+'" style="width:120px;height:74px;object-fit:cover;border-radius:9px;border:1px solid var(--line)">':'<div style="width:120px;height:74px;border-radius:9px;border:1px dashed var(--line);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted)">sem imagem</div>')
    +'<button class="mn-btn ghost sm" id="mnBg">Trocar imagem</button>'
    +(s.hero_bg?'<button class="mn-btn danger sm" id="mnBgDel">Remover</button>':'')
    +'</div></div>';
  h+='<button class="mn-btn" id="mnSave">Salvar tela inicial</button></div>';

  h+='<div class="mn-card"><h2>Cardápios <span class="mn-tag">'+MN.boards.length+' no total</span></h2>';
  if(!MN.boards.length) h+='<div class="mn-empty">Nenhum cardápio ainda.<br>Crie o primeiro (ex.: Cardápio, Carta de Vinhos, Almoço).</div>';
  else{
    h+='<div class="mn-boards">';
    MN.boards.forEach(function(b,i){
      h+='<div class="mn-board">'
        +'<div class="cv" style="'+(b.cover_url?'background-image:url('+E(b.cover_url)+')':'')+'">'+(b.cover_url?'':'sem capa')+'</div>'
        +'<div class="bd"><div class="bt">'+E(b.title||'')+'</div><div class="bs">'+E(b.subtitle||'')+'</div>'
        +'<div class="ba"><span class="mn-pill'+(b.active?'':' off')+'">'+(b.active?'ativo':'oculto')+'</span></div>'
        +'<div class="ba"><button class="mn-btn sm" data-open="'+b.id+'">Páginas</button>'
        +'<button class="mn-btn sm ghost" data-edit="'+b.id+'">Editar</button>'
        +(i>0?'<button class="mn-btn sm ghost" data-up="'+b.id+'">↑</button>':'')
        +(i<MN.boards.length-1?'<button class="mn-btn sm ghost" data-down="'+b.id+'">↓</button>':'')
        +'</div></div></div>';
    });
    h+='</div>';
  }
  h+='<div style="margin-top:14px"><button class="mn-btn" id="mnNewBoard">+ Novo cardápio</button></div></div></div>';
  MN.box.innerHTML=h;

  var $=function(id){return document.getElementById(id);};
  $('mnCopy').onclick=function(){ navigator.clipboard.writeText(url).then(function(){say('Link copiado!');},function(){say(url);}); };
  $('mnQr').onclick=function(){ qrModal(url); };
  $('mnSave').onclick=async function(){
    busy(this,true,'Salvando...');
    var body={client_id:CLIENT.id,hero_title:$('mnT').value.trim(),hero_sub:$('mnS').value.trim(),wa_phone:$('mnW').value.replace(/\D/g,''),wa_label:$('mnWL').value.trim(),hero_bg:MN.settings.hero_bg||null};
    var r=await sb.from('menu_settings').upsert(body,{onConflict:'client_id'});
    busy(this,false);
    if(r.error) say('Erro: '+r.error.message); else { MN.settings=body; say('Tela inicial salva'); }
  };
  $('mnBg').onclick=function(){ pickFiles(false, async function(fs){
    say('Enviando imagem...');
    try{ var u=await upload(fs[0],'hero',1600); MN.settings.hero_bg=u;
      await sb.from('menu_settings').upsert(Object.assign({},MN.settings,{client_id:CLIENT.id}),{onConflict:'client_id'});
      say('Imagem atualizada'); viewHome();
    }catch(e){ say('Erro no upload: '+e.message); }
  }); };
  if($('mnBgDel')) $('mnBgDel').onclick=async function(){
    MN.settings.hero_bg=null;
    await sb.from('menu_settings').upsert(Object.assign({},MN.settings,{client_id:CLIENT.id}),{onConflict:'client_id'});
    viewHome();
  };
  $('mnNewBoard').onclick=function(){ boardModal(null); };
  MN.box.querySelectorAll('[data-open]').forEach(function(el){ el.onclick=function(){ openBoard(el.dataset.open); }; });
  MN.box.querySelectorAll('[data-edit]').forEach(function(el){ el.onclick=function(){ boardModal(MN.boards.find(function(b){return b.id===el.dataset.edit;})); }; });
  MN.box.querySelectorAll('[data-up]').forEach(function(el){ el.onclick=function(){ moveBoard(el.dataset.up,-1); }; });
  MN.box.querySelectorAll('[data-down]').forEach(function(el){ el.onclick=function(){ moveBoard(el.dataset.down,1); }; });
}

async function moveBoard(id,dir){
  var i=MN.boards.findIndex(function(b){return b.id===id;});
  var j=i+dir; if(i<0||j<0||j>=MN.boards.length)return;
  var a=MN.boards[i], b=MN.boards[j];
  await Promise.all([
    sb.from('menu_boards').update({sort:b.sort}).eq('id',a.id),
    sb.from('menu_boards').update({sort:a.sort}).eq('id',b.id)
  ]);
  await loadAll(); viewHome();
}

/* ---------- modal: criar/editar cardápio ---------- */
function boardModal(b){
  var isNew=!b;
  b=b||{title:'',subtitle:'',slug:'',active:true,cover_url:null,sort:(MN.boards.length+1)};
  var tmp={cover:b.cover_url||null};
  modal((isNew?'Novo cardápio':'Editar cardápio'),
    '<div class="mn-f"><label>Nome (aparece no card)</label><input id="mbT" value="'+E(b.title||'')+'" placeholder="Cardápio Almoço"></div>'
   +'<div class="mn-f"><label>Descrição curta</label><input id="mbS" value="'+E(b.subtitle||'')+'" placeholder="Poke montado do seu jeito"></div>'
   +'<div class="mn-f"><label>Capa do card</label><div id="mbCovBox" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"></div></div>'
   +'<div class="mn-f"><label>Situação</label><select id="mbA"><option value="1"'+(b.active?' selected':'')+'>Ativo (aparece pro cliente)</option><option value="0"'+(b.active?'':' selected')+'>Oculto</option></select></div>',
    [
      (isNew?null:{label:'Excluir',cls:'danger',fn:async function(close){
        if(!confirm('Excluir "'+b.title+'" e todas as páginas dele?'))return;
        await sb.from('menu_boards').delete().eq('id',b.id);
        close(); await loadAll(); viewHome(); say('Cardápio excluído');
      }}),
      {label:'Salvar',cls:'',main:true,fn:async function(close,btn){
        var t=document.getElementById('mbT').value.trim();
        if(!t){say('Dê um nome ao cardápio');return;}
        busy(btn,true,'Salvando...');
        var body={client_id:CLIENT.id,title:t,subtitle:document.getElementById('mbS').value.trim(),
          active:document.getElementById('mbA').value==='1',cover_url:tmp.cover,
          slug:(b.slug||t).toString().normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')};
        var r;
        if(isNew){ body.sort=b.sort; r=await sb.from('menu_boards').insert(body); }
        else r=await sb.from('menu_boards').update(body).eq('id',b.id);
        busy(btn,false);
        if(r.error){say('Erro: '+r.error.message);return;}
        close(); await loadAll(); viewHome(); say('Cardápio salvo');
      }}
    ].filter(Boolean));

  function drawCover(){
    var box=document.getElementById('mbCovBox');
    box.innerHTML=(tmp.cover?'<img src="'+E(tmp.cover)+'" style="width:110px;height:70px;object-fit:cover;border-radius:9px;border:1px solid var(--line)">':'<div style="width:110px;height:70px;border-radius:9px;border:1px dashed var(--line);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted)">sem capa</div>')
      +'<button class="mn-btn ghost sm" id="mbCovBtn">Escolher imagem</button>'+(tmp.cover?'<button class="mn-btn danger sm" id="mbCovDel">Remover</button>':'');
    document.getElementById('mbCovBtn').onclick=function(){ pickFiles(false, async function(fs){
      say('Enviando...'); try{ tmp.cover=await upload(fs[0],'capas',1200); drawCover(); }catch(e){ say('Erro: '+e.message); } }); };
    if(document.getElementById('mbCovDel')) document.getElementById('mbCovDel').onclick=function(){ tmp.cover=null; drawCover(); };
  }
  drawCover();
}

/* ---------- tela: páginas de um cardápio ---------- */
async function openBoard(id){
  MN.board=MN.boards.find(function(b){return b.id===id;});
  if(!MN.board)return;
  MN.box.innerHTML='<div class="mn-wrap"><div class="mn-card"><div class="mn-empty">Carregando páginas...</div></div></div>';
  await loadPages(id);
  viewPages();
}
function viewPages(){
  var b=MN.board;
  var h='<div class="mn-wrap">';
  h+='<div class="mn-crumb"><a id="mnBackHome">← Cardápios</a> <span>/</span> <b>'+E(b.title)+'</b></div>';
  h+='<div class="mn-card"><h2>Páginas <span class="mn-tag">'+MN.pages.length+' página(s)</span></h2>';
  if(!MN.pages.length) h+='<div class="mn-empty">Nenhuma página ainda.<br>Envie as imagens do cardápio (uma por página, na ordem).</div>';
  else{
    h+='<div class="mn-pages">';
    MN.pages.forEach(function(p,i){
      var n=(MN.hots[p.id]||[]).length;
      h+='<div class="mn-page">'
        +'<div class="pn">'+(i+1)+'</div>'+(n?'<div class="hp">'+n+' produto'+(n>1?'s':'')+'</div>':'')
        +'<img src="'+E(p.image_url)+'" loading="lazy" alt="">'
        +'<div class="pa"><button class="mn-btn sm" data-hot="'+p.id+'" style="flex:1;justify-content:center">Marcar produtos</button>'
        +'<button class="mn-btn sm ghost" data-pedit="'+p.id+'">Texto</button></div>'
        +'<div class="pa" style="padding-top:0">'
        +(i>0?'<button class="mn-btn sm ghost" data-pup="'+p.id+'">←</button>':'')
        +(i<MN.pages.length-1?'<button class="mn-btn sm ghost" data-pdown="'+p.id+'">→</button>':'')
        +'<button class="mn-btn sm danger" data-pdel="'+p.id+'" style="margin-left:auto">Excluir</button></div>'
        +'</div>';
    });
    h+='</div>';
  }
  h+='<div style="margin-top:14px"><div class="mn-drop" id="mnAddPages">+ Enviar páginas (pode selecionar várias de uma vez)</div>'
    +'<div class="mn-hint">Dica: envie as imagens na ordem certa — elas entram como página 1, 2, 3... e o cliente arrasta pro lado pra passar.</div></div>';
  h+='</div></div>';
  MN.box.innerHTML=h;

  document.getElementById('mnBackHome').onclick=function(){ viewHome(); };
  document.getElementById('mnAddPages').onclick=function(){ pickFiles(true, addPages); };
  MN.box.querySelectorAll('[data-hot]').forEach(function(el){ el.onclick=function(){ openHotEditor(el.dataset.hot); }; });
  MN.box.querySelectorAll('[data-pedit]').forEach(function(el){ el.onclick=function(){ pageTextModal(MN.pages.find(function(p){return p.id===el.dataset.pedit;})); }; });
  MN.box.querySelectorAll('[data-pup]').forEach(function(el){ el.onclick=function(){ movePage(el.dataset.pup,-1); }; });
  MN.box.querySelectorAll('[data-pdown]').forEach(function(el){ el.onclick=function(){ movePage(el.dataset.pdown,1); }; });
  MN.box.querySelectorAll('[data-pdel]').forEach(function(el){ el.onclick=async function(){
    if(!confirm('Excluir esta página e os produtos marcados nela?'))return;
    await sb.from('menu_pages').delete().eq('id',el.dataset.pdel);
    await loadPages(MN.board.id); viewPages(); say('Página excluída');
  }; });
}
async function addPages(files){
  var drop=document.getElementById('mnAddPages');
  var base=MN.pages.length?Math.max.apply(null,MN.pages.map(function(p){return p.sort||0;})):0;
  for(var i=0;i<files.length;i++){
    drop.textContent='Otimizando e enviando '+(i+1)+' de '+files.length+'...';
    try{
      var u=await upload(files[i],'paginas');
      await sb.from('menu_pages').insert({board_id:MN.board.id,image_url:u,sort:base+i+1,section:'',info:''});
    }catch(e){ say('Erro em '+files[i].name+': '+e.message); }
  }
  await loadPages(MN.board.id); viewPages(); say(files.length+' página(s) adicionada(s)');
}
async function movePage(id,dir){
  var i=MN.pages.findIndex(function(p){return p.id===id;});
  var j=i+dir; if(i<0||j<0||j>=MN.pages.length)return;
  var a=MN.pages[i], b=MN.pages[j];
  await Promise.all([
    sb.from('menu_pages').update({sort:b.sort}).eq('id',a.id),
    sb.from('menu_pages').update({sort:a.sort}).eq('id',b.id)
  ]);
  await loadPages(MN.board.id); viewPages();
}
function pageTextModal(p){
  if(!p)return;
  modal('Texto sobre a página',
    '<div class="mn-f"><label>Título (aparece grande sobre a imagem)</label><input id="mpT" value="'+E(p.section||'')+'" placeholder="Entradas"></div>'
   +'<div class="mn-f"><label>Informação (linha menor abaixo)</label><textarea id="mpI" placeholder="Serve 2 pessoas · consulte o garçom">'+E(p.info||'')+'</textarea></div>'
   +'<div class="mn-hint">Deixe em branco se não quiser texto nenhum por cima da página.</div>',
    [{label:'Salvar',main:true,fn:async function(close,btn){
      busy(btn,true,'Salvando...');
      var r=await sb.from('menu_pages').update({section:document.getElementById('mpT').value.trim(),info:document.getElementById('mpI').value.trim()}).eq('id',p.id);
      busy(btn,false);
      if(r.error){say('Erro: '+r.error.message);return;}
      close(); await loadPages(MN.board.id); viewPages(); say('Texto salvo');
    }}]);
}

/* ---------- tela: marcar produtos (hotspots) ---------- */
function openHotEditor(pageId){
  MN.page=MN.pages.find(function(p){return p.id===pageId;});
  if(!MN.page)return;
  var idx=MN.pages.indexOf(MN.page)+1;
  var h='<div class="mn-wrap">';
  h+='<div class="mn-crumb"><a id="mnBackHome">← Cardápios</a> <span>/</span> <a id="mnBackPages">'+E(MN.board.title)+'</a> <span>/</span> <b>Página '+idx+'</b></div>';
  h+='<div class="mn-card"><h2>Marcar produtos <span class="mn-tag">página '+idx+'</span></h2>';
  h+='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">'
    +'<button class="mn-btn" id="mnDraw">+ Marcar um produto</button>'
    +'<button class="mn-btn ghost" id="mnBackPages2">Voltar às páginas</button></div>';
  h+='<div class="mn-hint" id="mnHint">Clique em <b>Marcar um produto</b> e depois arraste o dedo/mouse em cima do prato na imagem. Para editar um produto já marcado, clique no retângulo dourado.</div>';
  h+='<div style="margin-top:14px;text-align:center"><div class="mn-stage" id="mnStage"><img src="'+E(MN.page.image_url)+'" id="mnImg" alt=""></div></div>';
  h+='</div></div>';
  MN.box.innerHTML=h;

  document.getElementById('mnBackHome').onclick=function(){ viewHome(); };
  document.getElementById('mnBackPages').onclick=function(){ viewPages(); };
  document.getElementById('mnBackPages2').onclick=function(){ viewPages(); };
  document.getElementById('mnDraw').onclick=function(){ setDraw(!MN.drawing); };
  var img=document.getElementById('mnImg');
  if(img.complete) drawHots(); else img.onload=drawHots;
  bindDraw();
}
function setDraw(on){
  MN.drawing=on;
  var st=document.getElementById('mnStage'), b=document.getElementById('mnDraw'), hint=document.getElementById('mnHint');
  if(!st)return;
  st.classList.toggle('draw',on);
  b.textContent=on?'Cancelar marcação':'+ Marcar um produto';
  b.className=on?'mn-btn ghost':'mn-btn';
  if(hint) hint.innerHTML=on?'<b>Agora arraste em cima do prato</b> para desenhar a área que o cliente vai poder tocar.':'Clique em <b>Marcar um produto</b> e depois arraste o dedo/mouse em cima do prato na imagem. Para editar um produto já marcado, clique no retângulo dourado.';
}
function drawHots(){
  var st=document.getElementById('mnStage'); if(!st)return;
  st.querySelectorAll('.mn-hot').forEach(function(e){e.remove();});
  (MN.hots[MN.page.id]||[]).forEach(function(h){
    var d=document.createElement('div');
    d.className='mn-hot';
    d.style.cssText='left:'+h.x+'%;top:'+h.y+'%;width:'+h.w+'%;height:'+h.h+'%';
    d.innerHTML='<b>'+E(h.title||'produto')+'</b>';
    d.onclick=function(e){ e.stopPropagation(); if(!MN.drawing) hotModal(h); };
    st.appendChild(d);
  });
}
function bindDraw(){
  var st=document.getElementById('mnStage'); if(!st)return;
  var box=null, sx=0, sy=0, active=false;
  function pos(e){
    var r=st.getBoundingClientRect();
    var cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
    var cy=(e.touches?e.touches[0].clientY:e.clientY)-r.top;
    return {x:Math.max(0,Math.min(100,cx/r.width*100)), y:Math.max(0,Math.min(100,cy/r.height*100))};
  }
  function down(e){
    if(!MN.drawing)return;
    e.preventDefault(); active=true;
    var p=pos(e); sx=p.x; sy=p.y;
    box=document.createElement('div'); box.className='mn-hot new';
    box.style.cssText='left:'+sx+'%;top:'+sy+'%;width:0;height:0';
    st.appendChild(box);
  }
  function move(e){
    if(!active||!box)return;
    e.preventDefault();
    var p=pos(e);
    var x=Math.min(sx,p.x), y=Math.min(sy,p.y), w=Math.abs(p.x-sx), h=Math.abs(p.y-sy);
    box.style.cssText='left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%';
    box.dataset.r=JSON.stringify({x:x,y:y,w:w,h:h});
  }
  function up(){
    if(!active)return; active=false;
    if(!box)return;
    var r=box.dataset.r?JSON.parse(box.dataset.r):null;
    box.remove(); box=null;
    if(!r||r.w<2||r.h<1.5){ say('Área muito pequena — arraste um retângulo maior'); return; }
    setDraw(false);
    hotModal({page_id:MN.page.id,x:+r.x.toFixed(2),y:+r.y.toFixed(2),w:+r.w.toFixed(2),h:+r.h.toFixed(2),title:'',description:'',price:'',images:[]});
  }
  st.addEventListener('mousedown',down); window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
  st.addEventListener('touchstart',down,{passive:false}); st.addEventListener('touchmove',move,{passive:false}); st.addEventListener('touchend',up);
}
function hotModal(h){
  var isNew=!h.id;
  var imgs=Array.isArray(h.images)?h.images.slice():[];
  modal(isNew?'Novo produto':'Editar produto',
    '<div class="mn-f"><label>Nome do produto</label><input id="mhT" value="'+E(h.title||'')+'" placeholder="Uramaki Salmão Grelhado"></div>'
   +'<div class="mn-f"><label>Preço (opcional)</label><input id="mhP" value="'+E(h.price||'')+'" placeholder="R$ 48,00"></div>'
   +'<div class="mn-f"><label>Descrição</label><textarea id="mhD" placeholder="8 peças · salmão grelhado, cream cheese e cebolinha">'+E(h.description||'')+'</textarea></div>'
   +'<div class="mn-f"><label>Fotos do produto (2 a 3 fica ideal)</label><button class="mn-btn ghost sm" id="mhAdd">+ Adicionar fotos</button><div class="mn-thumbs" id="mhThumbs"></div></div>',
    [
      (isNew?null:{label:'Excluir',cls:'danger',fn:async function(close){
        if(!confirm('Excluir este produto?'))return;
        await sb.from('menu_hotspots').delete().eq('id',h.id);
        close(); await loadPages(MN.board.id); MN.page=MN.pages.find(function(p){return p.id===h.page_id;}); openHotEditor(h.page_id); say('Produto excluído');
      }}),
      {label:'Salvar',main:true,fn:async function(close,btn){
        var t=document.getElementById('mhT').value.trim();
        if(!t){say('Dê um nome ao produto');return;}
        busy(btn,true,'Salvando...');
        var body={page_id:h.page_id,x:h.x,y:h.y,w:h.w,h:h.h,title:t,
          price:document.getElementById('mhP').value.trim(),
          description:document.getElementById('mhD').value.trim(),
          images:imgs};
        var r=isNew?await sb.from('menu_hotspots').insert(body):await sb.from('menu_hotspots').update(body).eq('id',h.id);
        busy(btn,false);
        if(r.error){say('Erro: '+r.error.message);return;}
        close(); await loadPages(MN.board.id); MN.page=MN.pages.find(function(p){return p.id===body.page_id;}); openHotEditor(body.page_id); say('Produto salvo');
      }}
    ].filter(Boolean));

  function drawThumbs(){
    var box=document.getElementById('mhThumbs');
    box.innerHTML=imgs.map(function(u,i){ return '<div class="mn-thumb"><img src="'+E(u)+'"><button data-rm="'+i+'">×</button></div>'; }).join('')
      || '<div style="font-size:12px;color:var(--muted)">Nenhuma foto ainda.</div>';
    box.querySelectorAll('[data-rm]').forEach(function(b){ b.onclick=function(){ imgs.splice(+b.dataset.rm,1); drawThumbs(); }; });
  }
  document.getElementById('mhAdd').onclick=function(){ pickFiles(true, async function(fs){
    var btn=document.getElementById('mhAdd'); busy(btn,true,'Enviando...');
    for(var i=0;i<fs.length;i++){ try{ imgs.push(await upload(fs[i],'produtos',1200)); }catch(e){ say('Erro: '+e.message); } }
    busy(btn,false); drawThumbs();
  }); };
  drawThumbs();
}

/* ---------- QR code ---------- */
function qrModal(url){
  var src='https://api.qrserver.com/v1/create-qr-code/?size=520x520&margin=12&data='+encodeURIComponent(url);
  modal('QR Code do cardápio',
    '<div style="text-align:center"><img src="'+E(src)+'" style="width:260px;height:260px;background:#fff;border-radius:12px;padding:8px" alt="QR Code">'
   +'<div class="mn-hint" style="margin-top:12px">Aponte a câmera para testar. Clique com o botão direito na imagem para salvar, ou use o botão abaixo.</div></div>',
    [{label:'Abrir imagem grande',cls:'ghost',fn:function(){ window.open(src,'_blank'); }},
     {label:'Fechar',main:true,fn:function(close){ close(); }}]);
}

/* ---------- modal genérico ---------- */
function modal(title, bodyHtml, buttons){
  var ov=document.createElement('div');
  ov.className='mn-ov on';
  ov.innerHTML='<div class="mn-modal"><div class="mh">'+E(title)+'<button type="button">×</button></div><div class="mb">'+bodyHtml+'</div><div class="mf"></div></div>';
  document.body.appendChild(ov);
  function close(){ ov.remove(); }
  ov.querySelector('.mh button').onclick=close;
  ov.onclick=function(e){ if(e.target===ov)close(); };
  var mf=ov.querySelector('.mf');
  (buttons||[]).forEach(function(b){
    var el=document.createElement('button');
    el.className='mn-btn'+(b.cls?' '+b.cls:'');
    if(b.main)el.style.cssText='flex:1;justify-content:center';
    el.textContent=b.label;
    el.onclick=function(){ b.fn(close, el); };
    mf.appendChild(el);
  });
  return close;
}

/* ---------- detecta se o cliente tem cardápio ---------- */
window.checkHasMenu = async function(){
  try{
    var r=await sb.from('menu_boards').select('id').eq('client_id',CLIENT.id).limit(1);
    var s=await sb.from('menu_settings').select('client_id').eq('client_id',CLIENT.id).limit(1);
    window.HAS_MENU=!!((r.data&&r.data.length)||(s.data&&s.data.length));
  }catch(e){ window.HAS_MENU=false; }
  return window.HAS_MENU;
};

})();
