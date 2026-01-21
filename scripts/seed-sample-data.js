/**
 * Seed Sample Data Script
 * Populates USER_RESPONSES with sample test data for testing the Pattern Analyzer
 *
 * Run with: node scripts/seed-sample-data.js
 */

const sdk = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new sdk.Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_SECRET_KEY);

const databases = new sdk.Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const RESPONSES_COLLECTION_ID = "USER_RESPONSES";
const USER_ID = "test-user-123";

// Sample test data simulating a student who:
// 1. Rushes through questions (low time_taken)
// 2. Makes mistakes on multi-step problems
// 3. Struggles with Physics more than other subjects
const sampleResponses = [
  // Test 1 - Physics (rushed, many mistakes)
  {
    user_id: USER_ID,
    question_id: "PHY_001",
    selected_answer: "B",
    is_correct: false,
    time_taken: 25, // Too fast for complex question
    test_id: "TEST_001",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    question_position: 1,
    test_duration_so_far: 0.42,
    subject: "Physics",
  },
  {
    user_id: USER_ID,
    question_id: "PHY_002",
    selected_answer: "A",
    is_correct: false,
    time_taken: 30,
    test_id: "TEST_001",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 2,
    test_duration_so_far: 0.92,
    subject: "Physics",
  },
  {
    user_id: USER_ID,
    question_id: "PHY_003",
    selected_answer: "C",
    is_correct: true,
    time_taken: 90,
    test_id: "TEST_001",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 3,
    test_duration_so_far: 2.42,
    subject: "Physics",
  },

  // Test 1 - Chemistry (better performance)
  {
    user_id: USER_ID,
    question_id: "CHEM_001",
    selected_answer: "B",
    is_correct: true,
    time_taken: 60,
    test_id: "TEST_001",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 4,
    test_duration_so_far: 3.42,
    subject: "Chemistry",
  },
  {
    user_id: USER_ID,
    question_id: "CHEM_002",
    selected_answer: "D",
    is_correct: true,
    time_taken: 75,
    test_id: "TEST_001",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 5,
    test_duration_so_far: 4.67,
    subject: "Chemistry",
  },

  // Test 1 - Biology (mixed performance)
  {
    user_id: USER_ID,
    question_id: "BIO_001",
    selected_answer: "A",
    is_correct: true,
    time_taken: 55,
    test_id: "TEST_001",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 6,
    test_duration_so_far: 5.59,
    subject: "Biology",
  },
  {
    user_id: USER_ID,
    question_id: "BIO_002",
    selected_answer: "C",
    is_correct: false,
    time_taken: 20, // Rushed
    test_id: "TEST_001",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 7,
    test_duration_so_far: 5.92,
    subject: "Biology",
  },

  // Test 2 - Similar patterns (5 days ago)
  {
    user_id: USER_ID,
    question_id: "PHY_004",
    selected_answer: "A",
    is_correct: false,
    time_taken: 28,
    test_id: "TEST_002",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 1,
    test_duration_so_far: 0.47,
    subject: "Physics",
  },
  {
    user_id: USER_ID,
    question_id: "PHY_005",
    selected_answer: "D",
    is_correct: false,
    time_taken: 35,
    test_id: "TEST_002",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 2,
    test_duration_so_far: 1.05,
    subject: "Physics",
  },
  {
    user_id: USER_ID,
    question_id: "CHEM_003",
    selected_answer: "B",
    is_correct: true,
    time_taken: 65,
    test_id: "TEST_002",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 3,
    test_duration_so_far: 2.13,
    subject: "Chemistry",
  },
  {
    user_id: USER_ID,
    question_id: "BIO_003",
    selected_answer: "C",
    is_correct: true,
    time_taken: 50,
    test_id: "TEST_002",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 4,
    test_duration_so_far: 2.96,
    subject: "Biology",
  },

  // Test 3 - Recent test (2 days ago)
  {
    user_id: USER_ID,
    question_id: "PHY_006",
    selected_answer: "B",
    is_correct: false,
    time_taken: 22,
    test_id: "TEST_003",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 1,
    test_duration_so_far: 0.37,
    subject: "Physics",
  },
  {
    user_id: USER_ID,
    question_id: "CHEM_004",
    selected_answer: "A",
    is_correct: true,
    time_taken: 70,
    test_id: "TEST_003",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 2,
    test_duration_so_far: 1.54,
    subject: "Chemistry",
  },
  {
    user_id: USER_ID,
    question_id: "BIO_004",
    selected_answer: "D",
    is_correct: true,
    time_taken: 60,
    test_id: "TEST_003",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 3,
    test_duration_so_far: 2.54,
    subject: "Biology",
  },
  {
    user_id: USER_ID,
    question_id: "PHY_007",
    selected_answer: "C",
    is_correct: false,
    time_taken: 30,
    test_id: "TEST_003",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    question_position: 4,
    test_duration_so_far: 3.04,
    subject: "Physics",
  },
];

async function seedData() {
  console.log("🌱 Starting to seed sample data...\n");

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const response of sampleResponses) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          RESPONSES_COLLECTION_ID,
          sdk.ID.unique(),
          response,
        );
        successCount++;
        console.log(
          `✓ Created response for ${response.question_id} (${response.subject})`,
        );
      } catch (error) {
        errorCount++;
        console.error(
          `✗ Failed to create response for ${response.question_id}:`,
          error.message,
        );
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Success: ${successCount} responses`);
    console.log(`   Errors: ${errorCount} responses`);
    console.log(`\n📊 Summary:`);
    console.log(`   Total Questions: ${sampleResponses.length}`);
    console.log(
      `   Correct: ${sampleResponses.filter((r) => r.is_correct).length}`,
    );
    console.log(
      `   Incorrect: ${sampleResponses.filter((r) => !r.is_correct).length}`,
    );
    console.log(
      `   Accuracy: ${((sampleResponses.filter((r) => r.is_correct).length / sampleResponses.length) * 100).toFixed(1)}%`,
    );
    console.log(`\n💡 Now you can:`);
    console.log(`   1. Open the app and see stats on the dashboard`);
    console.log(`   2. Tap "Analyze" to trigger AI pattern detection`);
    console.log(`   3. View detected patterns`);
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    process.exit(1);
  }
}

seedData();
