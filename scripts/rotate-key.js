#!/usr/bin/env node
// Rotate Web3Forms access key encryption from OLD_ENCRYPTION_PASSWORD to ENCRYPTION_PASSWORD
// Usage:
//   $env:OLD_ENCRYPTION_PASSWORD="oldpwd"; $env:ENCRYPTION_PASSWORD="newpwd"; npm run rotate-key

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

const KEYS_PATH = path.join(__dirname, '..', 'config', 'keys.encrypted');
if (!fs.existsSync(KEYS_PATH)) {
    console.error('config/keys.encrypted not found.');
    process.exit(1);
}

const encrypted = fs.readFileSync(KEYS_PATH, 'utf8');
const plainKey = decryptWith(OLD, encrypted);
if (!plainKey) {
    console.error('Failed to decrypt with OLD_ENCRYPTION_PASSWORD.');
    process.exit(1);
}

const rotated = encryptWith(NEW, plainKey);
const backupPath = path.join(__dirname, '..', 'config', `keys.encrypted.bak.${Date.now()}`);
fs.copyFileSync(KEYS_PATH, backupPath);
fs.writeFileSync(KEYS_PATH, rotated, 'utf8');

console.log('✅ Rotated config/keys.encrypted');
console.log('Backup saved to:', backupPath);
