// Node.js Express backend server for secure form submission
// Handles encrypted Web3Forms access key and WhatsApp communication

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { decryptAccessKey, encryptText, decryptText } = require('./config/setup');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change_me_admin_token';

const RESPONSE_DIR = path.join(__dirname, 'response');
const RESPONSE_LOG_PATH = path.join(RESPONSE_DIR, 'response.log.enc');

function appendEncryptedLog(entry) {
    try {
        fs.mkdirSync(RESPONSE_DIR, { recursive: true });
        const encryptedLine = encryptText(JSON.stringify(entry));
        if (encryptedLine) {
            fs.appendFileSync(RESPONSE_LOG_PATH, encryptedLine + '\n', 'utf8');
        }
    } catch (logErr) {
        console.error('Failed to write encrypted log:', logErr.message);
    }
}

// Middleware
app.use(cors({
    origin: ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// Form submission endpoint
app.post('/api/submit-form', async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body;

        // Validation
        if (!name || !email || !phone || !service || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        // Read and decrypt access key
        const keysFilePath = path.join(__dirname, 'config/keys.encrypted');
        if (!fs.existsSync(keysFilePath)) {
            console.error('keys.encrypted file not found');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        const encryptedKey = fs.readFileSync(keysFilePath, 'utf8');
        const accessKey = decryptAccessKey(encryptedKey);

        if (!accessKey) {
            console.error('Failed to decrypt access key');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        // Format form data for Web3Forms
        const formData = new FormData();
        formData.append('access_key', accessKey);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('service', service);
        formData.append('message', message);
        formData.append('from_name', '5R Associates Contact Form');

        // Submit to Web3Forms
        const web3formsResponse = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const web3formsResult = await web3formsResponse.json();

        if (web3formsResponse.ok && web3formsResult.success) {
            console.log(`✅ Form submitted: ${name} (${email})`);

            appendEncryptedLog({
                type: 'success',
                timestamp: new Date().toISOString(),
                channel: 'email',
                name,
                email,
                phone,
                service,
                message
            });

            return res.json({
                success: true,
                message: 'Your message has been sent successfully',
                whatsappNumber: process.env.WHATSAPP_NUMBER || 'N/A yet'
            });
        } else {
            console.error('Web3Forms error:', web3formsResult.message);

            appendEncryptedLog({
                type: 'error',
                timestamp: new Date().toISOString(),
                channel: 'email',
                name,
                email,
                phone,
                service,
                message,
                error: web3formsResult.message || 'Unknown Web3Forms error'
            });

            return res.status(500).json({
                success: false,
                message: 'Error submitting form. Please try again.'
            });
        }

    } catch (error) {
        console.error('Server error:', error);

        appendEncryptedLog({
            type: 'error',
            timestamp: new Date().toISOString(),
            channel: 'email',
            error: error.message || 'Unhandled server error'
        });

        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// Admin endpoint: decrypt and return response logs (requires admin token)
app.get('/api/admin/logs', (req, res) => {
    try {
        const token = req.query.token || req.headers['x-admin-token'];
        if (!token || token !== ADMIN_TOKEN) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 1000);

        if (!fs.existsSync(RESPONSE_LOG_PATH)) {
            return res.json({ success: true, count: 0, entries: [] });
        }

        const lines = fs.readFileSync(RESPONSE_LOG_PATH, 'utf8').split('\n').filter(Boolean);
        const slice = lines.slice(Math.max(lines.length - limit, 0));
        const entries = slice.map((line) => {
            const decrypted = decryptText(line);
            if (!decrypted) return { type: 'error', error: 'decrypt_failed' };
            try {
                return JSON.parse(decrypted);
            } catch {
                return { type: 'raw', data: decrypted };
            }
        });

        return res.json({ success: true, count: entries.length, entries });
    } catch (err) {
        console.error('Admin logs error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Admin test endpoint: append a sample log entry (authorized)
app.post('/api/admin/logs-test', (req, res) => {
    try {
        const token = req.query.token || req.headers['x-admin-token'];
        if (!token || token !== ADMIN_TOKEN) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const sample = {
            type: 'test',
            timestamp: new Date().toISOString(),
            channel: 'email',
            name: 'Sample Admin Log',
            email: 'admin@test.local',
            phone: '0000000000',
            service: 'construction',
            message: 'This is a test log entry.'
        };
        appendEncryptedLog(sample);
        return res.json({ success: true });
    } catch (err) {
        console.error('Admin logs-test error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 5R Associates Backend Server`);
    console.log(`📍 Running on http://localhost:${PORT}`);
    console.log(`🔐 Secure form submission enabled`);
    console.log(`\nEndpoints:`);
    console.log(`  GET  /api/health       - Health check`);
    console.log(`  POST /api/submit-form  - Form submission`);
    console.log(`\n⚠️  Make sure:`);
    console.log(`  1. .env file is configured with ENCRYPTION_PASSWORD`);
    console.log(`  2. config/keys.encrypted file exists`);
    console.log(`\n`);
});
