import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendWhatsAppReviewLink } from "@/lib/whatsapp";

const reviewSchema = z.object({
    shopName: z.string().min(2),
    shopEmail: z.string().email(),
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    phoneNumber: z.string().min(10),
    productName: z.string().min(2),
    rating: z.string(),
    reviewText: z.string().min(20),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = reviewSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { 
            shopName, 
            shopEmail, 
            customerName, 
            customerEmail, 
            phoneNumber, 
            productName, 
            rating, 
            reviewText 
        } = result.data;

        // Store in DB
        let review;
        try {
            review = await prisma.customerReview.create({
                data: {
                    shopName,
                    shopEmail,
                    customerName,
                    customerEmail,
                    phoneNumber,
                    productName,
                    rating: parseInt(rating),
                    reviewText,
                    status: "PENDING",
                },
            });
        } catch (dbError) {
            console.error("Database Error:", dbError);
            return NextResponse.json({ error: "Database storage failed" }, { status: 500 });
        }

        // Send WhatsApp Message
        const whatsappResult = await sendWhatsAppReviewLink(
            phoneNumber, 
            customerName, 
            reviewText,
            shopName,
            productName
        );

        if (!whatsappResult.success && whatsappResult.error !== "Missing credentials") {
            console.error("Failed to send WhatsApp message");
        }

        return NextResponse.json({ 
            success: true, 
            reviewId: review.id, 
            whatsapp: whatsappResult 
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}