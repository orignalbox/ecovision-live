'use client';

import { motion } from 'framer-motion';
import { Car, Bike, Zap, ArrowRight, Sparkles, TrendingUp, Flame } from 'lucide-react';
import Link from 'next/link';

interface Tool {
    id: string;
    name: string;
    tagline: string;
    icon: React.ReactNode;
    gradient: string;
    borderColor: string;
    stat: string;
    statLabel: string;
}

const tools: Tool[] = [
    {
        id: 'transport',
        name: 'Transport',
        tagline: 'Ola vs Metro vs Walk',
        icon: <Car size={22} />,
        gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
        borderColor: 'hover:border-blue-500/40',
        stat: '₹180',
        statLabel: 'avg savings',
    },
    {
        id: 'delivery',
        name: 'Delivery',
        tagline: 'Hidden fees exposed',
        icon: <Bike size={22} />,
        gradient: 'from-orange-500/20 via-orange-500/5 to-transparent',
        borderColor: 'hover:border-orange-500/40',
        stat: '₹62',
        statLabel: 'per order',
    },
    {
        id: 'energy',
        name: 'Energy',
        tagline: 'What your AC costs',
        icon: <Zap size={22} />,
        gradient: 'from-yellow-500/20 via-yellow-500/5 to-transparent',
        borderColor: 'hover:border-yellow-500/40',
        stat: '₹126',
        statLabel: 'per day',
    },
];

export default function TrackPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0B]">
            {/* Hero Section */}
            <header className="px-6 pt-12 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181B] border border-[rgba(255,255,255,0.08)] mb-6">
                        <Sparkles size={12} className="text-yellow-400" />
                        <span className="text-xs font-medium text-[rgba(250,250,250,0.65)]">
                            3 tools to save money
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-[2.5rem] font-bold tracking-tight leading-[1.1] text-white mb-3">
                        Track &<br />
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            Compare
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-[rgba(250,250,250,0.5)] text-base max-w-[280px] leading-relaxed">
                        Stop overpaying. See what things actually cost before you decide.
                    </p>
                </motion.div>
            </header>

            {/* Tools Grid */}
            <section className="px-6 pb-8">
                <div className="space-y-3">
                    {tools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                        >
                            <Link href={`/track/${tool.id}`} className="block">
                                <div
                                    className={`
                                        group relative overflow-hidden
                                        bg-[#111113] border border-[rgba(255,255,255,0.06)]
                                        rounded-2xl p-5
                                        transition-all duration-300 ease-out
                                        hover:bg-[#18181B] ${tool.borderColor}
                                        hover:shadow-lg hover:shadow-black/20
                                        active:scale-[0.98]
                                    `}
                                >
                                    {/* Gradient overlay */}
                                    <div
                                        className={`
                                            absolute inset-0 bg-gradient-to-r ${tool.gradient}
                                            opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                        `}
                                    />

                                    {/* Content */}
                                    <div className="relative z-10 flex items-center gap-4">
                                        {/* Icon */}
                                        <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                                            {tool.icon}
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold text-lg mb-0.5">{tool.name}</h3>
                                            <p className="text-[rgba(250,250,250,0.4)] text-sm">{tool.tagline}</p>
                                        </div>

                                        {/* Stat */}
                                        <div className="text-right">
                                            <div className="text-white font-bold text-lg tabular-nums">{tool.stat}</div>
                                            <div className="text-white/40 text-xs">{tool.statLabel}</div>
                                        </div>

                                        {/* Arrow */}
                                        <ArrowRight size={18} className="text-white/30 group-hover:text-white/60 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Stats Summary */}
            <section className="px-6 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="bg-gradient-to-br from-green-500/10 via-[#111113] to-[#111113] border border-green-500/20 rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-green-400/80 font-medium uppercase tracking-wider">Monthly potential</p>
                            <p className="text-2xl font-bold text-green-400 tabular-nums tracking-tight">₹3,000+</p>
                        </div>
                    </div>
                    <p className="text-sm text-[rgba(250,250,250,0.5)] leading-relaxed">
                        That's what conscious choices can save you every month.
                    </p>
                </motion.div>
            </section>

            {/* Quick Tip */}
            <section className="px-6 pb-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-start gap-3 p-4 bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-xl"
                >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <Flame size={16} className="text-orange-400" />
                    </div>
                    <div>
                        <p className="text-sm text-white font-medium mb-0.5">Quick win</p>
                        <p className="text-xs text-[rgba(250,250,250,0.4)] leading-relaxed">
                            Pickup food within 2km = save ₹60+ per order. No surge, no fees.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Bottom spacing for nav */}
            <div className="h-24" />
        </div>
    );
}
