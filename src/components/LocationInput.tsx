'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Loader2, Search, X } from 'lucide-react';
import {
    getCurrentLocation,
    searchPlace,
    reverseGeocode,
    type Place,
    type Coordinates
} from '@/lib/location';

interface LocationInputProps {
    label: string;
    placeholder?: string;
    useCurrentLocation?: boolean;
    onLocationChange: (coords: Coordinates | null, name: string) => void;
    accentColor?: string;
}

export default function LocationInput({
    label,
    placeholder = 'Search location...',
    useCurrentLocation = false,
    onLocationChange,
    accentColor = 'blue',
}: LocationInputProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<{ name: string; coords: Coordinates } | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get current location on mount if requested
    useEffect(() => {
        if (useCurrentLocation) {
            setLoading(true);
            getCurrentLocation()
                .then(async (coords) => {
                    const name = await reverseGeocode(coords);
                    setSelectedPlace({ name, coords });
                    onLocationChange(coords, name);
                })
                .catch(() => {
                    // Silently fail, user can search manually
                })
                .finally(() => setLoading(false));
        }
    }, [useCurrentLocation, onLocationChange]);

    // Search for places with debounce
    const handleSearch = useCallback(async (value: string) => {
        if (value.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        const results = await searchPlace(value);
        setSuggestions(results);
        setLoading(false);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedPlace(null);
        onLocationChange(null, '');

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => handleSearch(value), 300);
    };

    const handleSelectPlace = (place: Place) => {
        const coords = { lat: place.lat, lon: place.lon };
        setSelectedPlace({ name: place.shortName, coords });
        setQuery('');
        setSuggestions([]);
        onLocationChange(coords, place.shortName);
        inputRef.current?.blur();
    };

    const handleUseCurrentLocation = async () => {
        setLoading(true);
        try {
            const coords = await getCurrentLocation();
            const name = await reverseGeocode(coords);
            setSelectedPlace({ name, coords });
            setQuery('');
            setSuggestions([]);
            onLocationChange(coords, name);
        } catch (error) {
            console.error('Location error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedPlace(null);
        setQuery('');
        setSuggestions([]);
        onLocationChange(null, '');
        inputRef.current?.focus();
    };

    const colorOptions: Record<string, { ring: string; icon: string; button: string }> = {
        blue: {
            ring: 'focus-within:ring-blue-500/30',
            icon: 'text-blue-400',
            button: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
        },
        orange: {
            ring: 'focus-within:ring-orange-500/30',
            icon: 'text-orange-400',
            button: 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20',
        },
        green: {
            ring: 'focus-within:ring-green-500/30',
            icon: 'text-green-400',
            button: 'bg-green-500/10 text-green-400 hover:bg-green-500/20',
        },
    };

    const colorClasses = colorOptions[accentColor] || colorOptions.blue;

    return (
        <div className="relative">
            {/* Label */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                    {label}
                </span>
                {!selectedPlace && !useCurrentLocation && (
                    <button
                        onClick={handleUseCurrentLocation}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${colorClasses.button}`}
                    >
                        <Navigation size={10} />
                        Use current
                    </button>
                )}
            </div>

            {/* Input Container */}
            <div
                className={`
          relative bg-white/[0.03] border border-white/10 rounded-xl
          transition-all duration-200 ${colorClasses.ring}
          ${isFocused ? 'ring-2 border-white/20' : ''}
        `}
            >
                {selectedPlace ? (
                    // Selected state
                    <div className="flex items-center gap-3 px-4 py-3.5">
                        <MapPin size={18} className={colorClasses.icon} />
                        <span className="flex-1 text-white font-medium truncate">
                            {selectedPlace.name}
                        </span>
                        <button
                            onClick={handleClear}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={16} className="text-white/40" />
                        </button>
                    </div>
                ) : (
                    // Search state
                    <div className="flex items-center gap-3 px-4 py-3.5">
                        {loading ? (
                            <Loader2 size={18} className="text-white/40 animate-spin" />
                        ) : (
                            <Search size={18} className="text-white/40" />
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                            placeholder={placeholder}
                            className="flex-1 bg-transparent text-white placeholder-white/30 outline-none"
                        />
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
                {suggestions.length > 0 && isFocused && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1c] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                    >
                        {suggestions.map((place, index) => (
                            <button
                                key={`${place.lat}-${place.lon}`}
                                onClick={() => handleSelectPlace(place)}
                                className={`
                  w-full flex items-start gap-3 px-4 py-3 text-left
                  hover:bg-white/5 transition-colors
                  ${index !== suggestions.length - 1 ? 'border-b border-white/5' : ''}
                `}
                            >
                                <MapPin size={16} className="text-white/30 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">
                                        {place.shortName}
                                    </p>
                                    <p className="text-white/40 text-xs truncate">
                                        {place.name}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
