import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers } from 'lucide-react';

interface AboutModalProps {
  aboutOpen: boolean;
  setAboutOpen: (open: boolean) => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ aboutOpen, setAboutOpen }) => {
  return (
    <AnimatePresence>
      {aboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Dark background modal trigger cover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setAboutOpen(false)}
            className="absolute inset-0 bg-black"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 overflow-hidden border border-slate-200"
          >
            <button
              onClick={() => setAboutOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#49B847]/10 flex items-center justify-center text-[#49B847]">
                <Layers className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">Safaricom Nexus Solution</h3>
                <p className="text-xs text-slate-500">Zuri Reconstruct Algorithm Suite</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <p>
                Safaricom <strong>Nexus</strong> is an innovative, high-fidelity algorithmic suite designed during the internal hackathon to safely reconstruct and validate scratched-off or overscratched airtime physical cards.
              </p>
              <p>
                Instead of calling customer support lines or tossing vouchers away, subscribers can rub and mask unreadable sections with the <code>?</code> placeholder symbol. Nexus verifies partial-mask sequences against hashed state representations without exposing complete keys, guaranteeing standard cryptographic safety bounds.
              </p>
              
              <div className="p-4 bg-[#49B847]/5 border border-[#49B847]/15 rounded-2xl">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#49B847]" />
                  <span>How to Test The Recovery Terminal</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li><strong>Character Masking</strong>: Use <code>?</code> or <code>*</code> for unreadable numbers so the AI model can match with closest cards.</li>
                  <li><strong>Serial Look-up</strong>: Matches the target serial key against registered vouchers first.</li>
                  <li><strong>Legibility Safeguard</strong>: Requires at least <strong>6 recognizable characters</strong> to prevent unauthorized brute force queries.</li>
                  <li><strong>Lock Mechanism</strong>: More than <strong>3 failed alignment queries</strong> locks the card out.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setAboutOpen(false)}
                className="w-full bg-[#49B847] hover:bg-[#3ca13a] text-white text-xs font-bold py-3 rounded-xl transition shadow-xs cursor-pointer"
              >
                Close & Continue Simulation
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
