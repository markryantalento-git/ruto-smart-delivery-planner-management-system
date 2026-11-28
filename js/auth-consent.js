/* ============ ACCOUNT CREATION CONSENT ============ */
(()=>{
  const POLICY_VERSION='1.0',PENDING_KEY='ruto_pending_auth_consent_v1',
    checkbox=document.querySelector('#consentCheck'),
    providerHint=document.querySelector('#consentProviderHint');

  function readPending(){
    try{
      const value=JSON.parse(sessionStorage.getItem(PENDING_KEY)||'null');
      return value?.accepted===true&&value.policyVersion===POLICY_VERSION
    }catch(error){
      console.warn('Could not read pending RUTO consent.',error);
      return false
    }
  }
  function pendingProvider(){
    try{
      const value=JSON.parse(sessionStorage.getItem(PENDING_KEY)||'null');
      return value?.accepted===true&&value.policyVersion===POLICY_VERSION?value.provider||'':''
    }catch(error){
      console.warn('Could not read the pending RUTO sign-in provider.',error);
      return''
    }
  }
  function clearPendingRedirect(){
    try{sessionStorage.removeItem(PENDING_KEY)}
    catch(error){console.warn('Could not clear pending RUTO consent.',error)}
  }
  function refresh(mode){
    const accepted=checkbox.checked,busy=window.rutoAuthBusy===true,
      signup=mode??document.querySelector('#auth .tabs .btn.on')?.dataset.m==='up',
      submit=document.querySelector('#sub');
    if(providerHint)providerHint.hidden=accepted;
    if(submit)submit.disabled=busy||signup&&!accepted;
    ['#gbtn','#fbtn','#pbtn','#phsend','#phok'].forEach(selector=>{
      const button=document.querySelector(selector);
      if(button)button.disabled=busy||!accepted
    })
  }

  if(readPending())checkbox.checked=true;
  checkbox.addEventListener('change',()=>refresh());
  refresh();

  window.RutoConsent={
    policyVersion:POLICY_VERSION,
    isAccepted:()=>checkbox.checked,
    isConsentAccepted:(record)=>record?.consent?.accepted===true&&record.consent.policyVersion===POLICY_VERSION,
    refresh,
    rememberRedirect(provider=''){
      if(!checkbox.checked)return false;
      try{
        sessionStorage.setItem(PENDING_KEY,JSON.stringify({accepted:true,policyVersion:POLICY_VERSION,provider}));
        return true
      }catch(error){
        console.error('Could not preserve RUTO consent for provider redirect.',error);
        return false
      }
    },
    hasPendingRedirect:readPending,
    pendingRedirectProvider:pendingProvider,
    consumeRedirect(){
      const accepted=readPending();
      clearPendingRedirect();
      return accepted
    },
    clearPendingRedirect,
    firestoreFields(user){
      if(!checkbox.checked)throw new Error('RUTO consent is required before account creation');
      const timestamp=window.firebase?.firestore?.FieldValue?.serverTimestamp;
      if(typeof timestamp!=='function')throw new Error('Firebase server timestamps are unavailable');
      const displayName=String(user.displayName||user.email||user.phoneNumber||'RUTO user').slice(0,120);
      return{
        email:String(user.email||'').slice(0,254),
        displayName,
        consent:{accepted:true,policyVersion:POLICY_VERSION,acceptedAt:timestamp()}
      }
    },
    localConsent(){
      if(!checkbox.checked)throw new Error('RUTO consent is required before account creation');
      return{accepted:true,policyVersion:POLICY_VERSION,acceptedAt:new Date().toISOString()}
    }
  }
})();
