const assert=require('node:assert/strict');
const {cyd86CoordinateUpload:up,cyd86CoordinateDelete:del}=require('./v086_photo_operation_coordinator');
const target={handoverId:'test123'},image={base64:'abc'};
(async()=>{
 let events=[];
 let r=await up({target,image,upload:async()=>{events.push('upload');return {fileId:'file123'}},commit:async()=>events.push('commit'),trash:async()=>events.push('trash')});
 assert.deepEqual(events,['upload','commit']);assert.equal(r.ok,true);
 events=[];r=await up({target,image,upload:async()=>({fileId:'file123'}),commit:async()=>{throw Error('denied')},trash:async()=>events.push('trash')});assert.equal(r.compensated,true);assert.deepEqual(events,['trash']);
 r=await up({target,image,upload:async()=>({fileId:'file123'}),commit:async()=>{throw Error('denied')},trash:async()=>{throw Error('Drive down')}});assert.equal(r.requiresManualCleanup,true);assert.equal(r.fileId,'file123');
 await assert.rejects(()=>up({target,image,upload:async()=>{throw Error('upload failed')},commit:async()=>{},trash:async()=>{}}),/upload failed/);
 events=[];r=await del({target,fileId:'file123',markDeleted:async()=>events.push('mark'),trash:async()=>events.push('trash')});assert.deepEqual(events,['mark','trash']);assert.equal(r.ok,true);
 events=[];await assert.rejects(()=>del({target,fileId:'file123',markDeleted:async()=>{throw Error('denied')},trash:async()=>events.push('trash')}),/denied/);assert.deepEqual(events,[]);
 r=await del({target,fileId:'file123',markDeleted:async()=>{},trash:async()=>{throw Error('offline')}});assert.equal(r.requiresManualCleanup,true);
 console.log('PASS 7 photo operation orchestration tests');
})().catch(e=>{console.error(e);process.exitCode=1});
