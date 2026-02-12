
import { GoogleGenAI } from "@google/genai";
import { HealthRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHealthRecords = async (records: HealthRecord[], patientName: string) => {
  const recordsSummary = records.map(r => 
    `Date: ${new Date(r.timestamp).toLocaleDateString()}, Type: ${r.type}, Data: ${r.data}`
  ).join('\n');

  const prompt = `
    As an AI Clinical Assistant, analyze the following medical records for patient "${patientName}".
    The records are retrieved from an immutable blockchain ledger.
    
    Records:
    ${recordsSummary}

    Please provide:
    1. A concise summary of the medical history.
    2. Identification of any worrying trends or patterns.
    3. Suggested follow-up questions for the next consultation.
    
    Format the output using clear Markdown headings and bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze records. Please try again later.";
  }
};
