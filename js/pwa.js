const installBanner=$('#installBanner');
const installButton=$('#installAppButton');
const installGuide=$('#installGuide');
const installGuideIos=$('#installGuideIos');
const installGuideOther=$('#installGuideOther');
const iosDevice=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const installedApp=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let deferredInstallPrompt=null;

function hideInstallBanner(){installBanner.hidden=true}
function showInstallGuide(){
  installGuideIos.hidden=!iosDevice;
  installGuideOther.hidden=iosDevice;
  installGuide.showModal();
}

if(!installedApp&&!LS('ruto_install_banner_dismissed',false))installBanner.hidden=false;
else hideInstallBanner();

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  deferredInstallPrompt=event;
  if(!LS('ruto_install_banner_dismissed',false))installBanner.hidden=false;
});

window.addEventListener('appinstalled',()=>{
  SV('ruto_install_banner_dismissed',true);
  deferredInstallPrompt=null;
  hideInstallBanner();
});

installButton.addEventListener('click',async()=>{
  if(!deferredInstallPrompt){showInstallGuide();return}

  try{
    await deferredInstallPrompt.prompt();
    const choice=await deferredInstallPrompt.userChoice;
    if(choice.outcome==='accepted'){
      SV('ruto_install_banner_dismissed',true);
      hideInstallBanner();
    }
  }catch(error){
    console.error('RUTO install prompt failed:',error);
    showInstallGuide();
  }finally{
    deferredInstallPrompt=null;
  }
});

$('#installBannerClose').addEventListener('click',()=>{
  SV('ruto_install_banner_dismissed',true);
  hideInstallBanner();
});

$('#installGuideClose').addEventListener('click',()=>installGuide.close());

if('serviceWorker'in navigator&&window.isSecureContext){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').catch(error=>console.error('RUTO service worker registration failed:',error));
  });
}
