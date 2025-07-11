const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');
const { Client } = require('acme-client');
const db = require('./db');

const certDir = process.env.CERT_DIR || path.join(__dirname, '../certs');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

const challengeDir =
  process.env.ACME_CHALLENGE_DIR ||
  path.join(__dirname, '../acme-challenges');
if (!fs.existsSync(challengeDir)) {
  fs.mkdirSync(challengeDir, { recursive: true });
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

async function issueLetsEncrypt(domain, email) {
  const client = new Client({
    directoryUrl: Client.directory.letsencrypt.production,
    accountKey: await Client.forge.createPrivateKey(),
  });

  await client.createAccount({
    termsOfServiceAgreed: true,
    contact: [`mailto:${email}`],
  });

  const [key, csr] = await Client.forge.createCsr({ commonName: domain });
  const order = await client.createOrder({ identifiers: [{ type: 'dns', value: domain }] });
  const authorizations = await client.getAuthorizations(order);

  for (const auth of authorizations) {
    const challenge = auth.challenges.find(ch => ch.type === 'http-01');
    const keyAuth = await client.getChallengeKeyAuthorization(challenge);
    const tokenPath = path.join(challengeDir, challenge.token);
    await fs.promises.writeFile(tokenPath, keyAuth);
    await client.verifyChallenge(auth, challenge);
    await client.completeChallenge(challenge);
    await client.waitForValidStatus(challenge);
    await fs.promises.unlink(tokenPath);
  }

  await client.finalizeOrder(order, csr);
  const cert = await client.getCertificate(order);

  const keyPath = path.join(certDir, `${domain}.key`);
  const certPath = path.join(certDir, `${domain}.crt`);
  await fs.promises.writeFile(keyPath, key.toString());
  await fs.promises.writeFile(certPath, cert);
  await db.addCert(domain, keyPath, certPath);
}

async function getCertificate(domain) {
  const record = await db.getCert(domain);
  if (!record) return null;
  const key = await fs.promises.readFile(record.key, 'utf8');
  const cert = await fs.promises.readFile(record.cert, 'utf8');
  return { key, cert };
}

module.exports = {
  issueSelfSigned,
  issueLetsEncrypt,
  getCertificate,
};
