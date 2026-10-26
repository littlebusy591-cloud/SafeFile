// Dashboard: totals, categories, recent uploads, recent activity.
const pageAlert = document.getElementById('pageAlert');

function emptyBlock(icon, title, text) {
  return `<li class="empty"><span class="icon-tile">${sfIcon(icon)}</span><h3>${title}</h3><p>${text}</p></li>`;
}

async function loadDashboard() {
  try {
    // Ask for both things at the same time
    const [summary, activity] = await Promise.all([
      api('/api/documents/summary'),
      api('/api/activity?limit=5'),
    ]);
    const s = summary.data;

    document.getElementById('statTotal').textContent = s.totalDocuments;
    document.getElementById('statSize').textContent = formatSize(s.totalSize);
    document.getElementById('statLast').textContent = s.recent.length ? timeAgo(s.recent[0].createdAt) : 'None yet';

    document.getElementById('categoryGrid').innerHTML = s.categories
      .map((c) => `<a class="category-tile" href="/documents?category=${encodeURIComponent(c.name)}">
          <span class="icon">${sfIcon('folder')}</span>
          <strong>${escapeHtml(c.name)}</strong>
          <span class="count">${c.count} ${c.count === 1 ? 'document' : 'documents'}</span>
        </a>`)
      .join('');

    document.getElementById('recentList').innerHTML = s.recent.length
      ? s.recent.map((d) => documentRow(d, false)).join('')
      : emptyBlock('file', 'No documents yet', 'Upload your first document to see it here.');

    document.getElementById('activityList').innerHTML = activity.data.activities.length
      ? activity.data.activities.map(activityItem).join('')
      : emptyBlock('activity', 'No activity yet', 'Uploads, downloads and deletions will appear here.');
  } catch (err) {
    showAlert(pageAlert, err.message, 'error');
  }
}

initAppShell().then(loadDashboard);
