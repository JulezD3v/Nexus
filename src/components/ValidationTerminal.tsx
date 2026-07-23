import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  Camera,
  RefreshCw,
  Layers,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Coins,
  HelpCircle
} from 'lucide-react';
import { RecoveryResponse } from '../types';

interface ValidationTerminalProps {
  terminalMode: 'ussd' | 'vision';
  setTerminalMode: (mode: 'ussd' | 'vision') => void;
  serialInput: string;
  setSerialInput: (val: string) => void;
  pinInput: string;
  setPinInput: (val: string) => void;
  phoneInput: string;
  setPhoneInput: (val: string) => void;
  handleRecover: (e: React.FormEvent) => void;
  isRecovering: boolean;
  visionFile: File | null;
  setVisionFile: (file: File | null) => void;
  visionPreview: string | null;
  setVisionPreview: (preview: string | null) => void;
  handleVisionSubmit: (e: React.FormEvent) => void;
  recoveryResult: RecoveryResponse | null;
  formatPinWithHyphens: (pin: string) => string;
  handleClaim: () => void;
  isClaiming: boolean;
}

export const ValidationTerminal: React.FC<ValidationTerminalProps> = ({
  terminalMode,
  setTerminalMode,
  serialInput,
  setSerialInput,
  pinInput,
  setPinInput,
  phoneInput,
  setPhoneInput,
  handleRecover,
  isRecovering,
  visionFile,
  setVisionFile,
  visionPreview,
  setVisionPreview,
  handleVisionSubmit,
  recoveryResult,
  formatPinWithHyphens,
  handleClaim,
  isClaiming,
}) => {
  return (
    <section className="md:col-span-7 flex flex-col gap-6" id="simulator-section">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Header bar matching Database Reference Details card */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-bold text-slate-900 text-sm">Validation & Recovery Terminal</h2>
          </div>
          
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1.5 rounded-full uppercase border border-emerald-200/60 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Node Active</span>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          
          {/* Mode Toggle Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => setTerminalMode('ussd')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                terminalMode === 'ussd'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>USSD / Manual Input</span>
            </button>
            <button
              type="button"
              onClick={() => setTerminalMode('vision')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                terminalMode === 'vision'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-[#49B847]" />
              <span>Nexus Vision OCR</span>
            </button>
          </div>

          {terminalMode === 'ussd' ? (
            /* Validation Terminal Form (USSD/Manual) */
            <form onSubmit={handleRecover} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Serial Number Form Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Serial Number Input
                  </label>
                  <input
                    type="text"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
                    placeholder="e.g. S-7294018263"
                    className="w-full font-mono text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#49B847]/20 focus:border-[#49B847] outline-hidden transition text-slate-800"
                    required
                    id="input-serial"
                  />
                </div>

                {/* PIN Form Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Voucher PIN Input
                  </label>
                  <input
                    type="text"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="e.g. 8401-3?58-1?29-3?48"
                    className="w-full font-mono text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#49B847]/20 focus:border-[#49B847] outline-hidden transition text-slate-800"
                    required
                    id="input-pin"
                  />
                </div>
              </div>

              {/* Target Subscriber Phone input field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Target Subscriber Phone Line
                </label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. 0712345678"
                  className="w-full font-mono text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#49B847]/20 focus:border-[#49B847] outline-hidden transition text-slate-800"
                  required
                  id="input-phone"
                />
              </div>

              <button
                type="submit"
                disabled={isRecovering}
                className="w-full bg-[#49B847] hover:bg-[#3ca13a] active:scale-99 text-white text-xs font-bold py-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-75"
                id="btn-run-recovery"
              >
                {isRecovering ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Nexus Match Sequence...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Run Recovery Match</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Nexus Vision Image Upload Form */
            <form onSubmit={handleVisionSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#49B847] transition bg-slate-50/50">
                {visionPreview ? (
                  <div className="space-y-3">
                    <img
                      src={visionPreview}
                      alt="Scratch card voucher preview"
                      className="max-h-48 mx-auto rounded-xl shadow-xs border border-slate-200 object-contain"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 truncate max-w-xs">{visionFile?.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setVisionFile(null);
                          setVisionPreview(null);
                        }}
                        className="text-xs text-red-600 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#49B847]/10 text-[#49B847] flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Upload Voucher Scratch Card Photo</span>
                    <span className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP. Passed directly to <code>/api/v1/recover/vision</code>.</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setVisionFile(file);
                          setVisionPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isRecovering || !visionFile}
                className="w-full bg-[#49B847] hover:bg-[#3ca13a] active:scale-99 text-white text-xs font-bold py-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isRecovering ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Vision OCR Analysis...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Analyze Voucher with Vision AI</span>
                  </>
                )}
              </button>
            </form>
          )}

        {/* Validation Terminal Result Details */}
        <AnimatePresence mode="wait">
          {recoveryResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
              id="recovery-result-box"
            >
              <div className={`p-4 flex items-center justify-between ${
                recoveryResult.success ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200' : 'bg-red-50 text-red-900 border-b border-red-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  {recoveryResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-xs">
                      {recoveryResult.success ? 'Match Verification Successful' : 'Reconstruction Unsuccessful'}
                    </h4>
                    <p className="text-[11px] opacity-90">{recoveryResult.message}</p>
                  </div>
                </div>

                {recoveryResult.success && recoveryResult.recoveredPin && (
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-emerald-600 block">Reconstructed PIN</span>
                    <span className="font-mono font-bold text-emerald-800 text-sm tracking-wider" id="result-recovered-pin">
                      {formatPinWithHyphens(recoveryResult.recoveredPin)}
                    </span>
                  </div>
                )}
              </div>

              {recoveryResult.success && recoveryResult.card && (
                <div className="p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Matched Voucher Denomination:</span>
                    <span className="font-bold text-slate-900 text-sm">KES {recoveryResult.card.amount}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Target Subscriber Account:</span>
                    <span className="font-mono font-bold text-slate-800">{phoneInput || '0712345678'}</span>
                  </div>

                  {recoveryResult.card.status === 'used' ? (
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-center text-xs text-slate-600 font-semibold">
                      ✓ Airtime of KES {recoveryResult.card.amount} has been successfully credited to line {phoneInput || '0712345678'}.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClaim}
                      disabled={isClaiming}
                      className="w-full bg-[#49B847] hover:bg-[#3ca13a] text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                      id="btn-claim-airtime"
                    >
                      {isClaiming ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Crediting Airtime to Line...</span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4" />
                          <span>Load KES {recoveryResult.card.amount} Airtime</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {!recoveryResult.success && (
                <div className="p-4 bg-slate-50">
                  <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-100 flex items-start gap-2.5">
                    <HelpCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-900 leading-normal">
                      <span className="font-bold">Security Advice:</span>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Confirm that the Serial Number is accurate for the loaded test card.</li>
                        <li>Provide at least 6 intact digits so matching remains secure.</li>
                        <li>Use '?' or '*' to represent unreadable numbers so the AI model can match closest cards.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        </div>
      </div>
    </section>
  );
};
