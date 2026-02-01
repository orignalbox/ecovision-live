'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, ExternalLink, TrendingDown, Calculator, Grid, Award } from 'lucide-react';
import Link from 'next/link';
import { BIFL_CATEGORIES, type BIFLProduct, compareBudgetVsBIFL, calculateCostPerUse } from '@/lib/bifl';

type ViewMode = 'browse' | 'calculator';

export default function ShopPage() {
    const [view, setView] = useState<ViewMode>('browse');
    const [selectedCategory, setSelectedCategory] = useState(BIFL_CATEGORIES[0]);
    const [cheapPrice, setCheapPrice] = useState(799);
    const [cheapLifespan, setCheapLifespan] = useState(1);
    const [qualityPrice, setQualityPrice] = useState(2999);
    const [qualityLifespan, setQualityLifespan] = useState(8);

    const comparison = useMemo(() => {
        return compareBudgetVsBIFL(
            { price: cheapPrice, lifespanYears: cheapLifespan },
            { price: qualityPrice, lifespanYears: qualityLifespan }
        );
    }, [cheapPrice, cheapLifespan, qualityPrice, qualityLifespan]);

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white">
            <header className="px-6 pt-8 pb-2">
                <Link href="/track" className="inline-flex items-center gap-2 text-[rgba(250,250,250,0.4)] hover:text-white mb-6 text-sm font-medium transition-colors">
                    <ArrowLeft size={16} />Back
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
                        <ShoppingBag size={20} className="text-pink-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Buy Smart</h1>
                        <p className="text-[rgba(250,250,250,0.4)] text-sm">Quality saves money long-term</p>
                    </div>
                </div>
            </header>

            <div className="px-6 py-5">
                <div className="flex gap-2">
                    <button onClick={() => setView('browse')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${view === 'browse' ? 'bg-pink-500/15 border-pink-500/30 text-pink-400' : 'bg-[#111113] border-[rgba(255,255,255,0.06)] text-[rgba(250,250,250,0.5)]'
                            }`}>
                        <Grid size={16} /><span className="text-sm font-medium">BIFL Products</span>
                    </button>
                    <button onClick={() => setView('calculator')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${view === 'calculator' ? 'bg-pink-500/15 border-pink-500/30 text-pink-400' : 'bg-[#111113] border-[rgba(255,255,255,0.06)] text-[rgba(250,250,250,0.5)]'
                            }`}>
                        <Calculator size={16} /><span className="text-sm font-medium">Calculator</span>
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'browse' ? (
                    <motion.div key="browse" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div className="px-6 pb-4 overflow-x-auto hide-scrollbar">
                            <div className="flex gap-2">
                                {BIFL_CATEGORIES.map((cat) => (
                                    <button key={cat.slug} onClick={() => setSelectedCategory(cat)}
                                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all ${selectedCategory.slug === cat.slug
                                            ? 'bg-white/10 border-white/20 text-white'
                                            : 'bg-[#111113] border-[rgba(255,255,255,0.06)] text-[rgba(250,250,250,0.5)] hover:border-[rgba(255,255,255,0.15)]'
                                            }`}>
                                        <span className="text-lg mr-2">{cat.icon}</span>
                                        <span className="text-sm font-medium">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 space-y-3 pb-6">
                            {selectedCategory.products.map((product, index) => {
                                const costPerUse = calculateCostPerUse(product.price, product.lifespanYears, product.usesPerWeek);
                                return (
                                    <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }} className="p-4 bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-xl">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-white text-[15px]">{product.brand}</h3>
                                                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-md font-medium">
                                                        {product.warranty}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[rgba(250,250,250,0.5)]">{product.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-white tabular-nums">₹{product.price.toLocaleString()}</div>
                                                <div className="text-xs text-green-400 font-medium">₹{costPerUse.toFixed(2)}/use</div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-[rgba(250,250,250,0.35)] mb-3 leading-relaxed">{product.whyBIFL}</p>
                                        <div className="flex gap-2">
                                            {product.links.amazon && (
                                                <a href={product.links.amazon} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs bg-white/5 text-[rgba(250,250,250,0.6)] px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                                                    Amazon <ExternalLink size={10} />
                                                </a>
                                            )}
                                            {product.links.flipkart && (
                                                <a href={product.links.flipkart} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs bg-white/5 text-[rgba(250,250,250,0.6)] px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                                                    Flipkart <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {selectedCategory.budgetOption && (
                            <div className="px-6 pb-6">
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                                    <Award size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-green-400 font-medium mb-1">vs. Budget option</p>
                                        <p className="text-xs text-green-400/70">
                                            ₹{selectedCategory.budgetOption.price} lasts ~{selectedCategory.budgetOption.lifespanYears} year.
                                            Over 10 years, BIFL saves you money.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="calculator" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6">
                        <div className="space-y-4 mb-6">
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                                    <span>🏪</span> Cheap Option
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-[rgba(250,250,250,0.4)] block mb-1">Price (₹)</label>
                                        <input type="number" value={cheapPrice} onChange={(e) => setCheapPrice(Number(e.target.value))}
                                            className="w-full bg-[#0A0A0B] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-red-400/50" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[rgba(250,250,250,0.4)] block mb-1">Lasts (years)</label>
                                        <input type="number" value={cheapLifespan} onChange={(e) => setCheapLifespan(Number(e.target.value))}
                                            className="w-full bg-[#0A0A0B] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-red-400/50" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                                <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                                    <span>✨</span> Quality Option
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-[rgba(250,250,250,0.4)] block mb-1">Price (₹)</label>
                                        <input type="number" value={qualityPrice} onChange={(e) => setQualityPrice(Number(e.target.value))}
                                            className="w-full bg-[#0A0A0B] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-green-400/50" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[rgba(250,250,250,0.4)] block mb-1">Lasts (years)</label>
                                        <input type="number" value={qualityLifespan} onChange={(e) => setQualityLifespan(Number(e.target.value))}
                                            className="w-full bg-[#0A0A0B] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-green-400/50" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className={`p-5 rounded-2xl ${comparison.savings > 0 ? 'bg-green-500/10 border border-green-500/25' : 'bg-red-500/10 border border-red-500/25'}`}>
                            <div className="text-center mb-4">
                                <div className="text-[rgba(250,250,250,0.5)] text-sm mb-2">Over 10 years</div>
                                <div className={`text-4xl font-bold tabular-nums ${comparison.savings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {comparison.savings > 0 ? 'Save' : 'Costs more:'} ₹{Math.abs(comparison.savings).toLocaleString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="p-3 bg-[#0A0A0B]/50 rounded-xl">
                                    <div className="text-lg font-bold text-red-400">₹{comparison.budgetTotal.toLocaleString()}</div>
                                    <div className="text-xs text-[rgba(250,250,250,0.4)]">Cheap total</div>
                                    <div className="text-xs text-[rgba(250,250,250,0.3)] mt-1">{comparison.budgetPurchases} purchases</div>
                                </div>
                                <div className="p-3 bg-[#0A0A0B]/50 rounded-xl">
                                    <div className="text-lg font-bold text-green-400">₹{comparison.biflTotal.toLocaleString()}</div>
                                    <div className="text-xs text-[rgba(250,250,250,0.4)]">Quality total</div>
                                    <div className="text-xs text-[rgba(250,250,250,0.3)] mt-1">{comparison.biflPurchases} purchase</div>
                                </div>
                            </div>
                        </motion.div>
                        <div className="mt-6 pb-6">
                            <div className="p-4 bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-xl flex items-start gap-3">
                                <span className="text-lg">💡</span>
                                <p className="text-xs text-[rgba(250,250,250,0.45)]">
                                    <span className="text-white font-medium">The rule:</span> If quality costs less than 3× and lasts 3× longer, buy quality.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-20" />
        </div>
    );
}
