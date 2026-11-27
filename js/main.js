/* ============ START ============ */
let dashCostChart=null,dashDistanceChart=null,weatherKey='',weatherFetchedAt=0,weatherBusy=false;
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
  const entries=[...st.H].filter(x=>x.date).sort((a,b)=>(a.ts||0)-(b.ts||0)).slice(-7);
  if(!entries.length){
    dashCostChart?.destroy();dashDistanceChart?.destroy();dashCostChart=dashDistanceChart=null;
    $('#dashboardCharts').hidden=true;$('#dashboardChartsEmpty').textContent=t('dashNoHistory');$('#dashboardChartsEmpty').hidden=false;
    return
  }
  if(!window.Chart){
    $('#dashboardCharts').hidden=true;$('#dashboardChartsEmpty').textContent=t('dashChartUnavailable');$('#dashboardChartsEmpty').hidden=false;
    return
  }
  const locale=lang===1?'fil-PH':'en-PH',labels=entries.map(x=>new Date(x.date+'T12:00:00').toLocaleDateString(locale,{month:'short',day:'numeric'})),
    ink=getComputedStyle(document.body).getPropertyValue('--ink').trim();
  Chart.defaults.color=ink;
  const update=(chart,canvas,type,dataset)=>{if(!chart)return new Chart(canvas,{type,data:{labels,datasets:[dataset]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:value=>type==='bar'?'₱'+Number(value).toLocaleString('en-PH'):value+' km'}}}}});
    chart.data.labels=labels;chart.data.datasets[0].data=dataset.data;chart.update();return chart};
  dashCostChart=update(dashCostChart,$('#dashCostChart'),'bar',{label:t('dashCosts'),data:entries.map(x=>Number(x.cost)||0),backgroundColor:'#FFD700',borderRadius:5});
  dashDistanceChart=update(dashDistanceChart,$('#dashDistanceChart'),'line',{label:t('dashDistance'),data:entries.map(x=>Number(x.km)||0),borderColor:'#A47C00',backgroundColor:'rgba(255,215,0,.2)',pointBackgroundColor:'#FFD700',fill:true,tension:.3});
  $('#dashboardChartsEmpty').hidden=true;$('#dashboardCharts').hidden=false
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
$$('.th').forEach(button=>button.addEventListener('click',()=>setTimeout(()=>{if(!$('#v_dash').hidden)dashboardUI()},0)));
$$('.lang').forEach(select=>select.addEventListener('change',()=>{updateDashboardClock();$('#dashWeatherRefresh').setAttribute('aria-label',t('weatherRefresh'));if(!$('#v_dash').hidden)refreshDashboardWeather(true)}));
$('#dashWeatherRefresh').setAttribute('aria-label',t('weatherRefresh'));
updateDashboardClock();setInterval(updateDashboardClock,1000);
setInterval(()=>{if(st.user&&!$('#v_dash').hidden)refreshDashboardWeather()},900000);
const supportDialog=$('#supportDialog');
$('#supportOpen').addEventListener('click',()=>supportDialog.showModal());
$('#supportDialogClose').addEventListener('click',()=>supportDialog.close());
supportDialog.addEventListener('click',event=>{if(event.target===supportDialog)supportDialog.close()});
const cookieNotice=$('#cookieNotice');
const chooseCookieConsent=allow=>{
  if(!saveCookieConsent(allow)){$('#cookieStatus').textContent=t('cookieUnavailable');return}
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
const installedAppMode=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if(auth){
  const consentRedirect=RutoConsent.hasPendingRedirect();
  const showConsentGate=async message=>{
    try{await auth.signOut()}
    catch(error){console.warn('Could not sign out an account without verified consent.',error)}
    busy=false;openAuth('in',$('#openSignIn'));$('#err').textContent=t(message)
  };
  const restoreAuthenticatedSession=async user=>{
    if(!installedAppMode){busy=false;openAuth('in',$('#openSignIn'));return}
    busy=true;
    try{
      const snapshot=await db.collection('users').doc(user.uid).get(),
        profile=snapshot.exists?snapshot.data():{};
      if(profile.consent?.accepted===true){
        cacheProfile(user.uid,profile);busy=false;
        if(!st.user)enter(user.uid,user.displayName||user.email||user.phoneNumber||'User',profile);
        return
      }
      await showConsentGate('consentRequired')
    }catch(error){
      console.warn('Could not verify consent for the returning account.',error);
      await showConsentGate('consentProfileLoadFailed')
    }
  };
  auth.getRedirectResult().then(async c=>{
    if(!c?.user){
      RutoConsent.clearPendingRedirect();
      if(consentRedirect&&auth.currentUser&&RutoConsent.isAccepted()){
        const user=auth.currentUser,providerId=user.providerData.find(p=>['apple.com','google.com','facebook.com'].includes(p.providerId))?.providerId,
          provider=providerId==='facebook.com'?'facebook':providerId==='apple.com'?'apple':'google',
          saved=await ensureConsentProfile(user,false,provider);
        if(!saved){await auth.signOut();$('#err').textContent=t('consentSaveFailed')}
        else if(!st.user)enter(user.uid,user.displayName||user.email||'User',LS('ruto_profiles',{})[user.uid]||{})
      }
      busy=false;return
    }
    const user=c.user,accepted=RutoConsent.consumeRedirect();
    if(!accepted||!RutoConsent.isAccepted()){
      await auth.signOut();busy=false;$('#err').textContent=t('consentRequired');return
    }
    const providerId=c.credential?.providerId||user.providerData.find(p=>['apple.com','google.com','facebook.com'].includes(p.providerId))?.providerId,
      provider=providerId==='facebook.com'?'facebook':providerId==='apple.com'?'apple':'google',
      saved=await ensureConsentProfile(user,!!c.additionalUserInfo?.isNewUser,provider);
    if(!saved){await auth.signOut();busy=false;$('#err').textContent=t('consentSaveFailed');return}
    if(!st.user)enter(user.uid,user.displayName||user.email||'User',LS('ruto_profiles',{})[user.uid]||{});
    busy=false
  }).catch(async error=>{
    const redirectProvider=RutoConsent.pendingRedirectProvider();
    RutoConsent.clearPendingRedirect();busy=false;
    console.warn('RUTO provider redirect sign-in failed.',error);
    if(auth.currentUser&&!st.user)await restoreAuthenticatedSession(auth.currentUser);
    else $('#err').textContent=fbErr(error)
  });
  // Returning sessions must have a consent record before the app is opened.
  auth.onAuthStateChanged(u=>{
    if(!u||st.user||busy)return;
    if(installedAppMode)restoreAuthenticatedSession(u);
    else openAuth('in',$('#openSignIn'))
  })}
else if(!FB_ON){
  const ses=LS('ruto_session',null),U0=LS('ruto_users',{});
  if(ses&&U0[ses]){
    if(installedAppMode)enter(ses,U0[ses].name);
    else openAuth('in',$('#openSignIn'))
  }
}
