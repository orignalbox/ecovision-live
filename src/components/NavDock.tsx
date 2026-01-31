'use client';

import { motion } from 'framer-motion';
import { Camera, LayoutDashboard, MapPinned } from 'lucide-react';
import clsx from 'clsx';

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
        <div className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center pb-6 pt-2 pointer-events-none bg-gradient-to-t from-black/80 to-transparent">
            <nav
                className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-2xl pointer-events-auto"
                role="navigation"
                aria-label="Main navigation"
            >
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
            </nav>
        </div>
    );
}
