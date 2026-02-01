'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Thermometer, Lightbulb, Fan, Tv, Leaf, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { APPLIANCE_POWER, GRID_EMISSION_FACTOR, calculateEnergyEmissions } from '@/lib/emissions';
import { ELECTRICITY_RATES, calculateElectricityCost } from '@/lib/pricing';

interface Appliance {
    id: keyof typeof APPLIANCE_POWER;
    name: string;
    icon: React.ReactNode;
    defaultHours: number;
    color: string;
    tips?: { action: string; savings: number }[];
}

const APPLIANCES: Appliance[] = [
    {
        id: 'ac_1_5ton',
        name: 'AC (1.5 ton)',
        icon: <Thermometer size={20} />,
        defaultHours: 6,
        color: 'blue',
        tips: [
            { action: 'Set to 26°C instead of 22°C', savings: 24 },
            { action: 'Use fan + AC at 28°C', savings: 40 },
            { action: 'Clean filters monthly', savings: 10 },
        ],
    },
    {
        id: 'geyser_15l',
        name: 'Geyser',
        icon: <Zap size={20} />,
        defaultHours: 0.5,
        color: 'orange',
        tips: [
            { action: 'Shower 2 min less', savings: 30 },
            { action: 'Turn off when not heating', savings: 40 },
        ],
    },
    {
        id: 'fan_ceiling',
        name: 'Fan',
        icon: <Fan size={20} />,
        defaultHours: 8,
        color: 'green',
        tips: [],
    },
    {
        id: 'tv_led_55',
        name: 'TV (55")',
        icon: <Tv size={20} />,
        defaultHours: 4,
        color: 'purple',
        tips: [
            { action: 'Reduce brightness 20%', savings: 20 },
        ],
    },
    {
        id: 'refrigerator',
        name: 'Fridge',
        icon: <span className="text-lg">🧊</span>,
        defaultHours: 24,
        color: 'cyan',
        tips: [
            { action: 'Keep away from heat', savings: 15 },
        ],
    },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400' },
    orange: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400' },
    green: { bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-400' },
    purple: { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-400' },
    cyan: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-400' },
};

export default function EnergyPage() {
    const [selectedAppliance, setSelectedAppliance] = useState<Appliance>(APPLIANCES[0]);
    const [hours, setHours] = useState(selectedAppliance.defaultHours);
    const [city, setCity] = useState<keyof typeof ELECTRICITY_RATES>('average');

    const calculation = useMemo(() => {
        const watts = APPLIANCE_POWER[selectedAppliance.id];
        const kwhPerDay = (watts * hours) / 1000;
        const cost = calculateElectricityCost(kwhPerDay, city);
        const emissions = calculateEnergyEmissions(watts, hours);

        return {
            watts,
            kwhPerDay,
            cost,
            emissions,
        };
    }, [selectedAppliance, hours, city]);

    const potentialSavings = useMemo(() => {
        if (!selectedAppliance.tips || selectedAppliance.tips.length === 0) return 0;
        const maxSaving = Math.max(...selectedAppliance.tips.map(t => t.savings));
        return Math.round(calculation.cost.monthly * (maxSaving / 100));
    }, [selectedAppliance, calculation]);

    const colors = colorMap[selectedAppliance.color];

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white">
            {/* Header */}
            <header className="px-6 pt-8 pb-2">
                <Link
                    href="/track"
                    className="inline-flex items-center gap-2 text-[rgba(250,250,250,0.4)] hover:text-white mb-6 text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                        <Zap size={20} className={colors.text} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Energy Cost</h1>
                        <p className="text-[rgba(250,250,250,0.4)] text-sm">What your appliances really cost</p>
                    </div>
                </div>
            </header>

            {/* Appliance Selector */}
            <div className="px-6 py-5">
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {APPLIANCES.map((appliance) => {
                        const isSelected = selectedAppliance.id === appliance.id;
                        const appColors = colorMap[appliance.color];
                        return (
                            <button
                                key={appliance.id}
                                onClick={() => {
                                    setSelectedAppliance(appliance);
                                    setHours(appliance.defaultHours);
                                }}
                                className={`
                  flex-shrink-0 px-4 py-3 rounded-xl border transition-all duration-200
                  ${isSelected
                                        ? `${appColors.bg} ${appColors.border} ${appColors.text}`
                                        : 'bg-[#111113] border-[rgba(255,255,255,0.06)] text-[rgba(250,250,250,0.5)] hover:border-[rgba(255,255,255,0.15)]'
                                    }
                `}
                            >
                                <div className="flex items-center gap-2">
                                    {appliance.icon}
                                    <span className="text-sm font-medium whitespace-nowrap">{appliance.name}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Hours Slider */}
            <div className="px-6 pb-6">
                <div className="bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[rgba(250,250,250,0.6)] text-sm">Hours per day</span>
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value as keyof typeof ELECTRICITY_RATES)}
                            className="bg-[#18181B] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[rgba(255,255,255,0.25)]"
                        >
                            <option value="average">Avg (₹6/kWh)</option>
                            <option value="delhi">Delhi (₹5.5)</option>
                            <option value="mumbai">Mumbai (₹6.5)</option>
                            <option value="bangalore">Bangalore (₹6)</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min={0.5}
                            max={24}
                            step={0.5}
                            value={hours}
                            onChange={(e) => setHours(Number(e.target.value))}
                            className="flex-1"
                        />
                        <div className="text-2xl font-bold text-white min-w-[70px] text-right tabular-nums">
                            {hours} <span className="text-sm font-normal text-[rgba(250,250,250,0.4)]">hrs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost Display */}
            <div className="px-6 pb-6">
                <motion.div
                    key={`${selectedAppliance.id}-${hours}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative overflow-hidden rounded-2xl p-6 ${colors.bg} border ${colors.border}`}
                >
                    {/* Gradient glow */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.02] to-transparent" />

                    <div className="relative z-10">
                        <div className="text-center mb-6">
                            <div className="text-[rgba(250,250,250,0.5)] text-sm mb-2">This costs you</div>
                            <div className="text-5xl font-bold text-white tabular-nums tracking-tight">
                                ₹{calculation.cost.daily.toLocaleString()}
                                <span className="text-xl font-normal text-[rgba(250,250,250,0.4)]">/day</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-4 bg-[#0A0A0B]/50 rounded-xl">
                                <div className="text-xl font-bold text-white tabular-nums">₹{calculation.cost.monthly.toLocaleString()}</div>
                                <div className="text-xs text-[rgba(250,250,250,0.4)]">per month</div>
                            </div>
                            <div className="text-center p-4 bg-[#0A0A0B]/50 rounded-xl">
                                <div className="text-xl font-bold text-white tabular-nums">₹{calculation.cost.yearly.toLocaleString()}</div>
                                <div className="text-xs text-[rgba(250,250,250,0.4)]">per year</div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[rgba(250,250,250,0.35)] text-sm">
                            <Leaf size={14} />
                            <span>{calculation.emissions.monthly.toFixed(1)} kg CO₂/month</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tips */}
            {selectedAppliance.tips && selectedAppliance.tips.length > 0 && (
                <div className="px-6 pb-6">
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-white">
                        <Lightbulb size={16} className="text-yellow-400" />
                        Cut this bill
                    </h3>
                    <div className="space-y-2">
                        {selectedAppliance.tips.map((tip, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className="flex items-center justify-between p-4 bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-xl"
                            >
                                <span className="text-[rgba(250,250,250,0.6)] text-sm">{tip.action}</span>
                                <span className="text-green-400 font-semibold text-sm bg-green-500/10 px-2.5 py-1 rounded-md">
                                    -{tip.savings}%
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {potentialSavings > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
                        >
                            <TrendingDown size={20} className="text-green-400" />
                            <p className="text-sm text-green-400">
                                <span className="font-bold">Save up to ₹{potentialSavings}</span>/month
                            </p>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="px-6 pb-safe">
                <div className="p-4 bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-xl">
                    <p className="text-xs text-[rgba(250,250,250,0.35)]">
                        Based on {calculation.watts}W at ₹{ELECTRICITY_RATES[city]}/kWh. Actual costs vary by tariff slab.
                    </p>
                </div>
            </div>

            <div className="h-20" />
        </div>
    );
}
