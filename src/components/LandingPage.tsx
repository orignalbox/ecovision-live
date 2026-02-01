'use client';

import { motion } from 'framer-motion';
import { Scan, ArrowRight, Eye, IndianRupee, Zap, Bike, Car, Package } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white overflow-auto">
            {/* Hero Section */}
            <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16 relative">
                {/* Subtle background gradient */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-green-500/8 via-blue-500/5 to-transparent rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 text-center max-w-lg mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] mb-8"
                    >
                        <Eye size={14} className="text-green-400" />
                        <span className="text-xs font-medium text-white/70">See what others don't</span>
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-[2.75rem] sm:text-5xl font-bold mb-4 leading-[1.1] tracking-tight">
                        The{' '}
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            True Cost
                        </span>
                        <br />of Everything
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg text-white/50 mb-10 max-w-sm mx-auto leading-relaxed font-light">
                        You're paying more than you see. We show you the full price — money, time, planet, health.
                    </p>

                    {/* Two CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/scanner">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto px-7 py-4 bg-white text-black font-semibold rounded-xl text-base inline-flex items-center justify-center gap-2.5 shadow-lg shadow-white/10"
                            >
                                <Scan size={18} />
                                Scan a Product
                            </motion.button>
                        </Link>
                        <Link href="/track">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto px-7 py-4 bg-white/[0.06] text-white font-medium rounded-xl text-base inline-flex items-center justify-center gap-2.5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <IndianRupee size={18} />
                                Compare Costs
                                <ArrowRight size={16} className="text-white/50" />
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Example true costs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="relative z-10 mt-16 w-full max-w-md mx-auto"
                >
                    <p className="text-xs text-white/30 uppercase tracking-widest text-center mb-4">What we reveal</p>
                    <div className="grid grid-cols-2 gap-3">
                        <TrueCostCard
                            icon={<Package size={18} />}
                            label="Hidden fees"
                            example="₹62 on every delivery"
                            color="orange"
                        />
                        <TrueCostCard
                            icon={<Car size={18} />}
                            label="Transport"
                            example="₹180 vs ₹25 for same trip"
                            color="blue"
                        />
                        <TrueCostCard
                            icon={<Zap size={18} />}
                            label="Energy drain"
                            example="₹3,800/month AC cost"
                            color="yellow"
                        />
                        <TrueCostCard
                            icon={<Bike size={18} />}
                            label="Health cost"
                            example="200 cal you skipped"
                            color="green"
                        />
                    </div>
                </motion.div>
            </section>

            {/* How It Works */}
            <section className="py-16 px-6 border-t border-white/[0.05]">
                <div className="max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold mb-2 text-center">How It Works</h2>
                    <p className="text-white/40 text-sm text-center mb-10">Simple. Instant. Eye-opening.</p>

                    <div className="space-y-6">
                        <StepCard
                            number="1"
                            title="Choose what to check"
                            description="Scan a product, or compare transport/delivery/energy costs"
                        />
                        <StepCard
                            number="2"
                            title="See the true cost"
                            description="Money, time, environmental impact, health — the full picture"
                        />
                        <StepCard
                            number="3"
                            title="Make better choices"
                            description="Pick the option that actually makes sense for you"
                        />
                    </div>
                </div>
            </section>

            {/* Impact Stats */}
            <section className="py-16 px-6 border-t border-white/[0.05]">
                <div className="max-w-lg mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-2">One Month of True Cost</h2>
                    <p className="text-white/40 text-sm mb-10">What conscious choices can save you</p>

                    <div className="bg-gradient-to-br from-green-500/10 via-[#111113] to-[#111113] border border-green-500/20 rounded-2xl p-6">
                        <div className="grid grid-cols-2 gap-6">
                            <StatItem value="₹3,000+" label="Money saved" />
                            <StatItem value="8 hrs" label="Time saved" />
                            <StatItem value="25 kg" label="CO₂ avoided" />
                            <StatItem value="5,000" label="Calories burned" />
                        </div>
                    </div>

                    <Link href="/scanner" className="inline-block mt-8">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 bg-white text-black font-semibold rounded-xl inline-flex items-center gap-2"
                        >
                            Start Seeing True Costs
                            <ArrowRight size={18} />
                        </motion.button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/[0.05]">
                <p className="text-center text-white/20 text-xs">
                    True Cost • Built for better decisions
                </p>
            </footer>
        </div>
    );
}

// Components
function TrueCostCard({ icon, label, example, color }: { icon: React.ReactNode; label: string; example: string; color: 'orange' | 'blue' | 'yellow' | 'green' }) {
    const colors = {
        orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
        green: 'bg-green-500/10 border-green-500/20 text-green-400',
    };

    return (
        <div className={`p-4 rounded-xl border ${colors[color]}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs font-medium text-white/70">{label}</span>
            </div>
            <p className="text-sm font-medium text-white">{example}</p>
        </div>
    );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm font-bold text-white/50">
                {number}
            </div>
            <div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function StatItem({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
        </div>
    );
}
