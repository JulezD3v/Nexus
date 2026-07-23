/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { ScratchCard, RecoveryRequest, RecoveryResponse, ClaimRequest, ClaimResponse } from './src/types';
import { loadInitialCards } from './src/data/vouchers';

dotenv.config();

let database: ScratchCard[] = JSON.parse(JSON.stringify(loadInitialCards()));

// In-memory wallet balance for the simulation
let userWalletBalance = 250; // starting balance in KES

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  const gatewayUrl = (process.env.FASTAPI_GATEWAY_URL || process.env.REMOTE_GATEWAY_URL || '').trim().replace(/\/$/, '');

  if (gatewayUrl) {
    console.log(`[Nexus Server] FastAPI Gateway Proxy configured: ${gatewayUrl}`);
  } else {
    console.log('[Nexus Server] FASTAPI_GATEWAY_URL not set. Operating in built-in Express engine mode.');
  }

  // API Endpoints

  // Gateway Connection Status
  app.get('/api/gateway/status', async (req, res) => {
    if (!gatewayUrl) {
      return res.json({
        configured: false,
        mode: 'express_local',
        gatewayUrl: null,
        message: 'FASTAPI_GATEWAY_URL is not set in backend .env. Running built-in Express engine.'
      });
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const check = await fetch(`${gatewayUrl}/health`, {
        signal: controller.signal,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      clearTimeout(timeout);
      if (check.ok) {
        const data = await check.json();
        return res.json({
          configured: true,
          online: true,
          mode: 'fastapi_gateway',
          gatewayUrl,
          response: data
        });
      } else {
        return res.json({
          configured: true,
          online: false,
          mode: 'express_local_fallback',
          gatewayUrl,
          message: `Gateway responded with status ${check.status}`
        });
      }
    } catch (err: any) {
      return res.json({
        configured: true,
        online: false,
        mode: 'express_local_fallback',
        gatewayUrl,
        error: err.message
      });
    }
  });

  // Get current state of the database and wallet balance
  app.get('/api/cards', (req, res) => {
    res.json({
      cards: database,
      walletBalance: userWalletBalance
    });
  });

  // Reset database state to original
  app.post('/api/cards/reset', (req, res) => {
    database = JSON.parse(JSON.stringify(loadInitialCards()));
    userWalletBalance = 250;
    res.json({
      success: true,
      message: 'Safaricom test database and wallet successfully reset to initial states!',
      cards: database,
      walletBalance: userWalletBalance
    });
  });

  // Health Check Endpoint
  app.get('/health', (req, res) => {
    res.json({ status: "Safaricom Nexus AI Gateway is Online" });
  });

  // USSD Bridge Endpoint (/api/v1/recover/ussd)
  app.post('/api/v1/recover/ussd', async (req, res) => {
    const { msisdn, user_input_pin, user_input_serial } = req.body || {};
    
    if (gatewayUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const remoteRes = await fetch(`${gatewayUrl}/api/v1/recover/ussd`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            msisdn: msisdn || req.body.phoneNumber || '',
            user_input_pin: user_input_pin || req.body.enteredPin || '',
            user_input_serial: user_input_serial || req.body.serialNumber || ''
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (remoteRes.ok) {
          const result = await remoteRes.json();
          return res.json(result);
        } else if (remoteRes.status === 429) {
          let errData: any = {};
          try { errData = await remoteRes.json(); } catch (_) {}
          return res.status(429).json({
            success: false,
            message: errData.detail || 'Rate limit exceeded on FastAPI Gateway (10 USSD requests/min max).'
          });
        }
      } catch (err: any) {
        console.warn('[Proxy USSD] Gateway call failed, falling back to local engine:', err.message);
      }
    }

    req.body = {
      serialNumber: user_input_serial || req.body.serialNumber || '',
      enteredPin: user_input_pin || req.body.enteredPin || '',
      phoneNumber: msisdn || req.body.phoneNumber || ''
    };
    return executeRecovery(req, res);
  });

  // Primary card recovery endpoint
  app.post('/api/cards/recover', async (req, res) => {
    const { serialNumber, enteredPin, phoneNumber } = req.body || {};

    if (gatewayUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const remoteRes = await fetch(`${gatewayUrl}/api/v1/recover/ussd`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            msisdn: phoneNumber || '',
            user_input_pin: enteredPin || '',
            user_input_serial: serialNumber || ''
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (remoteRes.ok) {
          const rawData = await remoteRes.json();
          return res.json({
            success: rawData.success ?? rawData.status === 'success' ?? true,
            message: rawData.message || rawData.detail || 'Recovery request processed.',
            recoveredPin: rawData.recoveredPin || rawData.recovered_pin || rawData.true_pin,
            card: rawData.card || rawData.voucher,
            attemptsRemaining: rawData.attemptsRemaining || rawData.attempts_remaining
          });
        } else if (remoteRes.status === 429) {
          let errData: any = {};
          try { errData = await remoteRes.json(); } catch (_) {}
          return res.status(429).json({
            success: false,
            message: errData.detail || 'Rate limit exceeded on FastAPI Gateway (10 USSD requests/min max).'
          });
        }
      } catch (err: any) {
        console.warn('[Proxy Recover] Gateway call failed, falling back to local engine:', err.message);
      }
    }

    executeRecovery(req, res);
  });

  // Vision OCR Image Upload Endpoint (/api/v1/recover/vision)
  app.post('/api/v1/recover/vision', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    if (gatewayUrl) {
      try {
        const formData = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append('file', blob, req.file.originalname);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout for Vision AI

        const remoteRes = await fetch(`${gatewayUrl}/api/v1/recover/vision`, {
          method: 'POST',
          headers: {
            'ngrok-skip-browser-warning': 'true'
          },
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (remoteRes.ok) {
          const result = await remoteRes.json();
          return res.json(result);
        } else {
          let errData: any = {};
          try { errData = await remoteRes.json(); } catch (_) {}
          console.warn(`[Proxy Vision] Gateway returned HTTP ${remoteRes.status}`);
          return res.status(remoteRes.status).json({
            success: false,
            message: errData.detail || errData.message || `FastAPI Gateway Vision Error (${remoteRes.status}): ${remoteRes.statusText}`
          });
        }
      } catch (err: any) {
        console.error('[Proxy Vision] Error proxying vision request:', err.message);
        return res.status(502).json({
          success: false,
          message: `Failed to connect to FastAPI Vision Gateway at ${gatewayUrl}: ${err.message}`
        });
      }
    }

    return res.status(503).json({
      success: false,
      message: 'FASTAPI_GATEWAY_URL is not configured in .env. Please set FASTAPI_GATEWAY_URL in your backend server environment to enable Vision OCR processing.'
    });
  });

  function executeRecovery(req: any, res: any) {
    const { serialNumber, enteredPin, phoneNumber } = req.body;

    if (!serialNumber || !enteredPin) {
      return res.status(400).json({
        success: false,
        message: 'Both Serial Number and Voucher PIN are required for recovery.'
      });
    }

    const cleanSerial = serialNumber.trim().toUpperCase();
    // Clean spaces and hyphens from the entered PIN
    const cleanEnteredPin = enteredPin.replace(/[\s-]/g, '');

    // Validate phone number if provided
    let cleanPhone = '';
    if (phoneNumber) {
      cleanPhone = phoneNumber.replace(/[\s-]/g, '');
      const phoneRegex = /^(?:\+254|0)?(7|1)\d{8}$/;

      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Safaricom mobile number. Must start with 07..., 01..., or +254...'
        });
      }
    }

    // Locate card in mock database
    const cardIndex = database.findIndex(c => {
      const normCard = c.serialNumber.replace(/^S-?/i, '').toUpperCase();
      const normInput = cleanSerial.replace(/^S-?/i, '').toUpperCase();
      return normCard === normInput || c.serialNumber.toUpperCase() === cleanSerial;
    });

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Serial Number not found in Safaricom voucher registry.'
      });
    }

    const card = database[cardIndex];

    // Check status constraints
    if (card.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'This scratch card has already been redeemed and loaded.',
        card
      });
    }

    if (card.status === 'flagged') {
      return res.status(400).json({
        success: false,
        message: 'SECURITY ALERT: This card has been flagged/blocked due to suspicious activity.',
        card
      });
    }

    // Verify format: must be 16 digits/placeholders long
    if (cleanEnteredPin.length !== 16) {
      return res.status(400).json({
        success: false,
        message: `Invalid voucher length. A standard Safaricom voucher PIN consists of exactly 16 digits. Received ${cleanEnteredPin.length} characters.`
      });
    }

    const truePin = card.voucherPin;
    let visibleCount = 0;
    let matches = true;

    // Loop through and compare
    for (let i = 0; i < 16; i++) {
      const charInput = cleanEnteredPin[i];
      const charTrue = truePin[i];

      const isPlaceholder = charInput === '?' || charInput === '*' || charInput === '_';

      if (!isPlaceholder) {
        visibleCount++;
        if (charInput !== charTrue) {
          matches = false;
        }
      }
    }

    // Security check: Minimum visible digits required (to prevent brute forcing PINs)
    const MIN_REQUIRED_DIGITS = 6;
    if (visibleCount < MIN_REQUIRED_DIGITS) {
      return res.status(400).json({
        success: false,
        message: `Security Constraint: You must provide at least ${MIN_REQUIRED_DIGITS} visible digits (non-placeholders) to run recovery. Currently provided: ${visibleCount}.`
      });
    }

    if (!matches) {
      // Recovery failed
      card.failedAttempts += 1;
      let responseMessage = 'Digit matching failed. The readable digits do not align with the registered PIN.';
      
      if (card.failedAttempts >= 3) {
        card.status = 'flagged';
        responseMessage = 'SECURITY ALERT: Voucher PIN recovery failed. 3 incorrect attempts recorded. This card has now been FLAGGED and locked.';
      } else {
        responseMessage += ` (${3 - card.failedAttempts} attempts remaining before card is flagged/blocked).`;
      }

      // Update database
      database[cardIndex] = card;

      return res.json({
        success: false,
        message: responseMessage,
        card,
        attemptsRemaining: Math.max(0, 3 - card.failedAttempts)
      } as RecoveryResponse);
    }

    // Success! Perfect match for all provided visible digits
    if (cleanPhone) {
      // Update status to 'used'
      card.status = 'used';
      database[cardIndex] = card;

      // Credit simulation wallet
      userWalletBalance += card.amount;

      return res.json({
        success: true,
        message: `Success! Voucher PIN successfully reconstructed and KES ${card.amount} loaded directly onto phone number ${cleanPhone}.`,
        recoveredPin: truePin,
        card,
        walletBalance: userWalletBalance
      });
    }

    return res.json({
      success: true,
      message: 'Voucher PIN successfully recovered using Safaricom Match algorithm!',
      recoveredPin: truePin,
      card
    } as RecoveryResponse);
  }

  // Claim/Redeem Voucher
  app.post('/api/cards/claim', (req, res) => {
    const { serialNumber, phoneNumber } = req.body as ClaimRequest;

    if (!serialNumber || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Serial Number and Safaricom Phone Number are required.'
      });
    }

    // Simple Kenyan/Safaricom phone number validation
    // Formats: 07xxxxxxxx, 01xxxxxxxx, +2547xxxxxxxx, +2541xxxxxxxx
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    const phoneRegex = /^(?:\+254|0)?(7|1)\d{8}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Safaricom mobile number. Must start with 07..., 01..., or +254...'
      });
    }

    const cleanSerial = serialNumber.trim().toUpperCase();
    const cardIndex = database.findIndex(c => c.serialNumber.toUpperCase() === cleanSerial);

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found.'
      });
    }

    const card = database[cardIndex];

    if (card.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'This scratch card has already been claimed/loaded.'
      });
    }

    if (card.status === 'flagged') {
      return res.status(400).json({
        success: false,
        message: 'Cannot redeem a flagged or blocked scratch card.'
      });
    }

    // Update status to 'used'
    card.status = 'used';
    database[cardIndex] = card;

    // Credit simulation wallet
    userWalletBalance += card.amount;

    return res.json({
      success: true,
      message: `Success! KES ${card.amount} has been loaded onto phone number ${cleanPhone}. Wallet updated.`,
      card,
      walletBalance: userWalletBalance
    });
  });

  // Get statistics metrics for the Dashboard page
  app.get('/api/stats', (req, res) => {
    const totalCards = database.length;
    const unusedCards = database.filter(c => c.status === 'unused').length;
    const usedCards = database.filter(c => c.status === 'used').length;
    const flaggedCards = database.filter(c => c.status === 'flagged').length;

    const totalUnusedValue = database
      .filter(c => c.status === 'unused')
      .reduce((sum, c) => sum + c.amount, 0);

    const totalClaimedValue = database
      .filter(c => c.status === 'used')
      .reduce((sum, c) => sum + c.amount, 0);

    const totalFailedAttempts = database.reduce((sum, c) => sum + c.failedAttempts, 0);

    res.json({
      totalCards,
      unusedCards,
      usedCards,
      flaggedCards,
      totalUnusedValue,
      totalClaimedValue,
      totalFailedAttempts,
      userWallet: userWalletBalance
    });
  });

  // Serve static files / Vite SPA in development & production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Safaricom Card Recovery Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
