/**
 * Emission Factors - Real, Cited Data
 * All values in grams CO₂ per kilometer unless specified
 * 
 * Sources:
 * - EPA: https://www.epa.gov/greenvehicles
 * - DEFRA 2023: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023
 * - Delhi Metro: https://www.delhimetrorail.com/sustainability
 * - CPCB India emission standards
 */

// Transport emissions (grams CO₂ per km)
export const TRANSPORT_EMISSIONS = {
    // Rideshare / Taxi
    ola_mini: 175,        // Small sedan (Swift, etc)
    ola_prime: 220,       // Sedan (Honda City, etc)
    ola_suv: 320,         // SUV
    uber_go: 175,
    uber_premier: 220,
    uber_xl: 320,
    auto_rickshaw: 80,    // CNG auto - much cleaner

    // Personal vehicle
    car_petrol: 192,      // Average Indian car
    car_diesel: 171,      // Diesel more efficient
    motorcycle: 72,       // Two-wheeler
    scooter_petrol: 65,
    scooter_electric: 12, // EV scooter (includes grid emissions)

    // Active transport  
    bicycle: 0,
    walking: 0,

    // Public transit (per passenger-km)
    metro_delhi: 22,      // Delhi Metro sustainability report
    metro_mumbai: 25,
    metro_bangalore: 24,
    metro_chennai: 23,
    metro_kolkata: 26,
    bus_city: 45,         // BEST/DTC type
    bus_ac: 65,           // AC bus
    local_train: 18,      // Mumbai local
} as const;

// Food delivery emissions
export const DELIVERY_EMISSIONS = {
    base_emission: 300,       // Base: driver travel to restaurant, waiting
    per_km_emission: 140,     // Per km from restaurant to customer (two-wheeler)
    pickup_car_per_km: 175,   // If you drive to pick up
    pickup_bike_per_km: 0,    // Cycling to pick up
} as const;

// Energy emissions (India grid)
// India grid emission factor: 0.82 kg CO₂/kWh (CEA 2023)
export const GRID_EMISSION_FACTOR = 0.82; // kg CO₂ per kWh

// Appliance power consumption (watts)
export const APPLIANCE_POWER = {
    ac_1ton: 1200,
    ac_1_5ton: 1800,
    ac_2ton: 2400,
    geyser_15l: 2000,
    geyser_25l: 2500,
    washing_machine: 500,
    refrigerator: 150,      // Continuous
    fan_ceiling: 75,
    fan_table: 55,
    led_bulb: 10,
    cfl_bulb: 15,
    incandescent: 60,
    laptop: 50,
    desktop_pc: 200,
    tv_led_32: 50,
    tv_led_55: 80,
    tv_old_crt: 200,
    microwave: 1200,
    induction: 2000,
} as const;

// Diet emissions (kg CO₂ per kg of food)
// Source: Our World in Data, FAO
export const DIET_EMISSIONS = {
    beef: 27.0,
    mutton: 12.0,
    pork: 7.2,
    chicken: 6.9,
    fish_farmed: 5.4,
    fish_wild: 3.0,
    eggs: 4.2,
    cheese: 9.8,
    paneer: 3.2,
    milk: 1.9,
    tofu: 2.0,
    lentils_dal: 0.9,
    rice: 2.7,
    wheat: 1.4,
    vegetables: 0.4,
    fruits: 0.5,
} as const;

// Streaming data usage and emissions
// Source: IEA, Carbon Trust
export const STREAMING = {
    // GB per hour
    data_per_hour: {
        '4k': 7.0,
        '1080p': 3.0,
        '720p': 1.5,
        '480p': 0.7,
        'audio_only': 0.15,
    },
    // grams CO₂ per hour of streaming
    emissions_per_hour: {
        '4k': 220,
        '1080p': 70,
        '720p': 36,
        '480p': 18,
        'audio_only': 5,
    },
} as const;

// Fashion emissions (kg CO₂ per item)
// Source: Ellen MacArthur Foundation, Fashion Revolution
export const FASHION_EMISSIONS = {
    tshirt_fast: 8.0,
    tshirt_quality: 5.0,
    tshirt_thrift: 0.5,
    jeans_fast: 33.4,
    jeans_quality: 20.0,
    jeans_thrift: 1.0,
    jacket_fast: 25.0,
    jacket_quality: 15.0,
    jacket_thrift: 1.0,
    shoes_fast: 14.0,
    shoes_quality: 10.0,
    shoes_thrift: 0.8,
} as const;

// Calorie burn per activity (kcal per km)
export const CALORIE_BURN = {
    walking: 65,        // ~65 kcal per km for average person
    cycling: 35,        // ~35 kcal per km
    running: 80,        // ~80 kcal per km
} as const;

// Types
export type TransportMode = keyof typeof TRANSPORT_EMISSIONS;
export type ApplianceType = keyof typeof APPLIANCE_POWER;
export type FoodType = keyof typeof DIET_EMISSIONS;
export type StreamingQuality = keyof typeof STREAMING.data_per_hour;

// Utility functions
export function calculateTransportEmissions(mode: TransportMode, distanceKm: number): number {
    return (TRANSPORT_EMISSIONS[mode] * distanceKm) / 1000; // Returns kg CO₂
}

export function calculateDeliveryEmissions(distanceKm: number): {
    delivery: number;
    pickupCar: number;
    pickupBike: number;
} {
    const delivery = (DELIVERY_EMISSIONS.base_emission + DELIVERY_EMISSIONS.per_km_emission * distanceKm * 2.5) / 1000;
    const pickupCar = (DELIVERY_EMISSIONS.pickup_car_per_km * distanceKm * 2) / 1000;
    const pickupBike = 0;

    return { delivery, pickupCar, pickupBike };
}

export function calculateEnergyEmissions(watts: number, hoursPerDay: number): {
    daily: number;
    monthly: number;
    yearly: number;
} {
    const kwhPerDay = (watts * hoursPerDay) / 1000;
    const daily = kwhPerDay * GRID_EMISSION_FACTOR;

    return {
        daily,
        monthly: daily * 30,
        yearly: daily * 365,
    };
}

export function calculateCaloriesBurned(mode: 'walking' | 'cycling' | 'running', distanceKm: number): number {
    return CALORIE_BURN[mode] * distanceKm;
}
