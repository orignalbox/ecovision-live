/**
 * Location Utilities
 * Shared components for geolocation, place search, and distance calculation
 */

export interface Place {
    name: string;
    shortName: string;
    lat: number;
    lon: number;
}

export interface Coordinates {
    lat: number;
    lon: number;
}

/**
 * Get current location using browser geolocation
 */
export function getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

/**
 * Search for places using Nominatim (OpenStreetMap) - Free, no API key
 */
export async function searchPlace(query: string, countryCode = 'in'): Promise<Place[]> {
    if (!query.trim() || query.length < 3) return [];

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${countryCode}&limit=5`,
        {
            headers: { 'User-Agent': 'EcoVision/1.0' }
        }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((item: any) => ({
        name: item.display_name,
        shortName: item.display_name.split(',').slice(0, 2).join(', '),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
    }));
}

/**
 * Reverse geocode coordinates to get place name
 */
export async function reverseGeocode(coords: Coordinates): Promise<string> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`,
            { headers: { 'User-Agent': 'EcoVision/1.0' } }
        );

        if (!response.ok) return 'Current Location';

        const data = await response.json();
        const address = data.address;

        // Return a short, readable name
        const parts = [];
        if (address.suburb) parts.push(address.suburb);
        else if (address.neighbourhood) parts.push(address.neighbourhood);
        if (address.city) parts.push(address.city);
        else if (address.town) parts.push(address.town);
        else if (address.state) parts.push(address.state);

        return parts.slice(0, 2).join(', ') || 'Current Location';
    } catch {
        return 'Current Location';
    }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
    from: Coordinates,
    to: Coordinates
): number {
    const R = 6371; // Earth's radius in km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lon - from.lon) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Estimate travel time based on mode
 * Returns time in minutes
 */
export function estimateTravelTime(distanceKm: number, mode: 'car' | 'auto' | 'metro' | 'cycle' | 'walk'): number {
    const speedsKmh: Record<string, number> = {
        car: 25,    // Urban traffic
        auto: 20,   // Slightly slower
        metro: 35,  // Including wait/walk
        cycle: 15,
        walk: 5,
    };

    const baseTime = (distanceKm / speedsKmh[mode]) * 60;

    // Add buffer for metro (wait time + walking)
    if (mode === 'metro') return baseTime + 8;

    return Math.round(baseTime);
}
