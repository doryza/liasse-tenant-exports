module.exports = function(services){
  const db=services.db;
  services.scheduler.register('raze-lifecycle', 60000, async ({ db })=>{
    try{
      await db.run("UPDATE razes SET status='active', updated_at=NOW() WHERE status='upcoming' AND starts_at IS NOT NULL AND starts_at<=NOW()");
      const due=await db.all("SELECT * FROM razes WHERE status='active' AND ends_at IS NOT NULL AND ends_at<=NOW()");
      for(const raze of due){
        const entries=await db.all("SELECT * FROM raze_entries WHERE raze_id=$1 AND payment_status='confirmed'",[raze.id]);
        let pool=[]; entries.forEach(function(e){ const q=e.quantity||1; for(let i=0;i<q;i++) pool.push(e); });
        const seed=services.crypto.randomBytes(16); let winner=null, idx=-1;
        if(pool.length>0){ idx=services.crypto.randomInt(0,pool.length); winner=pool[idx]; }
        const proof=services.crypto.sha256(seed+'|'+raze.id+'|'+pool.length+'|'+idx+'|'+new Date().toISOString());
        await db.run("UPDATE razes SET status='drawn', winner_user_id=$1, winner_name=$2, draw_seed=$3, draw_proof=$4, total_tickets=$5, drawn_at=NOW(), updated_at=NOW() WHERE id=$6",[winner?winner.user_id:null, winner?winner.user_name:null, seed, proof, pool.length, raze.id]);
        await db.run('INSERT INTO winners (raze_id,raze_title,winner_name,card_name,image_url,draw_date,draw_proof,total_tickets,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),$6,$7,NOW(),NOW())',[raze.id, raze.title, winner?winner.user_name:'—', raze.card_name||'', raze.image_url||'', proof, pool.length]);
        if(winner&&winner.user_id){
          try{ await services.push.sendToUser(winner.user_id,{ title:'Félicitations!', body:'Vous avez gagné '+raze.title }); }catch(e){}
          try{ if(winner.user_email) await services.email.send({ to:winner.user_email, subject:'Vous avez gagné sur RAZZ·UP!', html:'<p>Félicitations, vous avez remporté <strong>'+raze.title+'</strong>. Notre équipe vous contactera pour la livraison.</p>' }); }catch(e){}
        }
      }
    }catch(e){ console.error('raze-lifecycle', e.message); }
  });
};