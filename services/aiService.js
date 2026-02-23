import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Generate search keywords for a product using Gemini AI.
 * @param {string} name - Product name
 * @param {string} description - Product description
 * @param {string} category - Product category
 * @returns {Promise<string[]>} Array of keyword strings
 */
export const generateSearchKeywords = async (name, description, category) => {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Generate 5-8 search keywords for this product:
    Name: ${name}
    Description: ${description}
    Category: ${category}
    
    Return only the keywords separated by commas, no explanations.`;

    const result = await model.generateContent(prompt);
    return result.response
        .text()
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);
};

/**
 * Expand a user's search query into related terms using Gemini AI.
 * @param {string} query - Original search query
 * @returns {Promise<string[]>} Array of expanded search terms
 */
export const expandSearchQuery = async (query) => {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Given this search query: "${query}", generate 10-15 related search terms, synonyms, and categories that would help find relevant products. 
    Focus on:
    - Product categories
    - Common synonyms
    - Related terms
    - Brand names (if applicable)
    
    Return only the terms separated by commas, no explanations.`;

    const result = await model.generateContent(prompt);
    return result.response
        .text()
        .split(",")
        .map((term) => term.trim())
        .filter(Boolean);
};
