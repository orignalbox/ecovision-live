'use client';

import { motion } from 'framer-motion';
import { X, TreePine, Droplets, Wind } from 'lucide-react';
import { useStore } from '@/store/useStore';
import clsx from 'clsx';
import { format } from 'date-fns';

interface DashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Dashboard({ isOpen, onClose }: DashboardProps) {
    const { logs, totalCo2, totalWater } = useStore();

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-ozone-white z-50 flex flex-col"
        >
            {/* Header */}
            <div className="p-6 flex justify-between items-center bg-white shadow-sm">
                <h1 className="text-2xl font-bold text-carbon-grey">My Eco Garden</h1>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                    <X size={24} className="text-gray-600" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* Garden Visualization (Mock) */}
                <div className="bg-gradient-to-b from-blue-50 to-emerald-50 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-block p-4 bg-white/50 backdrop-blur-md rounded-full mb-4 shadow-lg">
                            <TreePine size={48} className="text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-1">Your Impact is Growing</h2>
                        <p className="text-sm text-gray-500">You've tracked {logs.length} items this month.</p>
                    </div>

                    {/* Abstract blobs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <Wind size={14} /> Total CO₂
                        </div>
                        <div className="text-3xl font-bold text-carbon-grey">{totalCo2.toFixed(1)}<span className="text-sm font-normal text-gray-400 ml-1">kg</span></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <Droplets size={14} /> Water
                        </div>
                        <div className="text-3xl font-bold text-carbon-grey">{totalWater.toFixed(0)}<span className="text-sm font-normal text-gray-400 ml-1">L</span></div>
                    </div>
                </div>

                {/* Recent Logs (The Ledger) */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-4 text-lg">Recent History</h3>
                    <div className="space-y-3">
                        {logs.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No scans yet. Start identifying items!</p>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-gray-800">{log.name}</div>
                                        <div className="text-xs text-gray-400">{format(new Date(log.date), 'MMM d, h:mm a')}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-carbon-grey">+{log.co2}kg</div>
                                        {log.savings && <div className="text-xs text-chlorophyll-green font-medium">{log.savings}</div>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
