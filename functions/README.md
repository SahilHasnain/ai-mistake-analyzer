# Appwrite Functions

This directory contains Appwrite Functions for the NEET Pattern Analyzer backend.

## Functions Overview

### 1. **generate-questions** 🎯

Generates NEET questions using Groq AI and stores them in the database.

**Endpoint:** `POST /v1/functions/{functionId}/executions`

**Payload:**

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

- Runtime: Node.js 18.0
- Timeout: 300 seconds (AI generation takes time)
- Memory: 512 MB
- Requires: GROQ_API_KEY

---

### 2. **analyze-patterns** 🧠

Analyzes user's test responses using Groq AI to detect behavioral mistake patterns.

**Endpoint:** `POST /v1/functions/{functionId}/executions`

**Payload:**

```json
{
  "userId": "user-123"
}
```

**Response:**

```json
{
  "success": true,
  "patterns": [
    {
      "$id": "pattern-id",
      "user_id": "user-123",
      "pattern_type": "rushing",
      "title": "Rushing Through Multi-Step Problems",
      "description": "You tend to answer complex questions too quickly...",
      "confidence": 85,
      "evidence": "[\"...\", \"...\"]",
      "recommendation": "Slow down on multi-step problems...",
      "detected_at": "2024-01-20T10:30:00.000Z",
      "is_resolved": false,
      "subject_distribution": "{\"Physics\": 5, \"Chemistry\": 2}"
    }
  ],
  "count": 3
}
```

**Configuration:**

- Runtime: Node.js 18.0
- Timeout: 300 seconds (AI analysis takes time)
- Memory: 512 MB
- Requires: GROQ_API_KEY

**Note:** Requires at least 5 user responses in the database to analyze patterns.

---

## Frontend Operations (No Functions Needed)

The following operations are handled **directly from the frontend** using Appwrite SDK:

### ✅ Record Answer

**Frontend Service:** `services/testService.ts` → `recordAnswer()`

Directly creates document in `USER_RESPONSES` collection.

### ✅ Get Test Results

**Frontend Service:** `services/testService.ts` → `getTestResults()`

Directly queries `USER_RESPONSES` collection and calculates statistics.

---

## Deployment Steps

### 1. Install Appwrite CLI

```bash
npm install -g appwrite
```

### 2. Login to Appwrite

```bash
appwrite login
```

### 3. Deploy Functions

Deploy each function individually:

```bash
# Deploy generate-questions
cd functions/generate-questions
appwrite deploy function

# Deploy analyze-patterns
cd ../analyze-patterns
appwrite deploy function
```

### 4. Set Environment Variables

For **BOTH functions**, set these in Appwrite Console:

```env
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_FUNCTION_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key-with-database-permissions
APPWRITE_DATABASE_ID=your-database-id
GROQ_API_KEY=your-groq-api-key
```

### 5. Update Frontend Environment Variables

Add to your `.env.local`:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id

# Function URLs (replace YOUR_FUNCTION_ID with actual IDs)
EXPO_PUBLIC_GENERATE_QUESTIONS_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/{function-id}/executions
EXPO_PUBLIC_ANALYZE_PATTERNS_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/{function-id}/executions
```

---

## Testing Functions

### Test generate-questions

**In Appwrite Console:**

```json
{
  "subject": "Physics",
  "count": 5,
  "difficulty": "Medium"
}
```

**Expected:** 5 Physics questions stored in QUESTIONS collection

### Test analyze-patterns

**In Appwrite Console:**

```json
{
  "userId": "test-user-123"
}
```

**Expected:** 2-4 patterns detected and stored in DETECTED_PATTERNS collection

**Note:** Requires at least 5 responses in USER_RESPONSES for this user

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
└─────────────────────────────────────────────────────────┘
         │                                    │
         │ Function Calls                     │ Direct DB Access
         ↓                                    ↓
┌──────────────────────────┐    ┌──────────────────────────┐
│  Appwrite Functions      │    │  Appwrite Database       │
│  1. generate-questions   │    │  - Record answers        │
│  2. analyze-patterns     │    │  - Get test results      │
└──────────────────────────┘    └──────────────────────────┘
         │                                    │
         └────────────────┬───────────────────┘
                          ↓
              ┌──────────────────────┐
              │  Appwrite Database   │
              │  - QUESTIONS         │
              │  - USER_RESPONSES    │
              │  - DETECTED_PATTERNS │
              └──────────────────────┘
```

---

## Troubleshooting

### "Not enough data to analyze patterns"

- User needs at least 5 answered questions
- Run some tests first before analyzing

### "Groq API error"

- Check GROQ_API_KEY is set correctly in function environment
- Verify API key has credits
- Check API rate limits

### Function timeout

- Increase timeout in Appwrite Console
- For AI functions, use 300 seconds minimum

### "Database permission error"

- Ensure API key has read/write permissions
- Check collection permissions allow function access
- For frontend operations, ensure collection permissions allow client access

---

## Security Notes

✅ **Groq API key** - Stored securely in function environment variables
✅ **No client-side secrets** - Frontend only calls function endpoints
✅ **Database operations** - Frontend uses Appwrite SDK with proper permissions
✅ **Input validation** - Functions validate all inputs before processing

---

## Next Steps

1. ✅ Deploy both functions to Appwrite
2. ✅ Configure environment variables
3. ✅ Test functions in Appwrite Console
4. ✅ Update frontend .env.local with function URLs
5. ⏭️ Build test-taking UI
6. ⏭️ Test end-to-end flow
