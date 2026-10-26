// My documents page: list, search, filter, download, delete
const docList = document.getElementById('docList');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const resultCount = document.getElementById('resultCount');
const pageAlert = document.getElementById('pageAlert');
const deleteDialog = document.getElementById('deleteDialog');

let documents = [];
let documentToDelete = null;
let latestRequest = 0; // used to ignore slow, out-of-date responses

async function loadCategories() {
  try {
    const { data } = await api('/api/documents/categories');
    categoryFilter.insertAdjacentHTML(
      'beforeend',
      data.categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')
    );
    // The dashboard category tiles link here with ?category=Finance
    const fromUrl = new URLSearchParams(window.location.search).get('category');
    if (fromUrl && data.categories.includes(fromUrl)) categoryFilter.value = fromUrl;
  } catch (err) {
    showAlert(pageAlert, err.message, 'error');
  }
}

async function loadDocuments() {
  const requestId = ++latestRequest;
  const search = searchInput.value.trim();
  const category = categoryFilter.value;

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);

  try {
    const { data } = await api(`/api/documents?${params.toString()}`);
    if (requestId !== latestRequest) return; // a newer request has been made
    hideAlert(pageAlert);
    documents = data.documents;
    render(Boolean(search || category));
  } catch (err) {
    if (requestId === latestRequest) showAlert(pageAlert, err.message, 'error');
  }
}

function render(isFiltered) {
  if (documents.length === 0) {
    docList.innerHTML = isFiltered
      ? `<li class="empty"><span class="icon-tile">${sfIcon('search')}</span><h3>No matching documents</h3><p>Try a different title or choose another category.</p></li>`
      : `<li class="empty"><span class="icon-tile">${sfIcon('file')}</span><h3>No documents yet</h3><p>Upload your first document to start your vault.</p><a class="btn btn-primary" href="/upload">Upload document</a></li>`;
    resultCount.textContent = '';
    return;
  }
  docList.innerHTML = documents.map((d) => documentRow(d, true)).join('');
  resultCount.textContent = `${documents.length} ${documents.length === 1 ? 'document' : 'documents'}`;
}

// Search as the user types (waits 300 ms after the last key press)
let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadDocuments, 300);
});
categoryFilter.addEventListener('change', loadDocuments);

// One click listener for all download / delete buttons
docList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const doc = documents.find((d) => d.id === button.dataset.id);
  if (!doc) return;

  if (button.dataset.action === 'download') {
    downloadDocument(doc.id, doc.originalName);
  } else if (button.dataset.action === 'delete') {
    documentToDelete = doc;
    document.getElementById('deleteText').textContent = `"${doc.title}" will be permanently deleted. This cannot be undone.`;
    deleteDialog.showModal();
  }
});

document.getElementById('cancelDelete').addEventListener('click', () => deleteDialog.close());

document.getElementById('confirmDelete').addEventListener('click', async () => {
  if (!documentToDelete) return;
  const button = document.getElementById('confirmDelete');
  setBusy(button, true, 'Deleting...');
  try {
    await api(`/api/documents/${documentToDelete.id}`, { method: 'DELETE' });
    deleteDialog.close();
    showToast('Document deleted.');
    await loadDocuments();
  } catch (err) {
    deleteDialog.close();
    showToast(err.message, 'error');
  }
  setBusy(button, false);
  documentToDelete = null;
});

initAppShell().then(loadCategories).then(loadDocuments);
