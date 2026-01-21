/**
 * Master Collection Setup Script
 * Creates ALL required collections for the NEET Pattern Analyzer
 *
 * Run with: node scripts/setup-all-collections.js
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("🚀 Starting complete Appwrite collections setup...\n");
console.log(`📍 Database ID: ${DATABASE_ID}\n`);

// Collection configurations
const collections = {
  DETECTED_PATTERNS: {
    name: "Detected Patterns",
    attributes: [
      { name: "user_id", type: "string", size: 255, required: true },
      { name: "pattern_type", type: "string", size: 100, required: true },
      { name: "title", type: "string", size: 255, required: true },
      { name: "description", type: "string", size: 2000, required: true },
      { name: "confidence", type: "integer", required: true, min: 0, max: 100 },
      { name: "evidence", type: "string", size: 5000, required: true },
      { name: "recommendation", type: "string", size: 2000, required: true },
      { name: "detected_at", type: "datetime", required: true },
      { name: "is_resolved", type: "boolean", required: true },
      {
        name: "subject_distribution",
        type: "string",
        size: 1000,
        required: false,
      },
    ],
    indexes: [
      { key: "user_id_idx", type: "key", attributes: ["user_id"] },
      { key: "is_resolved_idx", type: "key", attributes: ["is_resolved"] },
      {
        key: "user_resolved_idx",
        type: "key",
        attributes: ["user_id", "is_resolved"],
      },
      {
        key: "confidence_idx",
        type: "key",
        attributes: ["confidence"],
        orders: ["DESC"],
      },
    ],
  },
  USER_RESPONSES: {
    name: "User Responses",
    attributes: [
      { name: "user_id", type: "string", size: 255, required: true },
      { name: "question_id", type: "string", size: 255, required: true },
      { name: "selected_answer", type: "string", size: 255, required: true },
      { name: "is_correct", type: "boolean", required: true },
      { name: "time_taken", type: "integer", required: true },
      { name: "test_id", type: "string", size: 255, required: true },
      { name: "timestamp", type: "datetime", required: true },
      { name: "question_position", type: "integer", required: true },
      { name: "test_duration_so_far", type: "float", required: true },
      { name: "subject", type: "string", size: 50, required: false },
    ],
    indexes: [
      { key: "user_id_idx", type: "key", attributes: ["user_id"] },
      { key: "test_id_idx", type: "key", attributes: ["test_id"] },
      {
        key: "user_timestamp_idx",
        type: "key",
        attributes: ["user_id", "timestamp"],
      },
    ],
  },
  QUESTIONS: {
    name: "Questions",
    attributes: [
      { name: "question_text", type: "string", size: 5000, required: true },
      { name: "option_a", type: "string", size: 500, required: true },
      { name: "option_b", type: "string", size: 500, required: true },
      { name: "option_c", type: "string", size: 500, required: true },
      { name: "option_d", type: "string", size: 500, required: true },
      { name: "correct_answer", type: "string", size: 1, required: true },
      { name: "subject", type: "string", size: 50, required: true },
      { name: "difficulty", type: "string", size: 20, required: true },
      { name: "topic", type: "string", size: 200, required: false },
    ],
    indexes: [
      { key: "subject_idx", type: "key", attributes: ["subject"] },
      { key: "difficulty_idx", type: "key", attributes: ["difficulty"] },
    ],
  },
};

async function setupAllCollections() {
  try {
    for (const [collectionId, config] of Object.entries(collections)) {
      await setupCollection(collectionId, config);
    }

    console.log("\n✅ All collections created successfully!");
    console.log("\n📝 Collection Summary:");
    console.log(
      `   - DETECTED_PATTERNS: ${collections.DETECTED_PATTERNS.attributes.length} attributes, ${collections.DETECTED_PATTERNS.indexes.length} indexes`,
    );
    console.log(
      `   - USER_RESPONSES: ${collections.USER_RESPONSES.attributes.length} attributes, ${collections.USER_RESPONSES.indexes.length} indexes`,
    );
    console.log(
      `   - QUESTIONS: ${collections.QUESTIONS.attributes.length} attributes, ${collections.QUESTIONS.indexes.length} indexes`,
    );
    console.log("\n🎉 Setup complete! You can now:");
    console.log("   1. Deploy Appwrite Functions");
    console.log("   2. Run seed scripts to add test data");
    console.log("   3. Start building the test UI");
  } catch (error) {
    console.error("\n❌ Error setting up collections:", error.message);
    process.exit(1);
  }
}

async function setupCollection(collectionId, config) {
  console.log(`\n📦 Setting up ${collectionId} collection...`);

  try {
    // Create collection
    await databases.createCollection(DATABASE_ID, collectionId, config.name, [
      sdk.Permission.read(sdk.Role.any()),
      sdk.Permission.create(sdk.Role.any()),
      sdk.Permission.update(sdk.Role.any()),
      sdk.Permission.delete(sdk.Role.any()),
    ]);
    console.log(`   ✓ Collection created`);
    await delay(2000);
  } catch (error) {
    if (error.code === 409) {
      console.log(`   ⚠️  Collection already exists, updating attributes...`);
    } else {
      throw error;
    }
  }

  // Create attributes
  for (const attr of config.attributes) {
    try {
      if (attr.type === "string") {
        await databases.createStringAttribute(
          DATABASE_ID,
          collectionId,
          attr.name,
          attr.size,
          attr.required,
        );
      } else if (attr.type === "integer") {
        await databases.createIntegerAttribute(
          DATABASE_ID,
          collectionId,
          attr.name,
          attr.required,
          attr.min,
          attr.max,
        );
      } else if (attr.type === "float") {
        await databases.createFloatAttribute(
          DATABASE_ID,
          collectionId,
          attr.name,
          attr.required,
        );
      } else if (attr.type === "boolean") {
        await databases.createBooleanAttribute(
          DATABASE_ID,
          collectionId,
          attr.name,
          attr.required,
        );
      } else if (attr.type === "datetime") {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          collectionId,
          attr.name,
          attr.required,
        );
      }
      console.log(`   ✓ ${attr.name} attribute created`);
      await delay(2000);
    } catch (error) {
      if (error.code === 409) {
        console.log(`   ⚠️  ${attr.name} already exists, skipping...`);
      } else {
        console.error(`   ✗ Error creating ${attr.name}:`, error.message);
      }
    }
  }

  // Wait for attributes to be ready
  console.log(`   ⏳ Waiting for attributes to be ready...`);
  await delay(5000);

  // Create indexes
  for (const index of config.indexes) {
    try {
      await databases.createIndex(
        DATABASE_ID,
        collectionId,
        index.key,
        index.type,
        index.attributes,
        index.orders || [],
      );
      console.log(`   ✓ ${index.key} index created`);
      await delay(2000);
    } catch (error) {
      if (error.code === 409) {
        console.log(`   ⚠️  ${index.key} already exists, skipping...`);
      } else {
        console.error(`   ✗ Error creating ${index.key}:`, error.message);
      }
    }
  }

  console.log(`✅ ${collectionId} setup complete`);
}

// Run the setup
setupAllCollections();
