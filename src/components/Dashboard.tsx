'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Leaf, Clock, Flame, Wallet, Package, Car, Zap, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

interface DashboardProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function Dashboard({ onClose }: DashboardProps) {
    const { logs, totalCo2, totalWater, scanStreak, totalScans, reset } = useStore();

    // Calculate equivalencies
    const moneySaved = Math.round(totalScans * 45); // Rough estimate: ₹45 per conscious decision
    const treesEquiv = (totalCo2 / 21).toFixed(1); // 1 tree = ~21kg CO2/year
    const hoursSaved = Math.round(totalScans * 0.15 * 10) / 10; // 9 min average saved per scan
    const caloriesBurned = Math.round(totalScans * 50); // Walking equiv

    const handleClearHistory = () => {
        if (confirm('Clear all history? This cannot be undone.')) {
            reset();
        }
    };

    return (
        <div className="min-h-full bg-[#0A0A0B] text-white">
            {/* Header */}
            <div className="px-6 pt-8 pb-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold tracking-tight">True Cost Report</h1>
                    <div className="flex items-center gap-1.5 text-orange-400 font-bold bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 text-sm">
                        <Flame size={14} className="fill-orange-500" />
                        <span>{scanStreak}</span>
                    </div>
                </div>
                <p className="text-white/40 text-sm">Your lifetime of better choices</p>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 pb-24 space-y-6">
                {/* Hero Stat */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-500/15 via-green-500/5 to-transparent border border-green-500/20 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 text-green-400/80 text-xs uppercase tracking-wider mb-2">
                        <TrendingUp size={14} />
                        Estimated Savings
                    </div>
                    <div className="text-4xl font-bold text-green-400 mb-1">
                        ₹{moneySaved.toLocaleString()}
                    </div>
                    <p className="text-sm text-white/40">
                        From {totalScans} conscious decisions
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon={<Wallet size={18} />}
                        label="Money"
                        value={`₹${moneySaved}`}
                        subtitle="saved"
                        color="green"
                    />
                    <StatCard
                        icon={<Clock size={18} />}
                        label="Time"
                        value={`${hoursSaved}h`}
                        subtitle="saved"
                        color="blue"
                    />
                    <StatCard
                        icon={<Leaf size={18} />}
                        label="Carbon"
                        value={`${totalCo2}kg`}
                        subtitle={`= ${treesEquiv} trees`}
                        color="emerald"
                    />
                    <StatCard
                        icon={<Flame size={18} />}
                        label="Health"
                        value={`${caloriesBurned}`}
                        subtitle="calories burned"
                        color="orange"
                    />
                </div>

                {/* Breakdown by Category */}
                <div>
                    <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
                        Where you saved
                    </h2>
                    <div className="space-y-2">
                        <CategoryRow
                            icon={<Package size={16} />}
                            label="Product scans"
                            value={totalScans}
                            color="purple"
                        />
                        <CategoryRow
                            icon={<Car size={16} />}
                            label="Transport decisions"
                            value={Math.round(totalScans * 0.3)}
                            color="blue"
                        />
                        <CategoryRow
                            icon={<Zap size={16} />}
                            label="Energy calculations"
                            value={Math.round(totalScans * 0.2)}
                            color="yellow"
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                {logs.length > 0 && (
                    <div>
                        <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
                            Recent scans
                        </h2>
                        <div className="space-y-2">
                            {logs.slice(0, 5).map((log, index) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${log.ecoScore === 'A' ? 'bg-green-500/20 text-green-400' :
                                                log.ecoScore === 'B' ? 'bg-lime-500/20 text-lime-400' :
                                                    log.ecoScore === 'C' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        log.ecoScore === 'D' ? 'bg-orange-500/20 text-orange-400' :
                                                            'bg-red-500/20 text-red-400'
                                            }`}>
                                            {log.ecoScore || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white line-clamp-1">{log.name}</p>
                                            <p className="text-xs text-white/30">{format(new Date(log.scannedAt), 'MMM d, h:mm a')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-white/40">
                                        {log.co2}kg CO₂
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Clear History */}
                <button
                    onClick={handleClearHistory}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm text-white/30 hover:text-red-400 transition-colors"
                >
                    <Trash2 size={14} />
                    Clear History
                </button>
            </div>
        </div>
    );
}

// Components
function StatCard({ icon, label, value, subtitle, color }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtitle: string;
    color: 'green' | 'blue' | 'emerald' | 'orange';
}) {
    const colors = {
        green: 'text-green-400',
        blue: 'text-blue-400',
        emerald: 'text-emerald-400',
        orange: 'text-orange-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
        >
            <div className={`flex items-center gap-1.5 text-xs text-white/40 mb-2 ${colors[color]}`}>
                {icon}
                <span className="text-white/40">{label}</span>
            </div>
            <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
            <div className="text-xs text-white/30 mt-0.5">{subtitle}</div>
        </motion.div>
    );
}

function CategoryRow({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: 'purple' | 'blue' | 'yellow';
}) {
    const colors = {
        purple: 'bg-purple-500/10 text-purple-400',
        blue: 'bg-blue-500/10 text-blue-400',
        yellow: 'bg-yellow-500/10 text-yellow-400',
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
                <span className="text-sm text-white/70">{label}</span>
            </div>
            <span className="text-sm font-semibold text-white">{value}</span>
        </div>
    );
}
