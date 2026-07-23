import React from 'react';
import {
  Database,
  RefreshCw,
  Lock,
  Sparkles,
  Copy,
  Unlock,
  Calendar,
  Coins,
  AlertTriangle
} from 'lucide-react';
import { ScratchCard, RecoveryResponse } from '../types';

interface DatabaseRegistryProps {
  activeCard: ScratchCard | undefined;
  handleRandomizeSelectedCard: () => void;
  recoveryResult: RecoveryResponse | null;
  setSerialInput: (val: string) => void;
  setPinInput: (val: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  copyToClipboard: (text: string, type: 'serial' | 'pin') => void;
  copiedSerial: boolean;
  copiedPin: boolean;
  isPinUnmasked: boolean;
  setIsPinUnmasked: (unmasked: boolean) => void;
  setAdminPasscode: (val: string) => void;
  setAdminError: (val: string) => void;
  setShowAdminModal: (show: boolean) => void;
  formatPinWithPrivacyMask: (pin: string, showUnmasked?: boolean) => string;
}

export const DatabaseRegistry: React.FC<DatabaseRegistryProps> = ({
  activeCard,
  handleRandomizeSelectedCard,
  recoveryResult,
  setSerialInput,
  setPinInput,
  showToast,
  copyToClipboard,
  copiedSerial,
  copiedPin,
  isPinUnmasked,
  setIsPinUnmasked,
  setAdminPasscode,
  setAdminError,
  setShowAdminModal,
  formatPinWithPrivacyMask,
}) => {
  return (
    <section className="md:col-span-5 flex flex-col gap-6" id="registry-section">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Header with Randomize/Next Card button */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-4.5 h-4.5 text-slate-500" />
            <h2 className="font-display font-bold text-slate-900 text-sm">Database Reference Details</h2>
          </div>
          
          <button
            onClick={handleRandomizeSelectedCard}
            className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-600 active:scale-95 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition border border-slate-200 shadow-xs"
            title="Randomize Test Card"
            id="btn-randomize"
          >
            <RefreshCw className="w-3 h-3 text-[#49B847]" />
            <span>Next Card</span>
          </button>
        </div>

        {!recoveryResult ? (
          /* Standby state when user hasn't submitted/executed recovery in terminal */
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-200 shadow-2xs">
              <Lock className="w-6 h-6 text-slate-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Database Reference Details Hidden</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Input the required <strong>Serial Number</strong> and <strong>Voucher PIN</strong> in the Validation & Recovery Terminal and click <strong>Execute Voucher Recovery</strong> to query and reveal database details.
              </p>
            </div>

            {activeCard && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSerialInput(activeCard.serialNumber);
                    const truePin = activeCard.voucherPin.replace(/[\s-]/g, '');
                    if (truePin.length >= 16) {
                      const sampleMasked = `${truePin.slice(0, 4)}-${truePin.slice(4, 5)}?${truePin.slice(6, 8)}-${truePin.slice(8, 10)}?${truePin.slice(11, 12)}-${truePin.slice(12, 14)}?${truePin.slice(15)}`;
                      setPinInput(sampleMasked);
                    } else {
                      setPinInput(activeCard.voucherPin);
                    }
                    showToast('Loaded test voucher inputs into Terminal!', 'info');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#49B847]" />
                  <span>Load Test Inputs into Terminal</span>
                </button>
              </div>
            )}
          </div>
        ) : recoveryResult.card || activeCard ? (
          /* Show card details once recovery query is executed */
          (() => {
            const cardToShow = recoveryResult.card || activeCard!;
            return (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Matched Database Record
                  </span>
                  
                  {/* Card Status display */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500">Status:</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-xs ${
                      cardToShow.status === 'unused'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : cardToShow.status === 'used'
                        ? 'bg-slate-200 text-slate-700 border border-slate-300'
                        : 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                    }`} id="badge-registry-status">
                      {cardToShow.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  
                  {/* Serial Number Block */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 shadow-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Serial Number</p>
                      <p className="font-mono font-bold text-slate-900 text-sm mt-0.5" id="ref-serial">
                        {cardToShow.serialNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cardToShow.serialNumber, 'serial')}
                      className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition duration-150 cursor-pointer"
                      title="Copy Serial to Clipboard"
                      id="btn-copy-ref-serial"
                    >
                      <Copy className={`w-3.5 h-3.5 ${copiedSerial ? 'text-emerald-500' : ''}`} />
                    </button>
                  </div>

                  {/* True Voucher PIN Row with Data Privacy (GDPR) Masking */}
                  {(() => {
                    const isRevealed = isPinUnmasked;
                    const pinDisplay = formatPinWithPrivacyMask(cardToShow.voucherPin, isRevealed);
                    const rawPin = isRevealed ? cardToShow.voucherPin : formatPinWithPrivacyMask(cardToShow.voucherPin, false);

                    return (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 shadow-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">True PIN (Database Record)</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Click to Reveal Admin Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isPinUnmasked) {
                                  setIsPinUnmasked(false);
                                } else {
                                  setAdminPasscode('');
                                  setAdminError('');
                                  setShowAdminModal(true);
                                }
                              }}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition duration-150 flex items-center gap-1.5 cursor-pointer select-none ${
                                isRevealed
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                              title="Click to Reveal full PIN (Admin Passcode Required)"
                            >
                              {isRevealed ? (
                                <>
                                  <Unlock className="w-3 h-3 text-amber-600" />
                                  <span>Mask PIN</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 text-slate-500" />
                                  <span>Reveal (Admin)</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => copyToClipboard(rawPin, 'pin')}
                              className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition duration-150 cursor-pointer"
                              title="Copy PIN to Clipboard"
                              id="btn-copy-ref-pin"
                            >
                              <Copy className={`w-3.5 h-3.5 ${copiedPin ? 'text-emerald-500' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="font-mono font-bold text-[#49B847] text-sm tracking-wider" id="ref-pin">
                            {pinDisplay}
                          </p>
                          <span className="text-[10px] text-slate-400 italic">
                            {isRevealed ? 'Unmasked (Admin Mode Active)' : 'Middle digits redacted for data privacy'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Grid with Expiry & Denomination Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Voucher Expiry</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{cardToShow.expiryDate}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2.5">
                      <Coins className="w-4 h-4 text-[#49B847]" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Airtime Amount</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">KES {cardToShow.amount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Batch ID & Region */}
                  {(cardToShow.batchId || cardToShow.region) && (
                    <div className="grid grid-cols-2 gap-3">
                      {cardToShow.batchId && (
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Batch ID</span>
                          <span className="font-mono font-semibold text-slate-700">{cardToShow.batchId}</span>
                        </div>
                      )}
                      {cardToShow.region && (
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Region</span>
                          <span className="font-semibold text-slate-700">{cardToShow.region}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Test Note / Banner if provided */}
                  {cardToShow.note && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-xl text-xs font-medium">
                      <span className="font-bold text-amber-900 uppercase text-[9px] block mb-0.5">Test Case Note</span>
                      {cardToShow.note}
                    </div>
                  )}

                  {/* Alert if attempts have failed */}
                  {cardToShow.failedAttempts > 0 && (
                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      cardToShow.status === 'flagged' 
                        ? 'bg-red-50 border-red-200 text-red-800' 
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold">Failed Reconstruction Matches</p>
                        <p className="mt-0.5">
                          {cardToShow.failedAttempts} / 3 match attempts made.
                          {cardToShow.status === 'flagged' ? ' Voucher is permanently locked.' : ' Too many mismatches will trigger card lock.'}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })()
        ) : (
          /* No card found state */
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500 border border-red-200 shadow-2xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">No Database Record Matched</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                No voucher record in the database matched the submitted Serial Number and PIN parameters.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
