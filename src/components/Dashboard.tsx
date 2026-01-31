'use client';

import { motion } from 'framer-motion';
import { TreePine, Droplets, Wind, Leaf, Flower2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

interface DashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Dashboard({ isOpen, onClose }: DashboardProps) {
    const { logs, totalCo2, totalWater } = useStore();

    return (
        <div className="h-full w-full overflow-y-auto pb-24 p-6 pt-12 bg-void-black text-white">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-light text-white mb-1">Eco Garden</h1>
                <p className="text-white/50 text-sm">Your net-positive impact this month.</p>
            </div>

            {/* 1. Growth Garden Visualization */}
            <div className="relative h-64 w-full bg-gradient-to-tr from-void-black to-[#0a1f1c] rounded-[40px] border border-white/5 overflow-hidden mb-8 shadow-2xl flex items-center justify-center">
                {/* Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-life-green/10 blur-[60px] rounded-full animate-pulse-slow" />

                {/* The Tree (Grows with logs) */}
                <div className="relative z-10 text-center">
                    <motion.div
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        className="inline-flex p-6 bg-glass-white rounded-full mb-4 border border-white/10 backdrop-blur-md"
                    >
                        {logs.length > 5 ? (
                            <TreePine size={64} className="text-life-green drop-shadow-[0_0_15px_rgba(46,213,115,0.5)]" />
                        ) : (
                            <Flower2 size={64} className="text-life-green/80" />
                        )}
                    </motion.div>
                    <div className="text-2xl font-bold text-white tracking-tight">
                        {logs.length} <span className="text-sm font-normal text-white/50">Items Logged</span>
                    </div>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-glass-white p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        <Wind size={12} /> Total Emissions
                    </div>
                    <div className="text-3xl font-light text-white">{totalCo2.toFixed(1)}<span className="text-sm opacity-50 ml-1">kg</span></div>
                </div>
                <div className="bg-glass-white p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        <Droplets size={12} /> Water Usage
                    </div>
                    <div className="text-3xl font-light text-white">{totalWater.toFixed(0)}<span className="text-sm opacity-50 ml-1">L</span></div>
                </div>
            </div>

            {/* 3. The Ledger */}
            <h3 className="text-white font-light mb-4">Latest Activity</h3>
            <div className="space-y-3">
                {logs.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                        <p className="text-white/30">No Data. Scan items to grow your garden.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="bg-glass-white p-4 rounded-2xl flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                    {log.savings ? <Leaf size={16} className="text-life-green" /> : <Wind size={16} className="text-alert-amber" />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{log.name}</div>
                                    <div className="text-[10px] text-white/40">{format(new Date(log.date), 'MMM d, h:mm a')}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-white">+{log.co2}kg</div>
                                {log.savings && <div className="text-[10px] text-life-green font-bold">{log.savings}</div>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
