'use strict';
function photoCapacity(photos){
 if(!Array.isArray(photos))throw Error('Invalid photo list');
 const ids=new Set();let active=0;
 for(const p of photos){
  if(!p||typeof p!=='object'||Array.isArray(p)||typeof p.fileId!=='string'||!p.fileId)throw Error('Invalid photo');
  if(ids.has(p.fileId))throw Error('Duplicate photo');ids.add(p.fileId);
  if(typeof p.deleted!=='boolean')throw Error('Invalid deleted flag');
  if(!p.deleted)active++;
 }
 return {active,historical:photos.length-active,canUpload:active<5};
}
module.exports={photoCapacity};