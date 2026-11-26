/* ============ LANGUAGE (translations are in i18n.js) ============ */
let lang=+localStorage.getItem('ruto_lang')||0;
let phoneCodeSent=false;
const t=(k,v)=>{let s=(D[k]||k).split('|')[lang]||(D[k]||k).split('|')[0];if(v)for(const p in v)s=s.replaceAll('{'+p+'}',()=>v[p]);return s};
const tip=k=>TIPS[k].split('|')[lang?1:0];
function applyLang(){
  document.documentElement.lang=['en','tl','tl'][lang];
  document.querySelectorAll('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));
  document.querySelectorAll('[data-ip]').forEach(e=>e.placeholder=t(e.dataset.ip));
  document.querySelectorAll('.lang').forEach(s=>s.value=lang);
  $('#menuToggle').setAttribute('aria-label',t('menuOpen'));
  $('#sidebarClose').setAttribute('aria-label',t('menuClose'));
  $('#profileShortcut').setAttribute('aria-label',t('profileSettings'));
  $('#sidebar').setAttribute('aria-label',t('mainMenu'));
  $('#sidebarNav').setAttribute('aria-label',t('mainMenu'));
  $('#phsend').textContent=t(phoneCodeSent?'resendCode':'sendCode');
  authMode(mode);if(st.user){$('#profileAccountType').value=t(profileData.accountType==='company'?'companyAccount':'personalAccount');fuelUI();histUI();calUI();render();aiLang()}
}
document.querySelectorAll('.lang').forEach(s=>s.onchange=e=>{lang=+e.target.value;localStorage.setItem('ruto_lang',lang);applyLang()});

/* ============ THEME ============ */
function applyTheme(m){document.documentElement.dataset.theme=m;localStorage.setItem('ruto_theme',m);
  document.querySelectorAll('.th use').forEach(u=>u.setAttribute('href',m==='dark'?'#moon':'#sun'));if(st.r)renderResults()}
document.querySelectorAll('.th').forEach(b=>b.onclick=()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));

/* ============ DATA: edit vehicles here ============
 kmpl = km per liter (km per kWh for EV) · cap = kg · speed = top average km/h · hourly = driver/rental ₱/h
 effort 1 (easy) to 5 (tiring) · tf = time factor compared with a car in the same traffic
 maxKm = longest practical trip · small = keep off motorways · dom = land or water */
const V=[
{id:'moto',name:'Motorcycle',icon:'g-moto',fuel:'gas',kmpl:40,cap:30,speed:60,hourly:90,effort:5,closed:false,tf:.85,maxKm:200,small:true,dom:'land'},
{id:'etrike',name:'E-Trike / E-Bike',icon:'g-etrike',fuel:'ev',kmpl:20,cap:120,speed:25,hourly:90,effort:3,closed:false,tf:1.6,maxKm:50,small:true,dom:'land'},
{id:'trike',name:'Tricycle',icon:'g-trike',fuel:'gas',kmpl:25,cap:150,speed:30,hourly:100,effort:4,closed:false,tf:1.45,maxKm:60,small:true,dom:'land'},
{id:'car',name:'Four-Wheeler Car',icon:'g-car',fuel:'gas',kmpl:12,cap:300,speed:80,hourly:150,effort:2,closed:true,tf:1,dom:'land'},
{id:'jeep',name:'Jeepney',icon:'g-bus',fuel:'diesel',kmpl:7,cap:1000,speed:40,hourly:250,effort:3,closed:false,tf:1.3,maxKm:150,dom:'land'},
{id:'van',name:'Van / L300',icon:'g-van',fuel:'diesel',kmpl:9,cap:1200,speed:70,hourly:300,effort:2,closed:true,tf:1.08,dom:'land'},
{id:'pickup',name:'Pick-up Truck',icon:'g-pickup',fuel:'diesel',kmpl:9,cap:1000,speed:75,hourly:300,effort:3,closed:false,tf:1.05,dom:'land'},
{id:'t2',name:'Truck 2 Tons',icon:'g-truck',fuel:'diesel',kmpl:6,cap:2000,speed:60,hourly:450,effort:2,closed:true,tf:1.2,dom:'land'},
{id:'t5',name:'Truck 5 Tons (6-Wheeler)',icon:'g-truck2',fuel:'diesel',kmpl:4.5,cap:5000,speed:55,hourly:650,effort:2,closed:true,tf:1.35,dom:'land'},
{id:'t10',name:'Wing Van 10 Tons',icon:'g-truck2',fuel:'diesel',kmpl:3,cap:10000,speed:50,hourly:900,effort:2,closed:true,tf:1.45,dom:'land'},
{id:'bangka',name:'Bangka (Motorized Boat)',icon:'g-boat',fuel:'gas',kmpl:3,cap:500,speed:20,hourly:200,effort:4,closed:false,tf:1,maxKm:80,dom:'water'},
{id:'cargo',name:'Cargo Boat / RoRo',icon:'g-ship',fuel:'diesel',kmpl:.8,cap:8000,speed:18,hourly:900,effort:2,closed:true,tf:1,dom:'water'}];
const SERVICE_MIN=6,MAXTRIPS=5,PORT_MIN=20;
/* cargo rules: max safe minutes, needs enclosed vehicle, perishable, icons */
const MAXMIN={meat:120,cold:90,food:60,produce:240,med:180};
const CLOSED=['fragile','meat','cold','food','elec','med'],PERISH=['meat','cold','food','med'];
const CI={box:'g-box',fragile:'g-glass',meat:'g-meat',cold:'g-snow',food:'g-food',produce:'g-leaf',elec:'g-laptop',heavy:'g-weight',med:'g-pill'};

