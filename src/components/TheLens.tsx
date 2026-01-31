'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Link as LinkIcon, Loader2, ImagePlus, X, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import ImpactCard, { ImpactData, Alternative } from './ImpactCard';
import ComparisonView from './ComparisonView';
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
    const [result, setResult] = useState<ImpactData | null>(null);
    const [comparingItem, setComparingItem] = useState<ImpactData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [flashVisible, setFlashVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const addLog = useStore((state) => state.addLog);

    // ... (Camera initialization code remains exactly the same)
    const initCamera = useCallback(async () => {
        setCameraError(null);
        setCameraReady(false);

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
        } catch {
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
            } catch {
                setCameraError('Camera access denied. Please allow camera permissions.');
            }
        }
    }, []);

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

    // Comparison Logic
    const handleCompare = (alternative: Alternative) => {
        if (!result) return;

        // Parse savings string "Saves 2.5kg CO2, 100L Water"
        let co2Saved = 0;
        let waterSaved = 0;

        const co2Match = alternative.savings.match(/(\d+(\.\d+)?)(\s?)kg/i);
        if (co2Match) co2Saved = parseFloat(co2Match[1]);

        const waterMatch = alternative.savings.match(/(\d+)(\s?)L/i);
        if (waterMatch) waterSaved = parseFloat(waterMatch[1]);

        // Construct synthetic impact data
        const comparisonData: ImpactData = {
            name: alternative.name,
            co2: Math.max(0.1, parseFloat((result.co2 - co2Saved).toFixed(1))),
            water: Math.max(0, result.water - waterSaved),
            bio: Math.min(100, result.bio + 20), // Assume better bio score
            ecoScore: 'A', // Alternatives are usually better
            category: result.category
        };

        setComparingItem(comparisonData);
    };

    // Analysis function
    const analyze = useCallback(async (payload: { image?: string; url?: string }) => {
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

    // Capture
    const handleCapture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !cameraReady) return;

        setFlashVisible(true);
        if (navigator.vibrate) navigator.vibrate(100);
        setTimeout(() => setFlashVisible(false), 150);

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);

        setCapturedImage(imageData);
        analyze({ image: imageData });
    }, [cameraReady, analyze]);

    // File upload
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const imageData = reader.result as string;
            setCapturedImage(imageData);
            analyze({ image: imageData });
        };
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
        setComparingItem(null);
    };

    return (
        <div className="h-full w-full bg-black flex flex-col">
            <canvas ref={canvasRef} className="hidden" />

            {/* Flash Effect */}
            {flashVisible && (
                <div className="absolute inset-0 z-50 bg-white pointer-events-none" />
            )}

            {/* Top Bar */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 relative z-20">
                {/* Mode Toggle */}
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-full p-1 flex items-center gap-1">
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

                {/* Upload Button */}
                {mode === 'scan' && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-black/70 backdrop-blur-md rounded-full border border-white/10"
                        aria-label="Upload image"
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
            </div>

            {/* Main Content */}
            <div className="flex-1 relative overflow-hidden">
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
                                        className="px-6 py-3 bg-white/10 rounded-full flex items-center gap-2 text-white"
                                    >
                                        <RefreshCw size={18} /> Retry
                                    </button>
                                </div>
                            )}

                            {/* Viewfinder */}
                            {cameraReady && !cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-64 h-64 relative">
                                        <div className="absolute -top-1 -left-1 w-10 h-10 border-t-[3px] border-l-[3px] border-cyan-400 rounded-tl-2xl" />
                                        <div className="absolute -top-1 -right-1 w-10 h-10 border-t-[3px] border-r-[3px] border-cyan-400 rounded-tr-2xl" />
                                        <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-[3px] border-l-[3px] border-cyan-400 rounded-bl-2xl" />
                                        <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-[3px] border-r-[3px] border-cyan-400 rounded-br-2xl" />
                                    </div>
                                </div>
                            )}
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
                                    Paste any product page link
                                </p>
                                <div className="relative mb-6">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
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
                                    disabled={!urlInput.trim() || isProcessing}
                                    className="w-full bg-white text-black font-bold py-4 rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    {isProcessing && <Loader2 size={20} className="animate-spin" />}
                                    {isProcessing ? 'Analyzing...' : 'Analyze Impact'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls - Capture Button */}
            {mode === 'scan' && (
                <div className="flex-shrink-0 flex flex-col items-center py-6 relative z-20">
                    <p className="text-white/50 text-sm mb-4">
                        {cameraReady ? 'Point at product & tap to capture' : 'Starting camera...'}
                    </p>
                    <button
                        onClick={handleCapture}
                        disabled={!cameraReady || isProcessing}
                        className={clsx(
                            "w-20 h-20 bg-white rounded-full flex items-center justify-center",
                            "disabled:opacity-30 active:scale-95 transition-transform",
                            "shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                        )}
                        aria-label="Capture photo"
                    >
                        <div className="w-16 h-16 border-4 border-black rounded-full" />
                    </button>
                </div>
            )}

            {/* Loading Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        <Loader2 size={48} className="text-white animate-spin mb-4" />
                        <p className="text-white text-xl">Analyzing...</p>
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
                        className="absolute bottom-24 left-4 right-4 z-50 bg-red-500/95 backdrop-blur p-4 rounded-2xl flex items-center gap-3"
                    >
                        <p className="text-white flex-1">{error}</p>
                        <button onClick={() => setError(null)} className="p-2 hover:bg-white/10 rounded-full">
                            <X size={20} className="text-white" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {result && !comparingItem && (
                    <ImpactCard
                        data={result}
                        onClose={handleClose}
                        capturedImage={capturedImage || undefined}
                        onCompare={handleCompare}
                    />
                )}
                {result && comparingItem && (
                    <ComparisonView
                        original={result}
                        alternative={comparingItem}
                        onClose={() => setComparingItem(null)} // Go back to single card
                        onDecision={handleClose} // Close everything if made a decision
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
