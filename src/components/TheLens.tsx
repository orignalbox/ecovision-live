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
            // Request camera with basic constraints
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Wait for video to load
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
            // Try any available camera
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
            // Stop camera when switching to URL mode
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

    // Capture image
    const handleCapture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !cameraReady) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);

        analyze({ image: imageData });
    }, [cameraReady]);

    // File upload
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => analyze({ image: reader.result as string });
        reader.readAsDataURL(file);
        e.target.value = '';
    }, []);

    // URL submit
    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (urlInput.trim()) {
            analyze({ url: urlInput.trim() });
        }
    };

    // Main analysis
    const analyze = async (payload: { image?: string; barcode?: string; url?: string }) => {
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
    };

    const handleClose = () => {
        setResult(null);
        setError(null);
    };

    return (
        <div className="relative h-full w-full bg-black">
            <canvas ref={canvasRef} className="hidden" />

            {/* Mode Toggle - Top Center */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1 flex items-center gap-1">
                    <button
                        onClick={() => setMode('scan')}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                            mode === 'scan' ? "bg-white text-black" : "text-white/60"
                        )}
                    >
                        <Camera size={16} /> Scan
                    </button>
                    <button
                        onClick={() => setMode('url')}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                            mode === 'url' ? "bg-white text-black" : "text-white/60"
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
                    className="absolute top-4 right-4 z-30 p-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10"
                >
                    <ImagePlus size={20} className="text-white" />
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
                        className="h-full w-full"
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
                                <Camera size={48} className="text-white/20 mb-4" />
                                <p className="text-white/60 text-center mb-4">{cameraError}</p>
                                <button
                                    onClick={initCamera}
                                    className="px-5 py-2.5 bg-white/10 rounded-full flex items-center gap-2 text-white"
                                >
                                    <RefreshCw size={16} /> Retry
                                </button>
                            </div>
                        )}

                        {/* Viewfinder */}
                        {cameraReady && !cameraError && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-56 h-56 relative border-2 border-cyan-400/30 rounded-3xl">
                                    <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl" />
                                    <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl" />
                                    <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl" />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-xl" />
                                </div>
                            </div>
                        )}

                        {/* Capture Button - Bottom Center (above NavDock) */}
                        <div className="absolute bottom-24 left-0 right-0 flex justify-center">
                            <button
                                onClick={handleCapture}
                                disabled={!cameraReady || isProcessing}
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform shadow-lg"
                            >
                                <div className="w-14 h-14 border-[3px] border-black rounded-full" />
                            </button>
                        </div>

                        {/* Status Text */}
                        <div className="absolute bottom-44 left-0 right-0 text-center">
                            <p className="text-white/50 text-sm">
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
                        className="h-full w-full flex items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-black"
                    >
                        <form onSubmit={handleUrlSubmit} className="w-full max-w-md">
                            <h2 className="text-xl font-bold text-white mb-2 text-center">Analyze Product URL</h2>
                            <p className="text-white/40 text-sm mb-6 text-center">
                                Paste any product page link
                            </p>
                            <div className="relative mb-6">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://amazon.com/product..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!urlInput.trim() || isProcessing}
                                className="w-full bg-white text-black font-bold py-4 rounded-2xl disabled:opacity-40"
                            >
                                {isProcessing ? 'Analyzing...' : 'Analyze Impact'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        <Loader2 size={40} className="text-white animate-spin mb-4" />
                        <p className="text-white text-lg">Analyzing...</p>
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
                        className="absolute bottom-28 left-4 right-4 z-50 bg-red-500/90 backdrop-blur p-4 rounded-2xl flex items-center gap-3"
                    >
                        <p className="text-white flex-1 text-sm">{error}</p>
                        <button onClick={() => setError(null)}>
                            <X size={18} className="text-white" />
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
