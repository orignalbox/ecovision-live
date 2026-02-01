'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Tv, Wifi, Smartphone, Leaf, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { STREAMING } from '@/lib/emissions';
import { MOBILE_DATA_RATES, calculateStreamingDataCost } from '@/lib/pricing';

interface QualityOption {
    id: keyof typeof STREAMING.data_per_hour;
    name: string;
    resolution: string;
    dataPerHour: number;
    co2PerHour: number;
}

const QUALITY_OPTIONS: QualityOption[] = [
    { id: '4k', name: '4K Ultra HD', resolution: '2160p', dataPerHour: STREAMING.data_per_hour['4k'], co2PerHour: STREAMING.emissions_per_hour['4k'] },
    { id: '1080p', name: 'Full HD', resolution: '1080p', dataPerHour: STREAMING.data_per_hour['1080p'], co2PerHour: STREAMING.emissions_per_hour['1080p'] },
    { id: '720p', name: 'HD', resolution: '720p', dataPerHour: STREAMING.data_per_hour['720p'], co2PerHour: STREAMING.emissions_per_hour['720p'] },
    { id: '480p', name: 'SD', resolution: '480p', dataPerHour: STREAMING.data_per_hour['480p'], co2PerHour: STREAMING.emissions_per_hour['480p'] },
    { id: 'audio_only', name: 'Audio Only', resolution: 'Music', dataPerHour: STREAMING.data_per_hour['audio_only'], co2PerHour: STREAMING.emissions_per_hour['audio_only'] },
];

export default function StreamingPage() {
    const [hours, setHours] = useState(2);
    const [isMobile, setIsMobile] = useState(true);
    const [dataRate, setDataRate] = useState<number>(MOBILE_DATA_RATES.average);

    const calculations = useMemo(() => {
        return QUALITY_OPTIONS.map(option => {
            const totalData = option.dataPerHour * hours;
            const dataCost = isMobile ? calculateStreamingDataCost(totalData, dataRate) : 0;
            const totalCo2 = (option.co2PerHour * hours) / 1000;
            return { ...option, totalData, dataCost, totalCo2 };
        });
    }, [hours, isMobile, dataRate]);

    const fourKOption = calculations[0];
    const maxData = fourKOption.totalData;

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white">
            <header className="px-6 pt-8 pb-2">
                <Link href="/track" className="inline-flex items-center gap-2 text-[rgba(250,250,250,0.4)] hover:text-white mb-6 text-sm font-medium transition-colors">
                    <ArrowLeft size={16} />Back
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                        <Tv size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Streaming Data</h1>
                        <p className="text-[rgba(250,250,250,0.4)] text-sm">What Netflix really costs</p>
                    </div>
                </div>
            </header>

            <div className="px-6 py-5">
                <div className="bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Tv size={16} className="text-purple-400" />
                        <span className="text-[rgba(250,250,250,0.6)] text-sm">Watch time</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input type="range" min={0.5} max={8} step={0.5} value={hours}
                            onChange={(e) => setHours(Number(e.target.value))} className="flex-1" />
                        <div className="text-2xl font-bold text-white min-w-[70px] text-right tabular-nums">
                            {hours} <span className="text-sm font-normal text-[rgba(250,250,250,0.4)]">hrs</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-5">
                <div className="flex gap-2">
                    <button onClick={() => setIsMobile(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${isMobile ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 'bg-[#111113] border-[rgba(255,255,255,0.06)] text-[rgba(250,250,250,0.5)]'
                            }`}>
                        <Smartphone size={16} /><span className="text-sm font-medium">Mobile</span>
                    </button>
                    <button onClick={() => setIsMobile(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${!isMobile ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 'bg-[#111113] border-[rgba(255,255,255,0.06)] text-[rgba(250,250,250,0.5)]'
                            }`}>
                        <Wifi size={16} /><span className="text-sm font-medium">WiFi</span>
                    </button>
                </div>
                {isMobile && (
                    <div className="mt-3 flex items-center justify-between text-sm text-[rgba(250,250,250,0.5)] px-1">
                        <span>Data rate:</span>
                        <select value={dataRate} onChange={(e) => setDataRate(Number(e.target.value))}
                            className="bg-[#18181B] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-1.5 text-white text-sm">
                            <option value={10}>₹10/GB</option>
                            <option value={12}>₹12/GB</option>
                            <option value={15}>₹15/GB</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="px-6 space-y-2.5">
                {calculations.map((option, index) => {
                    const dataWidth = (option.totalData / maxData) * 100;
                    const is4K = option.id === '4k';
                    const isLowest = option.id === 'audio_only';
                    const savings = fourKOption.dataCost - option.dataCost;

                    return (
                        <motion.div key={option.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={`p-4 rounded-xl border ${is4K ? 'bg-red-500/5 border-red-500/20' :
                                    isLowest ? 'bg-green-500/10 border-green-500/25' :
                                        'bg-[#111113] border-[rgba(255,255,255,0.06)]'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-white text-[15px]">{option.name}</h3>
                                    <p className="text-xs text-[rgba(250,250,250,0.35)]">{option.resolution}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white tabular-nums">{option.totalData.toFixed(1)} GB</div>
                                    {isMobile && (
                                        <div className={`text-sm font-medium ${is4K ? 'text-red-400' : option.dataCost === 0 ? 'text-green-400' : 'text-[rgba(250,250,250,0.5)]'}`}>
                                            ₹{option.dataCost}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-1.5 bg-[#0A0A0B] rounded-full overflow-hidden mb-3">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${dataWidth}%` }}
                                    transition={{ delay: index * 0.04 + 0.2, duration: 0.5 }}
                                    className={`h-full rounded-full ${is4K ? 'bg-red-400' : dataWidth < 25 ? 'bg-green-500' : dataWidth < 50 ? 'bg-yellow-400' : 'bg-orange-400'
                                        }`}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {isMobile && savings > 0 && (
                                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-md">Save ₹{savings}</span>
                                )}
                                <span className="flex items-center gap-1 text-xs bg-white/5 text-[rgba(250,250,250,0.35)] px-2 py-1 rounded-md">
                                    <Leaf size={10} />{(option.totalCo2 * 1000).toFixed(0)}g CO₂
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="px-6 py-6">
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-3">
                    <TrendingDown size={20} className="text-purple-400 flex-shrink-0" />
                    <p className="text-sm text-purple-300">
                        <span className="font-bold">4K uses {(fourKOption.totalData / calculations[3].totalData).toFixed(0)}x more data</span> than SD.
                        On a phone, you won&apos;t see the difference.
                    </p>
                </div>
            </div>

            <div className="px-6 pb-safe">
                <div className="p-4 bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-xl flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <p className="text-xs text-[rgba(250,250,250,0.45)]">
                        <span className="text-white font-medium">Pro tip:</span> Download on WiFi before leaving. Zero mobile data, works offline.
                    </p>
                </div>
            </div>

            <div className="h-20" />
        </div>
    );
}
