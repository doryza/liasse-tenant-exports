module.exports = function(services){
  services.scheduler.register('m360-archive-appts', 6*60*60*1000, async function(ctx){
    try{ await ctx.db.run(`UPDATE appointments SET status='completed', updated_at=NOW() WHERE status IN ('pending','confirmed') AND appt_date < to_char(NOW(),'YYYY-MM-DD')`); }catch(e){}
  });
};
