'use client';

import { motion } from 'framer-motion';
import { Camera, LayoutDashboard, MapPinned, Home, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

interface NavDockProps {
    activeTab: 'lens' | 'dashboard' | 'recycle';
    onTabChange: (tab: 'lens' | 'dashboard' | 'recycle') => void;
}

export default function NavDock({ activeTab, onTabChange }: NavDockProps) {
    const tabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Stats' },
        { id: 'lens', icon: Camera, label: 'Scan' },
        { id: 'recycle', icon: MapPinned, label: 'Map' },
    ] as const;

    return (
        <div className="flex justify-center py-3 px-4">
            <nav
                className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 flex items-center gap-1 shadow-2xl"
                role="navigation"
                aria-label="Main navigation"
            >
                {/* Home button - back to landing */}
                <Link
                    href="/"
                    className="relative w-12 h-12 flex items-center justify-center rounded-full transition-all hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    aria-label="Back to Home"
                >
                    <Home size={20} className="text-white/40 hover:text-white transition-colors" />
                </Link>

                <div className="w-px h-8 bg-white/10 mx-1" />

                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={clsx(
                                "relative w-14 h-14 flex items-center justify-center rounded-full transition-all",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                            )}
                            aria-label={tab.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="dock-highlight"
                                    className="absolute inset-0 bg-white rounded-full"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon
                                size={24}
                                className={clsx(
                                    "relative z-10 transition-colors duration-200",
                                    isActive ? "text-black" : "text-white/60 hover:text-white"
                                )}
                            />
                        </button>
                    );
                })}

                <div className="w-px h-8 bg-white/10 mx-1" />

                {/* Track link - new comparison tools */}
                <Link
                    href="/track"
                    className="relative w-12 h-12 flex items-center justify-center rounded-full transition-all hover:bg-green-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                    aria-label="Track & Compare"
                >
                    <TrendingUp size={20} className="text-green-400 hover:text-green-300 transition-colors" />
                </Link>
            </nav>
        </div>
    );
}

