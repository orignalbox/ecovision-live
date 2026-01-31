import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini 2.0 Flash (Stable)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Enhanced system prompt with recycling info
const SYSTEM_PROMPT = `You are an expert environmental impact analyst. Analyze the provided input and return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "name": "Product Name",
  "category": "Product Category (e.g., Food, Electronics, Clothing)",
  "co2": <number in kg CO2 equivalent>,
  "water": <number in liters>,
  "bio": <number 0-100, higher is better for environment>,
  "ecoScore": "<letter A-E, A is best>",
  "alternatives": [
    {"name": "Specific Eco Alternative 1", "savings": "Specific benefit", "reason": "Why it's better"},
    {"name": "Specific Eco Alternative 2", "savings": "Specific benefit", "reason": "Why it's better"},
    {"name": "Specific Eco Alternative 3", "savings": "Specific benefit", "reason": "Why it's better"}
  ],
  "redFlags": ["Environmental Issue 1", "Environmental Issue 2"],
  "recycling": {
    "recyclable": <boolean>,
    "materials": ["Material 1", "Material 2"],
    "howToDispose": "Specific disposal instructions",
    "reuseIdeas": ["Reuse idea 1", "Reuse idea 2"]
  }
}

Be specific with alternatives - name actual products or brands when possible.
For recycling, be specific about materials and local disposal options.
Base estimates on product category if exact data unknown.`;

// Helper to parse Gemini response
function parseGeminiResponse(text: string): any {
    try {
        let cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON Parse Error:", error);
        return null;
    }
}

// Retry with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            if (error?.status === 429) {
                // Rate limited - wait and retry
                const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
                console.log(`Rate limited, waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                throw error; // Non-retryable error
            }
        }
    }
    throw lastError;
}

// Fallback response when API fails
function getFallbackResponse(inputType: string, inputHint?: string): any {
    return {
        name: inputHint || "Product Analysis Unavailable",
        category: "Unknown",
        co2: 3.5,
        water: 100,
        bio: 50,
        ecoScore: "C",
        alternatives: [
            { name: "Try again in a moment", savings: "API quota limit reached", reason: "Rate limits reset every minute" }
        ],
        redFlags: ["Analysis temporarily unavailable - API quota exceeded"],
        recycling: {
            recyclable: true,
            materials: ["Unknown"],
            howToDispose: "Check local recycling guidelines",
            reuseIdeas: ["Consider donating or repurposing"]
        }
    };
}

// Fetch URL content with better extraction
async function fetchUrlContent(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EcoVision/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const html = await response.text();

        // Extract metadata
        const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
        const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';
        const description = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';
        const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';
        const price = html.match(/\$[\d,]+\.?\d*/)?.[0] || '';

        // Clean HTML
        const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 4000);

        return `URL: ${url}\nTitle: ${ogTitle || title}\nDescription: ${ogDesc || description}\nPrice: ${price}\nContent: ${textContent}`;
    } catch (error: any) {
        return `URL: ${url} (Could not fetch: ${error.message})`;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { image, barcode, url } = body;

        // Demo mode without API key
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                name: "Demo Product",
                category: "Demo",
                co2: 5.2,
                water: 150,
                bio: 65,
                ecoScore: "C",
                alternatives: [
                    { name: "Configure GEMINI_API_KEY", savings: "Enable real analysis", reason: "Set in Vercel env vars" }
                ],
                redFlags: ["Demo mode - API key not configured"],
                recycling: {
                    recyclable: true,
                    materials: ["Demo"],
                    howToDispose: "Configure API key for real data",
                    reuseIdeas: ["Set GEMINI_API_KEY in Vercel"]
                }
            });
        }

        // === BARCODE ANALYSIS ===
        if (barcode) {
            console.log("Barcode:", barcode);

            // Fetch from OpenFoodFacts (has ecoscore data)
            let productInfo = `Barcode: ${barcode}`;
            let offEcoScore = null;

            try {
                const offResponse = await fetch(
                    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
                    { signal: AbortSignal.timeout(5000) }
                );
                const offData = await offResponse.json();

                if (offData.status === 1 && offData.product) {
                    const p = offData.product;
                    productInfo = `
Product: ${p.product_name || 'Unknown'}
Brand: ${p.brands || 'Unknown'}
Categories: ${p.categories || 'Unknown'}
Packaging: ${p.packaging || 'Unknown'}
Ingredients: ${p.ingredients_text?.slice(0, 500) || 'Unknown'}
Ecoscore: ${p.ecoscore_grade || 'Unknown'}
Nutriscore: ${p.nutriscore_grade || 'Unknown'}
Countries: ${p.countries || 'Unknown'}
                    `.trim();
                    offEcoScore = p.ecoscore_grade;
                }
            } catch (e) {
                console.warn("OpenFoodFacts error:", e);
            }

            const result = await model.generateContent([
                SYSTEM_PROMPT,
                `Analyze this product's environmental impact:\n${productInfo}\n\nProvide specific eco-friendly alternatives and detailed recycling instructions.`
            ]);

            const data = parseGeminiResponse(result.response.text());
            if (!data) throw new Error("Failed to parse response");

            // Use OpenFoodFacts ecoscore if available
            if (offEcoScore) data.ecoScore = offEcoScore.toUpperCase();

            return NextResponse.json(data);
        }

        // === URL ANALYSIS ===
        if (url) {
            console.log("URL:", url);

            const pageContent = await fetchUrlContent(url);

            const result = await model.generateContent([
                SYSTEM_PROMPT,
                `Analyze this product page and provide environmental impact data with SPECIFIC alternative products that are available online:\n\n${pageContent}`
            ]);

            const data = parseGeminiResponse(result.response.text());
            if (!data) throw new Error("Failed to parse response");

            return NextResponse.json(data);
        }

        // === IMAGE ANALYSIS ===
        if (image) {
            console.log("Image analysis");

            let base64Data = image;
            let mimeType = "image/jpeg";

            if (image.includes("base64,")) {
                const parts = image.split("base64,");
                base64Data = parts[1];
                const mimeMatch = image.match(/data:([^;]+);/);
                if (mimeMatch) mimeType = mimeMatch[1];
            }

            const result = await model.generateContent([
                SYSTEM_PROMPT,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                },
                "Identify this product and analyze its environmental impact. Provide specific alternatives and detailed recycling/disposal instructions."
            ]);

            const data = parseGeminiResponse(result.response.text());
            if (!data) throw new Error("Failed to parse response");

            return NextResponse.json(data);
        }

        return NextResponse.json({ error: "No input provided" }, { status: 400 });

    } catch (error: any) {
        console.error("API Error:", error);

        // Check if it's a rate limit error
        const isRateLimit = error?.status === 429 ||
            error?.message?.includes('429') ||
            error?.message?.includes('quota');

        if (isRateLimit) {
            // Return a graceful fallback instead of error
            return NextResponse.json(getFallbackResponse("rate_limit"));
        }

        return NextResponse.json({
            name: "Error",
            category: "Unknown",
            co2: 0,
            water: 0,
            bio: 50,
            ecoScore: "?",
            alternatives: [],
            redFlags: [error.message || "Unknown error"],
            recycling: {
                recyclable: false,
                materials: [],
                howToDispose: "Unable to determine",
                reuseIdeas: []
            },
            error: error.message
        }, { status: 500 });
    }
}
