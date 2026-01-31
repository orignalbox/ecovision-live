'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TheLens from '@/components/TheLens';
import Dashboard from '@/components/Dashboard'; // Will need refactoring to match new theme
import NavDock from '@/components/NavDock';
import RecyclingLocator from '@/components/RecyclingLocator';

export default function MainLayout() {
    const [activeTab, setActiveTab] = useState<'lens' | 'dashboard' | 'recycle'>('lens');

    return (
        <main className="h-screen w-full bg-void-black text-white overflow-hidden relative font-sans">

            <AnimatePresence mode="wait">
                {/* LENS VIEW */}
                {activeTab === 'lens' && (
                    <motion.div
                        key="lens"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-0"
                    >
                        <TheLens />
                    </motion.div>
                )}

                {/* DASHBOARD VIEW */}
                {activeTab === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute inset-0 z-10 bg-void-black"
                    >
                        <Dashboard isOpen={true} onClose={() => setActiveTab('lens')} />
                    </motion.div>
                )}

                {/* RECYCLING VIEW */}
                {activeTab === 'recycle' && (
                    <motion.div
                        key="recycle"
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        className="absolute inset-0 z-10 bg-void-black"
                    >
                        <RecyclingLocator />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Navigation (Only show if not in deep details? Optional. Always showing for now) */}
            <NavDock activeTab={activeTab} onTabChange={setActiveTab} />

        </main>
    );
}
