'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Link as LinkIcon, Loader2, ImagePlus, X, RefreshCw, Home, Scan } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import clsx from 'clsx';
import Link from 'next/link';
import ImpactCard from './ImpactCard';
import { useStore } from '@/store/useStore';

export default function TheLens() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
    const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [mode, setMode] = useState<'scan' | 'url'>('scan');
    const [isProcessing, setIsProcessing] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanStatus, setScanStatus] = useState<string>('Initializing...');

    const addLog = useStore((state) => state.addLog);

    // Initialize barcode reader
    useEffect(() => {
        codeReaderRef.current = new BrowserMultiFormatReader();
        return () => {
            codeReaderRef.current?.reset();
        };
    }, []);

    // Initialize camera
    const initCamera = useCallback(async () => {
        setCameraError(null);
        setCameraReady(false);
        setScanStatus('Starting camera...');

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setCameraReady(true);
                    setScanStatus('Scanning for barcodes...');
                };
            }
        } catch (err: any) {
            console.error('Camera error:', err);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setCameraReady(true);
                        setScanStatus('Scanning for barcodes...');
                    };
                }
            } catch (fallbackErr: any) {
                setCameraError(fallbackErr.message || 'Camera access denied');
                setScanStatus('Camera unavailable');
            }
        }
    }, []);

    // Barcode scanning loop - auto-detect and analyze
    useEffect(() => {
        if (mode !== 'scan' || !cameraReady || isProcessing || result) {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
            }
            return;
        }

        scanIntervalRef.current = setInterval(async () => {
            const video = videoRef.current;
            if (!video || video.readyState !== 4 || !codeReaderRef.current) return;

            try {
                const decoded = await codeReaderRef.current.decodeFromVideoElement(video);
                if (decoded) {
                    const barcodeValue = decoded.getText();
                    console.log('Barcode detected:', barcodeValue);

                    // Stop scanning
                    if (scanIntervalRef.current) {
                        clearInterval(scanIntervalRef.current);
                    }

                    // Auto-analyze the barcode
                    setScanStatus(`Barcode found: ${barcodeValue}`);
                    analyze({ barcode: barcodeValue });
                }
            } catch (err) {
                if (!(err instanceof NotFoundException)) {
                    // Ignore not found errors, they're expected
                }
            }
        }, 400);

        return () => {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
            }
        };
    }, [mode, cameraReady, isProcessing, result]);

    // Camera lifecycle
    useEffect(() => {
        if (mode === 'scan') {
            initCamera();
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
            }
        };
    }, [mode, initCamera]);

    // Capture image from video
    const handleCapture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !cameraReady) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);

        analyze({ image: imageData });
    }, [cameraReady]);

    // File upload
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            analyze({ image: reader.result as string });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }, []);

    // URL submit
    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUrl = urlInput.trim();
        if (trimmedUrl) {
            analyze({ url: trimmedUrl });
        }
    };

    // Main analysis function
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
                addLog({
                    name: data.name,
                    co2: data.co2 || 0,
                    water: data.water || 0,
                });
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
        setScanStatus('Scanning for barcodes...');
    };

    return (
        <div className="relative h-[100dvh] w-full bg-void-black overflow-hidden">
            <canvas ref={canvasRef} className="hidden" />

            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center">
                    <Link href="/" className="p-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                        <Home size={20} className="text-white" />
                    </Link>

                    {mode === 'scan' && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10"
                        >
                            <ImagePlus size={20} className="text-white" />
                        </button>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Main View */}
                <div className="flex-1 relative">
                    <AnimatePresence mode="wait">
                        {mode === 'scan' ? (
                            <motion.div
                                key="camera"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black"
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />

                                {/* Camera Error */}
                                {cameraError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-8">
                                        <Camera size={48} className="text-white/20 mb-4" />
                                        <p className="text-white/60 text-center mb-4">{cameraError}</p>
                                        <button
                                            onClick={initCamera}
                                            className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2 text-white"
                                        >
                                            <RefreshCw size={16} /> Retry
                                        </button>
                                    </div>
                                )}

                                {/* Viewfinder with scanning animation */}
                                {cameraReady && !cameraError && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-64 h-64 relative">
                                            {/* Corner brackets */}
                                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

                                            {/* Scanning line */}
                                            <motion.div
                                                animate={{ y: [0, 240, 0] }}
                                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Status */}
                                <div className="absolute bottom-32 left-0 right-0 text-center">
                                    <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
                                        <Scan size={14} className="text-cyan-400" />
                                        <p className="text-white/70 text-sm">{scanStatus}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="url"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-black"
                            >
                                <form onSubmit={handleUrlSubmit} className="w-full max-w-md">
                                    <h2 className="text-xl font-bold text-white mb-2 text-center">Analyze Product URL</h2>
                                    <p className="text-white/40 text-sm mb-6 text-center">
                                        Paste any product page link to analyze its environmental impact
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
                                        className="w-full bg-white text-black font-bold py-4 rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : null}
                                        {isProcessing ? 'Analyzing...' : 'Analyze Impact'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Dock */}
                <div className="absolute bottom-20 left-0 right-0 z-20 flex justify-center px-4">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center gap-2">
                        <button
                            onClick={() => setMode('scan')}
                            className={clsx(
                                "px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium",
                                mode === 'scan' ? "bg-white text-black" : "text-white/60"
                            )}
                        >
                            <Camera size={18} /> Scan
                        </button>

                        {mode === 'scan' && (
                            <button
                                onClick={handleCapture}
                                disabled={!cameraReady || isProcessing}
                                className="mx-2 w-14 h-14 bg-white rounded-full flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
                            >
                                <div className="w-12 h-12 border-[3px] border-black rounded-full" />
                            </button>
                        )}

                        <button
                            onClick={() => setMode('url')}
                            className={clsx(
                                "px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium",
                                mode === 'url' ? "bg-white text-black" : "text-white/60"
                            )}
                        >
                            <LinkIcon size={18} /> Link
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-green-500 blur-2xl animate-pulse" />
                            <Loader2 size={36} className="absolute inset-0 m-auto text-white animate-spin" />
                        </div>
                        <p className="text-white text-lg font-light">Analyzing impact...</p>
                        <p className="text-white/40 text-sm mt-2">Fetching environmental data</p>
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
                        className="absolute bottom-32 left-4 right-4 z-50 bg-red-500/90 backdrop-blur p-4 rounded-2xl flex items-center gap-3"
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
