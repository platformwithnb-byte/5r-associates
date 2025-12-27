// Encryption setup script - Run this once to encrypt your Web3Forms access key
// Usage: node config/setup.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Get master encryption password from environment
const MASTER_PASSWORD = process.env.ENCRYPTION_PASSWORD || 'default-change-me';

// Derive a reusable key buffer from the master password
function deriveKey() {
    return crypto.createHash('sha256').update(MASTER_PASSWORD).digest();
}

function encryptAccessKey(plainAccessKey) {
    const hash = deriveKey();

    // Generate a random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);

    // Create cipher using AES-256-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', hash, iv);

    // Encrypt the access key
    let encrypted = cipher.update(plainAccessKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine IV + encrypted data (IV must be sent along with encrypted data for decryption)
    const result = iv.toString('hex') + ':' + encrypted;

    return result;
}

function decryptAccessKey(encryptedData) {
    try {
        const hash = deriveKey();

        // Split IV and encrypted data
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        // Create decipher
        const decipher = crypto.createDecipheriv('aes-256-cbc', hash, iv);

        // Decrypt
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return null;
    }
}

function encryptText(plainText) {
    const hash = deriveKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', hash, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}

function decryptText(encryptedData) {
    try {
        const hash = deriveKey();
        const [ivHex, encrypted] = encryptedData.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', hash, iv);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decrypt text failed:', error.message);
        return null;
    }
}

// If running directly, encrypt a key
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Encryption Setup Tool for Web3Forms Access Key');
        console.log('==============================================');
        console.log('\nUsage:');
        console.log('  node config/setup.js encrypt <your-access-key>');
        console.log('  node config/setup.js decrypt <encrypted-key>');
        console.log('\nExample:');
        console.log('  node config/setup.js encrypt YOUR_WEB3FORMS_KEY_HERE');
        console.log('\nEnvironment:');
        console.log(`  Current ENCRYPTION_PASSWORD: ${MASTER_PASSWORD === 'default-change-me' ? 'NOT SET (using default)' : 'SET'}`);
        process.exit(0);
    }

    const command = args[0];
    const key = args[1];

    if (command === 'encrypt' && key) {
        const encrypted = encryptAccessKey(key);
        console.log('\n✅ Encryption successful!');
        console.log('\nEncrypted key:');
        console.log(encrypted);
        console.log('\nSave this to config/keys.encrypted');
    } else if (command === 'decrypt' && key) {
        const decrypted = decryptAccessKey(key);
        console.log('\n✅ Decryption successful!');
        console.log('\nDecrypted key:');
        console.log(decrypted);
    } else {
        console.log('❌ Invalid command or missing key');
        console.log('Use: node config/setup.js encrypt <key>');
    }
}

module.exports = { encryptAccessKey, decryptAccessKey, encryptText, decryptText };
