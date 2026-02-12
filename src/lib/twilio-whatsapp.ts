import twilio from 'twilio';

/**
 * Twilio WhatsApp Integration
 * Alternative to WhatsApp Cloud API
 * 
 * Setup Requirements:
 * 1. Create Twilio account at https://www.twilio.com/try-twilio
 * 2. Get Account SID and Auth Token from Twilio Console
 * 3. Get a WhatsApp-enabled phone number or use Sandbox
 * 4. For Sandbox: Join by sending "join <your-sandbox-code>" to +14155238886
 * 
 * Environment Variables:
 * TWILIO_ACCOUNT_SID=your_account_sid
 * TWILIO_AUTH_TOKEN=your_auth_token
 * TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number (e.g., +14155238886 for sandbox)
 */

interface TwilioWhatsAppResult {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
  details?: any;
}

/**
 * Send WhatsApp message via Twilio
 * @param phoneNumber - Customer phone number (e.g., +1234567890)
 * @param customerName - Customer name
 * @param reviewText - The review message
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
  // Check credentials
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio credentials missing. Skipping message send.");
    console.warn("Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER");
    return {
      success: false,
      error: "Missing Twilio credentials",
      message: "Twilio is not configured. Please add credentials to .env file."
    };
  }

  // Format phone number with whatsapp: prefix
  const toNumber = phoneNumber.startsWith('whatsapp:') 
    ? phoneNumber 
    : `whatsapp:${phoneNumber}`;
  
  const fromWhatsAppNumber = fromNumber.startsWith('whatsapp:')
    ? fromNumber
    : `whatsapp:${fromNumber}`;

  // Create personalized message
  const businessName = shopName || "our business";
  const itemName = productName || "your purchase";
  
  const messageBody = `Hi ${customerName}! 👋\n\nThank you for choosing ${businessName} for ${itemName}.\n\n${reviewText}\n\nTap here to complete your review:\nhttps://wa.me/?text=${encodeURIComponent(reviewText)}\n\nThank you for your feedback! 🙏`;

  try {
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: messageBody,
      from: fromWhatsAppNumber,
      to: toNumber,
    });

    console.log("Twilio WhatsApp message sent:", message.sid);
    
    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error("Twilio WhatsApp Error:", error);
    
    return {
      success: false,
      error: error.message || "Failed to send WhatsApp message",
      details: error.code ? { code: error.code, status: error.status } : undefined,
    };
  }
}

/**
 * Send WhatsApp template message via Twilio
 * For approved templates only
 */
export async function sendWhatsAppTemplateViaTwilio(
  phoneNumber: string,
  templateName: string,
  parameters: Record<string, string>
): Promise<TwilioWhatsAppResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return {
      success: false,
      error: "Missing Twilio credentials",
    };
  }

  const toNumber = phoneNumber.startsWith('whatsapp:') 
    ? phoneNumber 
    : `whatsapp:${phoneNumber}`;
  
  const fromWhatsAppNumber = fromNumber.startsWith('whatsapp:')
    ? fromNumber
    : `whatsapp:${fromNumber}`;

  try {
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      contentSid: templateName, // For approved templates
      from: fromWhatsAppNumber,
      to: toNumber,
      contentVariables: JSON.stringify(parameters),
    });

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error("Twilio Template Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check Twilio WhatsApp sandbox status
 */
export function checkTwilioSandboxStatus(): {
  configured: boolean;
  message: string;
  instructions?: string[];
} {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken) {
    return {
      configured: false,
      message: "Twilio credentials not configured",
      instructions: [
        "1. Sign up at https://www.twilio.com/try-twilio",
        "2. Get Account SID and Auth Token from Console",
        "3. Add them to your .env file",
      ],
    };
  }

  if (!fromNumber) {
    return {
      configured: false,
      message: "Twilio WhatsApp number not configured",
      instructions: [
        "1. Go to Twilio Console > Messaging > Try it out > Send a WhatsApp message",
        "2. Join the sandbox by sending 'join <code>' to +14155238886",
        "3. Add TWILIO_WHATSAPP_NUMBER=+14155238886 to .env",
      ],
    };
  }

  return {
    configured: true,
    message: "Twilio WhatsApp is configured",
  };
}

export default {
  sendWhatsAppViaTwilio,
  sendWhatsAppTemplateViaTwilio,
  checkTwilioSandboxStatus,
};