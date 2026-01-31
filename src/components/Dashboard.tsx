'use client';

import { motion } from 'framer-motion';
import { TreePine, Droplets, Wind, Leaf, Flower2, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

interface DashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Dashboard({ isOpen, onClose }: DashboardProps) {
    const { logs, totalCo2, totalWater } = useStore();

    return (
        <div className="h-full w-full overflow-y-auto pb-safe bg-void-black text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-void-black/95 backdrop-blur-xl px-6 pt-8 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Eco Garden</h1>
                    <p className="text-white/50 text-sm">Your environmental impact journey</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Close dashboard"
                >
                    <X size={20} className="text-white" />
                </button>
            </div>

            <div className="px-6 pb-28">
                {/* Growth Garden Visualization */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-56 w-full bg-gradient-to-br from-gray-900 to-[#0a1f1c] rounded-[32px] border border-white/5 overflow-hidden mb-8 shadow-2xl flex items-center justify-center"
                >
                    {/* Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-green-500/20 blur-[60px] rounded-full" />

                    {/* The Tree/Plant */}
                    <div className="relative z-10 text-center">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 100 }}
                            className="inline-flex p-5 bg-white/10 rounded-full mb-4 border border-white/10 backdrop-blur-md"
                        >
                            {logs.length > 5 ? (
                                <TreePine size={56} className="text-green-400 drop-shadow-[0_0_20px_rgba(46,213,115,0.5)]" />
                            ) : (
                                <Flower2 size={56} className="text-green-400/80" />
                            )}
                        </motion.div>
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {logs.length}
                        </div>
                        <div className="text-xs text-white/50 uppercase tracking-widest mt-1">
                            Items Logged
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/5 p-5 rounded-2xl border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-3 text-white/50 text-xs font-medium uppercase tracking-widest">
                            <Wind size={14} /> CO₂ Tracked
                        </div>
                        <div className="text-3xl font-light text-white">
                            {totalCo2.toFixed(1)}<span className="text-base opacity-50 ml-1">kg</span>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white/5 p-5 rounded-2xl border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-3 text-white/50 text-xs font-medium uppercase tracking-widest">
                            <Droplets size={14} /> Water Used
                        </div>
                        <div className="text-3xl font-light text-white">
                            {totalWater.toFixed(0)}<span className="text-base opacity-50 ml-1">L</span>
                        </div>
                    </motion.div>
                </div>

                {/* Activity Ledger */}
                <h3 className="text-white font-semibold text-lg mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {logs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 border border-dashed border-white/10 rounded-2xl"
                        >
                            <Leaf size={40} className="mx-auto mb-4 text-white/20" />
                            <p className="text-white/40">No data yet</p>
                            <p className="text-white/25 text-sm mt-1">Scan items to grow your garden</p>
                        </motion.div>
                    ) : (
                        logs.slice().reverse().map((log, index) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5 hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center">
                                        <Leaf size={18} className="text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-white">{log.name}</div>
                                        <div className="text-[11px] text-white/40">{format(new Date(log.date), 'MMM d, h:mm a')}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-white">{log.co2}kg CO₂</div>
                                    <div className="text-[11px] text-blue-400">{log.water}L H₂O</div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
