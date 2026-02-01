'use client';

import { motion } from 'framer-motion';
import { Car, Bike, Zap, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

const tools = [
    {
        id: 'transport',
        name: 'Transport',
        tagline: 'Ola ₹180 vs Metro ₹25',
        description: 'See what you really pay for convenience',
        emoji: '🚗',
        gradient: 'from-blue-500/15 to-transparent',
        borderColor: 'border-blue-500/20 hover:border-blue-500/40',
        iconColor: 'text-blue-400',
    },
    {
        id: 'delivery',
        name: 'Delivery',
        tagline: '₹62 hidden per order',
        description: 'Expose platform fees, surge, packing charges',
        emoji: '🛵',
        gradient: 'from-orange-500/15 to-transparent',
        borderColor: 'border-orange-500/20 hover:border-orange-500/40',
        iconColor: 'text-orange-400',
    },
    {
        id: 'energy',
        name: 'Energy',
        tagline: 'AC costing ₹126/day',
        description: 'What your appliances actually cost per month',
        emoji: '⚡',
        gradient: 'from-yellow-500/15 to-transparent',
        borderColor: 'border-yellow-500/20 hover:border-yellow-500/40',
        iconColor: 'text-yellow-400',
    },
];

export default function TrackPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white">
            {/* Header */}
            <header className="px-6 pt-8 pb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} />
                    Home
                </Link>

                <div className="flex items-center gap-2 mb-2">
                    <Eye size={20} className="text-green-400" />
                    <span className="text-xs text-green-400/80 uppercase tracking-wider font-medium">True Cost Tools</span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Compare &<br />
                    <span className="text-white/60">Decide Better</span>
                </h1>

                <p className="text-white/40 text-sm max-w-xs">
                    Before you spend, see what you're really paying.
                </p>
            </header>

            {/* Tools */}
            <section className="px-6 pb-8 space-y-3">
                {tools.map((tool, index) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                        <Link href={`/track/${tool.id}`} className="block">
                            <div
                                className={`
                                    group relative overflow-hidden
                                    bg-[#111113] border ${tool.borderColor}
                                    rounded-2xl p-5
                                    transition-all duration-300 ease-out
                                    hover:bg-[#151517]
                                    active:scale-[0.98]
                                `}
                            >
                                {/* Gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                <div className="relative z-10">
                                    {/* Top row */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{tool.emoji}</div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                                                <p className={`text-sm font-medium ${tool.iconColor}`}>{tool.tagline}</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} className="text-white/20 group-hover:text-white/50 transition-colors mt-1" />
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-white/40 pl-11">{tool.description}</p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </section>

            {/* Monthly potential banner */}
            <section className="px-6 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="bg-gradient-to-r from-green-500/10 via-[#111113] to-[#111113] border border-green-500/20 rounded-2xl p-5"
                >
                    <p className="text-xs text-green-400/70 uppercase tracking-wider mb-1">Monthly savings potential</p>
                    <p className="text-2xl font-bold text-green-400">₹3,000+</p>
                    <p className="text-xs text-white/40 mt-1">Just by seeing the true cost first</p>
                </motion.div>
            </section>

            {/* Back to scanner */}
            <section className="px-6 pb-24">
                <Link href="/scanner">
                    <div className="flex items-center justify-center gap-2 py-3 text-white/30 hover:text-white/60 transition-colors text-sm">
                        <span>← Back to Scanner</span>
                    </div>
                </Link>
            </section>
        </div>
    );
}
