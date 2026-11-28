/* ============ START ============ */
let dashTripsChart=null,dashCostChart=null,dashVehiclesChart=null,dashDurationChart=null,dashDistanceChart=null,dashPeriod='month',weatherKey='',weatherFetchedAt=0,weatherBusy=false;
const dashPeriodCounts={day:7,week:8,month:12,quarter:8,year:5};
const dashboardDateKey=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
function dashboardBucketStart(date,period){
  const start=new Date(date.getFullYear(),date.getMonth(),date.getDate());
  if(period==='week')start.setDate(start.getDate()-((start.getDay()+6)%7));
  if(period==='month')start.setDate(1);
  if(period==='quarter')start.setMonth(Math.floor(start.getMonth()/3)*3,1);
  if(period==='year')start.setMonth(0,1);
  return start
}
function dashboardBucketKey(date,period){
  const start=dashboardBucketStart(date,period),year=start.getFullYear(),month=String(start.getMonth()+1).padStart(2,'0');
  if(period==='day'||period==='week')return dashboardDateKey(start);
  if(period==='month')return `${year}-${month}`;
  if(period==='quarter')return `${year}-Q${Math.floor(start.getMonth()/3)+1}`;
  return String(year)
}
function dashboardPeriodLabel(start,period,locale){
  if(period==='day')return start.toLocaleDateString(locale,{weekday:'short',month:'short',day:'numeric'});
  if(period==='week'){
    const end=new Date(start);end.setDate(end.getDate()+6);
    return `${start.toLocaleDateString(locale,{month:'short',day:'numeric'})}–${end.toLocaleDateString(locale,{month:'short',day:'numeric'})}`
  }
  if(period==='month')return start.toLocaleDateString(locale,{month:'short',year:'2-digit'});
  if(period==='quarter')return `Q${Math.floor(start.getMonth()/3)+1} ${start.getFullYear()}`;
  return String(start.getFullYear())
}
function dashboardPeriodBuckets(period,now=new Date()){
  const safePeriod=Object.prototype.hasOwnProperty.call(dashPeriodCounts,period)?period:'month',
    count=dashPeriodCounts[safePeriod],latest=dashboardBucketStart(now,safePeriod),locale=lang===1?'fil-PH':'en-PH',buckets=[];
  for(let offset=count-1;offset>=0;offset--){
    const start=new Date(latest);
    if(safePeriod==='day')start.setDate(start.getDate()-offset);
    if(safePeriod==='week')start.setDate(start.getDate()-7*offset);
    if(safePeriod==='month')start.setMonth(start.getMonth()-offset);
    if(safePeriod==='quarter')start.setMonth(start.getMonth()-3*offset);
    if(safePeriod==='year')start.setFullYear(start.getFullYear()-offset);
    buckets.push({key:dashboardBucketKey(start,safePeriod),start,label:dashboardPeriodLabel(start,safePeriod,locale),trips:0,cost:0,savings:0,savingsCount:0,vehicles:0,distance:0,durationTotal:0,durationCount:0})
  }
  return buckets
}
function dashboardAggregate(history,period,now=new Date()){
  const buckets=dashboardPeriodBuckets(period,now),byKey=new Map(buckets.map(bucket=>[bucket.key,bucket])),today=dashboardDateKey(now);
  for(const entry of Array.isArray(history)?history:[]){
    if(!entry||typeof entry.date!=='string')continue;
    const date=new Date(`${entry.date}T12:00:00`);
    if(!Number.isFinite(date.getTime())||dashboardDateKey(date)>today)continue;
    const bucket=byKey.get(dashboardBucketKey(date,period));
    if(!bucket)continue;
    bucket.trips++;
    const cost=Number(entry.cost),distance=Number(entry.km),duration=Number(entry.hrs);
    if(Number.isFinite(cost)&&cost>=0)bucket.cost+=cost;
    if(Number.isFinite(distance)&&distance>=0)bucket.distance+=distance;
    if(Number.isFinite(duration)&&duration>=0){bucket.durationTotal+=duration;bucket.durationCount++}
    if(typeof entry.savings==='number'&&Number.isFinite(entry.savings)&&entry.savings>=0){bucket.savings+=entry.savings;bucket.savingsCount++}
    const vehicleTypes=[entry.veh,entry.veh2].filter((id,index,all)=>typeof id==='string'&&id&&all.indexOf(id)===index),
      fleetCount=typeof entry.fleetCount==='number'&&Number.isFinite(entry.fleetCount)&&entry.fleetCount>=0?entry.fleetCount:vehicleTypes.length;
    bucket.vehicles+=fleetCount
  }
  return buckets.map(bucket=>({...bucket,averageDuration:bucket.durationCount?bucket.durationTotal/bucket.durationCount:null}))
}
function destroyDashboardCharts(){
  [dashTripsChart,dashCostChart,dashVehiclesChart,dashDurationChart,dashDistanceChart].forEach(chart=>chart?.destroy());
  dashTripsChart=dashCostChart=dashVehiclesChart=dashDurationChart=dashDistanceChart=null
}
function dashboardUI(){
  dashboardCalendarUI();
  $('#dashFuel').innerHTML=FK.map(([key,label])=>{
    const unit=key==='ev'?'/kWh':'/L',current=Number(st.fuel[key]),previous=Number(st.prev[key]),change=Math.round((current-previous)*100)/100;
    const trend=!(previous>0)?`<small class="dash-price-trend neutral">${t('fuelNoPrevious')}</small>`:
      change===0?`<small class="dash-price-trend neutral">${t('fuelNoChange')}</small>`:
      `<small class="dash-price-trend ${change>0?'is-up':'is-down'}"><span aria-hidden="true">${change>0?'▲':'▼'}</span> ${t(change>0?'fuelIncreased':'fuelDecreased',{amount:`₱${Math.abs(change).toFixed(2)}${unit}`})}</small>`;
    return `<div class="dash-price"><span>${t(label)}</span><span class="dash-price-quote"><strong>₱${current.toFixed(2)}<small>${unit}</small></strong>${trend}</span></div>`
  }).join('');
  $('#dashFuelAsOf').textContent=st.fuel.manual?t('fManual'):t('fAsOf',{d:st.fuel.asOf,s:st.fuel.source});
  const period=$('#dashPeriod').value;
  if(Object.prototype.hasOwnProperty.call(dashPeriodCounts,period))dashPeriod=period;
  const buckets=dashboardAggregate(st.H,dashPeriod),trips=buckets.reduce((sum,bucket)=>sum+bucket.trips,0),
    totals=buckets.reduce((sum,bucket)=>({cost:sum.cost+bucket.cost,savings:sum.savings+bucket.savings,savingsCount:sum.savingsCount+bucket.savingsCount,
      vehicles:sum.vehicles+bucket.vehicles,distance:sum.distance+bucket.distance,durationTotal:sum.durationTotal+bucket.durationTotal,durationCount:sum.durationCount+bucket.durationCount}),
    {cost:0,savings:0,savingsCount:0,vehicles:0,distance:0,durationTotal:0,durationCount:0});
  if(!trips){
    destroyDashboardCharts();$('#dashboardSummary').hidden=true;$('#dashboardCharts').hidden=true;
    const hasHistory=Array.isArray(st.H)&&st.H.some(entry=>entry&&typeof entry.date==='string'&&entry.date<=dashboardDateKey(new Date()));
    $('#dashboardChartsEmpty').textContent=t(hasHistory?'dashNoPeriodHistory':'dashNoHistory');$('#dashboardChartsEmpty').hidden=false;
    return
  }
  $('#dashboardSummary').hidden=false;
  $('#dashTripsTotal').textContent=String(trips);
  $('#dashSpendTotal').textContent=peso(totals.cost);
  $('#dashVehiclesTotal').textContent=String(totals.vehicles);
  $('#dashSavingsTotal').textContent=totals.savingsCount?peso(totals.savings):'—';
  if(!window.Chart){
    destroyDashboardCharts();$('#dashboardCharts').hidden=true;$('#dashboardChartsEmpty').textContent=t('dashChartUnavailable');$('#dashboardChartsEmpty').hidden=false;
    return
  }
  $('#dashboardChartsEmpty').hidden=true;$('#dashboardCharts').hidden=true;
  destroyDashboardCharts();$('#dashboardCharts').hidden=false;
  const labels=buckets.map(bucket=>bucket.label),ink=getComputedStyle(document.body).getPropertyValue('--ink').trim(),
    reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    common={responsive:true,maintainAspectRatio:false,animation:{duration:reducedMotion?0:650,easing:'easeOutQuart'},interaction:{mode:'index',intersect:false},
      plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},scales:{x:{ticks:{maxRotation:35,autoSkip:true}},y:{beginAtZero:true}}},
    create=(id,type,datasets,options={})=>new Chart($('#'+id),{type,data:{labels,datasets},options:{...common,...options,plugins:{...common.plugins,...options.plugins},scales:{...common.scales,...options.scales}}}),
    integerAxis={beginAtZero:true,ticks:{precision:0,stepSize:1}},moneyAxis={beginAtZero:true,ticks:{callback:value=>'₱'+Number(value).toLocaleString('en-PH')}};
  Chart.defaults.color=ink;
  const savingsLabel=t('dashSavings');
  dashTripsChart=create('dashTripsChart','line',[{label:t('dashTrips'),data:buckets.map(bucket=>bucket.trips),borderColor:'#087A35',backgroundColor:'rgba(8,122,53,.15)',pointBackgroundColor:'#087A35',fill:true,tension:.35,pointRadius:3}],
    {plugins:{legend:{display:false}},scales:{y:{...integerAxis}}});
  dashCostChart=create('dashCostChart','bar',[
    {label:t('dashSpend'),data:buckets.map(bucket=>bucket.cost),backgroundColor:'#FFD700',borderRadius:5},
    {label:savingsLabel,data:buckets.map(bucket=>bucket.savingsCount?bucket.savings:null),backgroundColor:'#2DAA68',borderRadius:5}],
    {plugins:{legend:{display:true,position:'bottom'},tooltip:{callbacks:{label:context=>`${context.dataset.label}: ${peso(Number(context.parsed.y)||0)}`}}},scales:{y:{...moneyAxis}}});
  dashVehiclesChart=create('dashVehiclesChart','bar',[{label:t('dashVehicles'),data:buckets.map(bucket=>bucket.vehicles),backgroundColor:'#7954A1',borderRadius:5}],
    {plugins:{legend:{display:false}},scales:{y:{...integerAxis}}});
  dashDurationChart=create('dashDurationChart','line',[{label:t('dashDuration'),data:buckets.map(bucket=>bucket.averageDuration),borderColor:'#087A35',backgroundColor:'rgba(8,122,53,.15)',pointBackgroundColor:'#087A35',fill:true,tension:.35,pointRadius:3}],
    {plugins:{legend:{display:false},tooltip:{callbacks:{label:context=>context.parsed.y===null?'—':fmtT(Math.round(context.parsed.y*60))}}},scales:{y:{beginAtZero:true,ticks:{callback:value=>fmtT(Math.round(Number(value)*60))}}}});
  dashDistanceChart=create('dashDistanceChart','line',[{label:t('dashDistance'),data:buckets.map(bucket=>bucket.distance),borderColor:'#A47C00',backgroundColor:'rgba(255,215,0,.2)',pointBackgroundColor:'#FFD700',fill:true,tension:.3,pointRadius:3}],
    {plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:value=>Number(value).toLocaleString('en-PH')+' km'}}}});
  [ ['dashTripsChart',t('dashTrips')],['dashCostChart',t('dashCosts')],['dashVehiclesChart',t('dashVehicles')],['dashDurationChart',t('dashDuration')],['dashDistanceChart',t('dashDistance')] ]
    .forEach(([id,label])=>$('#'+id).setAttribute('aria-label',`${label}: ${labels.join(', ')}`))
}
function weatherLabel(code){
  if(code===0)return t('weatherClear');
  if(code===1||code===2)return t('weatherPartlyCloudy');
  if(code===3)return t('weatherCloudy');
  if(code===45||code===48)return t('weatherFog');
  if(code>=51&&code<=57)return t('weatherDrizzle');
  if(code>=61&&code<=67)return t('weatherRain');
  if((code>=71&&code<=77)||(code>=85&&code<=86))return t('weatherSnow');
  if(code>=80&&code<=82)return t('weatherShowers');
  if(code>=95)return t('weatherStorm');
  return t('weatherUnknown')
}
async function refreshDashboardWeather(force=false){
  if(weatherBusy)return;
  const source=st.me||st.origin,point=source||{lat:14.5995,lng:120.9842},
    lat=Number(point.lat),lng=Number(point.lng),key=lat.toFixed(2)+','+lng.toFixed(2);
  if(!force&&key===weatherKey&&Date.now()-weatherFetchedAt<900000)return;
  weatherBusy=true;$('#dashWeatherRefresh').disabled=true;
  $('#dashWeatherLocation').textContent=t(st.me?'weatherNearMe':st.origin?'weatherPickup':'weatherManila');
  $('#dashWeatherValue').textContent=t('weatherLoading');$('#dashWeatherDetails').textContent='';
  try{
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)throw new Error('Invalid weather coordinates');
    const query=new URLSearchParams({latitude:String(lat),longitude:String(lng),current:'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',timezone:'Asia/Manila'}),
      result=await getJSON('https://api.open-meteo.com/v1/forecast?'+query.toString(),{cache:'no-store'},10000),current=result?.current,
      temp=Number(current?.temperature_2m),feels=Number(current?.apparent_temperature),humidity=Number(current?.relative_humidity_2m),wind=Number(current?.wind_speed_10m);
    if(![temp,feels,humidity,wind].every(Number.isFinite))throw new Error('Weather response is missing current conditions');
    $('#dashWeatherValue').textContent=`${Math.round(temp)}°C · ${weatherLabel(Number(current.weather_code))}`;
    $('#dashWeatherDetails').textContent=t('weatherDetails',{feels:Math.round(feels),humidity:Math.round(humidity),wind:Math.round(wind)});
    weatherKey=key;weatherFetchedAt=Date.now();
    $('#dashWeatherUpdated').textContent=t('weatherUpdated',{time:new Intl.DateTimeFormat(lang===1?'fil-PH':'en-PH',{hour:'numeric',minute:'2-digit',timeZone:'Asia/Manila'}).format(new Date())})
  }catch(error){console.warn('dashboard weather',error);$('#dashWeatherValue').textContent=t('weatherUnavailable');$('#dashWeatherUpdated').textContent=''}
  finally{weatherBusy=false;$('#dashWeatherRefresh').disabled=false}
}
function updateDashboardClock(){
  const now=new Date(),locale=lang===1?'fil-PH':'en-PH';
  $('#dashTime').textContent=new Intl.DateTimeFormat(locale,{hour:'numeric',minute:'2-digit',second:'2-digit',timeZone:'Asia/Manila'}).format(now);
  $('#dashDate').textContent=new Intl.DateTimeFormat(locale,{weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Manila'}).format(now)
}
$('#dashWeatherRefresh').onclick=()=>refreshDashboardWeather(true);
$('#dashFuelRefresh').onclick=()=>$('#fuelbtn').click();
$('#dashFuelEdit').onclick=()=>{showView('plan');$('#fuelPanel').open=true};
$('#dashPeriod').addEventListener('change',()=>{dashPeriod=$('#dashPeriod').value;dashboardUI()});
$$('.th').forEach(button=>button.addEventListener('click',()=>setTimeout(()=>{if(!$('#v_dash').hidden)dashboardUI()},0)));
$$('.lang').forEach(select=>select.addEventListener('change',()=>{updateDashboardClock();$('#dashWeatherRefresh').setAttribute('aria-label',t('weatherRefresh'));if(!$('#v_dash').hidden){dashboardUI();refreshDashboardWeather(true)}}));
$('#dashWeatherRefresh').setAttribute('aria-label',t('weatherRefresh'));
updateDashboardClock();setInterval(updateDashboardClock,1000);
setInterval(()=>{if(st.user&&!$('#v_dash').hidden)refreshDashboardWeather()},900000);
const supportDialog=$('#supportDialog');
$('#supportOpen').addEventListener('click',()=>supportDialog.showModal());
$('#supportDialogClose').addEventListener('click',()=>supportDialog.close());
supportDialog.addEventListener('click',event=>{if(event.target===supportDialog)supportDialog.close()});
const cookieNotice=$('#cookieNotice');
let noupeScriptState='idle';
function loadNoupeChat(){
  if(getRutoCookie('ruto_cookie_consent')!=='noupe'||['loading','loaded'].includes(noupeScriptState))return;
  noupeScriptState='loading';
  const script=document.createElement('script');
  script.src='https://www.noupe.com/embed/01a22017dae0700085cd2b4336f643c2f417.js';
  script.async=true;
  script.addEventListener('load',()=>{noupeScriptState='loaded'});
  script.addEventListener('error',()=>{
    noupeScriptState='failed';
    script.remove();
    cookieNotice.hidden=false;
    $('#cookieStatus').textContent=t('noupeLoadFailed')
  });
  document.body.append(script)
}
window.loadNoupeChat=loadNoupeChat;
const chooseCookieConsent=allowNoupe=>{
  if(!allowNoupe&&['loading','loaded'].includes(noupeScriptState)&&!window.confirm(t('noupeReloadConfirm')))return;
  if(!saveCookieConsent(allowNoupe)){$('#cookieStatus').textContent=t('cookieUnavailable');return}
  if(allowNoupe)loadNoupeChat();
  else if(['loading','loaded'].includes(noupeScriptState)){location.reload();return}
  $('#cookieStatus').textContent='';
  cookieNotice.hidden=true
};
$('#cookieAllow').onclick=()=>chooseCookieConsent(true);
$('#cookieEssential').onclick=()=>chooseCookieConsent(false);
$('#cookieSettings').onclick=()=>{cookieNotice.hidden=false;$('#cookieAllow').focus()};
const copyrightYear=document.querySelector('[data-current-year]');
if(copyrightYear)copyrightYear.textContent=new Date().getFullYear();
applyTheme(localStorage.getItem('ruto_theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
applyLang();
initCookieNotice();
if(getRutoCookie('ruto_cookie_consent')==='noupe')loadNoupeChat();
if(auth){
  const shouldRestoreSession=user=>installedAppMode||keepBrowserLogin()||hasBrowserSession(user.uid),
    showReturningSignIn=()=>{refreshAuthEntryLabel();if(!st.user&&hasKnownAccount()&&$('#authModal').hidden)openAuth('in',$('#openSignIn'))};
  let restoringUid=null;
  const consentRedirect=RutoConsent.hasPendingRedirect();
  const showConsentGate=async message=>{
    try{await auth.signOut()}
    catch(error){console.warn('Could not sign out an account without verified consent.',error)}
    busy=false;openAuth('in',$('#openSignIn'));$('#err').textContent=t(message)
  };
  const restoreAuthenticatedSession=async user=>{
    if(restoringUid===user.uid)return;
    if(!shouldRestoreSession(user)){busy=false;openAuth('in',$('#openSignIn'));return}
    restoringUid=user.uid;busy=true;
    const cached=LS('ruto_profiles',{})[user.uid]||{};
    if(RutoConsent.isConsentAccepted(cached)){
      busy=false;
      if(!st.user)enter(user.uid,user.displayName||user.email||user.phoneNumber||'User',cached);
      restoringUid=null;
      return
    }
    let timer;
    try{
      const snapshot=await Promise.race([
        db.collection('users').doc(user.uid).get(),
        new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(new Error('Profile lookup timed out')),1500)})
      ]);
      clearTimeout(timer);
      const profile=snapshot.exists?snapshot.data():{};
      if(RutoConsent.isConsentAccepted(profile)){
        cacheProfile(user.uid,profile);busy=false;
        if(!st.user)enter(user.uid,user.displayName||user.email||user.phoneNumber||'User',profile);
        return
      }
      await showConsentGate('consentRequired')
    }catch(error){
      clearTimeout(timer);
      console.warn('Could not verify consent quickly for the returning account.',error);
      await showConsentGate('consentProfileLoadFailed')
    }finally{
      if(restoringUid===user.uid)restoringUid=null;
      busy=false
    }
  };
  auth.getRedirectResult().then(async c=>{
    if(!c?.user){
      RutoConsent.clearPendingRedirect();
      if(consentRedirect&&auth.currentUser&&RutoConsent.isAccepted()){
        const user=auth.currentUser,providerId=user.providerData.find(p=>['apple.com','google.com','facebook.com'].includes(p.providerId))?.providerId,
          provider=providerId==='facebook.com'?'facebook':providerId==='apple.com'?'apple':'google',
          saved=await ensureConsentProfile(user,false,provider);
        if(!saved){await auth.signOut();busy=false;openAuth('in',$('#openSignIn'));$('#err').textContent=t('consentSaveFailed');return}
        else if(!st.user)enter(user.uid,user.displayName||user.email||'User',LS('ruto_profiles',{})[user.uid]||{})
      }
      if(restoringUid)return;
      busy=false;
      if(consentRedirect&&!auth.currentUser){
        openAuth('in',$('#openSignIn'));$('#err').textContent=t('errNet');return
      }
      if(!st.user&&auth.currentUser){
        if(shouldRestoreSession(auth.currentUser))await restoreAuthenticatedSession(auth.currentUser);
        else openAuth('in',$('#openSignIn'))
      }else showReturningSignIn();
      return
    }
    const user=c.user,accepted=RutoConsent.consumeRedirect();
    if(!accepted||!RutoConsent.isAccepted()){
      await auth.signOut();busy=false;openAuth('in',$('#openSignIn'));$('#err').textContent=t('consentRequired');return
    }
    const providerId=c.credential?.providerId||user.providerData.find(p=>['apple.com','google.com','facebook.com'].includes(p.providerId))?.providerId,
      provider=providerId==='facebook.com'?'facebook':providerId==='apple.com'?'apple':'google',
      saved=await ensureConsentProfile(user,!!c.additionalUserInfo?.isNewUser,provider);
    if(!saved){await auth.signOut();busy=false;openAuth('in',$('#openSignIn'));$('#err').textContent=t('consentSaveFailed');return}
    if(!st.user)enter(user.uid,user.displayName||user.email||'User',LS('ruto_profiles',{})[user.uid]||{});
    busy=false
  }).catch(async error=>{
    const redirectProvider=RutoConsent.pendingRedirectProvider();
    RutoConsent.clearPendingRedirect();busy=false;
    console.warn('RUTO provider redirect sign-in failed.',error);
    if(auth.currentUser&&!st.user)await restoreAuthenticatedSession(auth.currentUser);
    else if(redirectProvider||consentRedirect){openAuth('in',$('#openSignIn'));$('#err').textContent=fbErr(error)||t('errNet')}
    else{showReturningSignIn();if(!$('#authModal').hidden)$('#err').textContent=fbErr(error)}
  });
  // Returning sessions must have a consent record before the app is opened.
  auth.onAuthStateChanged(u=>{
    if(st.user||busy)return;
    if(!u){showReturningSignIn();return}
    if(shouldRestoreSession(u))restoreAuthenticatedSession(u);
    else openAuth('in',$('#openSignIn'))
  })}
else if(!FB_ON){
  const ses=LS('ruto_session',null),U0=LS('ruto_users',{}),
    browserSession=Object.keys(U0).find(uid=>hasBrowserSession(uid)),
    keepSession=keepBrowserLogin()&&U0[ses]?ses:null,
    installedSession=installedAppMode&&U0[ses]?ses:null,
    user=browserSession||keepSession||installedSession;
  if(user)enter(user,U0[user].name);
  else if(Object.keys(U0).length)openAuth('in',$('#openSignIn'))
}
