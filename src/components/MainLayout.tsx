'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, LayoutDashboard, Home, ArrowLeft, Menu, X } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import TheLens from '@/components/TheLens';
import Dashboard from '@/components/Dashboard';

type Tab = 'lens' | 'dashboard';

export default function MainLayout() {
    const [activeTab, setActiveTab] = useState<Tab>('lens');
    const [menuOpen, setMenuOpen] = useState(false);

    const tabs = [
        { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Stats' },
        { id: 'lens' as const, icon: Camera, label: 'Scan' },
    ];

    return (
        <div className="fixed inset-0 bg-[#0A0A0B] text-white flex flex-col">

            {/* Mobile Header */}
            <header className="md:hidden flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#0A0A0B] border-b border-white/[0.06] z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-medium">Home</span>
                </Link>

                <h1 className="text-sm font-semibold text-white">
                    {activeTab === 'lens' ? 'True Cost Scanner' : 'Your Impact'}
                </h1>

                <Link
                    href="/track"
                    className="text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
                >
                    Track
                </Link>
            </header>

            {/* Desktop Layout */}
            <div className="hidden md:flex flex-1 min-h-0">
                {/* Desktop Sidebar */}
                <aside className="flex-shrink-0 w-64 bg-[#111113] border-r border-white/[0.06] flex flex-col">
                    {/* Logo */}
                    <Link href="/" className="p-6 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/[0.06]">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                            <span className="text-xl">💰</span>
                        </div>
                        <div>
                            <span className="font-bold text-lg">True Cost</span>
                            <p className="text-xs text-white/40">See the full price</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
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
                                            : "text-white/50 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon size={20} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Track Link */}
                    <div className="p-4 border-t border-white/[0.06]">
                        <Link
                            href="/track"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors"
                        >
                            <span className="text-lg">📊</span>
                            <div>
                                <span className="font-medium">Track & Compare</span>
                                <p className="text-xs text-green-400/60">Transport, Delivery, Energy</p>
                            </div>
                        </Link>
                    </div>
                </aside>

                {/* Desktop Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Desktop Header */}
                    <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#0A0A0B]">
                        <div>
                            <h1 className="text-xl font-bold">
                                {activeTab === 'lens' ? 'True Cost Scanner' : 'Your Impact'}
                            </h1>
                            <p className="text-white/40 text-sm">
                                {activeTab === 'lens' && 'Scan products to see their real cost'}
                                {activeTab === 'dashboard' && 'Track your savings and impact'}
                            </p>
                        </div>
                    </header>

                    {/* Desktop Content Area - SCROLLABLE */}
                    <div className="flex-1 overflow-auto">
                        <AnimatePresence mode="wait">
                            {activeTab === 'lens' && (
                                <motion.div
                                    key="lens"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full"
                                >
                                    <TheLens />
                                </motion.div>
                            )}

                            {activeTab === 'dashboard' && (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full"
                                >
                                    <Dashboard onClose={() => setActiveTab('lens')} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile Content - SCROLLABLE */}
            <div className="md:hidden flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'lens' && (
                        <motion.div
                            key="lens-mobile"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full"
                        >
                            <TheLens />
                        </motion.div>
                    )}

                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard-mobile"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-full"
                        >
                            <Dashboard onClose={() => setActiveTab('lens')} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden flex-shrink-0 flex justify-center py-3 px-4 bg-[#0A0A0B] border-t border-white/[0.06] pb-safe">
                <div className="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center gap-1 shadow-2xl">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "relative w-14 h-14 flex items-center justify-center rounded-full transition-all",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-highlight"
                                        className="absolute inset-0 bg-white rounded-full"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <Icon
                                    size={24}
                                    className={clsx(
                                        "relative z-10 transition-colors",
                                        isActive ? "text-black" : "text-white/50"
                                    )}
                                />
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
