/* ============ START ============ */
const copyrightYear=document.querySelector('[data-current-year]');
if(copyrightYear)copyrightYear.textContent=new Date().getFullYear();
applyTheme(localStorage.getItem('ruto_theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
applyLang();
if(auth){
  auth.getRedirectResult().then(c=>{if(c?.user&&c.additionalUserInfo?.isNewUser)saveProfile(c.user.uid,{name:c.user.displayName||'',email:c.user.email||'',provider:'google'})}).catch(e=>$('#err').textContent=fbErr(e));
  // returning users are signed in automatically
  auth.onAuthStateChanged(u=>{if(u&&!st.user&&!busy)enter(u.uid,u.displayName||u.email||u.phoneNumber||'User')})}
else if(!FB_ON){const ses=LS('ruto_session',null),U0=LS('ruto_users',{});if(ses&&U0[ses])enter(ses,U0[ses].name)}
