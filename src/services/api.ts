/**
 * Client API Service - Communicates directly with the web app server (/api/*)
 * All server-to-server FastAPI gateway proxying (via FASTAPI_GATEWAY_URL in .env)
 * is handled securely on the backend server.
 */

import { ScratchCard, RecoveryRequest, RecoveryResponse, ClaimRequest, ClaimResponse } from '../types';

export const voucherApi = {
  // Check backend server & gateway connectivity status
  async getGatewayStatus(): Promise<{ configured: boolean; online?: boolean; mode: string; gatewayUrl?: string; message?: string }> {
    try {
      const res = await fetch('/api/gateway/status');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch gateway status:', err);
    }
    return { configured: false, mode: 'express_local' };
  },

  // Fetch cards list
  async getCards(): Promise<{ cards: ScratchCard[]; walletBalance?: number }> {
    const res = await fetch('/api/cards');
    if (!res.ok) throw new Error('Failed to fetch cards');
    return await res.json();
  },

  // Fetch stats metrics
  async getStats(): Promise<any> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  },

  // Submit USSD / Manual recovery request
  async recover(req: RecoveryRequest): Promise<RecoveryResponse> {
    const res = await fetch('/api/cards/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    const data = await res.json();
    return data;
  },

  // Submit vision/image upload request for OCR processing
  async recoverVision(imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);

    const res = await fetch('/api/v1/recover/vision', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Vision API error (${res.status})`);
    }

    return data;
  },

  // Claim voucher airtime
  async claim(req: ClaimRequest): Promise<ClaimResponse> {
    const res = await fetch('/api/cards/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Airtime claim failed.');
    return data;
  },

  // Reset database
  async reset(): Promise<{ message: string; cards: ScratchCard[] }> {
    const res = await fetch('/api/cards/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset sandbox.');
    return await res.json();
  }
};
