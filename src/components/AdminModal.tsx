import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, Unlock } from 'lucide-react';

interface AdminModalProps {
  showAdminModal: boolean;
  setShowAdminModal: (show: boolean) => void;
  adminPasscode: string;
  setAdminPasscode: (val: string) => void;
  adminError: string;
  setAdminError: (val: string) => void;
  setIsAdminAuthorized: (val: boolean) => void;
  setIsPinUnmasked: (val: boolean) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  showAdminModal,
  setShowAdminModal,
  adminPasscode,
  setAdminPasscode,
  adminError,
  setAdminError,
  setIsAdminAuthorized,
  setIsPinUnmasked,
  showToast,
}) => {
  return (
    <AnimatePresence>
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200/60">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-sm">Admin Access Required</h3>
                  <p className="text-[11px] text-slate-500">GDPR Data Protection & Privacy Guard</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminError('');
                  setAdminPasscode('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Database voucher PINs are masked by default (e.g. <code>8401-****-****-3948</code>) to adhere to Data Protection laws. Enter Admin Passcode to unmask true keys.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (adminPasscode === '1234' || adminPasscode.trim().toLowerCase() === 'admin') {
                  setIsAdminAuthorized(true);
                  setIsPinUnmasked(true);
                  setShowAdminModal(false);
                  setAdminPasscode('');
                  setAdminError('');
                  showToast('Admin Access Granted: Unmasked PINs revealed.', 'success');
                } else {
                  setAdminError('Invalid Passcode. Default passcode is 1234.');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Enter Admin Passcode
                </label>
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => {
                    setAdminPasscode(e.target.value);
                    setAdminError('');
                  }}
                  placeholder="Enter passcode (Demo: 1234)"
                  className="w-full font-mono text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#49B847]/20 focus:border-[#49B847] outline-hidden transition text-slate-800"
                  autoFocus
                />
                {adminError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1.5">{adminError}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4 text-[#49B847]" />
                  <span>Authorize Admin Access</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
