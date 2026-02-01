'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Star, Clock, IndianRupee, Lightbulb, Fan, Wind, Tv, Refrigerator } from 'lucide-react';
import Link from 'next/link';

// Electricity rate in India (average)
const ELECTRICITY_RATE = 7; // ₹/kWh

// Appliance power data
const APPLIANCES = {
    ac: {
        name: 'Air Conditioner',
        emoji: '❄️',
        variants: [
            { id: 'ac_1star', name: '1 Star (1.5T)', watts: 2000, description: 'Old/basic models' },
            { id: 'ac_3star', name: '3 Star (1.5T)', watts: 1500, description: 'Standard' },
            { id: 'ac_5star', name: '5 Star (1.5T)', watts: 1100, description: 'Energy efficient' },
            { id: 'ac_inverter', name: 'Inverter 5 Star', watts: 800, description: 'Most efficient' },
        ]
    },
    fan: {
        name: 'Fan',
        emoji: '🌀',
        variants: [
            { id: 'fan_normal', name: 'Normal Ceiling Fan', watts: 75, description: 'Standard' },
            { id: 'fan_bldc', name: 'BLDC Fan', watts: 28, description: '60% less power' },
            { id: 'fan_table', name: 'Table Fan', watts: 50, description: 'Portable' },
        ]
    },
    tv: {
        name: 'Television',
        emoji: '📺',
        variants: [
            { id: 'tv_led_32', name: '32" LED TV', watts: 50, description: 'Small' },
            { id: 'tv_led_43', name: '43" LED TV', watts: 80, description: 'Medium' },
            { id: 'tv_led_55', name: '55" LED TV', watts: 120, description: 'Large' },
        ]
    },
    fridge: {
        name: 'Refrigerator',
        emoji: '🧊',
        variants: [
            { id: 'fridge_3star', name: '3 Star (250L)', watts: 150, description: 'Runs ~8hrs/day' },
            { id: 'fridge_5star', name: '5 Star (250L)', watts: 100, description: 'Efficient' },
            { id: 'fridge_inverter', name: 'Inverter (300L)', watts: 70, description: 'Most efficient' },
        ]
    },
    other: {
        name: 'Other',
        emoji: '🔌',
        variants: [
            { id: 'geyser', name: 'Water Heater/Geyser', watts: 2000, description: '15-30 min/day' },
            { id: 'iron', name: 'Iron', watts: 1000, description: '30 min/day avg' },
            { id: 'washing', name: 'Washing Machine', watts: 500, description: '1 hr/wash' },
            { id: 'microwave', name: 'Microwave', watts: 1200, description: '15-30 min/day' },
        ]
    }
};

type ApplianceCategory = keyof typeof APPLIANCES;

export default function EnergyPage() {
    const [category, setCategory] = useState<ApplianceCategory>('ac');
    const [selectedVariant, setSelectedVariant] = useState('ac_inverter');
    const [hoursPerDay, setHoursPerDay] = useState(8);

    const currentCategory = APPLIANCES[category];
    const currentVariant = currentCategory.variants.find(v => v.id === selectedVariant) || currentCategory.variants[0];

    // Calculate costs
    const costs = useMemo(() => {
        const watts = currentVariant.watts;
        const kwhPerDay = (watts * hoursPerDay) / 1000;
        const costPerDay = kwhPerDay * ELECTRICITY_RATE;
        const costPerMonth = costPerDay * 30;
        const costPerYear = costPerDay * 365;

        // Find cheapest variant for comparison
        const cheapestVariant = currentCategory.variants.reduce((min, v) =>
            v.watts < min.watts ? v : min
        );
        const cheapestCostMonth = ((cheapestVariant.watts * hoursPerDay) / 1000) * ELECTRICITY_RATE * 30;
        const potentialSavings = costPerMonth - cheapestCostMonth;

        return {
            watts,
            kwhPerDay: kwhPerDay.toFixed(1),
            costPerDay: Math.round(costPerDay),
            costPerMonth: Math.round(costPerMonth),
            costPerYear: Math.round(costPerYear),
            potentialSavings: Math.round(potentialSavings),
            cheapestVariant: cheapestVariant.name
        };
    }, [currentVariant, hoursPerDay, currentCategory]);

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
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                        <Zap size={20} className="text-yellow-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Energy Calculator</h1>
                        <p className="text-white/40 text-sm">What does it actually cost?</p>
                    </div>
                </div>
            </header>

            {/* Category Tabs */}
            <div className="px-6 pb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                    {(Object.keys(APPLIANCES) as ApplianceCategory[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setCategory(cat);
                                setSelectedVariant(APPLIANCES[cat].variants[0].id);
                            }}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            {APPLIANCES[cat].emoji} {APPLIANCES[cat].name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Variant Selection */}
            <div className="px-6 pb-4">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Select Type</p>
                <div className="space-y-2">
                    {currentCategory.variants.map((variant) => (
                        <button
                            key={variant.id}
                            onClick={() => setSelectedVariant(variant.id)}
                            className={`w-full p-4 rounded-xl border text-left transition-all ${selectedVariant === variant.id
                                    ? 'bg-yellow-500/10 border-yellow-500/40'
                                    : 'bg-[#111113] border-white/[0.06] hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">{variant.name}</p>
                                    <p className="text-white/40 text-xs">{variant.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-sm">{variant.watts}W</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Hours Slider */}
            <div className="px-6 py-4">
                <div className="bg-[#111113] border border-white/[0.08] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-yellow-400" />
                            <span className="text-white/60 text-sm font-medium">Hours per day</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={1}
                                max={24}
                                value={hoursPerDay}
                                onChange={(e) => setHoursPerDay(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                                className="w-10 bg-transparent text-right text-xl font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-white/40 text-lg">hrs</span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={24}
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-5
                            [&::-webkit-slider-thumb]:h-5
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-yellow-500
                            [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                </div>
            </div>

            {/* Cost Results */}
            <div className="px-6 space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-2xl p-5"
                >
                    <p className="text-xs text-yellow-400/70 uppercase tracking-wider mb-1">Monthly Cost</p>
                    <p className="text-4xl font-bold text-yellow-400">₹{costs.costPerMonth}</p>
                    <p className="text-sm text-white/40 mt-1">
                        {costs.kwhPerDay} kWh/day • ₹{costs.costPerDay}/day
                    </p>
                </motion.div>

                {/* Breakdown */}
                <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-white/40">Power consumption</span>
                        <span className="text-white">{costs.watts}W</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-white/40">Daily usage</span>
                        <span className="text-white">{costs.kwhPerDay} kWh</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-white/40">Rate</span>
                        <span className="text-white">₹{ELECTRICITY_RATE}/kWh</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                        <span className="text-white/40">Yearly cost</span>
                        <span className="text-white font-semibold">₹{costs.costPerYear.toLocaleString()}</span>
                    </div>
                </div>

                {/* Savings Tip */}
                {costs.potentialSavings > 50 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl"
                    >
                        <div className="flex items-start gap-3">
                            <Lightbulb size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-green-400 font-medium">
                                    Switch to {costs.cheapestVariant}
                                </p>
                                <p className="text-xs text-white/50 mt-1">
                                    Save ₹{costs.potentialSavings}/month (₹{costs.potentialSavings * 12}/year)
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
