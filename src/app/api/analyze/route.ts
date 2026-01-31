import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using Gemini 1.5 Pro for "Perfect" reasoning and vision quality as requested
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Prompt Helper
const SYSTEM_PROMPT = `
You are an environmental impact expert. Analyze the input (Product Name, Image, or URL contents).
Return ONLY valid JSON with this structure:
{
  "name": "Exact Product Name",
  "co2": number (estimated kg CO2e footprint),
  "water": number (estimated Liters water usage),
  "bio": number (0-100 Biodiversity Safety Score, 100=Best),
  "alternatives": [
    { "name": "Specific Eco Brand/Product", "savings": "e.g. Save 12kg CO2" },
    { "name": "Generic Better Option", "savings": "e.g. Save 400L Water" }
  ],
  "redFlags": ["Microplastics", "Palm Oil", "Non-recyclable"] (list strings of negative traits if any)
}
Be precise. If data is unknown, estimate based on category (e.g., Beef = high CO2, T-Shirt = high Water).
`;

// Helper to clean Gemini JSON
function cleanGeminiJson(text: string): any {
    try {
        const cleaned = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", e, "Raw Text:", text);
        return { name: "Analysis Failed", error: "Could not parse AI response", alternatives: [], redFlags: [] };
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { image, barcode, url } = body;

        // 1. Validate API Key
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                name: "Demo Product (No API Key)",
                co2: 10, water: 200, bio: 50,
                alternatives: [{ name: "Set GEMINI_API_KEY", savings: "in Vercel" }],
                redFlags: ["Missing API Key"]
            });
        }

        // 2. Barcode Analysis (Text-Based)
        if (barcode) {
            const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
            const offData = await offRes.json();
            const productName = offData.status === 1 ? offData.product.product_name : "Unknown Product";

            const prompt = `Analyze this product: "${productName}". (Barcode: ${barcode}). Returns JSON with eco-impact.`;
            const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
            const json = cleanGeminiJson(result.response.text());
            return NextResponse.json({ ...json, name: productName });
        }

        // 3. URL Analysis (Text-Based)
        if (url) {
            const prompt = `Analyze this product URL: "${url}". Infer the product and impact. Returns JSON.`;
            const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
            return NextResponse.json(cleanGeminiJson(result.response.text()));
        }

        // 4. Image Analysis (Multimodal)
        if (image) {
            // Strict Base64 handling
            const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

            const result = await model.generateContent([
                SYSTEM_PROMPT,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/jpeg",
                    },
                },
                { text: "Identify this product and its environmental impact." }
            ]);
            return NextResponse.json(cleanGeminiJson(result.response.text()));
        }

        return NextResponse.json({ error: "No valid input provided" }, { status: 400 });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({
            name: "Error",
            co2: 0, water: 0, bio: 0,
            alternatives: [], redFlags: ["System Error"]
        }, { status: 500 });
    }
}
