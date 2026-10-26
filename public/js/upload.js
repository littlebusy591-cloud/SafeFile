// Upload page
const form = document.getElementById('uploadForm');
const alertBox = document.getElementById('formAlert');
const submitBtn = document.getElementById('submitBtn');
const fileInput = document.getElementById('file');
const fileName = document.getElementById('fileName');
const titleInput = document.getElementById('title');

let maxFileSizeMB = 10;
let allowedExtensions = [];

async function loadSettings() {
  try {
    const { data } = await api('/api/documents/categories');
    maxFileSizeMB = data.maxFileSizeMB;
    allowedExtensions = data.allowedExtensions;

    document.getElementById('category').insertAdjacentHTML(
      'beforeend',
      data.categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')
    );
    document.getElementById('fileHint').textContent = `PDF, DOC, DOCX, TXT, PNG or JPG, up to ${maxFileSizeMB} MB`;
  } catch (err) {
    showAlert(alertBox, err.message, 'error');
  }
}

// The title follows the file name until the user types their own title.
let titleTypedByUser = false;
titleInput.addEventListener('input', () => { titleTypedByUser = titleInput.value.trim() !== ''; });

// Show the chosen file name, and suggest it as the title.
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) {
    fileName.textContent = 'Choose a file';
    return;
  }
  fileName.textContent = `${file.name} (${formatSize(file.size)})`;
  if (!titleTypedByUser) titleInput.value = file.name.replace(/\.[^.]+$/, '').slice(0, 100);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideAlert(alertBox);

  const file = fileInput.files[0];
  const title = titleInput.value.trim();
  const description = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value;

  // Quick checks (the server checks everything again)
  if (!file) return showAlert(alertBox, 'Please choose a file to upload.', 'error');
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return showAlert(alertBox, 'This file type is not allowed. Use PDF, DOC, DOCX, TXT, PNG or JPG.', 'error');
  }
  if (file.size > maxFileSizeMB * 1024 * 1024) {
    return showAlert(alertBox, `File is too large. The maximum size is ${maxFileSizeMB} MB.`, 'error');
  }
  if (!title) return showAlert(alertBox, 'Please enter a title.', 'error');
  if (!category) return showAlert(alertBox, 'Please choose a category.', 'error');

  // Files are sent as FormData (not JSON)
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('category', category);
  formData.append('file', file);

  setBusy(submitBtn, true, 'Uploading...');
  try {
    await api('/api/documents', { method: 'POST', body: formData });
    form.reset();
    titleTypedByUser = false;
    fileName.textContent = 'Choose a file';
    showAlert(alertBox, 'Document uploaded. You can find it in My documents.', 'success');
  } catch (err) {
    showAlert(alertBox, err.message, 'error');
  }
  setBusy(submitBtn, false);
});

initAppShell().then(loadSettings);
