'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TheLens from '@/components/TheLens';
import Dashboard from '@/components/Dashboard';
import NavDock from '@/components/NavDock';
import RecyclingLocator from '@/components/RecyclingLocator';

export default function MainLayout() {
    const [activeTab, setActiveTab] = useState<'lens' | 'dashboard' | 'recycle'>('lens');

    return (
        // Root container - fills viewport, no overflow
        <div className="fixed inset-0 bg-void-black text-white font-sans flex flex-col">

            {/* Main content area - takes all space except bottom nav */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'lens' && (
                        <motion.div
                            key="lens"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                        >
                            <TheLens />
                        </motion.div>
                    )}

                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="absolute inset-0 overflow-hidden"
                        >
                            <Dashboard onClose={() => setActiveTab('lens')} />
                        </motion.div>
                    )}

                    {activeTab === 'recycle' && (
                        <motion.div
                            key="recycle"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                            className="absolute inset-0 overflow-hidden"
                        >
                            <RecyclingLocator />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Navigation - fixed height */}
            <div className="flex-shrink-0 pb-safe">
                <NavDock activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
        </div>
    );
}
