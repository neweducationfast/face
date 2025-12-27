import { GoogleGenAI, Type } from "@google/genai";
import { Student, IdentificationResult } from "../types";

// Initialize Gemini Client
// IMPORTANT: In a real production app, this should be a backend call to hide the API Key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Identifies a student from a captured frame by comparing it with registered student images.
 * Uses Gemini 3 Flash Preview for fast multimodal reasoning with JSON output.
 */
export const identifyStudent = async (
  currentFrameBase64: string,
  students: Student[]
): Promise<IdentificationResult> => {
  if (students.length === 0) {
    return { matchFound: false, message: "No students registered." };
  }

  try {
    // We will construct a prompt that sends the current frame AND the registered faces.
    // For bandwidth and token optimization in this demo, we will limit the comparison 
    // to a reasonable number or rely on a description match if the list is huge.
    // Here we assume a small class size for the demo (e.g., < 10 active students for direct visual comparison).
    
    // Clean base64 strings (remove data:image/png;base64, prefix if present)
    const cleanFrame = currentFrameBase64.split(',')[1] || currentFrameBase64;

    const parts: any[] = [];

    // Instruction Part
    parts.push({
      text: `You are an automated attendance system for the Class of 2026. 
      I will provide you with a "TARGET_IMAGE" (the live camera feed) and a list of "REGISTERED_STUDENTS" with their IDs and reference photos.
      
      Your task:
      1. Analyze the "TARGET_IMAGE".
      2. Compare the face in the "TARGET_IMAGE" with each of the "REGISTERED_STUDENTS".
      3. If you find a high-confidence match, return the student's ID.
      4. If the face in "TARGET_IMAGE" does not match anyone strongly, or if there is no clear face, return null.
      
      Return the response in JSON format.`
    });

    // Add Registered Students as parts (labeled)
    // Note: Sending too many images might hit limits. Ideally, use embeddings vector DB. 
    // For this standalone demo, we send reference images directly.
    students.forEach((student, index) => {
        const cleanRef = student.photoUrl.split(',')[1] || student.photoUrl;
        parts.push({
            text: `REGISTERED_STUDENT_ID: ${student.id}`
        });
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: cleanRef
            }
        });
    });

    // Add Target Image
    parts.push({ text: "TARGET_IMAGE (Live Feed):" });
    parts.push({
        inlineData: {
            mimeType: 'image/jpeg',
            data: cleanFrame
        }
    });

    // Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                matchFound: { type: Type.BOOLEAN },
                studentId: { type: Type.STRING },
                confidence: { type: Type.STRING, description: "High, Medium, or Low" }
            }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
        throw new Error("Empty response from AI");
    }

    const resultJson = JSON.parse(resultText);
    
    if (resultJson.matchFound && resultJson.studentId) {
        return {
            matchFound: true,
            studentId: resultJson.studentId,
            confidence: resultJson.confidence
        };
    }

    return { matchFound: false, message: "No match found" };

  } catch (error) {
    console.error("Gemini Identification Error:", error);
    return { matchFound: false, message: "AI processing failed" };
  }
};