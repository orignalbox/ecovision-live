import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini 3 Flash Preview (Latest Model - Jan 2026)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// System prompt for environmental analysis
const SYSTEM_PROMPT = `You are an expert environmental impact analyst. Analyze the provided input and return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "name": "Product Name",
  "co2": <number in kg CO2 equivalent>,
  "water": <number in liters>,
  "bio": <number 0-100, higher is better for environment>,
  "alternatives": [
    {"name": "Eco Alternative 1", "savings": "Benefit description"},
    {"name": "Eco Alternative 2", "savings": "Benefit description"}
  ],
  "redFlags": ["Environmental Issue 1", "Environmental Issue 2"]
}

Be accurate and helpful. Base estimates on product category if exact data unknown.
For food: consider farming, processing, packaging, transport.
For electronics: consider manufacturing, materials, e-waste.
For clothing: consider materials, labor, dyeing, shipping.`;

// Helper to safely parse Gemini response
function parseGeminiResponse(text: string): any {
    try {
        // Remove markdown code blocks if present
        let cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
        // Try to find JSON object in the response
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON Parse Error:", error, "Raw:", text);
        return null;
    }
}

// Helper to fetch and extract text from URL
async function fetchUrlContent(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EcoVision/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
            },
            signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        // Extract useful content (title, meta description, visible text)
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

        // Remove scripts, styles, and HTML tags
        const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 3000); // Limit content length

        const title = ogTitleMatch?.[1] || titleMatch?.[1] || '';
        const description = ogDescMatch?.[1] || descMatch?.[1] || '';

        return `Page Title: ${title}\nDescription: ${description}\nContent: ${textContent}`;
    } catch (error: any) {
        console.error("URL fetch error:", error);
        return `URL: ${url} (Could not fetch content: ${error.message})`;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { image, barcode, url } = body;

        // Check for API key
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY not configured");
            return NextResponse.json({
                name: "Demo Mode",
                co2: 5.2,
                water: 150,
                bio: 65,
                alternatives: [
                    { name: "Configure GEMINI_API_KEY", savings: "Enable real AI analysis" }
                ],
                redFlags: ["API Key not configured - using demo data"]
            });
        }

        // === BARCODE ANALYSIS ===
        if (barcode) {
            console.log("Analyzing barcode:", barcode);

            // Lookup product from OpenFoodFacts
            let productInfo = `Barcode: ${barcode}`;
            try {
                const offResponse = await fetch(
                    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
                    { signal: AbortSignal.timeout(5000) }
                );
                const offData = await offResponse.json();
                if (offData.status === 1 && offData.product) {
                    const p = offData.product;
                    productInfo = `Product: ${p.product_name || 'Unknown'}, Brand: ${p.brands || 'Unknown'}, Categories: ${p.categories || 'Unknown'}, Packaging: ${p.packaging || 'Unknown'}`;
                }
            } catch (e) {
                console.warn("OpenFoodFacts lookup failed:", e);
            }

            const result = await model.generateContent([
                SYSTEM_PROMPT,
                `Analyze this product and provide environmental impact data:\n${productInfo}`
            ]);

            const data = parseGeminiResponse(result.response.text());
            if (!data) {
                throw new Error("Failed to parse AI response");
            }
            return NextResponse.json(data);
        }

        // === URL ANALYSIS (WITH ACTUAL SCRAPING) ===
        if (url) {
            console.log("Analyzing URL:", url);

            // Actually fetch and parse the URL content
            const pageContent = await fetchUrlContent(url);

            const result = await model.generateContent([
                SYSTEM_PROMPT,
                `Analyze this product page and provide environmental impact data:\n\n${pageContent}`
            ]);

            const data = parseGeminiResponse(result.response.text());
            if (!data) {
                throw new Error("Failed to parse AI response");
            }
            return NextResponse.json(data);
        }

        // === IMAGE ANALYSIS ===
        if (image) {
            console.log("Analyzing image...");

            // Extract base64 data
            let base64Data = image;
            let mimeType = "image/jpeg";

            if (image.includes("base64,")) {
                const parts = image.split("base64,");
                base64Data = parts[1];
                // Extract mime type from data URL
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
                "Identify this product in the image and analyze its environmental impact. Provide detailed eco data."
            ]);

            const data = parseGeminiResponse(result.response.text());
            if (!data) {
                throw new Error("Failed to parse AI response");
            }
            return NextResponse.json(data);
        }

        return NextResponse.json(
            { error: "No image, barcode, or URL provided" },
            { status: 400 }
        );

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({
            name: "Analysis Error",
            co2: 0,
            water: 0,
            bio: 50,
            alternatives: [],
            redFlags: [error.message || "Unknown error occurred"]
        }, { status: 500 });
    }
}
