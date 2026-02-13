import { NextRequest, NextResponse } from 'next/server';

/**
 * WhatsApp Redirect API
 * 
 * This endpoint handles short links sent via SMS and redirects to WhatsApp
 * with a pre-filled message.
 * 
 * Flow: SMS Short Link -> This API -> WhatsApp Deep Link
 * 
 * Example URL: /api/wa-redirect?text=Hello%20World
 * Redirects to: https://wa.me/?text=Hello%20World
 */

export async function GET(request: NextRequest) {
  try {
    // Get the text parameter from the query string
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text');

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text parameter' },
        { status: 400 }
      );
    }

    // Decode the text
    const decodedText = decodeURIComponent(text);
    
    // Build the WhatsApp deep link
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(decodedText)}`;
    
    // Redirect to WhatsApp
    return NextResponse.redirect(whatsAppUrl, 302);
    
  } catch (error) {
    console.error('WhatsApp redirect error:', error);
    return NextResponse.json(
      { error: 'Failed to process redirect' },
      { status: 500 }
    );
  }
}

/**
 * POST method - Alternative way to generate redirect URL
 * Can be used if you want to track clicks or store analytics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, reviewId } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text parameter' },
        { status: 400 }
      );
    }

    // Here you can add analytics tracking, e.g.:
    // - Log the click
    // - Update review status in database
    // - Track conversion metrics
    
    if (reviewId) {
      console.log(`Review link clicked: ${reviewId}`);
      // TODO: Update database to track click
      // await prisma.customerReview.update({
      //   where: { id: reviewId },
      //   data: { linkClickedAt: new Date() }
      // });
    }

    // Build the WhatsApp deep link
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    return NextResponse.json({
      success: true,
      redirectUrl: whatsAppUrl,
    });
    
  } catch (error) {
    console.error('WhatsApp redirect error:', error);
    return NextResponse.json(
      { error: 'Failed to process redirect' },
      { status: 500 }
    );
  }
}