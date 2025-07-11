# NodeBroker

NodeBroker is a lightweight reverse proxy with a simple web interface. It routes incoming requests based on domain name to configured backend targets.

## Features

- Express-based server
- HTTP proxy using `http-proxy`
- Health check endpoint at `/health`
- Routes persisted in a SQLite database
- Self-signed certificate management via REST API
- Issue Let's Encrypt certificates using ACME

## Development

```bash
npm install
npm start
```

Run tests with:

```bash
npm test
```

