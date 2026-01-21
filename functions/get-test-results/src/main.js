/**
 * Appwrite Function: Get Test Results
 * Retrieves and calculates test results for a completed test
 *
 * Expected payload:
 * {
 *   "testId": "TEST_123"
 * }
 */

import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    // Parse request body
    const payload = JSON.parse(req.body || "{}");
    const { testId } = payload;

    if (!testId) {
      return res.json(
        {
          success: false,
          error: "testId is required",
        },
        400,
      );
    }

    log(`Fetching results for test ${testId}`);

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Fetch all responses for this test
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      "USER_RESPONSES",
      [Query.equal("test_id", testId), Query.limit(1000)],
    );

    const responses = response.documents;

    if (responses.length === 0) {
      return res.json(
        {
          success: false,
          error: "No responses found for this test",
        },
        404,
      );
    }

    // Calculate results
    const totalQuestions = responses.length;
    const correctAnswers = responses.filter((r) => r.is_correct).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const totalTime = responses.reduce(
      (sum, r) => sum + (r.time_taken || 0),
      0,
    );

    // Subject breakdown
    const subjectBreakdown = {
      Physics: { correct: 0, total: 0, accuracy: 0 },
      Chemistry: { correct: 0, total: 0, accuracy: 0 },
      Biology: { correct: 0, total: 0, accuracy: 0 },
    };

    responses.forEach((r) => {
      const subject = r.subject;
      if (subject && subjectBreakdown[subject]) {
        subjectBreakdown[subject].total++;
        if (r.is_correct) {
          subjectBreakdown[subject].correct++;
        }
      }
    });

    // Calculate subject accuracies
    Object.keys(subjectBreakdown).forEach((subject) => {
      const data = subjectBreakdown[subject];
      data.accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
    });

    // Average time per question
    const avgTimePerQuestion =
      totalQuestions > 0 ? totalTime / totalQuestions : 0;

    // Get fastest and slowest questions
    const sortedByTime = [...responses].sort(
      (a, b) => a.time_taken - b.time_taken,
    );
    const fastestQuestion = sortedByTime[0];
    const slowestQuestion = sortedByTime[sortedByTime.length - 1];

    log(
      `Results calculated: ${correctAnswers}/${totalQuestions} correct (${accuracy.toFixed(1)}%)`,
    );

    return res.json({
      success: true,
      results: {
        testId,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        accuracy: parseFloat(accuracy.toFixed(2)),
        totalTime,
        avgTimePerQuestion: parseFloat(avgTimePerQuestion.toFixed(2)),
        subjectBreakdown,
        performance: {
          fastestQuestion: {
            questionId: fastestQuestion.question_id,
            timeTaken: fastestQuestion.time_taken,
          },
          slowestQuestion: {
            questionId: slowestQuestion.question_id,
            timeTaken: slowestQuestion.time_taken,
          },
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    error(`Error in get-test-results function: ${err.message}`);
    return res.json(
      {
        success: false,
        error: err.message,
      },
      500,
    );
  }
};
