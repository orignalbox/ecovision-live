'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Leaf, Heart, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { DIET_EMISSIONS } from '@/lib/emissions';
import { FOOD_PRICES } from '@/lib/pricing';

interface ProteinSource {
    id: string;
    name: string;
    icon: string;
    pricePerKg: number;
    proteinPer100g: number;
    co2PerKg: number;
    health: string;
}

const PROTEIN_SOURCES: ProteinSource[] = [
    { id: 'chicken', name: 'Chicken', icon: '🍗', pricePerKg: FOOD_PRICES.chicken, proteinPer100g: 27, co2PerKg: DIET_EMISSIONS.chicken, health: 'Complete protein' },
    { id: 'mutton', name: 'Mutton', icon: '🐑', pricePerKg: FOOD_PRICES.mutton, proteinPer100g: 25, co2PerKg: DIET_EMISSIONS.mutton, health: 'Iron-rich' },
    { id: 'fish', name: 'Fish', icon: '🐟', pricePerKg: FOOD_PRICES.fish_rohu, proteinPer100g: 18, co2PerKg: DIET_EMISSIONS.fish_farmed, health: 'Omega-3' },
    { id: 'eggs', name: 'Eggs', icon: '🥚', pricePerKg: Math.round(FOOD_PRICES.eggs_per_dozen / 12 * 1000 / 60), proteinPer100g: 13, co2PerKg: DIET_EMISSIONS.eggs, health: 'Affordable' },
    { id: 'paneer', name: 'Paneer', icon: '🧀', pricePerKg: FOOD_PRICES.paneer, proteinPer100g: 18, co2PerKg: DIET_EMISSIONS.paneer, health: 'Vegetarian' },
    { id: 'tofu', name: 'Tofu', icon: '🫛', pricePerKg: FOOD_PRICES.tofu, proteinPer100g: 8, co2PerKg: DIET_EMISSIONS.tofu, health: 'Plant-based' },
    { id: 'dal', name: 'Dal', icon: '🫘', pricePerKg: FOOD_PRICES.lentils_toor, proteinPer100g: 22, co2PerKg: DIET_EMISSIONS.lentils_dal, health: 'High fiber' },
];

export default function DietPage() {
    const [targetProtein, setTargetProtein] = useState(30);

    const calculations = useMemo(() => {
        return PROTEIN_SOURCES.map(source => {
            const gramsNeeded = (targetProtein / source.proteinPer100g) * 100;
            const costPerServing = (source.pricePerKg / 1000) * gramsNeeded;
            const co2PerServing = (source.co2PerKg / 1000) * gramsNeeded;

            return { ...source, gramsNeeded: Math.round(gramsNeeded), costPerServing: Math.round(costPerServing), co2PerServing };
        }).sort((a, b) => a.costPerServing - b.costPerServing);
    }, [targetProtein]);

    const cheapest = calculations[0];
    const mostExpensive = calculations[calculations.length - 1];
    const maxCost = mostExpensive.costPerServing;

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white">
            <header className="px-6 pt-8 pb-2">
                <Link href="/track" className="inline-flex items-center gap-2 text-[rgba(250,250,250,0.4)] hover:text-white mb-6 text-sm font-medium transition-colors">
                    <ArrowLeft size={16} />Back
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                        <span className="text-xl">🥩</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Protein Compare</h1>
                        <p className="text-[rgba(250,250,250,0.4)] text-sm">Same protein, different prices</p>
                    </div>
                </div>
            </header>

            <div className="px-6 py-5">
                <div className="bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[rgba(250,250,250,0.6)] text-sm">Daily protein target</span>
                        <span className="text-xs text-[rgba(250,250,250,0.35)]">RDA: 50-60g</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input type="range" min={10} max={100} step={5} value={targetProtein}
                            onChange={(e) => setTargetProtein(Number(e.target.value))} className="flex-1" />
                        <div className="text-2xl font-bold text-white min-w-[70px] text-right tabular-nums">
                            {targetProtein} <span className="text-sm font-normal text-[rgba(250,250,250,0.4)]">g</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-4">
                <p className="text-sm text-[rgba(250,250,250,0.5)]">
                    Cost to get <span className="text-white font-medium">{targetProtein}g protein</span>:
                </p>
            </div>

            <div className="px-6 space-y-2.5">
                {calculations.map((source, index) => {
                    const savings = mostExpensive.costPerServing - source.costPerServing;
                    const costWidth = (source.costPerServing / maxCost) * 100;
                    const isCheapest = source.id === cheapest.id;

                    return (
                        <motion.div key={source.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={`p-4 rounded-xl border transition-all ${isCheapest ? 'bg-green-500/10 border-green-500/25' : 'bg-[#111113] border-[rgba(255,255,255,0.06)]'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{source.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-white text-[15px]">{source.name}</h3>
                                        <p className="text-xs text-[rgba(250,250,250,0.35)]">{source.gramsNeeded}g serving</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-bold tabular-nums ${isCheapest ? 'text-green-400' : 'text-white'}`}>
                                        ₹{source.costPerServing}
                                    </div>
                                    {savings > 15 && source.id !== mostExpensive.id && (
                                        <div className="text-xs text-green-400 font-medium">Save ₹{savings}</div>
                                    )}
                                </div>
                            </div>

                            <div className="h-1.5 bg-[#0A0A0B] rounded-full overflow-hidden mb-3">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${costWidth}%` }}
                                    transition={{ delay: index * 0.04 + 0.2, duration: 0.5 }}
                                    className={`h-full rounded-full ${isCheapest ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                            costWidth < 40 ? 'bg-green-400' : costWidth < 70 ? 'bg-yellow-400' : 'bg-orange-400'
                                        }`}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="flex items-center gap-1 text-xs bg-white/5 text-[rgba(250,250,250,0.5)] px-2 py-1 rounded-md">
                                    <Heart size={10} />{source.health}
                                </span>
                                <span className="flex items-center gap-1 text-xs bg-white/5 text-[rgba(250,250,250,0.35)] px-2 py-1 rounded-md">
                                    <Leaf size={10} />{source.co2PerServing.toFixed(1)}kg CO₂
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="px-6 py-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                    <TrendingDown size={20} className="text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-400">
                        <span className="font-bold">{cheapest.name}</span> is cheapest at ₹{cheapest.costPerServing}.
                        Switching saves <span className="font-bold">₹{(mostExpensive.costPerServing - cheapest.costPerServing) * 30}/month</span>.
                    </p>
                </div>
            </div>

            <div className="px-6 pb-safe">
                <div className="p-4 bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-xl flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <p className="text-xs text-[rgba(250,250,250,0.45)]">
                        <span className="text-white font-medium">Pro tip:</span> Dal + Rice = complete protein. As good as meat, fraction of cost.
                    </p>
                </div>
            </div>

            <div className="h-20" />
        </div>
    );
}
