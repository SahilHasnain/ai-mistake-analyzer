/**
 * Appwrite service layer for the Mistake Pattern Analyzer app
 * Handles all interactions with Appwrite backend
 */

import { Client, Databases, Query } from "react-native-appwrite";
import { Pattern, Stats } from "../types";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "");

// Initialize Databases service
export const databases = new Databases(client);

// Environment variables for database and collection IDs
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "";
const PATTERNS_COLLECTION_ID = "DETECTED_PATTERNS";
const RESPONSES_COLLECTION_ID = "USER_RESPONSES";

/**
 * Appwrite document type with evidence as string (before parsing)
 */
interface AppwritePattern extends Omit<Pattern, "evidence"> {
  evidence: string; // JSON string in Appwrite
}

/**
 * Get all unresolved patterns for a user
 * @param userId - User identifier
 * @returns Promise with array of patterns
 */
export async function getUserPatterns(userId: string): Promise<Pattern[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      [
        Query.equal("user_id", userId),
        Query.equal("is_resolved", false),
        Query.orderDesc("confidence"),
        Query.limit(10),
      ],
    );

    // Parse evidence from JSON string to array
    const patterns: Pattern[] = response.documents.map((doc: any) => {
      let evidence: string[] = [];
      try {
        evidence = JSON.parse(doc.evidence);
      } catch (error) {
        console.error("Failed to parse evidence for pattern:", doc.$id, error);
        evidence = [];
      }

      return {
        ...doc,
        evidence,
      };
    });

    return patterns;
  } catch (error) {
    console.error("Error fetching user patterns:", error);
    throw error;
  }
}

/**
 * Get user statistics from response data
 * @param userId - User identifier
 * @returns Promise with stats object
 */
export async function getUserStats(userId: string): Promise<Stats> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      [Query.equal("user_id", userId), Query.limit(1000)],
    );

    const totalQuestions = response.documents.length;
    const mistakes = response.documents.filter(
      (doc: any) => !doc.is_correct,
    ).length;
    const correct = totalQuestions - mistakes;
    const accuracy =
      totalQuestions > 0
        ? ((correct / totalQuestions) * 100).toFixed(1)
        : "0.0";

    return {
      totalQuestions,
      mistakes,
      accuracy,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
}

/**
 * Trigger AI pattern analysis via Appwrite Function
 * @param userId - User identifier
 * @returns Promise with response
 */
export async function analyzePatterns(userId: string): Promise<Response> {
  try {
    const functionUrl = process.env.EXPO_PUBLIC_APPWRITE_FUNCTION_URL || "";
    const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "";
    const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": projectId,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Analysis request failed: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error triggering pattern analysis:", error);
    throw error;
  }
}

/**
 * Mark a pattern as resolved
 * @param patternId - Pattern document ID
 * @returns Promise with updated pattern
 */
export async function resolvePattern(patternId: string): Promise<Pattern> {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      patternId,
      {
        is_resolved: true,
      },
    );

    // Parse evidence from JSON string to array
    let evidence: string[] = [];
    try {
      evidence = JSON.parse((response as any).evidence);
    } catch (error) {
      console.error(
        "Failed to parse evidence for pattern:",
        response.$id,
        error,
      );
      evidence = [];
    }

    return {
      ...(response as any),
      evidence,
    };
  } catch (error) {
    console.error("Error resolving pattern:", error);
    throw error;
  }
}
