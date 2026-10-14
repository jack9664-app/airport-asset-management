/**
 * V0.61 - Trusted cross-project role synchronization.
 * Deploy ONLY in main Firebase project taoyuancyd-asset-mgmt.
 * Requires service account IAM permissions on BOTH secondary projects:
 * Firebase Authentication Admin + Cloud Datastore User (Firestore).
 * Secondary rules must continue to restrict admins writes to Owner;
 * Admin SDK bypasses rules.
 * Install firebase-functions v2 and firebase-admin.
 */
const {onDocumentWritten}=require('firebase-functions/v2/firestore');
const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {initializeApp,getApps,getApp}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {getAuth}=require('firebase-admin/auth');

const MAIN='taoyuancyd-asset-mgmt';
const TARGETS=['taoyuan-asset-client','taoyuan-asset-server'];
const primary=getApps().length?getApp():initializeApp({projectId:MAIN});
const mainDb=getFirestore(primary);
const targetApps=Object.fromEntries(TARGETS.map(id=>[id,initializeApp({projectId:id},id)]));
const roles=['owner','editor','viewer'];
const normalize=e=>String(e||'').trim().toLowerCase();

async function syncTarget(projectId,mainUid,profile){
 const app=targetApps[projectId],auth=getAuth(app),db=getFirestore(app);
 const email=normalize(profile?.email);
 if(!email)throw new Error('Main admin email missing');
 let secondary;
 try{secondary=await auth.getUserByEmail(email)}
 catch(e){if(e.code==='auth/user-not-found')return {projectId,status:'awaiting-secondary-login'};throw e}
 const hasGoogle=(secondary.providerData||[]).some(p=>p.providerId==='google.com');
 if(!secondary.emailVerified||!hasGoogle)throw new Error(projectId+': secondary Google identity not verified');
 const ref=db.collection('admins').doc(secondary.uid);
 if(profile?.active===true&&roles.includes(profile?.role)){
  await ref.set({mainUid,email,role:profile.role,active:true,displayName:String(profile.displayName||''),syncedAt:new Date().toISOString()});
  return {projectId,status:'active'};
 }
 await ref.delete();
 return {projectId,status:'revoked'};
}
async function synchronize(mainUid,profile,previous){
 const candidates=[profile,previous].filter(Boolean);
 const results=[];
 for(const projectId of TARGETS){
  // Remove former email's authorization when main email changed.
  if(previous?.email&&normalize(previous.email)!==normalize(profile?.email)){
   results.push(await syncTarget(projectId,mainUid,{...previous,active:false}));
  }
  if(profile?.email)results.push(await syncTarget(projectId,mainUid,profile));
  else if(previous?.email)results.push(await syncTarget(projectId,mainUid,{...previous,active:false}));
 }
 return results;
}
exports.syncAdminOnChange=onDocumentWritten(
 {document:'admins/{uid}',region:'asia-east1',retry:true},
 async event=>{
  const before=event.data?.before?.exists?event.data.before.data():null;
  const after=event.data?.after?.exists?event.data.after.data():null;
  return synchronize(event.params.uid,after,before);
 }
);
exports.syncMySecondaryAccess=onCall(
 {region:'asia-east1',enforceAppCheck:false},
 async request=>{
  if(!request.auth)throw new HttpsError('unauthenticated','Sign in first');
  const uid=request.auth.uid;
  const snap=await mainDb.collection('admins').doc(uid).get();
  if(!snap.exists||snap.data().active!==true||!roles.includes(snap.data().role))
   throw new HttpsError('permission-denied','No active main authorization');
  const email=normalize(request.auth.token.email);
  if(request.auth.token.email_verified!==true||email!==normalize(snap.data().email))
   throw new HttpsError('permission-denied','Verified Google email does not match main authorization');
  try{return {results:await synchronize(uid,snap.data(),null)}}
  catch(e){console.error('secondary sync failed',uid,e);throw new HttpsError('internal','Secondary authorization sync failed')}
 }
);
