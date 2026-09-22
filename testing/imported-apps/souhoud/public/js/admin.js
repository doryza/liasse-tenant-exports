(function () {
  if (!window.App) return;
  var data = App.data;
  var t = data.t;

  // ------------------------------------------------------------ shell menu
  var sidebar = document.getElementById('admin-sidebar');
  var backdrop = document.querySelector('[data-admin-backdrop]');
  document.querySelectorAll('[data-admin-menu]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (!sidebar) return;
      var open = sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('show', open);
    });
  });
  if (backdrop) backdrop.addEventListener('click', function () {
    if (sidebar) sidebar.classList.remove('open');
    backdrop.classList.remove('show');
  });

  // ------------------------------------------------------------- settings
  var status = document.querySelector('[data-settings-status]');
  // A save that fails must say so where the operator is looking, not only in a
  // status line parked at the bottom of a long page.
  function saved(message, bad) {
    if (bad) App.toast(message);
    if (!status) return;
    status.textContent = message;
    status.style.color = bad ? 'var(--coral)' : 'var(--sky-deep)';
    clearTimeout(saved.timer);
    saved.timer = setTimeout(function () { status.textContent = ''; }, 4000);
  }
  async function putSetting(key, value) {
    try {
      await App.request('api/admin/settings', { method: 'PUT', body: JSON.stringify({ key: key, value: value }) });
      saved(t.save + ' ✓');
      return true;
    } catch (e) { saved(e.message, true); return false; }
  }

  document.querySelectorAll('[data-setting-toggle]').forEach(function (input) {
    input.addEventListener('change', async function () {
      var ok = await putSetting(input.getAttribute('data-setting-toggle'), input.checked ? '1' : '0');
      if (!ok) input.checked = !input.checked;
    });
  });

  document.querySelectorAll('[data-setting]').forEach(function (input) {
    var initial = input.value;
    input.addEventListener('blur', function () {
      if (input.value === initial) return;
      putSetting(input.getAttribute('data-setting'), input.value).then(function (ok) { if (ok) initial = input.value; });
    });
  });

  // Bilingual settings are stored as one JSON value, so both boxes are sent
  // together whenever either of them changes.
  var jsonGroups = {};
  document.querySelectorAll('[data-setting-json]').forEach(function (area) {
    var key = area.getAttribute('data-setting-json');
    jsonGroups[key] = jsonGroups[key] || {};
    jsonGroups[key][area.getAttribute('data-lang')] = area;
  });
  Object.keys(jsonGroups).forEach(function (key) {
    var group = jsonGroups[key];
    Object.keys(group).forEach(function (lang) {
      var area = group[lang];
      var initial = area.value;
      area.addEventListener('blur', function () {
        if (area.value === initial) return;
        var payload = JSON.stringify({ fr: group.fr ? group.fr.value : '', en: group.en ? group.en.value : '' });
        putSetting(key, payload).then(function (ok) { if (ok) initial = area.value; });
      });
    });
  });

  // -------------------------------------------------------- module tables
  var table = document.querySelector('[data-table]');
  if (!table) return;
  var moduleKey = table.getAttribute('data-module');
  var singular = table.getAttribute('data-singular');
  var fields = JSON.parse(decodeURIComponent(table.getAttribute('data-fields')));
  var itemsNode = document.getElementById('admin-items');
  var items = itemsNode ? JSON.parse(itemsNode.textContent) : [];

  var head = table.querySelector('[data-head]');
  var rows = table.querySelector('[data-rows]');
  var empty = document.querySelector('[data-empty]');
  var countEl = document.querySelector('[data-result-count]');
  var filterInput = document.querySelector('[data-filter]');
  var modal = document.querySelector('[data-modal]');
  var form = document.querySelector('[data-form]');
  var fieldsRoot = modal ? modal.querySelector('[data-fields]') : null;
  var modalTitle = modal ? modal.querySelector('[data-modal-title]') : null;
  var formError = modal ? modal.querySelector('[data-form-error]') : null;
  var editing = null;

  // Show the columns that identify a row, never every column.
  var columnFields = fields.filter(function (f) {
    return ['text', 'select', 'number', 'boolean', 'email', 'date', 'readonly'].indexOf(f.type) > -1;
  }).slice(0, 5);

  function display(item, field) {
    var value = item[field.name];
    if (field.type === 'boolean') return value ? 'Oui' : 'Non';
    if (field.name.slice(-6) === '_cents') return value == null ? '—' : App.money(value);
    if (field.type === 'date') return value ? App.formatDate(value) : '—';
    if (value == null || value === '') return '—';
    return String(value).slice(0, 80);
  }

  function renderHead() {
    head.textContent = '';
    var tr = document.createElement('tr');
    columnFields.forEach(function (field) {
      var th = document.createElement('th');
      th.textContent = field.label;
      if (field.type === 'number') th.className = 'num';
      tr.appendChild(th);
    });
    var actions = document.createElement('th');
    actions.textContent = '';
    tr.appendChild(actions);
    head.appendChild(tr);
  }

  function renderRows(list) {
    rows.textContent = '';
    list.forEach(function (item) {
      var tr = document.createElement('tr');
      columnFields.forEach(function (field) {
        var td = document.createElement('td');
        if (field.type === 'number') td.className = 'num';
        if (field.type === 'boolean') {
          var pill = document.createElement('span');
          pill.className = 'pill pill--' + (item[field.name] ? 'ok' : 'off');
          pill.textContent = display(item, field);
          td.appendChild(pill);
        } else td.textContent = display(item, field);
        tr.appendChild(td);
      });
      var actions = document.createElement('td');
      actions.className = 'num admin-row-actions';
      var edit = document.createElement('button');
      edit.type = 'button'; edit.className = 'text-button'; edit.textContent = t.save === 'Save' ? 'Edit' : 'Modifier';
      edit.addEventListener('click', function () { open(item); });
      actions.appendChild(edit);
      var remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'text-button danger'; remove.textContent = t.remove;
      remove.addEventListener('click', function () { destroy(item); });
      actions.appendChild(remove);
      tr.appendChild(actions);
      rows.appendChild(tr);
    });
    if (empty) empty.hidden = list.length > 0;
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? ' élément' : ' éléments');
  }

  function currentList() {
    var needle = (filterInput && filterInput.value || '').toLowerCase().trim();
    if (!needle) return items;
    return items.filter(function (item) {
      return Object.keys(item).some(function (key) { return String(item[key] || '').toLowerCase().indexOf(needle) > -1; });
    });
  }
  function repaint() { renderRows(currentList()); }
  if (filterInput) filterInput.addEventListener('input', repaint);

  function control(field, value) {
    var wrap = document.createElement('label');
    wrap.className = field.type === 'boolean' ? 'check' : 'field';
    var label = document.createElement('span');
    label.textContent = field.label;
    var input;

    if (field.type === 'textarea' || field.type === 'list') {
      input = document.createElement('textarea');
      if (field.type === 'list') {
        var list = [];
        try { list = JSON.parse(value || '[]'); } catch (e) { list = String(value || '').split('\n'); }
        input.value = Array.isArray(list) ? list.join('\n') : '';
      } else input.value = value == null ? '' : value;
    } else if (field.type === 'select') {
      input = document.createElement('select');
      var blank = document.createElement('option');
      blank.value = ''; blank.textContent = '—';
      input.appendChild(blank);
      (field.options || []).forEach(function (option) {
        var node = document.createElement('option');
        node.value = option;
        node.textContent = t['status_' + option] || t[option] || option;
        input.appendChild(node);
      });
      input.value = value == null ? '' : value;
    } else if (field.type === 'boolean') {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !!value;
    } else {
      input = document.createElement('input');
      input.type = field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text';
      if (field.type === 'number') { input.min = field.min; input.max = field.max; input.step = 1; }
      if (field.maxLength) input.maxLength = field.maxLength;
      input.value = field.type === 'date' && value ? String(value).slice(0, 10) : (value == null ? '' : value);
    }

    input.name = field.name;
    input.disabled = field.type === 'readonly';
    if (field.required) input.required = true;

    if (field.type === 'boolean') { wrap.appendChild(input); wrap.appendChild(label); } else { wrap.appendChild(label); wrap.appendChild(input); }
    if (field.description) {
      var hint = document.createElement('span');
      hint.className = 'hint';
      hint.textContent = field.description;
      wrap.appendChild(hint);
    }
    return wrap;
  }

  function open(item) {
    editing = item || null;
    if (!modal || !fieldsRoot) return;
    fieldsRoot.textContent = '';
    if (formError) formError.hidden = true;
    if (modalTitle) modalTitle.textContent = item ? (item.name || item.title || item.reference || '#' + item.id) : (t.save === 'Save' ? 'New' : 'Ajouter');
    fields.forEach(function (field) { fieldsRoot.appendChild(control(field, item ? item[field.name] : field.default)); });
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
  }
  function close() {
    if (!modal) return;
    if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
  }
  document.querySelectorAll('[data-close]').forEach(function (button) { button.addEventListener('click', close); });
  var newButton = document.querySelector('[data-new]');
  if (newButton) newButton.addEventListener('click', function () { open(null); });

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var body = {};
      fields.forEach(function (field) {
        if (field.type === 'readonly') return;
        var input = form.elements[field.name];
        if (!input) return;
        if (field.type === 'boolean') body[field.name] = input.checked ? '1' : '0';
        else if (field.type === 'list') body[field.name] = input.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
        else body[field.name] = input.value;
      });
      var submit = form.querySelector('button[type=submit]');
      if (submit) submit.disabled = true;
      try {
        var path = 'api/admin/' + moduleKey + (editing ? '/' + editing.id : '');
        var result = await App.request(path, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
        var row = result[singular];
        if (editing) items = items.map(function (item) { return item.id === row.id ? row : item; });
        else items = [row].concat(items);
        repaint();
        close();
        App.toast(t.save + ' ✓');
      } catch (e) {
        if (formError) { formError.textContent = e.message; formError.hidden = false; }
      } finally { if (submit) submit.disabled = false; }
    });
  }

  async function destroy(item) {
    var label = item.name || item.title || item.reference || ('#' + item.id);
    if (!window.confirm((t.save === 'Save' ? 'Delete ' : 'Supprimer ') + label + ' ?')) return;
    try {
      await App.request('api/admin/' + moduleKey + '/' + item.id, { method: 'DELETE' });
      items = items.filter(function (other) { return other.id !== item.id; });
      repaint();
      App.toast(t.remove + ' ✓');
    } catch (e) { App.toast(e.message); }
  }

  renderHead();
  repaint();
})();
