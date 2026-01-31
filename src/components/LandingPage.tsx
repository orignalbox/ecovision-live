'use client';

import { motion } from 'framer-motion';
import { Scan, Leaf, Droplets, Wind, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    const scrollToSection = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

    return (
        <div className="bg-void-black text-white" style={{ minHeight: '100dvh' }}>
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500 rounded-full blur-[120px]"
                    />
                </div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center max-w-2xl mx-auto"
                >
                    {/* Logo/Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex p-6 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-3xl mb-8 border border-white/10 backdrop-blur-md"
                    >
                        <Leaf size={52} className="text-green-400" />
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-green-200 bg-clip-text text-transparent">
                        EcoVision
                    </h1>

                    <p className="text-xl md:text-2xl text-white/60 mb-4 font-light">
                        See the true cost of everything you buy
                    </p>

                    <p className="text-sm md:text-base text-white/40 mb-12 max-w-md mx-auto leading-relaxed">
                        Scan any product to instantly reveal its environmental footprint —
                        carbon emissions, water usage, and discover greener alternatives.
                    </p>

                    {/* CTA Button */}
                    <Link href="/scanner">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(255,255,255,0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-5 bg-white text-black font-bold rounded-full text-lg inline-flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-shadow"
                        >
                            <Scan size={22} />
                            Launch Scanner
                            <ArrowRight size={22} />
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Feature Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="relative z-10 mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full px-4"
                >
                    <FeatureCard
                        icon={<Wind size={28} />}
                        title="Carbon Footprint"
                        description="Track CO₂ emissions for every product"
                        color="cyan"
                    />
                    <FeatureCard
                        icon={<Droplets size={28} />}
                        title="Water Usage"
                        description="See hidden water costs in production"
                        color="blue"
                    />
                    <FeatureCard
                        icon={<Sparkles size={28} />}
                        title="Eco Alternatives"
                        description="Discover greener product swaps"
                        color="green"
                    />
                </motion.div>

                {/* Scroll Indicator */}
                <motion.button
                    onClick={scrollToSection}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70 transition-colors flex flex-col items-center gap-2"
                >
                    <span className="text-xs uppercase tracking-widest">Learn More</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <ChevronDown size={24} />
                    </motion.div>
                </motion.button>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02]">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold mb-16 text-white"
                    >
                        How It Works
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <StepCard number="1" title="Scan" description="Point your camera at any product or paste a URL" delay={0} />
                        <StepCard number="2" title="Analyze" description="AI identifies the product and calculates impact" delay={0.1} />
                        <StepCard number="3" title="Discover" description="Get eco scores and better alternatives" delay={0.2} />
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-24 px-6 bg-gradient-to-t from-green-900/20 to-transparent">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <h2 className="text-4xl font-bold mb-6 text-white">Ready to see the truth?</h2>
                    <p className="text-white/50 mb-10 text-lg">Start making informed, sustainable choices today.</p>
                    <Link href="/scanner">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-5 bg-green-500 text-black font-bold rounded-full text-lg inline-flex items-center gap-3 hover:bg-green-400 transition-colors shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                        >
                            <Scan size={22} />
                            Start Scanning
                        </motion.button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
    const colorClasses = {
        cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400 hover:border-cyan-500/50',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400 hover:border-blue-500/50',
        green: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-400 hover:border-green-500/50',
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className={`p-6 rounded-3xl bg-gradient-to-b ${colorClasses[color as keyof typeof colorClasses]} border backdrop-blur-sm transition-all cursor-default`}
        >
            <div className="mb-4">{icon}</div>
            <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}

function StepCard({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="text-center"
        >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-green-500/20 border border-white/10 flex items-center justify-center text-2xl font-bold mx-auto mb-6 text-cyan-400">
                {number}
            </div>
            <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}
