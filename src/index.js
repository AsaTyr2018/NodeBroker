require('dotenv').config();
const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');
const ping = require('ping');
const db = require('./db');
const certs = require('./certs');

const app = express();
const proxy = httpProxy.createProxyServer({});

app.use(express.json());
app.use('/ui', express.static(path.join(__dirname, '../public')));
app.use(
  '/.well-known/acme-challenge',
  express.static(
    process.env.ACME_CHALLENGE_DIR ||
      path.join(__dirname, '../acme-challenges')
  )
);

const initPromise = db.init().catch(err => {
  console.error('Failed to initialize database', err);
  process.exit(1);
});

async function loadRoutes() {
  await initPromise;
  return db.getRoutes();
}

async function loadHaRoutes() {
  await initPromise;
  return db.getHaRoutes();
}

// API endpoints for managing routes
app.get('/api/routes', async (req, res, next) => {
  try {
    const routes = await loadRoutes();
    res.json(routes);
  } catch (err) {
    next(err);
  }
});

// API endpoints for managing certificates
app.get('/api/certs', async (req, res, next) => {
  try {
    const list = await db.getCerts();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

app.post('/api/certs', async (req, res, next) => {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'Missing domain' });
  }
  try {
    await certs.issueSelfSigned(domain);
    res.status(201).json({ status: 'issued' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/letsencrypt', async (req, res, next) => {
  const { domain, email } = req.body;
  if (!domain || !email) {
    return res.status(400).json({ error: 'Missing domain or email' });
  }
  try {
    await certs.issueLetsEncrypt(domain, email);
    res.status(201).json({ status: 'issued' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/routes', async (req, res, next) => {
  const { domain, target } = req.body;
  if (!domain || !target) {
    return res.status(400).json({ error: 'Missing domain or target' });
  }
  try {
    await db.addRoute(domain, target);
    res.status(201).json({ status: 'created' });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/routes/:domain', async (req, res, next) => {
  try {
    const deleted = await db.deleteRoute(req.params.domain);
    if (!deleted) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ status: 'deleted' });
  } catch (err) {
    next(err);
  }
});

// API endpoints for managing HA routes
app.get('/api/ha/routes', async (req, res, next) => {
  try {
    const list = await loadHaRoutes();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

app.post('/api/ha/routes', async (req, res, next) => {
  const { domain, primary, backup } = req.body;
  if (!domain || !primary || !backup) {
    return res.status(400).json({ error: 'Missing domain or targets' });
  }
  try {
    await initPromise;
    await db.addHaRoute(domain, primary, backup);
    res.status(201).json({ status: 'created' });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/ha/routes/:domain', async (req, res, next) => {
  try {
    await initPromise;
    const deleted = await db.deleteHaRoute(req.params.domain);
    if (!deleted) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ status: 'deleted' });
  } catch (err) {
    next(err);
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(async (req, res, next) => {
  const host = req.headers.host;
  try {
    const routes = await loadRoutes();
    const route = routes.find(r => r.domain === host);
    if (route) {
      proxy.web(req, res, { target: route.target }, err => {
        console.error('Proxy error:', err);
        res.status(502).send('Bad gateway');
      });
      return;
    }

    const haRoutes = await loadHaRoutes();
    const haRoute = haRoutes.find(r => r.domain === host);
    if (haRoute) {
      let target = haRoute.primary;
      try {
        const hostToPing = new URL(haRoute.primary).hostname;
        const result = await ping.promise.probe(hostToPing);
        if (!result.alive) {
          target = haRoute.backup;
        }
      } catch (e) {
        target = haRoute.backup;
      }
      proxy.web(req, res, { target }, err => {
        console.error('Proxy error:', err);
        res.status(502).send('Bad gateway');
      });
    } else {
      res.status(404).send('No route');
    }
  } catch (err) {
    next(err);
  }
});

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`NodeBroker running on port ${PORT}`);
  });
}

module.exports = app;
