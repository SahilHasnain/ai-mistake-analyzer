/**
 * User ID Management Utility
 * Provides a unique user identifier without requiring authentication
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";

const USER_ID_KEY = "@neuro_user_id";

/**
 * Get or create a unique user ID for this device
 * Uses device installation ID or generates a UUID
 * Persists across app restarts
 */
export async function getUserId(): Promise<string> {
  try {
    // Check if we already have a stored user ID
    const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
    if (storedUserId) {
      return storedUserId;
    }

    // Try to get device installation ID (unique per app install)
    let userId = Application.getInstallationIdAsync
      ? await Application.getInstallationIdAsync()
      : null;

    // Fallback: Generate a UUID if installation ID not available
    if (!userId) {
      userId = generateUUID();
    }

    // Store for future use
    await AsyncStorage.setItem(USER_ID_KEY, userId);

    return userId;
  } catch (error) {
    console.error("Error getting user ID:", error);
    // Fallback to a generated UUID
    const fallbackId = generateUUID();
    try {
      await AsyncStorage.setItem(USER_ID_KEY, fallbackId);
    } catch (storageError) {
      console.error("Error storing fallback user ID:", storageError);
    }
    return fallbackId;
  }
}

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Clear the stored user ID (for testing/debugging)
 */
export async function clearUserId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.error("Error clearing user ID:", error);
  }
}

/**
 * Check if user has an ID stored
 */
export async function hasUserId(): Promise<boolean> {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    return userId !== null;
  } catch (error) {
    console.error("Error checking user ID:", error);
    return false;
  }
}
