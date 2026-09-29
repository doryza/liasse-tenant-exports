(function () {
  'use strict';
  // Admin pages never get the platform SDK: plain fetch, same-origin cookie.
  var body = document.body;
  var text = function (key) { return body.getAttribute('data-t-' + key) || ''; };

  function request(method, url, payload) {
    return fetch(url, {
      method: method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'liasse' },
      body: payload ? JSON.stringify(payload) : undefined,
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) { var e = new Error(data.error || text('error')); e.code = data.code; throw e; }
        return data;
      });
    });
  }

  var toastTimer;
  function toast(message) {
    var el = document.getElementById('toast');
    el.textContent = message; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.hidden = true; }, 5000);
  }
  function refreshPreview() {
    var frame = document.getElementById('preview');
    if (frame && frame.contentWindow) { try { frame.contentWindow.location.reload(); } catch (e) { frame.src = frame.src; } }
  }

  function status(section, state, message) {
    var el = section.querySelector('.status');
    var button = section.querySelector('[data-save]');
    if (button) button.disabled = state === 'saving';
    if (!el) return;
    el.classList.toggle('error', state === 'error');
    el.textContent = state === 'saving' ? text('saving') : state === 'saved' ? text('saved') : (message || '');
    if (state === 'saved') setTimeout(function () { if (el.textContent === text('saved')) el.textContent = ''; }, 2500);
  }

  // --- Settings sections --------------------------------------------------
  function collect(section) {
    var values = {};
    section.querySelectorAll('[data-key]').forEach(function (input) {
      input.classList.remove('invalid');
      values[input.getAttribute('data-key')] = input.hasAttribute('data-bool') ? (input.checked ? '1' : '0') : input.value;
    });
    return values;
  }
  function saveSettings(section, values) {
    status(section, 'saving');
    return request('PUT', 'api/admin/settings', { values: values }).then(function () {
      status(section, 'saved'); refreshPreview();
    }).catch(function (e) {
      var message = e.code === 'invalid' || e.code === 'required' ? text('invalid') : e.message;
      section.querySelectorAll('[data-key]').forEach(function (input) {
        if (input.type !== 'hidden' && input.required && !input.value.trim()) input.classList.add('invalid');
        if (input.type !== 'hidden' && input.value && input.checkValidity && !input.checkValidity()) input.classList.add('invalid');
      });
      status(section, 'error', message); toast(message);
    });
  }
  document.querySelectorAll('[data-section="settings"] [data-save]').forEach(function (button) {
    button.addEventListener('click', function () {
      var section = button.closest('[data-section]');
      saveSettings(section, collect(section));
    });
  });

  // --- Photo: resized in the browser, uploaded once -------------------------
  var photoInput = document.getElementById('photo-input');
  var photoRemove = document.getElementById('photo-remove');
  var profile = document.getElementById('profil');
  function showPhoto(url) {
    var frame = document.getElementById('photo-frame');
    frame.innerHTML = '';
    if (url) { var img = document.createElement('img'); img.src = url; img.alt = ''; frame.appendChild(img); }
    else { var span = document.createElement('span'); span.className = 'photo-initials'; span.textContent = document.querySelector('.brand-mark').textContent; frame.appendChild(span); }
    profile.querySelector('[data-key="photo_url"]').value = url || '';
    photoRemove.hidden = !url;
  }
  function resize(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var side = Math.min(img.naturalWidth, img.naturalHeight);
        var size = Math.min(800, side);
        var canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        canvas.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
        URL.revokeObjectURL(img.src);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  if (photoInput) {
    photoInput.addEventListener('change', function () {
      var file = photoInput.files && photoInput.files[0];
      if (!file) return;
      status(profile, 'saving');
      resize(file).then(function (dataUrl) { return request('POST', 'api/admin/photo', { image: dataUrl }); })
        .then(function (data) { showPhoto(data.photo_url); status(profile, 'saved'); refreshPreview(); })
        .catch(function () { status(profile, 'error', text('image-error')); toast(text('image-error')); })
        .then(function () { photoInput.value = ''; });
    });
    photoRemove.addEventListener('click', function () {
      saveSettings(profile, { photo_url: '' }).then(function () { showPhoto(''); });
    });
  }

  // --- Links ------------------------------------------------------------------
  var rows = document.getElementById('link-rows');
  var template = document.getElementById('link-template');
  document.getElementById('add-link').addEventListener('click', function () {
    if (rows.children.length >= 12) { toast(text('too-many')); return; }
    rows.appendChild(template.content.cloneNode(true));
    rows.lastElementChild.querySelector('[data-f="url"]').focus();
  });
  rows.addEventListener('click', function (event) {
    var row = event.target.closest('.link-row');
    if (!row) return;
    if (event.target.closest('[data-remove]')) row.remove();
    var move = event.target.closest('[data-move]');
    if (move) {
      var dir = Number(move.getAttribute('data-move'));
      if (dir < 0 && row.previousElementSibling) rows.insertBefore(row, row.previousElementSibling);
      if (dir > 0 && row.nextElementSibling) rows.insertBefore(row.nextElementSibling, row);
    }
  });
  var linksSection = document.getElementById('liens');
  linksSection.querySelector('[data-save]').addEventListener('click', function () {
    var list = [];
    rows.querySelectorAll('.link-row').forEach(function (row) {
      var item = {};
      row.querySelectorAll('[data-f]').forEach(function (input) { input.classList.remove('invalid'); item[input.getAttribute('data-f')] = input.value.trim(); });
      if (item.url || item.label_fr || item.label_en) list.push({ item: item, row: row });
    });
    status(linksSection, 'saving');
    request('PUT', 'api/admin/links', { links: list.map(function (x) { return x.item; }) }).then(function () {
      status(linksSection, 'saved'); refreshPreview();
    }).catch(function (e) {
      list.forEach(function (x) { if (!/^https?:\/\/\S+$/.test(x.item.url)) x.row.querySelector('[data-f="url"]').classList.add('invalid'); });
      var message = e.code === 'too_many_links' ? text('too-many') : (e.code === 'invalid' ? text('invalid') : e.message);
      status(linksSection, 'error', message); toast(message);
    });
  });

  // --- Appearance -------------------------------------------------------------
  var appearance = document.getElementById('apparence');
  var customPanel = document.getElementById('custom-panel');
  var customSwatch = document.getElementById('custom-swatch');
  function paintCustom() {
    var bg = appearance.querySelector('[data-key="theme_bg"]').value;
    var ink = appearance.querySelector('[data-key="theme_ink"]').value;
    var accent = appearance.querySelector('[data-key="theme_accent"]').value;
    customSwatch.style.background = bg;
    var card = customSwatch.querySelector('.swatch-card');
    card.style.color = ink; card.style.background = bg; card.style.boxShadow = '0 0 0 2px ' + accent;
  }
  appearance.addEventListener('change', function (event) {
    var target = event.target;
    if (target.name === 'theme') {
      appearance.querySelector('[data-key="theme"]').value = target.value;
      customPanel.hidden = target.value !== 'custom';
    }
    if (target.name === 'theme_font') appearance.querySelector('[data-key="theme_font"]').value = target.value;
    paintCustom();
  });
  appearance.addEventListener('input', paintCustom);
  paintCustom();
})();
