'use client';

import { motion } from 'framer-motion';
import { X, Droplets, Wind, Leaf, Recycle, ExternalLink, Award } from 'lucide-react';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { matchProductToCategory, calculateCostPerUse } from '@/lib/bifl';

export interface RecyclingInfo {
    recyclable: boolean;
    materials: string[];
    howToDispose: string;
    reuseIdeas: string[];
}

export interface Alternative {
    name: string;
    savings: string;
    reason?: string;
}

export interface ImpactData {
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
    onCompare?: (alternative: Alternative) => void;
}

export default function ImpactCard({ data, onClose, capturedImage }: ImpactCardProps) {
    const [activeTab, setActiveTab] = useState<'impact' | 'alternatives'>('impact');

    const ecoScoreColors: Record<string, string> = {
        'A': 'text-green-400 bg-green-500/20 border-green-500/40',
        'B': 'text-lime-400 bg-lime-500/20 border-lime-500/40',
        'C': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40',
        'D': 'text-orange-400 bg-orange-500/20 border-orange-500/40',
        'E': 'text-red-400 bg-red-500/20 border-red-500/40',
    };

    const ecoScoreColor = ecoScoreColors[data.ecoScore || ''] || 'text-gray-400 bg-gray-500/20 border-gray-500/40';

    // Match scanned product to BIFL category for quality recommendations
    const biflMatch = useMemo(() => {
        return matchProductToCategory(data.name, data.category);
    }, [data.name, data.category]);

    // Calculate quality score cost
    const costAnalysis = useMemo(() => {
        if (!biflMatch) return null;
        // Assume generic product price (low quality) vs BIFL price
        const genericPrice = 2000;
        const biflPrice = 8000;
        const genericUses = 100;
        const biflUses = 1000;
        return {
            generic: genericPrice / genericUses,
            bifl: biflPrice / biflUses
        };
    }, [biflMatch]);

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 top-0 z-50 flex flex-col bg-[#111113] md:max-w-md md:right-0 md:left-auto md:border-l md:border-white/10"
        >
            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-white/[0.06] bg-[#111113] z-10">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{data.category === 'food' ? '🍎' : '📦'}</span>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${ecoScoreColor}`}>
                                Score: {data.ecoScore || '?'}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white leading-tight line-clamp-2">{data.name}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-white/40 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white/[0.05] rounded-xl">
                    {[
                        { id: 'impact', label: 'True Cost', icon: Wind },
                        { id: 'alternatives', label: 'Better Swap', icon: Leaf },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? "bg-white text-black shadow-lg"
                                    : "text-white/50 hover:text-white"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 pb-safe">

                {/* Impact Tab */}
                {activeTab === 'impact' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                                <div className="flex items-center gap-2 text-blue-400 mb-2">
                                    <Wind size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Carbon</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{data.co2} <span className="text-sm font-normal text-white/40">kg</span></div>
                                <div className="text-xs text-white/30 mt-1">Driving 12km</div>
                            </div>
                            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                    <Droplets size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Water</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{data.water} <span className="text-sm font-normal text-white/40">L</span></div>
                                <div className="text-xs text-white/30 mt-1">20 min shower</div>
                            </div>
                        </div>

                        {/* Red Flags */}
                        {data.redFlags && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <h3 className="text-sm font-bold text-red-400 mb-3 uppercase tracking-wider">Hidden Costs</h3>
                                <ul className="space-y-2">
                                    {data.redFlags.map((flag, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                                            <span className="text-red-400 mt-1">•</span>
                                            {flag}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recycling Info */}
                        {data.recycling && (
                            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Recycle size={18} className="text-green-400" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Disposal</h3>
                                </div>
                                <p className="text-sm text-white/70 mb-3 leading-relaxed">
                                    {data.recycling.howToDispose}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {data.recycling.materials.map((mat, i) => (
                                        <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/60">
                                            {mat}
                                        </span>
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
                        className="space-y-6"
                    >
                        {/* BIFL Section */}
                        {biflMatch ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award size={18} className="text-orange-400" />
                                        <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">True Cost Winner</h3>
                                    </div>
                                    <p className="text-sm text-white/70 mb-4">
                                        Buying cheap {biflMatch.category.name.toLowerCase()} costs 3x more in the long run.
                                    </p>

                                    {/* Cost Comparison */}
                                    {costAnalysis && (
                                        <div className="flex items-center gap-2 text-xs bg-black/20 p-2 rounded-lg mb-4">
                                            <div className="flex-1 text-center">
                                                <div className="text-white/40 mb-1">Generic</div>
                                                <div className="text-red-400 font-bold">₹{costAnalysis.generic.toFixed(1)}/use</div>
                                            </div>
                                            <div className="text-white/20">vs</div>
                                            <div className="flex-1 text-center">
                                                <div className="text-white/40 mb-1">Quality</div>
                                                <div className="text-green-400 font-bold">₹{costAnalysis.bifl.toFixed(1)}/use</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-xs text-white/30 text-center italic">
                                        Quality items hold value and last years longer.
                                    </div>
                                </div>

                                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider pl-1">Recommended Brands</h3>
                                <div className="space-y-3">
                                    {biflMatch.products.map((prod, i) => (
                                        <div key={i} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between group hover:border-white/20 transition-colors">
                                            <div>
                                                <div className="font-semibold text-white">{prod.name}</div>
                                                <div className="text-xs text-white/40 mt-0.5">{prod.warranty || 'High durability'}</div>
                                            </div>
                                            <a
                                                href={prod.links.official || prod.links.amazon || prod.links.flipkart || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Standard AI alternatives
                            <div className="space-y-4">
                                {data.alternatives && data.alternatives.length > 0 ? (
                                    data.alternatives.map((alt, i) => (
                                        <div key={i} className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-white">{alt.name}</h3>
                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded font-bold">
                                                    {alt.savings}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/70">{alt.reason}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-white/40">
                                        <Leaf size={32} className="mx-auto mb-3 opacity-50" />
                                        <p>No better alternatives found.</p>
                                        <p className="text-xs mt-1">This might already be a good choice!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
