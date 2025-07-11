async function loadRoutes() {
  const res = await fetch('/api/routes');
  const routes = await res.json();
  const tbody = document.querySelector('#routes-table tbody');
  tbody.innerHTML = '';
  routes.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.domain}</td><td>${r.target}</td>` +
      `<td><button data-domain="${r.domain}" class="delete-btn">Delete</button></td>`;
    tbody.appendChild(tr);
  });
}

document.getElementById('add-route-form').addEventListener('submit', async e => {
  e.preventDefault();
  const domain = document.getElementById('domain').value.trim();
  const target = document.getElementById('target').value.trim();
  if (!domain || !target) return;
  await fetch('/api/routes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, target })
  });
  e.target.reset();
  loadRoutes();
});

document.querySelector('#routes-table tbody').addEventListener('click', async e => {
  if (e.target.classList.contains('delete-btn')) {
    const domain = e.target.dataset.domain;
    await fetch('/api/routes/' + encodeURIComponent(domain), { method: 'DELETE' });
    loadRoutes();
  }
});

loadRoutes();
