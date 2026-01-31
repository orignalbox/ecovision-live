import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const modelVision = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fast multimodal
const modelText = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  "redFlags": ["Microplastics", "Palm Oil", "Non-recyclable"] (optional list of negative traits)
}
Be precise. If data is unknown, estimate based on category (e.g., Beef = high CO2, T-Shirt = high Water).
`;

export async function POST(req: Request) {
    try {
        const { image, barcode, url } = await req.json();

        // 1. MOCK FALLBACK (If no API Key)
        if (!process.env.GEMINI_API_KEY) {
            console.warn("No API Key. Returning Demo Data.");
            return NextResponse.json({
                name: "Demo Product (Set API Key)",
                co2: 12.5,
                water: 450,
                bio: 60,
                alternatives: [
                    { name: "Bamboo Toothbrush", savings: "Plastic Free" },
                    { name: "Refillable Glass Jar", savings: "Zero Waste" }
                ],
                redFlags: ["Mock Data used - Setup Env Var"]
            });
        }

        // 2. BARCODE FLOW (Hybrid: OFF + AI)
        if (barcode) {
            // A. Fetch Identity
            const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
            const offData = await offRes.json();

            let productName = "Unknown Product";
            if (offData.status === 1) {
                productName = offData.product.product_name;
            }
        }

        // Fallback if barcode lookup failed or no barcode, and API key is missing
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY not set, using mock data (after barcode attempt)");
            // Mock Fallback (Duplicate for safety if code structure changes)
            return NextResponse.json({
                name: "Mock Product (No API Key)",
                co2: 5.5,
                water: 120,
                bio: 75,
                alternatives: [
                    { name: "Eco Alternative A", savings: "Save 300L Water" },
                    { name: "Eco Alternative B", savings: "Save 1.5kg CO2" }
                ]
            });
        }

        // Existing Image Logic
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        // Remove header from base64 if present
        const base64Data = image.split(',')[1] || image;

        const result = await model.generateContent([
            "Identify this product. Estimate its environmental impact (Carbon Footprint in kg, Water in L, Biodiversity Score 0-100). Suggest 2 eco-friendly alternatives. Return ONLY valid JSON in this format: { \"name\": \"Product Name\", \"co2\": number, \"water\": number, \"bio\": number, \"alternatives\": [{ \"name\": \"Alt Name\", \"savings\": \"Short impact string\" }] }",
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
    }
}
