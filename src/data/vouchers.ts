import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ScratchCard } from '../types';

export interface RawVoucherRecord {
  serial_number: string;
  true_pin: string;
  status: 'unused' | 'used' | 'flagged';
  amount: number;
  expiry_date: string; // e.g. "20-06-2027"
  batch_id?: string;
  region?: string;
  note?: string;
}

function loadRawVoucherData(): RawVoucherRecord[] {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(__dirname, 'voucher_seed_data_1000.json');
  const rawJson = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawJson) as RawVoucherRecord[];
}

// Helper function to convert DD-MM-YYYY or YYYY-MM-DD to ISO date string YYYY-MM-DD
function parseExpiryDate(dateStr: string): string {
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 2 && parts[2].length === 4) {
      // DD-MM-YYYY -> YYYY-MM-DD
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr;
}

export function loadInitialCards(): ScratchCard[] {
  return loadRawVoucherData().map((item, index) => ({
    id: String(index + 1),
    serialNumber: item.serial_number,
    voucherPin: item.true_pin,
    status: item.status,
    amount: item.amount,
    expiryDate: parseExpiryDate(item.expiry_date),
    failedAttempts: 0,
    batchId: item.batch_id,
    region: item.region,
    note: item.note
  }));
}
