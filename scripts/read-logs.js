#!/usr/bin/env node
// Decrypt and print encrypted response logs
// Usage: ENCRYPTION_PASSWORD=... npm run read-logs

const fs = require('fs');
const path = require('path');
const { decryptText } = require('../config/setup');

const LOG_PATH = path.join(__dirname, '..', 'response', 'response.log.enc');

function readEncryptedLogs() {
    if (!process.env.ENCRYPTION_PASSWORD) {
        console.error('ENCRYPTION_PASSWORD is required to decrypt logs.');
        process.exit(1);
    }

    if (!fs.existsSync(LOG_PATH)) {
        console.log('No log file found at', LOG_PATH);
        return;
    }

    const lines = fs.readFileSync(LOG_PATH, 'utf8').split('\n').filter(Boolean);
    if (lines.length === 0) {
        console.log('Log file is empty.');
        return;
    }

    console.log(`\n🔐 Decrypted log entries (${lines.length}):\n`);
    lines.forEach((line, idx) => {
        const decrypted = decryptText(line);
        if (!decrypted) {
            console.log(`#${idx + 1}: [decrypt failed]`);
            return;
        }
        try {
            const entry = JSON.parse(decrypted);
            console.log(`#${idx + 1}:`, entry);
        } catch (err) {
            console.log(`#${idx + 1}:`, decrypted);
        }
    });
}

readEncryptedLogs();
