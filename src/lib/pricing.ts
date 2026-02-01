/**
 * India-Specific Pricing Data
 * Real pricing for transport, energy, food in India
 * 
 * Sources:
 * - Ola/Uber fare cards (Jan 2024)
 * - State electricity tariffs
 * - BigBasket/local market averages
 */

// Transport pricing (in ₹)
export const TRANSPORT_PRICING = {
    // Ola/Uber (Delhi/Mumbai rates, approximate)
    ola_mini: {
        base: 40,
        perKm: 12,
        perMin: 1.5,
    },
    ola_prime: {
        base: 60,
        perKm: 15,
        perMin: 2,
    },
    ola_suv: {
        base: 80,
        perKm: 20,
        perMin: 2.5,
    },
    uber_go: {
        base: 40,
        perKm: 12,
        perMin: 1.5,
    },
    uber_premier: {
        base: 60,
        perKm: 15,
        perMin: 2,
    },
    uber_xl: {
        base: 80,
        perKm: 20,
        perMin: 2.5,
    },
    auto_rickshaw: {
        base: 25,
        perKm: 10,
        perMin: 0,  // Usually no time charge
    },

    // Metro fares (Delhi Metro, approximate)
    metro: {
        upTo2km: 10,
        upTo5km: 20,
        upTo12km: 30,
        upTo21km: 40,
        upTo32km: 50,
        above32km: 60,
    },

    // Bus fares
    bus_city: {
        minimum: 5,
        maximum: 15,
    },
    bus_ac: {
        minimum: 10,
        maximum: 30,
    },
} as const;

// Delivery app charges
export const DELIVERY_CHARGES = {
    delivery_fee: {
        min: 25,
        max: 60,
        average: 45,
    },
    packaging_charge: {
        average: 12,
    },
    platform_fee: {
        average: 5,
    },
    // Total extra cost on order
    getTotalExtra: () => 45 + 12 + 5, // ₹62 average
} as const;

// Electricity tariffs (₹ per kWh)
// Using weighted average across states
export const ELECTRICITY_RATES = {
    // Residential tariffs (average across slabs)
    delhi: 5.5,
    mumbai: 6.5,
    bangalore: 6.0,
    chennai: 5.0,
    kolkata: 7.0,
    hyderabad: 6.0,
    pune: 6.5,
    average: 6.0,
} as const;

// Food prices (₹ per kg)
export const FOOD_PRICES = {
    // Proteins
    chicken: 320,
    mutton: 650,
    fish_rohu: 280,
    eggs_per_dozen: 84,  // ₹7 per egg
    paneer: 400,
    tofu: 200,
    lentils_toor: 140,
    lentils_moong: 120,

    // Staples
    rice_basmati: 80,
    rice_regular: 45,
    wheat_atta: 40,

    // Vegetables (average)
    vegetables_average: 50,

    // Dairy
    milk_per_liter: 60,
    curd_per_kg: 80,
} as const;

// Mobile data prices (₹ per GB, average)
export const MOBILE_DATA_RATES = {
    jio: {
        prepaid: 10,     // ~₹10/GB on most plans
        postpaid: 15,
    },
    airtel: {
        prepaid: 12,
        postpaid: 18,
    },
    vi: {
        prepaid: 11,
        postpaid: 16,
    },
    average: 10,
} as const;

// Types
export type City = keyof typeof ELECTRICITY_RATES;
export type TransportType = keyof typeof TRANSPORT_PRICING;

// Utility functions
export function calculateRideCost(
    type: 'ola_mini' | 'ola_prime' | 'uber_go' | 'uber_premier' | 'auto_rickshaw',
    distanceKm: number,
    timeMinutes: number
): number {
    const pricing = TRANSPORT_PRICING[type];
    return Math.round(pricing.base + pricing.perKm * distanceKm + pricing.perMin * timeMinutes);
}

export function calculateMetroFare(distanceKm: number): number {
    const fares = TRANSPORT_PRICING.metro;
    if (distanceKm <= 2) return fares.upTo2km;
    if (distanceKm <= 5) return fares.upTo5km;
    if (distanceKm <= 12) return fares.upTo12km;
    if (distanceKm <= 21) return fares.upTo21km;
    if (distanceKm <= 32) return fares.upTo32km;
    return fares.above32km;
}

export function calculateElectricityCost(
    kwhPerDay: number,
    city: City = 'average'
): { daily: number; monthly: number; yearly: number } {
    const rate = ELECTRICITY_RATES[city];
    const daily = kwhPerDay * rate;
    return {
        daily: Math.round(daily),
        monthly: Math.round(daily * 30),
        yearly: Math.round(daily * 365),
    };
}

export function calculateStreamingDataCost(
    gbUsed: number,
    ratePerGB: number = MOBILE_DATA_RATES.average
): number {
    return Math.round(gbUsed * ratePerGB);
}

// Compare two transport options
export function compareTransportCosts(
    distanceKm: number,
    timeMinutes: number = distanceKm * 3 // rough estimate
): Array<{ mode: string; cost: number; icon: string }> {
    return [
        {
            mode: 'Ola/Uber',
            cost: calculateRideCost('ola_mini', distanceKm, timeMinutes),
            icon: '🚕',
        },
        {
            mode: 'Auto',
            cost: calculateRideCost('auto_rickshaw', distanceKm, timeMinutes),
            icon: '🛺',
        },
        {
            mode: 'Metro',
            cost: calculateMetroFare(distanceKm),
            icon: '🚇',
        },
        {
            mode: 'Cycle/Walk',
            cost: 0,
            icon: '🚲',
        },
    ];
}
