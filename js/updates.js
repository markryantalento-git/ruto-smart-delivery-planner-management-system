/* ============ RELEASE VERSION AND CHANGE NOTES ============ */
let releaseInfo=null;
function compareReleaseVersions(left,right){
  const a=String(left||'').split('.').map(Number),b=String(right||'').split('.').map(Number);
  if(!a.length||!b.length||a.some(n=>!Number.isInteger(n)||n<0)||b.some(n=>!Number.isInteger(n)||n<0))return 0;
  for(let i=0;i<Math.max(a.length,b.length);i++){
    const difference=(a[i]||0)-(b[i]||0);
    if(difference)return Math.sign(difference)
  }
  return 0
}
async function loadReleaseInfo(){
  const response=await fetch('./release.json?check='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw new Error('Release manifest request failed: '+response.status);
  const data=await response.json();
  if(typeof data.version!=='string'||typeof data.publishedAt!=='string'||!Number.isFinite(Date.parse(data.publishedAt))||
    !Array.isArray(data.changes)||!data.changes.every(change=>typeof change==='string'))
    throw new Error('Release manifest has an invalid format');
  releaseInfo={version:data.version,publishedAt:data.publishedAt,changes:data.changes};
  $('#appVersion').textContent='ver.'+releaseInfo.version;
  return releaseInfo
}
const releaseReady=loadReleaseInfo().catch(error=>{
  console.warn('Could not load RUTO release information.',error);
  return null
});
function releaseChangeSummary(info){
  return info.changes.map(change=>'• '+change).join('\n').slice(0,600)
}
function notifyReleaseIfNewer(info,seenVersion){
  if(!seenVersion||compareReleaseVersions(info.version,seenVersion)<=0)return;
  window.addAppNotification?.(
    t('notificationUpdateTitle',{version:'ver.'+info.version}),
    releaseChangeSummary(info),
    'release:'+info.version
  )
}
async function checkReleaseUpdate(uid){
  if(!uid)return;
  const info=await releaseReady;
  if(!info)return;
  const localKey='ruto_release_seen_'+uid;
  let seenVersion=String(LS(localKey,'')||'');
  if(FB_ON&&db){
    try{
      const ref=db.collection('users').doc(uid),snapshot=await ref.get(),
        profile=snapshot.exists?snapshot.data():null,
        cloudVersion=String(profile?.appVersion||''),
        createdAt=profile?.createdAt?.toDate?.(),
        existingAccount=!seenVersion&&!cloudVersion&&createdAt instanceof Date&&createdAt.getTime()<Date.parse(info.publishedAt);
      if(existingAccount)seenVersion='0.0.0';
      if(compareReleaseVersions(cloudVersion,seenVersion)>0)seenVersion=cloudVersion;
      notifyReleaseIfNewer(info,seenVersion);
      if(!snapshot.exists){
        if(!seenVersion||compareReleaseVersions(info.version,seenVersion)>0)SV(localKey,info.version);
        return
      }
      if(!seenVersion||compareReleaseVersions(info.version,seenVersion)>=0){
        await ref.set({appVersion:info.version},{merge:true});
        SV(localKey,info.version)
      }else SV(localKey,seenVersion);
      return
    }catch(error){console.warn('Could not sync RUTO release version to the account.',error)}
  }
  notifyReleaseIfNewer(info,seenVersion);
  if(!seenVersion||compareReleaseVersions(info.version,seenVersion)>0)SV(localKey,info.version)
}
function openReleaseDetails(item){
  const version=String(item?.key||'').replace(/^release:/,'')||releaseInfo?.version||'',
    changes=releaseInfo?.version===version?releaseInfo.changes:String(item?.body||'').split('\n').map(line=>line.replace(/^•\s*/,'' )).filter(Boolean),
    title=$('#releaseDialogTitle'),versionLabel=$('#releaseDialogVersion'),list=$('#releaseDialogChanges');
  title.textContent=t('releaseDialogTitle');
  versionLabel.textContent=t('releaseVersionLabel',{version:'ver.'+version});
  list.replaceChildren();
  const notes=changes.length?changes:[t('releaseNoChanges')];
  notes.forEach(change=>{const row=document.createElement('li');row.textContent=change;list.append(row)});
  if(!$('#releaseDialog').open)$('#releaseDialog').showModal()
}
$('#releaseDialogClose').addEventListener('click',()=>$('#releaseDialog').close());
window.checkReleaseUpdate=checkReleaseUpdate;
window.openReleaseDetails=openReleaseDetails;
