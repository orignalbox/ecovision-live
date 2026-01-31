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

            // B. Ask AI for Impact & Swaps based on Name
            const result = await modelText.generateContent([
                SYSTEM_PROMPT,
                `Analyze this product identified by barcode: "${productName}".`
            ]);
            const response = await result.response;
            const json = JSON.parse(response.text().replace(/```json|```/g, '').trim());
            return NextResponse.json({ ...json, name: productName });
        }

        // 3. URL FLOW (Text Analysis)
        if (url) {
            const result = await modelText.generateContent([
                SYSTEM_PROMPT,
                `Analyze this e-commerce URL: "${url}". Infer the product and its impact.`
            ]);
            const text = await result.response.text();
            const json = JSON.parse(text.replace(/```json|```/g, '').trim());
            return NextResponse.json(json);
        }

        // 4. IMAGE FLOW (Vision)
        if (image) {
            const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
            const base64Data = image.split(',')[1] || image;
            const result = await model.generateContent([
                SYSTEM_PROMPT,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/jpeg",
                    },
                },
            ]);
            const text = await result.response.text();
            const json = JSON.parse(text.replace(/```json|```/g, '').trim());
            return NextResponse.json(json);
        }

        return NextResponse.json({ error: "Invalid Input" }, { status: 400 });
    } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
    }
}
