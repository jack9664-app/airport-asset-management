/* V0.86 isolated orchestration, not connected to production. */
async function cyd86CoordinateUpload({upload,commit,trash,target,image}) {
  if (![upload,commit,trash].every(x=>typeof x==='function')) throw Error('缺少圖片操作');
  if (!target || !image) throw Error('缺少交接或圖片');
  const uploaded=await upload(target,image);
  if (!uploaded?.fileId) throw Error('Drive 未回傳檔案 ID');
  try {
    await commit(target,'add',uploaded);
    return {ok:true,fileId:uploaded.fileId};
  } catch (commitError) {
    try {
      await trash(target,uploaded.fileId);
      return {ok:false,compensated:true,reason:'firestore_commit_failed',message:String(commitError.message||commitError)};
    } catch (trashError) {
      return {ok:false,compensated:false,requiresManualCleanup:true,fileId:uploaded.fileId,reason:'firestore_commit_failed_and_drive_cleanup_failed',message:String(commitError.message||commitError),cleanupMessage:String(trashError.message||trashError)};
    }
  }
}
async function cyd86CoordinateDelete({markDeleted,trash,target,fileId}) {
  if (typeof markDeleted!=='function'||typeof trash!=='function') throw Error('缺少刪除操作');
  if (!target||!fileId) throw Error('缺少交接或檔案 ID');
  await markDeleted(target,fileId);
  try {
    await trash(target,fileId);
    return {ok:true,fileId};
  } catch (error) {
    return {ok:false,requiresManualCleanup:true,fileId,reason:'drive_trash_failed',message:String(error.message||error)};
  }
}
if(typeof module!=='undefined')module.exports={cyd86CoordinateUpload,cyd86CoordinateDelete};
