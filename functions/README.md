# Appwrite Functions Setup Guide

This directory contains Appwrite Functions for the NEET Pattern Analyzer backend.

## Functions Overview

### 1. **generate-questions**

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
  "questions": [...],
  "count": 10
}
```

### 2. **record-answer**

Records a user's answer to a question.

**Endpoint:** `POST /v1/functions/{functionId}/executions`

**Payload:**

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

### 3. **get-test-results**

Retrieves and calculates test results.

**Endpoint:** `POST /v1/functions/{functionId}/executions`

**Payload:**

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
    "subjectBreakdown": {...}
  }
}
```

## Deployment Steps

### 1. Install Appwrite CLI

```bash
npm install -g appwrite
```

### 2. Login to Appwrite

```bash
appwrite login
```

### 3. Initialize Project (if not already done)

```bash
appwrite init project
```

### 4. Deploy Functions

Deploy each function individually:

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
```

### 5. Set Environment Variables

For each function, set these environment variables in the Appwrite Console:

**All Functions:**

- `APPWRITE_ENDPOINT` - Your Appwrite endpoint (e.g., https://sgp.cloud.appwrite.io/v1)
- `APPWRITE_FUNCTION_PROJECT_ID` - Your project ID
- `APPWRITE_API_KEY` - API key with database permissions
- `APPWRITE_DATABASE_ID` - Your database ID

**generate-questions only:**

- `GROQ_API_KEY` - Your Groq API key

### 6. Update Frontend Environment Variables

Add these to your `.env.local`:

```env
# Existing variables...
EXPO_PUBLIC_GENERATE_QUESTIONS_FUNCTION_ID=your-function-id
EXPO_PUBLIC_RECORD_ANSWER_FUNCTION_ID=your-function-id
EXPO_PUBLIC_GET_TEST_RESULTS_FUNCTION_ID=your-function-id
```

## Manual Deployment via Appwrite Console

If you prefer using the Appwrite Console:

1. Go to **Functions** in your Appwrite project
2. Click **Create Function**
3. Choose **Node.js 18.0** runtime
4. Upload the function code (zip the `src` folder and `package.json`)
5. Set environment variables
6. Set execution timeout to 300 seconds (for AI generation)
7. Deploy

## Testing Functions

You can test functions directly in the Appwrite Console:

1. Go to **Functions** → Select function
2. Click **Execute**
3. Enter test payload
4. View response and logs

## Function Configuration

### generate-questions

- **Runtime:** Node.js 18.0
- **Timeout:** 300 seconds (AI generation can take time)
- **Memory:** 512 MB

### record-answer

- **Runtime:** Node.js 18.0
- **Timeout:** 15 seconds
- **Memory:** 256 MB

### get-test-results

- **Runtime:** Node.js 18.0
- **Timeout:** 30 seconds
- **Memory:** 256 MB

## Troubleshooting

### Function fails with "Module not found"

- Ensure `package.json` is included in deployment
- Check that `"type": "module"` is set in package.json

### Timeout errors

- Increase function timeout in Appwrite Console
- For generate-questions, use 300 seconds

### Database permission errors

- Ensure API key has proper permissions
- Check collection permissions allow function access

### Groq API errors

- Verify GROQ_API_KEY is set correctly
- Check API key has sufficient credits
- Ensure API endpoint is accessible

## Local Testing

To test functions locally:

```bash
cd functions/generate-questions
npm install
node src/main.js
```

Note: You'll need to mock the Appwrite context for local testing.
