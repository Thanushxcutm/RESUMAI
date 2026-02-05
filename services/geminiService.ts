
import { ResumeAnalysis } from "../types";

// Direct API call using fetch - more reliable than SDK
export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysis> => {
  try {
    console.log("Starting resume analysis with direct API call...");
    console.log("API Key available:", !!process.env.GEMINI_API_KEY);
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    const prompt = `Act as a brutal, high-stakes executive recruiter and ATS specialist. 

The job market is extremely saturated and competitive. Do NOT be sympathetic. If the resume is weak, say so. If the achievements lack data, point it out. 

Provide a detailed audit including:
1. advisorNote: A direct, professional "Recruiter's Audit". Explain why they are or aren't getting interviews in this market. Be blunt and actionable.
2. summary: A technical strength assessment.
3. skills: Verifiable core competencies.
4. job_matches: Roles where they actually stand a chance (suggest 5-7).
5. improvements: Critical fixes required to survive ATS filters.
6. Data points: score (Market impact 0-100), atsScore (Technical parsing health 0-100), missingSkills (Market gaps), and 3 improved versions of current bullet points using the Google XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).

Resume:
"""
${resumeText}
"""

Return ONLY valid JSON with this exact structure:
{
  "advisorNote": "string",
  "summary": "string", 
  "skills": ["string"],
  "missingSkills": ["string"],
  "job_matches": [{"role": "string", "fit_score": number, "reason": "string"}],
  "improvements": [{"issue": "string", "suggestion": "string", "example_fix": "string"}],
  "score": number,
  "atsScore": number,
  "improvedBulletPoints": [{"original": "string", "improved": "string"}],
  "atsAnalysis": {
    "formattingStatus": "string",
    "formattingFeedback": "string", 
    "keywordDensityScore": number,
    "standardSectionsFound": ["string"],
    "missingStandardSections": ["string"]
  }
}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    console.log("Sending request to Gemini API...");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", response.status, response.statusText, errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Received response from Gemini API");
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0]) {
      console.error("Unexpected API response structure:", data);
      throw new Error("Invalid response structure from API");
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    if (!responseText) {
      throw new Error("No response text from AI model");
    }

    try {
      // Try direct parse first
      return JSON.parse(responseText.trim()) as ResumeAnalysis;
    } catch (parseError) {
      // Try to extract JSON from text that might have extra content
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const extracted = jsonMatch[0];
          console.log("Extracted JSON from response");
          return JSON.parse(extracted) as ResumeAnalysis;
        }
      } catch (e) {
        // Continue to error below
      }
      
      console.error("JSON Parsing Error. Response text:", responseText.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON");
    }
  } catch (e: any) {
    console.error("Resume analysis error:", e);
    throw new Error(`Analysis failed: ${e.message || "Unknown error"}`);
  }
};

export const extractTextFromImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    console.log("Starting image text extraction with direct API call...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    const requestBody = {
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Extract all text from this resume. This is for high-stakes ATS analysis. Ensure no characters or formatting clues are missed."
          }
        ]
      }]
    };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image API Response Error:", response.status, response.statusText, errorText);
      throw new Error(`Image API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0]) {
      console.error("Unexpected image API response structure:", data);
      throw new Error("Invalid response structure from image API");
    }

    return data.candidates[0].content.parts[0].text || "";
  } catch (e: any) {
    console.error("Image extraction error:", e);
    throw new Error(`Image text extraction failed: ${e.message || "Unknown error"}`);
  }
};

// Simple test function to verify API connectivity
export const testGeminiAPI = async (): Promise<boolean> => {
  try {
    console.log("Testing Gemini API connection with direct API call...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("No API key found");
      return false;
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: "Say 'API test successful'"
        }]
      }]
    };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error("API test failed:", response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("API test response:", responseText);
    return responseText.includes("successful");
  } catch (e: any) {
    console.error("API test failed:", e);
    return false;
  }
};
