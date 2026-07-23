/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles
} from 'lucide-react';
import rawVoucherJson from './data/voucher_seed_data_1000.json';
import { ScratchCard, RecoveryResponse, StatsData } from './types';
import { voucherApi } from './services/api';
import { Header } from './components/Header';
import { ValidationTerminal } from './components/ValidationTerminal';
import { DatabaseRegistry } from './components/DatabaseRegistry';
import { PlatformDashboard } from './components/PlatformDashboard';
import { AboutModal } from './components/AboutModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';

type LocalVoucherRecord = {
  serial_number: string;
  true_pin: string;
  status: 'unused' | 'used' | 'flagged';
  amount: number;
  expiry_date: string;
  batch_id?: string;
  region?: string;
  note?: string;
};

function parseLocalExpiryDate(dateStr: string): string {
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts[0].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr;
}

const LOCAL_CARDS: ScratchCard[] = (rawVoucherJson as LocalVoucherRecord[]).map((item, index) => ({
  id: String(index + 1),
  serialNumber: item.serial_number,
  voucherPin: item.true_pin,
  status: item.status,
  amount: item.amount,
  expiryDate: parseLocalExpiryDate(item.expiry_date),
  failedAttempts: 0,
  batchId: item.batch_id,
  region: item.region,
  note: item.note
}));

const buildStatsFromCards = (cards: ScratchCard[]): StatsData => {
  const totalCards = cards.length;
  const unusedCards = cards.filter((c) => c.status === 'unused').length;
  const usedCards = cards.filter((c) => c.status === 'used').length;
  const flaggedCards = cards.filter((c) => c.status === 'flagged').length;
  const totalUnusedValue = cards
    .filter((c) => c.status === 'unused')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalClaimedValue = cards
    .filter((c) => c.status === 'used')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalFailedAttempts = cards.reduce((sum, c) => sum + c.failedAttempts, 0);

  return {
    totalCards,
    unusedCards,
    usedCards,
    flaggedCards,
    totalUnusedValue,
    totalClaimedValue,
    totalFailedAttempts,
    userWallet: 0
  };
};

