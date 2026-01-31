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

    const [mode, setMode] = useState<'scan' | 'url'>('scan');
    const [isProcessing, setIsProcessing] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Zustand store for persistent history
    const addLog = useStore((state) => state.addLog);

    // Start camera with native API
    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setCameraActive(true);
            }
        } catch (err: any) {
            console.error('Camera error:', err);
            // Try fallback to any camera
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    setCameraActive(true);
                }
            } catch (fallbackErr) {
                setCameraError('Camera access denied. Please enable camera permissions.');
            }
        }
    }, []);

    // Stop camera
    const stopCamera = useCallback(() => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
        }
    }, []);

    // Initialize camera on mount
    useEffect(() => {
        if (mode === 'scan') {
            startCamera();
        }
        return () => stopCamera();
    }, [mode, startCamera, stopCamera]);

    // Capture photo from video
    const handleCapture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            handleAnalyze({ image: imageData });
        }
    }, []);

    // Handle file upload
    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            handleAnalyze({ image: reader.result as string });
        };
        reader.readAsDataURL(file);
        // Reset input
        e.target.value = '';
    }, []);

    // Handle URL submission
    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (urlInput.trim()) {
            handleAnalyze({ url: urlInput.trim() });
        }
    };

    // Main analysis function
    const handleAnalyze = async (payload: { image?: string; barcode?: string; url?: string }) => {
        setIsProcessing(true);
        setError(null);

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(50);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setResult(data);
                // Save to persistent history
                addLog({
                    name: data.name || 'Unknown Product',
                    co2: data.co2 || 0,
                    water: data.water || 0,
                });
            }
        } catch (err: any) {
            console.error('Analysis error:', err);
            setError(err.message || 'Analysis failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Reset to scan again
    const handleClose = () => {
        setResult(null);
        setError(null);
    };

    return (
        <div className="relative h-[100dvh] w-full bg-void-black overflow-hidden flex flex-col">
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Viewport */}
            <div className="flex-1 relative bg-black">
                <AnimatePresence mode="wait">
                    {mode === 'scan' ? (
                        <motion.div
                            key="camera"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            {/* Native Video Element */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-full w-full object-cover"
                            />

                            {/* Camera Error State */}
                            {cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-8 text-center">
                                    <Camera size={48} className="text-white/30 mb-4" />
                                    <p className="text-white/60 mb-4">{cameraError}</p>
                                    <button
                                        onClick={startCamera}
                                        className="px-4 py-2 bg-white/10 rounded-full text-white flex items-center gap-2"
                                    >
                                        <RefreshCw size={16} />
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Upload Button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute top-6 left-6 z-30 p-3 bg-black/50 backdrop-blur-md rounded-full border border-white/10"
                            >
                                <ImagePlus size={20} className="text-white" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            {/* Scanning Reticle */}
                            {cameraActive && !cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-64 h-64 relative">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-xl" />
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="absolute bottom-32 left-0 right-0 text-center">
                                <p className="text-white/50 text-sm">
                                    {cameraActive ? 'Tap to capture product' : 'Starting camera...'}
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
                                <label className="block text-cyan-400 text-xs font-bold mb-4 tracking-widest uppercase text-center">
                                    Analyze Product URL
                                </label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <input
                                        type="url"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        placeholder="https://amazon.com/product..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!urlInput || isProcessing}
                                    className="mt-6 w-full bg-white text-black font-bold py-4 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing && <Loader2 className="animate-spin" size={20} />}
                                    {isProcessing ? 'Analyzing...' : 'Analyze Impact'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Control Dock */}
            <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center gap-2">
                    <button
                        onClick={() => setMode('scan')}
                        className={clsx(
                            "px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium transition-all",
                            mode === 'scan' ? "bg-white text-black" : "text-white/60"
                        )}
                    >
                        <Camera size={18} />
                        <span>Scan</span>
                    </button>

                    {/* Capture button - only in scan mode */}
                    {mode === 'scan' && (
                        <button
                            onClick={handleCapture}
                            disabled={isProcessing || !cameraActive}
                            className="mx-2 w-14 h-14 bg-white rounded-full flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
                        >
                            <div className="w-12 h-12 border-[3px] border-black rounded-full" />
                        </button>
                    )}

                    <button
                        onClick={() => setMode('url')}
                        className={clsx(
                            "px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium transition-all",
                            mode === 'url' ? "bg-white text-black" : "text-white/60"
                        )}
                    >
                        <LinkIcon size={18} />
                        <span>Link</span>
                    </button>
                </div>
            </div>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-green-500 blur-2xl animate-pulse" />
                            <Loader2 size={40} className="absolute inset-0 m-auto text-white animate-spin" />
                        </div>
                        <p className="mt-6 text-white text-lg font-light">Analyzing impact...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute bottom-40 left-4 right-4 z-50 bg-red-500/90 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between"
                    >
                        <p className="text-white text-sm flex-1">{error}</p>
                        <button onClick={() => setError(null)} className="p-1 ml-2">
                            <X size={18} className="text-white" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Panel */}
            <AnimatePresence>
                {result && (
                    <ImpactCard data={result} onClose={handleClose} />
                )}
            </AnimatePresence>
        </div>
    );
}
