'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Scan, History, Link, Camera, Zap } from 'lucide-react';
import clsx from 'clsx';
import PlanetReceipt from './PlanetReceipt';
import Dashboard from './Dashboard';
import { useStore } from '@/store/useStore';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

const videoConstraints = {
    facingMode: "environment"
};

export default function CameraView() {
    const webcamRef = useRef<Webcam>(null);
    const [activeMode, setActiveMode] = useState<'scan' | 'link' | 'history'>('scan');
    const [receiptData, setReceiptData] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);

    const { addLog } = useStore();

    // Handle Mode Changes
    useEffect(() => {
        if (activeMode === 'history') {
            setShowDashboard(true);
        } else {
            setShowDashboard(false);
        }
    }, [activeMode]);

    // Close dashboard -> reset mode to scan
    const closeDashboard = () => {
        setShowDashboard(false);
        setActiveMode('scan');
    };

    const handleLog = () => {
        if (receiptData) {
            addLog({
                name: receiptData.name,
                co2: receiptData.co2,
                water: receiptData.water,
                savings: receiptData.alternatives?.[0]?.savings
            });
            setReceiptData(null); // Close receipt
            setActiveMode('history'); // Go to dashboard
        }
    };

    // Barcode Logic
    useEffect(() => {
        if (activeMode !== 'scan' || receiptData || isProcessing) return;

        const codeReader = new BrowserMultiFormatReader();
        let intervalId: NodeJS.Timeout;

        const scan = async () => {
            if (webcamRef.current?.video) {
                try {
                    const result = await codeReader.decodeFromVideoElement(webcamRef.current.video);
                    if (result) {
                        console.log("Barcode:", result.getText());
                        handleAnalyze(undefined, result.getText());
                        codeReader.reset(); // Stop scanning once found
                    }
                } catch (err) {
                    // NotFoundException is expected while scanning
                    if (!(err instanceof NotFoundException)) {
                        console.error(err);
                    }
                }
            }
        };

        // Scan every 500ms to avoid freezing
        intervalId = setInterval(scan, 500);

        return () => {
            clearInterval(intervalId);
            codeReader.reset();
        };
    }, [activeMode, receiptData, isProcessing]);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                handleAnalyze(imageSrc);
            }
        }
    }, [webcamRef]);

    const handleAnalyze = async (imageSrc?: string, barcode?: string) => {
        setIsProcessing(true);
        try {
            const body = imageSrc ? { image: imageSrc } : { barcode };

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setReceiptData(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Could not analyze. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden">
            {/* Viewfinder */}
            <div className="absolute inset-0 z-0">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Pulse Scanning Effect */}
            {activeMode === 'scan' && !receiptData && (
                <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="w-72 h-72 border border-white/40 rounded-3xl relative"
                    >
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-chlorophyll-green rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-chlorophyll-green rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-chlorophyll-green rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-chlorophyll-green rounded-br-xl" />

                        <motion.div
                            animate={{ top: ['5%', '95%', '5%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute left-0 w-full h-0.5 bg-chlorophyll-green/60 shadow-[0_0_15px_#00B894]"
                        />
                    </motion.div>
                </div>
            )}

            {/* Shutter / Scan Button */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
                <button
                    onClick={capture}
                    disabled={isProcessing}
                    className="group relative flex items-center justify-center"
                >
                    <div className={clsx(
                        "w-20 h-20 rounded-full border-4 transition-all duration-300",
                        isProcessing ? "border-gray-500 scale-90" : "border-white"
                    )} />
                    <div className={clsx(
                        "absolute w-16 h-16 rounded-full transition-all duration-300",
                        isProcessing ? "bg-gray-500 animate-pulse" : "bg-white group-active:scale-90"
                    )} />
                </button>
            </div>

            {/* Floating Dock */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-sm">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-2 flex justify-between items-center shadow-2xl">

                    <button
                        onClick={() => setActiveMode('history')}
                        className={clsx(
                            "p-3 rounded-full transition-all flex flex-col items-center gap-1",
                            activeMode === 'history' ? "text-white" : "text-white/50"
                        )}
                    >
                        <History size={20} />
                        <span className="text-[10px] font-medium">History</span>
                    </button>

                    <button
                        onClick={() => setActiveMode('scan')}
                        className={clsx(
                            "p-4 rounded-full transition-all -mt-8 shadow-lg border-4 border-black/50",
                            activeMode === 'scan' ? "bg-chlorophyll-green text-white" : "bg-white/20 text-white"
                        )}
                    >
                        <Scan size={28} />
                    </button>

                    <button
                        onClick={() => setActiveMode('link')}
                        className={clsx(
                            "p-3 rounded-full transition-all flex flex-col items-center gap-1",
                            activeMode === 'link' ? "text-white" : "text-white/50"
                        )}
                    >
                        <Link size={20} />
                        <span className="text-[10px] font-medium">Link</span>
                    </button>

                </div>
            </div>

            {/* Results Sheet */}
            <PlanetReceipt
                isOpen={!!receiptData}
                onClose={() => setReceiptData(null)}
                data={receiptData}
                onLog={handleLog}
            />

            {/* Dashboard */}
            <Dashboard
                isOpen={showDashboard}
                onClose={closeDashboard}
            />
        </div>
    );
}
