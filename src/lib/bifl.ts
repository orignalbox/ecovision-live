/**
 * BIFL (Buy It For Life) Product Database
 * Curated products that last and save money long-term
 * 
 * All products with real prices and buy links
 */

export interface BIFLProduct {
    id: string;
    name: string;
    brand: string;
    price: number;
    lifespanYears: number;
    usesPerWeek: number;
    warranty: string;
    whyBIFL: string;
    links: {
        amazon?: string;
        flipkart?: string;
        official?: string;
    };
}

export interface BIFLCategory {
    name: string;
    icon: string;
    slug: string;
    budgetOption: {
        name: string;
        price: number;
        lifespanYears: number;
    };
    products: BIFLProduct[];
}

export const BIFL_CATEGORIES: BIFLCategory[] = [
    {
        name: 'Backpacks',
        icon: '🎒',
        slug: 'backpacks',
        budgetOption: {
            name: 'Generic backpack',
            price: 799,
            lifespanYears: 1,
        },
        products: [
            {
                id: 'wildcraft-alpine',
                name: 'Alpine 35L',
                brand: 'Wildcraft',
                price: 2999,
                lifespanYears: 8,
                usesPerWeek: 5,
                warranty: '5 Year',
                whyBIFL: 'Heavy-duty YKK zippers, water-resistant, reinforced stitching',
                links: {
                    amazon: 'https://www.amazon.in/s?k=wildcraft+alpine+35l',
                    flipkart: 'https://www.flipkart.com/search?q=wildcraft+alpine+35l',
                },
            },
            {
                id: 'decathlon-forclaz',
                name: 'Forclaz 40L',
                brand: 'Decathlon',
                price: 2499,
                lifespanYears: 6,
                usesPerWeek: 5,
                warranty: '10 Year',
                whyBIFL: '10-year warranty, designed for trekking, extremely durable',
                links: {
                    official: 'https://www.decathlon.in/search?query=forclaz%2040l',
                },
            },
            {
                id: 'american-tourister-urban',
                name: 'Urban Groove',
                brand: 'American Tourister',
                price: 2199,
                lifespanYears: 5,
                usesPerWeek: 5,
                warranty: '3 Year',
                whyBIFL: 'Trusted brand, good warranty, laptop compartment',
                links: {
                    amazon: 'https://www.amazon.in/s?k=american+tourister+urban+groove',
                },
            },
        ],
    },
    {
        name: 'Shoes',
        icon: '👟',
        slug: 'shoes',
        budgetOption: {
            name: 'Generic sneakers',
            price: 999,
            lifespanYears: 0.75,
        },
        products: [
            {
                id: 'woodland-leather',
                name: 'Leather Sneakers',
                brand: 'Woodland',
                price: 3995,
                lifespanYears: 5,
                usesPerWeek: 4,
                warranty: '6 Month',
                whyBIFL: 'Full grain leather, resoleable, classic design',
                links: {
                    amazon: 'https://www.amazon.in/s?k=woodland+leather+sneakers',
                    official: 'https://www.woodlandworldwide.com/',
                },
            },
            {
                id: 'redtape-casual',
                name: 'Casual Leather Shoes',
                brand: 'Red Tape',
                price: 2499,
                lifespanYears: 4,
                usesPerWeek: 4,
                warranty: '3 Month',
                whyBIFL: 'Quality leather, comfortable, versatile style',
                links: {
                    amazon: 'https://www.amazon.in/s?k=red+tape+leather+casual',
                },
            },
        ],
    },
    {
        name: 'Kitchen',
        icon: '🔪',
        slug: 'kitchen',
        budgetOption: {
            name: 'Cheap knife set',
            price: 599,
            lifespanYears: 1,
        },
        products: [
            {
                id: 'victorinox-chef',
                name: 'Fibrox Chef Knife 8"',
                brand: 'Victorinox',
                price: 2800,
                lifespanYears: 20,
                usesPerWeek: 7,
                warranty: 'Lifetime',
                whyBIFL: 'Swiss made, used by professional chefs, holds edge well',
                links: {
                    amazon: 'https://www.amazon.in/s?k=victorinox+chef+knife+8+inch',
                },
            },
            {
                id: 'prestige-cookware',
                name: 'Omega Deluxe Set',
                brand: 'Prestige',
                price: 3999,
                lifespanYears: 15,
                usesPerWeek: 7,
                warranty: '5 Year',
                whyBIFL: 'Hard anodized, even heating, Indian brand with good service',
                links: {
                    amazon: 'https://www.amazon.in/s?k=prestige+omega+deluxe',
                    flipkart: 'https://www.flipkart.com/search?q=prestige+omega+deluxe',
                },
            },
            {
                id: 'hawkins-pressure-cooker',
                name: 'Classic Pressure Cooker 5L',
                brand: 'Hawkins',
                price: 2800,
                lifespanYears: 25,
                usesPerWeek: 5,
                warranty: '5 Year',
                whyBIFL: 'Made in India, spare parts available forever, lasts generations',
                links: {
                    amazon: 'https://www.amazon.in/s?k=hawkins+classic+5+litre',
                },
            },
        ],
    },
    {
        name: 'Clothing',
        icon: '👕',
        slug: 'clothing',
        budgetOption: {
            name: 'Fast fashion t-shirt',
            price: 499,
            lifespanYears: 0.5,
        },
        products: [
            {
                id: 'levis-501',
                name: '501 Original Jeans',
                brand: "Levi's",
                price: 2999,
                lifespanYears: 6,
                usesPerWeek: 2,
                warranty: 'None',
                whyBIFL: 'Iconic fit, heavy denim that ages beautifully, repairable',
                links: {
                    official: 'https://www.levi.in/501',
                    amazon: 'https://www.amazon.in/s?k=levis+501+original',
                },
            },
            {
                id: 'uniqlo-supima',
                name: 'Supima Cotton T-Shirt',
                brand: 'Uniqlo',
                price: 990,
                lifespanYears: 3,
                usesPerWeek: 2,
                warranty: 'None',
                whyBIFL: 'High quality cotton, minimal design that never dates',
                links: {
                    official: 'https://www.uniqlo.com/in/',
                },
            },
        ],
    },
    {
        name: 'Tools',
        icon: '🔧',
        slug: 'tools',
        budgetOption: {
            name: 'Cheap toolkit',
            price: 799,
            lifespanYears: 2,
        },
        products: [
            {
                id: 'stanley-toolkit',
                name: '65 Piece Tool Kit',
                brand: 'Stanley',
                price: 3499,
                lifespanYears: 25,
                usesPerWeek: 1,
                warranty: 'Lifetime',
                whyBIFL: 'Chrome vanadium steel, lifetime warranty, industry standard',
                links: {
                    amazon: 'https://www.amazon.in/s?k=stanley+65+piece+tool+kit',
                },
            },
            {
                id: 'bosch-drill',
                name: 'GSB 600 Impact Drill',
                brand: 'Bosch',
                price: 3200,
                lifespanYears: 15,
                usesPerWeek: 0.5,
                warranty: '1 Year',
                whyBIFL: 'Professional grade, spare parts available, powerful motor',
                links: {
                    amazon: 'https://www.amazon.in/s?k=bosch+gsb+600',
                },
            },
        ],
    },
    {
        name: 'Tech',
        icon: '💼',
        slug: 'tech',
        budgetOption: {
            name: 'Budget earbuds',
            price: 999,
            lifespanYears: 0.5,
        },
        products: [
            {
                id: 'sony-wh1000xm4',
                name: 'WH-1000XM4',
                brand: 'Sony',
                price: 19990,
                lifespanYears: 6,
                usesPerWeek: 7,
                warranty: '1 Year',
                whyBIFL: 'Best-in-class ANC, replaceable ear pads, software updates',
                links: {
                    amazon: 'https://www.amazon.in/s?k=sony+wh-1000xm4',
                    flipkart: 'https://www.flipkart.com/search?q=sony+wh-1000xm4',
                },
            },
            {
                id: 'anker-powerbank',
                name: 'PowerCore 20000mAh',
                brand: 'Anker',
                price: 2999,
                lifespanYears: 5,
                usesPerWeek: 3,
                warranty: '18 Month',
                whyBIFL: 'Quality cells, excellent safety, trusted brand',
                links: {
                    amazon: 'https://www.amazon.in/s?k=anker+powercore+20000',
                },
            },
            {
                id: 'logitech-mx-master',
                name: 'MX Master 3S',
                brand: 'Logitech',
                price: 8995,
                lifespanYears: 7,
                usesPerWeek: 7,
                warranty: '2 Year',
                whyBIFL: 'Best ergonomic mouse, USB-C charging, works on any surface',
                links: {
                    amazon: 'https://www.amazon.in/s?k=logitech+mx+master+3s',
                },
            },
        ],
    },
];

