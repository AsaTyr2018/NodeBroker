require('dotenv').config();
const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');
const db = require('./db');
const certs = require('./certs');

const app = express();
const proxy = httpProxy.createProxyServer({});

app.use(express.json());
app.use('/ui', express.static(path.join(__dirname, '../public')));

db.init().catch(err => {
  console.error('Failed to initialize database', err);
  process.exit(1);
});

async function loadRoutes() {
  return db.getRoutes();
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
