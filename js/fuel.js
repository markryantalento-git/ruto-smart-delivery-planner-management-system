/* ============ FUEL PRICES (Philippines, nationwide average per liter) ============
 Refresh checks, in order of newest date: data/fuel-prices.json, Firestore document public/fuel,
 RUTO.FUEL_API_URL, and (button only) an AI web search that you must approve. */
const FK=[['gas','fGas'],['diesel','fDie'],['kero','fKer'],['ev','fEv']];
const FUEL_DEFAULT={gas:67.96,diesel:83.99,kero:109.10,ev:12,asOf:'2026-11-24',source:'fuelprice.ph',manual:false,checked:0};
{const s=LS('ruto_fuel3',null);st.fuel={...FUEL_DEFAULT,...(s||{})};st.prev=LS('ruto_fuelprev',{})}
const validFuel=d=>d&&/^\d{4}-\d{2}-\d{2}$/.test(d.asOf||'')&&['gas','diesel'].every(k=>+d[k]>20&&+d[k]<250)&&(d.kero==null||(+d.kero>20&&+d.kero<300))&&d.asOf<=ymd(new Date(Date.now()+86400000));
const saveFuel=()=>{SV('ruto_fuel3',st.fuel);SV('ruto_fuelprev',st.prev)};
function applyFuel(d){
  ['gas','diesel','kero','ev'].forEach(k=>{if(d[k]!=null&&+d[k]>0&&+d[k]!==st.fuel[k]){st.prev[k]=st.fuel[k];st.fuel[k]=+d[k]}});
  st.fuel.asOf=d.asOf;st.fuel.source=String(d.source||'').slice(0,80);st.fuel.manual=false;saveFuel()}
function fuelUI(){
  $('#fuel').innerHTML=FK.map(([k,l])=>{const p=st.prev[k],a=p&&st.fuel[k]!==p?(st.fuel[k]>p?'<span class="up">▲</span>':'<span class="dn">▼</span>'):'';
    return `<div><b>${ic('g-fuel')} ${t(l)} ${a}</b><input type="number" min="0.01" step="0.01" value="${+st.fuel[k]}" onchange="setFuel('${k}',this.value)" aria-label="${t(l)}"></div>`}).join('');
  const f=st.fuel,age=(Date.now()-new Date(f.asOf+'T00:00'))/86400000;
  $('#fuelnote').innerHTML=[f.manual?t('fManual'):t('fAsOf',{d:esc(f.asOf),s:esc(f.source)}),f.checked?t('fChecked',{t:new Date(f.checked).toLocaleString('en-PH')}):'',age>8?'<b class="late">'+t('fOld')+'</b>':'',t('fEvNote')].filter(Boolean).join('<br>')}
window.setFuel=(k,v)=>{const n=+v;if(!(n>0)){fuelUI();return}st.prev[k]=st.fuel[k];st.fuel[k]=n;if(k!=='ev'){st.fuel.manual=true;st.fuel.editedOn=ymd(new Date())}saveFuel();fuelUI();render()};
async function publishedFuel(){
  const jobs=[getJSON('data/fuel-prices.json?t='+Date.now(),{cache:'no-store'},8000)];
  if(db)jobs.push(withTimeout(db.collection('public').doc('fuel').get(),8000).then(d=>d.exists?d.data():null));
  if(RUTO.FUEL_API_URL)jobs.push(getJSON(RUTO.FUEL_API_URL,{cache:'no-store'},8000));
  const res=await Promise.allSettled(jobs);
  return res.map(r=>r.value).filter(validFuel).sort((a,b)=>b.asOf.localeCompare(a.asOf))[0]||null}
async function fetchFuel(manual){
  const btn=$('#fuelbtn');if(manual){btn.disabled=true;$('#fuelai').innerHTML='';$('#fuelbusy').textContent=t('fSearching')}
  try{
    const d=await publishedFuel(),f=st.fuel;
    // the button always loads the newest published figures; the automatic check keeps your own edits
    if(d&&(manual?d.asOf>=f.asOf||f.manual:(f.manual?d.asOf>(f.editedOn||f.asOf):d.asOf>f.asOf)))applyFuel(d);
    st.fuel.checked=Date.now();saveFuel();
    let found=false;
    if(manual&&RUTO.AI.enabled){try{found=await aiFuelLookup()}catch(e){console.warn('AI fuel search',e);$('#fuelai').innerHTML=`<p class="muted">${t('fAiFail')} ${esc(aiReason(e))}</p>`}}
    fuelUI();render();
    if(manual)toast(d||found?t('fDone',{d:st.fuel.asOf}):t('fFail'),d||found?'ok':'bad');
  }finally{if(manual){btn.disabled=false;$('#fuelbusy').textContent=''}}}
/* AI + Google Search. Results are shown with sources and applied only when you press Apply. */
async function aiFuelLookup(){
  const ai=await aiSDK(),today=ymd(new Date());
  const prompt=`Today is ${today} in the Philippines. Search the web for the latest NATIONWIDE AVERAGE retail pump prices in the Philippines (PHP per liter) for gasoline RON 91, diesel, and kerosene, preferably from the Department of Energy or news citing it. Do not use Metro Manila only figures if a nationwide average exists. Do not guess. Reply with JSON only: {"asOf":"YYYY-MM-DD","gas":number,"diesel":number,"kero":number|null,"scope":"nationwide|metro manila|other","source":"publisher name"}`;
  const{result}=await aiTry(name=>ai.mod.getGenerativeModel(ai.ai,{model:name,tools:[{googleSearch:{}}]}).generateContent(prompt));
  const res=result.response,g=res.candidates?.[0]?.groundingMetadata,m=res.text().match(/\{[\s\S]*\}/);
  if(!g?.groundingChunks?.length||!m)throw new Error(t('fNoSource'));
  const d=JSON.parse(m[0]);if(!validFuel(d)||d.asOf<st.fuel.asOf&&!st.fuel.manual)throw new Error(t('fNoNewer'));
  const box=$('#fuelai'),src=g.groundingChunks.map(c=>c.web).filter(w=>w&&/^https?:/.test(w.uri)).slice(0,5);
  box.innerHTML=`<div class="aifuel"><b>${t('fAiFound',{d:esc(d.asOf)})}</b><p>${t('fGas')} ₱${(+d.gas).toFixed(2)} · ${t('fDie')} ₱${(+d.diesel).toFixed(2)}${d.kero?` · ${t('fKer')} ₱${(+d.kero).toFixed(2)}`:''}<br><span class="muted">${esc(d.source)} · ${esc(d.scope)}</span></p>
   <p class="muted">${src.map(w=>`<a href="${esc(w.uri)}" target="_blank" rel="noopener">${esc(w.title||'source')}</a>`).join(' · ')}</p><button class="btn p" id="fuelapply">${t('apply')}</button></div>`;
  if(g.searchEntryPoint?.renderedContent){const f=document.createElement('iframe');f.setAttribute('sandbox','allow-popups allow-popups-to-escape-sandbox');f.title='Google Search suggestions';f.className='gsug';f.srcdoc='<base target="_blank">'+g.searchEntryPoint.renderedContent;box.append(f)}
  $('#fuelapply').onclick=()=>{applyFuel(d);fuelUI();render();$('#fuelapply').remove();toast(t('fDone',{d:d.asOf}),'ok')};
  return true}
$('#fuelbtn').onclick=()=>fetchFuel(true);
