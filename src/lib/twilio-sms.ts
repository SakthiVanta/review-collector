import twilio from 'twilio';
import { createShortLink, getShortUrl } from './short-links';

/**
 * Twilio SMS Integration - Single Segment GSM-7
 * 
 * Sends SMS with SHORT LINK only (under 160 chars for single-segment SMS)
 * Flow: SMS -> Short Link -> WhatsApp -> Review Page
 * 
 * CONSTRAINTS:
 * - Must be GSM-7 compatible (no emojis, curly quotes, special chars)
 * - Must stay under 160 characters for single-segment SMS
 * - Sends ONLY short link (NOT full review text)
 * - Review text is 500+ chars and stored in DB
 * 
 * GSM-7 CHARACTER SET:
 * - Standard alphanumeric characters
 * - Straight quotes only: " ' (NOT curly " ')
 * - Basic punctuation: !"#$%&'()*+,-./:;<=>?@
 * - NO emojis, NO non-Latin characters
 * 
 * Setup Requirements:
 * 1. Create Twilio account at https://www.twilio.com/try-twilio
 * 2. Get Account SID and Auth Token from Twilio Console
 * 3. Get a Twilio phone number with SMS capability
 * 4. Add credentials to .env file
 * 
 * Environment Variables:
 * TWILIO_ACCOUNT_SID=your_account_sid
 * TWILIO_AUTH_TOKEN=your_auth_token
 * TWILIO_SMS_NUMBER=your_twilio_sms_number (e.g., +1234567890)
 * APP_URL=http://localhost:3000
 */

interface TwilioSMSResult {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
  details?: any;
  segments?: number;
}

/**
 * Check if a character is a GSM-7 character
 * GSM-7 includes: A-Z, a-z, 0-9, and specific special characters
 * Excludes: emoji, curly quotes, many special symbols
 */
function isGSM7Character(char: string): boolean {
  // GSM-7 character set (7-bit encoding)
  const gsm7Chars = new Set(
    '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1bÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?' +
    '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'
  );
  return char.length === 1 && gsm7Chars.has(char);
}

/**
 * Detect if message requires UCS-2 encoding
 * UCS-2 is required for: emoji, curly quotes, non-Latin scripts, special symbols
 * One UCS-2 char forces entire message to 70-char limit
 */
