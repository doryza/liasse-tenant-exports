/* Messages: mark read on open, answered / archived in one tap. */
(function () {
  if (!window.App || !window.Admin) return;
  var A = window.Admin;
  function set(id, status) { return App.request('api/admin/messages/' + id, { method: 'PUT', body: JSON.stringify({ status: status }) }); }
  A.$$('[data-msg]').forEach(function (m) {
    var id = m.getAttribute('data-msg');
    if (m.classList.contains('is-new')) set(id, 'read').catch(function () {});
    A.$$('[data-msg-status]', m).forEach(function (b) {
      b.addEventListener('click', async function () {
        try { await set(id, b.getAttribute('data-msg-status')); App.toast(A.tr('Enregistré ✓', 'Saved ✓')); m.remove(); } catch (e) { App.toast(e.message); }
      });
    });
    var reply = m.querySelector('[data-msg-reply]');
    if (reply) reply.addEventListener('click', function () { set(id, 'answered').catch(function () {}); });
  });
})();
