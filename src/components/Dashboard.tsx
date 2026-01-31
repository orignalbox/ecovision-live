'use client';

import { motion } from 'framer-motion';
import { TreePine, Droplets, Wind, Leaf, Flower2, Flame, Award, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

interface DashboardProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function Dashboard({ onClose }: DashboardProps) {
    const { logs, totalCo2, totalWater, scanStreak, totalScans, reset } = useStore();

    // Equivalency calculations (approximate)
    const treesSaved = Math.max(0, (totalCo2 / 21)); // 1 tree absorbs ~21kg CO2/year
    const showersSaved = Math.max(0, (totalWater / 65)); // 1 shower ~ 65L

    const handleClearHistory = () => {
        if (confirm('Are you sure you want to clear your history? This cannot be undone.')) {
            reset();
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-void-black text-white">
            {/* Fixed Header with Streak */}
            <div className="flex-shrink-0 px-6 pt-8 pb-4 bg-void-black flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Impact Garden</h1>
                    <p className="text-white/50 text-sm">Your lifetime environmental savings</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-orange-400 font-bold bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                        <Flame size={16} className="fill-orange-500" />
                        <span>{scanStreak}</span>
                    </div>
                    <span className="text-[10px] text-white/30 font-medium mt-1 uppercase tracking-wide">Day Streak</span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {/* Hero Visualization - "The Garden" */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full bg-gradient-to-br from-gray-900 to-[#0a1f1c] rounded-[32px] border border-white/5 overflow-hidden mb-6 p-6"
                >
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="inline-flex p-5 bg-white/5 rounded-full mb-4 border border-white/5 shadow-2xl relative group">
                            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                            {totalCo2 > 100 ? (
                                <TreePine size={64} className="text-green-400 relative z-10" />
                            ) : (
                                <Flower2 size={64} className="text-green-400/80 relative z-10" />
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-1">
                            {treesSaved < 1
                                ? "Seedling Phase"
                                : `${treesSaved.toFixed(1)} Trees Planted`}
                        </h2>
                        <p className="text-white/50 text-xs max-w-[200px]">
                            {treesSaved < 1
                                ? `Save ${21 - totalCo2}kg more CO₂ to grow your first virtual tree!`
                                : "Based on your carbon avoidance equivalents."}
                        </p>
                    </div>

                    {/* Quick Stats Row inside Hero */}
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                        <div className="text-center">
                            <div className="text-2xl font-light text-white">{totalScans}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest">Total Scans</div>
                        </div>
                        <div className="text-center border-l border-white/5">
                            <div className="text-2xl font-light text-white">{showersSaved.toFixed(0)}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest">Showers Saved</div>
                        </div>
                    </div>
                </motion.div>

                {/* Detailed Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-3 text-white/50 text-xs font-medium uppercase tracking-wide">
                            <Wind size={14} className="text-blue-400" /> Carbon
                        </div>
                        <div className="text-3xl font-light text-white">
                            {totalCo2.toFixed(1)}<span className="text-sm opacity-50 ml-1">kg</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-3 text-white/50 text-xs font-medium uppercase tracking-wide">
                            <Droplets size={14} className="text-cyan-400" /> Water
                        </div>
                        <div className="text-3xl font-light text-white">
                            {totalWater.toFixed(0)}<span className="text-sm opacity-50 ml-1">L</span>
                        </div>
                    </motion.div>
                </div>

                {/* Activity Ledger */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <Award size={18} className="text-yellow-400" /> Recent Impact
                    </h3>
                    <button
                        onClick={handleClearHistory}
                        className="text-white/20 hover:text-red-400 transition-colors p-2"
                        aria-label="Clear History"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className="space-y-3 pb-20">
                    {logs.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <Leaf size={32} className="mx-auto mb-4 text-white/20" />
                            <p className="text-white/50 text-sm font-medium">Your garden is empty</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 bg-life-green text-black font-bold rounded-full text-sm hover:scale-105 transition-transform"
                            >
                                Start Scanning
                            </button>
                        </div>
                    ) : (
                        [...logs].reverse().map((log, index) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-glass-white p-4 rounded-2xl flex justify-between items-center border border-white/5 group hover:border-white/20 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                                        <Leaf size={16} className="text-life-green" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white group-hover:text-life-green transition-colors">{log.name}</div>
                                        <div className="text-[10px] text-white/40">{format(new Date(log.date), 'MMM d, h:mm a')}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-white">{log.co2}kg CO₂</div>
                                    <div className="text-[10px] text-cyan-400">{log.water}L water</div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
