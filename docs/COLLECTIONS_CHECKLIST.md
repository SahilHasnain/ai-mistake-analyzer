# Appwrite Collections Checklist

## 📋 Required Collections

Your NEET Pattern Analyzer needs **3 collections** in total:

### ✅ Collection 1: DETECTED_PATTERNS

**Purpose:** Stores AI-detected mistake patterns

**Script:** `scripts/setup-appwrite-collections.js`

**Attributes:**

- ✅ `user_id` (string, 255) - User identifier
- ✅ `pattern_type` (string, 100) - Pattern category (e.g., "rushing")
- ✅ `title` (string, 255) - Pattern title
- ✅ `description` (string, 2000) - Pattern explanation
- ✅ `confidence` (integer, 0-100) - Confidence score
- ✅ `evidence` (string, 5000) - JSON array of evidence
- ✅ `recommendation` (string, 2000) - AI recommendation
- ✅ `detected_at` (datetime) - Detection timestamp
- ✅ `is_resolved` (boolean) - Resolution status
- ✅ `subject_distribution` (string, 1000, optional) - Subject breakdown JSON

**Indexes:**

- ✅ `user_id_idx` - For user queries
- ✅ `is_resolved_idx` - For filtering resolved/unresolved
- ✅ `user_resolved_idx` - Compound index (user_id + is_resolved)
- ✅ `confidence_idx` - For sorting by confidence (DESC)

---

### ✅ Collection 2: USER_RESPONSES

**Purpose:** Stores user's answers to questions

**Script:** `scripts/setup-appwrite-collections.js`

**Attributes:**

- ✅ `user_id` (string, 255) - User identifier
- ✅ `question_id` (string, 255) - Question reference
- ✅ `selected_answer` (string, 255) - User's answer (A/B/C/D)
- ✅ `is_correct` (boolean) - Answer correctness
- ✅ `time_taken` (integer) - Time in seconds
- ✅ `test_id` (string, 255) - Test session ID
- ✅ `timestamp` (datetime) - Response timestamp
- ✅ `question_position` (integer) - Position in test
- ✅ `test_duration_so_far` (float) - Minutes elapsed
- ✅ `subject` (string, 50, optional) - Physics/Chemistry/Biology

**Indexes:**

- ✅ `user_id_idx` - For user queries
- ✅ `test_id_idx` - For test results
- ✅ `user_timestamp_idx` - Compound index (user_id + timestamp)

---

### ✅ Collection 3: QUESTIONS

**Purpose:** Stores NEET test questions (AI-generated)

**Script:** `scripts/setup-questions-collection.js`

**Attributes:**

- ✅ `question_text` (string, 5000) - Question content
- ✅ `option_a` (string, 500) - Option A
- ✅ `option_b` (string, 500) - Option B
- ✅ `option_c` (string, 500) - Option C
- ✅ `option_d` (string, 500) - Option D
- ✅ `correct_answer` (string, 1) - Correct answer (A/B/C/D)
- ✅ `subject` (string, 50) - Physics/Chemistry/Biology
- ✅ `difficulty` (string, 20) - Easy/Medium/Hard
- ✅ `topic` (string, 200, optional) - Topic/chapter name

**Indexes:**

- ✅ `subject_idx` - For subject filtering
- ✅ `difficulty_idx` - For difficulty filtering

---

## 🚀 Setup Instructions

### Option 1: Run All Collections Setup (Recommended)

```bash
# Setup DETECTED_PATTERNS and USER_RESPONSES
node scripts/setup-appwrite-collections.js

# Setup QUESTIONS
node scripts/setup-questions-collection.js
```

### Option 2: Run Combined Script

Create a master setup script:

```bash
# Create combined script
node scripts/setup-all-collections.js
```

---

## ✅ Verification Checklist

After running the setup scripts, verify in Appwrite Console:

### 1. Check Collections Exist

- [ ] Go to Appwrite Console → Databases
- [ ] Select your database (ID: `696f7a7c0019e249f531`)
- [ ] Verify 3 collections exist:
  - [ ] DETECTED_PATTERNS
  - [ ] USER_RESPONSES
  - [ ] QUESTIONS

### 2. Check Attributes

For each collection, click on it and verify all attributes are created:

**DETECTED_PATTERNS:**

