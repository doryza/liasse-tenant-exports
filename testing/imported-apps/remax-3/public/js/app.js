(function(){
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  if (!form) return;
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    var orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending...';
    status.className = 'form-status'; status.textContent = '';
    var data = {
      name: document.getElementById('f-name').value.trim(),
      email: document.getElementById('f-email').value.trim(),
      phone: document.getElementById('f-phone').value.trim(),
      interest: document.getElementById('f-interest').value,
      message: document.getElementById('f-message').value.trim()
    };
    try {
      var r = await fetch('api/leads', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
      var res = await r.json();
      if (r.ok && res.success) {
        status.className = 'form-status success';
        status.textContent = 'Thank you ' + data.name + '! Joe will reach out shortly.';
        form.reset();
      } else {
        status.className = 'form-status error';
        status.textContent = res.error || 'Something went wrong. Please try again or call directly.';
      }
    } catch (err) {
      status.className = 'form-status error';
      status.textContent = 'Could not send. Please try again.';
    }
    btn.disabled = false; btn.textContent = orig;
  });
})();
