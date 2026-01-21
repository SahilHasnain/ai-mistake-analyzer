/**
 * Test Service
 * Handles test session management and answer recording via Appwrite Functions
 */

import { Question } from "../types";

const RECORD_ANSWER_URL =
  process.env.EXPO_PUBLIC_RECORD_ANSWER_FUNCTION_URL || "";
const GET_RESULTS_URL =
  process.env.EXPO_PUBLIC_GET_TEST_RESULTS_FUNCTION_URL || "";
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "";

/**
 * Record a user's answer to a question
 */
export async function recordAnswer(params: {
  userId: string;
  testId: string;
  question: Question;
  selectedAnswer: "A" | "B" | "C" | "D";
  timeTaken: number; // seconds
  questionPosition: number;
  testDurationSoFar: number; // minutes
}): Promise<{ success: boolean; isCorrect: boolean }> {
  const {
    userId,
    testId,
    question,
    selectedAnswer,
    timeTaken,
    questionPosition,
    testDurationSoFar,
  } = params;

  try {
    if (!RECORD_ANSWER_URL) {
      throw new Error("Record answer function URL not configured");
    }

    if (!PROJECT_ID) {
      throw new Error("Appwrite project ID not configured");
    }

    const response = await fetch(RECORD_ANSWER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": PROJECT_ID,
      },
      body: JSON.stringify({
        userId,
        testId,
        questionId: question.$id,
        selectedAnswer,
        correctAnswer: question.correct_answer,
        timeTaken,
        questionPosition,
        testDurationSoFar,
        subject: question.subject,
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
      throw new Error(data.error || "Failed to record answer");
    }

    return {
      success: true,
      isCorrect: data.response.isCorrect,
    };
  } catch (error) {
    console.error("Error recording answer:", error);
    throw new Error(
      `Failed to record answer: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get test results summary
 */
export async function getTestResults(testId: string): Promise<{
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  totalTime: number; // seconds
  avgTimePerQuestion: number;
  subjectBreakdown: {
    Physics: { correct: number; total: number; accuracy: number };
    Chemistry: { correct: number; total: number; accuracy: number };
    Biology: { correct: number; total: number; accuracy: number };
  };
}> {
  try {
    if (!GET_RESULTS_URL) {
      throw new Error("Get test results function URL not configured");
    }

    if (!PROJECT_ID) {
      throw new Error("Appwrite project ID not configured");
    }

    const response = await fetch(GET_RESULTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": PROJECT_ID,
      },
      body: JSON.stringify({ testId }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Function call failed (${response.status}): ${errorText}`,
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to get test results");
    }

    return data.results;
  } catch (error) {
    console.error("Error getting test results:", error);
    throw new Error(
      `Failed to get test results: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
