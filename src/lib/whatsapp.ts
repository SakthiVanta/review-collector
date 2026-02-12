const WHATSAPP_API_URL = "https://graph.facebook.com/v17.0";

interface WhatsAppMessagePayload {
    messaging_product: "whatsapp";
    to: string;
    type: "template";
    template: {
        name: string;
        language: {
            code: string;
        };
        components?: any[];
    };
}

export async function sendWhatsAppReviewLink(
    phoneNumber: string,
    customerName: string,
    reviewText: string,
    shopName?: string,
    productName?: string
) {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "review_request";

    if (!token || !phoneId) {
        console.warn("WhatsApp credentials missing. Skipping message send.");
        console.warn("Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in your .env file");
        return { 
            success: false, 
            error: "Missing credentials",
            message: "WhatsApp is not configured. Please add your credentials to .env file."
        };
    }

    // Create a personalized message
    const personalizedReview = shopName 
        ? `Hi ${customerName}! Thank you for choosing ${shopName}. ${reviewText}`
        : reviewText;
    
    const deepLink = `https://wa.me/?text=${encodeURIComponent(personalizedReview)}`;

    const payload: WhatsAppMessagePayload = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
            name: templateName,
            language: { code: "en_US" },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: customerName,
                        },
                        {
                            type: "text",
                            text: shopName || "our shop",
                        },
                        {
                            type: "text",
                            text: productName || "your purchase",
                        },
                        {
                            type: "text",
                            text: deepLink,
                        },
                    ],
                },
            ],
        },
    };

    try {
        const res = await fetch(`${WHATSAPP_API_URL}/${phoneId}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("WhatsApp API Error:", errorData);
            return { 
                success: false, 
                error: "WhatsApp API connection failed",
                details: errorData
            };
        }

        const data = await res.json();
        return { 
            success: true, 
            messageId: data.messages?.[0]?.id,
            message: "WhatsApp message sent successfully!"
        };
    } catch (error) {
        console.error("Send WhatsApp Error:", error);
        return { 
            success: false, 
            error: "Network error",
            message: "Failed to send WhatsApp message. Please check your internet connection."
        };
    }
}