/**
 * Test Store
 * Manages test session state
 */

import { create } from "zustand";
import { generateQuestions } from "../services/questionGenerator";
import { getTestResults, recordAnswer } from "../services/testService";
import { TestSession } from "../types";

interface TestStore {
  // State
  currentTest: TestSession | null;
  loading: boolean;
  submitting: boolean;
  questionStartTime: number | null;

  // Actions
  startTest: (
    userId: string,
    subject: "Physics" | "Chemistry" | "Biology" | "Mixed",
    questionCount: number,
  ) => Promise<void>;
  submitAnswer: (answer: "A" | "B" | "C" | "D") => Promise<void>;
  nextQuestion: () => void;
  endTest: () => Promise<any>;
  resetTest: () => void;
}

export const useTestStore = create<TestStore>((set, get) => ({
  // Initial state
  currentTest: null,
  loading: false,
  submitting: false,
  questionStartTime: null,

  /**
   * Start a new test session
   */
  startTest: async (userId, subject, questionCount) => {
    set({ loading: true });
    try {
      // Generate questions using AI
      const questions = await generateQuestions({
        subject,
        count: questionCount,
        difficulty: "Medium",
      });

      const testSession: TestSession = {
        test_id: `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        subject,
        total_questions: questions.length,
        current_question: 0,
        start_time: Date.now(),
        questions,
      };

      set({
        currentTest: testSession,
        questionStartTime: Date.now(),
        loading: false,
      });
    } catch (error) {
      console.error("Error starting test:", error);
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Submit answer for current question
   */
  submitAnswer: async (answer) => {
    const { currentTest, questionStartTime } = get();

    if (!currentTest || questionStartTime === null) {
      throw new Error("No active test session");
    }

    const currentQuestion = currentTest.questions[currentTest.current_question];
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000); // seconds
    const testDurationSoFar = (Date.now() - currentTest.start_time) / 1000 / 60; // minutes

    set({ submitting: true });

    try {
      await recordAnswer({
        userId: currentTest.user_id,
        testId: currentTest.test_id,
        question: currentQuestion,
        selectedAnswer: answer,
        timeTaken,
        questionPosition: currentTest.current_question + 1,
        testDurationSoFar,
      });

      set({ submitting: false });
    } catch (error) {
      console.error("Error submitting answer:", error);
      set({ submitting: false });
      throw error;
    }
  },

  /**
   * Move to next question
   */
  nextQuestion: () => {
    const { currentTest } = get();

    if (!currentTest) return;

    const nextIndex = currentTest.current_question + 1;

    if (nextIndex < currentTest.total_questions) {
      set({
        currentTest: {
          ...currentTest,
          current_question: nextIndex,
        },
        questionStartTime: Date.now(),
      });
    }
  },

  /**
   * End test and get results
   */
  endTest: async () => {
    const { currentTest } = get();

    if (!currentTest) {
      throw new Error("No active test session");
    }

    try {
      const results = await getTestResults(currentTest.test_id);
      set({ currentTest: null, questionStartTime: null });
      return results;
    } catch (error) {
      console.error("Error ending test:", error);
      throw error;
    }
  },

  /**
   * Reset test state
   */
  resetTest: () => {
    set({
      currentTest: null,
      loading: false,
      submitting: false,
      questionStartTime: null,
    });
  },
}));
