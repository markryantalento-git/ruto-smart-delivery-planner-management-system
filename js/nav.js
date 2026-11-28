/* ============ LIVE NAVIGATION (follows the road, reroutes, voice guidance) ============ */
const NAV=(()=>{
let N=null,nmap=null,lyr,meM,seqN=0;
const ANGLE={straight:0,'slight right':45,right:90,'sharp right':135,uturn:180,'sharp left':-135,left:-90,'slight left':-45};
const MODKEY={straight:'nStraight','slight right':'nSRight',right:'nRight','sharp right':'nShRight',uturn:'nUturn','sharp left':'nShLeft',left:'nLeft','slight left':'nSLeft'};
const dist=m=>m<1000?Math.max(10,Math.round(m/10)*10)+' m':(m/1000).toFixed(1)+' km';
function text(s){
  if(s.ferry)return t('nFerry');if(s.type==='arrive')return t('nArrive');if(s.text&&!lang)return s.text;
  const base=s.type==='depart'?t('nDepart'):/roundabout|rotary/.test(s.type)&&s.exit?t('nRound',{n:s.exit}):t(MODKEY[s.mod]||'nStraight');
  return base+(s.road?' '+t('nOnto',{r:s.road}):'')}

function build(){
  if(nmap)return;
  nmap=L.map('navmap',{zoomControl:false}).setView([14.6,120.98],15);baseMapTiles().addTo(nmap);
  if(RUTO.TOMTOM_KEY)trafficTiles().addTo(nmap);
  lyr=L.layerGroup().addTo(nmap);nmap.on('dragstart',()=>{if(N){N.follow=false;$('#nvCenter').hidden=false}})}

function here(){return new Promise(ok=>{
  if(st.me)return ok(st.me);
  if(!navigator.geolocation)return ok(st.me);
  navigator.geolocation.getCurrentPosition(p=>ok({lat:p.coords.latitude,lng:p.coords.longitude}),()=>ok(st.me),{enableHighAccuracy:true,timeout:8000,maximumAge:5000})})}

/* delivery = a saved delivery; or {queue:[place]} for a quick trip from the assistant */
async function start(d){
  stop();$('#dlg').open&&$('#dlg').close();
  $('#nav').hidden=false;document.body.classList.add('navon');build();setTimeout(()=>nmap.invalidateSize(),60);
  const land=[d.veh,d.veh2].map(vById).find(v=>v?.dom==='land'),water=[d.veh,d.veh2].map(vById).find(v=>v?.dom==='water');
  N={id:d.id||null,pri:d.pri||'balanced',tmode:d.tmode||'auto',land:land||vById('car'),water:water||vById('cargo'),queue:[],pos:null,follow:true,off:0,last:0,mute:false,sim:null,watch:null,total:0,skipped:false};
  const me=N;
  banner(null,t('locating'),'');$('#nvArrive').textContent=t('markArrived');$('#nvCenter').hidden=true;$('#navinfo').textContent='';$('#navalts').innerHTML='';
  let pos=await here();if(N!==me)return;
  if(d.queue)N.queue=d.queue.map(p=>({...p,kind:p.kind||'place'}));
  else{const o=d.order||d.stops.map((_,i)=>i);N.queue=o.map(i=>({...d.stops[i],kind:d.stops[i].kind==='support'?'support':'drop'}));if(d.round)N.queue.push({...d.origin,kind:'origin'});
    if(!pos||hav(pos,d.origin)>.3)N.queue.unshift({...d.origin,kind:'pickup'})}
  const noGps=!pos;
  if(noGps){pos=d.origin||st.origin||{lat:14.5995,lng:120.9842};if(N.queue[0]?.kind==='pickup')N.queue.shift();toast(t('noGps'),'bad')}
  N.pos=pos;N.noGps=noGps;nmap.setView(ll(pos),17);
  watch();wake();
  N.timer=setInterval(betterRoute,180000);
  await routeTo();
  if(noGps&&N===me)banner(null,t('noGps'),'')}

function watch(){
  if(!navigator.geolocation)return;
  N.watch=navigator.geolocation.watchPosition(p=>{if(!N||N.sim)return;const c=p.coords;st.me={lat:c.latitude,lng:c.longitude};showMe();
    onPos(st.me,c.accuracy,c.heading)},()=>{},{enableHighAccuracy:true,maximumAge:1000})}
async function wake(){try{if(navigator.wakeLock&&N)N.lock=await navigator.wakeLock.request('screen')}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(N&&document.visibilityState==='visible')wake()});

/* ---- route options from current position to the next point ---- */
async function options(from,to){
  const now=new Date(),f=trafficFactor(now),v=N.land;
  let alts=[];
  if(N.tmode!=='water'){const water=N.tmode==='auto'&&await isWater(to);
    if(!water){try{alts=await roadAlts(from,to,{small:v.small,veh:v.id,depart:now,fresh:true})}catch(e){console.warn(e)}}}
  if(!alts.length){const l=await resolveLeg(from,to,{mode:N.tmode,pri:N.pri,depart:now});
    alts=[l.road?{...l.road,segs:l.segs}:{segs:l.segs,steps:[],source:'direct',estimate:l.estimate}]}
  return alts.map(a=>{
    const segs=a.segs,path=segs.flatMap(s=>s.path);let km=0,sec=0,cost=0;
    segs.forEach(s=>{const w=s.water,veh=w?N.water:N.land,h=(w?s.km/veh.speed:Math.max(s.sec*(a.source==='tomtom'?1:f)*veh.tf/3600,s.km/veh.speed));
      km+=s.km;sec+=h*3600;cost+=s.km/veh.kmpl*st.fuel[veh.fuel]+h*veh.hourly});
    let steps=a.steps||[];
    if(!steps.length)steps=segs.map(s=>({pt:s.path[0],type:'turn',mod:'straight',road:'',ferry:s.water}));
    return{segs,path,km:pathKm(path),roadKm:km,sec,cost,steps:steps.map(s=>({...s})),estimate:a.estimate}})}
function prepare(r){
  const cum=[0];for(let i=1;i<r.path.length;i++)cum.push(cum[i-1]+hav(P(r.path[i-1]),P(r.path[i])));r.cum=cum;
  let from=0;r.steps.forEach(s=>{let best=from,bd=1e9;for(let i=from;i<r.path.length;i++){const d=hav(P(s.pt),P(r.path[i]));if(d<bd){bd=d;best=i}if(bd<.005&&d>.1)break}s.at=cum[best];s.said=0;from=best});
  return r}

async function routeTo(){
  const me=N,n=++seqN;if(!me||!me.queue.length)return;
  const to=me.queue[0];me.arrived=false;me.route=null;
  banner(null,t('routing'),to.name);$('#nvArrive').textContent=t('markArrived');
  let opts;try{opts=await options(me.pos,to)}catch(e){if(N===me&&n===seqN){banner(null,t(D[e.message]?e.message:'routeFail'),to.name);me.route=null}return}
  if(N!==me||n!==seqN)return;
  me.opts=opts.map(prepare);
  const fast=me.opts.reduce((a,b)=>b.sec<a.sec?b:a),cheap=me.opts.reduce((a,b)=>b.cost<a.cost?b:a);
  me.fast=fast;me.cheap=cheap;
  use(me.pri==='cheap'?cheap:me.pri==='fast'?fast:pickAlt(me.opts,me.pri));
  say(t('goingTo',{s:to.name})+'. '+text(me.route.steps[0]))}
function use(r){N.route=r;N.idx=0;N.off=0;N.along=0;draw();altsUI();update(N.pos,0);
  if(!N.follow)return;nmap.setView(ll(N.pos),17)}
function altsUI(){
  const{fast,cheap,route}=N,list=fast===cheap?[[fast,t('recommended')]]:[[fast,t('faster')],[cheap,t('saver')]];
  $('#navalts').innerHTML=list.map(([r,l],i)=>`<button class="chip ${r===route?'on':''}" data-alt="${i}"><b>${l}</b> ${fmtT(r.sec/60)} · ${r.km.toFixed(1)} km · ~${peso(r.cost)}</button>`).join('');
  $$('#navalts .chip').forEach(b=>b.onclick=()=>use(list[+b.dataset.alt][0]))}
function draw(){
  lyr.clearLayers();meM=null;
  N.opts.filter(o=>o!==N.route).forEach(o=>L.polyline(o.path,{color:'#7c879d',weight:5,opacity:.7,dashArray:'1 8'}).addTo(lyr).on('click',()=>use(o)));
  drawRoute(lyr,[{segs:N.route.segs}]);
  N.queue.forEach((s,i)=>L.marker(s,{icon:pinI(i?i+1:ic('g-pin'),!i)}).addTo(lyr).bindTooltip(esc(s.name)));
  mark(N.pos,N.heading||0)}
function mark(p,h){
  if(!meM)meM=L.marker(p,{icon:L.divIcon({className:'',html:'<div class="arrowme"><svg viewBox="0 0 24 24"><path d="M12 2l8 19-8-5-8 5z"/></svg></div>',iconSize:[40,40],iconAnchor:[20,20]}),zIndexOffset:999}).addTo(lyr);
  meM.setLatLng(p);const s=meM.getElement()?.querySelector('svg');if(s)s.style.transform=`rotate(${h}deg)`}

/* nearest point on the route: returns distance from route (km) and distance travelled (km) */
function snap(p){
  const{path,cum}=N.route,k=Math.cos(rad(p.lat));
  const scan=(a,b)=>{let best={d:1e9,along:0,i:a};for(let i=a;i<b;i++){const[y1,x1]=path[i],[y2,x2]=path[i+1],dx=(x2-x1)*k,dy=y2-y1,l=dx*dx+dy*dy,
    u=l?Math.max(0,Math.min(1,((p.lng-x1)*k*dx+(p.lat-y1)*dy)/l)):0,d=hav(p,{lat:y1+u*dy,lng:x1+u*(x2-x1)});
    if(d<best.d)best={d,along:cum[i]+u*(cum[i+1]-cum[i]),i}}return best};
  const last=path.length-1;if(last<1)return{d:hav(p,P(path[0])),along:0,i:0};
  let s=scan(Math.max(0,N.idx-3),Math.min(last,N.idx+150));if(s.d>.05)s=scan(0,last);return s}

function onPos(p,acc=10,heading){
  if(!N)return;
  const prev=N.pos;N.pos=p;
  if(heading!=null&&!isNaN(heading))N.heading=heading;
  else if(prev&&hav(prev,p)>.004)N.heading=(Math.atan2(rad(p.lng-prev.lng)*Math.cos(rad(p.lat)),rad(p.lat-prev.lat))*180/Math.PI+360)%360;
  if(N.route){mark(p,N.heading||0);if(N.follow)nmap.panTo(ll(p),{animate:true,duration:.3});update(p,acc)}}
function update(p,acc){
  const r=N.route,to=N.queue[0];if(!r||N.arrived)return;
  const s=snap(p);N.idx=s.i;N.along=s.along;
  const left=Math.max(0,r.km-s.along),sec=r.km?r.sec*left/r.km:0;
  $('#navinfo').innerHTML=`<b>${clock(new Date(Date.now()+sec*1000))}</b> <span>${t('eta')}</span> · <b>${fmtT(sec/60)}</b> · <b>${dist((left+Math.max(0,s.d))*1000)}</b> · ~${peso(r.km?r.cost*left/r.km:0)}<br><span class="muted">${t('toStop')}: ${esc(to.name)}${N.queue.length>1?' · +'+(N.queue.length-1):''}${r.estimate?' · '+t('nEstimateShort'):''}</span>`;
  if(hav(p,to)<.05||(left<.03&&s.d<.08))return arrive();
  const onWater=r.segs.length&&segAt(s.along)?.water;
  if(!onWater&&s.d>Math.max(.07,(acc||0)/1000*1.5)){if(++N.off>=3&&Date.now()-N.last>12000&&!N.sim){N.last=Date.now();toast(t('rerouting'),'ok');say(t('rerouting'));routeTo();return}}else N.off=0;
  const next=r.steps.find(x=>x.at>s.along+.012&&x.type!=='depart')||r.steps.at(-1),m=Math.max(0,(next.at-s.along)*1000);
  banner(next,text(next),dist(m));
  if(m<60&&next.said<2){next.said=2;say(text(next))}else if(m<350&&m>=60&&!next.said){next.said=1;say(t('inDist',{d:dist(m)})+', '+text(next))}}
function segAt(km){let d=0;for(const s of N.route.segs){d+=pathKm(s.path);if(km<=d)return s}return N.route.segs.at(-1)}
function banner(step,main,sub){
  $('#navarrow').innerHTML=step?.ferry?ic('g-boat'):step?.type==='arrive'?ic('g-pin'):`<svg class="i" viewBox="0 0 24 24" style="transform:rotate(${ANGLE[step?.mod]||0}deg)"><path d="M12 21V4M5 11l7-7 7 7"/></svg>`;
  $('#navmain').textContent=main;$('#navsub').textContent=sub||''}

function arrive(){
  if(N.arrived)return;N.arrived=true;simStop();
  const to=N.queue[0],last=N.queue.length===1;
  const msg=t('arrivedAt',{s:to.name});banner({type:'arrive'},msg,last?'':t('nextIs',{s:N.queue[1].name}));say(msg);
  $('#nvArrive').textContent=t(last?'finish':to.kind==='place'?'resume':'nextStop')}
function next(){
  if(!N)return;
  if(!N.arrived&&!N.skipped){const to=N.queue[0];if(!confirm(t('confirmArrive',{s:to.name})))return;if(hav(N.pos,to)>.3&&to.kind==='drop')N.skipped=true}
  simStop();N.queue.shift();
  if(!N.queue.length){const id=N.id,all=!N.skipped;say(t('tripDone'));toast(t('tripDone'),'ok');stop();if(id&&all)markDone(id);return}
  routeTo()}

async function betterRoute(){
  if(!N||!N.route||N.arrived||N.sim||!RUTO.TOMTOM_KEY)return;
  const me=N,cur=me.route,remain=cur.km?cur.sec*(cur.km-me.along)/cur.km:0;
  try{const o=(await options(me.pos,me.queue[0])).map(prepare);if(N!==me||me.route!==cur)return;
    const f=o.reduce((a,b)=>b.sec<a.sec?b:a);
    if(f.sec<remain-120&&f.sec<remain*.9){me.opts=o;me.fast=f;me.cheap=o.reduce((a,b)=>b.cost<a.cost?b:a);
      const msg=t('betterFound',{m:Math.round((remain-f.sec)/60)});toast(msg,'ok');say(msg);use(f)}}catch(e){console.warn(e)}}

/* ---- simulate movement along the active route ---- */
function simStop(){if(N?.sim){clearInterval(N.sim);N.sim=null;$('#nvSim').classList.remove('on')}}
function simToggle(){
  if(!N?.route)return;if(N.sim)return simStop();if(N.arrived)return;
  let d=N.along;const r=N.route,step=Math.max(.02,r.km/120);N.follow=true;$('#nvSim').classList.add('on');
  N.sim=setInterval(()=>{if(!N?.route)return;d=Math.min(r.km,d+step);let i=r.cum.findIndex(c=>c>=d);if(i<1)i=1;
    const a=r.path[i-1],b=r.path[i]||a,u=(d-r.cum[i-1])/((r.cum[i]-r.cum[i-1])||1);
    onPos({lat:a[0]+(b[0]-a[0])*u,lng:a[1]+(b[1]-a[1])*u},5)},250)}

function say(m){if(N&&!N.mute)speak(m,true)}
function stop(){
  if(N){simStop();clearInterval(N.timer);if(N.watch!=null)navigator.geolocation?.clearWatch(N.watch);N.lock?.release?.().catch(()=>{});window.speechSynthesis?.cancel()}
  N=null;seqN++;$('#nav').hidden=true;document.body.classList.remove('navon');if(map)setTimeout(()=>map.invalidateSize(),60)}
function detour(place){
  const p={lat:place.lat,lng:place.lng,name:place.name,kind:'place'};
  if(!N){const c=st.chosen;return start({queue:[p],veh:c?.land?.v.id||'car'})}
  if(N.queue[0]?.kind==='place')N.queue.shift();
  N.queue.unshift(p);simStop();toast(t('detourTo',{s:p.name}),'ok');return routeTo()}

$('#nvEnd').onclick=stop;
$('#nvArrive').onclick=next;
$('#nvCenter').onclick=()=>{if(N){N.follow=true;nmap.setView(ll(N.pos),17);$('#nvCenter').hidden=true}};
$('#nvMute').onclick=()=>{if(!N)return;N.mute=!N.mute;$('#nvMute').classList.toggle('on',N.mute);if(N.mute)window.speechSynthesis?.cancel()};
$('#nvSim').onclick=simToggle;
const ext=f=>{const p=N?.queue[0];if(p)window.open(f(p),'_blank','noopener')};
$('#nvG').onclick=()=>ext(p=>`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving&dir_action=navigate`);
$('#nvW').onclick=()=>ext(p=>`https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`);
return{start,stop,detour,get position(){return N?.pos||null},get active(){return!!N}}})();
