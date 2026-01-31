'use client';

import { MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecyclingLocator() {
    return (
        <div className="h-full w-full bg-void-black relative overflow-hidden flex flex-col items-center justify-center text-center p-6">

            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-void-black to-void-black" />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-64 h-64 bg-glass-white rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(58,190,255,0.1)]"
            >
                <div className="absolute inset-0 rounded-full border border-ozone-blue/30 animate-ping opacity-20" />
                <div className="w-48 h-48 bg-void-black rounded-full flex items-center justify-center relative overflow-hidden">
                    <MapPin size={48} className="text-ozone-blue animate-bounce" />

                    {/* Radar Scan Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-ozone-blue/10 to-transparent animate-spin-slow w-full h-full" style={{ animationDuration: '4s' }} />
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative z-10 mt-12 max-w-sm"
            >
                <h2 className="text-2xl font-light text-white mb-2">Locating Facilities...</h2>
                <p className="text-white/50 mb-8">Finding nearest recycling centers for <span className="text-life-green">Plastic #1 (PET)</span> and <span className="text-life-green">Glass</span>.</p>

                <div className="space-y-4">
                    <div className="bg-glass-white p-4 rounded-xl flex items-center gap-4 text-left border border-white/5 hover:border-ozone-blue/50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-ozone-blue/20 rounded-full flex items-center justify-center text-ozone-blue">
                            <Navigation size={18} />
                        </div>
                        <div className="flex-1">
                            <div className="text-white font-bold">GreenCycle Hub</div>
                            <div className="text-xs text-white/50">1.2 miles away • Open until 6pm</div>
                        </div>
                        <div className="text-life-green text-xs font-bold">Best Match</div>
                    </div>

                    <div className="bg-glass-white p-4 rounded-xl flex items-center gap-4 text-left border border-white/5 hover:border-ozone-blue/50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/50">
                            <Navigation size={18} />
                        </div>
                        <div className="flex-1">
                            <div className="text-white font-bold">City Waste Depot</div>
                            <div className="text-xs text-white/50">3.5 miles away • closing soon</div>
                        </div>
                    </div>
                </div>
            </motion.div>

        </div>
    );
}
