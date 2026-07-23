/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CardStatus = 'used' | 'unused' | 'flagged';

export interface ScratchCard {
  id: string;
  serialNumber: string;
  voucherPin: string; // The full 16-digit pin
  status: CardStatus;
  expiryDate: string;
  amount: number; // in KES (Kenyan Shillings)
  failedAttempts: number;
  batchId?: string;
  region?: string;
  note?: string;
}

export interface RecoveryRequest {
  serialNumber: string;
  enteredPin: string; // pin containing '?' or '*' for damaged characters
  phoneNumber?: string;
}

export interface RecoveryResponse {
  success: boolean;
  message: string;
  recoveredPin?: string;
  card?: ScratchCard;
  attemptsRemaining?: number;
  walletBalance?: number;
}

export interface ClaimRequest {
  serialNumber: string;
  phoneNumber: string; // Safaricom number starting with 07... or 01...
}

export interface ClaimResponse {
  success: boolean;
  message: string;
  card?: ScratchCard;
}

export interface StatsData {
  totalCards: number;
  unusedCards: number;
  usedCards: number;
  flaggedCards: number;
  totalUnusedValue: number;
  totalClaimedValue: number;
  totalFailedAttempts: number;
  userWallet: number;
}
