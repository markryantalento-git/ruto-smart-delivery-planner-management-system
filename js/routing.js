/* ============ ROAD ROUTING + TRAFFIC + LAND/WATER DETECTION ============ */
const rad=x=>x*Math.PI/180;
const hav=(a,b)=>{const dl=rad(b.lat-a.lat),dg=rad(b.lng-a.lng),h=Math.sin(dl/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dg/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const P=a=>({lat:a[0],lng:a[1]});
const pathKm=p=>{let d=0;for(let i=1;i<p.length;i++)d+=hav(P(p[i-1]),P(p[i]));return d};
const ll=p=>[p.lat,p.lng];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function getJSON(url,opts={},ms=15000){
  const c=new AbortController(),tm=setTimeout(()=>c.abort(),ms);
  try{const res=await fetch(url,{...opts,signal:c.signal});let body=null;try{body=await res.json()}catch(e){}
    if(!res.ok&&!body?.code)throw Object.assign(new Error('HTTP '+res.status),{status:res.status});return body}
  finally{clearTimeout(tm)}}

/* ---- Traffic ESTIMATE by Philippine day/time (used when there is no TomTom key) ---- */
function trafficFactor(d){
  const h=d.getHours()+d.getMinutes()/60,day=d.getDay(),weekend=day===0||day===6;
  let f;
  if(h<5||h>=22)f=1;
  else if(!weekend)f=h<6?1.15:h<10?1.7:h<16?1.4:h<21?1.85:1.25;
  else if(day===6)f=h<10?1.2:h<20?1.5:1.2;
  else f=h<11?1.1:h<20?1.3:1.1;
  if(day===5&&h>=15&&h<22)f+=.2;                       // Friday afternoon and evening
  const dt=d.getDate();if((dt===15||dt>=30)&&h>=10&&h<22)f+=.1; // payday
  if(d.getMonth()===11&&h>=9&&h<22)f+=.15;             // December rush
  return +f.toFixed(2)}

/* ---- Is a point on water? Reads the colour of the OpenStreetMap tile at that point ---- */
const waterCache=new Map();
function isWater(p){
  const k=p.lat.toFixed(5)+','+p.lng.toFixed(5);if(waterCache.has(k))return waterCache.get(k);
  const pr=new Promise(done=>{
    const z=15,n=2**z,x=(p.lng+180)/360*n,y=(1-Math.log(Math.tan(rad(p.lat))+1/Math.cos(rad(p.lat)))/Math.PI)/2*n,
      img=new Image(),tm=setTimeout(()=>done(null),6000);
    img.crossOrigin='anonymous';
    img.onload=()=>{clearTimeout(tm);try{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
      const px=Math.min(251,Math.max(0,Math.floor((x%1)*256)-2)),py=Math.min(251,Math.max(0,Math.floor((y%1)*256)-2)),d=g.getImageData(px,py,5,5).data;let hit=0;
      for(let i=0;i<d.length;i+=4)if(Math.abs(d[i]-170)<8&&Math.abs(d[i+1]-211)<8&&Math.abs(d[i+2]-223)<8)hit++;
      done(hit>=18)}catch(e){done(null)}};
    img.onerror=()=>{clearTimeout(tm);done(null)};
    img.src=`https://tile.openstreetmap.org/${z}/${Math.floor(x)}/${Math.floor(y)}.png`});
  waterCache.set(k,pr);pr.then(v=>{if(v===null)waterCache.delete(k)});return pr}

/* ---- Road providers. Each returns alternatives: {km,sec,freeSec,path,steps,ferry,snapA,snapB,source} ---- */
let osrmQueue=Promise.resolve(),osrmLast=0;
function osrmGet(url){ // public server: about 1 request per second
  const run=osrmQueue.then(async()=>{const wait=osrmLast+1000-Date.now();if(wait>0)await sleep(wait);osrmLast=Date.now();return getJSON(url)});
  osrmQueue=run.catch(()=>{});return run}
const coord=p=>p.lng.toFixed(6)+','+p.lat.toFixed(6);
async function osrmRoute(a,b,{small}={}){
  const base=`${RUTO.OSRM}/route/v1/driving/${coord(a)};${coord(b)}?overview=full&geometries=geojson&steps=true&alternatives=3`;
  let j=await osrmGet(base+(small?'&exclude=motorway':''));
  if(small&&j?.code!=='Ok')j=await osrmGet(base);
  if(j?.code==='NoRoute'||j?.code==='NoSegment')return[];
  if(j?.code!=='Ok')throw new Error(j?.message||'routing');
  return j.routes.map(rt=>{
    const path=[],steps=[],segs=[];
    rt.legs.forEach(l=>l.steps.forEach(s=>{
      const g=s.geometry.coordinates.map(c=>[c[1],c[0]]),water=s.mode==='ferry';
      if(g.length){path.push(...g);const last=segs.at(-1);
        if(last&&last.water===water){last.path.push(...g);last.km+=s.distance/1000;last.sec+=s.duration}else segs.push({water,path:[...g],km:s.distance/1000,sec:s.duration})}
      steps.push({pt:[s.maneuver.location[1],s.maneuver.location[0]],type:s.maneuver.type,mod:s.maneuver.modifier||'',road:s.name||s.ref||'',exit:s.maneuver.exit,ferry:water})}));
    return{km:rt.distance/1000,sec:rt.duration,freeSec:rt.duration,path,steps,segs,snapA:j.waypoints[0].distance/1000,snapB:j.waypoints[1].distance/1000,source:'osrm'}})}
const TT_MOD={TURN_LEFT:'left',TURN_RIGHT:'right',SHARP_LEFT:'sharp left',SHARP_RIGHT:'sharp right',BEAR_LEFT:'slight left',BEAR_RIGHT:'slight right',KEEP_LEFT:'slight left',KEEP_RIGHT:'slight right',STRAIGHT:'straight',FOLLOW:'straight',MAKE_UTURN:'uturn',TRY_MAKE_UTURN:'uturn',ROUNDABOUT_LEFT:'left',ROUNDABOUT_RIGHT:'right',ROUNDABOUT_CROSS:'straight',ROUNDABOUT_BACK:'uturn'};
const isoLocal=d=>{const o=-d.getTimezoneOffset(),s=o>=0?'+':'-';return `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${s}${pad(Math.floor(Math.abs(o)/60))}:${pad(Math.abs(o)%60)}`};
async function tomtomRoute(a,b,{small,depart,veh}={}){
  const q=new URLSearchParams({key:RUTO.TOMTOM_KEY,traffic:'true',maxAlternatives:'2',instructionsType:'text',language:'en-GB',computeTravelTimeFor:'all',sectionType:'ferry',routeType:'fastest',
    travelMode:veh==='moto'?'motorcycle':/^t\d/.test(veh||'')?'truck':'car'});
  if(depart&&depart>new Date(Date.now()+120000))q.set('departAt',isoLocal(depart));
  if(small)q.append('avoid','motorways');
  const url=`https://api.tomtom.com/routing/1/calculateRoute/${a.lat},${a.lng}:${b.lat},${b.lng}/json?`;
  let j=await getJSON(url+q);
  if(!j?.routes&&q.get('travelMode')!=='car'){q.set('travelMode','car');j=await getJSON(url+q)}
  if(!j?.routes){const msg=JSON.stringify(j?.detailedError||j?.error||'');if(/NO_ROUTE|MAP_MATCHING/i.test(msg))return[];throw new Error(msg||'tomtom')}
  return j.routes.map(rt=>{
    const path=rt.legs.flatMap(l=>l.points.map(p=>[p.latitude,p.longitude])),
      ferries=(rt.sections||[]).filter(s=>String(s.sectionType).toUpperCase()==='FERRY').sort((x,y)=>x.startPointIndex-y.startPointIndex),
      sum=rt.summary,segs=[],cut=(i,k,water)=>{if(k>i){const p=path.slice(i,k+1);segs.push({water,path:p,km:pathKm(p),sec:0})}};
    let at=0;ferries.forEach(f=>{cut(at,f.startPointIndex,false);cut(f.startPointIndex,f.endPointIndex,true);at=f.endPointIndex});cut(at,path.length-1,false);
    const landKm=segs.filter(s=>!s.water).reduce((x,s)=>x+s.km,0)||1;
    segs.forEach(s=>s.sec=s.water?s.km/18*3600:sum.travelTimeInSeconds*s.km/Math.max(landKm,sum.lengthInMeters/1000));
    const steps=(rt.guidance?.instructions||[]).map(i=>({pt:[i.point.latitude,i.point.longitude],type:/^DEPART/.test(i.maneuver)?'depart':/^ARRIVE/.test(i.maneuver)?'arrive':/ROUNDABOUT/.test(i.maneuver)?'roundabout':'turn',
      mod:TT_MOD[i.maneuver]||'straight',road:i.street||'',exit:i.roundaboutExitNumber,text:i.message,ferry:/FERRY/.test(i.maneuver)}));
    return{km:sum.lengthInMeters/1000,sec:sum.travelTimeInSeconds,freeSec:sum.noTrafficTravelTimeInSeconds||sum.travelTimeInSeconds,path,steps,segs,
      snapA:path.length?hav(a,P(path[0])):0,snapB:path.length?hav(b,P(path.at(-1))):0,source:'tomtom'}})}

const routeCache=new Map();
async function roadAlts(a,b,o={}){
  const when=RUTO.TOMTOM_KEY&&o.depart?Math.round(o.depart/900000):0,
    k=[coord(a),coord(b),!!o.small,RUTO.TOMTOM_KEY?o.veh:'',when].join('|'),hit=routeCache.get(k);
  if(hit&&!o.fresh&&Date.now()-hit.at<300000)return hit.v;
  let v;
  if(RUTO.TOMTOM_KEY){try{v=await tomtomRoute(a,b,o)}catch(e){console.warn('TomTom failed, using OSRM',e);v=await osrmRoute(a,b,o)}}
  else v=await osrmRoute(a,b,o);
  routeCache.set(k,{at:Date.now(),v});return v}

/* ---- Choose the best alternative: fastest, or cheapest on fuel and money ---- */
function pickAlt(alts,pri){
  if(!alts.length)return null;
  const mk=Math.min(...alts.map(a=>a.km))||1,ms=Math.min(...alts.map(a=>a.sec))||1,
    w=pri==='cheap'?[.75,.25]:pri==='fast'?[.05,.95]:[.45,.55];
  return alts.reduce((x,y)=>w[0]*y.km/mk+w[1]*y.sec/ms<w[0]*x.km/mk+w[1]*x.sec/ms?y:x)}

/* ---- One leg: decides which parts are by road and which are by water ---- */
const waterSeg=(a,b)=>{const km=hav(a,b)*1.1;return{water:true,path:[ll(a),ll(b)],km,sec:km/18*3600}};
async function resolveLeg(a,b,o){
  const done=(segs,x={})=>({segs,km:segs.reduce((s,g)=>s+g.km,0),...x});
  if(o.mode==='water')return done([waterSeg(a,b)],{forced:o.mode});
  const[wa,wb]=await Promise.all([isWater(a),isWater(b)]);
  let alts;try{alts=await roadAlts(a,b,o)}catch(e){console.warn(e);throw new Error('routeFail')}
  const r=pickAlt(alts,o.pri);
  if(!r)throw new Error('noRoad');
  let segs=r.segs.map(s=>({...s,path:[...s.path]})),offroad=false,free=r.freeSec;
  const start=P(r.path[0]),end=P(r.path.at(-1));
  if(r.snapA>.3){if(wa&&o.mode!=='land')segs.unshift(waterSeg(a,start));else offroad=true}
  if(r.snapB>.3){if(wb&&o.mode!=='land')segs.push(waterSeg(end,b));else offroad=true}
  return done(segs,{road:r,offroad,freeSec:free})}

/* ---- Visit order: shortest road time / distance (nearest neighbour + 2-opt) ---- */
const tableCache=new Map();
async function visitOrder(origin,stops,round,pri){
  const pts=[origin,...stops],n=pts.length;let M=null;
  if(n>3&&n<=60){try{const url=`${RUTO.OSRM}/table/v1/driving/${pts.map(coord).join(';')}?annotations=duration,distance`,j=tableCache.get(url)||await osrmGet(url);if(j.code==='Ok')tableCache.set(url,j);
    if(j.code==='Ok')M=pts.map((a,i)=>pts.map((b,k)=>{const d=j.distances[i][k],s=j.durations[i][k];if(d==null||s==null)return hav(a,b)*3;
      return pri==='cheap'?d/1000:pri==='fast'?s/60:d/2000+s/120}))}catch(e){console.warn('table',e)}}
  if(!M)M=pts.map(a=>pts.map(b=>hav(a,b)));
  let left=stops.map((_,i)=>i+1),cur=0,ord=[];
  while(left.length){let b=0;left.forEach((x,i)=>{if(M[cur][x]<M[cur][left[b]])b=i});cur=left[b];ord.push(left.splice(b,1)[0])}
  const len=o=>{let d=M[0][o[0]];for(let i=1;i<o.length;i++)d+=M[o[i-1]][o[i]];if(round)d+=M[o.at(-1)][0];return d};
  let imp=ord.length<80;while(imp){imp=false;for(let i=0;i<ord.length-1;i++)for(let j=i+1;j<ord.length;j++){
    const m=ord.slice(0,i).concat(ord.slice(i,j+1).reverse(),ord.slice(j+1));if(len(m)<len(ord)-1e-9){ord=m;imp=true}}}
  return ord.map(i=>i-1)}

async function plan(o){
  const stops=o.stops.map(s=>({...s})),ord=await visitOrder(o.origin,stops,o.round,o.pri);
  const targets=ord.map(i=>({p:stops[i],to:i}));if(o.round)targets.push({p:o.origin,to:null});
  const legs=[];let cur=o.origin,when=new Date(o.depart);
  for(const x of targets){
    if(o.cancelled?.())throw new Error('cancelled');
    const l=await resolveLeg(cur,x.p,{mode:o.mode,pri:o.pri,depart:when});l.to=x.to;legs.push(l);
    when=new Date(when.getTime()+(l.segs.reduce((a,s)=>a+s.sec,0)+SERVICE_MIN*60)*1000);cur=x.p}
  let landKm=0,waterKm=0,landSec=0,freeSec=0,portStops=0,at=new Date(o.depart),live=false;
  legs.forEach(l=>{
    const tom=l.road?.source==='tomtom',f=tom?1:trafficFactor(at);if(tom)live=true;
    let legSec=0,legFree=0;
    l.segs.forEach(s=>{if(s.water){waterKm+=s.km;portStops++;legSec+=s.sec}else{
      const free=tom?s.sec*l.freeSec/Math.max(1,l.road.sec):s.sec;s.sec=s.sec*f;landKm+=s.km;landSec+=s.sec;freeSec+=free;legSec+=s.sec;legFree+=free}});
    at=new Date(at.getTime()+(legSec+SERVICE_MIN*60)*1000)});
  return{ord,legs,landKm,waterKm,km:landKm+waterKm,landSec,freeSec,portStops,factor:freeSec?landSec/freeSec:1,
    trafficSource:live?'tomtom':'model',estimate:legs.some(l=>l.estimate),offroad:legs.some(l=>l.offroad),forcedWater:o.mode==='water'}}
