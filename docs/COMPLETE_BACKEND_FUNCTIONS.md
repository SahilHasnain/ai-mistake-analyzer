# Complete Backend Functions - All 4 Functions

## ✅ All Appwrite Functions Created

You now have **4 complete Appwrite Functions** for your NEET Pattern Analyzer:

### 1. **generate-questions** 🎯

- **Purpose:** Generate NEET questions using Groq AI
- **Location:** `functions/generate-questions/`
- **AI Model:** Llama 3.3 70B via Groq
- **Stores:** Questions in QUESTIONS collection

### 2. **record-answer** ✍️

- **Purpose:** Record user's answer to a question
- **Location:** `functions/record-answer/`
- **Validates:** Answer correctness
- **Stores:** Responses in USER_RESPONSES collection

### 3. **get-test-results** 📊

- **Purpose:** Calculate test statistics and results
- **Location:** `functions/get-test-results/`
- **Calculates:** Accuracy, time stats, subject breakdown
- **Returns:** Complete test performance data

### 4. **analyze-patterns** 🧠 (NEW!)

- **Purpose:** Detect behavioral mistake patterns using AI
- **Location:** `functions/analyze-patterns/`
- **AI Model:** Llama 3.3 70B via Groq
- **Analyzes:** User responses to find patterns
- **Stores:** Patterns in DETECTED_PATTERNS collection

---

## 📋 Deployment Checklist

### Step 1: Deploy All Functions

```bash
# Deploy generate-questions
cd functions/generate-questions
appwrite deploy function

# Deploy record-answer
cd ../record-answer
appwrite deploy function

# Deploy get-test-results
cd ../get-test-results
appwrite deploy function

# Deploy analyze-patterns
cd ../analyze-patterns
appwrite deploy function
```

### Step 2: Set Environment Variables

**For ALL functions:**

```env
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_FUNCTION_PROJECT_ID=696f7a54001b30998f58
APPWRITE_API_KEY=your-api-key-with-database-permissions
APPWRITE_DATABASE_ID=696f7a7c0019e249f531
```

**For generate-questions AND analyze-patterns:**

```env
GROQ_API_KEY=your-groq-api-key
```

### Step 3: Configure Function Settings

| Function           | Timeout | Memory | Requires Groq |
| ------------------ | ------- | ------ | ------------- |
| generate-questions | 300s    | 512 MB | ✅ Yes        |
| record-answer      | 15s     | 256 MB | ❌ No         |
| get-test-results   | 30s     | 256 MB | ❌ No         |
| analyze-patterns   | 300s    | 512 MB | ✅ Yes        |

### Step 4: Update Frontend Environment Variables

Update your `.env.local`:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=696f7a54001b30998f58
EXPO_PUBLIC_APPWRITE_DATABASE_ID=696f7a7c0019e249f531

# Function URLs (replace YOUR_FUNCTION_ID with actual IDs)
EXPO_PUBLIC_GENERATE_QUESTIONS_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions
EXPO_PUBLIC_RECORD_ANSWER_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions
EXPO_PUBLIC_GET_TEST_RESULTS_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions
EXPO_PUBLIC_ANALYZE_PATTERNS_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions
```

---

## 🔄 Complete Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                  1. START TEST                          │
│  User selects subject → Frontend calls                  │
│  generate-questions function                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         generate-questions Function                      │
│  → Calls Groq AI to generate questions                  │
│  → Stores in QUESTIONS collection                       │
│  → Returns questions to frontend                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  2. TAKE TEST                           │
│  User answers each question → Frontend calls            │
│  record-answer function for each answer                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│            record-answer Function                        │
│  → Validates answer correctness                         │
│  → Stores in USER_RESPONSES collection                  │
│  → Returns isCorrect status                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  3. VIEW RESULTS                        │
│  Test ends → Frontend calls                             │
│  get-test-results function                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│          get-test-results Function                       │
│  → Fetches all responses for test                       │
│  → Calculates accuracy, time stats                      │
│  → Returns complete results                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  4. ANALYZE PATTERNS                    │
│  User taps "Analyze" → Frontend calls                   │
│  analyze-patterns function                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│          analyze-patterns Function                       │
│  → Fetches all user responses                           │
│  → Calls Groq AI to detect patterns                     │
│  → Stores patterns in DETECTED_PATTERNS                 │
│  → Returns detected patterns                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  5. VIEW PATTERNS                       │
│  Dashboard shows detected patterns                       │
│  User can view details and mark as resolved             │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Each Function

### Test generate-questions

**In Appwrite Console:**

```json
{
  "subject": "Physics",
  "count": 5,
  "difficulty": "Medium"
}
```

**Expected:** 5 Physics questions stored in database

### Test record-answer

**In Appwrite Console:**

```json
{
  "userId": "test-user-123",
  "testId": "TEST_001",
  "questionId": "question-id-from-db",
  "selectedAnswer": "A",
  "correctAnswer": "B",
  "timeTaken": 45,
  "questionPosition": 1,
  "testDurationSoFar": 0.75,
  "subject": "Physics"
}
```

**Expected:** Response stored in USER_RESPONSES, returns isCorrect: false

### Test get-test-results

**In Appwrite Console:**

```json
{
  "testId": "TEST_001"
}
```

**Expected:** Complete test statistics with accuracy, time, subject breakdown

### Test analyze-patterns

**In Appwrite Console:**

```json
{
  "userId": "test-user-123"
}
```

**Expected:** 2-4 patterns detected and stored in DETECTED_PATTERNS

**Note:** Requires at least 5 responses in USER_RESPONSES for this user

---

## 🎯 What's Next?

Now that all backend functions are ready:

1. ✅ **Backend Complete** - All 4 functions created
2. ✅ **Frontend Services Updated** - Services call the functions
3. ⏭️ **Build Test UI** - Create test-taking screens
4. ⏭️ **Test End-to-End** - Complete flow from test to patterns

---

## 🔐 Security Notes

- ✅ Groq API key stored securely in function environment
- ✅ No API keys exposed to frontend
- ✅ All database operations happen in backend
- ✅ Functions validate all inputs
- ✅ User data isolated by userId

---

## 📚 Function Documentation

See `functions/README.md` for detailed API documentation for each function.

## 🐛 Troubleshooting

### "Not enough data to analyze patterns"

- User needs at least 5 answered questions
- Run some tests first before analyzing

### "Groq API error"

- Check GROQ_API_KEY is set correctly
- Verify API key has credits
- Check API rate limits

### Function timeout

- Increase timeout in Appwrite Console
- For AI functions (generate-questions, analyze-patterns), use 300 seconds

### "Database permission error"

- Ensure API key has read/write permissions
- Check collection permissions allow function access
