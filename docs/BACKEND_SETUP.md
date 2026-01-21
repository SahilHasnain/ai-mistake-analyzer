# Backend Setup Guide - Appwrite Functions

## Overview

The NEET Pattern Analyzer uses **Appwrite Functions** for all backend logic:

- ✅ AI Question Generation (Groq AI)
- ✅ Answer Recording
- ✅ Test Results Calculation

**No frontend API keys needed** - all sensitive operations happen in secure backend functions.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
│  - Test UI                                              │
│  - Pattern Analyzer UI                                  │
└─────────────────────────────────────────────────────────┘
                        ↓ HTTP Calls
┌─────────────────────────────────────────────────────────┐
│              Appwrite Functions (Backend)                │
│  1. generate-questions → Groq AI → Store in DB          │
│  2. record-answer → Validate → Store in DB              │
│  3. get-test-results → Calculate → Return stats         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  Appwrite Database                       │
│  - QUESTIONS collection                                 │
│  - USER_RESPONSES collection                            │
│  - DETECTED_PATTERNS collection                         │
└─────────────────────────────────────────────────────────┘
```

## Setup Steps

### 1. Create Collections

Run the setup scripts:

```bash
# Create QUESTIONS collection
node scripts/setup-questions-collection.js

# Create USER_RESPONSES and DETECTED_PATTERNS (if not done)
node scripts/setup-appwrite-collections.js
```

### 2. Deploy Appwrite Functions

#### Option A: Using Appwrite CLI (Recommended)

```bash
# Install CLI
npm install -g appwrite

# Login
appwrite login

# Deploy each function
cd functions/generate-questions
appwrite deploy function

cd ../record-answer
appwrite deploy function

cd ../get-test-results
appwrite deploy function
```

#### Option B: Manual Upload via Console

1. Go to Appwrite Console → Functions
2. Create new function
3. Choose **Node.js 18.0** runtime
4. Zip the function folder (include `src/` and `package.json`)
5. Upload and deploy

### 3. Configure Function Environment Variables

For **ALL functions**, set these in Appwrite Console:

```env
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_FUNCTION_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key-with-database-permissions
APPWRITE_DATABASE_ID=your-database-id
```

For **generate-questions only**, also add:

```env
GROQ_API_KEY=your-groq-api-key
```

### 4. Get Function URLs

After deploying, get the execution URLs:

1. Go to each function in Appwrite Console
2. Copy the execution endpoint (looks like: `https://sgp.cloud.appwrite.io/v1/functions/{functionId}/executions`)
3. Note down the function IDs

### 5. Update Frontend Environment Variables

Add to `.env.local`:

```env
# Existing variables...
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id

# New function URLs
EXPO_PUBLIC_GENERATE_QUESTIONS_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/{function-id}/executions
EXPO_PUBLIC_RECORD_ANSWER_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/{function-id}/executions
EXPO_PUBLIC_GET_TEST_RESULTS_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/{function-id}/executions
```

## Function Details

### 1. generate-questions

**Purpose:** Generate NEET questions using Groq AI

**Request:**

```json
{
  "subject": "Physics",
  "count": 10,
  "difficulty": "Medium"
}
```

**Response:**

```json
{
  "success": true,
  "questions": [
    {
      "$id": "question-id",
      "question_text": "What is...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "A",
      "subject": "Physics",
      "difficulty": "Medium",
      "topic": "Mechanics"
    }
  ],
  "count": 10
}
```

**Configuration:**

- Timeout: 300 seconds (AI generation takes time)
- Memory: 512 MB

### 2. record-answer

**Purpose:** Record user's answer to a question

**Request:**

```json
{
  "userId": "user-123",
  "testId": "TEST_123",
  "questionId": "question-id",
  "selectedAnswer": "A",
  "correctAnswer": "B",
  "timeTaken": 45,
  "questionPosition": 1,
  "testDurationSoFar": 0.75,
  "subject": "Physics"
}
```

**Response:**

```json
{
  "success": true,
  "response": {
    "id": "response-id",
    "isCorrect": false,
    "selectedAnswer": "A",
    "correctAnswer": "B"
  }
}
```

**Configuration:**

- Timeout: 15 seconds
- Memory: 256 MB

### 3. get-test-results

**Purpose:** Calculate and return test results

**Request:**

```json
{
  "testId": "TEST_123"
}
```

**Response:**

```json
{
  "success": true,
  "results": {
    "testId": "TEST_123",
    "totalQuestions": 10,
    "correctAnswers": 7,
    "incorrectAnswers": 3,
    "accuracy": 70.0,
    "totalTime": 450,
    "avgTimePerQuestion": 45.0,
    "subjectBreakdown": {
      "Physics": { "correct": 3, "total": 4, "accuracy": 75.0 },
      "Chemistry": { "correct": 2, "total": 3, "accuracy": 66.7 },
      "Biology": { "correct": 2, "total": 3, "accuracy": 66.7 }
    }
  }
}
```

**Configuration:**

- Timeout: 30 seconds
- Memory: 256 MB

## Testing Functions

### Test in Appwrite Console

1. Go to Functions → Select function
2. Click "Execute"
3. Enter test payload
4. View response and logs

### Test from Frontend

The frontend services are already configured to call these functions:

```typescript
// Generate questions
import { generateQuestions } from "./services/questionGenerator";
const questions = await generateQuestions({
  subject: "Physics",
  count: 10,
  difficulty: "Medium",
});

// Record answer
import { recordAnswer } from "./services/testService";
await recordAnswer({
  userId: "user-123",
  testId: "TEST_123",
  question: questionObject,
  selectedAnswer: "A",
  timeTaken: 45,
  questionPosition: 1,
  testDurationSoFar: 0.75,
});

// Get results
import { getTestResults } from "./services/testService";
const results = await getTestResults("TEST_123");
```

## Security

✅ **API keys are secure** - stored only in Appwrite Functions environment variables
✅ **No client-side secrets** - frontend only calls function endpoints
✅ **Database permissions** - functions use API key with proper permissions
✅ **Validation** - functions validate all inputs before processing

## Troubleshooting

### "Function URL not configured"

- Check `.env.local` has all function URLs
- Restart Expo dev server after updating `.env.local`

### "Groq API error"

- Verify GROQ_API_KEY is set in function environment
- Check Groq API has sufficient credits
- Test Groq API key directly

### "Database permission error"

- Ensure API key has database read/write permissions
- Check collection permissions allow function access

### Function timeout

- Increase timeout in Appwrite Console
- For generate-questions, use 300 seconds minimum

### "Module not found" in function

- Ensure `package.json` is included in deployment
- Check `"type": "module"` is set in package.json
- Redeploy function

## Next Steps

After backend setup:

1. ✅ Collections created
2. ✅ Functions deployed
3. ✅ Environment variables configured
4. ⏭️ Build test-taking UI (frontend)
5. ⏭️ Test end-to-end flow

See `functions/README.md` for detailed function documentation.
