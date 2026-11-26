/* ============ SAVE · HISTORY · CALENDAR · DEVICE CALENDAR ============ */
const hk=()=>'ruto_h2_'+st.user,dk=()=>'ruto_del_'+st.user;
const col=()=>db.collection('users').doc(st.user).collection('deliveries');
const withTimeout=(p,ms=10000)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(Object.assign(new Error(t('cloudSlow')),{code:'timeout'})),ms))]);
const persist=()=>{st.H.sort((a,b)=>b.ts-a.ts);return SV(hk(),st.H)};
const clean=o=>JSON.parse(JSON.stringify(o)); // Firestore rejects undefined values
function cloudPut(e){
  if(!db||!FB_ON)return Promise.resolve(false);
  const data=clean(e);delete data.synced;
  return withTimeout(col().doc(String(e.id)).set(data)).then(()=>{const x=st.H.find(q=>q.id===e.id);if(x&&x.ts===e.ts){x.synced=true;persist()}return true})}

/* Saved on this device first, so saving never depends on the internet */
function saveDelivery(scheduled){
  if(!st.origin){toast(t('needOrigin'),'bad');return}
  if(!st.stops.length){toast(t('needStop'),'bad');return}
  if(!$('#date').value||!$('#time').value){toast(t('needDate'),'bad');return}
  if(!st.r){toast(t('stillRouting'),'bad');return}
  if(!st.chosen){toast(t('noOk'),'bad');return}
  if(scheduled&&depart()<new Date()){toast(t('pastDate'),'bad');return}
  const old=st.H.find(x=>x.id===st.editId),ch=st.chosen,r=st.r;
  const e=clean({id:old?old.id:Date.now(),ts:Date.now(),seq:old?(old.seq||0)+1:0,date:$('#date').value,time:$('#time').value,
    scheduled:scheduled||st.editSched,done:false,origin:st.origin,stops:st.stops,order:r.ord,round:$('#round').checked,pri:$('#pri').value,tmode:$('#tmode').value,
    veh:ch.parts[0].v.id,veh2:ch.parts[1]?.v.id||null,cost:ch.cost,fuelCost:ch.fuelCost,km:ch.km,hrs:ch.hrs});
  const i=st.H.findIndex(x=>x.id===e.id);if(i>=0)st.H[i]=e;else st.H.unshift(e);
  if(!persist()&&!db){toast(t('saveFail'),'bad');return}
  calDay=e.date;calMonth=new Date(e.date+'T00:00');
  clearForm();histUI();calUI();
  savedDialog(e,scheduled);
  cloudPut(e).then(ok=>{if(ok)setSync(t('cloudOk'),'ok')}).catch(x=>setSync(t('cloudFail')+' '+(x.code==='permission-denied'?t('cloudRules'):x.message),'bad'))}
$('#save').onclick=()=>saveDelivery(false);
$('#sched').onclick=()=>saveDelivery(true);
function setSync(msg,kind){const el=$('#syncmsg');if(el&&$('#dlg').open){el.textContent=msg;el.className='muted '+kind}else if(kind==='bad')toast(msg,'bad')}

/* ---- dialogs ---- */
function dialog(html){const d=$('#dlg');d.innerHTML=html;if(!d.open)d.showModal();d.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>d.close());return d}
const calButtons=()=>`<button class="btn p" id="dGoogle">${t('addGoogle')}</button><button class="btn" id="dIcs">${t('addDevice')}</button>`;
function wireCal(d,e){d.querySelector('#dGoogle').onclick=()=>window.open(googleUrl(e),'_blank','noopener');d.querySelector('#dIcs').onclick=()=>toDevice(e)}
function savedDialog(e,scheduled){
  const d=dialog(`<div class="okmark">✓</div><h2>${t('savedOk')}</h2>
   <p>${scheduled?t('schedOk',{d:when(e)}):when(e)}</p><p class="muted" id="syncmsg">${FB_ON&&db?t('cloudWait'):t('localOnly')}</p>
   <div class="dcol"><button class="btn p" id="dNav">${ic('g-route')} ${t('startDelivery')}</button><p class="muted">${t('startDeliveryHint')}</p>
   <p class="muted">${t('addCalQ')}</p>${calButtons()}<button class="btn" data-close>${t('done')}</button></div>`);
  d.querySelector('#dNav').onclick=()=>{d.close();NAV.start(e)};wireCal(d,e)}
