'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bike, MapPin, TrendingDown, Clock, Package, Wallet, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Delivery cost data for India
const DELIVERY_DATA = {
    swiggy: { baseFee: 35, perKm: 5, platformFee: 5, surgePeak: 1.5 },
    zomato: { baseFee: 30, perKm: 5, platformFee: 4, surgePeak: 1.4 },
    blinkit: { baseFee: 25, perKm: 4, platformFee: 3, surgePeak: 1.3 },
};

// Fuel cost for self-pickup
const FUEL_COST_PER_KM = 5; // ₹5/km for two-wheeler
const TIME_PER_KM = 3; // minutes per km in city

export default function DeliveryPage() {
    const [distance, setDistance] = useState(3);
    const [orderValue, setOrderValue] = useState(300);
    const [isPeakHour, setIsPeakHour] = useState(false);

    // Calculate costs
    const costs = useMemo(() => {
        const surge = isPeakHour ? 1.4 : 1;

        // Delivery cost breakdown
        const deliveryFee = Math.round((DELIVERY_DATA.swiggy.baseFee + distance * DELIVERY_DATA.swiggy.perKm) * surge);
        const platformFee = DELIVERY_DATA.swiggy.platformFee;
        const packingCharges = 15;
        const totalDelivery = deliveryFee + platformFee + packingCharges;

        // Pickup cost (fuel for round trip)
        const pickupFuel = Math.round(distance * 2 * FUEL_COST_PER_KM);
        const pickupTime = Math.round(distance * 2 * TIME_PER_KM);

        // Savings
        const savings = totalDelivery - pickupFuel;

        return {
            deliveryFee,
            platformFee,
            packingCharges,
            totalDelivery,
            pickupFuel,
            pickupTime,
            savings
        };
    }, [distance, isPeakHour]);

    // Is pickup worth it?
    const pickupWorthIt = costs.savings > 20 && costs.pickupTime < 25;

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
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <Bike size={20} className="text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Delivery vs Pickup</h1>
                        <p className="text-white/40 text-sm">See the hidden fees</p>
                    </div>
                </div>
            </header>

            {/* Inputs */}
            <div className="px-6 py-4 space-y-4">
                {/* Distance */}
                <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-orange-400" />
                            <span className="text-white/60 text-sm font-medium">Restaurant Distance</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={0.5}
                                max={15}
                                step={0.5}
                                value={distance}
                                onChange={(e) => setDistance(Math.max(0.5, Number(e.target.value) || 0.5))}
                                className="w-12 bg-transparent text-right text-xl font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-white/40 text-lg">km</span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min={0.5}
                        max={10}
                        step={0.5}
                        value={Math.min(distance, 10)}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-5
                            [&::-webkit-slider-thumb]:h-5
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-orange-500
                            [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                </div>

                {/* Peak Hour Toggle */}
                <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-yellow-400" />
                            <span className="text-white/80 text-sm font-medium">Peak Hour (12-2pm, 7-10pm)</span>
                        </div>
                        <button
                            onClick={() => setIsPeakHour(!isPeakHour)}
                            className={`w-12 h-7 rounded-full transition-colors ${isPeakHour ? 'bg-yellow-500' : 'bg-white/10'
                                }`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${isPeakHour ? 'translate-x-5' : ''
                                }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Comparison Cards */}
            <div className="px-6 space-y-4">
                {/* Delivery Cost */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111113] border border-white/[0.08] rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Package size={18} className="text-red-400" />
                            <h3 className="text-white font-semibold">Delivery</h3>
                        </div>
                        <div className="text-2xl font-bold text-red-400">₹{costs.totalDelivery}</div>
                    </div>

                    {/* Fee breakdown */}
                    <div className="space-y-2 pt-3 border-t border-white/5">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Delivery fee</span>
                            <span className="text-white/70">₹{costs.deliveryFee}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Platform fee</span>
                            <span className="text-white/70">₹{costs.platformFee}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Packing charges</span>
                            <span className="text-white/70">₹{costs.packingCharges}</span>
                        </div>
                    </div>

                    {isPeakHour && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-yellow-500/10 rounded-lg">
                            <AlertTriangle size={14} className="text-yellow-400" />
                            <span className="text-xs text-yellow-400">Peak hour surge applied</span>
                        </div>
                    )}
                </motion.div>

                {/* Pickup Cost */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`rounded-2xl p-5 border ${pickupWorthIt
                            ? 'bg-green-500/5 border-green-500/30'
                            : 'bg-[#111113] border-white/[0.08]'
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Bike size={18} className="text-green-400" />
                            <h3 className="text-white font-semibold">Self Pickup</h3>
                            {pickupWorthIt && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] uppercase font-bold rounded">
                                    Recommended
                                </span>
                            )}
                        </div>
                        <div className="text-2xl font-bold text-green-400">₹{costs.pickupFuel}</div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/5">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Fuel cost (round trip)</span>
                            <span className="text-white/70">₹{costs.pickupFuel}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Time (round trip)</span>
                            <span className="text-white/70">{costs.pickupTime} min</span>
                        </div>
                    </div>
                </motion.div>

                {/* Savings Summary */}
                {costs.savings > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Wallet size={20} className="text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-green-400/70">You save by picking up</p>
                                <p className="text-xl font-bold text-green-400">₹{costs.savings}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-xs text-white/40">Time cost</p>
                                <p className="text-sm text-white/60">{costs.pickupTime} min</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Tip */}
                <div className="p-4 bg-[#111113] border border-white/[0.06] rounded-xl">
                    <p className="text-xs text-white/40 leading-relaxed">
                        💡 <span className="text-white/60">Pro tip:</span> If the restaurant is &lt;2km away, pickup almost always saves ₹50+ per order.
                    </p>
                </div>
            </div>
        </div>
    );
}
