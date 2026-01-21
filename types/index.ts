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

/**
 * Question interface for NEET test questions
 * Stored in Appwrite QUESTIONS collection
 */
export interface Question {
  $id: string; // Appwrite document ID
  question_text: string; // The question text
  option_a: string; // Option A
  option_b: string; // Option B
  option_c: string; // Option C
  option_d: string; // Option D
  correct_answer: "A" | "B" | "C" | "D"; // Correct answer
  subject: "Physics" | "Chemistry" | "Biology"; // NEET subject
  difficulty: "Easy" | "Medium" | "Hard"; // Difficulty level
  topic?: string; // Optional topic/chapter
}

/**
 * Test Session interface for tracking active tests
 */
export interface TestSession {
  test_id: string; // Unique test session ID
  user_id: string; // User taking the test
  subject: "Physics" | "Chemistry" | "Biology" | "Mixed"; // Test subject
  total_questions: number; // Total questions in test
  current_question: number; // Current question index (0-based)
  start_time: number; // Test start timestamp
  questions: Question[]; // Array of questions in this test
}
