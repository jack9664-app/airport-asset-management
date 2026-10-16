'use strict';const assert=require('node:assert/strict');const {photoCapacity}=require('./v086_photo_capacity_policy');
const p=(id,deleted=false)=>({fileId:'photo_'+id,deleted});
let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++};const throws=f=>{assert.throws(f);n++};
eq(photoCapacity([]),{active:0,historical:0,canUpload:true});
eq(photoCapacity([p(1),p(2),p(3),p(4),p(5)]),{active:5,historical:0,canUpload:false});
eq(photoCapacity([p(1,true),p(2),p(3),p(4),p(5)]),{active:4,historical:1,canUpload:true});
eq(photoCapacity([p(1,true),p(2,true),p(3,true),p(4,true),p(5,true),p(6)]),{active:1,historical:5,canUpload:true});
throws(()=>photoCapacity([p(1),p(1,true)]));throws(()=>photoCapacity([null]));throws(()=>photoCapacity([{fileId:'x'}]));
console.log('PASS '+n+' capacity policy tests');