/* V0.86 staging only. Record failed compensation before returning. */
const message=e=>String(e?.message||e);
async function recordFailure(recordCleanup,incident){try{await recordCleanup(incident);return {recorded:true}}catch(e){return {recorded:false,recordError:message(e)}}}
async function cyd86CoordinateUpload({upload,commit,trash,recordCleanup,target,image}){
 if([upload,commit,trash,recordCleanup].some(f=>typeof f!=='function'))throw Error('缺少圖片操作或異常紀錄器');
 if(!target||!image)throw Error('缺少交接或圖片');
 const uploaded=await upload(target,image);if(!uploaded?.fileId)throw Error('Drive 未回傳檔案 ID');
 try{await commit(target,'add',uploaded);return {ok:true,fileId:uploaded.fileId}}
 catch(commitError){try{await trash(target,uploaded.fileId);return {ok:false,compensated:true,reason:'firestore_commit_failed',message:message(commitError)}}
 catch(trashError){const incident={type:'orphan_upload',target,fileId:uploaded.fileId,commitError:message(commitError),cleanupError:message(trashError)};return {ok:false,requiresManualCleanup:true,reason:'orphan_upload',fileId:uploaded.fileId,...await recordFailure(recordCleanup,incident)}}}
}
async function cyd86CoordinateDelete({markDeleted,trash,recordCleanup,target,fileId}){
 if([markDeleted,trash,recordCleanup].some(f=>typeof f!=='function'))throw Error('缺少刪除操作或異常紀錄器');
 if(!target||!fileId)throw Error('缺少交接或檔案 ID');
 await markDeleted(target,fileId);
 try{await trash(target,fileId);return {ok:true,fileId}}
 catch(trashError){const incident={type:'untrashed_deleted_reference',target,fileId,cleanupError:message(trashError)};return {ok:false,requiresManualCleanup:true,reason:'untrashed_deleted_reference',fileId,...await recordFailure(recordCleanup,incident)}}
}
module.exports={cyd86CoordinateUpload,cyd86CoordinateDelete};