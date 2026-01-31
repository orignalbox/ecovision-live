'use client';

import { MapPin, Navigation, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface RecyclingCenter {
    name: string;
    distance: number;
    lat: number;
    lon: number;
    type?: string;
    materials?: string[];
}

export default function RecyclingLocator() {
    const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
    const [centers, setCenters] = useState<RecyclingCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Calculate distance between two points (Haversine formula)
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 0.621371; // Convert to miles
    };

    // Fetch recycling centers from OpenStreetMap Overpass API
    const fetchCenters = useCallback(async (coords: GeolocationCoordinates) => {
        try {
            const { latitude, longitude } = coords;
            const radius = 10000; // 10km radius

            // Overpass API query for recycling centers
            const query = `
                [out:json][timeout:25];
                (
                    node["amenity"="recycling"](around:${radius},${latitude},${longitude});
                    way["amenity"="recycling"](around:${radius},${latitude},${longitude});
                    node["recycling_type"="centre"](around:${radius},${latitude},${longitude});
                    way["recycling_type"="centre"](around:${radius},${latitude},${longitude});
                );
                out body center;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query,
                headers: { 'Content-Type': 'text/plain' }
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();

            const results: RecyclingCenter[] = data.elements
                .map((el: any) => {
                    const lat = el.lat || el.center?.lat;
                    const lon = el.lon || el.center?.lon;
                    if (!lat || !lon) return null;

                    const tags = el.tags || {};
                    const materials: string[] = [];

                    // Check for accepted materials
                    if (tags['recycling:glass']) materials.push('Glass');
                    if (tags['recycling:paper']) materials.push('Paper');
                    if (tags['recycling:plastic']) materials.push('Plastic');
                    if (tags['recycling:batteries']) materials.push('Batteries');
                    if (tags['recycling:clothes']) materials.push('Clothes');
                    if (tags['recycling:cans']) materials.push('Cans');

                    return {
                        name: tags.name || tags.operator || 'Recycling Center',
                        distance: getDistance(latitude, longitude, lat, lon),
                        lat,
                        lon,
                        type: tags.recycling_type === 'centre' ? 'Full Service' : undefined,
                        materials: materials.length > 0 ? materials : undefined
                    };
                })
                .filter(Boolean)
                .sort((a: RecyclingCenter, b: RecyclingCenter) => a.distance - b.distance)
                .slice(0, 10);

            setCenters(results);
        } catch (err) {
            console.error('Overpass API error:', err);
            setCenters([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation(pos.coords);
                fetchCenters(pos.coords);
            },
            () => {
                setError('Location access denied');
                setLoading(false);
            }
        );
    }, [fetchCenters]);

    const openInMaps = (center: RecyclingCenter) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lon}`;
        window.open(url, '_blank');
    };

    const refresh = () => {
        if (location) {
            setLoading(true);
            fetchCenters(location);
        }
    };

    return (
        <div className="h-full w-full bg-void-black relative overflow-hidden flex flex-col">
            {/* Background */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-void-black to-void-black" />

            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-8 pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Nearby Centers</h1>
                        <p className="text-white/50 text-sm">
                            {location
                                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                                : 'Locating...'}
                        </p>
                    </div>
                    {!loading && location && (
                        <button
                            onClick={refresh}
                            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            aria-label="Refresh"
                        >
                            <RefreshCw size={18} className="text-white" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 relative z-10">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="relative w-32 h-32 mb-6">
                                <div className="absolute inset-0 rounded-full border-2 border-ozone-blue/30 animate-ping" />
                                <div className="absolute inset-4 rounded-full bg-glass-white flex items-center justify-center">
                                    <MapPin size={32} className="text-ozone-blue" />
                                </div>
                            </div>
                            <h2 className="text-lg font-light text-white mb-2">Finding Recycling Centers</h2>
                            <div className="flex items-center gap-2 text-white/50 text-sm">
                                <Loader2 size={14} className="animate-spin" /> Searching nearby...
                            </div>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <MapPin size={48} className="text-alert-amber mb-4" />
                            <p className="text-alert-amber text-lg mb-2">{error}</p>
                            <p className="text-white/50 text-sm">Please enable location services</p>
                        </motion.div>
                    ) : centers.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <MapPin size={48} className="text-white/30 mb-4" />
                            <p className="text-white/70 text-lg mb-2">No Centers Found</p>
                            <p className="text-white/40 text-sm text-center max-w-xs">
                                No recycling centers found within 10km. Try expanding your search area.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            {centers.map((center, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => openInMaps(center)}
                                    className="bg-glass-white p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:border-ozone-blue/50 transition-colors cursor-pointer active:scale-[0.98] group"
                                >
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-ozone-blue group-hover:bg-ozone-blue group-hover:text-black transition-colors flex-shrink-0">
                                        <Navigation size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-semibold truncate">{center.name}</div>
                                        <div className="text-xs text-white/50">
                                            {center.distance.toFixed(1)} miles away
                                        </div>
                                        {center.materials && center.materials.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {center.materials.slice(0, 3).map((m, j) => (
                                                    <span key={j} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/60">
                                                        {m}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {center.type && (
                                            <span className="text-life-green text-[10px] font-bold border border-life-green/30 px-2 py-1 rounded">
                                                {center.type}
                                            </span>
                                        )}
                                        <ExternalLink size={16} className="text-white/30" />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer info */}
            <div className="flex-shrink-0 px-6 py-4 text-center relative z-10">
                <p className="text-white/30 text-xs">
                    Data from OpenStreetMap • Tap to open in Maps
                </p>
            </div>
        </div>
    );
}