/* ============ HELPERS / STATE ============ */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const peso=n=>'₱'+Math.round(n).toLocaleString('en-PH');
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const ic=(n,c='')=>`<svg class="i ${c}"><use href="#${n}"/></svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); // local date (not UTC)
const vById=id=>V.find(v=>v.id===id);
const st={user:null,origin:null,stops:[],sel:{},editId:null,editSched:false,r:null,chosen:null,anim:null,me:null,H:[]};
let accountType='personal',profileData={accountType:'personal',name:'',companyName:'',email:'',photoURL:''},profilePhotoBlob=null,profilePhotoObjectURL='';
let mode='up',map,layer,tileLayer,meMk,c1,c2;
function toast(msg,kind=''){const d=document.createElement('div');d.className='toast '+kind;d.textContent=msg;$('#toasts').append(d);setTimeout(()=>d.remove(),6000)}

/* ============ FIREBASE ============ */
const FB_ON=!!RUTO.FIREBASE.apiKey&&!RUTO.FIREBASE.apiKey.startsWith('PASTE');let auth,db,storage,busy=false;
if(FB_ON&&window.firebase){
  const fbApp=firebase.initializeApp(RUTO.FIREBASE);
  if(RUTO.AI.appCheckSiteKey){
    if(typeof firebase.appCheck!=='function'||!firebase.appCheck.ReCaptchaEnterpriseProvider)throw new Error('Firebase App Check SDK is missing');
    if(['localhost','127.0.0.1'].includes(location.hostname))self.FIREBASE_APPCHECK_DEBUG_TOKEN=true;
    firebase.appCheck(fbApp).activate(new firebase.appCheck.ReCaptchaEnterpriseProvider(RUTO.AI.appCheckSiteKey),true);
  }
  auth=firebase.auth();db=firebase.firestore();storage=typeof firebase.storage==='function'?firebase.storage():null;
}
const fbErr=x=>{const k={'auth/email-already-in-use':'errExist','auth/invalid-credential':'errBad','auth/wrong-password':'errBad','auth/user-not-found':'errBad','auth/weak-password':'pass','auth/invalid-email':'email','auth/account-exists-with-different-credential':'errDiff','auth/unauthorized-domain':'errDomain',
  'auth/invalid-phone-number':'errPhone','auth/invalid-verification-code':'errCode','auth/code-expired':'errCodeOld','auth/too-many-requests':'errMany','auth/billing-not-enabled':'errBilling','auth/operation-not-allowed':'errProvider','auth/network-request-failed':'errNet','auth/captcha-check-failed':'errCaptcha'}[x.code];
  return k?t(k)+(x.code==='auth/operation-not-allowed'&&x.message?' ('+x.message+')':''):x.message};

/* ============ AUTH: email ============ */
const sha=async s=>crypto.subtle?[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('ruto:'+s)))].map(b=>b.toString(16).padStart(2,'0')).join(''):btoa(s);
function authMode(m){
  mode=m;$$('#auth .tabs .btn').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
  $('#nmw').hidden=m==='in';$('#forgotPassword').hidden=true;$('#signupRule').hidden=m!=='up';
  $('#pw').autocomplete=m==='in'?'current-password':'new-password';
  $('#authHeading').textContent=t(m==='in'?'authSignInTitle':'authSignUpTitle');
  $('#sub').textContent=t(m==='in'?'signin':'signup');$('#err').textContent='';
  updateAccountTypeUI();
}
function updateAccountTypeUI(){
  const company=accountType==='company',phoneOn=!$('#phoneBox').hidden;
  $$('#accountTypeChoice [data-account-type]').forEach(b=>{
    const active=b.dataset.accountType===accountType;
    b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active))});
  $('#accountTypeChoice').hidden=phoneOn;
  $('#companyHint').hidden=!company||phoneOn;
  $('#companyNameWrap').hidden=!company||mode==='in'||phoneOn;
  $('#companyName').required=company&&mode==='up'&&!phoneOn;
  $('#providerBox').hidden=company||phoneOn;
  $('#orSocial').hidden=company||phoneOn;
  $('#pbtn').hidden=company||phoneOn;
}
$$('#accountTypeChoice [data-account-type]').forEach(b=>b.onclick=()=>{
  accountType=b.dataset.accountType;updateAccountTypeUI();$('#err').textContent=''});
$$('#auth .tabs .btn').forEach(b=>b.onclick=()=>authMode(b.dataset.m));
['#em','#pw'].forEach(selector=>$(selector).addEventListener('input',()=>$('#forgotPassword').hidden=true));
const isCredentialFailure=code=>['auth/invalid-credential','auth/wrong-password','auth/user-not-found'].includes(code);
// Profile write never blocks sign in (a missing Firestore database would otherwise freeze it)
const saveProfile=(uid,data)=>{if(!db)return Promise.resolve(false);return db.collection('users').doc(uid).set({...data,createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).then(()=>true).catch(e=>{console.warn('profile',e);return false})};
function cacheProfile(uid,data){
  const profiles=LS('ruto_profiles',{});
  profiles[uid]={...profiles[uid],...data};
  return SV('ruto_profiles',profiles);
}
async function getProfileRecord(uid){
  const cached=LS('ruto_profiles',{})[uid]||{};
  if(!db)return cached;
  try{
    const doc=await db.collection('users').doc(uid).get();
    if(doc.exists){const data=doc.data();cacheProfile(uid,data);return data}
  }catch(e){if(!Object.keys(cached).length)throw e;console.warn('profile read',e)}
  return cached}
$('#auth').onsubmit=async e=>{e.preventDefault();
  if(!$('#phoneBox').hidden){$('#phcode').hidden?sendCode():verifyCode();return}
  $('#forgotPassword').hidden=true;
  const em=$('#em').value.trim().toLowerCase(),pw=$('#pw').value,nm=$('#nm').value.trim(),companyName=$('#companyName').value.trim(),U=LS('ruto_users',{});
  if(!em||!pw||(mode==='up'&&(!nm||(accountType==='company'&&!companyName)))){$('#err').textContent=t('errFill');return}
  if(pw.length<6){$('#err').textContent=t('pass');return}
  if(FB_ON){if(!auth){$('#err').textContent=t('errNet');return}busy=true;try{
    if(mode==='up'){
      const c=await auth.createUserWithEmailAndPassword(em,pw);
      await c.user.updateProfile({displayName:nm});
      const data={name:nm,email:em,accountType,companyName:accountType==='company'?companyName:''};
      cacheProfile(c.user.uid,data);
      const saved=await saveProfile(c.user.uid,data);
      enter(c.user.uid,nm,data);busy=false;
      if(accountType==='company'&&!saved)toast(t('companyProfileSaveFail'),'bad');
    }else{
      const c=await auth.signInWithEmailAndPassword(em,pw);let stored={};
      try{stored=await getProfileRecord(c.user.uid)}catch(x){
        if(accountType==='company'){await auth.signOut();busy=false;$('#err').textContent=t('companyProfileLoadFail');return}
        console.warn('profile read',x)}
      if((stored.accountType||'personal')!==accountType){
        await auth.signOut();busy=false;$('#err').textContent=t('accountTypeMismatch');return}
      enter(c.user.uid,c.user.displayName||em,stored);busy=false
    }
  }catch(x){busy=false;$('#err').textContent=fbErr(x);if(mode==='in'&&isCredentialFailure(x.code))$('#forgotPassword').hidden=false}return}
  const h=await sha(em+pw);
  if(mode==='up'){if(U[em]){$('#err').textContent=t('errExist');return}U[em]={name:nm,h,accountType,companyName:accountType==='company'?companyName:''};if(!SV('ruto_users',U)){$('#err').textContent=t('saveFail');return}}
  else if(!U[em]||U[em].h!==h){$('#err').textContent=t('errBad');$('#forgotPassword').hidden=false;return}
  if((U[em].accountType||'personal')!==accountType){$('#err').textContent=t('accountTypeMismatch');return}
  const details={name:U[em].name,email:em,accountType:U[em].accountType||'personal',companyName:U[em].companyName||''};
  cacheProfile(em,details);
  if(!SV('ruto_session',em)){$('#err').textContent=t('saveFail');return}
  enter(em,details.name,details)};
$('#out').onclick=async()=>{localStorage.removeItem('ruto_session');if(auth)await auth.signOut();location.reload()};

/* ============ GOOGLE: always shows the account chooser ============ */
async function googleIn(){
  if(!auth){$('#err').textContent=t('needFb');return}
  const pr=new firebase.auth.GoogleAuthProvider();pr.setCustomParameters({prompt:'select_account'});
  try{busy=true;const c=await auth.signInWithPopup(pr),u=c.user;
    if(c.additionalUserInfo?.isNewUser)saveProfile(u.uid,{name:u.displayName||'',email:u.email||'',provider:'google'});
    enter(u.uid,u.displayName||u.email||'User');busy=false}
  catch(x){busy=false;
    if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(x.code))return auth.signInWithRedirect(pr).catch(y=>$('#err').textContent=fbErr(y));
    if(!['auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(x.code))$('#err').textContent=fbErr(x)}}
$('#gbtn').onclick=googleIn;
async function appleIn(){
  if(!auth){$('#err').textContent=t('needFb');return}
  const pr=new firebase.auth.OAuthProvider('apple.com');
  try{busy=true;const c=await auth.signInWithPopup(pr),u=c.user;
    if(c.additionalUserInfo?.isNewUser)saveProfile(u.uid,{name:u.displayName||'',email:u.email||'',provider:'apple'});
    enter(u.uid,u.displayName||u.email||'User');busy=false}
  catch(x){busy=false;
    if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(x.code))return auth.signInWithRedirect(pr).catch(y=>$('#err').textContent=fbErr(y));
    if(!['auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(x.code))$('#err').textContent=fbErr(x)}}
$('#abtn').onclick=appleIn;

/* ============ PHONE NUMBER SIGN-IN (SMS code) ============ */
let captcha=null,confirmRes=null;
function phonePanel(on){
  $('#phoneBox').hidden=$('#phback').hidden=!on;$('#mailBox').hidden=$('#providerBox').hidden=$('#orSocial').hidden=$('#pbtn').hidden=$('#sub').hidden=on;
  $('#auth .tabs').hidden=on;$('#signupRule').hidden=on||mode!=='up';$('#em').required=$('#pw').required=!on;
  $('#phcode').hidden=true;confirmRes=null;phoneCodeSent=false;$('#phsend').textContent=t('sendCode');$('#err').textContent='';updateAccountTypeUI();if(on)$('#ph').focus()}
const normPhone=s=>{let n=s.replace(/[^\d+]/g,'');if(/^09\d{9}$/.test(n))n='+63'+n.slice(1);else if(/^9\d{9}$/.test(n))n='+63'+n;else if(/^639\d{9}$/.test(n))n='+'+n;return /^\+\d{10,15}$/.test(n)?n:null};
async function sendCode(){
  if(!auth){$('#err').textContent=t('needFb');return}
  const n=normPhone($('#ph').value);if(!n){$('#err').textContent=t('errPhone');return}
  const b=$('#phsend');b.disabled=true;$('#err').textContent='';
  try{auth.languageCode=lang?'fil':'en';
    captcha=captcha||new firebase.auth.RecaptchaVerifier('recaptcha',{size:'invisible'});
    confirmRes=await auth.signInWithPhoneNumber(n,captcha);
    phoneCodeSent=true;b.textContent=t('resendCode');
    $('#phcode').hidden=false;$('#otp').value='';$('#otp').focus();toast(t('codeSent',{n}),'ok')}
  catch(x){$('#err').textContent=fbErr(x);try{captcha.clear()}catch(e){}captcha=null;$('#recaptcha').innerHTML=''}
  b.disabled=false}
async function verifyCode(){
  const code=$('#otp').value.trim();if(!confirmRes||!/^\d{6}$/.test(code)){$('#err').textContent=t('errCode');return}
  try{busy=true;const c=await confirmRes.confirm(code),u=c.user,nm=$('#phnm').value.trim();
    if(nm&&!u.displayName)await u.updateProfile({displayName:nm});
    if(c.additionalUserInfo?.isNewUser)saveProfile(u.uid,{name:nm,phone:u.phoneNumber,provider:'phone'});
    enter(u.uid,u.displayName||nm||u.phoneNumber);busy=false}
  catch(x){busy=false;$('#err').textContent=fbErr(x)}}
$('#pbtn').onclick=()=>phonePanel(true);$('#phback').onclick=()=>phonePanel(false);
$('#phsend').onclick=sendCode;$('#phok').onclick=verifyCode;

/* ============ LANDING ============ */
$('#cta').onclick=()=>{$('#auth').scrollIntoView({behavior:'smooth',block:'center'});($('#mailBox').hidden?$('#ph'):$('#em')).focus()};
function setSidebar(open){
  $('#sidebar').hidden=$('#sidebarBackdrop').hidden=!open;
  $('#menuToggle').setAttribute('aria-expanded',String(open));
  $('#menuToggle').setAttribute('aria-label',t(open?'menuClose':'menuOpen'));
  if(open)$('#sidebarClose').focus();else $('#menuToggle').focus()}
$('#menuToggle').onclick=()=>setSidebar($('#sidebar').hidden);
$('#sidebarClose').onclick=()=>setSidebar(false);
$('#sidebarBackdrop').onclick=()=>setSidebar(false);
document.addEventListener('keydown',e=>{
  if($('#sidebar').hidden)return;
  if(e.key==='Escape'){setSidebar(false);return}
  if(e.key==='Tab'){
    const items=$$('#sidebar button:not(:disabled)').filter(b=>!b.hidden),first=items[0],last=items.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
});
function avatarInitials(name){
  return String(name||'R').trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'R'}
function paintProfilePhoto(){
  const url=profilePhotoObjectURL||profileData.photoURL||'';
  [['whoPhoto','whoInitials'],['profilePhoto','profileInitials']].forEach(([imageId,initialsId])=>{
    const image=$('#'+imageId),initials=$('#'+initialsId);
    initials.textContent=avatarInitials(profileData.name);
    image.onerror=()=>{image.hidden=true;initials.hidden=false};
    if(url){image.src=url;image.hidden=false;initials.hidden=true}
    else{image.removeAttribute('src');image.hidden=true;initials.hidden=false;initials.textContent=avatarInitials(profileData.name)}})}
function applyProfileData(data={}){
  profileData={...profileData,...data,accountType:data.accountType==='company'?'company':'personal'};
  if(profileData.name)$('#who').textContent=profileData.name;
  $('#profileName').value=profileData.name||'';
  $('#profileCompanyName').value=profileData.companyName||'';
  $('#profileCompanyWrap').hidden=profileData.accountType!=='company';
  $('#companyTeamPreview').hidden=profileData.accountType!=='company';
  $('#profileEmail').value=profileData.email||'';
  $('#profileAccountType').value=t(profileData.accountType==='company'?'companyAccount':'personalAccount');
  paintProfilePhoto();updatePasswordUI()}
function updatePasswordUI(){
  const local=!FB_ON&&!!LS('ruto_users',{})[st.user],remote=!!auth?.currentUser?.providerData?.some(p=>p.providerId==='password'),
    available=!!st.user&&(local||remote);
  $('#passwordChangeForm').hidden=!available;
  $('#passwordProviderHelp').hidden=!st.user||available}
function loadProfile(uid,fallback={}){
  applyProfileData(fallback);
  getProfileRecord(uid).then(data=>{if(st.user===uid)applyProfileData({...fallback,...data})})
    .catch(e=>{console.warn('profile read',e);$('#profileStatus').textContent=t('profileLoadFail')})}
function resizeProfilePhoto(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))return Promise.reject(new Error(t('photoInvalid')));
  if(file.size>10*1024*1024)return Promise.reject(new Error(t('photoTooLarge')));
  return new Promise((resolve,reject)=>{
    const source=URL.createObjectURL(file),image=new Image();
    image.onload=()=>{
      try{
        const scale=Math.min(1,512/Math.max(image.naturalWidth,image.naturalHeight)),
          canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
        canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
        const context=canvas.getContext('2d');
        if(!context)throw new Error(t('photoInvalid'));
        context.drawImage(image,0,0,canvas.width,canvas.height);
        URL.revokeObjectURL(source);
        canvas.toBlob(blob=>blob?resolve(blob):reject(new Error(t('photoInvalid'))),'image/jpeg',.82);
      }catch(x){URL.revokeObjectURL(source);reject(x)}};
    image.onerror=()=>{URL.revokeObjectURL(source);reject(new Error(t('photoInvalid')))};
    image.src=source})}
function blobDataURL(blob){
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error||new Error(t('photoInvalid')));reader.readAsDataURL(blob)})}
$('#profilePhotoInput').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    profilePhotoBlob=await resizeProfilePhoto(file);
    if(profilePhotoObjectURL)URL.revokeObjectURL(profilePhotoObjectURL);
    profilePhotoObjectURL=URL.createObjectURL(profilePhotoBlob);
    paintProfilePhoto();$('#profileStatus').textContent='';
  }catch(x){profilePhotoBlob=null;if(profilePhotoObjectURL)URL.revokeObjectURL(profilePhotoObjectURL);profilePhotoObjectURL='';$('#profileStatus').textContent=x.message}
};
$('#profileForm').onsubmit=async e=>{
  e.preventDefault();const button=$('#profileForm button[type=submit]');
  const name=$('#profileName').value.trim(),companyName=$('#profileCompanyName').value.trim();
  if(!name||(profileData.accountType==='company'&&!companyName)){
    $('#profileStatus').textContent=t('errFill');return}
  button.disabled=true;$('#profileStatus').textContent=t('profileSaving');
  try{
    let photoURL=profileData.photoURL||'';
    if(profilePhotoBlob){
      if(auth){
        if(!storage)throw new Error(t('profileStorageUnavailable'));
        const ref=storage.ref().child('users/'+st.user+'/profile.jpg');
        await ref.put(profilePhotoBlob,{contentType:'image/jpeg'});
        photoURL=await ref.getDownloadURL();
      }else photoURL=await blobDataURL(profilePhotoBlob)}
    const updated={...profileData,name,companyName:profileData.accountType==='company'?companyName:'',photoURL};
    if(auth&&db){
      const saved=await saveProfile(st.user,updated);
      if(!saved)throw new Error(t('profileCloudSaveFail'));
      if(auth.currentUser)await auth.currentUser.updateProfile({displayName:name,photoURL:photoURL||null});
      cacheProfile(st.user,updated);
    }else{
      if(!cacheProfile(st.user,updated))throw new Error(t('saveFail'));
      const users=LS('ruto_users',{});
      if(users[st.user]){users[st.user].name=name;users[st.user].companyName=updated.companyName;if(!SV('ruto_users',users))throw new Error(t('saveFail'))}}
    profileData=updated;
    if(profilePhotoObjectURL)URL.revokeObjectURL(profilePhotoObjectURL);
    profilePhotoObjectURL='';profilePhotoBlob=null;$('#profilePhotoInput').value='';
    applyProfileData(updated);$('#profileStatus').textContent=t(auth&&db?'profileSaved':'profileSavedLocal');
  }catch(x){$('#profileStatus').textContent=t('profileSaveFail')+' '+x.message}
  finally{button.disabled=false}};
$('#profileCancel').onclick=()=>{if(profilePhotoObjectURL)URL.revokeObjectURL(profilePhotoObjectURL);profilePhotoObjectURL='';profilePhotoBlob=null;$('#profilePhotoInput').value='';applyProfileData(profileData);showView('plan')};
$('#passwordChangeForm').onsubmit=async e=>{
  e.preventDefault();
  const form=e.currentTarget,button=form.querySelector('button[type=submit]'),
    current=$('#currentPassword').value,next=$('#newProfilePassword').value,confirmNext=$('#confirmProfilePassword').value;
  $('#passwordStatus').textContent='';
  if(next.length<6){$('#passwordStatus').textContent=t('pass');return}
  if(next!==confirmNext){$('#passwordStatus').textContent=t('resetPasswordsMismatch');return}
  button.disabled=true;
  try{
    if(!FB_ON){
      const users=LS('ruto_users',{}),record=users[st.user];
      if(!record||record.h!==await sha(st.user+current))throw Object.assign(new Error(t('currentPasswordInvalid')),{code:'current-password'});
      record.h=await sha(st.user+next);
      if(!SV('ruto_users',users))throw new Error(t('saveFail'));
    }else{
      const user=auth?.currentUser;
      if(!user?.providerData?.some(p=>p.providerId==='password')||!user.email)throw new Error(t('passwordProviderOnly'));
      const credential=firebase.auth.EmailAuthProvider.credential(user.email,current);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(next)}
    form.reset();$('#passwordStatus').textContent=t('passwordChangeSuccess');
  }catch(x){
    const code=x.code||'';
    $('#passwordStatus').textContent=['current-password','auth/wrong-password','auth/invalid-credential'].includes(code)?t('currentPasswordInvalid'):
      code==='auth/requires-recent-login'?t('passwordReauthRequired'):t('passwordChangeFail')+' '+(x.message||'');
  }finally{button.disabled=false}};
if(matchMedia('(prefers-reduced-motion:reduce)').matches)$$('animateMotion,animate').forEach(a=>a.remove());
(function(){const els=$$('#land .sec>h2,#land .fc,#land .st,#land .cta');els.forEach((e,i)=>{e.classList.add('rv');e.style.setProperty('--d',i%6)});
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches){els.forEach(e=>e.classList.add('in'));return}
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.15});els.forEach(e=>io.observe(e))})();

/* ============ ENTER APP + LOCATION GATE ============ */
function enter(uid,name,details={}){
  if(st.user)return;st.user=uid;$('#land').hidden=true;$('#app').hidden=false;$('#fab').hidden=false;$('#who').textContent=name;
  profileData={accountType:'personal',name,email:auth?.currentUser?.email||(/@/.test(uid)?uid:''),photoURL:'',...details};
  applyProfileData(profileData);
  initMap();$('#date').value=ymd(new Date());fuelUI();applyLang();loadHist();
  loadProfile(uid,profileData);
  askLoc();fetchFuel(false);setInterval(()=>fetchFuel(false),1800000)}
function askLoc(){
  if(!navigator.geolocation){$('#gate').hidden=false;return}
  navigator.geolocation.getCurrentPosition(p=>{$('#gate').hidden=true;track(p)},()=>{$('#gate').hidden=false;$('#locP').textContent=t('locDenied')},{enableHighAccuracy:true,timeout:15000});
}
let watching=false;
function showMe(){if(!map||!st.me)return;if(meMk)meMk.setLatLng(st.me);else meMk=L.marker(st.me,{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[16,16]})}).addTo(map)}
function track(p){
  st.me={lat:p.coords.latitude,lng:p.coords.longitude};showMe();
  if(!st.origin&&!watching){st.origin={...st.me,name:t('myLoc')};map.setView(st.me,14);render()}
  if(watching)return;watching=true;
  navigator.geolocation.watchPosition(q=>{st.me={lat:q.coords.latitude,lng:q.coords.longitude};showMe()},()=>{},{enableHighAccuracy:true});
}
$('#locbtn').onclick=askLoc;$('#locskip').onclick=e=>{e.preventDefault();$('#gate').hidden=true};

/* ============ MAP ============ */
const osmTiles=()=>L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap · Routing: '+(RUTO.TOMTOM_KEY?'TomTom':'OSRM')});
const trafficTiles=()=>L.tileLayer('https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key='+encodeURIComponent(RUTO.TOMTOM_KEY),{maxZoom:19,opacity:.75,attribution:'Traffic © TomTom'});
function initMap(){
  map=L.map('map').setView([14.5995,120.9842],12);
  tileLayer=osmTiles().addTo(map);
  if(RUTO.TOMTOM_KEY)L.control.layers(null,{Traffic:trafficTiles().addTo(map)},{collapsed:false}).addTo(map);
  layer=L.layerGroup().addTo(map);
  map.on('click',e=>addPoint(e.latlng.lat,e.latlng.lng));
  new ResizeObserver(()=>map.invalidateSize()).observe($('#map'));
}
function addPoint(lat,lng,name,asOrigin){
  if(asOrigin||!st.origin)st.origin={lat,lng,name:name||'Origin'};
  else st.stops.push({lat,lng,name:name||'Drop-off '+(st.stops.length+1),kg:10,cargo:'box',by:''});
  render()}
const pinI=(x,o)=>L.divIcon({className:'',html:`<div class="pin ${o?'o':''}"><b>${x}</b></div>`,iconSize:[30,30],iconAnchor:[15,30]});
let fitKey='';
function drawRoute(group,legs){
  const styles=getComputedStyle(document.documentElement),road=styles.getPropertyValue('--road').trim(),water=styles.getPropertyValue('--water').trim(),amber=styles.getPropertyValue('--amber').trim();
  legs.forEach(l=>l.segs.forEach(s=>{
    if(!s.water)L.polyline(s.path,{color:road,weight:8,opacity:.55}).addTo(group);
    L.polyline(s.path,s.water?{color:water,weight:5,dashArray:'4 10'}:{color:amber,weight:5}).addTo(group)}))}
function drawMap(r){
  clearInterval(st.anim);layer.clearLayers();const pts=[];
  if(st.origin){L.marker(st.origin,{icon:pinI(ic('g-warehouse'),1)}).addTo(layer).bindPopup(esc(st.origin.name));pts.push(st.origin)}
  if(r){drawRoute(layer,r.legs);
    r.ord.forEach((i,k)=>{const s=st.stops[i];L.marker(s,{icon:pinI(k+1)}).addTo(layer).bindPopup(esc(s.name));pts.push(s)});
    r.legs.forEach(l=>l.segs.forEach(s=>pts.push(...s.path.map(p=>({lat:p[0],lng:p[1]})))))}
  else st.stops.forEach((s,i)=>{L.marker(s,{icon:pinI(i+1)}).addTo(layer);pts.push(s)});
  const key=JSON.stringify([st.origin,st.stops.map(s=>[s.lat,s.lng]),!!r,$('#round').checked]);
  if(key===fitKey)return;fitKey=key;
  if(pts.length>1)map.fitBounds(L.latLngBounds(pts.map(p=>[p.lat,p.lng])),{padding:[40,40]});
  else if(pts.length===1)map.setView(pts[0],14)}

/* ============ GEOCODING (manual add) ============ */
async function geocode(q){
  const validPoint=p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&Math.abs(p.lat)<=90&&Math.abs(p.lng)<=180;
  const m=q.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if(m){const p={lat:+m[1],lng:+m[2]};return validPoint(p)?p:null}
  try{const d=await(await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ph&q='+encodeURIComponent(q))).json();
    if(!d.length)return null;
    const p={lat:+d[0].lat,lng:+d[0].lon};return validPoint(p)?p:null}catch(e){return null}}
async function addByText(asOrigin){
  const q=$('#addr').value.trim();if(!q)return;
  const p=await geocode(q);if(!p){toast(t('notFound'),'bad');return}
  $('#addr').value='';addPoint(p.lat,p.lng,q,asOrigin);map.setView(p,15)}
$('#addDrop').onclick=()=>addByText(false);$('#addOrg').onclick=()=>addByText(true);
$('#addr').onkeydown=e=>{if(e.key==='Enter')addByText(false)};
$('#gps').onclick=()=>st.me?(st.origin={...st.me,name:t('myLoc')},render()):askLoc();
function clearForm(){
  st.origin=null;st.stops=[];st.sel={};st.editId=null;st.editSched=false;fitKey='';
  $('#addr').value='';$('#date').value=ymd(new Date());$('#time').value='08:00';$('#round').checked=true;$('#pri').value='balanced';$('#tmode').value='auto';
  editNote();render();map.setView(st.me||[14.5995,120.9842],12)}
$('#clear').onclick=clearForm;
function editNote(){const x=st.editId&&st.H.find(q=>q.id===st.editId);$('#editnote').hidden=!x;if(x)$('#editnote').textContent=t('editing',{d:x.date+' '+x.time})}

/* ============ COST / TIME / EFFORT ============ */
const depart=()=>new Date(($('#date').value||ymd(new Date()))+'T'+($('#time').value||'08:00'));
function evalV(v,r){
  const water=v.dom==='water',km1=water?r.waterKm:r.landKm,
  kg=st.stops.reduce((a,s)=>a+ +s.kg,0),needC=st.stops.some(s=>CLOSED.includes(s.cargo)),trips=Math.max(1,Math.ceil(kg/v.cap)),
  // land: road time with traffic x vehicle factor, never faster than the vehicle's own speed
  sec1=water?km1/v.speed*3600+r.portStops*PORT_MIN*60:Math.max(r.landSec*v.tf,km1/v.speed*3600),
  service=(water&&r.landKm>0)?0:st.stops.length*SERVICE_MIN/60,
  km=km1*trips,driveHrs=sec1/3600,hrs=driveHrs*trips+service,
  idle=water?1:1+.35*Math.max(0,r.factor-1),
  fuelCost=km/v.kmpl*st.fuel[v.fuel]*idle,labor=hrs*v.hourly,lvl=Math.min(5,v.effort+trips-1);
  let why='';if(needC&&!v.closed)why=t('needClosed');else if(trips>MAXTRIPS)why=t('capShort')+' ('+kg+' kg)';else if(v.maxKm&&km1>v.maxKm)why=t('tooFar',{km:v.maxKm});
  return{v,km,hrs,driveHrs,service,trips,fuelCost,labor,cost:fuelCost+labor,lvl,eff:lvl*hrs,ok:!why,why}}
const W={balanced:[.4,.35,.25],cheap:[1,0,0],fast:[0,1,0],easy:[0,0,1]};
const lvlN=n=>t(n<=2?'L1':n<=3?'L2':'L3');
const fmtT=m=>{const h=Math.floor(Math.round(m)/60),mm=Math.round(m)%60;return h?h+'h '+mm+'m':mm+' min'};
const clock=d=>d.toLocaleTimeString('en-PH',{hour:'numeric',minute:'2-digit'});

/* ============ RENDER ============ */
function stopsUI(){
  $('#nostop').hidden=st.stops.length>0;
  $('#stops').innerHTML=st.stops.map((s,i)=>`<div class="stop">
   <div class="n"><b>${i+1}</b></div><input id="sn${i}" value="${esc(s.name)}" onchange="upd(${i},'name',this.value)" aria-label="Name">
   <input type="number" min="0" value="${+s.kg}" onchange="upd(${i},'kg',this.value)" aria-label="kg" title="kg">
   <div class="sub"><select onchange="upd(${i},'cargo',this.value)">${Object.keys(CI).map(k=>`<option value="${k}" ${k==s.cargo?'selected':''}>${t('c_'+k)}</option>`).join('')}</select>
   ${t('by')} <input type="time" value="${esc(s.by)}" onchange="upd(${i},'by',this.value)">
   <span class="acts"><button class="ib" title="Edit" onclick="$('#sn${i}').focus()">${ic('edit')}</button><button class="ib" title="Update" onclick="relocate(${i})">${ic('refresh')}</button><button class="ib d" title="Delete" onclick="del(${i})">${ic('trash')}</button></span></div></div>`).join('')}
window.upd=(i,k,v)=>{st.stops[i][k]=k==='kg'?Math.max(0,+v||0):v;if(k!=='name')render()};
window.del=i=>{st.stops.splice(i,1);render()};
window.relocate=async i=>{const p=await geocode(st.stops[i].name);if(!p){toast(t('notFound'),'bad');return}Object.assign(st.stops[i],p);render()};

let seq=0;
async function render(){
  if(!st.user)return;stopsUI();
  const n=++seq;st.r=null;st.chosen=null;
  if(!st.origin||!st.stops.length){drawMap();$('#res').hidden=true;$('#empty').hidden=false;$('#loading').hidden=true;return}
  $('#empty').hidden=true;$('#loading').hidden=false;$('#res').classList.add('stale');drawMap();
  let r;try{r=await plan({origin:st.origin,stops:st.stops,round:$('#round').checked,depart:depart(),pri:$('#pri').value,mode:$('#tmode').value,cancelled:()=>n!==seq})}
  catch(e){if(n!==seq)return;$('#loading').hidden=true;$('#res').hidden=true;$('#empty').hidden=false;if(e.message!=='cancelled'){$('#empty').textContent=t(D[e.message]?e.message:'routeFail')}return}
  if(n!==seq)return;st.r=r;$('#empty').textContent=t('empty');$('#loading').hidden=true;$('#res').classList.remove('stale');$('#res').hidden=false;
  renderResults()}

function renderResults(){
  const r=st.r;if(!r)return;
  const need=[r.landKm>.05?'land':null,r.waterKm>.05?'water':null].filter(Boolean);if(!need.length)need.push('land');
  const types=[...new Set(st.stops.map(s=>s.cargo))],perish=types.some(x=>PERISH.includes(x)),pri=$('#pri').value,
    w=perish&&pri==='balanced'?[.2,.7,.1]:W[pri];
  // Only vehicles that fit this trip: land vehicles for road parts, boats for water parts
  const groups=need.map(dom=>{
    const rows=V.filter(v=>v.dom===dom).map(v=>evalV(v,r)),ok=rows.filter(x=>x.ok);
    let best=null,ch=null;
    if(ok.length){const mn=k=>Math.max(.01,Math.min(...ok.map(x=>x[k]))),m={cost:mn('cost'),hrs:mn('hrs'),eff:mn('eff')};
      ok.forEach(x=>x.score=w[0]*x.cost/m.cost+w[1]*x.hrs/m.hrs+w[2]*x.eff/m.eff);
      best=ok.reduce((a,b)=>b.score<a.score?b:a);ch=ok.find(x=>x.v.id===st.sel[dom])||best}
    return{dom,rows,ok,best,ch,m:ok.length?{cost:Math.min(...ok.map(x=>x.cost)),hrs:Math.min(...ok.map(x=>x.hrs)),eff:Math.min(...ok.map(x=>x.eff))}:{}}});
  const complete=groups.every(g=>g.ch),parts=groups.map(g=>g.ch).filter(Boolean),sum=k=>parts.reduce((a,x)=>a+x[k],0);
  const ch=st.chosen=complete?{parts,land:groups.find(g=>g.dom==='land')?.ch||null,water:groups.find(g=>g.dom==='water')?.ch||null,
    cost:sum('cost'),fuelCost:sum('fuelCost'),hrs:sum('hrs'),km:sum('km')}:null;
  const isBest=complete&&groups.every(g=>g.ch===g.best);
  const worst=complete?groups.reduce((a,g)=>a+Math.max(...g.ok.map(x=>x.cost)),0):0;
  const kind=need.length>1?t('tBoth'):need[0]==='water'?t('tWater'):t('tLand');
  $('#best').innerHTML=!ch?'<strong>'+t('noOk')+'</strong>':
   `<div class="big">${ch.parts.map(x=>ic(x.v.icon)).join(' ')}</div><div><small>${t(isBest?'best':'chosen')} · ${kind}</small><strong>${ch.parts.map(x=>x.v.name).join(' + ')}</strong></div>
   <div><small>${t('total')}</small><strong>${peso(ch.cost)}</strong></div><div><small>${t('dur')}</small><strong>${fmtT(ch.hrs*60)}</strong></div>
   <div><small>${t('dist')}</small><strong>${ch.km.toFixed(1)} km</strong></div><div><small>${t('saved')}</small><strong>${peso(worst-ch.cost)}</strong></div>`;
  trafficUI(r,ch);
  const notes=[];if(need.length>1)notes.push(t('nBoth'));if(r.waterKm>.05)notes.push(t('nWater'));if(r.estimate)notes.push(t('nEstimate'));if(r.offroad)notes.push(t('nOffroad'));if(r.forcedWater)notes.push(t('nForced'));
  $('#notes').hidden=!notes.length;$('#notes').innerHTML=notes.map(x=>`<p>${ic('g-alert')} ${x}</p>`).join('');
  $('#tips').innerHTML=(perish?`<li class="g">${t('gen')}</li>`:'')+types.map(k=>`<li>${ic(CI[k])} <b>${t('c_'+k)}</b>: ${tip(k)}</li>`).join('');
  $('#cards').innerHTML=groups.map(g=>`${need.length>1?`<h3 class="grp">${t(g.dom==='land'?'gLand':'gWater')}</h3>`:''}<div class="grid">${g.rows.map(x=>`<button class="btn vc ${x.ok?'':'off'} ${x===g.ch?'on':''}" ${x.ok?'':'disabled'} onclick="pick('${g.dom}','${x.v.id}')">
   ${x===g.best?'<span class="tag">'+ic('g-trophy')+'</span>':''}<div class="ic">${ic(x.v.icon)}</div><b>${x.v.name}</b><small>${t('cap')} ${x.v.cap.toLocaleString()} kg</small>
   ${x.ok?`<small>${peso(x.cost)} · ${fmtT(x.hrs*60)}</small>`:`<small class="late">${x.why}</small>`}</button>`).join('')}</div>`).join('');
  etaUI(r,ch);
  const tag=(g,x,k)=>x.ok&&x[k]===g.m[k]?`<span class="b">${t('low')}</span>`:'';
  $('#cmp').innerHTML=`<table><tr><th>${t('vehicle')}</th><th>${ic('g-clock')}</th><th>${t('cost')}</th><th>${t('fuelC')}</th><th>${t('labor')}</th><th>${t('effort')}</th><th>${t('trips')}</th></tr>${groups.map(g=>g.rows.map(x=>x.ok?
   `<tr><td>${ic(x.v.icon)} ${x.v.name}${x===g.best?' '+ic('g-trophy'):''}</td><td>${fmtT(x.hrs*60)}${tag(g,x,'hrs')}</td><td>${peso(x.cost)}${tag(g,x,'cost')}</td><td>${peso(x.fuelCost)}</td><td>${peso(x.labor)}</td><td>${lvlN(x.lvl)}${tag(g,x,'eff')}</td><td>${x.trips}</td></tr>`:
   `<tr class="muted"><td>${ic(x.v.icon)} ${x.v.name}</td><td colspan="6">${x.why}</td></tr>`).join('')).join('')}</table>`;
  if(ch)charts(groups.flatMap(g=>g.ok),ch,r);
  drawMap(r)}
window.pick=(dom,id)=>{st.sel[dom]=id;renderResults()};

function trafficUI(r,ch){
  if(r.landKm<=.05){$('#traffic').hidden=true;return}
  const delay=Math.max(0,r.landSec-r.freeSec)/60,f=r.factor,d=depart(),
    lv=f<1.12?['clear','trClear']:f<1.35?['light','trLight']:f<1.65?['mod','trMod']:['heavy','trHeavy'],
    status=lv[0]==='clear'?t('trClear'):`${t('trLikely')} · ${t(lv[1])}`,
    delayText=delay<1?t('trNoDelay'):t('trDelayValue',{d:fmtT(delay)}),
    tripTime=ch?fmtT(ch.hrs*60):'–';
  let tipTxt='';
  if(r.trafficSource!=='tomtom'){
    let best=null;for(let h=5;h<=21;h++){const x=new Date(d);x.setHours(h,0,0,0);if(x<new Date())continue;const k=trafficFactor(x);if(!best||k<best.k)best={k,x}}
    if(best){const save=(r.landSec-r.freeSec*best.k)/60;if(save>=5)tipTxt=t('betterTime',{t:clock(best.x),m:Math.round(save)})}}
  $('#traffic').hidden=false;
  $('#traffic').innerHTML=`<div class="traffic-top"><span class="tr ${lv[0]}">${status}</span><span>${delayText}</span></div>
    <p class="traffic-time">${t('trTravelTime',{time:tripTime})}</p>
    <p class="muted traffic-source">${d.toLocaleDateString(lang?'fil-PH':'en-PH',{weekday:'long'})} ${clock(d)} · ${t(r.trafficSource==='tomtom'?'trLive':'trEst')} ${tipTxt}</p>`}

function etaUI(r,ch){
  const dep=depart();let tm=0;const lines=[];
  const legMin=l=>l.segs.reduce((a,s)=>{
    if(s.water){const b=ch?.water;return a+(b?s.km/b.v.speed*60+PORT_MIN:0)}
    const c=ch?.land;return a+(c&&r.landKm?c.driveHrs*60*(r.landSec?s.sec/r.landSec:s.km/r.landKm):s.sec/60)},0);
  r.legs.forEach((l,k)=>{tm+=legMin(l);const at=new Date(dep.getTime()+tm*60000);
    const way=l.segs.some(s=>s.water)?(l.segs.some(s=>!s.water)?ic('g-truck')+ic('g-boat'):ic('g-boat')):ic('g-truck');
    if(l.to==null){lines.push(`<tr><td>${ic('g-return')}</td><td>${t('back')}</td><td>${way}</td><td></td><td></td><td>${l.km.toFixed(1)} km</td><td>${ch?clock(at):'–'}</td></tr>`);return}
    const s=st.stops[l.to],eta=clock(at),late=s.by&&(ymd(at)>ymd(dep)||pad(at.getHours())+':'+pad(at.getMinutes())>s.by),unsafe=MAXMIN[s.cargo]&&tm>MAXMIN[s.cargo];
    tm+=SERVICE_MIN;
    lines.push(`<tr><td>${k+1}</td><td>${esc(s.name)}</td><td>${way}</td><td>${ic(CI[s.cargo])} ${t('c_'+s.cargo)}</td><td>${+s.kg} kg</td><td>${l.km.toFixed(1)} km</td>
    <td class="${late||unsafe?'late':''}">${ch?eta:'–'}${late?` (${t('late')} ${esc(s.by)})`:''}${unsafe?` ${ic('g-alert')} ${t('unsafe')}`:''}</td></tr>`)});
  $('#eta').innerHTML=`<table><tr><th>#</th><th>${t('stop')}</th><th>${t('via')}</th><th>${t('cargo')}</th><th>${t('kg')}</th><th>${t('leg')}</th><th>${t('eta')}</th></tr>${lines.join('')}</table><p class="muted">${dep.toLocaleDateString('en-PH',{dateStyle:'medium'})} ${clock(dep)} · ${t('firstTrip')}</p>`}

