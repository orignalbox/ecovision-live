'use client';

import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// Simulated database of centers (would come from API normally)
const MOCK_CENTERS = [
    { name: "EcoWorld Recycling Hub", lat: 0.01, lng: 0.01, type: "Best Match", closing: "6pm" },
    { name: "City Waste Management", lat: -0.02, lng: 0.005, type: undefined, closing: "5pm" },
    { name: "Green Earth Drop-off", lat: 0.015, lng: -0.01, type: "Glass Only", closing: "24h" }
];

export default function RecyclingLocator() {
    const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation(pos.coords);
                // Artificial delay for "Scanning" effect
                setTimeout(() => setLoading(false), 2000);
            },
            (err) => {
                setError('Location access denied');
                setLoading(false);
            }
        );
    }, []);

    return (
        <div className="h-full w-full bg-void-black relative overflow-hidden flex flex-col items-center justify-center text-center p-6 pb-32">

            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-void-black to-void-black" />

            {/* Radar Circle */}
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative z-10 w-64 h-64 bg-glass-white rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(58,190,255,0.1)] mb-12"
            >
                {loading && <div className="absolute inset-0 rounded-full border border-ozone-blue/30 animate-ping opacity-20" />}
                <div className="w-48 h-48 bg-void-black rounded-full flex items-center justify-center relative overflow-hidden">
                    <MapPin size={48} className={loading ? "text-white/20" : "text-ozone-blue animate-bounce"} />
                    {loading && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-ozone-blue/10 to-transparent animate-spin-slow w-full h-full" style={{ animationDuration: '3s' }} />
                    )}
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <h2 className="text-xl font-light text-white mb-2">Triangulating Position...</h2>
                        <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
                            <Loader2 size={14} className="animate-spin" /> Acquiring GPS Satellites
                        </div>
                    </motion.div>
                ) : error ? (
                    <motion.div key="error" className="text-alert-amber">
                        <p>{error}. Please enable GPS.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="w-full max-w-sm"
                    >
                        <h2 className="text-2xl font-light text-white mb-2 text-left">Nearby Centers</h2>
                        <p className="text-white/50 mb-6 text-left text-sm">Based on your coordinates: {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}</p>

                        <div className="space-y-4">
                            {MOCK_CENTERS.map((center, i) => (
                                <div key={i} className="bg-glass-white p-4 rounded-xl flex items-center gap-4 text-left border border-white/5 hover:border-ozone-blue/50 transition-colors cursor-pointer active:scale-95 group">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-ozone-blue group-hover:bg-ozone-blue group-hover:text-black transition-colors">
                                        <Navigation size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white font-bold">{center.name}</div>
                                        <div className="text-xs text-white/50">{(1.2 + i * 0.8).toFixed(1)} miles away • closes {center.closing}</div>
                                    </div>
                                    {center.type && (
                                        <div className="text-life-green text-[10px] font-bold border border-life-green/30 px-2 py-1 rounded">{center.type}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
