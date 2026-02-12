# WhatsApp Integration Guide

This application supports **two WhatsApp integration methods**:
1. **WhatsApp Cloud API** (Meta/Facebook) - Primary
2. **Twilio WhatsApp API** - Alternative/Fallback

---

## Option 1: WhatsApp Cloud API (Recommended)

### Setup Steps

1. **Create Meta Developer Account**
   - Go to https://developers.facebook.com/
   - Sign up with your Facebook account

2. **Create WhatsApp App**
   - Go to https://developers.facebook.com/apps
   - Click "Create App" → Select "Business" type
   - Add "WhatsApp" product to your app

3. **Get Credentials**
   - **Phone Number ID**: Found in WhatsApp → API Setup
   - **Access Token**: Generate from System Users with `whatsapp_business_messaging` permission
   - **Template Name**: Create in Meta Business Manager

4. **Update .env**
```env
WHATSAPP_ACCESS_TOKEN="your_token_here"
WHATSAPP_PHONE_NUMBER_ID="your_phone_id_here"
WHATSAPP_TEMPLATE_NAME="review_request"
```

### Pros
- Direct Meta integration
- Lower cost ($0.005-0.08 per message)
- First 1,000 conversations/month FREE

### Cons
- Complex setup process
- Template approval required (24-48 hours)
- Business verification needed for production

---

## Option 2: Twilio WhatsApp API (Alternative)

### Setup Steps

1. **Create Twilio Account**
   - Sign up at https://www.twilio.com/try-twilio
   - Verify your email and phone number

2. **Get Credentials**
   - **Account SID**: Found in Twilio Console dashboard
   - **Auth Token**: Found in Twilio Console dashboard
   - **WhatsApp Number**: Use sandbox (+14155238886) or buy a number

3. **Join Sandbox** (for testing)
   - Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Send message "join <your-code>" to +14155238886 from your WhatsApp
   - Example: "join caught-neither"

4. **Update .env**
```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_NUMBER="+14155238886" # Sandbox number
```

### Pros
- Easier setup process
- No template approval needed for basic messages
- Better documentation and support
- Works with sandbox for quick testing

### Cons
- Higher cost ($0.005-0.09 per message)
- Requires joining sandbox per phone number
- Rate limits on free tier

---

## Comparison

| Feature | WhatsApp Cloud API | Twilio WhatsApp |
|---------|-------------------|-----------------|
| Setup Difficulty | Hard | Easy |
| Cost | Lower | Higher |
| Template Approval | Required | Not required |
| Sandbox Available | No | Yes |
| Business Verification | Required for production | Not required |
| First 1000 msgs | FREE | FREE |
| Message Rate Limits | Higher | Lower |

---

## Usage

The application will automatically try WhatsApp Cloud API first. If you want to use Twilio instead, you can modify the API route to call the Twilio function.

### To use Twilio in your code:

```typescript
import { sendWhatsAppViaTwilio } from '@/lib/twilio-whatsapp';

// Send message
const result = await sendWhatsAppViaTwilio(
  "+1234567890",     // Customer phone
  "John Doe",        // Customer name
  "Great service!",  // Review text
  "SKS Jewellery",   // Shop name
  "Gold Ring"        // Product name
);

if (result.success) {
  console.log("Message sent! ID:", result.messageId);
} else {
  console.error("Failed:", result.error);
}
```

### Check Twilio Status:

```typescript
import { checkTwilioSandboxStatus } from '@/lib/twilio-whatsapp';

const status = checkTwilioSandboxStatus();
console.log(status.configured); // true or false
console.log(status.message);    // Status message
```

---

## Environment Variables Summary

```env
# Choose ONE option:

# Option 1: WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_TEMPLATE_NAME="review_request"

# Option 2: Twilio WhatsApp
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_NUMBER="+14155238886"
```

---

## Testing

### Test WhatsApp Cloud API:
1. Add credentials
2. Send test request
3. Check if message received

### Test Twilio WhatsApp:
1. Join sandbox (send "join <code>" to +14155238886)
2. Add Twilio credentials
3. Send test request
4. Check if message received

---

## Troubleshooting

### WhatsApp Cloud API Issues:
- **"Missing credentials"**: Check .env file
- **"Template not found"**: Template must be approved
- **"Invalid phone number"**: Must include country code (+1, +91, etc.)

### Twilio Issues:
- **"Authentication failed"**: Check Account SID and Auth Token
- **"Not a valid 'To' number"**: Phone must include country code
- **"Sandbox not joined"**: Send join message to +14155238886 first

---

## Recommendation

**For Quick Testing**: Use Twilio Sandbox (free, fast setup)
**For Production**: Use WhatsApp Cloud API (lower cost, better limits)

Both can coexist - the app will fallback gracefully if one fails.