/**
 * Zustand store for managing patterns and statistics state
 * Handles all state management for the Mistake Pattern Analyzer app
 */

import { create } from "zustand";
import {
  analyzePatterns as analyzePatternService,
  getUserPatterns,
  getUserStats,
  resolvePattern as resolvePatternService,
} from "../services/appwrite";
import { Pattern, Stats } from "../types";

/**
 * PatternStore interface defining state and actions
 */
interface PatternStore {
  // State
  patterns: Pattern[];
  loading: boolean;
  analyzing: boolean;
  stats: Stats;

  // Actions
  fetchPatterns: (userId: string) => Promise<void>;
  fetchStats: (userId: string) => Promise<void>;
  analyzePatterns: (userId: string) => Promise<void>;
  resolvePattern: (patternId: string) => Promise<void>;
}

/**
 * Create Zustand store with initial state and actions
 */
export const usePatternStore = create<PatternStore>((set, get) => ({
  // Initial state
  patterns: [],
  loading: false,
  analyzing: false,
  stats: {
    totalQuestions: 0,
    mistakes: 0,
    accuracy: "0.0",
  },

  /**
   * Fetch patterns for a user from Appwrite
   * @param userId - User identifier
   */
  fetchPatterns: async (userId: string) => {
    try {
      set({ loading: true });
      const patterns = await getUserPatterns(userId);
      set({ patterns, loading: false });
    } catch (error) {
      console.error("Error in fetchPatterns:", error);
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Fetch user statistics from Appwrite
   * @param userId - User identifier
   */
  fetchStats: async (userId: string) => {
    try {
      const stats = await getUserStats(userId);
      set({ stats });
    } catch (error) {
      console.error("Error in fetchStats:", error);
      throw error;
    }
  },

  /**
   * Trigger AI pattern analysis via Appwrite Function
   * @param userId - User identifier
   */
  analyzePatterns: async (userId: string) => {
    try {
      set({ analyzing: true });
      await analyzePatternService(userId);

      // Wait for async processing (5 seconds as per design)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Refresh patterns list after analysis
      await get().fetchPatterns(userId);
    } catch (error) {
      console.error("Error in analyzePatterns:", error);
      throw error;
    } finally {
      set({ analyzing: false });
    }
  },

  /**
   * Mark a pattern as resolved and update local state
   * @param patternId - Pattern document ID
   */
  resolvePattern: async (patternId: string) => {
    try {
      await resolvePatternService(patternId);

      // Remove pattern from local state
      const currentPatterns = get().patterns;
      const updatedPatterns = currentPatterns.filter(
        (pattern) => pattern.$id !== patternId,
      );
      set({ patterns: updatedPatterns });
    } catch (error) {
      console.error("Error in resolvePattern:", error);
      throw error;
    }
  },
}));
