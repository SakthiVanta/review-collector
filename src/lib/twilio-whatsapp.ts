import twilio from 'twilio';
import { createShortLink, getShortUrl } from './short-links';

/**
 * Twilio WhatsApp Integration - Sandbox Only
 * Uses WhatsApp Sandbox (whatsapp:+14155238886)
 * Sends dynamic messages via body (NOT templates)
 * 
 * Setup Requirements:
 * 1. Create Twilio account at https://www.twilio.com/try-twilio
 * 2. Get Account SID and Auth Token from Twilio Console
 * 3. Join Sandbox: Send "join <your-sandbox-code>" to +14155238886
 * 
 * Environment Variables:
 * TWILIO_ACCOUNT_SID=your_account_sid
 * TWILIO_AUTH_TOKEN=your_auth_token
 * TWILIO_WHATSAPP_NUMBER=+14155238886 (sandbox number)
 */

interface TwilioWhatsAppResult {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
  details?: any;
}

/**
 * Generate short link for WhatsApp review
 * Stores review text in database and returns short URL
 */
async function generateReviewShortLink(
  reviewText: string,
  customerName: string,
  shopName?: string,
  productName?: string
): Promise<string> {
  try {
    const shortCode = await createShortLink(
      reviewText,
      customerName,
      shopName,
      productName,
      168 // Expires in 7 days
    );
    return getShortUrl(shortCode);
  } catch (error) {
    console.error('Failed to create short link:', error);
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/api/wa-redirect?text=${encodeURIComponent(reviewText)}`;
  }
}

/**
 * Send WhatsApp message via Twilio Sandbox
 * Uses body only (NO templates, NO Content API)
 * Sends only short link (NOT full review text)
 * 
 * @param phoneNumber - Customer phone number (e.g., +1234567890)
 * @param customerName - Customer name
 * @param reviewText - The review message (stored in DB, not sent directly)
 * @param shopName - Business name (optional)
 * @param productName - Product name (optional)
 */
export async function sendWhatsAppViaTwilio(
  phoneNumber: string,
  customerName: string,
  reviewText: string,
  shopName?: string,
  productName?: string
): Promise<TwilioWhatsAppResult> {
  // DEBUG: Log all environment variables
  console.log("=== TWILIO WHATSAPP DEBUG ===");
  console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? `Found (${process.env.TWILIO_ACCOUNT_SID.length} chars)` : "NOT FOUND");
  console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? `Found (${process.env.TWILIO_AUTH_TOKEN.length} chars)` : "NOT FOUND");
  console.log("TWILIO_WHATSAPP_NUMBER:", process.env.TWILIO_WHATSAPP_NUMBER || "NOT FOUND (using default)");
  console.log("APP_URL:", process.env.APP_URL || "NOT FOUND");

  // Check credentials
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

  // DEBUG: Log credential details
  console.log("Parsed Account SID:", accountSid ? `${accountSid.substring(0, 10)}... (${accountSid.length} chars)` : "undefined");
  console.log("Parsed Auth Token:", authToken ? `${authToken.substring(0, 5)}... (${authToken.length} chars)` : "undefined");

  if (!accountSid || !authToken) {
    console.error("[TWILIO ERROR] Missing credentials");
    console.error("Account SID exists:", !!accountSid);
    console.error("Auth Token exists:", !!authToken);
    return {
      success: false,
      error: "Missing Twilio credentials",
      message: "Twilio is not configured. Please add credentials to .env file."
    };
  }

  // DEBUG: Validate Account SID format
  if (!accountSid.startsWith('AC')) {
    console.error("[TWILIO ERROR] Invalid Account SID format. Must start with 'AC'");
    console.error("Current value starts with:", accountSid.substring(0, 5));
    return {
      success: false,
      error: "Invalid Account SID format",
      message: "Account SID must start with 'AC'"
    };
  }

  // Format phone number with whatsapp: prefix
  const toNumber = phoneNumber.startsWith('whatsapp:') 
    ? phoneNumber 
    : `whatsapp:${phoneNumber}`;
  
  // ALWAYS use sandbox number for Twilio Trial
  const fromWhatsAppNumber = 'whatsapp:+14155238886';

  // DEBUG: Log message details
  console.log("From:", fromWhatsAppNumber);
  console.log("To:", toNumber);
  console.log("Customer:", customerName);
  console.log("Shop:", shopName);

  // Create personalized message components
  const businessName = shopName || "our business";
  const itemName = productName || "your purchase";
  
  // Generate short link (stores review in DB)
  const reviewLink = await generateReviewShortLink(reviewText, customerName, shopName, productName);
  console.log("Generated short link:", reviewLink);
  
  // Build message - NO emojis, professional tone
  // Sends ONLY the short link, NOT the full review text
  const messageBody = `Hi ${customerName},

Thank you for choosing ${businessName} for ${itemName}.

Please share your feedback here:
${reviewLink}

Your review helps us improve.
Thank you!`;

  try {
    console.log("[TWILIO] Creating Twilio client...");
    const client = twilio(accountSid, authToken);
    console.log("[TWILIO] Client created successfully");

    console.log("[TWILIO] Sending message with params:", {
      from: fromWhatsAppNumber,
      to: toNumber,
      bodyLength: messageBody.length
    });

    const message = await client.messages.create({
      body: messageBody,
      from: fromWhatsAppNumber,
      to: toNumber,
    });

    console.log("[TWILIO SUCCESS] Message sent:", message.sid);
    console.log("=== END TWILIO WHATSAPP DEBUG ===");
    
    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error("=== TWILIO WHATSAPP ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error status:", error.status);
    console.error("Error stack:", error.stack);
    
    if (error.code === 20003) {
      console.error("[AUTH ERROR] Authentication failed. Possible causes:");
      console.error("1. Invalid Account SID (should start with 'AC' and be 34 chars)");
      console.error("2. Invalid Auth Token (should be 32 chars)");
      console.error("3. Account SID and Auth Token don't match");
      console.error("Current Account SID length:", accountSid.length);
      console.error("Current Auth Token length:", authToken.length);
    }
    console.error("=== END TWILIO WHATSAPP ERROR ===");
    
    return {
      success: false,
      error: error.message || "Failed to send WhatsApp message",
      details: error.code ? { code: error.code, status: error.status } : undefined,
    };
  }
}

/**
 * Send WhatsApp message with custom body via Twilio Sandbox
 * Alternative to the main function for fully custom messages
 * 
 * NOTE: This uses body parameter (NOT Content API templates)
 * Compatible with Twilio Trial/Sandbox only
 */
export async function sendCustomWhatsAppViaTwilio(
  phoneNumber: string,
  body: string
): Promise<TwilioWhatsAppResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return {
      success: false,
      error: "Missing Twilio credentials",
    };
  }

  const toNumber = phoneNumber.startsWith('whatsapp:') 
    ? phoneNumber 
    : `whatsapp:${phoneNumber}`;
  
  // ALWAYS use sandbox number for Twilio Trial
  const fromWhatsAppNumber = 'whatsapp:+14155238886';

  try {
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: body,
      from: fromWhatsAppNumber,
      to: toNumber,
    });

    console.log("Twilio custom WhatsApp message sent:", message.sid);
    
    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error("Twilio Custom WhatsApp Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check Twilio WhatsApp sandbox status
 * For Twilio Trial/Sandbox mode only
 */
export function checkTwilioSandboxStatus(): {
  configured: boolean;
  message: string;
  instructions?: string[];
  sandboxNumber: string;
} {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const sandboxNumber = '+14155238886';

  if (!accountSid || !authToken) {
    return {
      configured: false,
      message: "Twilio credentials not configured",
      sandboxNumber,
      instructions: [
        "1. Sign up at https://www.twilio.com/try-twilio",
        "2. Get Account SID and Auth Token from Console",
        "3. Add them to your .env file",
      ],
    };
  }

  return {
    configured: true,
    message: "Twilio WhatsApp Sandbox is configured (using +14155238886)",
    sandboxNumber,
    instructions: [
      "1. Send 'join <your-code>' to +14155238886 from your WhatsApp",
      "2. Your sandbox code is in Twilio Console > Messaging > Try it out",
    ],
  };
}

export default {
  sendWhatsAppViaTwilio,
  sendCustomWhatsAppViaTwilio,
  checkTwilioSandboxStatus,
};