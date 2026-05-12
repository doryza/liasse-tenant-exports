module.exports = function(services) {
  services.scheduler.register('expire-subscriptions', 3600000, async ({ db }) => {
    try {
      await db.run("UPDATE subscriptions SET status = 'expired', updated_at = NOW() WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < NOW()");
    } catch (e) {}
  });
};