'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Link as LinkIcon, Zap, ZapOff, Loader2, Image as ImageIcon } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';
import clsx from 'clsx';
// Will import new components as we build them
// import ImpactCard from './ImpactCard'; 
// import NavDock from './NavDock';

export default function TheLens() {
    const webcamRef = useRef<Webcam>(null);
    const [mode, setMode] = useState<'scan' | 'url'>('scan');
    const [isProcessing, setIsProcessing] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [torchOn, setTorchOn] = useState(false);

    // Stable constraints - default to environment, no dynamic switching to avoid resets
    // If user needs to switch, we can add a specific button, but for now we prioritize stability.
    const videoConstraints = {
        facingMode: "environment"
    };

    const [result, setResult] = useState<any>(null);

    // Simplified Torch Logic - no heavy stream parsing on render
    const toggleTorch = async () => {
        const stream = webcamRef.current?.video?.srcObject as MediaStream;
        if (!stream) return;

        const track = stream.getVideoTracks()[0];
        if (!track) return;

        try {
            // @ts-ignore - Torch is experimental
            await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
            setTorchOn(!torchOn);
        } catch (e) {
            console.error("Torch failed", e);
            // Don't alert, just fail silently to keep UI stable
        }
    };

    // Barcode Logic - Only run if camera is actually live
    useEffect(() => {
        if (mode !== 'scan' || isProcessing) return;

        const codeReader = new BrowserMultiFormatReader();
        const interval = setInterval(async () => {
            // Ensure video is readyState 4 (HAVE_ENOUGH_DATA)
            const video = webcamRef.current?.video;
            if (video && video.readyState === 4) {
                try {
                    const res = await codeReader.decodeFromVideoElement(video);
                    if (res) {
                        // Debounce/Check if we already have a result to avoid spam
                        handleAnalyze({ barcode: res.getText() });
                        codeReader.reset();
                    }
                } catch (err) { /* silent scan fail */ }
            }
        }, 1000); // 1s interval is plenty

        return () => { clearInterval(interval); codeReader.reset(); };
    }, [mode, isProcessing]);

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
        if (navigator.vibrate) navigator.vibrate(50);

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
            alert("Connection Error. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="relative h-[100dvh] w-full bg-void-black overflow-hidden flex flex-col">

            {/* 1. Camera Viewport */}
            <div className="flex-1 relative bg-black">
                <AnimatePresence mode="wait">
                    {mode === 'scan' ? (
                        <motion.div
                            key="camera"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                                className="h-full w-full object-cover"
                                playsInline
                                mirrored={false}
                            />

                            {/* Overlay UI */}
                            <div className="absolute top-6 right-6 z-30">
                                <button
                                    onClick={toggleTorch}
                                    className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10"
                                >
                                    {torchOn ? <Zap size={20} className="text-alert-amber fill-alert-amber" /> : <ZapOff size={20} />}
                                </button>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-72 h-72 border border-white/20 rounded-[3rem] relative">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-ozone-blue rounded-tl-2xl" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-ozone-blue rounded-tr-2xl" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-ozone-blue rounded-bl-2xl" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-ozone-blue rounded-br-2xl" />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="url"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-b from-void-black to-gray-900"
                        >
                            <form onSubmit={handleUrlSubmit} className="w-full max-w-md">
                                <label className="block text-ozone-blue text-xs font-bold mb-6 tracking-[0.2em] uppercase text-center">Analyze Product Link</label>
                                <div className="relative group">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-ozone-blue transition-colors" size={20} />
                                    <input
                                        type="url"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        placeholder="Paste generic product URL..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-ozone-blue/50 focus:bg-white/10 transition-all font-light"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!urlInput || isProcessing}
                                    className="mt-8 w-full bg-white text-void-black font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing && <Loader2 className="animate-spin" />}
                                    {isProcessing ? 'Thinking...' : 'Analyze Impact'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. Dock */}
            <div className="absolute bottom-28 left-0 right-0 z-20 flex justify-center pointer-events-none">
                <div className="bg-glass-white backdrop-blur-2xl border border-white/10 rounded-full p-1.5 flex items-center gap-2 shadow-2xl pointer-events-auto">
                    <button onClick={() => setMode('scan')} className={clsx("px-6 py-3 rounded-full transition-all flex items-center gap-2 text-sm font-medium", mode === 'scan' ? "bg-white text-black" : "text-white/60")}>
                        <Scan size={18} /> <span>Lens</span>
                    </button>
                    <AnimatePresence>
                        {mode === 'scan' && (
                            <>
                                <motion.button
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                    onClick={handleCapture}
                                    className="mx-1 w-16 h-16 bg-white rounded-full flex items-center justify-center active:scale-95 transition-transform"
                                >
                                    <div className="w-14 h-14 border-[3px] border-black rounded-full" />
                                </motion.button>
                                <div className="absolute right-[-60px] top-1/2 -translate-y-1/2">
                                    <label className="p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white cursor-pointer active:scale-90 transition-transform flex items-center justify-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => handleAnalyze({ image: reader.result as string });
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <ImageIcon size={20} />
                                    </label>
                                </div>
                            </>
                        )}
                    </AnimatePresence>
                    <button onClick={() => setMode('url')} className={clsx("px-6 py-3 rounded-full transition-all flex items-center gap-2 text-sm font-medium", mode === 'url' ? "bg-white text-black" : "text-white/60")}>
                        <LinkIcon size={18} /> <span>Link</span>
                    </button>
                </div>
            </div>
            {/* 3. Loading Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                    >
                        <Loader2 size={48} className="text-white animate-spin opacity-50 mb-4" />
                        <h3 className="text-2xl font-light text-white mb-2 tracking-wide">Analyzing...</h3>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
