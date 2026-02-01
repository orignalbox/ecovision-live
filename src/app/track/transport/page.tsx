'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Car, Leaf, Clock, MapPin, Flame, TrendingDown, Zap } from 'lucide-react';
import Link from 'next/link';
import LocationInput from '@/components/LocationInput';
import { calculateDistance, estimateTravelTime, type Coordinates } from '@/lib/location';
import {
    TRANSPORT_EMISSIONS,
    calculateTransportEmissions,
    calculateCaloriesBurned
} from '@/lib/emissions';
import {
    calculateRideCost,
    calculateMetroFare,
    TRANSPORT_PRICING
} from '@/lib/pricing';

interface TransportOption {
    id: string;
    name: string;
    icon: React.ReactNode;
    cost: number;
    time: number;
    co2: number;
    calories: number;
    description: string;
    highlight?: 'cheapest' | 'fastest' | 'healthiest' | 'greenest';
}

export default function TransportPage() {
    const [origin, setOrigin] = useState<{ coords: Coordinates | null; name: string }>({ coords: null, name: '' });
    const [destination, setDestination] = useState<{ coords: Coordinates | null; name: string }>({ coords: null, name: '' });
    const [manualDistance, setManualDistance] = useState<number | null>(null);

    const handleOriginChange = useCallback((coords: Coordinates | null, name: string) => {
        setOrigin({ coords, name });
        setManualDistance(null);
    }, []);

    const handleDestinationChange = useCallback((coords: Coordinates | null, name: string) => {
        setDestination({ coords, name });
        setManualDistance(null);
    }, []);

    // Calculate distance from coordinates or use manual
    const distance = useMemo(() => {
        if (manualDistance !== null) return manualDistance;
        if (origin.coords && destination.coords) {
            return calculateDistance(origin.coords, destination.coords);
        }
        return 0;
    }, [origin.coords, destination.coords, manualDistance]);

    // Build transport options
    const options = useMemo((): TransportOption[] => {
        if (distance === 0) return [];

        const time = estimateTravelTime(distance, 'car');

        const opts: TransportOption[] = [
            {
                id: 'ola',
                name: 'Ola / Uber',
                icon: <Car size={20} />,
                cost: calculateRideCost('ola_mini', distance, time),
                time: estimateTravelTime(distance, 'car'),
                co2: calculateTransportEmissions('ola_mini', distance),
                calories: 0,
                description: 'Air conditioned, door-to-door',
            },
            {
                id: 'auto',
                name: 'Auto Rickshaw',
                icon: <span className="text-lg">🛺</span>,
                cost: calculateRideCost('auto_rickshaw', distance, time),
                time: estimateTravelTime(distance, 'auto'),
                co2: calculateTransportEmissions('auto_rickshaw', distance),
                calories: 0,
                description: 'Affordable, eco-friendly CNG',
            },
            {
                id: 'metro',
                name: 'Metro',
                icon: <span className="text-lg">🚇</span>,
                cost: calculateMetroFare(distance),
                time: estimateTravelTime(distance, 'metro'),
                co2: calculateTransportEmissions('metro_delhi', distance),
                calories: calculateCaloriesBurned('walking', 0.5), // Walking to station
                description: 'Fastest in traffic, low carbon',
            },
            {
                id: 'cycle',
                name: 'Cycle',
                icon: <span className="text-lg">🚴</span>,
                cost: 0,
                time: estimateTravelTime(distance, 'cycle'),
                co2: 0,
                calories: calculateCaloriesBurned('cycling', distance),
                description: `Burn ${Math.round(calculateCaloriesBurned('cycling', distance))} calories`,
            },
            {
                id: 'walk',
                name: 'Walk',
                icon: <span className="text-lg">🚶</span>,
                cost: 0,
                time: estimateTravelTime(distance, 'walk'),
                co2: 0,
                calories: calculateCaloriesBurned('walking', distance),
                description: `Burn ${Math.round(calculateCaloriesBurned('walking', distance))} calories`,
            },
        ];

        // Mark highlights
        const sorted = [...opts];
        const cheapest = sorted.reduce((min, opt) => opt.cost < min.cost ? opt : min);
        const fastest = sorted.filter(o => o.id !== 'walk' && o.id !== 'cycle')
            .reduce((min, opt) => opt.time < min.time ? opt : min);
        const healthiest = sorted.reduce((max, opt) => opt.calories > max.calories ? opt : max);
        const greenest = sorted.filter(o => o.cost > 0).reduce((min, opt) => opt.co2 < min.co2 ? opt : min);

        return opts.map(opt => ({
            ...opt,
            highlight:
                opt.id === healthiest.id ? 'healthiest' :
                    opt.id === cheapest.id && opt.cost > 0 ? 'cheapest' :
                        opt.id === greenest.id ? 'greenest' :
                            opt.id === fastest.id ? 'fastest' :
                                undefined
        }));
    }, [distance]);

    // Calculate savings vs Ola
    const savingsVsOla = useMemo(() => {
        const ola = options.find(o => o.id === 'ola');
        if (!ola) return 0;
        const cheapest = Math.min(...options.filter(o => o.cost > 0).map(o => o.cost));
        return ola.cost - cheapest;
    }, [options]);

    const hasLocations = distance > 0;

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white">
            {/* Header */}
            <header className="px-6 pt-8 pb-2">
                <Link
                    href="/track"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <Car size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Transport Compare</h1>
                        <p className="text-white/40 text-sm">Find the smartest way to get there</p>
                    </div>
                </div>
            </header>

            {/* Location Inputs */}
            <div className="px-6 py-6 space-y-4">
                <LocationInput
                    label="From"
                    placeholder="Enter starting point..."
                    useCurrentLocation={true}
                    onLocationChange={handleOriginChange}
                    accentColor="blue"
                />

                <LocationInput
                    label="To"
                    placeholder="Where are you going?"
                    onLocationChange={handleDestinationChange}
                    accentColor="orange"
                />

                {/* Manual distance fallback */}
                {!hasLocations && (
                    <div className="pt-2">
                        <div className="text-center text-white/30 text-xs mb-3">or enter distance manually</div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={0.5}
                                max={30}
                                step={0.5}
                                value={manualDistance ?? 5}
                                onChange={(e) => setManualDistance(Number(e.target.value))}
                                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-blue-500
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:cursor-pointer"
                            />
                            <div className="text-lg font-semibold text-white min-w-[60px] text-right tabular-nums">
                                {(manualDistance ?? 5).toFixed(1)} <span className="text-sm font-normal text-white/40">km</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Distance Badge */}
            <AnimatePresence>
                {hasLocations && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-6 pb-4"
                    >
                        <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 rounded-full border border-white/10">
                            <MapPin size={14} className="text-blue-400" />
                            <span className="text-sm text-white/70">
                                Distance: <span className="font-semibold text-white">{distance.toFixed(1)} km</span>
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence mode="wait">
                {(hasLocations || manualDistance !== null) && options.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-6 pb-8"
                    >
                        {/* Savings Hero */}
                        {savingsVsOla > 10 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <TrendingDown size={24} className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-400/80">You could save</p>
                                        <p className="text-3xl font-bold text-green-400 tracking-tight">
                                            ₹{savingsVsOla}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Options Grid */}
                        <div className="space-y-3">
                            {options.map((option, index) => (
                                <motion.div
                                    key={option.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`
                    relative overflow-hidden p-4 rounded-2xl border transition-all
                    ${option.highlight === 'cheapest'
                                            ? 'bg-green-500/5 border-green-500/30'
                                            : option.highlight === 'healthiest'
                                                ? 'bg-orange-500/5 border-orange-500/30'
                                                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                        }
                  `}
                                >
                                    {/* Highlight Badge */}
                                    {option.highlight && (
                                        <div className={`
                      absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md
                      ${option.highlight === 'cheapest' ? 'bg-green-500/20 text-green-400' : ''}
                      ${option.highlight === 'healthiest' ? 'bg-orange-500/20 text-orange-400' : ''}
                      ${option.highlight === 'fastest' ? 'bg-blue-500/20 text-blue-400' : ''}
                      ${option.highlight === 'greenest' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                    `}>
                                            {option.highlight}
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                                            {option.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-white">{option.name}</h3>
                                                <span className={`
                          text-xl font-bold tabular-nums
                          ${option.cost === 0 ? 'text-green-400' : 'text-white'}
                        `}>
                                                    {option.cost === 0 ? 'Free' : `₹${option.cost}`}
                                                </span>
                                            </div>

                                            <p className="text-xs text-white/40 mb-3">{option.description}</p>

                                            {/* Stats Row */}
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center gap-1.5 text-white/50">
                                                    <Clock size={12} />
                                                    <span>{option.time} min</span>
                                                </div>
                                                {option.calories > 0 && (
                                                    <div className="flex items-center gap-1.5 text-orange-400">
                                                        <Flame size={12} />
                                                        <span>{Math.round(option.calories)} cal</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-white/30">
                                                    <Leaf size={12} />
                                                    <span>{option.co2 > 0 ? `${option.co2}g` : '0'} CO₂</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-white/30">
                                Prices based on current Ola/Uber rates in major cities
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!hasLocations && manualDistance === null && (
                <div className="px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                        <MapPin size={28} className="text-white/20" />
                    </div>
                    <p className="text-white/40 text-sm">
                        Enter your destination to see transport options
                    </p>
                </div>
            )}
        </div>
    );
}
