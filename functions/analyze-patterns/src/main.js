/**
 * Appwrite Function: Analyze Patterns
 * Analyzes user's test responses using Groq AI to detect mistake patterns
 *
 * Expected payload:
 * {
 *   "userId": "user-123"
 * }
 */

import { Client, Databases, ID, Query } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    // Parse request body
    const payload = JSON.parse(req.body || "{}");
    const { userId } = payload;

    if (!userId) {
      return res.json(
        {
          success: false,
          error: "userId is required",
        },
        400,
      );
    }

    log(`Analyzing patterns for user ${userId}`);

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Fetch user's responses
    const responsesData = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      "USER_RESPONSES",
      [Query.equal("user_id", userId), Query.limit(500)],
    );

    const responses = responsesData.documents;

    if (responses.length < 5) {
      return res.json(
        {
          success: false,
          error:
            "Not enough data to analyze patterns. Complete at least 5 questions.",
        },
        400,
      );
    }

    log(`Found ${responses.length} responses to analyze`);

    // Fetch questions for context
    const questionIds = [...new Set(responses.map((r) => r.question_id))];
    const questions = await fetchQuestions(databases, questionIds);

    // Prepare data for AI analysis
    const analysisData = prepareAnalysisData(responses, questions);

    log("Sending data to Groq AI for pattern detection...");

    // Analyze with Groq AI
    const patterns = await analyzeWithAI(analysisData, userId);

    log(`AI detected ${patterns.length} patterns`);

    // Store patterns in database
    const storedPatterns = [];
    for (const pattern of patterns) {
      try {
        const doc = await databases.createDocument(
          process.env.APPWRITE_DATABASE_ID,
          "DETECTED_PATTERNS",
          ID.unique(),
          {
            user_id: userId,
            pattern_type: pattern.pattern_type,
            title: pattern.title,
            description: pattern.description,
            confidence: pattern.confidence,
            evidence: JSON.stringify(pattern.evidence),
            recommendation: pattern.recommendation,
            detected_at: new Date().toISOString(),
            is_resolved: false,
            subject_distribution: pattern.subject_distribution
              ? JSON.stringify(pattern.subject_distribution)
              : null,
          },
        );
        storedPatterns.push(doc);
      } catch (err) {
        error(`Failed to store pattern: ${err.message}`);
      }
    }

    log(`Stored ${storedPatterns.length} patterns in database`);

    return res.json({
      success: true,
      patterns: storedPatterns,
      count: storedPatterns.length,
    });
  } catch (err) {
    error(`Error in analyze-patterns function: ${err.message}`);
    return res.json(
      {
        success: false,
        error: err.message,
      },
      500,
    );
  }
};

/**
 * Fetch questions by IDs
 */
async function fetchQuestions(databases, questionIds) {
  const questions = {};

  // Fetch in batches to avoid query limits
  const batchSize = 25;
  for (let i = 0; i < questionIds.length; i += batchSize) {
    const batch = questionIds.slice(i, i + batchSize);

    try {
      const result = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        "QUESTIONS",
        [Query.equal("$id", batch)],
      );

      result.documents.forEach((q) => {
        questions[q.$id] = q;
      });
    } catch (err) {
      console.error("Error fetching questions batch:", err);
    }
  }

  return questions;
}

/**
 * Prepare data for AI analysis
 */
function prepareAnalysisData(responses, questions) {
  const incorrectResponses = responses.filter((r) => !r.is_correct);

  // Group by test
  const testGroups = {};
  responses.forEach((r) => {
    if (!testGroups[r.test_id]) {
      testGroups[r.test_id] = [];
    }
    testGroups[r.test_id].push(r);
  });

  // Calculate statistics
  const stats = {
    totalQuestions: responses.length,
    totalIncorrect: incorrectResponses.length,
    accuracy: (
      ((responses.length - incorrectResponses.length) / responses.length) *
      100
    ).toFixed(1),
    avgTimePerQuestion: (
      responses.reduce((sum, r) => sum + r.time_taken, 0) / responses.length
    ).toFixed(1),
  };

  // Subject breakdown
  const subjectStats = {};
  responses.forEach((r) => {
    if (!r.subject) return;
    if (!subjectStats[r.subject]) {
      subjectStats[r.subject] = { total: 0, incorrect: 0 };
    }
    subjectStats[r.subject].total++;
    if (!r.is_correct) {
      subjectStats[r.subject].incorrect++;
    }
  });

  // Prepare incorrect answers with context
  const incorrectAnswers = incorrectResponses.map((r) => {
    const question = questions[r.question_id];
    return {
      questionId: r.question_id,
      questionText: question?.question_text || "Question not found",
      subject: r.subject,
      selectedAnswer: r.selected_answer,
      correctAnswer: question?.correct_answer || "Unknown",
      timeTaken: r.time_taken,
      questionPosition: r.question_position,
      testDurationSoFar: r.test_duration_so_far,
      topic: question?.topic || "Unknown",
    };
  });

  return {
    stats,
    subjectStats,
    incorrectAnswers,
    testCount: Object.keys(testGroups).length,
  };
}

