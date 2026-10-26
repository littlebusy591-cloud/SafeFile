// Activity page
const pageAlert = document.getElementById('pageAlert');

async function loadActivity() {
  try {
    const { data } = await api('/api/activity?limit=50');
    document.getElementById('activityList').innerHTML = data.activities.length
      ? data.activities.map(activityItem).join('')
      : `<li class="empty"><span class="icon-tile">${sfIcon('activity')}</span><h3>No activity yet</h3><p>Uploads, downloads and deletions will appear here.</p></li>`;
  } catch (err) {
    showAlert(pageAlert, err.message, 'error');
  }
}

initAppShell().then(loadActivity);
