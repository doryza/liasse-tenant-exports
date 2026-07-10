module.exports = function(services){
 services.scheduler.register('complete-past-bookings',3600000,async function(ctx){var db=ctx.db;try{await db.run("UPDATE bookings SET status='completed', updated_at=NOW() WHERE status='confirmed' AND booking_date < CURRENT_DATE");}catch(e){}});
};