function calDialog(e){const d=dialog(`<h2>${t('addCalQ')}</h2><p>${when(e)}</p><div class="dcol">${calButtons()}<p class="muted">${t('calNote')}</p><button class="btn" data-close>${t('done')}</button></div>`);wireCal(d,e)}

/* ---- device calendar (.ics works with iPhone, Android, Outlook; plus Google Calendar link) ---- */
const startOf=e=>new Date(e.date+'T'+e.time),endOf=e=>new Date(startOf(e).getTime()+Math.max(.5,e.hrs||1)*3600000);
const when=e=>startOf(e).toLocaleString('en-PH',{weekday:'short',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
const utc=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const evTitle=e=>`RUTO delivery: ${e.stops[0]?.name||''}${e.stops.length>1?' +'+(e.stops.length-1):''}`;
const evDesc=e=>[`${t('vehicle')}: ${[e.veh,e.veh2].filter(Boolean).map(id=>vById(id)?.name).join(' + ')}`,`${t('total')}: ${peso(e.cost)} · ${e.km.toFixed(1)} km`,`${t('from')}: ${e.origin.name}`,...(e.order||e.stops.map((_,i)=>i)).map((i,k)=>`${k+1}. ${e.stops[i].name} (${e.stops[i].kg} kg, ${t('c_'+e.stops[i].cargo)})`)].join('\n');
const evLoc=e=>`${e.origin.lat.toFixed(5)},${e.origin.lng.toFixed(5)}`;
const icsEsc=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,'\\$&');
const fold=line=>{const enc=new TextEncoder();let out='',n=0;for(const c of line){const b=enc.encode(c).length;if(n+b>73){out+='\r\n ';n=1}out+=c;n+=b}return out};
function icsText(list){
  return['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//RUTO//Delivery//EN','CALSCALE:GREGORIAN',...list.flatMap(e=>['BEGIN:VEVENT',`UID:ruto-${e.id}@ruto`,`SEQUENCE:${e.seq||0}`,`DTSTAMP:${utc(new Date())}`,`DTSTART:${utc(startOf(e))}`,`DTEND:${utc(endOf(e))}`,
   `SUMMARY:${icsEsc(evTitle(e))}`,`DESCRIPTION:${icsEsc(evDesc(e))}`,`LOCATION:${icsEsc(evLoc(e))}`,'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY',`DESCRIPTION:${icsEsc(evTitle(e))}`,'END:VALARM','END:VEVENT']),'END:VCALENDAR'].map(fold).join('\r\n')+'\r\n'}
function download(text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'}));a.download='ruto-delivery.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
async function toDevice(e){
  const text=icsText([e]),file=window.File&&new File([text],'ruto-delivery.ics',{type:'text/calendar'});
  if(/Android/i.test(navigator.userAgent)&&file&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:evTitle(e)});return}catch(x){if(x.name==='AbortError')return}}
  download(text);toast(t('icsDone'),'ok')}
const googleUrl=e=>'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:evTitle(e),dates:utc(startOf(e))+'/'+utc(endOf(e)),details:evDesc(e),location:evLoc(e)});

