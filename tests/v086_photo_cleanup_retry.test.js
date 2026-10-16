'use strict';
const assert=require('node:assert/strict');const {cyd86RetryCleanup}=require('./v086_photo_cleanup_retry');
const incident={type:'orphan_upload',target:{handoverId:'h1'},fileId:'validDriveFileId123'};let n=0;
async function run(){
 const calls=[];const base={incident,readReferenceState:async()=>({status:'absent'}),trash:async()=>calls.push('trash'),markResolved:async()=>calls.push('resolved'),markBlocked:async()=>calls.push('blocked')};
 assert.deepEqual(await cyd86RetryCleanup(base),{ok:true,fileId:incident.fileId});assert.deepEqual(calls,['trash','resolved']);n++;
 calls.length=0;assert.equal((await cyd86RetryCleanup({...base,readReferenceState:async()=>({status:'active'})})).blocked,true);assert.deepEqual(calls,['blocked']);n++;
 calls.length=0;assert.equal((await cyd86RetryCleanup({...base,readReferenceState:async()=>({status:'deleted'})})).ok,true);n++;
 calls.length=0;assert.equal((await cyd86RetryCleanup({...base,trash:async()=>{throw Error('drive down')}})).retryable,true);assert.deepEqual(calls,[]);n++;
 await assert.rejects(()=>cyd86RetryCleanup({...base,readReferenceState:async()=>null}),/無法確認/);n++;
 await assert.rejects(()=>cyd86RetryCleanup({...base,incident:{...incident,fileId:'bad'}}),/格式/);n++;
 await assert.rejects(()=>cyd86RetryCleanup({...base,markResolved:async()=>{throw Error('storage down')}}),/storage down/);n++;
 await assert.rejects(()=>cyd86RetryCleanup({...base,markBlocked:async()=>{throw Error('storage down')},readReferenceState:async()=>({status:'active'})}),/storage down/);n++;
 console.log('PASS '+n+' photo cleanup retry tests');
}
run().catch(e=>{console.error(e);process.exitCode=1});