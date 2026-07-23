import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs">
      <div className="max-w-7xl mx-auto px-4 space-y-2">
        <p className="font-semibold text-slate-300">Safaricom Internal Hackathon 2026 • Card Recovery Solution (Nexus)</p>
        <p className="text-slate-500 text-[11px]">
          Designed with elite UX/UI design patterns matching the Safaricom Green identity. Full-stack TypeScript sandbox.
        </p>
      </div>
    </footer>
  );
};