/* ---- list item used by history and calendar ---- */
function itemHTML(x){const v=vById(x.veh)||V[0],names=[x.veh,x.veh2].filter(Boolean).map(id=>vById(id)?.name).join(' + ')||v.name;
  return `<div class="hi"><div>${ic(v.icon)}</div><div class="m"><b>${esc(when(x))}</b> ${x.scheduled?`<span class="b">${t('scheduled')}</span>`:''}${x.done?`<span class="b">✓ ${t('delivered')}</span>`:''}<br><span class="muted">${esc(x.stops.map(s=>s.name).join(' → '))}<br>${names} · ${x.stops.length} ${t('stopsN')} · ${x.km.toFixed(1)} km · ${peso(x.cost)}</span></div>
   <div class="acts"><button class="btn p" data-a="nav" data-id="${+x.id}">${ic('g-route')} ${t('navigate')}</button><button class="ib" title="${t('addCalQ')}" aria-label="${t('addCalQ')}" data-a="cal" data-id="${+x.id}">${ic('g-cal')}</button><button class="ib" title="Edit" aria-label="Edit" data-a="edit" data-id="${+x.id}">${ic('edit')}</button><button class="ib d" title="Delete" aria-label="Delete" data-a="del" data-id="${+x.id}">${ic('trash')}</button></div></div>`}
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-a]');if(!b)return;const x=st.H.find(q=>q.id===+b.dataset.id);if(!x)return;
  ({nav:()=>NAV.start(x),cal:()=>calDialog(x),edit:()=>loadH(x),del:()=>delH(x)})[b.dataset.a]()});
function histUI(){$('#hlist').innerHTML=st.H.length?st.H.map(itemHTML).join(''):`<p class="muted">${t('noHist')}</p>`}
function loadH(e){const x=clean(e);st.origin=x.origin;st.stops=x.stops;st.sel={};[x.veh,x.veh2].filter(Boolean).forEach(id=>{const v=vById(id);if(v)st.sel[v.dom]=id});st.editId=x.id;st.editSched=!!x.scheduled;
  $('#date').value=x.date;$('#time').value=x.time;$('#round').checked=x.round!==false;$('#pri').value=x.pri||'balanced';$('#tmode').value=x.tmode||'auto';editNote();showView('plan');render()}
function delH(x){
  if(!confirm(t('confirmDel')))return;
  st.H=st.H.filter(q=>q.id!==x.id);persist();SV(dk(),[...new Set([...LS(dk(),[]),x.id])]);
  if(st.editId===x.id){st.editId=null;editNote()}
  histUI();calUI();toast(t('deleted'),'ok');
  if(db&&FB_ON)withTimeout(col().doc(String(x.id)).delete()).then(()=>SV(dk(),LS(dk(),[]).filter(i=>i!==x.id))).catch(e=>console.warn(e))}
function markDone(id){const x=st.H.find(q=>q.id===id);if(!x)return;x.done=true;x.ts=Date.now();persist();histUI();calUI();cloudPut(x).catch(e=>console.warn(e))}

/* Load: show device copy at once, then merge with the cloud copy */
async function loadHist(){
  let local=LS(hk(),null);if(!local)local=LS('ruto_h_'+st.user,[]);st.H=local||[];histUI();calUI();
  if(db&&FB_ON){try{
    const q=await withTimeout(col().orderBy('ts','desc').limit(300).get()),gone=new Set(LS(dk(),[])),m=new Map(),cloud=new Map();
    q.docs.forEach(d=>{const x=d.data();cloud.set(x.id,x)});
    gone.forEach(id=>col().doc(String(id)).delete().catch(()=>{}));
    const fresh=q.metadata&&!q.metadata.fromCache&&q.docs.length<300,mine=st.H.filter(x=>!(fresh&&x.synced&&!cloud.has(x.id)));
    [...cloud.values(),...mine].forEach(x=>{if(!gone.has(x.id)&&(!m.has(x.id)||x.ts>m.get(x.id).ts))m.set(x.id,x)});
    st.H=[...m.values()];st.H.forEach(x=>{if(cloud.get(x.id)?.ts===x.ts)x.synced=true});persist();histUI();calUI();
    st.H.filter(x=>!cloud.has(x.id)||cloud.get(x.id).ts<x.ts).forEach(x=>cloudPut(x).catch(e=>console.warn(e)));
  }catch(x){console.warn(x);toast(t('cloudFail')+' '+(x.code==='permission-denied'?t('cloudRules'):x.message),'bad')}}
  const today=st.H.filter(x=>x.scheduled&&!x.done&&x.date===ymd(new Date()));if(today.length)toast(t('todayN',{n:today.length}),'ok')}
