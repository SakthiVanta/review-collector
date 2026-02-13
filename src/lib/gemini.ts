import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini AI Service for Review Generation
 * 
 * Generates personalized, high-quality customer reviews based on customer
 * and organization information.
 * 
 * Environment Variables:
 * GOOGLE_API_KEY=your_gemini_api_key
 */

interface ReviewGenerationInput {
  // Organization Info
  orgName: string;
  orgType: string;
  attenderName?: string;
  shopLocation?: string;
  orgDescription?: string;

  // Customer Info
  customerName: string;
  customerPhone?: string;

  // Purchase Info
  purchaseType: string;
  purchaseFrequency: string;
  purchaseDuration?: string;

  // Experience Info
  satisfactionLevel: number; // 1-10
  keyHighlights?: string;
  improvementAreas?: string;
  recommendationLikelihood: number; // 1-10

  // Event/Occasion
  events?: string;

  // Psychological/Behavioral
  shoppingMotivation?: string;
  priceSensitivity?: string;
  brandLoyalty?: string;
  emotionalConnection?: string;
}

interface ReviewGenerationResult {
  success: boolean;
  review?: string;
  error?: string;
}

/**
 * Initialize Gemini AI client
 */
function getGeminiClient() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate a review using Gemini AI
 */
export async function generateReview(
  input: ReviewGenerationInput
): Promise<ReviewGenerationResult> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = buildReviewPrompt(input);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const review = response.text().trim();

    return {
      success: true,
      review,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate review",
    };
  }
}

/**
 * Build the prompt for review generation
 */
function buildReviewPrompt(input: ReviewGenerationInput): string {
  return `Generate a realistic, detailed customer review for a business based on the following information:

BUSINESS INFORMATION:
- Business Name: ${input.orgName}
- Business Type: ${input.orgType}
${input.attenderName ? `- Attender/Salesperson: ${input.attenderName}` : ""}
${input.shopLocation ? `- Shop Location: ${input.shopLocation}` : ""}
${input.orgDescription ? `- Description: ${input.orgDescription}` : ""}

CUSTOMER INFORMATION:
- Customer Name: ${input.customerName}
- Purchase Type: ${input.purchaseType}
- Purchase Frequency: ${input.purchaseFrequency}
${input.purchaseDuration ? `- Duration as Customer: ${input.purchaseDuration}` : ""}

EXPERIENCE DETAILS:
- Overall Satisfaction (1-10): ${input.satisfactionLevel}
${input.events ? `- Occasion/Event: ${input.events}` : ""}
${input.keyHighlights ? `- Key Highlights: ${input.keyHighlights}` : ""}
${input.improvementAreas ? `- Areas for Improvement: ${input.improvementAreas}` : ""}
- Likelihood to Recommend (1-10): ${input.recommendationLikelihood}

BEHAVIORAL INSIGHTS:
${input.shoppingMotivation ? `- Shopping Motivation: ${input.shoppingMotivation}` : ""}
${input.priceSensitivity ? `- Price Sensitivity: ${input.priceSensitivity}` : ""}
${input.brandLoyalty ? `- Brand Loyalty: ${input.brandLoyalty}` : ""}
${input.emotionalConnection ? `- Emotional Connection: ${input.emotionalConnection}` : ""}

REQUIREMENTS:
1. Write in first person as ${input.customerName}
2. Make it sound natural and authentic (not overly promotional)
3. Include specific details about the purchase experience
4. Mention ${input.orgName} by name${input.shopLocation ? ` and the location` : ""}
5. Keep it between 150-250 words
6. Include both positive aspects and (if applicable) minor constructive feedback for credibility
7. End with a clear recommendation statement
8. Use conversational, friendly language

Generate the review now:`;
}

/**
 * Check Gemini API configuration status
 */
export function checkGeminiStatus(): {
  configured: boolean;
  message: string;
  instructions?: string[];
} {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      configured: false,
      message: "Google Gemini API not configured",
      instructions: [
        "1. Get API key from https://makersuite.google.com/app/apikey",
        "2. Add GOOGLE_API_KEY=your_key to .env file",
      ],
    };
  }

  return {
    configured: true,
    message: "Google Gemini API is configured",
  };
}

const geminiService = {
  generateReview,
  checkGeminiStatus,
};

export default geminiService;
