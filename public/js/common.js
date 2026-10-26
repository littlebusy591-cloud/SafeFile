// Helpers shared by every page. Load order in the HTML: icons.js, common.js, then the page's own script.

// ---------- Talking to the server ----------
// All requests go through this one function.
async function api(url, options = {}) {
  const settings = {
    credentials: 'same-origin',
    ...options,
    headers: { 'X-Requested-With': 'SafeFile', ...(options.headers || {}) },
  };

  // Plain objects are sent as JSON. FormData (file uploads) is sent as it is.
  if (settings.body && !(settings.body instanceof FormData)) {
    settings.headers['Content-Type'] = 'application/json';
    settings.body = JSON.stringify(settings.body);
  }

  let response;
  try {
    response = await fetch(url, settings);
  } catch (err) {
    throw new Error('Cannot reach the server. Check that it is running.');
  }

  // Some responses (like a file download) are not JSON, so only read JSON when it is.
  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await response.json() : null;

  // Session expired: go to login (except on the login form itself, which handles its own 401).
  if (response.status === 401 && !options.noRedirect) {
    window.location.href = '/login';
    throw new Error('Please log in to continue.');
  }
  if (!response.ok) {
    throw new Error((data && data.message) || 'Something went wrong. Please try again.');
  }
  return { data, response };
}

// ---------- Small helpers ----------
function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(iso) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
  }
  if (seconds < 604800) {
    const d = Math.floor(seconds / 86400);
    return `${d} ${d === 1 ? 'day' : 'days'} ago`;
  }
  return formatDate(iso);
}

// Shows a message inside an .alert box.  type = 'error' or 'success'
function showAlert(box, message, type) {
  box.textContent = message;
  box.className = `alert alert-${type}`;
  box.hidden = false;
}

function hideAlert(box) {
  box.hidden = true;
}

// Disables a button while a request is running.
function setBusy(button, busy, busyText) {
  if (busy) {
    button.dataset.label = button.innerHTML;
    button.textContent = busyText || 'Please wait...';
    button.disabled = true;
  } else {
    button.innerHTML = button.dataset.label;
    button.disabled = false;
  }
}

let toastTimer;
function showToast(message, type) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

// ---------- Pieces used on several pages ----------
function fileBadge(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  let kind = '';
  if (ext === 'pdf') kind = 'pdf';
  else if (ext === 'doc' || ext === 'docx') kind = 'doc';
  else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') kind = 'img';
  return `<span class="file-badge ${kind}">${escapeHtml(ext.toUpperCase())}</span>`;
}

// One row of the document list. withActions = show download/delete buttons.
function documentRow(doc, withActions) {
  const actions = withActions
    ? `<div class="doc-actions">
         <button class="icon-btn" type="button" data-action="download" data-id="${doc.id}" aria-label="Download ${escapeHtml(doc.title)}">${sfIcon('download')}</button>
         <button class="icon-btn icon-btn-danger" type="button" data-action="delete" data-id="${doc.id}" aria-label="Delete ${escapeHtml(doc.title)}">${sfIcon('trash')}</button>
       </div>`
    : '';
  return `<li class="doc-row">
      ${fileBadge(doc.originalName)}
      <div class="doc-main">
        <div class="doc-title">${escapeHtml(doc.title)}</div>
        ${doc.description ? `<div class="doc-desc">${escapeHtml(doc.description)}</div>` : ''}
        <div class="doc-meta"><span>${escapeHtml(doc.originalName)}</span><span>${formatSize(doc.size)}</span><span>${formatDate(doc.createdAt)}</span></div>
      </div>
      <span class="chip">${escapeHtml(doc.category)}</span>
      ${actions}
    </li>`;
}

// One line of the activity list.
function activityItem(item) {
  const info = {
    upload: { icon: 'upload', verb: 'Uploaded' },
    download: { icon: 'download', verb: 'Downloaded' },
    delete: { icon: 'trash', verb: 'Deleted' },
  }[item.action];
  return `<li class="activity-item">
      <span class="activity-icon ${item.action}">${sfIcon(info.icon)}</span>
      <span class="activity-text">${info.verb} <strong>${escapeHtml(item.documentTitle)}</strong></span>
      <span class="activity-time">${timeAgo(item.createdAt)}</span>
    </li>`;
}

// Downloads a file through fetch so errors can be shown nicely.
async function downloadDocument(id, fileName) {
  try {
    const { response } = await api(`/api/documents/${id}/download`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ---------- Layout for logged-in pages ----------
// Fills in the user's name, highlights the current menu item, wires up logout and the mobile menu.
async function initAppShell() {
  sfRenderIcons();

  document.querySelectorAll('.nav-link').forEach((link) => {
    if (link.getAttribute('href') === window.location.pathname) link.classList.add('active');
  });

  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const menuBtn = document.getElementById('menuBtn');
  function setMenu(open) {
    sidebar.classList.toggle('open', open);
    scrim.classList.toggle('show', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  scrim.addEventListener('click', () => setMenu(false));

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // even if this fails, leave the page
    }
    window.location.href = '/login';
  });

  try {
    const { data } = await api('/api/auth/me');
    document.getElementById('userName').textContent = data.user.name;
    document.getElementById('userEmail').textContent = data.user.email;
    document.getElementById('userInitial').textContent = data.user.name.charAt(0).toUpperCase();
    return data.user;
  } catch (err) {
    return null;
  }
}
