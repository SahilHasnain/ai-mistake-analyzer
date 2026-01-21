/**
 * AI Question Generator Service
 * Calls Appwrite Function to generate NEET questions using Groq AI
 */

import { Question } from "../types";

const FUNCTION_URL =
  process.env.EXPO_PUBLIC_GENERATE_QUESTIONS_FUNCTION_URL || "";
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "";

interface GenerateQuestionsParams {
  subject: "Physics" | "Chemistry" | "Biology" | "Mixed";
  count: number;
  difficulty?: "Easy" | "Medium" | "Hard";
}

/**
 * Generate NEET questions using Appwrite Function (calls Groq AI)
 */
export async function generateQuestions(
  params: GenerateQuestionsParams,
): Promise<Question[]> {
  const { subject, count, difficulty = "Medium" } = params;

  try {
    if (!FUNCTION_URL) {
      throw new Error("Generate questions function URL not configured");
    }

    if (!PROJECT_ID) {
      throw new Error("Appwrite project ID not configured");
    }

    // Call Appwrite Function
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": PROJECT_ID,
      },
      body: JSON.stringify({
        subject,
        count,
        difficulty,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Function call failed (${response.status}): ${errorText}`,
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to generate questions");
    }

    return data.questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error(
      `Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