// Utility functions
export function calculateCostPerUse(
    price: number,
    lifespanYears: number,
    usesPerWeek: number
): number {
    const totalUses = lifespanYears * 52 * usesPerWeek;
    if (totalUses === 0) return price;
    return price / totalUses;
}

export function calculateCostPerYear(price: number, lifespanYears: number): number {
    return price / lifespanYears;
}

export function calculateTotalCostOverYears(
    price: number,
    lifespanYears: number,
    years: number
): { total: number; purchases: number } {
    const purchases = Math.ceil(years / lifespanYears);
    return {
        total: price * purchases,
        purchases,
    };
}

export function compareBudgetVsBIFL(
    budget: { price: number; lifespanYears: number },
    bifl: { price: number; lifespanYears: number },
    compareYears: number = 10
): {
    budgetTotal: number;
    budgetPurchases: number;
    biflTotal: number;
    biflPurchases: number;
    savings: number;
    savingsPercent: number;
    productsSaved: number;
} {
    const budgetResult = calculateTotalCostOverYears(budget.price, budget.lifespanYears, compareYears);
    const biflResult = calculateTotalCostOverYears(bifl.price, bifl.lifespanYears, compareYears);

    const savings = budgetResult.total - biflResult.total;
    const savingsPercent = savings > 0 ? (savings / budgetResult.total) * 100 : 0;

    return {
        budgetTotal: budgetResult.total,
        budgetPurchases: budgetResult.purchases,
        biflTotal: biflResult.total,
        biflPurchases: biflResult.purchases,
        savings: Math.max(0, savings),
        savingsPercent,
        productsSaved: Math.max(0, budgetResult.purchases - biflResult.purchases),
    };
}

