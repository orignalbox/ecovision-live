'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Leaf, Wind } from 'lucide-react';
import clsx from 'clsx';

interface PlanetReceiptProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        name: string;
        co2: number; // kg
        water: number; // L
        bio: number; // Score 0-100
        alternatives: Array<{ name: string; savings: string }>;
    } | null;
    onLog: () => void;
}

export default function PlanetReceipt({ isOpen, onClose, data, onLog }: PlanetReceiptProps) {
    if (!data) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-ozone-white rounded-t-3xl p-6 z-40 max-h-[85vh] overflow-y-auto shadow-2xl"
                    >
                        {/* Handle Bar */}
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-carbon-grey">{data.name}</h2>
                                <p className="text-gray-500 text-sm">Identified via AI Vision</p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Main Score (Heatmap Color Logic) */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 text-center">
                            <p className="text-gray-500 uppercase text-xs font-semibold tracking-wider mb-2">Total Carbon Spend</p>
                            <div className={clsx(
                                "text-5xl font-bold mb-1",
                                data.co2 > 5 ? "text-warning-amber" : "text-chlorophyll-green"
                            )}>
                                +{data.co2}
                                <span className="text-lg font-normal text-gray-400 ml-1">kg</span>
                            </div>
                            <p className="text-sm text-gray-400">CO₂ Equivalent</p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-blue-50/50 p-4 rounded-xl flex flex-col items-center">
                                <Droplets className="text-blue-500 mb-2" />
                                <span className="text-2xl font-bold text-gray-800">{data.water}L</span>
                                <span className="text-xs text-gray-500">Water Used</span>
                            </div>
                            <div className="bg-emerald-50/50 p-4 rounded-xl flex flex-col items-center">
                                <Leaf className="text-emerald-500 mb-2" />
                                <span className="text-2xl font-bold text-gray-800">{data.bio}/100</span>
                                <span className="text-xs text-gray-500">Biodiversity</span>
                            </div>
                        </div>

                        {/* Eco-Swap Carousel */}
                        <div className="mb-8">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Wind size={18} className="text-chlorophyll-green" />
                                Smarter Swaps
                            </h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                                {data.alternatives.map((alt, i) => (
                                    <div key={i} className="min-w-[200px] bg-white border border-gray-100 p-4 rounded-xl snap-center shadow-sm">
                                        <div className="text-sm font-bold text-gray-800 mb-1">{alt.name}</div>
                                        <div className="text-chlorophyll-green text-xs font-semibold">{alt.savings}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => {
                                // Log the spend
                                // We need to import useStore at top level, or pass a handler. 
                                // Better to pass a handler from parent or specific action. 
                                // Let's assume we pass a new prop 'onLog'.
                                onLog();
                            }}
                            className="w-full py-4 bg-carbon-grey text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
                        >
                            Log to Dashboard
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
