const resetCopy={
  passwordResetTitle:['Reset your password','I-reset ang password','Reset password'],
  passwordResetIntro:['Choose email or SMS recovery for an account that already exists.','Pumili ng email o SMS recovery para sa kasalukuyan nang account.','Pumili ng email or SMS recovery para sa existing account.'],
  resetEmailOnlyIntro:['You tried to sign in with email. Continue with email recovery.','Sinubukan mong mag-sign in gamit ang email. Magpatuloy sa email recovery.','Email ang ginamit mong mag-sign in. Magpatuloy sa email recovery.'],
  resetPhoneOnlyIntro:['Continue by verifying the phone number linked to your password account.','Magpatuloy sa pag-verify ng numerong naka-link sa account mong may password.','Magpatuloy sa pag-verify ng number na linked sa password account mo.'],
  resetEmailTitle:['Reset by email','I-reset gamit ang email','Reset via email'],
  resetEmailNote:['We’ll email you a secure password-reset link. Firebase sends a link, not a one-time code. Open it to choose a new password.','Padadalhan ka namin ng secure na password-reset link. Link ang ipinapadala ng Firebase, hindi one-time code. Buksan ito para magtakda ng bagong password.','Mag-e-email kami ng secure password-reset link. Link ang sinisend ng Firebase, hindi OTP. Buksan ito para mag-set ng bagong password.'],
  emailLabel:['Email','Email','Email'],
  sendResetLink:['Send reset link','Ipadala ang reset link','Send reset link'],
  resetPhoneTitle:['Reset by SMS','I-reset gamit ang SMS','Reset via SMS'],
  resetPhoneNote:['SMS recovery works only if this phone number is already linked to the account that has a password.','Gagana lang ang SMS recovery kung naka-link na ang numerong ito sa account na may password.','Gagana lang ang SMS recovery kung linked na ang number sa account na may password.'],
  phoneLabel:['Mobile number','Numero ng cellphone','Mobile number'],
  sendResetCode:['Send SMS code','Ipadala ang SMS code','Send SMS code'],
  resetOtpLabel:['6-digit SMS code','6-digit na code mula sa SMS','6-digit SMS code'],
  verifyResetCode:['Verify code','I-verify ang code','Verify code'],
  newPasswordLabel:['New password (at least 6 characters)','Bagong password (6 na karakter o higit pa)','New password (6+ characters)'],
  confirmNewPassword:['Confirm new password','Kumpirmahin ang bagong password','Confirm new password'],
  setNewPassword:['Save new password','I-save ang bagong password','Save new password'],
  backToSignIn:['Back to sign in','Bumalik sa pag-sign in','Back to sign in'],
  resetEmailSent:['If an account exists for that email, a password-reset link has been sent. Check your inbox and spam folder.','Kung may account para sa email na iyan, naipadala na ang password-reset link. Tingnan ang inbox at spam folder.','Kung may account para sa email na iyan, na-send na ang password-reset link. Check ang inbox at spam folder.'],
  resetSmsSent:['If that number is linked to an account, an SMS code has been sent.','Kung naka-link ang numerong iyan sa account, naipadala na ang SMS code.','Kung linked ang number na iyan sa account, na-send na ang SMS code.'],
  resetPasswordSaved:['Your password has been updated. You can now sign in.','Na-update na ang password mo. Maaari ka nang mag-sign in.','Updated na ang password mo. Puwede ka nang mag-sign in.'],
  resetNoPassword:['This number does not have a password-based account to reset. Try signing in with your phone number or use email recovery.','Walang password-based na account ang numerong ito na maaaring i-reset. Subukang mag-sign in gamit ang numero o mag-recover gamit ang email.','Walang password account na puwedeng i-reset sa number na ito. Mag-sign in gamit ang phone o gamitin ang email recovery.'],
  resetPasswordsMismatch:['The passwords do not match.','Hindi magkapareho ang mga password.','Hindi match ang passwords.'],
  resetGenericError:['Could not complete the request. Check your details and try again.','Hindi makumpleto ang request. Tingnan ang inilagay mo at subukan ulit.','Hindi makumpleto ang request. Check ang details at try ulit.'],
  resetFirebaseRequired:['Password recovery requires Firebase Authentication to be configured.','Kailangan naka-configure ang Firebase Authentication para sa password recovery.','Kailangan naka-configure ang Firebase Authentication para sa password recovery.']
};
const resetLangSelect=document.querySelector('#resetLanguage');
document.documentElement.dataset.theme=localStorage.getItem('ruto_theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
let resetLang=Number(localStorage.getItem('ruto_lang'))||0;
let resetAuth=null,resetCaptcha=null,resetConfirmation=null,verifiedUser=null;
const resetText=key=>resetCopy[key][resetLang]||resetCopy[key][0];
const recoveryMethod=new URLSearchParams(location.search).get('method');
function renderResetLanguage(){
  document.documentElement.lang=['en','tl','tl'][resetLang];
  document.querySelectorAll('[data-copy]').forEach(node=>node.textContent=resetText(node.dataset.copy));
  document.querySelector('#resetIntro').textContent=resetText(recoveryMethod==='email'?'resetEmailOnlyIntro':recoveryMethod==='sms'?'resetPhoneOnlyIntro':'passwordResetIntro');
  resetLangSelect.value=String(resetLang);
}
function setResetStatus(message='',isError=false){
  document.querySelector('#resetStatus').textContent=isError?'':message;
  document.querySelector('#resetError').textContent=isError?message:'';
}
function resetFirebaseError(error){
  if(error.code==='auth/user-not-found'||error.code==='auth/invalid-email'||error.code==='auth/email-already-in-use'){
    return resetText('resetGenericError');
  }
  if(error.code==='auth/invalid-verification-code'||error.code==='auth/code-expired'){
    return resetText('resetGenericError');
  }
  return error.message||resetText('resetGenericError');
}
function normalizeResetPhone(value){
  let number=value.replace(/[^\d+]/g,'');
  if(/^09\d{9}$/.test(number))number='+63'+number.slice(1);
  else if(/^9\d{9}$/.test(number))number='+63'+number;
  else if(/^639\d{9}$/.test(number))number='+'+number;
  return /^\+\d{10,15}$/.test(number)?number:null;
}

resetLangSelect.value=String(resetLang);
if(recoveryMethod==='email')document.querySelector('#phoneResetSection').hidden=true;
if(recoveryMethod==='sms')document.querySelector('#emailResetSection').hidden=true;
resetLangSelect.addEventListener('change',()=>{
  resetLang=Number(resetLangSelect.value);
  localStorage.setItem('ruto_lang',String(resetLang));
  renderResetLanguage();
});
renderResetLanguage();

const firebaseConfigured=!!(window.firebase&&RUTO.FIREBASE.apiKey&&!RUTO.FIREBASE.apiKey.startsWith('PASTE'));
if(firebaseConfigured){
  const fbApp=firebase.initializeApp(RUTO.FIREBASE);
  if(RUTO.AI.appCheckSiteKey){
    if(typeof firebase.appCheck!=='function'||!firebase.appCheck.ReCaptchaEnterpriseProvider)throw new Error('Firebase App Check SDK is missing');
    if(['localhost','127.0.0.1'].includes(location.hostname))self.FIREBASE_APPCHECK_DEBUG_TOKEN=true;
    firebase.appCheck(fbApp).activate(new firebase.appCheck.ReCaptchaEnterpriseProvider(RUTO.AI.appCheckSiteKey),true);
  }
  resetAuth=firebase.auth();
  resetAuth.languageCode=resetLang?'fil':'en';
}

document.querySelector('#emailResetForm').addEventListener('submit',async event=>{
  event.preventDefault();
  setResetStatus();
  if(!resetAuth){setResetStatus(resetText('resetFirebaseRequired'),true);return}

  const email=document.querySelector('#resetEmail').value.trim().toLowerCase();
  const button=event.currentTarget.querySelector('button[type="submit"]');
  button.disabled=true;
  try{
    resetAuth.languageCode=resetLang?'fil':'en';
    await resetAuth.sendPasswordResetEmail(email,{
      url:new URL('./index.html',location.href).href,
      handleCodeInApp:false
    });
    setResetStatus(resetText('resetEmailSent'));
  }catch(error){
    if(error.code==='auth/user-not-found')setResetStatus(resetText('resetEmailSent'));
    else setResetStatus(resetFirebaseError(error),true);
  }finally{button.disabled=false}
});

document.querySelector('#phoneResetForm').addEventListener('submit',async event=>{
  event.preventDefault();
  setResetStatus();
  if(!resetAuth){setResetStatus(resetText('resetFirebaseRequired'),true);return}

  const phone=normalizeResetPhone(document.querySelector('#resetPhone').value);
  if(!phone){setResetStatus(resetText('resetGenericError'),true);return}
  const button=document.querySelector('#sendResetCode');
  button.disabled=true;
  try{
    resetAuth.languageCode=resetLang?'fil':'en';
    resetCaptcha=resetCaptcha||new firebase.auth.RecaptchaVerifier('resetRecaptcha',{size:'invisible'});
    resetConfirmation=await resetAuth.signInWithPhoneNumber(phone,resetCaptcha);
    document.querySelector('#verifyResetForm').hidden=false;
    document.querySelector('#resetOtp').value='';
    document.querySelector('#resetOtp').focus();
    setResetStatus(resetText('resetSmsSent'));
  }catch(error){
    setResetStatus(resetFirebaseError(error),true);
    if(resetCaptcha)resetCaptcha.clear();
    resetCaptcha=null;
    document.querySelector('#resetRecaptcha').replaceChildren();
  }finally{button.disabled=false}
});

document.querySelector('#verifyResetForm').addEventListener('submit',async event=>{
  event.preventDefault();
  setResetStatus();
  const code=document.querySelector('#resetOtp').value.trim();
  if(!resetConfirmation||!/^\d{6}$/.test(code)){setResetStatus(resetText('resetGenericError'),true);return}

  const button=event.currentTarget.querySelector('button[type="submit"]');
  button.disabled=true;
  try{
    const result=await resetConfirmation.confirm(code);
    const user=result.user;
    if(result.additionalUserInfo?.isNewUser){
      await user.delete();
      await resetAuth.signOut();
      resetConfirmation=null;
      setResetStatus(resetText('resetNoPassword'),true);
      return;
    }

    if(!user.providerData.some(provider=>provider.providerId==='password')){
      await resetAuth.signOut();
      resetConfirmation=null;
      setResetStatus(resetText('resetNoPassword'),true);
      return;
    }

    verifiedUser=user;
    document.querySelector('#newPasswordForm').hidden=false;
    document.querySelector('#newPassword').focus();
  }catch(error){setResetStatus(resetFirebaseError(error),true)}
  finally{button.disabled=false}
});

document.querySelector('#newPasswordForm').addEventListener('submit',async event=>{
  event.preventDefault();
  setResetStatus();
  const password=document.querySelector('#newPassword').value;
  const confirm=document.querySelector('#confirmPassword').value;
  if(password.length<6){setResetStatus(resetText('resetGenericError'),true);return}
  if(password!==confirm){setResetStatus(resetText('resetPasswordsMismatch'),true);return}
  if(!verifiedUser){setResetStatus(resetText('resetGenericError'),true);return}

  const button=event.currentTarget.querySelector('button[type="submit"]');
  button.disabled=true;
  try{
    await verifiedUser.updatePassword(password);
    await resetAuth.signOut();
    verifiedUser=null;
    resetConfirmation=null;
    setResetStatus(resetText('resetPasswordSaved'));
    document.querySelector('#newPasswordForm').hidden=true;
    document.querySelector('#verifyResetForm').hidden=true;
  }catch(error){setResetStatus(resetFirebaseError(error),true)}
  finally{button.disabled=false}
});
