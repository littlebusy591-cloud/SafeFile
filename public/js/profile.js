// Profile page
const nameAlert = document.getElementById('nameAlert');
const passwordAlert = document.getElementById('passwordAlert');

async function loadProfile() {
  try {
    const { data } = await api('/api/profile');
    document.getElementById('profileInitial').textContent = data.user.name.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = data.user.name;
    document.getElementById('profileEmail').textContent = data.user.email;
    document.getElementById('factJoined').textContent = formatDate(data.user.createdAt);
    document.getElementById('factDocs').textContent = data.documentCount;
    document.getElementById('factSize').textContent = formatSize(data.storageUsed);
    document.getElementById('name').value = data.user.name;
  } catch (err) {
    showAlert(nameAlert, err.message, 'error');
  }
}

document.getElementById('nameForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  hideAlert(nameAlert);
  const button = document.getElementById('nameBtn');
  const name = document.getElementById('name').value.trim();
  if (name.length < 2) return showAlert(nameAlert, 'Name must be at least 2 characters.', 'error');

  setBusy(button, true, 'Saving...');
  try {
    const { data } = await api('/api/profile', { method: 'PUT', body: { name } });
    showAlert(nameAlert, data.message, 'success');
    document.getElementById('profileName').textContent = data.user.name;
    document.getElementById('profileInitial').textContent = data.user.name.charAt(0).toUpperCase();
    document.getElementById('userName').textContent = data.user.name;
    document.getElementById('userInitial').textContent = data.user.name.charAt(0).toUpperCase();
  } catch (err) {
    showAlert(nameAlert, err.message, 'error');
  }
  setBusy(button, false);
});

document.getElementById('passwordForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  hideAlert(passwordAlert);
  const button = document.getElementById('passwordBtn');
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!currentPassword) return showAlert(passwordAlert, 'Enter your current password.', 'error');
  if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return showAlert(passwordAlert, 'New password must be at least 8 characters with a letter and a number.', 'error');
  }
  if (newPassword !== confirmPassword) return showAlert(passwordAlert, 'New passwords do not match.', 'error');

  setBusy(button, true, 'Changing...');
  try {
    const { data } = await api('/api/profile/password', { method: 'PUT', body: { currentPassword, newPassword, confirmPassword } });
    showAlert(passwordAlert, data.message, 'success');
    document.getElementById('passwordForm').reset();
  } catch (err) {
    showAlert(passwordAlert, err.message, 'error');
  }
  setBusy(button, false);
});

initAppShell().then(loadProfile);
