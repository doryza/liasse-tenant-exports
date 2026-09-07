// Locale comes from the saved invitation/account, never from signup form fields.
const provinces=['ON','AB','BC','MB','SK','NS','NB','NL','PE','NT','YT','NU'];
function province(record){
  const data=record&&(record.source_meta||record.profile)||{};
  return String(data.province||data.mailing_province||'').toUpperCase();
}
function englishOnly(record){return provinces.includes(province(record));}
function apply(req,res,record){
  if(!englishOnly(record))return;
  req.lang='en';req.vvEnglishOnly=true;
  res.cookie('pwa_lang','en',{maxAge:31536000000,sameSite:'lax',path:'/'});
}
module.exports={province,englishOnly,apply};
