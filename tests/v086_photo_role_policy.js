'use strict';
function photoRolePolicy({uid,ownerUid,admin,operation}){
 if(typeof uid!=='string'||!uid||typeof ownerUid!=='string'||!ownerUid)return {allowed:false,role:null};
 const role=uid===ownerUid?'owner':(admin&&admin.active===true&&['editor','viewer'].includes(admin.role)?admin.role:null);
 return {allowed:['read','upload','delete'].includes(operation)&&!!role&&(operation==='read'||role!=='viewer'),role};
}
if(typeof module!=='undefined')module.exports={photoRolePolicy};