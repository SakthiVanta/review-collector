import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendSMSViaTwilio } from "@/lib/twilio-sms";
import { sendWhatsAppViaTwilio } from "@/lib/twilio-whatsapp";

const reviewSchema = z.object({
    shopName: z.string().min(2),
    shopEmail: z.string().email(),
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    phoneNumber: z.string().min(10),
    productName: z.string().min(2),
    rating: z.string(),
    reviewText: z.string().min(20),
    sendSMS: z.boolean().default(false),
    sendWhatsApp: z.boolean().default(false),
}).refine((data) => data.sendSMS || data.sendWhatsApp, {
    message: "Select at least one notification method",
    path: ["sendWhatsApp"],
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
            reviewText,
            sendSMS,
            sendWhatsApp,
        } = result.data;

        // Validate at least one method is selected
        if (!sendSMS && !sendWhatsApp) {
            return NextResponse.json(
                { error: "Select at least one notification method (SMS or WhatsApp)" },
                { status: 400 }
            );
        }

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
                    sendSMS,
                    sendWhatsApp,
                    status: "PENDING",
                },
            });
        } catch (dbError) {
            console.error("Database Error:", dbError);
            return NextResponse.json({ error: "Database storage failed" }, { status: 500 });
        }

        // Send notifications based on selected methods
        const results: {
            sms?: { success: boolean; error?: string; messageId?: string };
            whatsapp?: { success: boolean; error?: string; messageId?: string };
        } = {};

        // Send SMS if selected
        if (sendSMS) {
            try {
                const smsResult = await sendSMSViaTwilio(
                    phoneNumber,
                    customerName,
                    reviewText,
                    shopName,
                    productName
                );
                results.sms = smsResult;
                console.log("SMS result:", smsResult);
            } catch (error) {
                console.error("SMS sending error:", error);
                results.sms = { success: false, error: "Failed to send SMS" };
            }
        }

        // Send WhatsApp if selected
        if (sendWhatsApp) {
            try {
                const whatsappResult = await sendWhatsAppViaTwilio(
                    phoneNumber,
                    customerName,
                    reviewText,
                    shopName,
                    productName
                );
                results.whatsapp = whatsappResult;
                console.log("WhatsApp result:", whatsappResult);
            } catch (error) {
                console.error("WhatsApp sending error:", error);
                results.whatsapp = { success: false, error: "Failed to send WhatsApp" };
            }
        }

        // Update status based on results
        const smsSuccess = results.sms?.success;
        const whatsappSuccess = results.whatsapp?.success;
        
        let finalStatus: "SENT" | "FAILED" | "PENDING" = "PENDING";
        if ((sendSMS && smsSuccess) || (sendWhatsApp && whatsappSuccess)) {
            finalStatus = "SENT";
        } else if ((sendSMS && !smsSuccess) && (sendWhatsApp && !whatsappSuccess)) {
            finalStatus = "FAILED";
        }

        // Update review status
        try {
            await prisma.customerReview.update({
                where: { id: review.id },
                data: { status: finalStatus },
            });
        } catch (updateError) {
            console.error("Failed to update review status:", updateError);
        }

        return NextResponse.json({
            success: true,
            reviewId: review.id,
            results,
            status: finalStatus,
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}