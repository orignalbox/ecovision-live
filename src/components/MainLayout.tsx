'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, LayoutDashboard, MapPinned, Home, Leaf, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import TheLens from '@/components/TheLens';
import Dashboard from '@/components/Dashboard';
import NavDock from '@/components/NavDock';
import RecyclingLocator from '@/components/RecyclingLocator';

export default function MainLayout() {
    const [activeTab, setActiveTab] = useState<'lens' | 'dashboard' | 'recycle'>('lens');

    const tabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'lens', icon: Camera, label: 'Scan' },
        { id: 'recycle', icon: MapPinned, label: 'Find Centers' },
    ] as const;

    return (
        <div className="fixed inset-0 bg-void-black text-white font-sans flex">

            {/* Desktop Sidebar - Hidden on mobile */}
            <aside className="hidden md:flex flex-col w-64 bg-glass-white border-r border-white/10">
                {/* Logo */}
                <Link href="/" className="p-6 flex items-center gap-3 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-life-green to-ozone-blue rounded-xl flex items-center justify-center">
                        <Leaf size={20} className="text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg">EcoVision</span>
                        <p className="text-xs text-white/50">Know Your Impact</p>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                                    isActive
                                        ? "bg-white text-black font-semibold"
                                        : "text-white/60 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <Icon size={20} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link
                        href="/track"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors"
                    >
                        <TrendingUp size={20} />
                        <div>
                            <span className="font-medium">Track & Compare</span>
                            <p className="text-xs text-green-400/60">Save money tools</p>
                        </div>
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors px-4 py-2"
                    >
                        <Home size={16} />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Desktop Header - Hidden on mobile */}
                <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/10 bg-void-black/50 backdrop-blur-xl">
                    <div>
                        <h1 className="text-xl font-bold capitalize">
                            {activeTab === 'lens' ? 'Product Scanner' : activeTab === 'dashboard' ? 'Your Impact' : 'Recycling Centers'}
                        </h1>
                        <p className="text-white/50 text-sm">
                            {activeTab === 'lens' && 'Scan products to see their environmental impact'}
                            {activeTab === 'dashboard' && 'Track your sustainability journey'}
                            {activeTab === 'recycle' && 'Find nearby recycling facilities'}
                        </p>
                    </div>
                </header>

                {/* Content Area */}
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

                {/* Mobile Bottom Navigation - Hidden on desktop */}
                <div className="md:hidden flex-shrink-0 pb-safe">
                    <NavDock activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
            </div>
        </div>
    );
}
