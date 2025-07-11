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

async function loadCerts() {
  const res = await fetch('/api/certs');
  const certs = await res.json();
  const tbody = document.querySelector('#certs-table tbody');
  tbody.innerHTML = '';
  certs.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.domain}</td><td>${c.issued_at}</td>`;
    tbody.appendChild(tr);
  });
}

document.getElementById('add-cert-form').addEventListener('submit', async e => {
  e.preventDefault();
  const domain = document.getElementById('cert-domain').value.trim();
  if (!domain) return;
  await fetch('/api/certs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain })
  });
  e.target.reset();
  loadCerts();
});

loadCerts();

async function loadHaRoutes() {
  const res = await fetch('/api/ha/routes');
  const routes = await res.json();
  const tbody = document.querySelector('#ha-routes-table tbody');
  tbody.innerHTML = '';
  routes.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.domain}</td><td>${r.primary}</td><td>${r.backup}</td>` +
      `<td><button data-domain="${r.domain}" class="delete-ha-btn">Delete</button></td>`;
    tbody.appendChild(tr);
  });
}

document.getElementById('add-ha-form').addEventListener('submit', async e => {
  e.preventDefault();
  const domain = document.getElementById('ha-domain').value.trim();
  const primary = document.getElementById('ha-primary').value.trim();
  const backup = document.getElementById('ha-backup').value.trim();
  if (!domain || !primary || !backup) return;
  await fetch('/api/ha/routes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, primary, backup })
  });
  e.target.reset();
  loadHaRoutes();
});

document.querySelector('#ha-routes-table tbody').addEventListener('click', async e => {
  if (e.target.classList.contains('delete-ha-btn')) {
    const domain = e.target.dataset.domain;
    await fetch('/api/ha/routes/' + encodeURIComponent(domain), { method: 'DELETE' });
    loadHaRoutes();
  }
});

loadHaRoutes();

document.getElementById('add-le-form').addEventListener('submit', async e => {
  e.preventDefault();
  const domain = document.getElementById('le-domain').value.trim();
  const email = document.getElementById('le-email').value.trim();
  if (!domain || !email) return;
  await fetch('/api/letsencrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, email })
  });
  e.target.reset();
  loadCerts();
});
