/**
 * Short Link Utilities
 * 
 * Generates and manages short URLs for SMS messages
 * Short code format: 6-8 character alphanumeric (e.g., "a3f9k2")
 * This keeps SMS URLs very short: yourdomain.com/r/a3f9k2
 */

import prisma from '@/lib/prisma';

const SHORT_CODE_LENGTH = 6;
const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a random short code
 * 6 characters = ~2.1 billion combinations (36^6)
 * Collision probability is extremely low
 */
export function generateShortCode(): string {
  let code = '';
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

/**
 * Create a short link and save to database
 * @param reviewText - The full review text to store
 * @param customerName - Customer name
 * @param shopName - Shop name (optional)
 * @param productName - Product name (optional)
 * @param expiresInHours - Optional expiration time (default: 168 hours = 7 days)
 * @returns The short code (e.g., "a3f9k2")
 */
export async function createShortLink(
  reviewText: string,
  customerName: string,
  shopName?: string,
  productName?: string,
  expiresInHours: number = 168
): Promise<string> {
  // Generate unique short code (retry if collision)
  let shortCode = generateShortCode();
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    try {
      // Check if code exists
      const existing = await prisma.shortLink.findUnique({
        where: { shortCode }
      });
      
      if (!existing) {
        // Code is unique, create the link
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);
        
        await prisma.shortLink.create({
          data: {
            shortCode,
            reviewText,
            customerName,
            shopName: shopName || null,
            productName: productName || null,
            expiresAt,
          }
        });
        
        return shortCode;
      }
      
      // Collision! Generate new code
      shortCode = generateShortCode();
      attempts++;
    } catch (error) {
      console.error('Error creating short link:', error);
      throw error;
    }
  }
  
  throw new Error('Failed to generate unique short code after multiple attempts');
}

/**
 * Get review text by short code
 * Also increments click counter
 * @param shortCode - The short code (e.g., "a3f9k2")
 * @returns The stored review data or null if not found/expired
 */
export async function getReviewByShortCode(shortCode: string): Promise<{
  reviewText: string;
  customerName: string;
  shopName: string | null;
  productName: string | null;
} | null> {
  try {
    const link = await prisma.shortLink.findUnique({
      where: { shortCode }
    });
    
    if (!link) {
      return null;
    }
    
    // Check if expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      return null;
    }
    
    // Increment click count
    await prisma.shortLink.update({
      where: { shortCode },
      data: { clicks: { increment: 1 } }
    });
    
    return {
      reviewText: link.reviewText,
      customerName: link.customerName,
      shopName: link.shopName,
      productName: link.productName,
    };
  } catch (error) {
    console.error('Error fetching short link:', error);
    return null;
  }
}

/**
 * Generate short URL from code
 * @param shortCode - The short code
 * @returns Full short URL
 */
export function getShortUrl(shortCode: string): string {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  return `${baseUrl}/r/${shortCode}`;
}

/**
 * Clean up expired short links (can be run periodically)
 * @param olderThanDays - Delete links older than X days
 */
export async function cleanupExpiredLinks(olderThanDays: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const result = await prisma.shortLink.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { createdAt: { lt: cutoffDate } }
        ]
      }
    });
    
    return result.count;
  } catch (error) {
    console.error('Error cleaning up short links:', error);
    return 0;
  }
}