'use client';

import { motion } from 'framer-motion';
import { Scan, Leaf, Droplets, Wind, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-void-black text-white overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
                </div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center max-w-2xl mx-auto"
                >
                    {/* Logo/Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex p-6 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-3xl mb-8 border border-white/10 backdrop-blur-md"
                    >
                        <Leaf size={48} className="text-green-400" />
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-green-200 bg-clip-text text-transparent">
                        EcoVision
                    </h1>

                    <p className="text-xl text-white/60 mb-4 font-light">
                        See the true cost of everything you buy
                    </p>

                    <p className="text-sm text-white/40 mb-10 max-w-md mx-auto">
                        Scan any product to instantly reveal its environmental footprint -
                        carbon emissions, water usage, and discover greener alternatives.
                    </p>

                    {/* CTA Button */}
                    <Link href="/scanner">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg inline-flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-shadow"
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
                    className="relative z-10 mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full"
                >
                    <FeatureCard
                        icon={<Wind size={24} />}
                        title="Carbon Footprint"
                        description="Track CO₂ emissions for every product"
                        color="cyan"
                    />
                    <FeatureCard
                        icon={<Droplets size={24} />}
                        title="Water Usage"
                        description="See hidden water costs"
                        color="blue"
                    />
                    <FeatureCard
                        icon={<Sparkles size={24} />}
                        title="Eco Alternatives"
                        description="Discover greener swaps"
                        color="green"
                    />
                </motion.div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-12 text-white">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StepCard number="1" title="Scan" description="Point your camera at any product or paste a URL" />
                        <StepCard number="2" title="Analyze" description="AI identifies the product and calculates impact" />
                        <StepCard number="3" title="Discover" description="Get eco scores and better alternatives" />
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 px-6 bg-gradient-to-t from-green-900/20 to-transparent">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4 text-white">Ready to see the truth?</h2>
                    <p className="text-white/50 mb-8">Start making informed, sustainable choices today.</p>
                    <Link href="/scanner">
                        <button className="px-8 py-4 bg-green-500 text-black font-bold rounded-full text-lg inline-flex items-center gap-2 hover:bg-green-400 transition-colors">
                            <Scan size={20} />
                            Start Scanning
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
    const colorClasses = {
        cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
        green: 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400',
    };

    return (
        <div className={`p-6 rounded-3xl bg-gradient-to-b ${colorClasses[color as keyof typeof colorClasses]} border backdrop-blur-sm`}>
            <div className="mb-3">{icon}</div>
            <h3 className="text-white font-bold mb-1">{title}</h3>
            <p className="text-white/50 text-sm">{description}</p>
        </div>
    );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
    return (
        <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold mx-auto mb-4 text-cyan-400">
                {number}
            </div>
            <h3 className="text-white font-bold mb-2">{title}</h3>
            <p className="text-white/50 text-sm">{description}</p>
        </div>
    );
}
