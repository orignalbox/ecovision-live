'use client';

import { motion } from 'framer-motion';
import { Scan, Leaf, Droplets, Wind, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-500 rounded-full blur-[100px]"
                    />
                </div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center max-w-xl mx-auto"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex p-5 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-3xl mb-6 border border-white/10"
                    >
                        <Leaf size={44} className="text-green-400" />
                    </motion.div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-green-200 bg-clip-text text-transparent">
                        EcoVision
                    </h1>

                    <p className="text-lg sm:text-xl text-white/60 mb-3 font-light">
                        See the true cost of everything you buy
                    </p>

                    <p className="text-sm text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
                        Scan any product to reveal its environmental footprint — carbon emissions, water usage, and greener alternatives.
                    </p>

                    {/* CTA Button */}
                    <Link href="/scanner">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg inline-flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            <Scan size={20} />
                            Launch Scanner
                            <ArrowRight size={20} />
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Feature Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="relative z-10 mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto w-full px-4"
                >
                    <FeatureCard icon={<Wind size={24} />} title="Carbon" description="Track CO₂ emissions" color="cyan" />
                    <FeatureCard icon={<Droplets size={24} />} title="Water" description="See water costs" color="blue" />
                    <FeatureCard icon={<Sparkles size={24} />} title="Alternatives" description="Greener swaps" color="green" />
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center"
                >
                    <span className="text-xs uppercase tracking-widest mb-2">Scroll</span>
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ChevronDown size={20} />
                    </motion.div>
                </motion.div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6 border-t border-white/5">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-12 text-white">How It Works</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <StepCard number="1" title="Scan" description="Point camera at any product" />
                        <StepCard number="2" title="Analyze" description="AI calculates impact" />
                        <StepCard number="3" title="Discover" description="Get eco scores & alternatives" />
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 px-6 bg-gradient-to-t from-green-900/20 to-transparent">
                <div className="max-w-xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4 text-white">Ready to see the truth?</h2>
                    <p className="text-white/50 mb-8">Start making sustainable choices.</p>
                    <Link href="/scanner">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-green-500 text-black font-bold rounded-full text-lg inline-flex items-center gap-2"
                        >
                            <Scan size={20} />
                            Start Scanning
                        </motion.button>
                    </Link>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
    const colors: Record<string, string> = {
        cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
        green: 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400',
    };

    return (
        <div className={`p-5 rounded-2xl bg-gradient-to-b ${colors[color]} border`}>
            <div className="mb-2">{icon}</div>
            <h3 className="text-white font-bold mb-1">{title}</h3>
            <p className="text-white/50 text-sm">{description}</p>
        </div>
    );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
    return (
        <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold mx-auto mb-4 text-cyan-400">
                {number}
            </div>
            <h3 className="text-white font-bold mb-2">{title}</h3>
            <p className="text-white/50 text-sm">{description}</p>
        </div>
    );
}
