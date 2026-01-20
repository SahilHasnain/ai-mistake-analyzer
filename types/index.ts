/**
 * TypeScript type definitions for the Mistake Pattern Analyzer app
 */

/**
 * Pattern interface representing an AI-detected mistake pattern
 * Stored in Appwrite DETECTED_PATTERNS collection
 */
export interface Pattern {
  $id: string; // Appwrite document ID
  user_id: string; // User identifier
  pattern_type: string; // Category of pattern (e.g., "rushing", "confusion")
  title: string; // Human-readable pattern title
  description: string; // Detailed explanation of the pattern
  confidence: number; // Confidence score (0-100)
  evidence: string[]; // Array of evidence items (parsed from JSON string in Appwrite)
  recommendation: string; // AI-generated recommendation text
  detected_at: string; // ISO timestamp of detection
  is_resolved: boolean; // Whether user has marked as resolved
  subject_distribution?: {
    // Optional subject breakdown
    Physics?: number;
    Chemistry?: number;
    Biology?: number;
  };
}

/**
 * Stats interface for user performance statistics
 * Calculated from USER_RESPONSES collection
 */
export interface Stats {
  totalQuestions: number; // Total questions answered
  mistakes: number; // Total incorrect answers
  accuracy: string; // Percentage as string (e.g., "72.5")
}

/**
 * UserResponse interface representing a single question response
 * Stored in Appwrite USER_RESPONSES collection
 */
export interface UserResponse {
  $id: string; // Appwrite document ID
  user_id: string; // User identifier
  question_id: string; // Question identifier
  selected_answer: string; // User's selected answer
  is_correct: boolean; // Whether the answer was correct
  time_taken: number; // Time taken in seconds
  test_id: string; // Test session identifier
  timestamp: string; // ISO timestamp of response
  question_position: number; // Position in test (1-based)
  test_duration_so_far: number; // Minutes elapsed in test
  subject?: string; // Optional subject ("Physics" | "Chemistry" | "Biology")
}
