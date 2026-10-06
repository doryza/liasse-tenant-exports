'use strict';
const business=require('./business.json');
module.exports=async function(db){
 for(const [key,value] of Object.entries(business.initial_gates))await db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO NOTHING',[key,value]);
};