function requiresUCS2(message: string): boolean {
  for (const char of message) {
    if (!isGSM7Character(char)) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate SMS segments needed for a message
 * GSM-7: 160/single, 153/segment
 * UCS-2: 70/single, 67/segment
 */
function calculateSegments(message: string): { segments: number; encoding: 'GSM-7' | 'UCS-2' } {
  const charCount = message.length;
  const isUCS2 = requiresUCS2(message);
  
  if (isUCS2) {
    // UCS-2 encoding: 70 chars single, 67 chars per segment
    const segments = charCount <= 70 ? 1 : Math.ceil(charCount / 67);
    return { segments, encoding: 'UCS-2' };
  } else {
    // GSM-7 encoding: 160 chars single, 153 chars per segment
    const segments = charCount <= 160 ? 1 : Math.ceil(charCount / 153);
    return { segments, encoding: 'GSM-7' };
  }
}

/**
 * Apply "Smart Encoding" - replace non-GSM chars with GSM equivalents
 * This helps avoid UCS-2 encoding and reduces message segments
 * Examples: curly quotes -> straight quotes, em-dash -> hyphen
 */
function applySmartEncoding(message: string): string {
  return message
    // Curly quotes to straight quotes
    .replace(/[\u201C\u201D]/g, '"')  // " " -> "
    .replace(/[\u2018\u2019]/g, "'")  // ' ' -> '
    // Em/en dash to hyphen
    .replace(/[\u2013\u2014]/g, '-')   // – — -> -
    // Ellipsis to three dots
    .replace(/\u2026/g, '...')         // … -> ...
    // Remove emoji (common UCS-2 characters)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Smart apostrophe
    .replace(/[\u2019]/g, "'")
    // Bullet to hyphen
    .replace(/[\u2022\u2023]/g, '-')
    // Remove other common non-GSM chars
    .replace(/[\u00A0]/g, ' ')         // Non-breaking space to space
    .trim();
}

/**
 * Truncate message to fit within recommended length (320 chars)
 * Preserves the link at the end if present
 */
function truncateMessage(message: string, maxLength: number = 320): string {
  if (message.length <= maxLength) return message;
  
  // Try to find and preserve URL if present
  const urlMatch = message.match(/(https?:\/\/[^\s]+)$/);
  if (urlMatch) {
    const url = urlMatch[1];
    const remainingLength = maxLength - url.length - 5; // 5 for "... \n"
    const truncated = message.substring(0, remainingLength).trim();
    return truncated + "...\n" + url;
  }
  
  return message.substring(0, maxLength - 3).trim() + "...";
}

/**
 * Generate a short link for WhatsApp redirection
 * Stores review text in database with 6-char code
 * Returns ultra-short URL like: yourdomain.com/r/abc123
 * 
 * @param reviewText - The review message to store
 * @param customerName - Customer name for the link record
 * @param shopName - Shop name (optional)
 * @param productName - Product name (optional)
 * @returns Short link URL (e.g., http://localhost:3000/r/a3f9k2)
 */
async function generateShortWhatsAppLink(
  reviewText: string,
  customerName: string,
  shopName?: string,
  productName?: string
): Promise<string> {
  try {
    // Create short link in database (6-char code)
    const shortCode = await createShortLink(
      reviewText,
      customerName,
      shopName,
      productName,
      168 // Expires in 7 days
    );
    
    // Generate full short URL
    return getShortUrl(shortCode);
  } catch (error) {
    console.error('Failed to create short link:', error);
    // Fallback to direct WhatsApp link if DB fails
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/api/wa-redirect?text=${encodeURIComponent(reviewText)}`;
  }
}

/**
 * Send SMS with WhatsApp deep link via Twilio
 * 
 * IMPORTANT SMS LIMITS:
 * - GSM-7: 160 chars (single), 153 chars/segment (multi), max 1,600
 * - UCS-2 (emoji/non-Latin): 70 chars (single), 67 chars/segment (multi), max 700
 * - Recommended: Keep under 320 chars for best deliverability
 * 
 * This function applies smart encoding to minimize segments and costs.
 * 
 * @param phoneNumber - Customer phone number (e.g., +1234567890)
 * @param customerName - Customer name
 * @param reviewText - The review message
 * @param shopName - Business name (optional)
 * @param productName - Product name (optional)
 */
export async function sendSMSViaTwilio(
  phoneNumber: string,
  customerName: string,
  reviewText: string,
  shopName?: string,
  productName?: string
): Promise<TwilioSMSResult> {
  // DEBUG: Log all environment variables
  console.log("=== TWILIO SMS DEBUG ===");
  console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? `Found (${process.env.TWILIO_ACCOUNT_SID.length} chars)` : "NOT FOUND");
  console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? `Found (${process.env.TWILIO_AUTH_TOKEN.length} chars)` : "NOT FOUND");
  console.log("TWILIO_SMS_NUMBER:", process.env.TWILIO_SMS_NUMBER || "NOT FOUND");
  console.log("APP_URL:", process.env.APP_URL || "NOT FOUND");

  // Check credentials
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_SMS_NUMBER;
  const appUrl = process.env.APP_URL;

  // DEBUG: Log credential details
  console.log("Parsed Account SID:", accountSid ? `${accountSid.substring(0, 10)}... (${accountSid.length} chars)` : "undefined");
  console.log("Parsed Auth Token:", authToken ? `${authToken.substring(0, 5)}... (${authToken.length} chars)` : "undefined");
  console.log("Parsed From Number:", fromNumber || "undefined");

  if (!accountSid || !authToken) {
    console.error("[TWILIO SMS ERROR] Missing credentials");
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
    console.error("[TWILIO SMS ERROR] Invalid Account SID format. Must start with 'AC'");
    console.error("Current value starts with:", accountSid.substring(0, 5));
    return {
      success: false,
      error: "Invalid Account SID format",
      message: "Account SID must start with 'AC'"
    };
  }

  if (!fromNumber) {
    console.error("[TWILIO SMS ERROR] Missing SMS number");
    return {
      success: false,
      error: "Missing Twilio SMS number",
      message: "TWILIO_SMS_NUMBER is not configured. Please add it to .env file."
    };
  }

  if (!appUrl) {
    console.warn("APP_URL not configured. Using default localhost:3000");
  }

  // Format phone number (ensure it has country code, no whatsapp: prefix for SMS)
  const toNumber = phoneNumber.replace(/^whatsapp:/, '');
  
  // DEBUG: Log phone details
  console.log("From Number:", fromNumber);
  console.log("To Number:", toNumber);
  console.log("Customer:", customerName);
  console.log("Shop:", shopName);
  
  // Create personalized message (using short, GSM-7 compatible text)
  const businessName = shopName || "our business";
  
  // Generate SHORT LINK (6-char code) that stores review in database
  // This keeps SMS very short regardless of review length
  const shortLink = await generateShortWhatsAppLink(reviewText, customerName, shopName, productName);
  console.log("Generated short link:", shortLink);
  
  // Build message - NO EMOJIS, keep it under 160 chars for single-segment GSM-7 SMS
  // Template: Hi {name}, thanks for choosing {shop}. Please share your review: {link} Thank you!
  // Est max: 3 + 50 + 28 + 35 + 10 = ~126 chars (well under 160 limit)
  let messageBody = `Hi ${customerName}, thanks for choosing ${businessName}. Please share your review: ${shortLink} Thank you!`;

  // Apply smart encoding to replace non-GSM characters
  messageBody = applySmartEncoding(messageBody);
  
  // Truncate if over 320 chars (Twilio recommendation for best deliverability)
  messageBody = truncateMessage(messageBody, 320);
  
  // Calculate segments for logging/monitoring
  const { segments, encoding } = calculateSegments(messageBody);
  console.log(`SMS message length: ${messageBody.length} chars, Encoding: ${encoding}, Segments: ${segments}`);
  
  // Warn if using UCS-2 (reduces char limit to 70)
  if (encoding === 'UCS-2') {
    console.warn("WARNING: SMS contains non-GSM7 characters. Message limited to 70 chars. Segments:", segments);
  }

  try {
    console.log("[TWILIO SMS] Creating Twilio client...");
    const client = twilio(accountSid, authToken);
    console.log("[TWILIO SMS] Client created successfully");

    console.log("[TWILIO SMS] Sending message with params:", {
      from: fromNumber,
      to: toNumber,
      bodyLength: messageBody.length
    });

    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: toNumber,
      // Enable Twilio Smart Encoding to automatically replace non-GSM chars
      smartEncoded: true,
    });

    console.log("[TWILIO SMS SUCCESS] Message sent:", message.sid, "Segments:", message.numSegments);
    console.log("=== END TWILIO SMS DEBUG ===");
    
    return {
      success: true,
      messageId: message.sid,
      segments: parseInt(message.numSegments || '1', 10),
    };
  } catch (error: any) {
    console.error("=== TWILIO SMS ERROR ===");
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
    console.error("=== END TWILIO SMS ERROR ===");
    
    return {
      success: false,
      error: error.message || "Failed to send SMS message",
      details: error.code ? { code: error.code, status: error.status } : undefined,
    };
  }
}

/**
 * Send SMS with custom body via Twilio
 * Applies smart encoding and validates message length
 * 
 * @param phoneNumber - Customer phone number
 * @param body - Custom SMS body text
 * @param options - Optional settings
 */
export async function sendCustomSMSViaTwilio(
  phoneNumber: string,
  body: string,
  options?: {
    smartEncode?: boolean;  // Apply smart encoding (default: true)
    maxLength?: number;     // Max length before truncation (default: 320)
  }
): Promise<TwilioSMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_SMS_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return {
      success: false,
      error: "Missing Twilio credentials or SMS number",
    };
  }

  const toNumber = phoneNumber.replace(/^whatsapp:/, '');
  
  // Apply smart encoding by default
  let messageBody = body;
  if (options?.smartEncode !== false) {
    messageBody = applySmartEncoding(body);
  }
  
  // Truncate if needed
  const maxLength = options?.maxLength || 320;
  messageBody = truncateMessage(messageBody, maxLength);
  
  // Calculate segments
  const { segments, encoding } = calculateSegments(messageBody);
  console.log(`Custom SMS: ${messageBody.length} chars, ${encoding}, ${segments} segment(s)`);

  try {
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: toNumber,
      smartEncoded: options?.smartEncode !== false,
    });

    return {
      success: true,
      messageId: message.sid,
      segments: parseInt(message.numSegments || '1', 10),
    };
  } catch (error: any) {
    console.error("Twilio Custom SMS Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check Twilio SMS configuration status
 */
export function checkTwilioSMSStatus(): {
  configured: boolean;
  message: string;
  instructions?: string[];
  limits?: {
    gsm7: { single: number; segment: number; max: number };
    ucs2: { single: number; segment: number; max: number };
    recommended: number;
  };
} {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_SMS_NUMBER;
  const appUrl = process.env.APP_URL;

  const limits = {
    gsm7: { single: 160, segment: 153, max: 1600 },
    ucs2: { single: 70, segment: 67, max: 700 },
    recommended: 320,
  };

  if (!accountSid || !authToken) {
    return {
      configured: false,
      message: "Twilio credentials not configured",
      instructions: [
        "1. Sign up at https://www.twilio.com/try-twilio",
        "2. Get Account SID and Auth Token from Console",
        "3. Add them to your .env file",
      ],
      limits,
    };
  }

  if (!fromNumber) {
    return {
      configured: false,
      message: "Twilio SMS number not configured",
      instructions: [
        "1. Go to Twilio Console > Phone Numbers > Manage > Buy a number",
        "2. Purchase a phone number with SMS capability",
        "3. Add TWILIO_SMS_NUMBER=+1234567890 to .env",
      ],
      limits,
    };
  }

  if (!appUrl) {
    return {
      configured: true,
      message: "Twilio SMS configured (APP_URL not set, using default)",
      instructions: [
        "Optional: Add APP_URL=https://yourdomain.com to .env for production",
      ],
      limits,
    };
  }

  return {
    configured: true,
    message: "Twilio SMS is fully configured",
    limits,
  };
}

export default {
  sendSMSViaTwilio,
  sendCustomSMSViaTwilio,
  checkTwilioSMSStatus,
};