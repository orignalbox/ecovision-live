import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini with the LATEST model: Gemini 3 Flash Preview
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// System prompt for environmental analysis
const SYSTEM_PROMPT = `You are an expert environmental analyst. Analyze the provided input and return ONLY valid JSON with this exact structure:
{
  "name": "Product Name",
  "co2": <number in kg>,
  "water": <number in liters>,
  "bio": <number 0-100, higher is better for environment>,
  "alternatives": [
    {"name": "Eco Alternative 1", "savings": "Benefit description"},
    {"name": "Eco Alternative 2", "savings": "Benefit description"}
  ],
  "redFlags": ["Issue 1", "Issue 2"]
}

Be accurate and helpful. Estimate values if not precisely known based on product category.`;

// Helper to safely parse Gemini response
function parseGeminiResponse(text: string) {
    try {
        // Remove markdown code blocks if present
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON Parse Error:", error);
        return {
            name: "Parse Error",
            co2: 0,
            water: 0,
            bio: 50,
            alternatives: [],
            redFlags: ["Could not parse AI response"]
        };
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
                    { name: "Set GEMINI_API_KEY in Vercel", savings: "Enable real analysis" }
                ],
                redFlags: ["API Key not configured"]
            });
        }

        // === BARCODE ANALYSIS ===
        if (barcode) {
            console.log("Analyzing barcode:", barcode);

            // Lookup product name from OpenFoodFacts
            let productName = "Unknown Product";
            try {
                const offResponse = await fetch(
                    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
                );
                const offData = await offResponse.json();
                if (offData.status === 1 && offData.product?.product_name) {
                    productName = offData.product.product_name;
                }
            } catch (e) {
                console.warn("OpenFoodFacts lookup failed:", e);
            }

            // Ask Gemini to analyze
            const result = await model.generateContent([
                SYSTEM_PROMPT,
                `Analyze this product: "${productName}" (barcode: ${barcode}). Provide environmental impact data.`
            ]);

            const responseText = result.response.text();
            const data = parseGeminiResponse(responseText);
            return NextResponse.json({ ...data, name: productName || data.name });
        }

        // === URL ANALYSIS ===
        if (url) {
            console.log("Analyzing URL:", url);

            const result = await model.generateContent([
                SYSTEM_PROMPT,
                `Analyze the product from this URL: "${url}". Infer the product type and provide environmental impact data.`
            ]);

            const responseText = result.response.text();
            return NextResponse.json(parseGeminiResponse(responseText));
        }

        // === IMAGE ANALYSIS ===
        if (image) {
            console.log("Analyzing image...");

            // Extract base64 data (handle both raw and data URL formats)
            let base64Data = image;
            if (image.includes("base64,")) {
                base64Data = image.split("base64,")[1];
            }

            const result = await model.generateContent([
                SYSTEM_PROMPT,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/jpeg"
                    }
                },
                "Identify this product and analyze its environmental impact."
            ]);

            const responseText = result.response.text();
            return NextResponse.json(parseGeminiResponse(responseText));
        }

        // No valid input
        return NextResponse.json(
            { error: "No image, barcode, or URL provided" },
            { status: 400 }
        );

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({
            name: "Analysis Error",
            co2: 0,
            water: 0,
            bio: 0,
            alternatives: [],
            redFlags: [error.message || "API Error"]
        }, { status: 500 });
    }
}
