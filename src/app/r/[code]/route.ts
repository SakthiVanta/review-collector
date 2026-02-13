import { NextRequest, NextResponse } from 'next/server';
import { getReviewByShortCode } from '@/lib/short-links';

/**
 * Short URL Redirect Handler
 * 
 * Handles short URLs like /r/abc123
 * Looks up the review text from database and redirects to WhatsApp
 * 
 * Flow: SMS/WhatsApp Short Link -> This Route -> WhatsApp Deep Link
 * 
 * If BUSINESS_WHATSAPP_NUMBER is configured, redirects to specific chat:
 * Example: /r/a3f9k2 -> https://wa.me/+919876543210?text=Full%20Review%20Text
 * 
 * If not configured, redirects to generic WhatsApp:
 * Example: /r/a3f9k2 -> https://wa.me/?text=Full%20Review%20Text
 * 
 * Environment Variable:
 * BUSINESS_WHATSAPP_NUMBER=+919876543210 (your business WhatsApp number)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  console.log('=== SHORT LINK REDIRECT ===');
  console.log('Request URL:', request.url);
  
  try {
    const { code } = await params;
    console.log('Short code:', code);

    if (!code || code.length < 4) {
      console.log('Invalid short code length');
      return NextResponse.json(
        { error: 'Invalid short code' },
        { status: 400 }
      );
    }

    // Lookup the review text by short code
    console.log('Looking up short code in database...');
    const reviewData = await getReviewByShortCode(code);
    console.log('Review data found:', !!reviewData);

    if (!reviewData) {
      console.log('Short code not found or expired:', code);
      return NextResponse.json(
        { error: 'Link not found or expired' },
        { status: 404 }
      );
    }

    console.log('Customer:', reviewData.customerName);
    console.log('Shop:', reviewData.shopName);
    console.log('Review text length:', reviewData.reviewText.length);

    // Get business WhatsApp number from env
    const businessWhatsAppNumber = process.env.BUSINESS_WHATSAPP_NUMBER;
    console.log('Business WhatsApp Number:', businessWhatsAppNumber || 'NOT CONFIGURED');

    // Build the WhatsApp deep link with the full review text
    const encodedText = encodeURIComponent(reviewData.reviewText);
    
    // If business number is configured, use it in the deep link
    // Format: https://wa.me/{phone_number}?text={message}
    let whatsAppUrl: string;
    if (businessWhatsAppNumber) {
      // Remove any non-numeric characters from phone number (except +)
      const cleanNumber = businessWhatsAppNumber.replace(/[^\d+]/g, '');
      whatsAppUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;
      console.log('Using business number in deep link:', cleanNumber);
    } else {
      // Fallback to generic WhatsApp link (opens WhatsApp without specific chat)
      whatsAppUrl = `https://wa.me/?text=${encodedText}`;
      console.log('Warning: BUSINESS_WHATSAPP_NUMBER not configured, using generic link');
    }
    
    console.log('Redirecting to WhatsApp:', whatsAppUrl.substring(0, 100) + '...');
    console.log('=== END SHORT LINK REDIRECT ===');
    
    // Redirect to WhatsApp
    return NextResponse.redirect(whatsAppUrl, 302);
    
  } catch (error) {
    console.error('=== SHORT LINK ERROR ===');
    console.error('Error:', error);
    console.error('=== END SHORT LINK ERROR ===');
    return NextResponse.json(
      { error: 'Failed to process redirect' },
      { status: 500 }
    );
  }
}
