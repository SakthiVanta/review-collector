# WhatsApp Cloud API Configuration Guide

## Current Status
**WhatsApp is NOT configured** - The application cannot send WhatsApp messages until you complete the setup below.

## Prerequisites

To use WhatsApp Cloud API, you need:

1. **Meta Developer Account** (free)
2. **Facebook Business Account** (free)
3. **WhatsApp Business Account**
4. **Verified Business** (for production use)

## Step-by-Step Setup

### Step 1: Create a Meta Developer Account
1. Go to https://developers.facebook.com/
2. Click "Get Started" and create an account
3. Complete your profile

### Step 2: Create a WhatsApp App
1. Go to https://developers.facebook.com/apps/
2. Click "Create App"
3. Select "Business" as app type
4. Fill in app details
5. Add "WhatsApp" product to your app

### Step 3: Configure WhatsApp
1. In your app dashboard, go to "WhatsApp" → "API Setup"
2. You will see:
   - **Phone Number ID** (copy this for `.env`)
   - Test phone number (for testing)

### Step 4: Generate Access Token
1. Go to "System Users" in Business Settings
2. Create a system user with Admin role
3. Generate a token with `whatsapp_business_messaging` permission
4. **Copy this token** - it's your `WHATSAPP_ACCESS_TOKEN`

### Step 5: Create Message Template
1. Go to WhatsApp Business Manager: https://business.facebook.com/wa/manage/message-templates/
2. Click "Create Template"
3. Name it `review_request` (or update `WHATSAPP_TEMPLATE_NAME` in .env)
4. Template content example:
```
Hello {{1}}! Thank you for choosing {{2}} for {{3}}.

Please click the link below to complete your review:
{{4}}

Thank you for your feedback!
```
5. Submit for approval (takes 24-48 hours)

### Step 6: Update Environment Variables

Edit your `.env` file:

```env
# WhatsApp Cloud API Configuration
WHATSAPP_ACCESS_TOKEN="YOUR_PERMANENT_ACCESS_TOKEN_HERE"
WHATSAPP_PHONE_NUMBER_ID="YOUR_PHONE_NUMBER_ID_HERE"
WHATSAPP_TEMPLATE_NAME="review_request"
```

### Step 7: Verify Phone Number

For testing:
- You can only send to numbers registered in Meta Console
- Register your test numbers in the WhatsApp API Setup page

For production:
- You need a verified business
- Purchase a phone number or use your existing one
- Complete business verification in Meta Business Manager

## Testing Without WhatsApp

The application works without WhatsApp configuration:
- Reviews are stored in the database
- You can see them in your admin panel (if you build one)
- The form validates and saves all data

To test the full flow:
1. Complete the WhatsApp setup above
2. Use a test phone number registered in Meta Console
3. Submit a review request
4. Check if the WhatsApp message is received

## Troubleshooting

### "Missing credentials" error
- Check `.env` file has both `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`
- Restart your Next.js server after editing `.env`

### "Template not found" error
- Make sure your template name matches exactly (case-sensitive)
- Template must be approved by Meta
- Template variables must match what your code sends

### Phone number format issues
- Always include country code: `+1` for USA, `+44` for UK, `+91` for India
- Remove spaces and special characters
- Valid format: `+1234567890`

### Message not received
- Test number must be registered in Meta Console
- For non-test numbers, you need approved template
- Check Meta Console for delivery status
- Review error logs in your application

## Important Notes

1. **Free Tier Limits**: Meta provides 1,000 free conversations per month
2. **Template Required**: You cannot send free-form messages to customers who haven't messaged you first
3. **Approval Time**: Message templates take 24-48 hours for approval
4. **24-Hour Rule**: You can only send template messages to users who haven't interacted in 24+ hours

## Cost Information

- **First 1,000 conversations/month**: FREE
- **Additional conversations**: ~$0.005-0.08 per message (varies by country)
- No monthly subscription fees

## Support Resources

- WhatsApp Business API Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
- Meta Business Help: https://www.facebook.com/business/help
- Pricing: https://business.whatsapp.com/products/business-platform/pricing

## Next Steps

1. Complete the 7 steps above
2. Test with a registered test number
3. Verify templates work correctly
4. Consider building an admin dashboard to view collected reviews
5. Add email notifications when reviews are submitted

## Current Application Features

✅ Beautiful, responsive UI with gradient backgrounds
✅ Shop configuration fields (name, email)
✅ Customer information fields (name, email, phone)
✅ Product/Service details with ratings
✅ Rich review text with validation
✅ Database storage with Prisma + Neon PostgreSQL
✅ WhatsApp integration (requires configuration)
✅ Success/error handling with user feedback

## Need Help?

If you need assistance with WhatsApp setup:
1. Check Meta's official documentation
2. Review error messages in your application logs
3. Test each step incrementally
4. Ensure all credentials are correct and tokens haven't expired