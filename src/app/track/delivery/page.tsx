'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bike, Clock, MapPin, Flame, TrendingDown, Package, Heart, Leaf, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import LocationInput from '@/components/LocationInput';
import { calculateDistance, estimateTravelTime, type Coordinates } from '@/lib/location';
import { calculateDeliveryEmissions, calculateCaloriesBurned } from '@/lib/emissions';
import { DELIVERY_CHARGES } from '@/lib/pricing';

interface PickupOption {
    id: string;
    name: string;
    icon: React.ReactNode;
    cost: number;
    time: number;
    co2: number;
    calories: number;
    quality: string;
    qualityNote?: string;
    highlight?: 'recommended' | 'healthiest' | 'fastest';
}

export default function DeliveryPage() {
    const [home, setHome] = useState<{ coords: Coordinates | null; name: string }>({ coords: null, name: '' });
    const [restaurant, setRestaurant] = useState<{ coords: Coordinates | null; name: string }>({ coords: null, name: '' });
    const [manualDistance, setManualDistance] = useState<number | null>(null);

    const handleHomeChange = useCallback((coords: Coordinates | null, name: string) => {
        setHome({ coords, name });
        setManualDistance(null);
    }, []);

    const handleRestaurantChange = useCallback((coords: Coordinates | null, name: string) => {
        setRestaurant({ coords, name });
        setManualDistance(null);
    }, []);

    // Calculate distance
    const distance = useMemo(() => {
        if (manualDistance !== null) return manualDistance;
        if (home.coords && restaurant.coords) {
            return calculateDistance(home.coords, restaurant.coords);
        }
        return 0;
    }, [home.coords, restaurant.coords, manualDistance]);

    // Delivery charges breakdown
    const deliveryCharges = useMemo(() => {
        const base = DELIVERY_CHARGES.delivery_fee.average;
        const packaging = DELIVERY_CHARGES.packaging_charge.average;
        const platform = DELIVERY_CHARGES.platform_fee.average;
        const surge = distance > 5 ? Math.round(distance * 3) : 0; // Surge for far restaurants
        return {
            delivery: base + surge,
            packaging,
            platform,
            total: base + packaging + platform + surge,
        };
    }, [distance]);

    // Build options
    const options = useMemo((): PickupOption[] => {
        if (distance === 0) return [];

        const emissions = calculateDeliveryEmissions(distance);
        const roundTrip = distance * 2;

        return [
            {
                id: 'delivery',
                name: 'Get Delivered',
                icon: <Package size={20} />,
                cost: deliveryCharges.total,
                time: 35 + Math.round(distance * 3), // More realistic delivery time
                co2: Math.round(emissions.delivery),
                calories: 0,
                quality: 'Convenient',
                qualityNote: 'May arrive lukewarm after 20+ min transit',
            },
            {
                id: 'pickup-drive',
                name: 'Pick Up (Drive)',
                icon: <span className="text-lg">🚗</span>,
                cost: Math.round(roundTrip * 8), // Fuel cost estimate
                time: estimateTravelTime(roundTrip, 'car'),
                co2: Math.round(emissions.pickupCar),
                calories: 0,
                quality: 'Fresh & Hot',
                qualityNote: 'Get it straight from the kitchen',
                highlight: 'fastest',
            },
            {
                id: 'pickup-cycle',
                name: 'Pick Up (Cycle)',
                icon: <span className="text-lg">🚴</span>,
                cost: 0,
                time: estimateTravelTime(roundTrip, 'cycle'),
                co2: 0,
                calories: Math.round(calculateCaloriesBurned('cycling', roundTrip)),
                quality: 'Fresh + Workout',
                qualityNote: `Burn ${Math.round(calculateCaloriesBurned('cycling', roundTrip))} calories while you're at it`,
                highlight: 'healthiest',
            },
            {
                id: 'pickup-walk',
                name: 'Pick Up (Walk)',
                icon: <span className="text-lg">🚶</span>,
                cost: 0,
                time: estimateTravelTime(roundTrip, 'walk'),
                co2: 0,
                calories: Math.round(calculateCaloriesBurned('walking', roundTrip)),
                quality: 'Fresh + Exercise',
                qualityNote: distance <= 1.5 ? 'Perfect for a short walk' : 'Long walk, bring headphones!',
                highlight: distance <= 1.5 ? 'recommended' : undefined,
            },
        ];
    }, [distance, deliveryCharges]);

    const hasLocations = distance > 0;
    const savings = deliveryCharges.total;

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
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <Bike size={20} className="text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Delivery vs Pickup</h1>
                        <p className="text-white/40 text-sm">Is that convenience really worth ₹{deliveryCharges.total}?</p>
                    </div>
                </div>
            </header>

            {/* Location Inputs */}
            <div className="px-6 py-6 space-y-4">
                <LocationInput
                    label="Your Location"
                    placeholder="Home, office, etc."
                    useCurrentLocation={true}
                    onLocationChange={handleHomeChange}
                    accentColor="blue"
                />

                <LocationInput
                    label="Restaurant"
                    placeholder="Search restaurant or area..."
                    onLocationChange={handleRestaurantChange}
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
                                max={10}
                                step={0.5}
                                value={manualDistance ?? 2.5}
                                onChange={(e) => setManualDistance(Number(e.target.value))}
                                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-orange-500
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:cursor-pointer"
                            />
                            <div className="text-lg font-semibold text-white min-w-[60px] text-right tabular-nums">
                                {(manualDistance ?? 2.5).toFixed(1)} <span className="text-sm font-normal text-white/40">km</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {(hasLocations || manualDistance !== null) && options.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-6 pb-8"
                    >
                        {/* The Real Cost */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                <div className="flex items-center gap-2 text-red-400 text-xs font-medium uppercase tracking-wider mb-3">
                                    <AlertCircle size={14} />
                                    What delivery really costs
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between gap-8">
                                            <span className="text-white/50">Delivery fee</span>
                                            <span className="text-white tabular-nums">₹{deliveryCharges.delivery}</span>
                                        </div>
                                        <div className="flex justify-between gap-8">
                                            <span className="text-white/50">Packaging</span>
                                            <span className="text-white tabular-nums">₹{deliveryCharges.packaging}</span>
                                        </div>
                                        <div className="flex justify-between gap-8">
                                            <span className="text-white/50">Platform fee</span>
                                            <span className="text-white tabular-nums">₹{deliveryCharges.platform}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-red-400 tabular-nums">
                                            ₹{deliveryCharges.total}
                                        </div>
                                        <div className="text-xs text-white/40">extra per order</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* If pickup saves money, highlight it */}
                        {savings > 20 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-6 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <TrendingDown size={20} className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-400/80">Pickup saves you</p>
                                        <p className="text-2xl font-bold text-green-400 tracking-tight tabular-nums">
                                            ₹{savings}/order
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Options */}
                        <div className="space-y-3">
                            {options.map((option, index) => (
                                <motion.div
                                    key={option.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`
                    relative overflow-hidden p-4 rounded-2xl border transition-all
                    ${option.id === 'delivery'
                                            ? 'bg-red-500/5 border-red-500/20'
                                            : option.highlight === 'healthiest'
                                                ? 'bg-green-500/5 border-green-500/30'
                                                : option.highlight === 'recommended'
                                                    ? 'bg-blue-500/5 border-blue-500/30'
                                                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                        }
                  `}
                                >
                                    {/* Highlight Badge */}
                                    {option.highlight && (
                                        <div className={`
                      absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md
                      ${option.highlight === 'recommended' ? 'bg-blue-500/20 text-blue-400' : ''}
                      ${option.highlight === 'healthiest' ? 'bg-green-500/20 text-green-400' : ''}
                      ${option.highlight === 'fastest' ? 'bg-purple-500/20 text-purple-400' : ''}
                    `}>
                                            {option.highlight}
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`
                      w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                      ${option.id === 'delivery' ? 'bg-red-500/10' : 'bg-white/5'}
                    `}>
                                            {option.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-white">{option.name}</h3>
                                                <span className={`
                          text-xl font-bold tabular-nums
                          ${option.cost === 0 ? 'text-green-400' : option.id === 'delivery' ? 'text-red-400' : 'text-white'}
                        `}>
                                                    {option.cost === 0 ? 'Free' : `₹${option.cost}`}
                                                </span>
                                            </div>

                                            <p className="text-xs text-white/40 mb-3">{option.qualityNote}</p>

                                            {/* Stats Row */}
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center gap-1.5 text-white/50">
                                                    <Clock size={12} />
                                                    <span>{option.time} min</span>
                                                </div>
                                                {option.calories > 0 && (
                                                    <div className="flex items-center gap-1.5 text-orange-400">
                                                        <Flame size={12} />
                                                        <span>{option.calories} cal</span>
                                                    </div>
                                                )}
                                                <div className={`flex items-center gap-1.5 ${option.quality.includes('Fresh') ? 'text-green-400' : 'text-white/30'}`}>
                                                    <Heart size={12} />
                                                    <span>{option.quality}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Monthly Impact */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 p-4 bg-white/[0.02] border border-white/10 rounded-2xl"
                        >
                            <p className="text-sm text-white/60">
                                <span className="font-semibold text-white">If you order 10×/month:</span> Pickup saves <span className="text-green-400 font-semibold">₹{savings * 10}/month</span>
                            </p>
                            <p className="text-xs text-white/30 mt-1">
                                That's ₹{savings * 120}/year — enough for a nice dinner out
                            </p>
                        </motion.div>
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
                        Enter a restaurant to see if pickup is worth it
                    </p>
                </div>
            )}
        </div>
    );
}
