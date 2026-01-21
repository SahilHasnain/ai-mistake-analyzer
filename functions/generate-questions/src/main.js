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
    // Parse request body
    const payload = JSON.parse(req.body || "{}");
    const { subject = "Mixed", count = 10, difficulty = "Medium" } = payload;

    log(`Generating ${count} ${difficulty} questions for ${subject}`);

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Generate questions using Groq AI
    const questions = await generateQuestionsWithAI(subject, count, difficulty);
    log(`Generated ${questions.length} questions from AI`);

    // Store questions in database
    const storedQuestions = [];
    for (const question of questions) {
      try {
        const doc = await databases.createDocument(
          process.env.APPWRITE_DATABASE_ID,
          "QUESTIONS",
          ID.unique(),
          question,
        );
        storedQuestions.push(doc);
      } catch (err) {
        error(`Failed to store question: ${err.message}`);
      }
    }

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
async function generateQuestionsWithAI(subject, count, difficulty) {
  const prompt = createPrompt(subject, count, difficulty);

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

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content received from AI");
  }

  return parseAIResponse(content, subject);
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
function parseAIResponse(content, requestedSubject) {
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

    return parsed.map((q, index) => ({
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
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse AI response: ${errorMessage}`);
  }
}
