'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Link as LinkIcon, Zap, ZapOff, Loader2, ImagePlus, X } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import clsx from 'clsx';
import ImpactCard from './ImpactCard';

// Stable video constraints - defined outside component to prevent re-renders
const VIDEO_CONSTRAINTS = {
    facingMode: "environment",
    width: { ideal: 1280 },
    height: { ideal: 720 }
};

export default function TheLens() {
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

    const [mode, setMode] = useState<'scan' | 'url'>('scan');
    const [isProcessing, setIsProcessing] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [torchOn, setTorchOn] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize barcode reader once
    useEffect(() => {
        codeReaderRef.current = new BrowserMultiFormatReader();
        return () => {
            codeReaderRef.current?.reset();
        };
    }, []);

    // Barcode scanning loop
    useEffect(() => {
        if (mode !== 'scan' || isProcessing || result || !cameraReady) return;

        const scanInterval = setInterval(async () => {
            const video = webcamRef.current?.video;
            if (!video || video.readyState !== 4 || !codeReaderRef.current) return;

            try {
                const decoded = await codeReaderRef.current.decodeFromVideoElement(video);
                if (decoded) {
                    clearInterval(scanInterval);
                    handleAnalyze({ barcode: decoded.getText() });
                }
            } catch (err) {
                // NotFoundException is expected when no barcode is visible
                if (!(err instanceof NotFoundException)) {
                    // Ignore other scanning errors silently
                }
            }
        }, 500);

        return () => clearInterval(scanInterval);
    }, [mode, isProcessing, result, cameraReady]);

    // Toggle flashlight/torch
    const toggleTorch = useCallback(async () => {
        try {
            const stream = webcamRef.current?.video?.srcObject as MediaStream;
            if (!stream) return;

            const track = stream.getVideoTracks()[0];
            if (!track) return;

            // @ts-ignore - torch is experimental API
            await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
            setTorchOn(!torchOn);
        } catch (err) {
            console.log("Torch not available");
        }
    }, [torchOn]);

    // Capture photo from webcam
    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            handleAnalyze({ image: imageSrc });
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

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setResult(data);
            }
        } catch (err: any) {
            setError(err.message || "Analysis failed");
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
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                videoConstraints={VIDEO_CONSTRAINTS}
                                onUserMedia={() => setCameraReady(true)}
                                onUserMediaError={(err) => {
                                    console.error("Camera error:", err);
                                    setError("Camera access denied. Please enable camera permissions.");
                                }}
                                className="h-full w-full object-cover"
                                playsInline
                                muted
                            />

                            {/* Torch Button */}
                            <button
                                onClick={toggleTorch}
                                className="absolute top-6 right-6 z-30 p-3 bg-black/50 backdrop-blur-md rounded-full border border-white/10"
                            >
                                {torchOn ? (
                                    <Zap size={20} className="text-amber-400 fill-amber-400" />
                                ) : (
                                    <ZapOff size={20} className="text-white" />
                                )}
                            </button>

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
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            {/* Scanning Reticle */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-72 h-72 relative">
                                    {/* Corner brackets */}
                                    <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl" />
                                    <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl" />
                                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl" />
                                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-cyan-400 rounded-br-xl" />

                                    {/* Scanning line animation */}
                                    <motion.div
                                        animate={{ y: [0, 288, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                                    />
                                </div>
                            </div>

                            {/* Status indicator */}
                            <div className="absolute bottom-32 left-0 right-0 text-center">
                                <p className="text-white/60 text-sm">
                                    {cameraReady ? "Point at barcode or tap capture" : "Initializing camera..."}
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
                                        placeholder="https://example.com/product"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!urlInput || isProcessing}
                                    className="mt-6 w-full bg-white text-black font-bold py-4 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing && <Loader2 className="animate-spin" size={20} />}
                                    {isProcessing ? 'Analyzing...' : 'Analyze'}
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
                        <Scan size={18} />
                        <span>Lens</span>
                    </button>

                    {/* Capture button - only in scan mode */}
                    {mode === 'scan' && (
                        <button
                            onClick={handleCapture}
                            disabled={isProcessing || !cameraReady}
                            className="mx-2 w-14 h-14 bg-white rounded-full flex items-center justify-center disabled:opacity-50"
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
                        <p className="mt-6 text-white text-lg">Analyzing...</p>
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
                        <p className="text-white text-sm">{error}</p>
                        <button onClick={() => setError(null)} className="p-1">
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
