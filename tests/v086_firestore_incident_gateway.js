'use strict';
function createFirestoreIncidentGateway({db,api,collectionName='photoCleanupIncidents'}){
 if(!db||!api||['doc','getDoc','runTransaction'].some(k=>typeof api[k]!=='function'))throw Error('Firestore dependencies missing');
 if(collectionName!=='photoCleanupIncidents')throw Error('Unexpected collection');
 const ref=k=>{if(typeof k!=='string'||!k||k.includes('/'))throw Error('Invalid incident key');return api.doc(db,collectionName,k)};
 return {
  async createIfAbsent(key,initial){return api.runTransaction(db,async tx=>{const r=ref(key),snap=await tx.get(r);if(snap.exists())return {created:false};tx.set(r,{...initial,createdAt:api.serverTimestamp(),updatedAt:api.serverTimestamp()});return {created:true}})},
  async get(key){const snap=await api.getDoc(ref(key));return snap.exists()?snap.data():null},
  async updateIfStatus(key,allowed,patch){if(!Array.isArray(allowed)||!allowed.length||!patch||!['blocked','resolved','retryable'].includes(patch.status))throw Error('Invalid transition request');return api.runTransaction(db,async tx=>{const r=ref(key),snap=await tx.get(r);if(!snap.exists()||!allowed.includes(snap.data().status))throw Error('Invalid status transition');tx.update(r,{...patch,updatedAt:api.serverTimestamp()});return true})}
 };
}
module.exports={createFirestoreIncidentGateway};