/* Reminder 30 minutes before a scheduled delivery while the app is open */
const reminded=new Set();
setInterval(()=>{if(!st.user)return;st.H.forEach(x=>{const m=(startOf(x)-Date.now())/60000;if(x.scheduled&&!x.done&&m>0&&m<=30&&!reminded.has(x.id)){reminded.add(x.id);toast(t('remind',{m:Math.ceil(m),s:x.stops[0]?.name||''}),'ok')}})},30000);

/* ---- in-app calendar ---- */
let calMonth=new Date(),calDay=ymd(new Date());
function calUI(){
  const y=calMonth.getFullYear(),m=calMonth.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),loc=lang?'fil-PH':'en-PH',by={};
  st.H.forEach(x=>(by[x.date]=by[x.date]||[]).push(x));
  $('#caltitle').textContent=calMonth.toLocaleDateString(loc,{month:'long',year:'numeric'});
  let h=[0,1,2,3,4,5,6].map(i=>`<div class="dow">${new Date(2026,10,1+i).toLocaleDateString(loc,{weekday:'short'})}</div>`).join('')+'<div></div>'.repeat(first);
  for(let d=1;d<=days;d++){const k=y+'-'+pad(m+1)+'-'+pad(d),L_=(by[k]||[]).sort((a,b)=>a.time.localeCompare(b.time));
    h+=`<button type="button" class="day ${k===calDay?'sel':''} ${k===ymd(new Date())?'today':''}" data-day="${k}" aria-label="${k}, ${L_.length} ${t('deliveries')}"><b>${d}</b>${L_.slice(0,2).map(x=>`<span class="ev ${x.done?'dn':''}">${esc(x.time)} ${esc(x.stops[0]?.name||'')}</span>`).join('')}${L_.length>2?`<span class="more">+${L_.length-2}</span>`:''}${L_.length?`<i class="cnt">${L_.length}</i>`:''}</button>`}
  $('#calgrid').innerHTML=h;
  $$('#calgrid [data-day]').forEach(b=>b.onclick=()=>{calDay=b.dataset.day;calUI()});
  const list=(by[calDay]||[]).sort((a,b)=>a.time.localeCompare(b.time));
  $('#daytitle').textContent=new Date(calDay+'T00:00').toLocaleDateString(loc,{weekday:'long',month:'long',day:'numeric'});
  $('#daylist').innerHTML=list.length?list.map(itemHTML).join(''):`<p class="muted">${t('noDay')}</p>`}
const shift=n=>{calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()+n,1);calUI()};
$('#calprev').onclick=()=>shift(-1);$('#calnext').onclick=()=>shift(1);
$('#caltoday').onclick=()=>{calMonth=new Date();calDay=ymd(new Date());calUI()};
$('#calexport').onclick=()=>{const up=st.H.filter(x=>!x.done&&startOf(x)>new Date());if(!up.length){toast(t('noUpcoming'),'bad');return}download(icsText(up));toast(t('icsDone'),'ok')};
$('#caladd').onclick=()=>{if(calDay<ymd(new Date())){toast(t('pastDate'),'bad');return}clearForm();st.editSched=true;$('#date').value=calDay;showView('plan');render();toast(t('schedHint'),'ok');$('#addr').focus()};

function showView(v){
  window.scrollTo(0,0);
  ['plan','cal','hist','profile','about'].forEach(k=>$('#v_'+k).hidden=v!==k);
  $$('#sidebar [data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  if(v==='plan')setTimeout(()=>map.invalidateSize(),50);
  if(v==='cal')calUI()}
$$('#sidebar [data-v]').forEach(b=>b.onclick=()=>{showView(b.dataset.v);setSidebar(false)});
$('#profileShortcut').onclick=()=>{showView('profile');setSidebar(false)};
