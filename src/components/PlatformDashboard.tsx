import React, { useMemo } from 'react';
import {
  Layers,
  Database,
  Unlock,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { ScratchCard, StatsData } from '../types';

interface PlatformDashboardProps {
  stats: StatsData | null;
  statsLoading: boolean;
  cards: ScratchCard[];
  setCurrentView: (view: 'terminal' | 'dashboard') => void;
}

export const PlatformDashboard: React.FC<PlatformDashboardProps> = ({
  stats,
  statsLoading,
  cards,
  setCurrentView,
}) => {
  const computedStats = useMemo<StatsData>(() => {
    const totalCards = cards.length;
    const unusedCards = cards.filter(c => c.status === 'unused').length;
    const usedCards = cards.filter(c => c.status === 'used').length;
    const flaggedCards = cards.filter(c => c.status === 'flagged').length;
    const totalUnusedValue = cards
      .filter(c => c.status === 'unused')
      .reduce((sum, c) => sum + c.amount, 0);
    const totalClaimedValue = cards
      .filter(c => c.status === 'used')
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
      userWallet: stats?.userWallet ?? 0
    };
  }, [cards, stats?.userWallet]);

  const displayStats = stats ?? computedStats;

  return (
    <div className="space-y-8">
      
      {/* Back to Recovery Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl tracking-tight text-slate-900">Platform Analytics</h2>
          <p className="text-xs text-slate-500">Real-time statistics retrieved dynamically from the backend node</p>
        </div>
        <button
          onClick={() => setCurrentView('terminal')}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 transition"
        >
          <Layers className="w-3.5 h-3.5 text-[#49B847]" />
          <span>Back to Terminal</span>
        </button>
      </div>

      {/* Loader indicator */}
      {statsLoading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl h-28 animate-pulse"></div>
          ))}
        </div>
      ) : (
        stats && (
          <div className="space-y-8">
            
            {/* Live Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Total Registered Cards */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="bg-slate-100 text-slate-600 p-3.5 rounded-xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Vouchers</p>
                  <p className="text-2xl font-display font-bold text-slate-900">{stats.totalCards}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Database Registry</p>
                </div>
              </div>

              {/* Unused/Available airtime */}
              <div className="bg-white border border-[#49B847]/20 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="bg-[#49B847]/10 text-[#49B847] p-3.5 rounded-xl">
                  <Unlock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unused Cards</p>
                  <p className="text-2xl font-display font-bold text-[#49B847]">{stats.unusedCards}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Value: KES {stats.totalUnusedValue}</p>
                </div>
              </div>

              {/* Claimed value */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Claimed/Loaded</p>
                  <p className="text-2xl font-display font-bold text-blue-700">{stats.usedCards}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Value KES: {stats.totalClaimedValue}</p>
                </div>
              </div>

              {/* Flagged/Blocked cards */}
              <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="bg-red-50 text-red-600 p-3.5 rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flagged/Locked</p>
                  <p className="text-2xl font-display font-bold text-red-600">{stats.flaggedCards}</p>
                  <p className="text-[10px] text-red-500 mt-0.5">{stats.totalFailedAttempts} total query faults</p>
                </div>
              </div>

            </div>

            {/* Simple distribution bar chart */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 text-sm mb-4">Voucher Registry Distribution Status</h3>
              
              <div className="space-y-4">
                <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${(stats.unusedCards / stats.totalCards) * 100}%` }}
                    className="bg-[#49B847] h-full"
                    title={`Unused Vouchers: ${stats.unusedCards}`}
                  />
                  <div 
                    style={{ width: `${(stats.usedCards / stats.totalCards) * 100}%` }}
                    className="bg-blue-500 h-full"
                    title={`Claimed Vouchers: ${stats.usedCards}`}
                  />
                  <div 
                    style={{ width: `${(stats.flaggedCards / stats.totalCards) * 100}%` }}
                    className="bg-red-500 h-full"
                    title={`Flagged Vouchers: ${stats.flaggedCards}`}
                  />
                </div>

                {/* Chart Legend Labels */}
                <div className="flex flex-wrap gap-6 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#49B847]" />
                    <span>Unused Vouchers (Active): <strong>{stats.unusedCards}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                    <span>Redeemed Vouchers: <strong>{stats.usedCards}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500" />
                    <span>Flagged/Suspicious Vouchers: <strong>{stats.flaggedCards}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Cards Audit Log Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-900 text-sm">System Database Record Audit</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-md">
                  Live Central Log
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Serial Key</th>
                      <th className="px-6 py-3">True PIN String</th>
                      <th className="px-6 py-3">Amount (KES)</th>
                      <th className="px-6 py-3">Status Badge</th>
                      <th className="px-6 py-3">Failed Logs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cards.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3.5 font-mono font-bold text-slate-800">{c.serialNumber}</td>
                        <td className="px-6 py-3.5 font-mono text-slate-500 tracking-wider">
                          {c.voucherPin.substring(0, 4)} - **** - **** - {c.voucherPin.substring(12, 16)}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-slate-900">KES {c.amount}</td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            c.status === 'unused' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : c.status === 'used'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-600">{c.failedAttempts} / 3 attempts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )
      )}

    </div>
  );
};
