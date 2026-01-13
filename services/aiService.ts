
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFacilityContent = async (facilityName: string, keywords: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional branding assistant for a high-end dog kennel named "${facilityName}". 
      Based on these keywords: "${keywords}", generate two things in JSON format:
      1. "description": A short, professional paragraph for the "About Us" section of their dashboard.
      2. "welcomeMessage": A friendly, reassuring one-sentence greeting for customers when they check in their pets.`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      description: "A premier facility dedicated to the best care for your pets.",
      welcomeMessage: "Welcome to our family! We're excited to look after your companion."
    };
  }
};
