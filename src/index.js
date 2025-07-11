require('dotenv').config();
const express = require('express');
const httpProxy = require('http-proxy');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
const proxy = httpProxy.createProxyServer({});

// Simple in-memory routing table
const routes = [
  // Example route: { domain: 'example.com', target: 'http://localhost:3000' }
];

function loadRoutes() {
  // Placeholder for loading from SQLite in future
  return routes;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res, next) => {
  const host = req.headers.host;
  const route = loadRoutes().find(r => r.domain === host);
  if (route) {
    proxy.web(req, res, { target: route.target }, err => {
      console.error('Proxy error:', err);
      res.status(502).send('Bad gateway');
    });
  } else {
    res.status(404).send('No route');
  }
});

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`NodeBroker running on port ${PORT}`);
  });
}

module.exports = app;
