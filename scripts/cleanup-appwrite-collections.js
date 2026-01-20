/**
 * Appwrite Collection Cleanup Script
 * Deletes existing collections to allow fresh setup
 *
 * Run with: node scripts/cleanup-appwrite-collections.js
 */

const sdk = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

// Initialize Appwrite client
const client = new sdk.Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_SECRET_KEY);

const databases = new sdk.Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const PATTERNS_COLLECTION_ID = "DETECTED_PATTERNS";
const RESPONSES_COLLECTION_ID = "USER_RESPONSES";

async function cleanupCollections() {
  try {
    console.log("🧹 Starting Appwrite collection cleanup...\n");

    // Delete DETECTED_PATTERNS collection
    try {
      await databases.deleteCollection(DATABASE_ID, PATTERNS_COLLECTION_ID);
      console.log("✓ DETECTED_PATTERNS collection deleted");
    } catch (error) {
      if (error.code === 404) {
        console.log("⚠️  DETECTED_PATTERNS collection not found, skipping...");
      } else {
        throw error;
      }
    }

    // Delete USER_RESPONSES collection
    try {
      await databases.deleteCollection(DATABASE_ID, RESPONSES_COLLECTION_ID);
      console.log("✓ USER_RESPONSES collection deleted");
    } catch (error) {
      if (error.code === 404) {
        console.log("⚠️  USER_RESPONSES collection not found, skipping...");
      } else {
        throw error;
      }
    }

    console.log("\n✅ Cleanup complete! You can now run the setup script.");
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupCollections();
