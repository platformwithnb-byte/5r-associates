# 🔐 Secure Backend Setup Guide

## Overview

Your 5R Associates website now uses a **secure Node.js backend server** with **AES-256 encryption** for handling contact form submissions. The Web3Forms access key is encrypted and never exposed in the browser.

## Architecture

```
User Form → Frontend (app.js) → Secure Backend Server → Web3Forms API
                                 (decrypts key)
                                 (returns response)
```

## Setup Steps

### Step 1: Install Node.js Dependencies

```bash
cd "d:\VMB activity\AIPlayground\civil engineer(5R contractor)"
npm install
```

This installs: `express`, `cors`, `dotenv`, `body-parser`

### Step 2: Create Environment File

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` and set a secure encryption password:
   ```
   ENCRYPTION_PASSWORD=your_very_secure_password_12345_change_me
   PORT=3000
   WHATSAPP_NUMBER=N/A yet
   ```

   **⚠️ IMPORTANT**: 
   - Use a strong, random password (mix of letters, numbers, symbols)
   - Never share this password
   - Keep `.env` file locally only (in `.gitignore`)

### Step 3: Encrypt Your Web3Forms Access Key

1. Get your Web3Forms access key from https://web3forms.com
   - Register with your business email
   - Copy the access key

2. Encrypt it using the setup script:
   ```bash
   ENCRYPTION_PASSWORD=your_very_secure_password_12345_change_me node config/setup.js encrypt YOUR_WEB3FORMS_ACCESS_KEY_HERE
   ```

3. Copy the encrypted output

4. Create file `config/keys.encrypted` and paste the encrypted key:
   ```
   (paste encrypted output here)
   ```

   **Example:**
   ```
   a1b2c3d4e5f6...7g8h9i0j:k1l2m3n4o5p6...
   ```

### Step 4: Update Frontend Server URL (if needed)

In `assets/js/app.js`, the backend URL is set to:
```javascript
fetch('http://localhost:3000/api/submit-form', ...)
```

**When deploying:**
- Change `localhost:3000` to your actual server URL
- Example: `https://your-domain.com:3000/api/submit-form`

## Running the Server

### Local Development

```bash
npm start
```

or

```bash
node server.js
```

You should see:
```
🚀 5R Associates Backend Server
📍 Running on http://localhost:3000
🔐 Secure form submission enabled
```

### Keep Both Servers Running

For local testing, open two terminals:

**Terminal 1** - Static HTML server (existing):
```bash
cd "d:\VMB activity\AIPlayground\civil engineer(5R contractor)"
python -m http.server 8000
```

**Terminal 2** - Backend API server:
```bash
cd "d:\VMB activity\AIPlayground\civil engineer(5R contractor)"
npm start
```

Then visit: `http://localhost:8000`

## Testing

1. Open http://localhost:8000/contact.html
2. Fill in the contact form
3. Click "Send Message"
4. You should see:
   - ✅ "Sending..." state
   - ✅ Success message
   - ✅ Form resets
   - ✅ WhatsApp opens (if number is set)
5. Check your business email inbox for the submission

## How It Works

### Encryption Flow

**Setup Time:**
```
Your Web3Forms Key (plain)
        ↓
   AES-256 Encrypt
        ↓
config/keys.encrypted (encrypted)
```

**Runtime (on form submission):**
```
User submits form
        ↓
Backend reads config/keys.encrypted
        ↓
Decrypt using ENCRYPTION_PASSWORD
        ↓
Use decrypted key to submit to Web3Forms
        ↓
Discard decrypted key
        ↓
Return response to frontend
```

### Security Benefits

✅ Access key never exposed in HTML/JavaScript  
✅ Access key encrypted at rest in `config/keys.encrypted`  
✅ Access key only decrypted in memory when needed  
✅ Key never sent to frontend/browser  
✅ Encrypted with AES-256 (military-grade)  
✅ Each encryption uses random IV (Initialization Vector)  

## Deployment to Production

When ready to deploy to a real server:

1. **Choose hosting** (AWS, DigitalOcean, Heroku, Railway, etc.)

2. **Setup environment on server:**
   ```bash
   npm install
   # Copy .env file (keep ENCRYPTION_PASSWORD secure)
   # Copy config/keys.encrypted
   node server.js
   ```

3. **Use process manager** (keep server running 24/7):
   - PM2: `pm2 start server.js`
   - Systemd: Create systemd service
   - Docker: Containerize the app

4. **Update frontend URL**:
   - Change `localhost:3000` to your domain in `assets/js/app.js`
   - Example: `https://api.5r-associates.com/api/submit-form`

5. **Enable HTTPS** (must use HTTPS in production):
   - Use CloudFlare, Let's Encrypt, or paid SSL
   - Update URLs to `https://`

6. **Setup CORS** properly:
   - Update `server.js` CORS origin to include your domain

## Troubleshooting

**"Server is not responding"**
- Make sure backend server is running: `npm start`
- Check port 3000 is not in use: `netstat -ano | findstr :3000`
- Try killing process and restarting

**"Decryption failed"**
- Wrong ENCRYPTION_PASSWORD in `.env`
- Corrupted `config/keys.encrypted` file
- Re-encrypt the key using setup script

**"keys.encrypted not found"**
- Run encryption setup: `node config/setup.js encrypt YOUR_KEY`
- Save output to `config/keys.encrypted`

**CORS errors in browser console**
- Update CORS origin in `server.js` to match your frontend domain

## Security Best Practices

1. ✅ **Never** commit `.env` file to Git
2. ✅ **Never** commit `config/keys.encrypted` to Git (optional)
3. ✅ Use **strong, random** ENCRYPTION_PASSWORD
4. ✅ Keep `.env` file **locally secure**
5. ✅ Use **HTTPS only** in production
6. ✅ Rotate encryption password regularly
7. ✅ Monitor server logs for suspicious activity
8. ✅ Keep Node.js and packages **updated**

## Files Modified/Created

- ✨ `server.js` - Backend API server
- ✨ `config/setup.js` - Encryption/decryption utility
- ✨ `package.json` - Node.js dependencies
- ✨ `.env.example` - Environment template
- ✨ `.env` - Your actual credentials (NOT in Git)
- ✨ `config/keys.encrypted` - Encrypted access key
- 🔄 `contact.html` - Removed direct Web3Forms link
- 🔄 `assets/js/app.js` - Updated to use backend

## Questions?

For more info on:
- **Web3Forms**: https://web3forms.com/docs
- **Node.js/Express**: https://expressjs.com
- **Encryption**: https://nodejs.org/api/crypto.html
- **CORS**: https://enable-cors.org

---

**Last Updated:** December 27, 2025  
**Version:** 1.0.0