- [ ] 10 attributes total (9 required + 1 optional)
- [ ] All required attributes marked as "Required"
- [ ] subject_distribution marked as "Optional"

**USER_RESPONSES:**

- [ ] 10 attributes total (9 required + 1 optional)
- [ ] All required attributes marked as "Required"
- [ ] subject marked as "Optional"

**QUESTIONS:**

- [ ] 9 attributes total (8 required + 1 optional)
- [ ] All required attributes marked as "Required"
- [ ] topic marked as "Optional"

### 3. Check Indexes

For each collection, go to "Indexes" tab:

**DETECTED_PATTERNS:**

- [ ] 4 indexes created
- [ ] confidence_idx has DESC order

**USER_RESPONSES:**

- [ ] 3 indexes created
- [ ] Compound indexes working

**QUESTIONS:**

- [ ] 2 indexes created

### 4. Check Permissions

For each collection, go to "Settings" → "Permissions":

- [ ] Read: Any
- [ ] Create: Any
- [ ] Update: Any
- [ ] Delete: Any

**Note:** In production, you should restrict these permissions!

---

## 🧪 Test Collections

### Test QUESTIONS Collection

```bash
# Generate sample questions using the function
# Or manually create a test question in Appwrite Console
```

**Test Document:**

```json
{
  "question_text": "What is the SI unit of force?",
  "option_a": "Newton",
  "option_b": "Joule",
  "option_c": "Watt",
  "option_d": "Pascal",
  "correct_answer": "A",
  "subject": "Physics",
  "difficulty": "Easy",
  "topic": "Units and Measurements"
}
```

### Test USER_RESPONSES Collection

```bash
# Use the seed script
node scripts/seed-sample-data.js
```

This will create 15 sample responses for testing.

### Test DETECTED_PATTERNS Collection

```bash
# Use the seed script
node scripts/seed-sample-patterns.js
```

Or run the analyze-patterns function after having responses.

---

## 🔧 Troubleshooting

### "Collection already exists" Error

✅ **This is normal!** The script skips existing collections.

### "Attribute already exists" Error

✅ **This is normal!** The script will continue with other attributes.

### "Index already exists" Error

✅ **This is normal!** The script will continue.

### Timeout Errors

- Increase delays in the script (change `delay(2000)` to `delay(5000)`)
- Run scripts one at a time
- Check Appwrite server status

### Permission Errors

- Verify `APPWRITE_SECRET_KEY` in `.env.local` is correct
- Check API key has database permissions
- Ensure you're using the correct project ID

---

## 📊 Collection Relationships

```
┌─────────────────────────────────────────────────────┐
│                   QUESTIONS                         │
│  - Stores AI-generated questions                    │
│  - Referenced by USER_RESPONSES                     │
└─────────────────────────────────────────────────────┘
                        ↓ (question_id)
┌─────────────────────────────────────────────────────┐
│                 USER_RESPONSES                      │
│  - Stores user answers                              │
│  - Links to QUESTIONS via question_id               │
│  - Analyzed by analyze-patterns function            │
└─────────────────────────────────────────────────────┘
                        ↓ (analyzed by AI)
┌─────────────────────────────────────────────────────┐
│               DETECTED_PATTERNS                     │
│  - Stores AI-detected patterns                      │
│  - Based on USER_RESPONSES analysis                 │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Next Steps

After all collections are set up:

1. ✅ **Collections Created** - All 3 collections ready
2. ⏭️ **Deploy Functions** - Deploy the 4 Appwrite Functions
3. ⏭️ **Test Data Flow** - Generate questions → Take test → Analyze patterns
4. ⏭️ **Build Test UI** - Create test-taking screens

---

## 📝 Quick Reference

**Collection IDs:**

- `DETECTED_PATTERNS`
- `USER_RESPONSES`
- `QUESTIONS`

**Database ID:**

- `696f7a7c0019e249f531`

**Setup Scripts:**

- `scripts/setup-appwrite-collections.js` - DETECTED_PATTERNS + USER_RESPONSES
- `scripts/setup-questions-collection.js` - QUESTIONS

**Seed Scripts:**

- `scripts/seed-sample-data.js` - Sample USER_RESPONSES
- `scripts/seed-sample-patterns.js` - Sample DETECTED_PATTERNS
