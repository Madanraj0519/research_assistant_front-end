import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Get the Gemini API key from localStorage or environment
 * @returns The API key or empty string
 */
const getApiKey = (): string => {
  // Check localStorage first (user settings), then environment variable (build time)
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem('ra_api_key');
    if (storedKey) return storedKey;
  }
  return process.env.GEMINI_API_KEY || process.env.API_KEY || '';
};

/**
 * Summarize text using Google Gemini AI
 * @param text - The text to summarize
 * @returns Promise resolving to the summary
 */
export const summarizeText = async (text: string): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    // Return helpful message if no API key
    await new Promise(resolve => setTimeout(resolve, 500));
    return "🔑 API Key Required\n\nPlease add your Google Gemini API Key in the Settings tab to generate AI summaries.\n\nGet a free key at: https://aistudio.google.com";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a helpful research assistant. Summarize the following text concisely, highlighting the main points. Use bullet points for clarity when appropriate. Keep the summary informative but brief.

Text to summarize:
${text}

Provide a clear, well-structured summary:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    if (!summary) {
      throw new Error("Empty response from AI");
    }

    return summary;
  } catch (error) {
    console.error("Gemini API Error:", error);

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
        throw new Error("Invalid API Key. Please check your Gemini API Key in Settings.");
      }
      if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('429')) {
        throw new Error("API quota exceeded. Please try again later or upgrade your plan.");
      }
      if (error.message.includes('SAFETY')) {
        throw new Error("Content was blocked by safety filters. Please try different text.");
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error("Network error. Please check your internet connection.");
      }
    }

    throw new Error("Failed to summarize text. Please try again.");
  }
};

/**
 * Check if the API key is valid by making a simple request
 * @param apiKey - The API key to validate
 * @returns Promise resolving to validation result
 */
export const validateApiKey = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, error: "API key is too short" };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Make a simple request to validate the key
    const result = await model.generateContent("Say 'OK' if you can read this.");
    const response = result.response.text();

    return { valid: !!response };
  } catch (error) {
    console.error("API Key validation error:", error);

    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
        return { valid: false, error: "Invalid API key" };
      }
    }

    return { valid: false, error: "Could not validate API key" };
  }
};

/**
 * Generate a title for content
 * @param content - The content to generate a title for
 * @returns Promise resolving to a generated title
 */
export const generateTitle = async (content: string): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    // Generate a simple title from content if no API key
    const words = content.split(/\s+/).slice(0, 5).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `Generate a short, descriptive title (max 50 characters) for this text:\n\n${content.substring(0, 500)}\n\nTitle:`
    );

    const title = result.response.text().trim();
    return title || content.substring(0, 30) + '...';
  } catch {
    // Fallback to simple title extraction
    const words = content.split(/\s+/).slice(0, 5).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  }
};
