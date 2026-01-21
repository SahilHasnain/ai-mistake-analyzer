/**
 * Questions Collection Setup Script
 * Creates the QUESTIONS collection for storing NEET test questions
 *
 * Run with: node scripts/setup-questions-collection.js
 */

const sdk = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new sdk.Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_SECRET_KEY);

const databases = new sdk.Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const QUESTIONS_COLLECTION_ID = "QUESTIONS";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setupQuestionsCollection() {
  console.log("📦 Creating QUESTIONS collection...");

  try {
    // Create collection
    await databases.createCollection(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "Questions",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ],
    );
    console.log("   ✓ Collection created");
    await delay(2000);

    // Create attributes
    await databases.createStringAttribute(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "question_text",
      5000,
      true,
    );
    console.log("   ✓ question_text attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "option_a",
      500,
      true,
    );
    console.log("   ✓ option_a attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "option_b",
      500,
      true,
    );
    console.log("   ✓ option_b attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "option_c",
      500,
      true,
    );
    console.log("   ✓ option_c attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "option_d",
      500,
      true,
    );
    console.log("   ✓ option_d attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "correct_answer",
      1,
      true,
    );
    console.log("   ✓ correct_answer attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "subject",
      50,
      true,
    );
    console.log("   ✓ subject attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "difficulty",
      20,
      true,
    );
    console.log("   ✓ difficulty attribute created");
    await delay(2000);

    await databases.createStringAttribute(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "topic",
      200,
      false,
    );
    console.log("   ✓ topic attribute created");

    console.log("   ⏳ Waiting for attributes to be ready...");
    await delay(5000);

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "subject_idx",
      "key",
      ["subject"],
    );
    console.log("   ✓ subject index created");
    await delay(2000);

    await databases.createIndex(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID,
      "difficulty_idx",
      "key",
      ["difficulty"],
    );
    console.log("   ✓ difficulty index created");

    console.log("✅ QUESTIONS collection setup complete\n");
  } catch (error) {
    if (error.code === 409) {
      console.log("   ⚠️  Collection already exists, skipping...\n");
    } else {
      throw error;
    }
  }
}

setupQuestionsCollection();
