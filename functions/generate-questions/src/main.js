/**
 * Appwrite Function: Generate Questions
 * Generates NEET questions using Groq AI and stores them in database
 *
 * Expected payload:
 * {
 *   "subject": "Physics" | "Chemistry" | "Biology" | "Mixed",
 *   "count": 10,
 *   "difficulty": "Easy" | "Medium" | "Hard"
 * }
 */

import { Client, Databases, ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    log("[DEBUG] Function invoked");
    
    // Handle both string and object bodies
    let bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    log(`[DEBUG] Request body: ${bodyStr}`);

    // Parse request body - handle if already an object
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { subject = "Mixed", count = 10, difficulty = "Medium" } = payload;

    log(
      `[DEBUG] Parsed payload - subject: ${subject}, count: ${count}, difficulty: ${difficulty}`,
    );
    log(`Generating ${count} ${difficulty} questions for ${subject}`);

    // Initialize Appwrite client
    log("[DEBUG] Initializing Appwrite client");
    log(`[DEBUG] APPWRITE_ENDPOINT: ${process.env.APPWRITE_ENDPOINT}`);
    log(
      `[DEBUG] APPWRITE_FUNCTION_PROJECT_ID: ${process.env.APPWRITE_FUNCTION_PROJECT_ID}`,
    );
    log(`[DEBUG] GROQ_API_KEY exists: ${!!process.env.GROQ_API_KEY}`);

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    log("[DEBUG] Appwrite client initialized");

    // Generate questions using Groq AI
    log("[DEBUG] Starting AI question generation");
    const questions = await generateQuestionsWithAI(
      subject,
      count,
      difficulty,
      log,
      error,
    );
    log(`[DEBUG] Generated ${questions.length} questions from AI`);
    log(`Generated ${questions.length} questions from AI`);

    // Store questions in database
    log(
      `[DEBUG] Attempting to store ${questions.length} questions in database`,
    );
    const storedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      try {
        log(
          `[DEBUG] Storing question ${i + 1}: ${question.question_text.substring(0, 50)}...`,
        );
        const doc = await databases.createDocument(
          process.env.APPWRITE_DATABASE_ID,
          "QUESTIONS",
          ID.unique(),
          question,
        );
        log(`[DEBUG] Question ${i + 1} stored successfully`);
        storedQuestions.push(doc);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        error(`Failed to store question ${i + 1}: ${errMsg}`);
      }
    }

    log(`[DEBUG] Stored ${storedQuestions.length} questions in database`);
    log(`Stored ${storedQuestions.length} questions in database`);

    return res.json({
      success: true,
      questions: storedQuestions,
      count: storedQuestions.length,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(`Error in generate-questions function: ${errorMessage}`);
    return res.json(
      {
        success: false,
        error: errorMessage,
      },
      500,
    );
  }
};

/**
 * Generate questions using Groq AI
 */
async function generateQuestionsWithAI(subject, count, difficulty, log, error) {
  try {
    log(`[DEBUG] Creating prompt for ${count} ${subject} questions`);
    const prompt = createPrompt(subject, count, difficulty);
    log(`[DEBUG] Prompt created (length: ${prompt.length})`);

    log(`[DEBUG] Calling Groq API endpoint`);
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
                "You are an expert NEET exam question creator. Generate high-quality multiple-choice questions following the NEET pattern.",
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

    log(`[DEBUG] Groq API response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      log(`[DEBUG] Groq API error response: ${errorText}`);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    log(`[DEBUG] Groq response parsed successfully`);
    log(
      `[DEBUG] Response structure - choices: ${data.choices ? "present" : "missing"}`,
    );

    const content = data.choices[0]?.message?.content;

    if (!content) {
      log(
        `[DEBUG] No content in Groq response. Full response: ${JSON.stringify(data).substring(0, 500)}`,
      );
      throw new Error("No content received from AI");
    }

    log(`[DEBUG] Received content from AI (length: ${content.length})`);
    return parseAIResponse(content, subject, log, error);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    log(`[DEBUG] Error in generateQuestionsWithAI: ${errMsg}`);
    throw err;
  }
}

/**
 * Create prompt for AI
 */
function createPrompt(subject, count, difficulty) {
  const subjectInfo =
    subject === "Mixed" ? "Mix of Physics, Chemistry, and Biology" : subject;

  return `Generate ${count} NEET-style multiple choice questions for ${subjectInfo} at ${difficulty} difficulty level.

For each question, provide:
1. Question text (clear and concise)
2. Four options (A, B, C, D)
3. Correct answer (A, B, C, or D)
4. Subject (Physics, Chemistry, or Biology)
5. Topic/chapter name

Format your response as a JSON array like this:
[
  {
    "question_text": "What is the SI unit of force?",
    "option_a": "Newton",
    "option_b": "Joule",
    "option_c": "Watt",
    "option_d": "Pascal",
    "correct_answer": "A",
    "subject": "Physics",
    "difficulty": "Medium",
    "topic": "Units and Measurements"
  }
]

Requirements:
- Questions should be NEET exam standard
- Options should be plausible and not obviously wrong
- Cover important topics from the NEET syllabus
- Ensure correct answer is accurate
- Return ONLY the JSON array, no additional text`;
}

/**
 * Parse AI response
 */
function parseAIResponse(content, requestedSubject, log, error) {
  try {
    log(`[DEBUG] Parsing AI response (content length: ${content.length})`);
    log(`[DEBUG] Content preview: ${content.substring(0, 200)}...`);

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      log(`[DEBUG] No JSON array found. Full content: ${content}`);
      throw new Error("No JSON array found in AI response");
    }

    log(`[DEBUG] JSON match found (length: ${jsonMatch[0].length})`);
    const parsed = JSON.parse(jsonMatch[0]);
    log(`[DEBUG] JSON parsed successfully`);

    if (!Array.isArray(parsed)) {
      log(`[DEBUG] Parsed data is not an array, type: ${typeof parsed}`);
      throw new Error("AI response is not an array");
    }

    log(`[DEBUG] Parsed ${parsed.length} questions from AI response`);

    const questions = parsed.map((q, index) => ({
      question_text: q.question_text || `Question ${index + 1}`,
      option_a: q.option_a || "Option A",
      option_b: q.option_b || "Option B",
      option_c: q.option_c || "Option C",
      option_d: q.option_d || "Option D",
      correct_answer: (q.correct_answer || "A").toUpperCase(),
      subject: q.subject || requestedSubject,
      difficulty: q.difficulty || "Medium",
      topic: q.topic || undefined,
    }));

    log(`[DEBUG] Successfully parsed ${questions.length} questions`);
    return questions;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log(`[DEBUG] Error parsing AI response: ${errorMessage}`);
    throw new Error(`Failed to parse AI response: ${errorMessage}`);
  }
}