export function getCategoryBySlug(slug: string): BIFLCategory | undefined {
    return BIFL_CATEGORIES.find(cat => cat.slug === slug);
}

export function getProductById(id: string): { product: BIFLProduct; category: BIFLCategory } | undefined {
    for (const category of BIFL_CATEGORIES) {
        const product = category.products.find(p => p.id === id);
        if (product) {
            return { product, category };
        }
    }
    return undefined;
}

// Category keywords for matching scanned products to BIFL categories
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    backpacks: ['bag', 'backpack', 'rucksack', 'luggage', 'suitcase', 'duffel', 'tote', 'handbag', 'purse'],
    shoes: ['shoe', 'sneaker', 'boot', 'sandal', 'footwear', 'slipper', 'loafer', 'oxford', 'heel'],
    kitchen: ['knife', 'pan', 'pot', 'cookware', 'kitchen', 'utensil', 'cooker', 'mixer', 'blender', 'plate', 'bowl', 'dish'],
    clothing: ['shirt', 'pant', 'jean', 'dress', 'jacket', 'coat', 'sweater', 'hoodie', 't-shirt', 'cloth', 'apparel', 'wear', 'garment'],
    tools: ['tool', 'drill', 'hammer', 'screwdriver', 'wrench', 'plier', 'toolkit', 'hardware'],
    tech: ['headphone', 'earphone', 'earbud', 'phone', 'laptop', 'charger', 'cable', 'speaker', 'mouse', 'keyboard', 'powerbank', 'electronic'],
};

/**
 * Match a scanned product to a BIFL category
 * Returns the category and up to 2 recommended products
 */
export function matchProductToCategory(
    productName: string,
    productCategory?: string
): { category: BIFLCategory; products: BIFLProduct[] } | null {
    const searchTerms = `${productName} ${productCategory || ''}`.toLowerCase();

    for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (searchTerms.includes(keyword)) {
                const category = getCategoryBySlug(slug);
                if (category) {
                    // Return top 2 products from this category
                    return {
                        category,
                        products: category.products.slice(0, 2),
                    };
                }
            }
        }
    }

    return null;
}

