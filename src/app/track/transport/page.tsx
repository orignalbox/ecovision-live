'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, MapPin, TrendingDown, Clock, Leaf, Flame } from 'lucide-react';
import Link from 'next/link';
import {
    TRANSPORT_EMISSIONS,
    calculateTransportEmissions,
    calculateCaloriesBurned
} from '@/lib/emissions';
import {
    calculateRideCost,
    calculateMetroFare,
} from '@/lib/pricing';

interface TransportOption {
    id: string;
    name: string;
    emoji: string;
    cost: number;
    time: number;
    co2: number;
    calories: number;
    description: string;
    highlight?: 'cheapest' | 'fastest' | 'healthiest' | 'greenest';
}

// Estimate travel time based on mode
function estimateTime(distance: number, mode: string): number {
    const speeds: Record<string, number> = {
        car: 25, // km/h in city traffic
        auto: 22,
        metro: 35,
        cycle: 15,
        walk: 5
    };
    return Math.round((distance / (speeds[mode] || 20)) * 60);
}

export default function TransportPage() {
    const [distance, setDistance] = useState(5);

    // Build transport options based on distance
    const options = useMemo((): TransportOption[] => {
        const time = estimateTime(distance, 'car');

        const opts: TransportOption[] = [
            {
                id: 'ola',
                name: 'Ola / Uber',
                emoji: '🚗',
                cost: calculateRideCost('ola_mini', distance, time),
                time: estimateTime(distance, 'car'),
                co2: calculateTransportEmissions('ola_mini', distance),
                calories: 0,
                description: 'AC, door-to-door',
            },
            {
                id: 'auto',
                name: 'Auto Rickshaw',
                emoji: '🛺',
                cost: calculateRideCost('auto_rickshaw', distance, time),
                time: estimateTime(distance, 'auto'),
                co2: calculateTransportEmissions('auto_rickshaw', distance),
                calories: 0,
                description: 'Affordable CNG',
            },
            {
                id: 'metro',
                name: 'Metro',
                emoji: '🚇',
                cost: calculateMetroFare(distance),
                time: estimateTime(distance, 'metro'),
                co2: calculateTransportEmissions('metro_delhi', distance),
                calories: Math.round(calculateCaloriesBurned('walking', 0.5)),
                description: 'Fast in traffic',
            },
            {
                id: 'cycle',
                name: 'Cycle',
                emoji: '🚴',
                cost: 0,
                time: estimateTime(distance, 'cycle'),
                co2: 0,
                calories: Math.round(calculateCaloriesBurned('cycling', distance)),
                description: 'Free + exercise',
            },
            {
                id: 'walk',
                name: 'Walk',
                emoji: '🚶',
                cost: 0,
                time: estimateTime(distance, 'walk'),
                co2: 0,
                calories: Math.round(calculateCaloriesBurned('walking', distance)),
                description: 'Free + healthy',
            },
        ];

        // Find best in each category (excluding free options for some)
        const paidOpts = opts.filter(o => o.cost > 0);
        const cheapestPaid = paidOpts.reduce((min, o) => o.cost < min.cost ? o : min);
        const fastest = paidOpts.reduce((min, o) => o.time < min.time ? o : min);
        const healthiest = opts.reduce((max, o) => o.calories > max.calories ? o : max);

        return opts.map(opt => ({
            ...opt,
            highlight:
                opt.id === healthiest.id ? 'healthiest' :
                    opt.id === cheapestPaid.id ? 'cheapest' :
                        opt.id === fastest.id ? 'fastest' :
                            undefined
        }));
    }, [distance]);

    // Calculate potential savings vs Ola
    const olaOption = options.find(o => o.id === 'ola');
    const cheapestPaid = Math.min(...options.filter(o => o.cost > 0).map(o => o.cost));
    const savingsVsOla = olaOption ? Math.round(olaOption.cost - cheapestPaid) : 0;

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white pb-24">
            {/* Header */}
            <header className="px-6 pt-8 pb-4">
                <Link
                    href="/track"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-5 text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <Car size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Transport Compare</h1>
                        <p className="text-white/40 text-sm">How far are you going?</p>
                    </div>
                </div>
            </header>

            {/* Distance Input */}
            <div className="px-6 py-4">
                <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-blue-400" />
                            <span className="text-white/60 text-sm font-medium">Distance</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={0.5}
                                max={50}
                                step={0.5}
                                value={distance}
                                onChange={(e) => setDistance(Math.max(0.5, Number(e.target.value) || 0.5))}
                                className="w-14 bg-transparent text-right text-2xl font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-white/40 text-lg">km</span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min={0.5}
                        max={30}
                        step={0.5}
                        value={Math.min(distance, 30)}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-5
                            [&::-webkit-slider-thumb]:h-5
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-blue-500
                            [&::-webkit-slider-thumb]:shadow-lg
                            [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white/30 mt-2">
                        <span>0.5 km</span>
                        <span>30 km</span>
                    </div>
                </div>
            </div>

            {/* Savings Banner */}
            {savingsVsOla > 15 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-6 mb-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <TrendingDown size={20} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-green-400/70">Save vs Ola</p>
                            <p className="text-xl font-bold text-green-400">₹{savingsVsOla}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Results */}
            <div className="px-6 space-y-3">
                {options.map((option, index) => (
                    <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                            relative p-4 rounded-xl border transition-all
                            ${option.highlight === 'cheapest'
                                ? 'bg-green-500/5 border-green-500/30'
                                : option.highlight === 'healthiest'
                                    ? 'bg-orange-500/5 border-orange-500/30'
                                    : 'bg-[#111113] border-white/[0.06]'
                            }
                        `}
                    >
                        {/* Highlight badge */}
                        {option.highlight && (
                            <div className={`
                                absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider
                                ${option.highlight === 'cheapest' ? 'bg-green-500/20 text-green-400' :
                                    option.highlight === 'healthiest' ? 'bg-orange-500/20 text-orange-400' :
                                        option.highlight === 'fastest' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-white/10 text-white/60'}
                            `}>
                                {option.highlight}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className="text-2xl">{option.emoji}</div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold">{option.name}</h3>
                                <p className="text-white/40 text-xs">{option.description}</p>
                            </div>

                            {/* Cost */}
                            <div className="text-right">
                                <div className="text-lg font-bold text-white">
                                    {option.cost === 0 ? 'Free' : `₹${Math.round(option.cost)}`}
                                </div>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-1 text-xs text-white/40">
                                <Clock size={12} />
                                <span>{option.time} min</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-white/40">
                                <Leaf size={12} />
                                <span>{option.co2.toFixed(1)} kg CO₂</span>
                            </div>
                            {option.calories > 0 && (
                                <div className="flex items-center gap-1 text-xs text-orange-400">
                                    <Flame size={12} />
                                    <span>{option.calories} cal</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
