#!/usr/bin/env node
// Rekey encrypted response logs from OLD_ENCRYPTION_PASSWORD to ENCRYPTION_PASSWORD
// Usage:
//   $env:OLD_ENCRYPTION_PASSWORD="oldpwd"; $env:ENCRYPTION_PASSWORD="newpwd"; npm run rekey-logs

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OLD = process.env.OLD_ENCRYPTION_PASSWORD;
const NEW = process.env.ENCRYPTION_PASSWORD;

if (!OLD || !NEW) {
    console.error('OLD_ENCRYPTION_PASSWORD and ENCRYPTION_PASSWORD environment variables are required.');
    process.exit(1);
}

function deriveKey(pass) {
    return crypto.createHash('sha256').update(pass).digest();
}

function decryptWith(pass, encryptedData) {
    try {
        const [ivHex, encrypted] = encryptedData.trim().split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const key = deriveKey(pass);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        return null;
    }
}

function encryptWith(pass, plain) {
    const key = deriveKey(pass);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let enc = cipher.update(plain, 'utf8', 'hex');
    enc += cipher.final('hex');
    return iv.toString('hex') + ':' + enc;
}

const LOG_PATH = path.join(__dirname, '..', 'response', 'response.log.enc');
if (!fs.existsSync(LOG_PATH)) {
    console.log('No log file found to rekey:', LOG_PATH);
    process.exit(0);
}

const lines = fs.readFileSync(LOG_PATH, 'utf8').split('\n').filter(Boolean);
if (lines.length === 0) {
    console.log('Log file is empty. Nothing to rekey.');
    process.exit(0);
}

const outLines = [];
let failed = 0;
for (const line of lines) {
    const dec = decryptWith(OLD, line);
    if (!dec) { failed++; continue; }
    const enc = encryptWith(NEW, dec);
    outLines.push(enc);
}

const backupPath = path.join(__dirname, '..', 'response', `response.log.enc.bak.${Date.now()}`);
fs.copyFileSync(LOG_PATH, backupPath);
fs.writeFileSync(LOG_PATH, outLines.join('\n') + '\n', 'utf8');

console.log(`✅ Rekeyed logs: ${outLines.length} entries written, ${failed} failed to decrypt with OLD password.`);
console.log('Backup saved to:', backupPath);
