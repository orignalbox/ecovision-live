'use client';

import { motion } from 'framer-motion';
import { TreePine, Droplets, Wind, Leaf, Flower2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

interface DashboardProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function Dashboard({ onClose }: DashboardProps) {
    const { logs, totalCo2, totalWater } = useStore();

    return (
        <div className="h-full w-full flex flex-col bg-void-black text-white">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 pt-8 pb-4 bg-void-black">
                <h1 className="text-3xl font-bold text-white mb-1">Eco Garden</h1>
                <p className="text-white/50 text-sm">Your environmental impact journey</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {/* Growth Garden Visualization */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-48 w-full bg-gradient-to-br from-gray-900 to-[#0a1f1c] rounded-[28px] border border-white/5 overflow-hidden mb-6 flex items-center justify-center"
                >
                    {/* Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/20 blur-[50px] rounded-full" />

                    {/* The Tree/Plant */}
                    <div className="relative z-10 text-center">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 100 }}
                            className="inline-flex p-4 bg-white/10 rounded-full mb-3 border border-white/10"
                        >
                            {logs.length > 5 ? (
                                <TreePine size={48} className="text-green-400" />
                            ) : (
                                <Flower2 size={48} className="text-green-400/80" />
                            )}
                        </motion.div>
                        <div className="text-2xl font-bold text-white">
                            {logs.length}
                        </div>
                        <div className="text-xs text-white/50 uppercase tracking-widest">
                            Items Logged
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 p-4 rounded-2xl border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-2 text-white/50 text-xs font-medium uppercase tracking-wide">
                            <Wind size={12} /> CO₂ Tracked
                        </div>
                        <div className="text-2xl font-light text-white">
                            {totalCo2.toFixed(1)}<span className="text-sm opacity-50 ml-1">kg</span>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white/5 p-4 rounded-2xl border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-2 text-white/50 text-xs font-medium uppercase tracking-wide">
                            <Droplets size={12} /> Water Used
                        </div>
                        <div className="text-2xl font-light text-white">
                            {totalWater.toFixed(0)}<span className="text-sm opacity-50 ml-1">L</span>
                        </div>
                    </motion.div>
                </div>

                {/* Activity Ledger */}
                <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2">
                    {logs.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                            <Leaf size={32} className="mx-auto mb-3 text-white/20" />
                            <p className="text-white/40 text-sm">No data yet</p>
                            <p className="text-white/25 text-xs mt-1">Scan items to grow your garden</p>
                        </div>
                    ) : (
                        [...logs].reverse().map((log, index) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                                        <Leaf size={14} className="text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{log.name}</div>
                                        <div className="text-[10px] text-white/40">{format(new Date(log.date), 'MMM d, h:mm a')}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-medium text-white">{log.co2}kg CO₂</div>
                                    <div className="text-[10px] text-blue-400">{log.water}L</div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