export default function App() {
  
  const [currentView, setCurrentView] = useState<'terminal' | 'dashboard'>('terminal');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);

  
  const [cards, setCards] = useState<ScratchCard[]>(LOCAL_CARDS);
  const [selectedCardId, setSelectedCardId] = useState<string>(LOCAL_CARDS[0]?.id ?? '1');
  const [loading, setLoading] = useState<boolean>(true);


  const [stats, setStats] = useState<StatsData | null>(buildStatsFromCards(LOCAL_CARDS));
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const [serialInput, setSerialInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('0712345678');

  // Validation Results
  const [recoveryResult, setRecoveryResult] = useState<RecoveryResponse | null>(null);
  const [isRecovering, setIsRecovering] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  
  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Copied feedback triggers
  const [copiedSerial, setCopiedSerial] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Data Privacy & Admin Reveal State
  const [isPinUnmasked, setIsPinUnmasked] = useState<boolean>(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');

  // Terminal Mode state: 'ussd' vs 'vision'
  const [terminalMode, setTerminalMode] = useState<'ussd' | 'vision'>('ussd');
  const [visionFile, setVisionFile] = useState<File | null>(null);
  const [visionPreview, setVisionPreview] = useState<string | null>(null);

  // Server Gateway Status
  const [gatewayInfo, setGatewayInfo] = useState<{ configured: boolean; online?: boolean; mode: string } | null>(null);

  // Fetch cards and statistics on mount
  useEffect(() => {
    fetchCardsAndStats();
    checkGateway();
  }, []);

  const checkGateway = async () => {
    const status = await voucherApi.getGatewayStatus();
    setGatewayInfo(status);
  };

  const fetchCardsAndStats = async () => {
    try {
      setLoading(true);
      const cardsData = await voucherApi.getCards();
      setCards(cardsData.cards);
      
      if (cardsData.cards.length > 0 && !selectedCardId) {
        setSelectedCardId(cardsData.cards[0].id);
      }
      
      await fetchStats(cardsData.cards);
    } catch (err) {
      showToast('Error connecting to backend database node. Using local voucher seed data.', 'error');
      setCards(LOCAL_CARDS);
      setStats(buildStatsFromCards(LOCAL_CARDS));
      setStatsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (cardsFallback?: ScratchCard[]) => {
    try {
      setStatsLoading(true);
      const statsData = await voucherApi.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats metrics:', err);
      setStats(buildStatsFromCards(cardsFallback ?? cards));
    } finally {
      setStatsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Find active card selected in reference
  const activeCard = cards.find(c => c.id === selectedCardId) || cards[0];

  
  const handleRandomizeSelectedCard = () => {
    if (cards.length === 0) return;
    
   
    const otherCards = cards.filter(c => c.id !== selectedCardId);
    const pool = otherCards.length > 0 ? otherCards : cards;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const nextCard = pool[randomIndex];
    
    setSelectedCardId(nextCard.id);
    setIsPinUnmasked(false);
    setRecoveryResult(null);
    setSerialInput('');
    setPinInput('');
    
    showToast(`Switched test bench to Serial: ${nextCard.serialNumber}`, 'success');
  };

  // Format PIN for displays (e.g. 1234-5678-9012-3456)
  const formatPinWithHyphens = (pin: string) => {
    const cleaned = pin.replace(/[\s-]/g, '');
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    return parts.join('-');
  };

  // Format PIN for displays 
  const formatPinWithPrivacyMask = (pin: string, showUnmasked: boolean = false) => {
    if (!pin) return '';
    const cleaned = pin.replace(/[\s-]/g, '');
    if (cleaned.length < 12) return pin;
    if (showUnmasked) {
      const parts = [];
      for (let i = 0; i < cleaned.length; i += 4) {
        parts.push(cleaned.substring(i, i + 4));
      }
      return parts.join('-');
    }
    const first4 = cleaned.substring(0, 4);
    const last4 = cleaned.substring(cleaned.length - 4);
    return `${first4}-****-****-${last4}`;
  };

  // Submit recovery match request
  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput || !pinInput) {
      showToast('Please fill in both Serial Number and Voucher PIN.', 'error');
      return;
    }
    if (!phoneInput) {
      showToast('Please fill in your Safaricom Phone Number.', 'error');
      return;
    }

    setIsRecovering(true);
    setRecoveryResult(null);

    try {
      const data = await voucherApi.recover({
        serialNumber: serialInput.trim(),
        enteredPin: pinInput.trim(),
        phoneNumber: phoneInput.trim()
      });
      
      if (data.card) {
        setCards(prev => prev.map(c => c.serialNumber === data.card?.serialNumber ? data.card! : c));
        setSelectedCardId(data.card.id);
      }
      setRecoveryResult(data);
      fetchStats();

      if (data.success) {
        showToast(data.message, 'success');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Network error while running recovery match.', 'error');
    } finally {
      setIsRecovering(false);
    }
  };

  // Submit image upload vision OCR recovery request (/api/v1/recover/vision)
  const handleVisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visionFile) {
      showToast('Please select or capture a scratch card voucher image.', 'error');
      return;
    }

    setIsRecovering(true);
    setRecoveryResult(null);

    try {
      const data = await voucherApi.recoverVision(visionFile);
      if (data.card) {
        setCards(prev => prev.map(c => c.serialNumber === data.card?.serialNumber ? data.card! : c));
        setSelectedCardId(data.card.id);
      }
      setRecoveryResult({
        success: data.success ?? true,
        message: data.message || 'Vision pipeline completed OCR voucher extraction.',
        recoveredPin: data.recoveredPin || data.true_pin || data.pin,
        card: data.card
      });
      fetchStats();
      showToast('Nexus Vision OCR scan complete!', 'success');
    } catch (err: any) {
      showToast(`Vision API Error: ${err.message || 'Failed to process image.'}`, 'error');
    } finally {
      setIsRecovering(false);
    }
  };

  // Redeem airtime voucher
  const handleClaim = async () => {
    if (!recoveryResult?.recoveredPin || !recoveryResult?.card) return;
    
    setIsClaiming(true);
    try {
      const data = await voucherApi.claim({
        serialNumber: recoveryResult.card.serialNumber,
        phoneNumber: phoneInput.trim()
      });

      if (data.card) {
        setCards(prev => prev.map(c => c.serialNumber === data.card?.serialNumber ? data.card! : c));
        fetchStats();
        showToast(data.message, 'success');
        setRecoveryResult(null);
      } else {
        showToast(data.message || 'Failed to claim airtime voucher.', 'error');
      }
    } catch (err) {
      showToast('Network error during airtime crediting.', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  // Reset database state
  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      const data = await voucherApi.reset();
      setCards(data.cards);
      if (data.cards.length > 0) {
        setSelectedCardId(data.cards[0].id);
      }
      setRecoveryResult(null);
      setSerialInput('');
      setPinInput('');
      fetchStats();
      showToast('Database sandbox successfully reset.', 'success');
    } catch (err) {
      showToast('Network error while resetting sandbox.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'serial' | 'pin') => {
    navigator.clipboard.writeText(text);
    if (type === 'serial') {
      setCopiedSerial(true);
      setTimeout(() => setCopiedSerial(false), 2000);
      showToast('Serial number copied!', 'success');
    } else {
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
      showToast('Voucher PIN copied!', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between">
      
      {/* Toast Notification removed per user request */}

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Header App Bar matching Safaricom Aesthetics */}
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          setAboutOpen={setAboutOpen}
          gatewayInfo={gatewayInfo}
          isResetting={isResetting}
          handleResetDatabase={handleResetDatabase}
          fetchStats={fetchStats}
        />

        {/* Main Body Grid */}
        <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
          
          {/* VIEW 1: TERMINAL & RECOVERY WORKBENCH */}
          {currentView === 'terminal' && (
            <div className="space-y-8">
              
              {/* Top Banner explaining task */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                <div className="bg-[#49B847]/10 p-2 rounded-xl text-[#49B847] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">How to test the Recovery Terminal:</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    1. Click <strong>Next Card</strong> on the Database Reference Details box to cycle test cards from the registry.<br />
                    2. Enter or paste the Serial Number and Voucher PIN (use <code>?</code> or <code>*</code> for missing/damaged digits).<br />
                    3. Click <strong>Run Recovery Match</strong> to execute the validation algorithm and reload airtime onto the subscriber line.
                  </p>
                </div>
              </div>

              {/* Two-Column Fluid Layout (CSS Grid, responsive for all screens) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* FIRST COLUMN: Validation Form Terminal */}
                <ValidationTerminal
                  terminalMode={terminalMode}
                  setTerminalMode={setTerminalMode}
                  serialInput={serialInput}
                  setSerialInput={setSerialInput}
                  pinInput={pinInput}
                  setPinInput={setPinInput}
                  phoneInput={phoneInput}
                  setPhoneInput={setPhoneInput}
                  handleRecover={handleRecover}
                  isRecovering={isRecovering}
                  visionFile={visionFile}
                  setVisionFile={setVisionFile}
                  visionPreview={visionPreview}
                  setVisionPreview={setVisionPreview}
                  handleVisionSubmit={handleVisionSubmit}
                  recoveryResult={recoveryResult}
                  formatPinWithHyphens={formatPinWithHyphens}
                  handleClaim={handleClaim}
                  isClaiming={isClaiming}
                />

                {/* SECOND COLUMN: Database Reference Details Container */}
                <DatabaseRegistry
                  activeCard={activeCard}
                  handleRandomizeSelectedCard={handleRandomizeSelectedCard}
                  recoveryResult={recoveryResult}
                  setSerialInput={setSerialInput}
                  setPinInput={setPinInput}
                  showToast={showToast}
                  copyToClipboard={copyToClipboard}
                  copiedSerial={copiedSerial}
                  copiedPin={copiedPin}
                  isPinUnmasked={isPinUnmasked}
                  setIsPinUnmasked={setIsPinUnmasked}
                  setAdminPasscode={setAdminPasscode}
                  setAdminError={setAdminError}
                  setShowAdminModal={setShowAdminModal}
                  formatPinWithPrivacyMask={formatPinWithPrivacyMask}
                />

              </div>

            </div>
          )}

          {/* VIEW 2: LIVE METRICS PLATFORM DASHBOARD */}
          {currentView === 'dashboard' && (
            <PlatformDashboard
              stats={stats}
              statsLoading={statsLoading}
              cards={cards}
              setCurrentView={setCurrentView}
            />
          )}

        </main>
      </div>

      {/* About Nexus Solutions Modal Overlay */}
      <AboutModal
        aboutOpen={aboutOpen}
        setAboutOpen={setAboutOpen}
      />

      {/* Admin Authorization Passcode Modal */}
      <AdminModal
        showAdminModal={showAdminModal}
        setShowAdminModal={setShowAdminModal}
        adminPasscode={adminPasscode}
        setAdminPasscode={setAdminPasscode}
        adminError={adminError}
        setAdminError={setAdminError}
        setIsAdminAuthorized={setIsAdminAuthorized}
        setIsPinUnmasked={setIsPinUnmasked}
        showToast={showToast}
      />

      {/* Footer Brand Identity */}
      <Footer />
    </div>
  );
}
