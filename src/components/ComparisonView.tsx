'use client';

import { motion } from 'framer-motion';
import { Leaf, Droplets, Wind, ArrowRight, CheckCircle, Scale, ShieldCheck } from 'lucide-react';
import { ImpactData } from './ImpactCard';
import { useStore } from '@/store/useStore';

interface ComparisonViewProps {
    original: ImpactData;
    alternative: ImpactData;
    onClose: () => void;
    onDecision: () => void;
}

export default function ComparisonView({ original, alternative, onClose, onDecision }: ComparisonViewProps) {
    const { addDecision, addLog } = useStore();

    const co2Diff = (original.co2 - alternative.co2).toFixed(1);
    const waterDiff = (original.water - alternative.water).toFixed(0);
    const isCo2Better = original.co2 > alternative.co2;
    const isWaterBetter = original.water > alternative.water;

    const handleChoose = (choice: 'original' | 'alternative') => {
        if (choice === 'alternative') {
            // Track savings!
            addDecision(
                original.name,
                alternative.name,
                Math.max(0, original.co2 - alternative.co2),
                Math.max(0, original.water - alternative.water)
            );
            // Log the chosen item
            addLog({
                name: alternative.name,
                co2: alternative.co2,
                water: alternative.water,
                savings: `${co2Diff}kg CO₂ Avoided`
            });
        } else {
            // Log the chosen item (no savings)
            addLog({
                name: original.name,
                co2: original.co2,
                water: original.water
            });
        }

        onDecision();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-void-black z-50 flex flex-col">
            {/* Header */}
            <div className="px-6 py-6 bg-void-black/80 backdrop-blur-xl border-b border-white/10 z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Scale className="text-life-green" /> Head-to-Head
                    </h2>
                    <p className="text-white/50 text-xs">Choose the better option</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white text-sm"
                >
                    Cancel
                </button>
            </div>

            {/* Comparison Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-4">

                {/* Product A (Original) */}
                <div className="flex-1 bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col relative overflow-hidden group">
                    <div className="flex-1">
                        <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Original Choice</div>
                        <h3 className="text-2xl font-bold text-white mb-6">{original.name}</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-white/60 text-sm flex items-center gap-2"><Wind size={16} /> CO₂</span>
                                <span className="text-white font-mono text-lg">{original.co2}kg</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-white/60 text-sm flex items-center gap-2"><Droplets size={16} /> Water</span>
                                <span className="text-white font-mono text-lg">{original.water}L</span>
                            </div>
                            <div className="flex justify-center py-4">
                                <div className={`text-4xl font-black ${original.ecoScore === 'A' ? 'text-green-400' : original.ecoScore === 'B' ? 'text-lime-400' : 'text-red-400'}`}>
                                    {original.ecoScore}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleChoose('original')}
                        className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-colors mt-6"
                    >
                        I'll stick with this
                    </button>
                </div>

                {/* VS Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 md:static md:translate-x-0 md:translate-y-0 md:flex md:items-center">
                    <div className="w-12 h-12 bg-void-black rounded-full border-2 border-white/10 flex items-center justify-center font-black italic text-white/50 shadow-xl">
                        VS
                    </div>
                </div>

                {/* Product B (Alternative) */}
                <div className="flex-1 bg-gradient-to-b from-green-500/10 to-transparent rounded-3xl p-6 border border-green-500/30 flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/5 animate-pulse" style={{ animationDuration: '4s' }} />

                    <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="text-xs text-green-400 uppercase tracking-widest font-bold">Better Choice</div>
                            <ShieldCheck size={14} className="text-green-400" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-6">{alternative.name}</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                <span className="text-white/80 text-sm flex items-center gap-2"><Wind size={16} /> CO₂</span>
                                <div className="text-right">
                                    <span className="text-white font-mono text-lg block">{alternative.co2}kg</span>
                                    {isCo2Better && <span className="text-[10px] text-green-400 font-bold">Saves {co2Diff}kg</span>}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                <span className="text-white/80 text-sm flex items-center gap-2"><Droplets size={16} /> Water</span>
                                <div className="text-right">
                                    <span className="text-white font-mono text-lg block">{alternative.water}L</span>
                                    {isWaterBetter && <span className="text-[10px] text-green-400 font-bold">Saves {waterDiff}L</span>}
                                </div>
                            </div>
                            <div className="flex justify-center py-4">
                                <div className={`text-4xl font-black ${alternative.ecoScore === 'A' ? 'text-green-400' : alternative.ecoScore === 'B' ? 'text-lime-400' : 'text-red-400'}`}>
                                    {alternative.ecoScore}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleChoose('alternative')}
                        className="w-full py-4 bg-life-green hover:bg-green-400 text-black font-bold rounded-2xl transition-colors mt-6 shadow-lg shadow-green-900/20 relative z-10 flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={20} />
                        I'll Choose This
                    </button>

                    {/* Savings Highlight */}
                    <div className="mt-3 text-center">
                        <span className="text-green-400 text-xs font-medium bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            🌱 You'll save the planet {co2Diff}kg of CO₂
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
