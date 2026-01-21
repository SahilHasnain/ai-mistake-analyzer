/**
 * Appwrite Function: Record Answer
 * Records a user's answer to a question
 *
 * Expected payload:
 * {
 *   "userId": "user-123",
 *   "testId": "TEST_123",
 *   "questionId": "question-id",
 *   "selectedAnswer": "A",
 *   "correctAnswer": "B",
 *   "timeTaken": 45,
 *   "questionPosition": 1,
 *   "testDurationSoFar": 0.75,
 *   "subject": "Physics"
 * }
 */

import { Client, Databases, ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    // Parse request body
    const payload = JSON.parse(req.body || "{}");
    const {
      userId,
      testId,
      questionId,
      selectedAnswer,
      correctAnswer,
      timeTaken,
      questionPosition,
      testDurationSoFar,
      subject,
    } = payload;

    // Validate required fields
    if (
      !userId ||
      !testId ||
      !questionId ||
      !selectedAnswer ||
      !correctAnswer
    ) {
      return res.json(
        {
          success: false,
          error: "Missing required fields",
        },
        400,
      );
    }

    log(`Recording answer for user ${userId}, question ${questionId}`);

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Determine if answer is correct
    const isCorrect =
      selectedAnswer.toUpperCase() === correctAnswer.toUpperCase();

    // Create response document
    const response = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      "USER_RESPONSES",
      ID.unique(),
      {
        user_id: userId,
        question_id: questionId,
        selected_answer: selectedAnswer.toUpperCase(),
        is_correct: isCorrect,
        time_taken: timeTaken || 0,
        test_id: testId,
        timestamp: new Date().toISOString(),
        question_position: questionPosition || 1,
        test_duration_so_far: testDurationSoFar || 0,
        subject: subject || null,
      },
    );

    log(`Answer recorded successfully: ${isCorrect ? "Correct" : "Incorrect"}`);

    return res.json({
      success: true,
      response: {
        id: response.$id,
        isCorrect,
        selectedAnswer: selectedAnswer.toUpperCase(),
        correctAnswer: correctAnswer.toUpperCase(),
      },
    });
  } catch (err) {
    error(`Error in record-answer function: ${err.message}`);
    return res.json(
      {
        success: false,
        error: err.message,
      },
      500,
    );
  }
};