/**
 * Analyze patterns using Groq AI
 */
async function analyzeWithAI(data, userId) {
  const prompt = createAnalysisPrompt(data);

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are an expert NEET exam coach analyzing student mistake patterns. Identify behavioral patterns in errors and provide actionable recommendations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const aiData = await response.json();
  const content = aiData.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content received from AI");
  }

  return parseAIPatterns(content, userId);
}

/**
 * Create analysis prompt for AI
 */
function createAnalysisPrompt(data) {
  return `Analyze this NEET student's test performance and identify mistake patterns:

**Overall Statistics:**
- Total Questions: ${data.stats.totalQuestions}
- Incorrect Answers: ${data.stats.totalIncorrect}
- Accuracy: ${data.stats.accuracy}%
- Average Time per Question: ${data.stats.avgTimePerQuestion} seconds

**Subject Performance:**
${Object.entries(data.subjectStats)
  .map(
    ([subject, stats]) =>
      `- ${subject}: ${stats.incorrect}/${stats.total} incorrect (${((stats.incorrect / stats.total) * 100).toFixed(1)}%)`,
  )
  .join("\n")}

**Incorrect Answers (Sample):**
${data.incorrectAnswers
  .slice(0, 20)
  .map(
    (ans, i) =>
      `${i + 1}. [${ans.subject}] ${ans.questionText.substring(0, 100)}...
   - Selected: ${ans.selectedAnswer}, Correct: ${ans.correctAnswer}
   - Time: ${ans.timeTaken}s, Position: ${ans.questionPosition}, Topic: ${ans.topic}`,
  )
  .join("\n\n")}

**Task:**
Identify 2-4 behavioral mistake patterns (NOT content gaps). Look for:
- Time management issues (rushing, spending too long)
- Question position patterns (mistakes at start/end of test)
- Subject-specific behavioral patterns
- Consistency issues across tests

For each pattern, provide:
1. Pattern type (e.g., "rushing", "fatigue", "confusion")
2. Title (concise, student-friendly)
3. Description (2-3 sentences explaining the pattern)
4. Confidence score (0-100, based on evidence strength)
5. Evidence (3-5 specific examples from the data)
6. Recommendation (actionable advice to fix the pattern)
7. Subject distribution (if pattern affects specific subjects)

Format as JSON array:
[
  {
    "pattern_type": "rushing",
    "title": "Rushing Through Multi-Step Problems",
    "description": "You tend to answer complex questions too quickly, leading to careless mistakes. This is especially evident in Physics problems requiring multiple calculation steps.",
    "confidence": 85,
    "evidence": [
      "Answered 3 mechanics questions in under 30 seconds each",
      "Made calculation errors in 4 out of 5 rushed questions",
      "Accuracy drops to 40% when time taken < 35 seconds"
    ],
    "recommendation": "Slow down on multi-step problems. Aim for at least 60 seconds on calculation-heavy questions. Write down intermediate steps to avoid errors.",
    "subject_distribution": {
      "Physics": 5,
      "Chemistry": 2
    }
  }
]

Return ONLY the JSON array, no additional text.`;
}

/**
 * Parse AI response into pattern objects
 */
function parseAIPatterns(content, userId) {
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed)) {
      throw new Error("AI response is not an array");
    }

    return parsed.map((p) => ({
      pattern_type: p.pattern_type || "unknown",
      title: p.title || "Untitled Pattern",
      description: p.description || "No description provided",
      confidence: Math.min(100, Math.max(0, p.confidence || 50)),
      evidence: Array.isArray(p.evidence) ? p.evidence : [],
      recommendation: p.recommendation || "No recommendation provided",
      subject_distribution: p.subject_distribution || null,
    }));
  } catch (err) {
    throw new Error(`Failed to parse AI patterns: ${err.message}`);
  }
}
