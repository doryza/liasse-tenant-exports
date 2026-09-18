(function() {
  const form = document.getElementById('request-form');
  if (!form) return;
  const t = window.KW.t;
  const status = document.getElementById('form-status');
  const button = document.getElementById('send-request');
  const fields = document.getElementById('form-fields');
  const review = document.getElementById('review-panel');
  const appointment = form.dataset.kind === 'appointment';
  let reviewed = false;
  function showError(name,message) {
    const input = form.elements.namedItem(name);
    const error = document.getElementById('error-' + name);
    if (input) {
      input.setAttribute('aria-invalid','true');
      if (error) input.setAttribute('aria-describedby',error.id);
    }
    if (error) error.textContent = message;
  }
  function validate() {
    let valid = true;
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(node => { node.textContent = ''; });
    Array.from(form.elements).forEach(input => {
      if (!input.willValidate || input.checkValidity()) return;
      valid = false;
      showError(input.name,input.validity.typeMismatch ? t.emailInvalid : input.type === 'date' ? t.dateInvalid : t.required);
    });
    if (!valid) {
      status.textContent = t.fixFields;
      const first = form.querySelector('[aria-invalid]');
      if (first) first.focus();
    }
    return valid;
  }
  function department() {
    const reason = form.elements.namedItem('reason');
    const install = !reason || reason.value === 'quote';
    document.getElementById('installation-contact').hidden = !install;
    document.getElementById('service-contact').hidden = install;
  }
  const reason = form.elements.namedItem('reason');
  if (reason) reason.addEventListener('change',department);
  department();
  document.getElementById('edit-request').addEventListener('click',function() {
    reviewed = false;
    fields.hidden = false;
    review.hidden = true;
    button.textContent = appointment ? t.review : t.sendQuote;
    const input = fields.querySelector('input,select');
    if (input) input.focus();
  });
  form.addEventListener('submit',async function(event) {
    event.preventDefault();
    status.textContent = '';
    if (!validate()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if (appointment && !reviewed) {
      const list = document.getElementById('review-list');
      list.replaceChildren();
      const labels = {reason:t.reason,name:t.name,email:t.email,phone:t.phone,municipality:t.municipality,customer_type:t.customerType,requested_date:t.requestedDate,preferred_period:t.period,model:t.model,serial_number:t.serial,message:t.message};
      Object.entries(labels).forEach(([key,label]) => {
        if (!data[key]) return;
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = label;
        dd.textContent = t['v_' + data[key]] || data[key];
        list.append(dt,dd);
      });
      fields.hidden = true;
      review.hidden = false;
      reviewed = true;
      button.textContent = t.confirmRequest;
      review.focus();
      return;
    }
    button.disabled = true;
    button.textContent = t.sending;
    try {
      if (!window.TenantSDK) throw new Error(t.serverError);
      await TenantSDK.ready;
      const response = await TenantSDK.fetch(form.getAttribute('action'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result = await response.json();
      if (!response.ok) {
        if (result.fields) {
          fields.hidden = false;
          review.hidden = true;
          reviewed = false;
          Object.entries(result.fields).forEach(([key,message]) => showError(key,message));
        }
        throw new Error(result.error || t.serverError);
      }
      form.hidden = true;
      const success = document.getElementById('request-success');
      document.getElementById('success-message').textContent = result.email_status === 'sent' ? t.sentBody : t.savedBody;
      document.getElementById('success-message').dataset.lk = result.email_status === 'sent' ? 't:sentBody' : 't:savedBody';
      document.getElementById('request-reference').textContent = result.reference;
      success.hidden = false;
      success.focus();
    } catch(e) {
      status.textContent = e.message || t.serverError;
      status.focus();
    } finally {
      button.disabled = false;
      button.textContent = appointment ? (reviewed ? t.confirmRequest : t.review) : t.sendQuote;
    }
  });
})();