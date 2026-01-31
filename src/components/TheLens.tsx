'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Link as LinkIcon, Loader2, ImagePlus, X, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import ImpactCard from './ImpactCard';
import { useStore } from '@/store/useStore';

export default function TheLens() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [mode, setMode] = useState<'scan' | 'url'>('scan');
    const [isProcessing, setIsProcessing] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const addLog = useStore((state) => state.addLog);

    // Simple camera initialization
    const initCamera = useCallback(async () => {
        setCameraError(null);
        setCameraReady(false);

        // Cleanup existing stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await new Promise<void>((resolve) => {
                    if (videoRef.current) {
                        videoRef.current.onloadedmetadata = () => resolve();
                    }
                });
                await videoRef.current.play();
                setCameraReady(true);
            }
        } catch (err: any) {
            console.error('Camera error:', err);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await new Promise<void>((resolve) => {
                        if (videoRef.current) {
                            videoRef.current.onloadedmetadata = () => resolve();
                        }
                    });
                    await videoRef.current.play();
                    setCameraReady(true);
                }
            } catch (e: any) {
                setCameraError('Camera access denied. Please allow camera permissions.');
            }
        }
    }, []);

    // Camera lifecycle
    useEffect(() => {
        if (mode === 'scan') {
            initCamera();
        } else {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
                setCameraReady(false);
            }
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
        };
    }, [mode, initCamera]);

    // Main analysis function - defined BEFORE handleCapture to avoid stale closure
    const analyze = useCallback(async (payload: { image?: string; barcode?: string; url?: string }) => {
        setIsProcessing(true);
        setError(null);

        if (navigator.vibrate) navigator.vibrate(50);

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.error && !data.name) {
                throw new Error(data.error);
            }

            setResult(data);

            if (data.name) {
                addLog({ name: data.name, co2: data.co2 || 0, water: data.water || 0 });
            }
        } catch (err: any) {
            setError(err.message || 'Analysis failed');
        } finally {
            setIsProcessing(false);
        }
    }, [addLog]);

    // Capture image - now includes analyze in closure properly
    const handleCapture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !cameraReady) return;

        // Visual feedback
        setIsCapturing(true);
        if (navigator.vibrate) navigator.vibrate(100);

        setTimeout(() => setIsCapturing(false), 150);

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);

        analyze({ image: imageData });
    }, [cameraReady, analyze]);

    // File upload
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => analyze({ image: reader.result as string });
        reader.readAsDataURL(file);
        e.target.value = '';
    }, [analyze]);

    // URL submit
    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (urlInput.trim()) {
            analyze({ url: urlInput.trim() });
        }
    };

    const handleClose = () => {
        setResult(null);
        setError(null);
    };

    return (
        <div className="relative h-full w-full bg-black">
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Flash Effect */}
            <AnimatePresence>
                {isCapturing && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 z-50 bg-white pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Mode Toggle - Top Center */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 safe-area-top">
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center gap-1">
                    <button
                        onClick={() => setMode('scan')}
                        className={clsx(
                            "px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                            mode === 'scan' ? "bg-white text-black" : "text-white/60 hover:text-white"
                        )}
                    >
                        <Camera size={16} /> Scan
                    </button>
                    <button
                        onClick={() => setMode('url')}
                        className={clsx(
                            "px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                            mode === 'url' ? "bg-white text-black" : "text-white/60 hover:text-white"
                        )}
                    >
                        <LinkIcon size={16} /> URL
                    </button>
                </div>
            </div>

            {/* Upload Button - Top Right */}
            {mode === 'scan' && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-4 right-4 z-30 p-3.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/90 transition-colors"
                    aria-label="Upload image"
                >
                    <ImagePlus size={22} className="text-white" />
                </button>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {mode === 'scan' ? (
                    <motion.div
                        key="camera"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover"
                        />

                        {/* Camera Error */}
                        {cameraError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-8">
                                <Camera size={56} className="text-white/20 mb-6" />
                                <p className="text-white/70 text-center mb-6 text-lg">{cameraError}</p>
                                <button
                                    onClick={initCamera}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full flex items-center gap-2 text-white transition-colors"
                                >
                                    <RefreshCw size={18} /> Retry Camera
                                </button>
                            </div>
                        )}

                        {/* Viewfinder - ALL 4 CORNERS */}
                        {cameraReady && !cameraError && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-64 relative">
                                    {/* Top-Left */}
                                    <div className="absolute -top-1 -left-1 w-10 h-10 border-t-[3px] border-l-[3px] border-cyan-400 rounded-tl-2xl" />
                                    {/* Top-Right */}
                                    <div className="absolute -top-1 -right-1 w-10 h-10 border-t-[3px] border-r-[3px] border-cyan-400 rounded-tr-2xl" />
                                    {/* Bottom-Left */}
                                    <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-[3px] border-l-[3px] border-cyan-400 rounded-bl-2xl" />
                                    {/* Bottom-Right (WAS MISSING!) */}
                                    <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-[3px] border-r-[3px] border-cyan-400 rounded-br-2xl" />

                                    {/* Center crosshair */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                                        <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/50" />
                                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/50" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status Text */}
                        <div className="absolute bottom-36 left-0 right-0 text-center">
                            <p className="text-white/60 text-sm font-medium">
                                {cameraReady ? 'Point at product & tap to capture' : 'Starting camera...'}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="url"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-black"
                    >
                        <form onSubmit={handleUrlSubmit} className="w-full max-w-md">
                            <h2 className="text-2xl font-bold text-white mb-2 text-center">Analyze Product URL</h2>
                            <p className="text-white/50 text-sm mb-8 text-center">
                                Paste any product page link to analyze its environmental impact
                            </p>
                            <div className="relative mb-6">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://amazon.com/product..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!urlInput.trim() || isProcessing}
                                className="w-full bg-white text-black font-bold py-4 rounded-2xl disabled:opacity-40 hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {isProcessing && <Loader2 size={20} className="animate-spin" />}
                                {isProcessing ? 'Analyzing...' : 'Analyze Impact'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Capture Button - Positioned ABOVE NavDock (bottom-6 + dock height ~64px = bottom-24) */}
            {mode === 'scan' && (
                <div className="absolute bottom-24 left-0 right-0 flex justify-center z-[55]">
                    <motion.button
                        onClick={handleCapture}
                        disabled={!cameraReady || isProcessing}
                        whileTap={{ scale: 0.9 }}
                        className={clsx(
                            "w-20 h-20 bg-white rounded-full flex items-center justify-center transition-all",
                            "disabled:opacity-30 disabled:cursor-not-allowed",
                            "shadow-[0_0_40px_rgba(255,255,255,0.4)]",
                            "hover:shadow-[0_0_60px_rgba(255,255,255,0.6)]",
                            isCapturing && "scale-90"
                        )}
                        aria-label="Capture photo"
                    >
                        <div className="w-16 h-16 border-4 border-black/80 rounded-full" />
                    </motion.button>
                </div>
            )}

            {/* Loading Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[80] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        <div className="relative mb-8">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-green-500 blur-2xl animate-pulse" />
                            <Loader2 size={40} className="absolute inset-0 m-auto text-white animate-spin" />
                        </div>
                        <p className="text-white text-xl font-light">Analyzing...</p>
                        <p className="text-white/40 text-sm mt-2">Calculating environmental impact</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Toast */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute bottom-32 left-4 right-4 z-[90] bg-red-500/95 backdrop-blur p-4 rounded-2xl flex items-center gap-3 shadow-lg"
                    >
                        <p className="text-white flex-1">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} className="text-white" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {result && <ImpactCard data={result} onClose={handleClose} />}
            </AnimatePresence>
        </div>
    );
}
