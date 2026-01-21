/**
 * Test Service
 * Handles test session management and answer recording directly with Appwrite
 */

import { Query } from "react-native-appwrite";
import { Question } from "../types";
import { databases } from "./appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "";
const RESPONSES_COLLECTION_ID = "USER_RESPONSES";

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

  const isCorrect = selectedAnswer === question.correct_answer;

  try {
    if (!DATABASE_ID || !RESPONSES_COLLECTION_ID) {
      throw new Error("Database configuration is missing");
    }

    await databases.createDocument(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "unique()",
      {
        user_id: userId,
        question_id: question.$id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        time_taken: timeTaken,
        test_id: testId,
        timestamp: new Date().toISOString(),
        question_position: questionPosition,
        test_duration_so_far: testDurationSoFar,
        subject: question.subject,
      },
    );

    return {
      success: true,
      isCorrect,
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
    if (!DATABASE_ID || !RESPONSES_COLLECTION_ID) {
      throw new Error("Database configuration is missing");
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      [Query.equal("test_id", testId), Query.limit(1000)],
    );

    const responses = response.documents as any[];

    if (responses.length === 0) {
      throw new Error("No responses found for this test");
    }

    const totalQuestions = responses.length;
    const correctAnswers = responses.filter((r) => r.is_correct).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const totalTime = responses.reduce(
      (sum, r) => sum + (r.time_taken || 0),
      0,
    );
    const avgTimePerQuestion =
      totalQuestions > 0 ? totalTime / totalQuestions : 0;

    // Subject breakdown
    const subjectBreakdown = {
      Physics: { correct: 0, total: 0, accuracy: 0 },
      Chemistry: { correct: 0, total: 0, accuracy: 0 },
      Biology: { correct: 0, total: 0, accuracy: 0 },
    };

    responses.forEach((r) => {
      const subject = r.subject as keyof typeof subjectBreakdown;
      if (subject && subjectBreakdown[subject]) {
        subjectBreakdown[subject].total++;
        if (r.is_correct) {
          subjectBreakdown[subject].correct++;
        }
      }
    });

    // Calculate subject accuracies
    Object.keys(subjectBreakdown).forEach((subject) => {
      const key = subject as keyof typeof subjectBreakdown;
      const data = subjectBreakdown[key];
      data.accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
    });

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      accuracy: parseFloat(accuracy.toFixed(2)),
      totalTime,
      avgTimePerQuestion: parseFloat(avgTimePerQuestion.toFixed(2)),
      subjectBreakdown,
    };
  } catch (error) {
    console.error("Error getting test results:", error);
    throw new Error(
      `Failed to get test results: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
