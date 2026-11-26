/* ============ TRANSLATIONS: 'English|Tagalog|Taglish' ============ */
const D={
hero:'Deliver more, spend less.|Mas maraming delivery, mas kaunting gastos.|Mas maraming delivery, mas tipid sa gastos.',
heroP:'RUTO finds the cheapest, fastest and least tiring vehicle and route for your goods, from motorcycles to trucks and boats.|Hinahanap ng RUTO ang pinakamura, pinakamabilis, at pinakamagaan na sasakyan at ruta para sa mga paninda mo, mula motorsiklo hanggang truck at bangka.|Hinahanap ng RUTO ang cheapest, fastest, at least tiring na vehicle at route para sa goods mo, from motorcycle hanggang truck at bangka.',
signin:'Sign in|Mag-sign in|Sign in',signup:'Sign up|Mag-sign up|Sign up',name:'Full name|Buong pangalan|Full name',email:'Email|Email|Email',pass:'Password (6+ characters)|Password (6 o higit pang karakter)|Password (6+ characters)',
errFill:'Fill in all fields.|Punan ang lahat ng field.|Fill in lahat ng field.',errExist:'This email is already registered.|Rehistrado na ang email na ito.|Registered na ang email na ito.',errBad:'Wrong email or password.|Mali ang email o password.|Mali ang email o password.',
orDiv:'or|o|or',google:'Continue with Google|Magpatuloy gamit ang Google|Continue with Google',apple:'Continue with Apple|Magpatuloy gamit ang Apple|Continue with Apple',errDiff:'This email is already used with another sign-in method. Use that method first.|Ginagamit na ang email na ito sa ibang paraan ng sign in. Gamitin muna iyon.|Ginagamit na ang email na ito sa ibang sign-in method. Gamitin muna iyon.',errDomain:'This domain is not authorized in Firebase. Add it under Authentication > Settings > Authorized domains.|Hindi pa authorized ang domain na ito sa Firebase. Idagdag sa Authentication > Settings > Authorized domains.|Hindi pa authorized ang domain sa Firebase. Add it sa Authentication > Settings > Authorized domains.',needFb:'Google and Apple sign-in need Firebase to be set up.|Kailangan ang Firebase setup para sa Google at Apple sign-in.|Kailangan ng Firebase setup para sa Google at Apple sign-in.',pill:'Smart delivery planner|Matalinong tagaplano ng delivery|Smart delivery planner',stV:'12 vehicle types|12 uri ng sasakyan|12 vehicle types',stL:'3 languages|3 wika|3 languages',stC:'Cold-chain tips|Payo sa malamig na paninda|Cold-chain tips',featH:'Everything you need to deliver smarter|Lahat ng kailangan para mas matalino ang delivery|Lahat ng kailangan para mas smart ang delivery',f1t:'Map and route|Mapa at ruta|Map at route',f1p:'Pin unlimited drop-offs and get the shortest drop-off order.|Mag-pin ng walang limit na drop-off at makuha ang pinakamaikling pagkakasunod-sunod.|Mag-pin ng unlimited drop-offs at makuha ang shortest order.',f2t:'Best vehicle|Pinakamainam na sasakyan|Best vehicle',f2p:'From motorcycles to trucks and boats, compared by cost, time, and effort.|Mula motorsiklo hanggang truck at bangka, hinahambing sa gastos, oras, at pagod.|From motorcycle hanggang truck at bangka, compared by cost, time, at effort.',f3t:'Fuel cost|Gastos sa gasolina|Fuel cost',f3p:'Set gasoline, diesel, and power prices and see the real cost of every trip.|Ilagay ang presyo ng gasolina, diesel, at kuryente at makita ang tunay na gastos.|Ilagay ang price ng gasoline, diesel, at kuryente para makita ang real cost.',f4t:'Fresh and safe|Sariwa at ligtas|Fresh at safe',f4p:'Ice, cooler, and time-limit advice for meat, frozen food, and medicine.|Payo sa yelo, cooler, at oras para sa karne, frozen, at gamot.|Advice sa ice, cooler, at time limit para sa karne, frozen, at gamot.',howH:'How it works|Paano gumagana|How it works',s1:'Pin your pickup and drop-offs|I-pin ang pickup at mga drop-off|I-pin ang pickup at drop-offs',s2:'Add your goods, date, and time|Ilagay ang paninda, petsa, at oras|Add ang goods, date, at time',s3:'Get the best vehicle, route, ETA, and cost|Makuha ang best na sasakyan, ruta, ETA, at gastos|Get the best vehicle, route, ETA, at cost',ctaH:'Ready to save on your next delivery?|Handa ka na bang makatipid sa susunod mong delivery?|Ready ka na bang makatipid sa next delivery mo?',ctaB:'Start now|Magsimula na|Start na',foot:'RUTO · Transportation and Delivery Least Cost System|RUTO · Sistema ng Pinakamurang Transportasyon at Delivery|RUTO · Transportation at Delivery Least Cost System',plan:'Plan|Plano|Plan',hist:'History|Kasaysayan|History',logout:'Sign out|Mag-sign out|Sign out',
locs:'Pickup and drop-offs|Pickup at mga drop-off|Pickup at drop-offs',addrL:'Type an address or place, or coordinates|Mag-type ng address, lugar, o coordinates|Type ng address, place, o coordinates',addrPh:'e.g. SM North EDSA, Quezon City|hal. SM North EDSA, Quezon City|e.g. SM North EDSA, Quezon City',
addDrop:'Add drop-off|Magdagdag ng drop-off|Add drop-off',addOrg:'Set as origin|Gawing origin|Set as origin',gps:'Use my location as origin|Gamitin ang lokasyon ko bilang origin|Gamitin ang location ko as origin',clear:'Clear all|Burahin lahat|Clear all',
clickHint:'You can also click the map: first click is the origin, the rest are drop-offs.|Pwede ring i-click ang mapa: ang una ay origin, ang susunod ay drop-off.|Pwede ring i-click ang map: first click ay origin, next ay drop-offs.',
stops:'Drop-offs|Mga drop-off|Drop-offs',nostop:'No drop-offs yet.|Wala pang drop-off.|Wala pang drop-off.',when:'Date and time|Petsa at oras|Date at time',date:'Delivery date|Petsa ng delivery|Delivery date',time:'Departure time|Oras ng alis|Oras ng alis',
round:'Return to origin|Babalik sa origin|Balik sa origin',prio:'Priority|Priyoridad|Priority',pBal:'Balanced|Balanse|Balanced',pCheap:'Cheapest|Pinakamura|Cheapest',pFast:'Fastest|Pinakamabilis|Fastest',pEasy:'Least tiring|Pinakamagaan|Least tiring',save:'Save delivery|I-save ang delivery|I-save ang delivery',
fuelH:'Fuel prices (per liter)|Presyo ng gasolina (kada litro)|Fuel prices (kada liter)',refresh:'Refresh prices|I-refresh ang presyo|Refresh prices',fGas:'Gasoline|Gasolina|Gasoline',fDie:'Diesel|Diesel|Diesel',fKer:'Kerosene|Kerosene|Kerosene',fEv:'Electricity (per kWh)|Kuryente (kada kWh)|Kuryente (per kWh)',
fN1:'Editable. Gasoline default is the Nov 17, 2026 Metro Manila estimate; other values are placeholders. Prices change every Tuesday.|Pwedeng baguhin. Ang default ng gasolina ay estimate sa Metro Manila noong Nob 17, 2026; placeholder ang iba. Nagbabago ang presyo tuwing Martes.|Editable. Ang default ng gasoline ay Metro Manila estimate noong Nov 17, 2026; placeholder ang iba. Nagbabago ang price every Tuesday.',
fN2:'No price feed is set (FUEL_API_URL). Enter prices manually from DOE or your station.|Walang naka-set na price feed (FUEL_API_URL). Ilagay ang presyo mula sa DOE o sa istasyon.|Walang price feed (FUEL_API_URL). Ilagay manually ang price from DOE o sa station.',
fOk:'Updated|Na-update|Updated',fFail:'Could not fetch prices.|Hindi makakuha ng presyo.|Hindi makakuha ng prices.',
empty:'Add an origin and at least one drop-off to see the best vehicle, route, ETA and cost.|Maglagay ng origin at kahit isang drop-off para makita ang best na sasakyan, ruta, ETA, at gastos.|Add ng origin at at least one drop-off para makita ang best vehicle, route, ETA, at cost.',
best:'Best option|Pinakamainam|Best option',chosen:'Your choice|Napili mo|Your choice',total:'Total cost|Kabuuang gastos|Total cost',dur:'Travel time|Oras ng biyahe|Travel time',dist:'Distance|Layo|Distance',saved:'Saved vs most expensive|Natipid vs pinakamahal|Tipid vs pinakamahal',rush:'Rush hour: slower travel|Rush hour: mas mabagal|Rush hour: mas slow',
tipsH:'What to do with your goods|Ano ang dapat gawin sa mga paninda|Ano ang dapat gawin sa goods mo',gen:'You have perishable or urgent goods, so RUTO now prioritizes speed. Put them nearest the door, ask receivers to be ready, and take a photo on delivery.|May paninda kang madaling masira o apurahan, kaya bilis ang priority ng RUTO. Ilagay sa malapit sa pinto, paalalahanan ang tatanggap, at kunan ng litrato pagdating.|May perishable o urgent goods ka, kaya speed ang priority ng RUTO. Ilagay malapit sa pinto, paalalahanan ang receiver, at mag-photo pagdating.',
vehH:'Choose a vehicle|Pumili ng sasakyan|Pumili ng vehicle',cap:'Up to|Hanggang|Up to',noCap:'Not suitable|Hindi angkop|Hindi suitable',needClosed:'Needs an enclosed vehicle|Kailangan ng saradong sasakyan|Kailangan ng enclosed vehicle',capShort:'Capacity too small|Kulang ang kapasidad|Kulang ang capacity',
etaH:'Drop-off order and ETA|Pagkakasunod-sunod at ETA|Drop-off order at ETA',play:'Watch the trip|Panoorin ang biyahe|Watch the trip',stop:'Drop-off|Drop-off|Drop-off',cargo:'Cargo|Kargamento|Cargo',kg:'Weight|Timbang|Weight',leg:'Distance|Layo|Layo',eta:'ETA|ETA|ETA',late:'late for|huli sa|late sa',unsafe:'too long for safe delivery|lampas sa ligtas na oras|lampas sa safe time',back:'Back to origin|Balik sa origin|Balik sa origin',firstTrip:'ETA is for the first trip.|Ang ETA ay para sa unang biyahe.|ETA ay for first trip.',by:'Arrive before|Dapat dumating bago|Arrive before',
cmpH:'Compare all options|Paghambingin ang lahat|Compare lahat ng options',vehicle:'Vehicle|Sasakyan|Vehicle',cost:'Cost|Gastos|Cost',fuelC:'Fuel|Gasolina|Fuel',labor:'Driver/rental|Driver/rental|Driver/rental',effort:'Effort|Pagod|Pagod',trips:'Trips|Biyahe|Trips',low:'Lowest|Pinakamababa|Lowest',L1:'Low|Mababa|Low',L2:'Medium|Katamtaman|Medium',L3:'High|Mataas|High',
c1H:'Cost per vehicle|Gastos kada sasakyan|Cost per vehicle',c2H:'Cost split per leg|Hati ng gastos kada leg|Cost split per leg',
histH:'Recent deliveries|Mga huling delivery|Recent deliveries',noHist:'No saved deliveries yet.|Wala pang naka-save na delivery.|Wala pang saved deliveries.',stopsN:'stops|drop-off|stops',
locH:'Turn on your location|I-on ang lokasyon mo|I-on ang location mo',locP:'RUTO needs your location for accurate tracking and to start routes from where you are.|Kailangan ng RUTO ang lokasyon mo para sa tumpak na tracking at para magsimula ang ruta kung nasaan ka.|Kailangan ng RUTO ang location mo para sa accurate tracking at para magstart ang route kung nasaan ka.',locBtn:'Allow location|Payagan ang lokasyon|Allow location',locSkip:'Continue without location (not recommended)|Magpatuloy nang walang lokasyon (hindi inirerekomenda)|Continue without location (not recommended)',
locDenied:'Location is blocked. Allow it in your browser settings, then try again.|Naka-block ang lokasyon. I-allow sa browser settings, saka subukan ulit.|Naka-block ang location. I-allow sa browser settings, then try again.',
noOk:'No vehicle fits. Reduce the load or split the delivery.|Walang sasakyang pasok. Bawasan ang kargamento o hatiin ang delivery.|Walang vehicle na pasok. Bawasan ang load o hatiin ang delivery.',notFound:'Place not found. Try a more specific address.|Hindi nahanap ang lugar. Subukan ang mas tiyak na address.|Hindi nahanap ang place. Try ng mas specific na address.',
c_box:'Parcel|Parcel|Parcel',c_fragile:'Fragile|Marupok|Fragile',c_meat:'Meat and fish|Karne at isda|Meat at fish',c_cold:'Frozen goods|Frozen|Frozen goods',c_food:'Hot food|Mainit na pagkain|Hot food',c_produce:'Fruits and vegetables|Prutas at gulay|Fruits at gulay',c_elec:'Electronics|Electronics|Electronics',c_heavy:'Heavy goods|Mabibigat|Heavy goods',c_med:'Medicine|Gamot|Medicine'};
const TIPS={
meat:'Use an insulated cooler with ice or ice packs, keep it at 4°C or colder, load it last so it comes off first, and deliver within 2 hours. Avoid midday heat and keep the cooler shut.|Gumamit ng insulated cooler na may yelo o ice pack, panatilihing 4°C pababa, ilagay sa huli para unang maibaba, at ihatid sa loob ng 2 oras. Iwasan ang tanghaling init at huwag buksan ang cooler.',
cold:'Frozen goods need dry ice or gel packs to stay at -18°C or colder. Pre-chill the box, seal it, and go straight to the drop-off with no detours.|Kailangan ng dry ice o gel pack ang frozen para manatiling -18°C pababa. I-pre-chill ang kahon, i-seal, at dumiretso sa drop-off.',
food:'Hot food should arrive within 1 hour. Use an insulated bag, keep it upright, and make it the first stop.|Dapat dumating sa loob ng 1 oras ang mainit na pagkain. Gumamit ng insulated bag, ilagay nang patayo, at gawing unang stop.',
produce:'Keep produce shaded and ventilated, never stack heavy items on top, and deliver within 4 hours. Add a little ice for leafy greens.|Ilagay sa lilim at may hangin ang prutas at gulay, huwag patungan ng mabigat, at ihatid sa loob ng 4 na oras. Lagyan ng kaunting yelo ang malalabay na gulay.',
med:'Medicine and vaccines need a validated cold box (2 to 8°C) with a thermometer. Deliver within 3 hours and never leave it in a hot vehicle.|Kailangan ng cold box (2 hanggang 8°C) na may thermometer ang gamot at bakuna. Ihatid sa loob ng 3 oras at huwag iwan sa mainit na sasakyan.',
fragile:'Pad with bubble wrap, mark it Fragile, load it on top, and avoid rough roads and sudden braking.|Balutin ng bubble wrap, lagyan ng Fragile, ilagay sa ibabaw, at iwasan ang lubak at biglang preno.',
elec:'Keep it dry, use anti-static padding, and use an enclosed vehicle away from rain.|Panatilihing tuyo, gumamit ng anti-static padding, at saradong sasakyan para sa ulan.',
heavy:'Check the vehicle load limit, secure with straps, and bring helpers for unloading.|Alamin ang load limit ng sasakyan, itali nang maayos, at magdala ng tutulong sa pagbaba.',
box:'Seal and label every parcel with address and contact number, and group parcels by drop-off.|I-seal at lagyan ng address at contact number ang bawat parcel, at pagsama-samahin ayon sa drop-off.'};
const MAXMIN={meat:120,cold:90,food:60,produce:240,med:180};
const CLOSED=['fragile','meat','cold','food','elec','med'],PERISH=['meat','cold','food','med'];
const CI={box:'g-box',fragile:'g-glass',meat:'g-meat',cold:'g-snow',food:'g-food',produce:'g-leaf',elec:'g-laptop',heavy:'g-weight',med:'g-pill'};
let lang=+localStorage.getItem('ruto_lang')||0;
const t=k=>(D[k]||k).split('|')[lang]||(D[k]||k).split('|')[0];
const tip=k=>TIPS[k].split('|')[lang?1:0];
function applyLang(){
  document.documentElement.lang=['en','tl','tl'][lang];
  document.querySelectorAll('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));
  document.querySelectorAll('[data-ip]').forEach(e=>e.placeholder=t(e.dataset.ip));
  document.querySelectorAll('.lang').forEach(s=>s.value=lang);
  authMode(mode);if(st.user){fuelUI();histUI();render()}
}
document.querySelectorAll('.lang').forEach(s=>s.onchange=e=>{lang=+e.target.value;localStorage.setItem('ruto_lang',lang);applyLang()});

/* ============ THEME ============ */
function applyTheme(m){document.documentElement.dataset.theme=m;localStorage.setItem('ruto_theme',m);
  document.querySelectorAll('.th use').forEach(u=>u.setAttribute('href',m==='dark'?'#sun':'#moon'));if(st.r)render()}
document.querySelectorAll('.th').forEach(b=>b.onclick=()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

/* ============ DATA: edit vehicles here ============
 kmpl = km per liter (km per kWh for EV) · cap = kg · speed = km/h · hourly = driver/rental ₱/h
 effort 1 (easy) to 5 (tiring) · f = distance factor (boats go straighter than roads) */
const V=[
{id:'moto',name:'Motorcycle',icon:'g-moto',fuel:'gas',kmpl:40,cap:30,speed:40,hourly:90,effort:5,closed:false,f:1},
{id:'etrike',name:'E-Trike / E-Bike',icon:'g-etrike',fuel:'ev',kmpl:20,cap:120,speed:22,hourly:90,effort:3,closed:false,f:1},
{id:'trike',name:'Tricycle',icon:'g-trike',fuel:'gas',kmpl:25,cap:150,speed:25,hourly:100,effort:4,closed:false,f:1},
{id:'car',name:'Four-Wheeler Car',icon:'g-car',fuel:'gas',kmpl:12,cap:300,speed:35,hourly:150,effort:2,closed:true,f:1},
{id:'jeep',name:'Jeepney',icon:'g-bus',fuel:'diesel',kmpl:7,cap:1000,speed:25,hourly:250,effort:3,closed:false,f:1},
{id:'van',name:'Van / L300',icon:'g-van',fuel:'diesel',kmpl:9,cap:1200,speed:35,hourly:300,effort:2,closed:true,f:1},
{id:'pickup',name:'Pick-up Truck',icon:'g-pickup',fuel:'diesel',kmpl:9,cap:1000,speed:35,hourly:300,effort:3,closed:false,f:1},
{id:'t2',name:'Truck 2 Tons',icon:'g-truck',fuel:'diesel',kmpl:6,cap:2000,speed:30,hourly:450,effort:2,closed:true,f:1},
{id:'t5',name:'Truck 5 Tons (6-Wheeler)',icon:'g-truck2',fuel:'diesel',kmpl:4.5,cap:5000,speed:28,hourly:650,effort:2,closed:true,f:1},
{id:'t10',name:'Wing Van 10 Tons',icon:'g-truck2',fuel:'diesel',kmpl:3,cap:10000,speed:26,hourly:900,effort:2,closed:true,f:1},
{id:'bangka',name:'Bangka (Motorized Boat)',icon:'g-boat',fuel:'gas',kmpl:3,cap:500,speed:20,hourly:200,effort:4,closed:false,f:.85},
{id:'cargo',name:'Cargo Boat / RoRo',icon:'g-ship',fuel:'diesel',kmpl:.8,cap:8000,speed:18,hourly:900,effort:2,closed:true,f:.85}];
const FUEL_API_URL=''; // returns {"gas":60.2,"diesel":58,"kero":70,"ev":12}; auto-checked on load and every 30 min
const SERVICE_MIN=6,ROAD=1.3,MAXTRIPS=5;

/* ============ HELPERS / STATE ============ */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const peso=n=>'₱'+Math.round(n).toLocaleString('en-PH');
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const ic=(n,c='')=>`<svg class="i ${c}"><use href="#${n}"/></svg>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const st={user:null,origin:null,stops:[],sel:null,editId:null,fuel:LS('ruto_fuel',{gas:60.2,diesel:58,kero:70,ev:12}),prev:LS('ruto_fuelprev',{}),fuelAt:'',r:null,chosen:null,anim:null,me:null};
let mode='in',map,layer,meMk,c1,c2;

/* ============ FIREBASE: paste your own config from Firebase Console > Project settings > Your apps ============
   If left as PASTE_..., RUTO falls back to the local demo login (stored only in this browser). */
const FIREBASE_CONFIG={apiKey:'AIzaSyDrQ3UJJ9X4UJn_dFYnZaRQCOXlBwC_7SU',authDomain:'ruto-6b418.firebaseapp.com',projectId:'ruto-6b418',storageBucket:'ruto-6b418.firebasestorage.app',messagingSenderId:'581496990651',appId:'1:581496990651:web:2e326f6ac748190900329e'};
const FB_ON=!FIREBASE_CONFIG.apiKey.startsWith('PASTE');let auth,db,busy=false;
if(FB_ON){firebase.initializeApp(FIREBASE_CONFIG);auth=firebase.auth();db=firebase.firestore()}
const fbErr=x=>({'auth/email-already-in-use':t('errExist'),'auth/invalid-credential':t('errBad'),'auth/wrong-password':t('errBad'),'auth/user-not-found':t('errBad'),'auth/weak-password':t('pass'),'auth/invalid-email':t('email'),'auth/account-exists-with-different-credential':t('errDiff'),'auth/unauthorized-domain':t('errDomain')})[x.code]||x.message;
/* ============ AUTH ============ */
const sha=async s=>crypto.subtle?[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('ruto:'+s)))].map(b=>b.toString(16).padStart(2,'0')).join(''):btoa(s);
function authMode(m){mode=m;$$('#auth .tabs .btn').forEach(b=>b.classList.toggle('on',b.dataset.m===m));$('#nmw').hidden=m==='in';$('#sub').textContent=t(m==='in'?'signin':'signup');$('#err').textContent=''}
$$('#auth .tabs .btn').forEach(b=>b.onclick=()=>authMode(b.dataset.m));
$('#auth').onsubmit=async e=>{e.preventDefault();
  const em=$('#em').value.trim().toLowerCase(),pw=$('#pw').value,nm=$('#nm').value.trim(),U=LS('ruto_users',{});
  if(!em||!pw||(mode==='up'&&!nm)){$('#err').textContent=t('errFill');return}
  if(FB_ON){try{
    if(mode==='up'){busy=true;const c=await auth.createUserWithEmailAndPassword(em,pw);await c.user.updateProfile({displayName:nm});
      await db.collection('users').doc(c.user.uid).set({name:nm,email:em,createdAt:firebase.firestore.FieldValue.serverTimestamp()});enter(c.user.uid,nm);busy=false}
    else{const c=await auth.signInWithEmailAndPassword(em,pw);enter(c.user.uid,c.user.displayName||em)}
  }catch(x){busy=false;$('#err').textContent=fbErr(x)}return}
  const h=await sha(em+pw);
  if(mode==='up'){if(U[em]){$('#err').textContent=t('errExist');return}U[em]={name:nm,h};SV('ruto_users',U)}
  else if(!U[em]||U[em].h!==h){$('#err').textContent=t('errBad');return}
  SV('ruto_session',em);enter(em,U[em].name)};
$('#out').onclick=async()=>{localStorage.removeItem('ruto_session');if(FB_ON)await auth.signOut();location.reload()};

/* ============ GOOGLE / APPLE SIGN-IN ============ */
async function social(kind){
  if(!FB_ON){$('#err').textContent=t('needFb');return}
  const pr=kind==='google'?new firebase.auth.GoogleAuthProvider():new firebase.auth.OAuthProvider('apple.com');
  if(kind==='apple'){pr.addScope('email');pr.addScope('name')}
  try{busy=true;const c=await auth.signInWithPopup(pr),u=c.user;
    if(c.additionalUserInfo&&c.additionalUserInfo.isNewUser)await db.collection('users').doc(u.uid).set({name:u.displayName||'',email:u.email||'',provider:kind,createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    enter(u.uid,u.displayName||u.email||'User');busy=false}
  catch(x){busy=false;if(!['auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(x.code))$('#err').textContent=fbErr(x)}}
$('#gbtn').onclick=()=>social('google');$('#abtn').onclick=()=>social('apple');
$('#cta').onclick=()=>{$('#auth').scrollIntoView({behavior:'smooth',block:'center'});$('#em').focus()};
if(matchMedia('(prefers-reduced-motion:reduce)').matches)$$('animateMotion,animate').forEach(a=>a.remove());
(function(){const els=$$('#land .sec>h2,#land .fc,#land .st,#land .cta');els.forEach((e,i)=>{e.classList.add('rv');e.style.setProperty('--d',i%6)});
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches){els.forEach(e=>e.classList.add('in'));return}
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.15});els.forEach(e=>io.observe(e))})();

/* ============ ENTER APP + LOCATION GATE ============ */
function enter(em,name){
  if(st.user)return;st.user=em;$('#land').hidden=true;$('#app').hidden=false;$('#who').textContent=name;
  initMap();$('#date').value=new Date().toISOString().slice(0,10);fuelUI();loadHist();applyLang();askLoc();fetchFuel(true);
  setInterval(()=>fetchFuel(true),1800000)}
function askLoc(){
  if(!navigator.geolocation){$('#gate').hidden=false;return}
  navigator.geolocation.getCurrentPosition(p=>{$('#gate').hidden=true;track(p)},()=>{$('#gate').hidden=false;$('#locP').textContent=t('locDenied')},{enableHighAccuracy:true,timeout:15000});
}
function track(p){
  st.me={lat:p.coords.latitude,lng:p.coords.longitude};
  if(!st.origin){st.origin={...st.me,name:'My location'};map.setView(st.me,14);render()}
  navigator.geolocation.watchPosition(q=>{st.me={lat:q.coords.latitude,lng:q.coords.longitude};
    meMk?.setLatLng(st.me)||(meMk=L.marker(st.me,{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[16,16]})}).addTo(map))},()=>{},{enableHighAccuracy:true});
}
$('#locbtn').onclick=askLoc;$('#locskip').onclick=e=>{e.preventDefault();$('#gate').hidden=true};

/* ============ MAP ============ */
function initMap(){
  map=L.map('map').setView([14.5995,120.9842],12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
  layer=L.layerGroup().addTo(map);
  map.on('click',e=>addPoint(e.latlng.lat,e.latlng.lng));
  new ResizeObserver(()=>map.invalidateSize()).observe($('#map'));
}
function addPoint(lat,lng,name,asOrigin){
  if(asOrigin||!st.origin)st.origin={lat,lng,name:name||'Origin'};
  else st.stops.push({lat,lng,name:name||'Drop-off '+(st.stops.length+1),kg:10,cargo:'box',by:''});
  render()}
const pinI=(x,o)=>L.divIcon({className:'',html:`<div class="pin ${o?'o':''}"><b>${x}</b></div>`,iconSize:[30,30],iconAnchor:[15,30]});
function drawMap(r){
  layer.clearLayers();const pts=[];
  if(st.origin){L.marker(st.origin,{icon:pinI(ic('g-warehouse'),1)}).addTo(layer);pts.push(st.origin)}
  if(r){const path=[st.origin,...r.ord.map(i=>st.stops[i])];if(st.round)path.push(st.origin);
    L.polyline(path,{color:'#FFB020',weight:5,opacity:.9}).addTo(layer);
    r.ord.forEach((i,k)=>{const s=st.stops[i];L.marker(s,{icon:pinI(k+1)}).addTo(layer).bindPopup(esc(s.name)+(s.eta?'<br>ETA '+s.eta:''));pts.push(s)})}
  else st.stops.forEach((s,i)=>{L.marker(s,{icon:pinI(i+1)}).addTo(layer);pts.push(s)});
  if(pts.length>1)map.fitBounds(L.latLngBounds(pts.map(p=>[p.lat,p.lng])),{padding:[40,40]});
  else if(pts.length===1)map.setView(pts[0],14)}

/* ============ GEOCODING (manual add) ============ */
async function geocode(q){
  const m=q.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);if(m)return{lat:+m[1],lng:+m[2]};
  try{const d=await(await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ph&q='+encodeURIComponent(q))).json();
    return d.length?{lat:+d[0].lat,lng:+d[0].lon}:null}catch(e){return null}}
async function addByText(asOrigin){
  const q=$('#addr').value.trim();if(!q)return;
  const p=await geocode(q);if(!p){alert(t('notFound'));return}
  addPoint(p.lat,p.lng,q,asOrigin);$('#addr').value='';map.setView(p,15)}
$('#addDrop').onclick=()=>addByText(false);$('#addOrg').onclick=()=>addByText(true);
$('#addr').onkeydown=e=>{if(e.key==='Enter')addByText(false)};
$('#gps').onclick=()=>st.me?(st.origin={...st.me,name:'My location'},render()):askLoc();
$('#clear').onclick=()=>{st.origin=null;st.stops=[];st.sel=null;st.editId=null;render()};

/* ============ ROUTE: nearest neighbor + 2-opt ============ */
const hav=(a,b)=>{const R=6371,r=x=>x*Math.PI/180,dl=r(b.lat-a.lat),dg=r(b.lng-a.lng),
  h=Math.sin(dl/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(h))*ROAD};
function plan(){
  if(!st.origin||!st.stops.length)return null;
  const S=st.stops;let left=S.map((_,i)=>i),cur=st.origin,ord=[];
  while(left.length){let b=0;left.forEach((x,i)=>{if(hav(cur,S[x])<hav(cur,S[left[b]]))b=i});cur=S[left[b]];ord.push(left.splice(b,1)[0])}
  const len=o=>{let d=hav(st.origin,S[o[0]]);for(let i=1;i<o.length;i++)d+=hav(S[o[i-1]],S[o[i]]);if(st.round)d+=hav(S[o.at(-1)],st.origin);return d};
  let imp=true;while(imp){imp=false;for(let i=0;i<ord.length-1;i++)for(let j=i+1;j<ord.length;j++){
    const n=ord.slice(0,i).concat(ord.slice(i,j+1).reverse(),ord.slice(j+1));if(len(n)<len(ord)-1e-9){ord=n;imp=true}}}
  const legs=[];let p=st.origin;ord.forEach(i=>{legs.push(hav(p,S[i]));p=S[i]});if(st.round)legs.push(hav(p,st.origin));
  return{ord,legs,km:legs.reduce((a,b)=>a+b,0)}}

/* ============ COST / TIME / EFFORT ============ */
const depart=()=>new Date(($('#date').value||new Date().toISOString().slice(0,10))+'T'+($('#time').value||'08:00'));
function evalV(v,r){
  const kg=st.stops.reduce((a,s)=>a+ +s.kg,0),needC=st.stops.some(s=>CLOSED.includes(s.cargo)),trips=Math.max(1,Math.ceil(kg/v.cap)),
  h=depart().getHours(),rush=(h>=7&&h<9)||(h>=17&&h<20),spd=v.speed*(rush?.6:1),km=r.km*v.f*trips,
  hrs=km/spd+st.stops.length*SERVICE_MIN/60,fuelCost=km/v.kmpl*st.fuel[v.fuel],labor=hrs*v.hourly,lvl=Math.min(5,v.effort+trips-1);
  let why='';if(needC&&!v.closed)why=t('needClosed');else if(trips>MAXTRIPS)why=t('capShort')+' ('+kg+' kg)';
  return{v,km,hrs,spd,rush,trips,fuelCost,labor,cost:fuelCost+labor,lvl,eff:lvl*hrs,ok:!why,why}}
const W={balanced:[.4,.35,.25],cheap:[1,0,0],fast:[0,1,0],easy:[0,0,1]};
const lvlN=n=>t(n<=2?'L1':n<=3?'L2':'L3');
const fmtT=m=>{const h=Math.floor(m/60),mm=Math.round(m%60);return h?h+'h '+mm+'m':mm+' min'};
const clock=d=>d.toLocaleTimeString('en-PH',{hour:'numeric',minute:'2-digit'});

/* ============ RENDER ============ */
function stopsUI(){
  $('#nostop').hidden=st.stops.length>0;
  $('#stops').innerHTML=st.stops.map((s,i)=>`<div class="stop">
   <div class="n"><b>${i+1}</b></div><input id="sn${i}" value="${esc(s.name)}" onchange="upd(${i},'name',this.value)" aria-label="Name">
   <input type="number" min="0" value="${s.kg}" onchange="upd(${i},'kg',this.value)" aria-label="kg" title="kg">
   <div class="sub"><select onchange="upd(${i},'cargo',this.value)">${Object.keys(CI).map(k=>`<option value="${k}" ${k==s.cargo?'selected':''}>${t('c_'+k)}</option>`).join('')}</select>
   ${t('by')} <input type="time" value="${s.by}" onchange="upd(${i},'by',this.value)">
   <span class="acts"><button class="ib" title="Edit" onclick="$('#sn${i}').focus()">${ic('edit')}</button><button class="ib" title="Update" onclick="relocate(${i})">${ic('refresh')}</button><button class="ib d" title="Delete" onclick="del(${i})">${ic('trash')}</button></span></div></div>`).join('')}
window.upd=(i,k,v)=>{st.stops[i][k]=v;if(k!=='name')render()};
window.del=i=>{st.stops.splice(i,1);render()};
window.relocate=async i=>{const p=await geocode(st.stops[i].name);if(!p){alert(t('notFound'));return}Object.assign(st.stops[i],p);render()};

function render(){
  if(!st.user)return;stopsUI();
  const r=st.r=plan();drawMap(r);$('#res').hidden=!r;$('#empty').hidden=!!r;if(!r)return;
  const rows=V.map(v=>evalV(v,r)),ok=rows.filter(x=>x.ok);
  if(!ok.length){$('#best').innerHTML='<strong>'+t('noOk')+'</strong>';return}
  const types=[...new Set(st.stops.map(s=>s.cargo))],perish=types.some(x=>PERISH.includes(x)),
  mn=k=>Math.min(...ok.map(x=>x[k])),m={cost:mn('cost'),hrs:mn('hrs'),eff:mn('eff')},
  w=perish&&$('#pri').value==='balanced'?[.2,.7,.1]:W[$('#pri').value];
  ok.forEach(x=>x.score=w[0]*x.cost/m.cost+w[1]*x.hrs/m.hrs+w[2]*x.eff/m.eff);
  const best=ok.reduce((a,b)=>b.score<a.score?b:a),ch=st.chosen=ok.find(x=>x.v.id===st.sel)||best,worst=Math.max(...ok.map(x=>x.cost));
  $('#best').innerHTML=`<div class="big">${ic(ch.v.icon)}</div><div><small>${t(ch===best?'best':'chosen')}</small><strong>${ch.v.name}</strong></div>
   <div><small>${t('total')}</small><strong>${peso(ch.cost)}</strong></div><div><small>${t('dur')}</small><strong>${fmtT(ch.hrs*60)}</strong></div>
   <div><small>${t('dist')}</small><strong>${ch.km.toFixed(1)} km${ch.trips>1?' ('+ch.trips+'×)':''}</strong></div><div><small>${t('saved')}</small><strong>${peso(worst-ch.cost)}</strong></div>${ch.rush?`<div><strong>${t('rush')}</strong></div>`:''}`;
  $('#tips').innerHTML=(perish?`<li class="g">${t('gen')}</li>`:'')+types.map(k=>`<li>${ic(CI[k])} <b>${t('c_'+k)}</b>: ${tip(k)}</li>`).join('');
  $('#cards').innerHTML=rows.map(x=>`<button class="btn vc ${x.ok?'':'off'} ${x===ch?'on':''}" ${x.ok?'':'disabled'} onclick="st.sel='${x.v.id}';render()">
   ${x===best?'<span class="tag">'+ic('g-trophy')+'</span>':''}<div class="ic">${ic(x.v.icon)}</div><b>${x.v.name}</b><small>${t('cap')} ${x.v.cap.toLocaleString()} kg</small>
   ${x.ok?`<small>${peso(x.cost)} · ${fmtT(x.hrs*60)}</small>`:`<small class="late">${x.why}</small>`}</button>`).join('');
  const dep=depart();let tm=0;
  const lines=r.ord.map((i,k)=>{const s=st.stops[i];tm+=r.legs[k]/ch.spd*60*ch.v.f;const eta=new Date(dep.getTime()+tm*60000);tm+=SERVICE_MIN;s.eta=clock(eta);
    const late=s.by&&eta.toTimeString().slice(0,5)>s.by,unsafe=MAXMIN[s.cargo]&&(tm-SERVICE_MIN)>MAXMIN[s.cargo];
    return `<tr><td>${k+1}</td><td>${esc(s.name)}</td><td>${ic(CI[s.cargo])} ${t('c_'+s.cargo)}</td><td>${s.kg} kg</td><td>${r.legs[k].toFixed(1)} km</td>
    <td class="${late||unsafe?'late':''}">${s.eta}${late?` (${t('late')} ${s.by})`:''}${unsafe?` ${ic('g-alert')} ${t('unsafe')}`:''}</td></tr>`});
  if(st.round)lines.push(`<tr><td>${ic('g-return')}</td><td>${t('back')}</td><td></td><td></td><td>${r.legs.at(-1).toFixed(1)} km</td><td>${clock(new Date(dep.getTime()+(tm-SERVICE_MIN+r.legs.at(-1)/ch.spd*60)*60000))}</td></tr>`);
  $('#eta').innerHTML=`<table><tr><th>#</th><th>${t('stop')}</th><th>${t('cargo')}</th><th>${t('kg')}</th><th>${t('leg')}</th><th>${t('eta')}</th></tr>${lines.join('')}</table><p class="muted">${dep.toLocaleDateString('en-PH',{dateStyle:'medium'})} ${clock(dep)} · ${t('firstTrip')}</p>`;
  drawMap(r);
  const tag=(x,k)=>x.ok&&x[k]===m[k]?`<span class="b">${t('low')}</span>`:'';
  $('#cmp').innerHTML=`<table><tr><th>${t('vehicle')}</th><th>${ic('g-clock')}</th><th>${t('cost')}</th><th>${t('fuelC')}</th><th>${t('labor')}</th><th>${t('effort')}</th><th>${t('trips')}</th></tr>${rows.map(x=>x.ok?
   `<tr><td>${ic(x.v.icon)} ${x.v.name}${x===best?' '+ic('g-trophy'):''}</td><td>${fmtT(x.hrs*60)}${tag(x,'hrs')}</td><td>${peso(x.cost)}${tag(x,'cost')}</td><td>${peso(x.fuelCost)}</td><td>${peso(x.labor)}</td><td>${lvlN(x.lvl)}${tag(x,'eff')}</td><td>${x.trips}</td></tr>`:
   `<tr class="muted"><td>${ic(x.v.icon)} ${x.v.name}</td><td colspan="6">${x.why}</td></tr>`).join('')}</table>`;
  charts(ok,ch,r)}

function charts(ok,ch,r){
  const ink=getComputedStyle(document.body).getPropertyValue('--ink').trim();Chart.defaults.color=ink;c1&&c1.destroy();c2&&c2.destroy();
  c1=new Chart($('#c1'),{type:'bar',data:{labels:ok.map(x=>x.v.name),datasets:[{label:t('fuelC'),data:ok.map(x=>Math.round(x.fuelCost)),backgroundColor:'#FFB020'},{label:t('labor'),data:ok.map(x=>Math.round(x.labor)),backgroundColor:'#3b6fd1'}]},options:{maintainAspectRatio:false,scales:{x:{stacked:true},y:{stacked:true,title:{display:true,text:'₱'}}}}});
  const lb=r.ord.map(i=>st.stops[i].name);if(st.round)lb.push(t('back'));
  c2=new Chart($('#c2'),{type:'doughnut',data:{labels:lb,datasets:[{data:r.legs.map(l=>Math.round(ch.cost*l/r.km)),backgroundColor:lb.map((_,i)=>`hsl(${(i*47+35)%360} 70% 55%)`),borderWidth:0}]},options:{maintainAspectRatio:false,plugins:{legend:{position:'right'}}}})}

$('#play').onclick=()=>{
  if(!st.r||!st.chosen)return;clearInterval(st.anim);
  const path=[st.origin,...st.r.ord.map(i=>st.stops[i])];if(st.round)path.push(st.origin);const pts=[];
  for(let i=0;i<path.length-1;i++)for(let s=0;s<50;s++)pts.push([path[i].lat+(path[i+1].lat-path[i].lat)*s/50,path[i].lng+(path[i+1].lng-path[i].lng)*s/50]);
  const mk=L.marker(pts[0],{icon:L.divIcon({className:'',html:`<div class="veh">${ic(st.chosen.v.icon)}</div>`,iconSize:[36,36],iconAnchor:[18,18]}),zIndexOffset:999}).addTo(layer);
  let k=0;st.anim=setInterval(()=>{if(k>=pts.length){clearInterval(st.anim);return}mk.setLatLng(pts[k++])},30)};

/* ============ FUEL ============ */
const FK=[['gas','fGas'],['diesel','fDie'],['kero','fKer'],['ev','fEv']];
function fuelUI(){
  $('#fuel').innerHTML=FK.map(([k,l])=>{const p=st.prev[k],a=p&&st.fuel[k]!==p?(st.fuel[k]>p?'<span class="up">▲</span>':'<span class="dn">▼</span>'):'';
    return `<div><b>${ic('g-fuel')} ${t(l)} ${a}</b><input type="number" step="0.01" value="${st.fuel[k]}" onchange="setFuel('${k}',this.value)" aria-label="${t(l)}"></div>`}).join('');
  $('#fuelnote').textContent=(st.fuelAt?t('fOk')+': '+st.fuelAt+'. ':'')+t(FUEL_API_URL?'fN1':'fN1')+(FUEL_API_URL?'':' '+t('fN2'))}
window.setFuel=(k,v)=>{st.prev[k]=st.fuel[k];st.fuel[k]=+v||0;SV('ruto_fuel',st.fuel);SV('ruto_fuelprev',st.prev);st.fuelAt=new Date().toLocaleString('en-PH');fuelUI();render()};
async function fetchFuel(quiet){
  if(!FUEL_API_URL){if(!quiet)fuelUI();return}
  try{const d=await(await fetch(FUEL_API_URL)).json();FK.forEach(([k])=>{if(d[k]!=null&&d[k]!==st.fuel[k]){st.prev[k]=st.fuel[k];st.fuel[k]=+d[k]}});
    SV('ruto_fuel',st.fuel);SV('ruto_fuelprev',st.prev);st.fuelAt=new Date().toLocaleString('en-PH');fuelUI();render()}
  catch(e){if(!quiet)$('#fuelnote').textContent=t('fFail')}}
$('#fuelbtn').onclick=()=>fetchFuel(false);

/* ============ HISTORY (per user) ============ */
const hk=()=>'ruto_h_'+st.user;
$('#save').onclick=async()=>{
  if(!st.chosen)return;const H=st.H||[],
  e={id:st.editId||Date.now(),ts:Date.now(),date:$('#date').value,time:$('#time').value,origin:st.origin,stops:st.stops.map(({eta,...s})=>s),veh:st.chosen.v.id,cost:st.chosen.cost,km:st.chosen.km,round:st.round!==false&&$('#round').checked},
  i=H.findIndex(x=>x.id===e.id);i>=0?H[i]=e:H.unshift(e);st.H=H.slice(0,100);st.editId=null;
  if(FB_ON){try{await db.collection('users').doc(st.user).collection('deliveries').doc(String(e.id)).set(e)}catch(x){alert(x.message)}}else SV(hk(),st.H);
  histUI();showView('hist')};
function histUI(){
  const H=st.H||[];
  $('#hlist').innerHTML=H.length?H.map(x=>{const v=V.find(q=>q.id===x.veh)||V[0];
    return `<div class="hi"><div>${ic(v.icon)}</div><div class="m"><b>${x.date} ${x.time}</b><br><span class="muted">${v.name} · ${x.stops.length} ${t('stopsN')} · ${x.km.toFixed(1)} km · ${peso(x.cost)}</span></div>
    <button class="ib" title="Edit" onclick="loadH(${x.id})">${ic('edit')}</button><button class="ib d" title="Delete" onclick="delH(${x.id})">${ic('trash')}</button></div>`}).join(''):`<p class="muted">${t('noHist')}</p>`}
window.loadH=id=>{const x=(st.H||[]).find(q=>q.id===id);if(!x)return;st.origin=x.origin;st.stops=x.stops;st.sel=x.veh;st.editId=id;
  $('#date').value=x.date;$('#time').value=x.time;$('#round').checked=x.round;showView('plan');render()};
window.delH=async id=>{st.H=(st.H||[]).filter(q=>q.id!==id);
  if(FB_ON){try{await db.collection('users').doc(st.user).collection('deliveries').doc(String(id)).delete()}catch(x){alert(x.message)}}else SV(hk(),st.H);histUI()};
async function loadHist(){
  if(FB_ON){try{const q=await db.collection('users').doc(st.user).collection('deliveries').orderBy('ts','desc').limit(100).get();st.H=q.docs.map(d=>d.data())}catch(x){st.H=[]}}
  else st.H=LS(hk(),[]);
  histUI()}
function showView(v){$('#v_plan').hidden=v!=='plan';$('#v_hist').hidden=v!=='hist';$$('.tabs [data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v));if(v==='plan')setTimeout(()=>map.invalidateSize(),50)}
$$('.tabs [data-v]').forEach(b=>b.onclick=()=>showView(b.dataset.v));
['date','time','pri','round'].forEach(id=>$('#'+id).onchange=()=>{st.round=$('#round').checked;render()});

/* ============ START ============ */
applyTheme(localStorage.getItem('ruto_theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
applyLang();
if(FB_ON){auth.onAuthStateChanged(u=>{if(u&&!st.user&&!busy)enter(u.uid,u.displayName||u.email)})}
else{const ses=LS('ruto_session',null),U0=LS('ruto_users',{});if(ses&&U0[ses])enter(ses,U0[ses].name)}
