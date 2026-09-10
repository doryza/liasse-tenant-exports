'use strict';
const {sameOrigin}=require('./agent-tracking-v1');
const money=(n,lang)=>new Intl.NumberFormat(lang==='en'?'en-CA':'fr-CA',{style:'currency',currency:'CAD'}).format(Number(n||0)/100);
function register(router,services,h){const db=services.db;
 const protectAdmin=(req,res)=>{require('./broker-auth-v3').protect(res);if(!services.admin.isAdmin(req)){res.sendStatus(403);return false;}if(req.method!=='GET'&&(!sameOrigin(req)||!req.is('application/json'))){res.sendStatus(403);return false;}return true;};
 async function page(req,res,admin){let broker;if(admin){if(!protectAdmin(req,res))return;}else{broker=await h.requireBroker(req,res);if(!broker)return;}
 const campaign=await db.get('SELECT * FROM broker_campaigns WHERE id=$1'+(admin?'':' AND broker_id=$2'),admin?[Number(req.params.id)||0]:[Number(req.params.id)||0,broker.id]);if(!campaign)return res.sendStatus(404);
 const invoices=await db.all("SELECT id,invoice_number,emailed_at,email_error,email_previewed_at FROM broker_invoices WHERE campaign_id=$1 AND broker_id=$2 ORDER BY id DESC",[campaign.id,campaign.broker_id]);
 res.render('campaign-order',{...await h.baseLocals(req),campaign,invoices,admin,csrf:req._vvSession&&req._vvSession.csrf||'',money,checkoutClosed:req.query.checkout==='closed'});
 }
 router.get('/espace/commandes/:id',h.endpoint((req,res)=>page(req,res,false)));
 router.get('/admin/campagnes/:id/paiement',h.endpoint((req,res)=>page(req,res,true)));
 router.get('/espace/commandes',h.endpoint(async(req,res)=>{const b=await h.requireBroker(req,res);if(!b)return;const page=Math.max(1,Math.min(100000,parseInt(req.query.page,10)||1));const rows=await db.all('SELECT id,kind,status,payment_status,address_count,total_cents,is_test,paypal_mode,created_at,centre_label FROM broker_campaigns WHERE broker_id=$1 ORDER BY id DESC LIMIT 26 OFFSET $2',[b.id,(page-1)*25]);res.render('campaign-orders',{...await h.baseLocals(req),campaigns:rows.slice(0,25),more:rows.length>25,page,money,unknown:req.query.payment==='unknown'});}));
 async function action(req,res,admin){let b;if(admin){if(!protectAdmin(req,res))return;}else{b=await h.requireBrokerApi(req,res);if(!b)return;}
 const c=await db.get("SELECT * FROM broker_campaigns WHERE id=$1 AND kind='paid'"+(admin?'':' AND broker_id=$2'),admin?[Number(req.params.id)||0]:[Number(req.params.id)||0,b.id]);if(!c)return res.sendStatus(404);
 const result=await h.recovery.reconcile(c.id,{req,capture:true});res.json({state:result.state,code:result.code||null,approve:result.approve||null});
 }
 router.post('/api/espace/commandes/:id/verifier',h.endpoint((req,res)=>action(req,res,false)));
 router.post('/api/admin/campagnes/:id/verifier-paiement',h.endpoint((req,res)=>action(req,res,true)));
}
module.exports={register};
