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
}

export default function ImpactCard({ data, onClose }: ImpactCardProps) {
    const [activeTab, setActiveTab] = useState<'impact' | 'recycle' | 'alternatives'>('impact');

    const ecoScoreColor = {
        'A': 'text-green-400 bg-green-500/20 border-green-500/30',
        'B': 'text-lime-400 bg-lime-500/20 border-lime-500/30',
        'C': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
        'D': 'text-orange-400 bg-orange-500/20 border-orange-500/30',
        'E': 'text-red-400 bg-red-500/20 border-red-500/30',
    }[data.ecoScore || 'C'] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-16 bg-gradient-to-b from-gray-900 to-black rounded-t-[32px] z-50 overflow-hidden border-t border-white/10"
        >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 via-gray-900 to-transparent p-6 pb-8">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

                <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                        <h2 className="text-2xl font-bold text-white leading-tight">{data.name}</h2>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {data.category && (
                                <span className="bg-white/10 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest text-white/50">
                                    {data.category}
                                </span>
                            )}
                            {data.ecoScore && (
                                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${ecoScoreColor}`}>
                                    Eco Score: {data.ecoScore}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6">
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
                    {[
                        { id: 'impact', label: 'Impact', icon: Wind },
                        { id: 'alternatives', label: 'Alternatives', icon: Leaf },
                        { id: 'recycle', label: 'Recycle', icon: Recycle },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                                activeTab === tab.id
                                    ? "bg-white text-black"
                                    : "text-white/50 hover:text-white"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-4 overflow-y-auto max-h-[calc(100%-200px)] pb-20">

                {/* Impact Tab */}
                {activeTab === 'impact' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Eco Score Circle */}
                        <div className="flex justify-center py-4">
                            <div className="relative w-36 h-36">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="72" cy="72" r="64" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                                    <circle
                                        cx="72" cy="72" r="64"
                                        stroke={data.bio > 70 ? "#22c55e" : data.bio > 40 ? "#facc15" : "#f97316"}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="402"
                                        strokeDashoffset={402 - (402 * data.bio) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-4xl font-bold text-white">{data.bio}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40">Eco Index</div>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                                    <Wind size={14} />
                                    <span>Carbon Footprint</span>
                                </div>
                                <div className="text-2xl font-light text-white">
                                    {data.co2}<span className="text-sm opacity-50 ml-1">kg</span>
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                                    <Droplets size={14} />
                                    <span>Water Usage</span>
                                </div>
                                <div className="text-2xl font-light text-white">
                                    {data.water}<span className="text-sm opacity-50 ml-1">L</span>
                                </div>
                            </div>
                        </div>

                        {/* Red Flags */}
                        {data.redFlags && data.redFlags.length > 0 && (
                            <div>
                                <h3 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-amber-400" />
                                    Environmental Concerns
                                </h3>
                                <div className="space-y-2">
                                    {data.redFlags.map((flag, i) => (
                                        <div
                                            key={i}
                                            className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl text-amber-300 text-sm"
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                    >
                        <p className="text-white/40 text-sm mb-4">
                            Better choices for the planet
                        </p>

                        {data.alternatives && data.alternatives.length > 0 ? (
                            data.alternatives.map((alt, i) => (
                                <div
                                    key={i}
                                    className="bg-gradient-to-r from-green-500/10 to-transparent p-4 rounded-2xl border border-green-500/20 group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Star size={14} className="text-green-400" />
                                                <span className="text-white font-medium">{alt.name}</span>
                                            </div>
                                            <div className="text-green-400 text-sm mt-1">{alt.savings}</div>
                                            {alt.reason && (
                                                <div className="text-white/40 text-xs mt-2">{alt.reason}</div>
                                            )}
                                        </div>
                                        <ChevronRight className="text-white/20 group-hover:text-white/50 transition-colors" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-white/30">
                                No alternatives found
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Recycle Tab */}
                {activeTab === 'recycle' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {data.recycling ? (
                            <>
                                {/* Recyclable Badge */}
                                <div className={clsx(
                                    "p-4 rounded-2xl border flex items-center gap-4",
                                    data.recycling.recyclable
                                        ? "bg-green-500/10 border-green-500/20"
                                        : "bg-red-500/10 border-red-500/20"
                                )}>
                                    <Recycle size={32} className={data.recycling.recyclable ? "text-green-400" : "text-red-400"} />
                                    <div>
                                        <div className={clsx("font-bold", data.recycling.recyclable ? "text-green-400" : "text-red-400")}>
                                            {data.recycling.recyclable ? "Recyclable" : "Not Easily Recyclable"}
                                        </div>
                                        <div className="text-white/50 text-sm">Check local guidelines</div>
                                    </div>
                                </div>

                                {/* Materials */}
                                {data.recycling.materials.length > 0 && (
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                                            <Package size={14} />
                                            Materials
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {data.recycling.materials.map((mat, i) => (
                                                <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-sm text-white">
                                                    {mat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* How to Dispose */}
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                                        <Recycle size={14} />
                                        How to Dispose
                                    </div>
                                    <p className="text-white text-sm">{data.recycling.howToDispose}</p>
                                </div>

                                {/* Reuse Ideas */}
                                {data.recycling.reuseIdeas.length > 0 && (
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                                            <Lightbulb size={14} />
                                            Reuse Ideas
                                        </div>
                                        <ul className="space-y-2">
                                            {data.recycling.reuseIdeas.map((idea, i) => (
                                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                                    <span className="text-cyan-400">•</span>
                                                    {idea}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-white/30">
                                Recycling information not available
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
