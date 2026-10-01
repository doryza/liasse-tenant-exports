/* Today: one-tap status moves and the appointment panel. */
(function () {
  if (!window.App || !window.Admin) return;
  var A = window.Admin;
  var node = document.getElementById('today-appts');
  var appts = []; try { appts = JSON.parse(node ? node.textContent : '[]'); } catch (e) {}
  var byId = {}; appts.forEach(function (a) { byId[a.id] = a; });

  document.querySelectorAll('[data-set-status]').forEach(function (b) {
    b.addEventListener('click', async function () {
      var status = b.getAttribute('data-set-status');
      b.disabled = true;
      try {
        await App.request('api/admin/appointments/' + b.getAttribute('data-id'), { method: 'PUT', body: JSON.stringify({ status: status }) });
        App.toast(A.STATUS[status] + ' ✓');
        setTimeout(function () { location.reload(); }, 450);
      } catch (e) { b.disabled = false; App.toast(e.message); }
    });
  });
  document.querySelectorAll('[data-open-appt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = byId[b.getAttribute('data-open-appt')];
      if (a) A.openAppointment(a, function () { setTimeout(function () { location.reload(); }, 450); });
    });
  });
})();
