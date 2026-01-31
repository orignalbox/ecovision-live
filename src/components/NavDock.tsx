'use client';

import { motion } from 'framer-motion';
import { Camera, LayoutDashboard, MapPinned, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '@/store/useStore';

interface NavDockProps {
    activeTab: 'lens' | 'dashboard' | 'recycle';
    onTabChange: (tab: 'lens' | 'dashboard' | 'recycle') => void;
}

export default function NavDock({ activeTab, onTabChange }: NavDockProps) {
    const tabs = [
        { id: 'dashboard', icon: LayoutDashboard },
        { id: 'lens', icon: Camera },
        { id: 'recycle', icon: MapPinned },
    ] as const;

    return (
        // Changed bottom-10 to bottom-6 for better mobile spacing, ensuring it doesn't float too high
        <div className="fixed bottom-6 left-0 right-0 z-[60] flex justify-center pointer-events-none pb-safe">
            <div className="bg-glass-white backdrop-blur-3xl border border-white/10 rounded-full p-2 flex items-center gap-4 shadow-2xl pointer-events-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative w-12 h-12 flex items-center justify-center rounded-full transition-all"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="dock-highlight"
                                    className="absolute inset-0 bg-white rounded-full opacity-100" // White background for active
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon
                                size={24}
                                className={clsx(
                                    "relative z-10 transition-colors duration-200",
                                    isActive ? "text-void-black" : "text-white/60 hover:text-white"
                                )}
                            />

                            {/* Active Indicator Dot (optional, maybe cleaner without) */}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
