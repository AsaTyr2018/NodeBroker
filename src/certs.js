const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');
const db = require('./db');

const certDir = process.env.CERT_DIR || path.join(__dirname, '../certs');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

async function issueSelfSigned(domain) {
  const attrs = [{ name: 'commonName', value: domain }];
  const pems = selfsigned.generate(attrs, { days: 365 });
  const keyPath = path.join(certDir, `${domain}.key`);
  const certPath = path.join(certDir, `${domain}.crt`);
  await fs.promises.writeFile(keyPath, pems.private);
  await fs.promises.writeFile(certPath, pems.cert);
  await db.addCert(domain, keyPath, certPath);
}

async function getCertificate(domain) {
  const record = await db.getCert(domain);
  if (!record) return null;
  const key = await fs.promises.readFile(record.key, 'utf8');
  const cert = await fs.promises.readFile(record.cert, 'utf8');
  return { key, cert };
}

module.exports = { issueSelfSigned, getCertificate };
