import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getInteractionExplanation(drug1: string, drug2: string, interactionLabel: string, interactionDescription: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API_KEY_MISSING");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: `Explain the drug interaction between ${drug1} and ${drug2}. 
      The interaction is categorized as "${interactionLabel}". 
      General description: ${interactionDescription}.
      
      Provide a concise, empathetic, and harm-reduction focused explanation of why this interaction occurs and what the specific risks or effects are. 
      Keep it under 100 words. 
      Include a clear warning if it is dangerous.
      Format the output in Markdown.`,
      config: {
        systemInstruction: "You are a harm reduction expert. Your goal is to provide clear, non-judgmental, and scientifically accurate information about drug interactions to help people stay safe. Always prioritize safety and suggest seeking medical help if in doubt.",
      }
    });

    if (!response.text) {
      throw new Error("EMPTY_RESPONSE");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // Handle specific error types if needed
    if (error.message?.includes("quota") || error.message?.includes("429")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    
    throw error;
  }
}

export async function getDrugSummary(drug1Name: string, drug2Name?: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API_KEY_MISSING");
  }

  const prompt = drug2Name 
    ? `Provide a combined summary for the interaction between ${drug1Name} and ${drug2Name}. 
       For each drug, include:
       - Typical Effects
       - Onset Time
       - Duration
       
       Then, summarize the interaction risks and safety profile based on harm reduction principles.
       Present this in a clear, easy-to-understand Markdown format with headers. 
       Keep the total response concise but informative.`
    : `Provide a comprehensive summary for ${drug1Name}.
       Include:
       - Typical Effects
       - Onset Time
       - Duration
       - Potential Risks (Short and Long term)
       
       Present this in a clear, easy-to-understand Markdown format with headers.
       Keep it concise and focused on harm reduction.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: prompt,
      config: {
        systemInstruction: "You are a harm reduction expert. Provide accurate, non-judgmental information about substances to help people stay safe. Use clear headings and bullet points. Always include a disclaimer that this is not medical advice.",
      }
    });

    if (!response.text) {
      throw new Error("EMPTY_RESPONSE");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Summary Error:", error);
    throw error;
  }
}
