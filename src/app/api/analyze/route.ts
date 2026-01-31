
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { image, barcode } = await req.json();

        if (!process.env.GEMINI_API_KEY && !barcode) {
            console.warn("GEMINI_API_KEY not set and no barcode provided, using mock data");
            // Mock Response for Demo/Fallback
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

        // HANDLER FOR BARCODE
        if (barcode) {
            try {
                // OpenFoodFacts Fetch
                const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
                const offData = await offRes.json();

                if (offData.status === 1) {
                    const product = offData.product;
                    // Extract basic info
                    // If we had a real Impact DB, we'd use it here.
                    // For now, return mock/estimated data based on categories
                    const name = product.product_name || "Unknown Product";
                    const categories = product.categories || "";

                    // Simple keyword heuristic for demo
                    let co2 = 2.5;
                    let water = 50;
                    if (categories.includes('Meat')) { co2 = 15; water = 800; }
                    if (categories.includes('Vegetable')) { co2 = 0.5; water = 20; }
                    if (categories.includes('Plastic')) { co2 += 5; }

                    return NextResponse.json({
                        name,
                        co2,
                        water,
                        bio: 80, // Mock score
                        alternatives: [
                            { name: "Generic Alternative", savings: "See Dashboard" }
                        ]
                    });
                }
            } catch (e) {
                console.error("Barcode lookup failed", e);
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
