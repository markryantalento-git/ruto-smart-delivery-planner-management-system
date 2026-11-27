/* ============ IN-APP NOTIFICATIONS ============ */
let notificationOwner='',notificationItems=[],notificationSyncWarned=false;
const notificationStorageKey=owner=>'ruto_notifications_v1_'+owner;
function warnNotificationSync(error){
  console.warn('Notification sync failed.',error);
  if(!notificationSyncWarned){notificationSyncWarned=true;toast(t('notificationSyncFailed'),'bad')}
}

function loadNotifications(){
  const owner=st.user||'guest';
  if(owner===notificationOwner)return;
  notificationOwner=owner;
  notificationItems=LS(notificationStorageKey(owner),[]).filter(item=>item&&item.id&&item.title).slice(0,40);
  if(owner!=='guest')syncCloudNotifications(owner)
}
function saveNotifications(){
  SV(notificationStorageKey(notificationOwner||'guest'),notificationItems)
}
function persistCloudNotification(item){
  if(!db||!FB_ON||!st.user)return;
  const data={id:item.id,title:item.title,body:item.body,at:item.at,read:item.read};
  if(item.key)data.key=item.key;
  db.collection('users').doc(st.user).collection('notifications').doc(item.id).set(data,{merge:true})
    .catch(warnNotificationSync)
}
async function syncCloudNotifications(owner){
  if(!db||!FB_ON||!owner)return;
  try{
    const snapshot=await db.collection('users').doc(owner).collection('notifications').orderBy('at','desc').limit(40).get();
    if(st.user!==owner||notificationOwner!==owner)return;
    const merged=new Map(notificationItems.map(item=>[item.id,item])),cloudIds=new Set();
    snapshot.docs.forEach(doc=>{
      cloudIds.add(doc.id);
      const local=merged.get(doc.id),cloud=doc.data();
      merged.set(doc.id,{...cloud,id:doc.id,read:Boolean(cloud.read||local?.read)})
    });
    notificationItems=[...merged.values()].sort((a,b)=>b.at-a.at).slice(0,40);
    saveNotifications();
    renderNotifications();
    notificationItems.filter(item=>!cloudIds.has(item.id)).forEach(persistCloudNotification)
  }catch(error){warnNotificationSync(error)}
}
function renderNotifications(){
  loadNotifications();
  const unread=notificationItems.reduce((count,item)=>count+(!item.read?1:0),0),
    badge=$('#notificationBadge'),list=$('#notificationList');
  badge.textContent=unread>9?'9+':String(unread);
  badge.hidden=unread===0;
  list.replaceChildren();
  if(!notificationItems.length){
    const empty=document.createElement('p');
    empty.className='notification-empty';
    empty.textContent=t('noNotifications');
    list.append(empty);
    return
  }
  notificationItems.forEach(item=>{
    const row=document.createElement('button');
    row.type='button';
    row.className='notification-item'+(item.read?'':' is-unread');
    const title=document.createElement('strong');
    title.textContent=item.title;
    const body=document.createElement('span');
    body.textContent=item.body;
    const time=document.createElement('small');
    time.textContent=new Date(item.at).toLocaleString(lang===1?'fil-PH':'en-PH',{dateStyle:'short',timeStyle:'short'});
    row.append(title,body,time);
    row.addEventListener('click',()=>{
      item.read=true;
      saveNotifications();
      persistCloudNotification(item);
      renderNotifications();
      if(item.key?.startsWith('release:'))window.openReleaseDetails?.(item)
    });
    list.append(row)
  })
}
function addAppNotification(title,body,key){
  loadNotifications();
  const safeKey=key?String(key).slice(0,200):'';
  if(safeKey&&notificationItems.some(item=>item.key===safeKey))return;
  notificationItems.unshift({id:Date.now()+'-'+Math.random().toString(36).slice(2,8),key:safeKey,title:String(title).slice(0,120),body:String(body).slice(0,600),at:Date.now(),read:false});
  notificationItems=notificationItems.slice(0,40);
  saveNotifications();
  persistCloudNotification(notificationItems[0]);
  renderNotifications()
}
window.addAppNotification=addAppNotification;
window.refreshNotifications=renderNotifications;

const notificationButton=$('#notificationButton'),notificationPanel=$('#notificationPanel'),notificationMenu=$('.notification-menu');
function positionNotificationPanel(){
  const trigger=notificationButton.getBoundingClientRect(),
    width=Math.min(360,Math.max(0,document.documentElement.clientWidth-24)),
    height=Math.max(120,window.innerHeight-trigger.bottom-20);
  notificationPanel.style.width=`${width}px`;
  notificationPanel.style.top=`${trigger.bottom+10}px`;
  notificationPanel.style.maxHeight=`min(520px,${height}px)`
}
function toggleNotificationPanel(show){
  notificationPanel.hidden=!show;
  notificationButton.setAttribute('aria-expanded',String(show));
  if(show){positionNotificationPanel();renderNotifications()}
}
notificationButton.addEventListener('click',()=>toggleNotificationPanel(notificationPanel.hidden));
window.addEventListener('resize',()=>{if(!notificationPanel.hidden)positionNotificationPanel()});
$('#notificationClose').addEventListener('click',()=>{
  toggleNotificationPanel(false);
  notificationButton.focus()
});
$('#notificationRead').addEventListener('click',()=>{
  loadNotifications();
  notificationItems=notificationItems.map(item=>({...item,read:true}));
  saveNotifications();
  notificationItems.forEach(persistCloudNotification);
  renderNotifications()
});
document.addEventListener('click',event=>{
  if(!notificationMenu.contains(event.target))toggleNotificationPanel(false)
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!notificationPanel.hidden){toggleNotificationPanel(false);notificationButton.focus()}
});
function notificationLang(){
  notificationButton.setAttribute('aria-label',t('notifications'));
  notificationButton.title=t('notifications');
  $('#notificationClose').setAttribute('aria-label',t('closeNotifications'));
  $('#notificationClose').title=t('closeNotifications')
}
$$('.lang').forEach(select=>select.addEventListener('change',notificationLang));
notificationLang();
renderNotifications();
