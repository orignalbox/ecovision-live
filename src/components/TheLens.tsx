'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Link as LinkIcon, Zap, Globe, MapPin, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import clsx from 'clsx';
// Will import new components as we build them
// import ImpactCard from './ImpactCard'; 
// import NavDock from './NavDock';

const videoConstraints = {
    facingMode: "environment"
};

export default function TheLens() {
    const webcamRef = useRef<Webcam>(null);
    const [mode, setMode] = useState<'scan' | 'url'>('scan');
    const [isProcessing, setIsProcessing] = useState(false);
    const [urlInput, setUrlInput] = useState('');

    // Placeholder for result data (will move to prop or store later for unified flow)
    const [result, setResult] = useState<any>(null);

    // Barcode Scanning Logic
    useEffect(() => {
        if (mode !== 'scan' || isProcessing || result) return;
        const codeReader = new BrowserMultiFormatReader();
        const interval = setInterval(async () => {
            if (webcamRef.current?.video) {
                try {
                    const res = await codeReader.decodeFromVideoElement(webcamRef.current.video);
                    if (res) handleAnalyze({ barcode: res.getText() });
                } catch (err) { /* silent */ }
            }
        }, 500);
        return () => { clearInterval(interval); codeReader.reset(); };
    }, [mode, isProcessing, result]);

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) handleAnalyze({ image: imageSrc });
    }, [webcamRef]);

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (urlInput) handleAnalyze({ url: urlInput });
    };

    const handleAnalyze = async (payload: any) => {
        setIsProcessing(true);
        try {
            // Stub API call - we will update api/analyze to handle URLs next
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="relative h-screen w-full bg-void-black overflow-hidden flex flex-col">

            {/* 1. Viewport Layer */}
            <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                    {mode === 'scan' ? (
                        <motion.div
                            key="camera"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                                className="h-full w-full object-cover opacity-80"
                            />
                            {/* Scanning Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-64 border border-white/20 rounded-2xl relative">
                                    <motion.div
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                        className="absolute left-0 right-0 h-0.5 bg-ozone-blue shadow-[0_0_15px_#3ABEFF]"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="url"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-b from-void-black to-gray-900"
                        >
                            <form onSubmit={handleUrlSubmit} className="w-full max-w-md">
                                <label className="block text-ozone-blue text-sm font-bold mb-4 tracking-wider uppercase">Paste Product Link</label>
                                <div className="relative group">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ozone-blue transition-colors" />
                                    <input
                                        type="url"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        placeholder="https://amazon.com/..."
                                        className="w-full bg-glass-white border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-ozone-blue focus:ring-1 focus:ring-ozone-blue transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!urlInput || isProcessing}
                                    className="mt-6 w-full bg-ozone-blue text-void-black font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
                                >
                                    {isProcessing ? 'Analyzing...' : 'Analyze Impact'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. Controls Layer (Glass Dock) */}
            <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center">
                <div className="bg-glass-white backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-2xl">
                    <button
                        onClick={() => setMode('scan')}
                        className={clsx(
                            "p-4 rounded-full transition-all flex items-center gap-2",
                            mode === 'scan' ? "bg-white text-black font-bold" : "text-white/60 hover:bg-white/10"
                        )}
                    >
                        <Scan size={20} />
                        {mode === 'scan' && <span className="text-xs">Scan</span>}
                    </button>

                    {/* Shutter Button (Only in Scan Mode) */}
                    {mode === 'scan' && (
                        <button
                            onClick={handleCapture}
                            className="w-16 h-16 bg-white rounded-full mx-2 flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            <div className="w-14 h-14 border-2 border-black rounded-full" />
                        </button>
                    )}

                    <button
                        onClick={() => setMode('url')}
                        className={clsx(
                            "p-4 rounded-full transition-all flex items-center gap-2",
                            mode === 'url' ? "bg-white text-black font-bold" : "text-white/60 hover:bg-white/10"
                        )}
                    >
                        <LinkIcon size={20} />
                        {mode === 'url' && <span className="text-xs">Link</span>}
                    </button>
                </div>
            </div>

            {/* 3. Loading Orb Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-ozone-blue to-life-green blur-xl animate-pulse mb-8" />
                        <h3 className="text-2xl font-light text-white mb-2">Analyzing Matter...</h3>
                        <p className="text-white/50 text-sm">Identifying ingredients & calculating carbon cost.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TODO: Render Results (ImpactCard) here */}
        </div>
    );
}
