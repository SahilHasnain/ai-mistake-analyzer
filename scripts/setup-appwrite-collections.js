/**
 * Appwrite Collection Setup Script
 * Creates the required collections and attributes for the Mistake Pattern Analyzer app
 *
 * Run with: node scripts/setup-appwrite-collections.js
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

// Helper function to add delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setupCollections() {
  try {
    console.log("🚀 Starting Appwrite collection setup...\n");

    // Create DETECTED_PATTERNS collection
    await createPatternsCollection();

    // Create USER_RESPONSES collection
    await createResponsesCollection();

    console.log("\n✅ All collections created successfully!");
    console.log("\n📝 Collection IDs:");
    console.log(`   - DETECTED_PATTERNS: ${PATTERNS_COLLECTION_ID}`);
    console.log(`   - USER_RESPONSES: ${RESPONSES_COLLECTION_ID}`);
  } catch (error) {
    console.error("❌ Error setting up collections:", error.message);
    process.exit(1);
  }
}

async function createPatternsCollection() {
  console.log("📦 Creating DETECTED_PATTERNS collection...");

  try {
    // Create collection
    await databases.createCollection(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "Detected Patterns",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
    );
    console.log("   ✓ Collection created");
    await delay(2000);

    // Create attributes with delays
    await databases.createStringAttribute(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "user_id",
      255,
      true,
    );
    console.log("   ✓ user_id attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "pattern_type",
      100,
      true,
    );
    console.log("   ✓ pattern_type attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "title",
      255,
      true,
    );
    console.log("   ✓ title attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "description",
      2000,
      true,
    );
    console.log("   ✓ description attribute created");
    await delay(2000);

    await databases.createIntegerAttribute(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "confidence",
      true,
      0,
      100,
    );
    console.log("   ✓ confidence attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "evidence",
      5000,
      true,
    );
    console.log("   ✓ evidence attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "recommendation",
      2000,
      true,
    );
    console.log("   ✓ recommendation attribute created");
    await delay(2000);

    await databases.createDatetimeAttribute(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "detected_at",
      true,
    );
    console.log("   ✓ detected_at attribute created");
    await delay(2000);

    await databases.createBooleanAttribute(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "is_resolved",
      true,
    );
    console.log("   ✓ is_resolved attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "subject_distribution",
      1000,
      false,
    );
    console.log("   ✓ subject_distribution attribute created");

    // Wait for attributes to be available
    console.log("   ⏳ Waiting for attributes to be ready...");
    await delay(5000);

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "user_id_idx",
      "key",
      ["user_id"],
    );
    console.log("   ✓ user_id index created");
    await delay(2000);

    await databases.createIndex(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "is_resolved_idx",
      "key",
      ["is_resolved"],
    );
    console.log("   ✓ is_resolved index created");
    await delay(2000);

    await databases.createIndex(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "user_resolved_idx",
      "key",
      ["user_id", "is_resolved"],
    );
    console.log("   ✓ user_id + is_resolved compound index created");
    await delay(2000);

    await databases.createIndex(
      DATABASE_ID,
      PATTERNS_COLLECTION_ID,
      "confidence_idx",
      "key",
      ["confidence"],
      ["DESC"],
    );
    console.log("   ✓ confidence index created");

    console.log("✅ DETECTED_PATTERNS collection setup complete\n");
  } catch (error) {
    if (error.code === 409) {
      console.log("   ⚠️  Collection already exists, skipping...\n");
    } else {
      throw error;
    }
  }
}

async function createResponsesCollection() {
  console.log("📦 Creating USER_RESPONSES collection...");

  try {
    // Create collection
    await databases.createCollection(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "User Responses",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
    );
    console.log("   ✓ Collection created");
    await delay(2000);

    // Create attributes with delays
    await databases.createStringAttribute(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "user_id",
      255,
      true,
    );
    console.log("   ✓ user_id attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "question_id",
      255,
      true,
    );
    console.log("   ✓ question_id attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "selected_answer",
      255,
      true,
    );
    console.log("   ✓ selected_answer attribute created");
    await delay(2000);

    await databases.createBooleanAttribute(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "is_correct",
      true,
    );
    console.log("   ✓ is_correct attribute created");
    await delay(2000);

    await databases.createIntegerAttribute(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "time_taken",
      true,
    );
    console.log("   ✓ time_taken attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "test_id",
      255,
      true,
    );
    console.log("   ✓ test_id attribute created");
    await delay(2000);

    await databases.createDatetimeAttribute(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "timestamp",
      true,
    );
    console.log("   ✓ timestamp attribute created");
    await delay(2000);

    await databases.createIntegerAttribute(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "question_position",
      true,
    );
    console.log("   ✓ question_position attribute created");
    await delay(2000);

    await databases.createFloatAttribute(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "test_duration_so_far",
      true,
    );
    console.log("   ✓ test_duration_so_far attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "subject",
      50,
      false,
    );
    console.log("   ✓ subject attribute created");

    // Wait for attributes to be available
    console.log("   ⏳ Waiting for attributes to be ready...");
    await delay(5000);

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "user_id_idx",
      "key",
      ["user_id"],
    );
    console.log("   ✓ user_id index created");
    await delay(2000);

    await databases.createIndex(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "test_id_idx",
      "key",
      ["test_id"],
    );
    console.log("   ✓ test_id index created");
    await delay(2000);

    await databases.createIndex(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      "user_timestamp_idx",
      "key",
      ["user_id", "timestamp"],
    );
    console.log("   ✓ user_id + timestamp compound index created");

    console.log("✅ USER_RESPONSES collection setup complete\n");
  } catch (error) {
    if (error.code === 409) {
      console.log("   ⚠️  Collection already exists, skipping...\n");
    } else {
      throw error;
    }
  }
}

// Run the setup
setupCollections();
