import { NextResponse } from "next/server";
import { generateReview } from "@/lib/gemini";

// Kalyaa Jewellers Shop Locations
const SHOP_LOCATIONS = [
    { value: "mumbai_mg_road", label: "Mumbai - M.G. Road", address: "123 M.G. Road, Mumbai" },
    { value: "mumbai_bandra", label: "Mumbai - Bandra West", address: "45 Hill Road, Bandra, Mumbai" },
    { value: "mumbai_andheri", label: "Mumbai - Andheri East", address: "78 Andheri Kurla Road, Mumbai" },
    { value: "pune_fc_road", label: "Pune - F.C. Road", address: "256 F.C. Road, Pune" },
    { value: "pune_camp", label: "Pune - Camp", address: "89 M.G. Road, Camp, Pune" },
    { value: "delhi_karol_bagh", label: "Delhi - Karol Bagh", address: "45 Ajmal Khan Road, Karol Bagh, Delhi" },
    { value: "delhi_south_ext", label: "Delhi - South Extension", address: "12 South Extension Part I, Delhi" },
    { value: "bangalore_brigade", label: "Bangalore - Brigade Road", address: "78 Brigade Road, Bangalore" },
    { value: "bangalore_indiranagar", label: "Bangalore - Indiranagar", address: "34 100 Feet Road, Indiranagar, Bangalore" },
    { value: "hyderabad_banjara", label: "Hyderabad - Banjara Hills", address: "23 Road No. 1, Banjara Hills, Hyderabad" },
    { value: "chennai_t_nagar", label: "Chennai - T. Nagar", address: "67 North Usman Road, T. Nagar, Chennai" },
    { value: "kolkata_park_st", label: "Kolkata - Park Street", address: "15 Park Street, Kolkata" },
] as const;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        const {
            orgName,
            orgType,
            attenderName,
            shopLocation,
            orgDescription,
            customerName,
            customerPhone,
            purchaseType,
            purchaseFrequency,
            purchaseDuration,
            satisfactionLevel,
            keyHighlights,
            improvementAreas,
            recommendationLikelihood,
            shoppingMotivation,
            priceSensitivity,
            brandLoyalty,
            emotionalConnection,
        } = body;

        // Validate required fields
        if (!orgName || !orgType || !customerName || !purchaseType || !purchaseFrequency) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Convert shoppingMotivation array to string if needed
        const motivationStr = Array.isArray(shoppingMotivation) 
            ? shoppingMotivation.join(", ") 
            : shoppingMotivation;

        // Find the location label if shopLocation is provided
        const locationLabel = shopLocation ? 
            SHOP_LOCATIONS.find(loc => loc.value === shopLocation)?.label || shopLocation 
            : undefined;

        // Generate review using Gemini
        const result = await generateReview({
            orgName,
            orgType,
            attenderName,
            shopLocation: locationLabel,
            orgDescription,
            customerName,
            customerPhone,
            purchaseType,
            purchaseFrequency,
            purchaseDuration,
            satisfactionLevel: parseInt(satisfactionLevel) || 8,
            keyHighlights,
            improvementAreas,
            recommendationLikelihood: parseInt(recommendationLikelihood) || 9,
            shoppingMotivation: motivationStr,
            priceSensitivity,
            brandLoyalty,
            emotionalConnection,
        });

        if (!result.success || !result.review) {
            return NextResponse.json(
                { error: result.error || "Failed to generate review" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            review: result.review,
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
