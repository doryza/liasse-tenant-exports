(function() {
  const t = window.KW.t;
  const toggle = document.getElementById('admin-toggle');
  if (toggle) toggle.addEventListener('click',function() {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded',String(open));
    document.getElementById('admin-sidebar').classList.toggle('open',open);
  });
  async function api(path,options) {
    if (!window.TenantSDK) throw new Error(t.serverError);
    await TenantSDK.ready;
    const response = await TenantSDK.fetch(path,options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t.serverError);
    return data;
  }
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) settingsForm.addEventListener('submit',async function(event) {
    event.preventDefault();
    const status = document.getElementById('settings-status');
    const button = settingsForm.querySelector('[type=submit]');
    button.disabled = true;
    status.textContent = t.busy;
    try {
      const values = Object.fromEntries(new FormData(settingsForm));
      values.mail_delivery_enabled = settingsForm.elements.mail_delivery_enabled.checked ? 'true' : 'false';
      for (const [key,value] of Object.entries(values)) await api('api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,value})});
      status.textContent = t.saved;
    } catch(e) { status.textContent = e.message; }
    finally { button.disabled = false; }
  });
  if (!window.ADMIN) return;
  const module = window.ADMIN.module;
  let items = window.ADMIN.items;
  let page = 1;
  let editId = null;
  let busy = false;
  const rows = document.getElementById('admin-rows');
  const status = document.getElementById('admin-status');
  const dialog = document.getElementById('edit-dialog');
  const form = document.getElementById('editor-form');
  const error = document.getElementById('editor-error');
  const search = document.getElementById('admin-search');
  const sort = document.getElementById('admin-sort');
  const previous = document.getElementById('admin-prev');
  const next = document.getElementById('admin-next');
  let statusFilter = null;
  if (module.key === 'requests') {
    const statusField = module.fields.find(field => field.name === 'status');
    if (statusField) {
      const label = element('label');
      const caption = element('span',statusField.label);
      statusFilter = element('select');
      statusFilter.id = 'admin-status-filter';
      label.htmlFor = statusFilter.id;
      const all = element('option','—');
      all.value = '';
      statusFilter.append(all);
      statusField.options.forEach(value => {
        const option = element('option',t['v_' + value] || value);
        option.value = value;
        statusFilter.append(option);
      });
      label.append(caption,statusFilter);
      search.closest('.admin-toolbar').append(label);
      statusFilter.addEventListener('change',function() { page = 1; render(); });
    }
  }
  function element(tag,text,className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function name(row) { return row.title || row.name || row.reference || String(row.id); }
  function filtered() {
    const query = search.value.trim().toLocaleLowerCase();
    const result = items.filter(row => (!statusFilter || !statusFilter.value || row.status === statusFilter.value) && Object.values(row).some(value => String(value || '').toLocaleLowerCase().includes(query)));
    result.sort((a,b) => sort.value === 'alphabetic' ? name(a).localeCompare(name(b)) : sort.value === 'oldest' ? a.id - b.id : b.id - a.id);
    return result;
  }
  function render() {
    const all = filtered();
    const pages = Math.max(1,Math.ceil(all.length / 10));
    page = Math.min(page,pages);
    rows.replaceChildren();
    if (!all.length) {
      const tr = element('tr');
      const td = element('td',items.length ? t.noMatches : t.noItems);
      td.colSpan = 4;
      tr.append(td);
      rows.append(tr);
    }
    all.slice((page - 1) * 10,page * 10).forEach(row => {
      const tr = element('tr');
      const actions = element('td');
      const edit = element('button',t.edit,'table-action');
      edit.dataset.edit = row.id;
      const remove = element('button',t.remove,'table-action');
      remove.dataset.delete = row.id;
      actions.append(edit,remove);
      if (module.key === 'requests' && row.email_status !== 'sent') {
        const retry = element('button',t.retryMail,'table-action');
        retry.dataset.notify = row.id;
        actions.append(retry);
      }
      const record = element('td',name(row));
      if (module.key === 'requests') {
        record.append(element('br'),element('small',t.reference + ': ' + (row.reference || row.id)));
        if (row.requested_date) record.append(element('br'),element('small',t.requestedDate + ': ' + String(row.requested_date).slice(0,10)));
      }
      tr.append(record,element('td',row.status ? (t['v_' + row.status] || row.status) : row.published ? t.v_yes : t.v_no),element('td',new Date(row.created_at).toLocaleDateString(window.KW.lang === 'fr' ? 'fr-CA' : 'en-CA')),actions);
      rows.append(tr);
    });
    previous.disabled = page <= 1;
    next.disabled = page >= pages;
    document.getElementById('admin-page').textContent = t.pageLabel + ' ' + page + ' / ' + pages;
  }
  async function refresh() {
    const data = await api('api/admin/' + module.key);
    items = data[module.key];
    render();
  }
  async function uploadImage(input,file,feedback) {
    if (!file || file.size > 4194304 || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error(t.imageInvalid);
    const image = await new Promise((resolve,reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(t.uploadFailed));
      reader.readAsDataURL(file);
    });
    const result = await api('api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image})});
    input.value = result.imageUrl;
    feedback.textContent = t.saved;
  }
  function openEditor(row) {
    editId = row ? row.id : null;
    error.textContent = '';
    document.getElementById('editor-title').textContent = (row ? t.edit : t.add) + ' — ' + module.label;
    const container = document.getElementById('editor-fields');
    container.replaceChildren();
    module.fields.forEach(field => {
      const group = element('div',undefined,'field');
      const label = element('label',field.label + (field.required ? ' *' : ''));
      label.htmlFor = 'edit-' + field.name;
      let input = element(field.type === 'textarea' ? 'textarea' : field.type === 'select' ? 'select' : 'input');
      input.id = 'edit-' + field.name;
      input.name = field.name;
      input.required = Boolean(field.required);
      input.placeholder = field.placeholder || '';
      const value = row && row[field.name] !== null && row[field.name] !== undefined ? row[field.name] : field.default;
      if (field.type === 'select') field.options.forEach(option => {
        const node = element('option',t['v_' + option] || option);
        node.value = option;
        input.append(node);
      });
      if (field.type === 'boolean') {
        input.type = 'checkbox';
        input.checked = value === true || value === 1 || value === '1';
      } else {
        if (field.type !== 'textarea' && field.type !== 'select') input.type = ['number','date','email'].includes(field.type) ? field.type : 'text';
        input.value = value === undefined || value === null ? '' : field.type === 'date' ? String(value).slice(0,10) : String(value);
      }
      if (field.type === 'readonly') input.readOnly = true;
      if (field.maxLength) input.maxLength = field.maxLength;
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.step !== undefined) input.step = field.step;
      const help = element('small',field.description);
      help.id = 'help-' + field.name;
      input.setAttribute('aria-describedby',help.id);
      group.append(label,input,help);
      if (field.type === 'image') {
        const fileLabel = element('label',t.upload);
        const file = element('input');
        file.type = 'file';
        file.accept = 'image/jpeg,image/png,image/webp';
        fileLabel.append(file);
        const prompt = element('textarea');
        prompt.placeholder = t.imagePrompt;
        prompt.setAttribute('aria-label',t.imagePrompt);
        const generate = element('button',t.generate,'button button-outline');
        generate.type = 'button';
        const feedback = element('p');
        feedback.setAttribute('role','status');
        file.addEventListener('change',async function() {
          file.disabled = true;
          feedback.textContent = t.busy;
          try { await uploadImage(input,file.files[0],feedback); }
          catch(e) { feedback.textContent = e.message; }
          finally { file.disabled = false; }
        });
        generate.addEventListener('click',async function() {
          generate.disabled = true;
          feedback.textContent = t.busy;
          try {
            const result = await api('api/admin/generate-image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:prompt.value,aspectRatio:'4:3'})});
            input.value = result.imageUrl;
            feedback.textContent = t.saved;
          } catch(e) { feedback.textContent = e.message; }
          finally { generate.disabled = false; }
        });
        group.append(fileLabel,prompt,generate,feedback);
      }
      container.append(group);
    });
    dialog.showModal();
  }
  rows.addEventListener('click',async function(event) {
    const button = event.target.closest('button');
    if (!button) return;
    const id = Number(button.dataset.edit || button.dataset.delete || button.dataset.notify);
    const row = items.find(item => item.id === id);
    if (!row) return;
    if (button.dataset.edit) return openEditor(row);
    if (button.dataset.delete && !window.confirm(t.deleteConfirm)) return;
    if (button.dataset.notify && !window.confirm(t.retryMailConfirm)) return;
    button.disabled = true;
    try {
      if (button.dataset.notify) {
        const result = await api('api/admin/requests/' + id + '/notify',{method:'POST'});
        status.textContent = t['v_' + result.email_status] || result.email_status;
      } else {
        await api('api/admin/' + module.key + '/' + id,{method:'DELETE'});
        status.textContent = t.deleted;
      }
      await refresh();
    } catch(e) { status.textContent = e.message; button.disabled = false; }
  });
  form.addEventListener('submit',async function(event) {
    event.preventDefault();
    if (busy) return;
    busy = true;
    const button = document.getElementById('save-item');
    button.disabled = true;
    error.textContent = t.busy;
    try {
      const body = {};
      module.fields.forEach(field => {
        if (field.type === 'readonly') return;
        const input = form.elements.namedItem(field.name);
        body[field.name] = field.type === 'boolean' ? input.checked : input.value;
      });
      await api('api/admin/' + module.key + (editId ? '/' + editId : ''),{method:editId ? 'PUT' : 'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      dialog.close();
      status.textContent = t.saved;
      await refresh();
    } catch(e) { error.textContent = e.message; }
    finally { busy = false; button.disabled = false; }
  });
  document.getElementById('add-item').addEventListener('click',function() { openEditor(null); });
  document.getElementById('close-editor').addEventListener('click',function() { if (!busy) dialog.close(); });
  dialog.addEventListener('cancel',function(event) { if (busy) event.preventDefault(); });
  search.addEventListener('input',function() { page = 1; render(); });
  sort.addEventListener('change',function() { page = 1; render(); });
  previous.addEventListener('click',function() { page -= 1; render(); });
  next.addEventListener('click',function() { page += 1; render(); });
  render();
})();