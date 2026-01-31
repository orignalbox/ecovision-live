'use client';

import { motion } from 'framer-motion';
import { X, Droplets, Wind, AlertTriangle, Leaf, ChevronRight, Recycle, Package, Lightbulb, Star } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface RecyclingInfo {
    recyclable: boolean;
    materials: string[];
    howToDispose: string;
    reuseIdeas: string[];
}

interface Alternative {
    name: string;
    savings: string;
    reason?: string;
}

interface ImpactData {
    name: string;
    category?: string;
    co2: number;
    water: number;
    bio: number;
    ecoScore?: string;
    alternatives?: Alternative[];
    redFlags?: string[];
    recycling?: RecyclingInfo;
}

interface ImpactCardProps {
    data: ImpactData;
    onClose: () => void;
    capturedImage?: string;
}

export default function ImpactCard({ data, onClose, capturedImage }: ImpactCardProps) {
    const [activeTab, setActiveTab] = useState<'impact' | 'recycle' | 'alternatives'>('impact');

    const ecoScoreColors: Record<string, string> = {
        'A': 'text-green-400 bg-green-500/20 border-green-500/40',
        'B': 'text-lime-400 bg-lime-500/20 border-lime-500/40',
        'C': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40',
        'D': 'text-orange-400 bg-orange-500/20 border-orange-500/40',
        'E': 'text-red-400 bg-red-500/20 border-red-500/40',
    };

    const ecoScoreColor = ecoScoreColors[data.ecoScore || ''] || 'text-gray-400 bg-gray-500/20 border-gray-500/40';

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-12 bg-gradient-to-b from-gray-900 to-black rounded-t-[32px] z-[100] overflow-hidden border-t border-white/10"
        >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl px-6 pt-4 pb-6">
                {/* Drag Handle */}
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5" />

                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-white leading-tight truncate">{data.name}</h2>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {data.category && (
                                <span className="bg-white/10 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-white/60">
                                    {data.category}
                                </span>
                            )}
                            {data.ecoScore && (
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${ecoScoreColor}`}>
                                    Eco: {data.ecoScore}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                        aria-label="Close"
                    >
                        <X size={22} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Tab Navigation - Larger touch targets */}
            <div className="px-4">
                <div className="flex gap-1 p-1.5 bg-white/5 rounded-2xl">
                    {[
                        { id: 'impact', label: 'Impact', icon: Wind },
                        { id: 'alternatives', label: 'Swaps', icon: Leaf },
                        { id: 'recycle', label: 'Recycle', icon: Recycle },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={clsx(
                                "flex-1 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                                activeTab === tab.id
                                    ? "bg-white text-black"
                                    : "text-white/50 hover:text-white active:bg-white/10"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content - with proper safe area */}
            <div className="p-6 pt-4 overflow-y-auto h-[calc(100%-180px)] pb-safe">

                {/* Impact Tab */}
                {activeTab === 'impact' && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Captured Image */}
                        {capturedImage && (
                            <div className="flex justify-center">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                                    <img
                                        src={capturedImage}
                                        alt={data.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                        {/* Eco Score Circle */}
                        <div className="flex justify-center py-6">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
                                    <circle cx="72" cy="72" r="64" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                                    <circle
                                        cx="72" cy="72" r="64"
                                        stroke={data.bio > 70 ? "#22c55e" : data.bio > 40 ? "#facc15" : "#f97316"}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="402"
                                        strokeDashoffset={402 - (402 * (data.bio || 0)) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-5xl font-bold text-white">{data.bio || 0}</div>
                                    <div className="text-[11px] uppercase tracking-widest text-white/40 mt-1">Eco Index</div>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
                                    <Wind size={16} />
                                    <span>Carbon Footprint</span>
                                </div>
                                <div className="text-3xl font-light text-white">
                                    {data.co2}<span className="text-base opacity-50 ml-1">kg</span>
                                </div>
                            </div>
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
                                    <Droplets size={16} />
                                    <span>Water Usage</span>
                                </div>
                                <div className="text-3xl font-light text-white">
                                    {data.water}<span className="text-base opacity-50 ml-1">L</span>
                                </div>
                            </div>
                        </div>

                        {/* Red Flags */}
                        {data.redFlags && data.redFlags.length > 0 && (
                            <div>
                                <h3 className="text-white/80 font-semibold mb-4 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-amber-400" />
                                    Environmental Concerns
                                </h3>
                                <div className="space-y-3">
                                    {data.redFlags.map((flag, i) => (
                                        <div
                                            key={i}
                                            className="bg-amber-500/10 border border-amber-500/25 px-4 py-3.5 rounded-xl text-amber-200 text-sm leading-relaxed"
                                        >
                                            ⚠️ {flag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Alternatives Tab */}
                {activeTab === 'alternatives' && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <p className="text-white/50 text-sm mb-5">
                            🌱 Better choices for the planet
                        </p>

                        {data.alternatives && data.alternatives.length > 0 ? (
                            data.alternatives.map((alt, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-gradient-to-r from-green-500/15 to-transparent p-5 rounded-2xl border border-green-500/25 group hover:border-green-500/40 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Star size={16} className="text-green-400" />
                                                <span className="text-white font-semibold">{alt.name}</span>
                                            </div>
                                            <div className="text-green-400 text-sm mt-1">{alt.savings}</div>
                                            {alt.reason && (
                                                <div className="text-white/40 text-xs mt-2 leading-relaxed">{alt.reason}</div>
                                            )}
                                        </div>
                                        <ChevronRight size={20} className="text-white/20 group-hover:text-white/50 transition-colors mt-1" />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-white/30">
                                <Leaf size={40} className="mx-auto mb-4 opacity-50" />
                                <p>No alternatives found</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Recycle Tab */}
                {activeTab === 'recycle' && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-5"
                    >
                        {data.recycling ? (
                            <>
                                {/* Recyclable Badge */}
                                <div className={clsx(
                                    "p-5 rounded-2xl border flex items-center gap-5",
                                    data.recycling.recyclable
                                        ? "bg-green-500/10 border-green-500/25"
                                        : "bg-red-500/10 border-red-500/25"
                                )}>
                                    <Recycle size={36} className={data.recycling.recyclable ? "text-green-400" : "text-red-400"} />
                                    <div>
                                        <div className={clsx("font-bold text-lg", data.recycling.recyclable ? "text-green-400" : "text-red-400")}>
                                            {data.recycling.recyclable ? "Recyclable" : "Not Easily Recyclable"}
                                        </div>
                                        <div className="text-white/50 text-sm mt-1">Check local guidelines</div>
                                    </div>
                                </div>

                                {/* Materials */}
                                {data.recycling.materials && data.recycling.materials.length > 0 && (
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                                            <Package size={16} />
                                            Materials
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {data.recycling.materials.map((mat, i) => (
                                                <span key={i} className="bg-white/10 px-4 py-2 rounded-full text-sm text-white">
                                                    {mat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* How to Dispose */}
                                {data.recycling.howToDispose && (
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                                            <Recycle size={16} />
                                            How to Dispose
                                        </div>
                                        <p className="text-white leading-relaxed">{data.recycling.howToDispose}</p>
                                    </div>
                                )}

                                {/* Reuse Ideas */}
                                {data.recycling.reuseIdeas && data.recycling.reuseIdeas.length > 0 && (
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                                            <Lightbulb size={16} />
                                            Reuse Ideas
                                        </div>
                                        <ul className="space-y-3">
                                            {data.recycling.reuseIdeas.map((idea, i) => (
                                                <li key={i} className="text-white text-sm flex items-start gap-3">
                                                    <span className="text-cyan-400 mt-0.5">💡</span>
                                                    {idea}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-white/30">
                                <Recycle size={40} className="mx-auto mb-4 opacity-50" />
                                <p>Recycling information not available</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
