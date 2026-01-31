'use client';

import { motion } from 'framer-motion';
import { X, Droplets, Wind, AlertTriangle, Leaf, ChevronRight, DollarSign } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface ImpactCardProps {
    data: any;
    onClose: () => void;
}

export default function ImpactCard({ data, onClose }: ImpactCardProps) {
    const [showTrueCost, setShowTrueCost] = useState(false);

    // Mock pricing logic for True Cost demo
    const basePrice = 4.50;
    const ecoTax = 0.85; // Calculated from CO2 * TaxRate

    return (
        <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-20 bg-void-black/90 backdrop-blur-3xl rounded-t-[40px] z-50 overflow-y-auto border-t border-white/10"
        >
            {/* 1. Header (Draggable) */}
            <div className="sticky top-0 right-0 left-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-void-black/90 to-transparent">
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-4" />
                <div className="mt-4">
                    <h2 className="text-3xl font-light text-white leading-tight">{data.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest text-ozone-blue">Detected</span>
                        <span className="text-white/40 text-xs">AI Confidence 98%</span>
                    </div>
                </div>
                <button onClick={onClose} className="mt-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <X size={20} className="text-white" />
                </button>
            </div>

            <div className="p-6 pt-0 space-y-8 pb-32">

                {/* 2. The Eco-Index (Circular Score) */}
                <div className="flex justify-center my-4">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                            <circle
                                cx="80" cy="80" r="70"
                                stroke={data.bio > 50 ? "#2ED573" : "#FFA502"}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray="440"
                                strokeDashoffset={440 - (440 * data.bio) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <div className="text-4xl font-bold text-white">{data.bio}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/50">Eco Index</div>
                        </div>
                    </div>
                </div>

                {/* 3. Planet Cost Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-glass-white p-5 rounded-3xl border border-white/5">
                        <div className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Carbon Cost</div>
                        <div className="text-2xl text-white font-light flex items-baseline gap-1">
                            {data.co2}<span className="text-sm opacity-50">kg</span>
                        </div>
                    </div>
                    <div className="bg-glass-white p-5 rounded-3xl border border-white/5">
                        <div className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Water Spend</div>
                        <div className="text-2xl text-white font-light flex items-baseline gap-1">
                            {data.water}<span className="text-sm opacity-50">L</span>
                        </div>
                    </div>
                </div>

                {/* 4. True Cost Slider */}
                <div className="bg-glass-white p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-gold">
                            <DollarSign size={18} className="text-alert-amber" />
                            <span className="font-bold text-white">True Cost</span>
                        </div>
                        <div
                            onClick={() => setShowTrueCost(!showTrueCost)}
                            className={clsx(
                                "w-12 h-6 rounded-full p-1 transition-colors cursor-pointer",
                                showTrueCost ? "bg-ozone-blue" : "bg-white/20"
                            )}
                        >
                            <motion.div
                                layout
                                className="w-4 h-4 bg-white rounded-full"
                                animate={{ x: showTrueCost ? 24 : 0 }}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="text-white">
                            <div className="text-sm opacity-50">Retail Price</div>
                            <div className="text-2xl font-light">${basePrice.toFixed(2)}</div>
                        </div>
                        {showTrueCost && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-right">
                                <div className="text-sm text-alert-amber font-bold">+${ecoTax.toFixed(2)} Tax</div>
                                <div className="text-xs opacity-50">Clean-up Cost</div>
                            </motion.div>
                        )}
                    </div>
                    {showTrueCost && (
                        <motion.div
                            initial={{ height: 0 }} animate={{ height: 'auto' }}
                            className="mt-4 pt-4 border-t border-white/10 text-xs text-white/60"
                        >
                            This price includes the hidden environmental cost to remove the {data.co2}kg of CO₂ generated.
                        </motion.div>
                    )}
                </div>

                {/* 5. Ingredient Red Flags */}
                <div>
                    <h3 className="text-white font-light mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-alert-amber" />
                        Red Flags
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        <div className="bg-alert-amber/20 border border-alert-amber/30 px-4 py-2 rounded-full text-alert-amber text-sm font-bold whitespace-nowrap">
                            ⚠️ Microplastics
                        </div>
                        <div className="bg-white/10 border border-white/10 px-4 py-2 rounded-full text-white/50 text-sm whitespace-nowrap">
                            Palm Oil (Certified)
                        </div>
                    </div>
                </div>

                {/* 6. Eco-Swap Engine */}
                <div>
                    <h3 className="text-white font-light mb-4 flex items-center gap-2">
                        <Leaf size={16} className="text-life-green" />
                        Better Alternatives
                    </h3>
                    <div className="space-y-3">
                        {data.alternatives?.map((alt: any, i: number) => (
                            <div key={i} className="bg-glass-white p-4 rounded-2xl flex justify-between items-center group active:scale-95 transition-transform">
                                <div>
                                    <div className="text-white font-bold">{alt.name}</div>
                                    <div className="text-life-green text-xs font-bold mt-1">{alt.savings}</div>
                                </div>
                                <ChevronRight className="text-white/30" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
