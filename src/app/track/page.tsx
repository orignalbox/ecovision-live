'use client';

import { motion } from 'framer-motion';
import {
    Car, Bike, Zap, Beef, Tv, ShoppingBag,
    ArrowRight, Sparkles, TrendingUp, Flame
} from 'lucide-react';
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
    {
        id: 'diet',
        name: 'Protein',
        tagline: 'Same nutrition, less ₹',
        icon: <Beef size={22} />,
        gradient: 'from-green-500/20 via-green-500/5 to-transparent',
        borderColor: 'hover:border-green-500/40',
        stat: '3x',
        statLabel: 'cheaper',
    },
    {
        id: 'streaming',
        name: 'Streaming',
        tagline: 'Data cost per hour',
        icon: <Tv size={22} />,
        gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
        borderColor: 'hover:border-purple-500/40',
        stat: '7GB',
        statLabel: '4K vs SD',
    },
    {
        id: 'shop',
        name: 'Buy Smart',
        tagline: 'Quality saves money',
        icon: <ShoppingBag size={22} />,
        gradient: 'from-pink-500/20 via-pink-500/5 to-transparent',
        borderColor: 'hover:border-pink-500/40',
        stat: '₹424',
        statLabel: 'per year',
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
                            6 tools to save money
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
            <section className="px-6 pb-12">
                <div className="grid grid-cols-2 gap-3">
                    {tools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 + 0.2, duration: 0.4 }}
                        >
                            <Link href={`/track/${tool.id}`} className="block">
                                <div
                                    className={`
                    group relative overflow-hidden
                    bg-[#111113] border border-[rgba(255,255,255,0.06)]
                    rounded-2xl p-5 h-[160px]
                    transition-all duration-300 ease-out
                    hover:bg-[#18181B] ${tool.borderColor}
                    hover:shadow-lg hover:shadow-black/20
                    active:scale-[0.98]
                  `}
                                >
                                    {/* Gradient overlay */}
                                    <div
                                        className={`
                      absolute inset-0 bg-gradient-to-br ${tool.gradient}
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    `}
                                    />

                                    {/* Content */}
                                    <div className="relative z-10 h-full flex flex-col">
                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-auto text-white/80 group-hover:text-white transition-colors">
                                            {tool.icon}
                                        </div>

                                        {/* Text */}
                                        <div>
                                            <h3 className="text-white font-semibold text-[15px] mb-0.5">{tool.name}</h3>
                                            <p className="text-[rgba(250,250,250,0.4)] text-xs leading-snug">{tool.tagline}</p>
                                        </div>

                                        {/* Stat pill - appears on hover */}
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1">
                                                <span className="text-white text-xs font-semibold tabular-nums">{tool.stat}</span>
                                            </div>
                                        </div>

                                        {/* Arrow - appears on hover */}
                                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                                            <ArrowRight size={16} className="text-white/60" />
                                        </div>
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
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="bg-gradient-to-br from-green-500/10 via-[#111113] to-[#111113] border border-green-500/20 rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-green-400/80 font-medium uppercase tracking-wider">Monthly potential</p>
                            <p className="text-2xl font-bold text-green-400 tabular-nums tracking-tight">₹5,200+</p>
                        </div>
                    </div>
                    <p className="text-sm text-[rgba(250,250,250,0.5)] leading-relaxed">
                        That's what conscious choices can save you every month. Start with one tool.
                    </p>
                </motion.div>
            </section>

            {/* Quick Tip */}
            <section className="px-6 pb-safe">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-start gap-3 p-4 bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-xl"
                >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <Flame size={16} className="text-orange-400" />
                    </div>
                    <div>
                        <p className="text-sm text-white font-medium mb-0.5">Quick win</p>
                        <p className="text-xs text-[rgba(250,250,250,0.4)] leading-relaxed">
                            Most people save ₹60+ per order by picking up food within 2km instead of delivery.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Bottom spacing for nav */}
            <div className="h-24" />
        </div>
    );
}
