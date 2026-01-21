# Complete Backend Architecture

## ✅ Appwrite Functions (2 Functions)

You have **2 Appwrite Functions** for backend AI operations:

### 1. **generate-questions** 🎯

- **Purpose:** Generate NEET questions using Groq AI
- **Location:** `functions/generate-questions/`
- **AI Model:** Llama 3.3 70B via Groq
- **Stores:** Questions in QUESTIONS collection
- **Timeout:** 300 seconds
- **Memory:** 512 MB

### 2. **analyze-patterns** 🧠

- **Purpose:** Detect behavioral mistake patterns using AI
- **Location:** `functions/analyze-patterns/`
- **AI Model:** Llama 3.3 70B via Groq
- **Analyzes:** User responses to find patterns
- **Stores:** Patterns in DETECTED_PATTERNS collection
- **Timeout:** 300 seconds
- **Memory:** 512 MB

---

## ✅ Frontend Direct Operations (No Functions)

These operations happen **directly from the frontend** using Appwrite SDK:

### 3. **Record Answer** ✍️

- **Service:** `services/testService.ts` → `recordAnswer()`
- **Purpose:** Record user's answer to a question
- **Method:** Direct database write to USER_RESPONSES
- **Why Frontend:** Simple CRUD operation, no processing needed

### 4. **Get Test Results** 📊

- **Service:** `services/testService.ts` → `getTestResults()`
- **Purpose:** Calculate test statistics and results
- **Method:** Direct database query + client-side calculation
- **Why Frontend:** Simple aggregation, faster response

---

## 📋 Deployment Checklist

### Step 1: Deploy Functions (Only 2!)

```bash
# Deploy generate-questions
cd functions/generate-questions
appwrite deploy function

# Deploy analyze-patterns
cd functions/analyze-patterns
appwrite deploy function
```

### Step 2: Set Environment Variables

**For BOTH functions:**

```env
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_FUNCTION_PROJECT_ID=696f7a54001b30998f58
APPWRITE_API_KEY=your-api-key-with-database-permissions
APPWRITE_DATABASE_ID=696f7a7c0019e249f531
GROQ_API_KEY=your-groq-api-key
```

### Step 3: Update Frontend Environment Variables

Update your `.env.local`:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=696f7a54001b30998f58
EXPO_PUBLIC_APPWRITE_DATABASE_ID=696f7a7c0019e249f531

# Only 2 function URLs needed
EXPO_PUBLIC_GENERATE_QUESTIONS_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/{function-id}/executions
EXPO_PUBLIC_ANALYZE_PATTERNS_FUNCTION_URL=https://sgp.cloud.appwrite.io/v1/functions/{function-id}/executions
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
│         generate-questions Function (Backend)            │
│  → Calls Groq AI to generate questions                  │
│  → Stores in QUESTIONS collection                       │
│  → Returns questions to frontend                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  2. TAKE TEST                           │
│  User answers each question → Frontend directly         │
│  writes to USER_RESPONSES collection                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         Frontend: recordAnswer() (Direct DB)             │
│  → Validates answer correctness                         │
│  → Stores in USER_RESPONSES collection                  │
│  → Returns isCorrect status                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  3. VIEW RESULTS                        │
│  Test ends → Frontend directly queries                  │
│  USER_RESPONSES collection                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│      Frontend: getTestResults() (Direct DB Query)       │
│  → Fetches all responses for test                       │
│  → Calculates accuracy, time stats (client-side)        │
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
│          analyze-patterns Function (Backend)             │
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

## 🎯 Why This Architecture?

### Functions (Backend) for:

✅ **AI Operations** - Groq API key stays secure
✅ **Complex Processing** - Pattern analysis requires heavy computation
✅ **Expensive Operations** - AI calls should be rate-limited and monitored

### Direct Frontend for:

✅ **Simple CRUD** - Recording answers is just a database write
✅ **Fast Operations** - Test results calculated instantly on client
✅ **Real-time Feedback** - No function cold start delays
✅ **Cost Effective** - No function execution costs for simple operations

---

## 🧪 Testing

### Test generate-questions Function

**In Appwrite Console:**

```json
{
  "subject": "Physics",
  "count": 5,
  "difficulty": "Medium"
}
```

**Expected:** 5 Physics questions stored in database

### Test analyze-patterns Function

**In Appwrite Console:**

```json
{
  "userId": "test-user-123"
}
```

**Expected:** 2-4 patterns detected and stored

**Note:** Requires at least 5 responses in USER_RESPONSES

### Test Frontend Operations

**Record Answer:**

```typescript
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
```

**Get Results:**

```typescript
import { getTestResults } from "./services/testService";

const results = await getTestResults("TEST_123");
```

---

## 🔐 Security

✅ **API keys secure** - Groq key only in backend functions
✅ **Database permissions** - Collections allow client read/write
✅ **No sensitive operations** - Frontend only does CRUD
✅ **Validation** - Functions validate all inputs

---

## 📊 Summary

| Operation          | Location         | Why                               |
| ------------------ | ---------------- | --------------------------------- |
| Generate Questions | Backend Function | AI operation, secure API key      |
| Analyze Patterns   | Backend Function | AI operation, complex processing  |
| Record Answer      | Frontend Direct  | Simple CRUD, fast response        |
| Get Test Results   | Frontend Direct  | Simple query, instant calculation |

**Total Functions:** 2 (down from 4!)
**Total Collections:** 3
**Frontend Services:** 2

---

## 🎯 Next Steps

1. ✅ **Functions Ready** - Only 2 to deploy
2. ✅ **Frontend Services Updated** - Direct DB access configured
3. ⏭️ **Deploy Functions** - See `functions/README.md`
4. ⏭️ **Build Test UI** - Create test-taking screens
5. ⏭️ **Test End-to-End** - Complete flow from test to patterns

Simpler, faster, and more cost-effective! 🚀
