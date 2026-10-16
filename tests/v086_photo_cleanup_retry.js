'use strict';
const VALID_TYPES=new Set(['orphan_upload','untrashed_deleted_reference']);
const ID=/^[A-Za-z0-9_-]{10,150}$/;
async function cyd86RetryCleanup({incident,readReferenceState,trash,markResolved,markBlocked}){
 if(!incident||!VALID_TYPES.has(incident.type)||typeof incident.fileId!=='string'||!ID.test(incident.fileId)||!incident.target)throw Error('異常紀錄格式不合法');
 if([readReferenceState,trash,markResolved,markBlocked].some(fn=>typeof fn!=='function'))throw Error('缺少必要的安全檢查或持久化操作');
 const state=await readReferenceState(incident.target,incident.fileId);
 if(!state||!['active','deleted','absent'].includes(state.status))throw Error('無法確認 Firestore 照片參照狀態');
 if(state.status==='active'){await markBlocked(incident,'still_referenced');return {ok:false,blocked:true,reason:'still_referenced'}}
 try{await trash(incident.target,incident.fileId)}catch(error){return {ok:false,retryable:true,reason:'drive_trash_failed',message:String(error?.message||error)}}
 await markResolved(incident);return {ok:true,fileId:incident.fileId};
}
module.exports={cyd86RetryCleanup};