function charts(ok,ch,r){
  if(!window.Chart)return;
  const ink=getComputedStyle(document.body).getPropertyValue('--ink').trim();Chart.defaults.color=ink;c1&&c1.destroy();c2&&c2.destroy();
  c1=new Chart($('#c1'),{type:'bar',data:{labels:ok.map(x=>x.v.name),datasets:[{label:t('fuelC'),data:ok.map(x=>Math.round(x.fuelCost)),backgroundColor:'#F28C00'},{label:t('labor'),data:ok.map(x=>Math.round(x.labor)),backgroundColor:'#737373'}]},options:{maintainAspectRatio:false,scales:{x:{stacked:true},y:{stacked:true,title:{display:true,text:'₱'}}}}});
  const lb=r.legs.map(l=>l.to==null?t('back'):st.stops[l.to].name),
  share=l=>l.segs.reduce((a,s)=>{const x=s.water?ch.water:ch.land,tot=s.water?r.waterKm:r.landKm;return a+(x&&tot?x.cost*s.km/tot:0)},0);
  c2=new Chart($('#c2'),{type:'doughnut',data:{labels:lb,datasets:[{data:r.legs.map(l=>Math.round(share(l))),backgroundColor:lb.map((_,i)=>`hsl(${(i*47+35)%360} 70% 55%)`),borderWidth:0}]},options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}})}

$('#play').onclick=()=>{
  if(!st.r||!st.chosen)return;clearInterval(st.anim);const pts=[];
  st.r.legs.forEach(l=>l.segs.forEach(s=>{const icon=(s.water?st.chosen.water:st.chosen.land)?.v.icon;s.path.forEach(p=>pts.push([p,icon]))}));
  const step=Math.max(1,Math.floor(pts.length/400));let k=0,cur=pts[0][1];
  const mkIcon=n=>L.divIcon({className:'',html:`<div class="veh">${ic(n)}</div>`,iconSize:[36,36],iconAnchor:[18,18]});
  if(st.vehMk)layer.removeLayer(st.vehMk);const mk=st.vehMk=L.marker(pts[0][0],{icon:mkIcon(cur),zIndexOffset:999}).addTo(layer);
  $('#map').scrollIntoView({behavior:'smooth',block:'nearest'});
  st.anim=setInterval(()=>{if(k>=pts.length){clearInterval(st.anim);return}const[p,n]=pts[k];if(n!==cur){cur=n;mk.setIcon(mkIcon(n))}mk.setLatLng(p);k+=step},30)};

['date','time','pri','round','tmode'].forEach(id=>$('#'+id).onchange=()=>render());
