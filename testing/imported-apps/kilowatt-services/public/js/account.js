(function() {
  const t = window.KW.t;
  const list = document.getElementById('account-requests');
  if (!list) return;
  const previous = document.getElementById('account-prev');
  const next = document.getElementById('account-next');
  const status = document.getElementById('account-status');
  let page = 1;
  async function load() {
    previous.disabled = true;
    next.disabled = true;
    try {
      if (!window.TenantSDK) throw new Error(t.serverError);
      await TenantSDK.ready;
      const response = await TenantSDK.fetch('api/my-requests?page=' + page);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.serverError);
      list.replaceChildren();
      if (!data.requests.length) {
        const empty = document.createElement('p');
        empty.textContent = t.noRequests;
        empty.dataset.lk = 't:noRequests';
        list.append(empty);
      }
      data.requests.forEach(row => {
        const article = document.createElement('article');
        article.className = 'request-record';
        const title = document.createElement('h2');
        title.textContent = t['v_' + row.reason] || row.reason;
        const reference = document.createElement('p');
        reference.textContent = t.reference + ' ' + (row.reference || row.id);
        const state = document.createElement('p');
        state.textContent = t['v_' + row.status] || row.status;
        article.append(reference,title,state);
        if (row.requested_date) {
          const date = document.createElement('p');
          date.textContent = t.requestedDate + ': ' + String(row.requested_date).slice(0,10);
          article.append(date);
        }
        if (['received','reviewing','contacted'].includes(row.status)) {
          const cancel = document.createElement('button');
          cancel.className = 'button button-outline';
          cancel.textContent = t.cancelRequest;
          cancel.dataset.lk = 't:cancelRequest';
          cancel.addEventListener('click',async function() {
            if (!window.confirm(t.cancelConfirm)) return;
            cancel.disabled = true;
            try {
              const response = await TenantSDK.fetch('api/requests/' + row.id + '/cancel',{method:'PATCH'});
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || t.serverError);
              status.textContent = t.canceled;
              await load();
            } catch(e) { status.textContent = e.message; cancel.disabled = false; }
          });
          article.append(cancel);
        }
        list.append(article);
      });
      document.getElementById('account-page').textContent = t.pageLabel + ' ' + page + ' / ' + Math.max(1,Math.ceil(data.total / 10));
      previous.disabled = page <= 1;
      next.disabled = page * 10 >= data.total;
    } catch(e) {
      list.replaceChildren();
      status.textContent = e.message || t.serverError;
      const retry = document.createElement('button');
      retry.className = 'button button-white';
      retry.textContent = t.retry;
      retry.addEventListener('click',load);
      list.append(retry);
    }
  }
  previous.addEventListener('click',function() { page = Math.max(1,page - 1); load(); });
  next.addEventListener('click',function() { page += 1; load(); });
  document.getElementById('user-logout').addEventListener('click',async function() {
    try {
      if (!window.TenantSDK) return;
      await TenantSDK.ready;
      await TenantSDK.auth.logout();
      window.location.href = window.KW.paths.home[window.KW.lang];
    } catch(e) { status.textContent = t.serverError; }
  });
  load();
})();