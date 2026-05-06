const API_BASE = '/home/api';

const demoStatuses = ['new', 'contacted', 'demo-scheduled', 'closed'];
const dmcStatuses = ['new', 'contacted', 'onboarding', 'onboarded'];
const statusLabels = {
  'new': 'New', 'contacted': 'Contacted', 'demo-scheduled': 'Demo Scheduled',
  'closed': 'Closed', 'onboarding': 'Onboarding', 'onboarded': 'Onboarded'
};

const PER_PAGE = 10;
let currentPanel = 'demo';
let demoPage = 1;
let dmcPage = 1;
let sortAsc = false;
let demoData = [];
let dmcData = [];

async function loadData() {
  try {
    const demoRes = await fetch(API_BASE + '/demo');
    demoData = await demoRes.json();
  } catch (e) { demoData = []; }
  try {
    const dmcRes = await fetch(API_BASE + '/dmc');
    dmcData = await dmcRes.json();
  } catch (e) { dmcData = []; }
  renderTable('demo');
  renderTable('dmc');
  updateStats();
}

function getFiltered(tabId) {
  const filter = document.getElementById('filter-' + tabId);
  const search = document.getElementById('search-' + tabId);
  const statusVal = filter.value;
  const searchVal = search.value.toLowerCase();
  const data = tabId === 'demo' ? demoData : dmcData;
  return data.filter(item => {
    const matchStatus = statusVal === 'all' || item.status === statusVal;
    const matchSearch = !searchVal || Object.values(item).some(v => String(v).toLowerCase().includes(searchVal));
    return matchStatus && matchSearch;
  });
}

function renderTable(tabId) {
  const filtered = getFiltered(tabId);
  const page = tabId === 'demo' ? demoPage : dmcPage;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const pageData = filtered.slice(start, start + PER_PAGE);

  const tbody = document.getElementById('tbody-' + tabId);
  tbody.innerHTML = '';
  const statuses = tabId === 'demo' ? demoStatuses : dmcStatuses;
  const fields = tabId === 'demo'
    ? ['date','name','email','company','role','message']
    : ['date','name','email','company','destinations','specialization'];

  pageData.forEach(item => {
    const tr = document.createElement('tr');
    tr.dataset.status = item.status;
    fields.forEach(f => {
      const td = document.createElement('td');
      td.textContent = item[f] || '';
      tr.appendChild(td);
    });
    const statusTd = document.createElement('td');
    const pill = document.createElement('span');
    pill.className = 'status-pill status-' + item.status;
    pill.textContent = statusLabels[item.status];
    pill.addEventListener('click', () => openPopover(pill, tr, statuses, tabId));
    statusTd.appendChild(pill);
    tr.appendChild(statusTd);
    tbody.appendChild(tr);
  });

  document.getElementById('count-' + tabId).textContent = total + ' entries';
  renderPagination(tabId, total, totalPages);
  updateStats();
}

function renderPagination(tabId, total, totalPages) {
  const page = tabId === 'demo' ? demoPage : dmcPage;
  const container = document.getElementById('pagination-' + tabId);
  container.innerHTML = '';

  if (total <= PER_PAGE) { container.style.display = 'none'; return; }
  container.style.display = 'flex';

  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = '←';
  prev.disabled = page === 1;
  prev.addEventListener('click', () => { if (tabId === 'demo') demoPage--; else dmcPage--; renderTable(tabId); });
  container.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === page ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => { if (tabId === 'demo') demoPage = i; else dmcPage = i; renderTable(tabId); });
    container.appendChild(btn);
  }

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = '→';
  next.disabled = page === totalPages;
  next.addEventListener('click', () => { if (tabId === 'demo') demoPage++; else dmcPage++; renderTable(tabId); });
  container.appendChild(next);
}

function updateStats() {
  const newDemo = demoData.filter(i => i.status === 'new').length;
  const newDmc = dmcData.filter(i => i.status === 'new').length;
  document.querySelector('.stats-bar .stat-card:nth-child(1) strong').textContent = demoData.length;
  document.querySelector('.stats-bar .stat-card:nth-child(2) strong').textContent = newDemo;
  document.querySelector('.stats-bar .stat-card:nth-child(3) strong').textContent = dmcData.length;
  document.querySelector('.stats-bar .stat-card:nth-child(4) strong').textContent = newDmc;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function closeAllPopovers() {
  document.querySelectorAll('.status-popover').forEach(p => p.remove());
}

async function updateStatus(tabId, filteredIdx, newStatus) {
  const data = tabId === 'demo' ? demoData : dmcData;
  const filtered = getFiltered(tabId);
  const item = filtered[filteredIdx];
  if (!item) return;

  const realIdx = data.indexOf(item);
  if (realIdx === -1) return;

  try {
    const res = await fetch(API_BASE + '/' + tabId + '/' + realIdx, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      data[realIdx].status = newStatus;
      renderTable(tabId);
      showToast('Status changed to ' + statusLabels[newStatus]);
    }
  } catch (e) {
    showToast('Failed to update status');
  }
}

function openPopover(pill, row, statuses, tabId) {
  closeAllPopovers();
  const popover = document.createElement('div');
  popover.className = 'status-popover';
  const rect = pill.getBoundingClientRect();
  popover.style.top = (rect.bottom + 6) + 'px';
  popover.style.left = rect.left + 'px';

  const filtered = getFiltered(tabId);
  const page = tabId === 'demo' ? demoPage : dmcPage;
  const start = (page - 1) * PER_PAGE;
  const tbody = document.getElementById('tbody-' + tabId);
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const filteredIdx = start + rows.indexOf(row);

  statuses.forEach(s => {
    const option = document.createElement('button');
    option.className = 'popover-option status-' + s;
    option.textContent = statusLabels[s];
    if (s === row.dataset.status) option.classList.add('current');
    option.addEventListener('click', () => {
      closeAllPopovers();
      updateStatus(tabId, filteredIdx, s);
    });
    popover.appendChild(option);
  });

  document.body.appendChild(popover);
}

function sortTable(tabId) {
  const data = tabId === 'demo' ? demoData : dmcData;
  data.sort((a, b) => sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  sortAsc = !sortAsc;
  if (tabId === 'demo') demoPage = 1; else dmcPage = 1;
  renderTable(tabId);
  document.getElementById('sort-btn').textContent = sortAsc ? 'Sort ↑ (oldest)' : 'Sort ↓ (newest)';
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.data-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    currentPanel = btn.dataset.tab;
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
  });
});

// Sort button
document.getElementById('sort-btn').addEventListener('click', () => sortTable(currentPanel));

// Filters
['demo', 'dmc'].forEach(tabId => {
  document.getElementById('filter-' + tabId).addEventListener('change', () => {
    if (tabId === 'demo') demoPage = 1; else dmcPage = 1;
    renderTable(tabId);
  });
  document.getElementById('search-' + tabId).addEventListener('input', () => {
    if (tabId === 'demo') demoPage = 1; else dmcPage = 1;
    renderTable(tabId);
  });
});

// Close popover on outside click
document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('status-pill') && !e.target.closest('.status-popover')) {
    closeAllPopovers();
  }
});

// Load data from API on page load
loadData();