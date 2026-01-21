# Mistake Pattern Analyzer

An AI-powered mobile app for NEET exam preparation that analyzes test performance to detect mistake patterns and provide personalized recommendations.

## Features

- 📊 Real-time statistics dashboard
- 🤖 AI-powered pattern detection
- 📱 Native mobile experience with Expo
- 🎨 Beautiful gradient UI with NativeWind
- 🔄 Pull-to-refresh functionality
- 📈 Confidence-based pattern ranking

## Get started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Appwrite account and project

### Installation

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Appwrite Configuration
   EXPO_PUBLIC_APPWRITE_ENDPOINT=https://[REGION].cloud.appwrite.io/v1
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
   EXPO_PUBLIC_APPWRITE_FUNCTION_URL=https://[REGION].cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions

   # Optional: Appwrite API Key for server-side operations
   APPWRITE_SECRET_KEY=your_secret_key
   ```

   **Environment Variable Details:**
   - `EXPO_PUBLIC_APPWRITE_ENDPOINT`: Your Appwrite server endpoint (e.g., https://sgp.cloud.appwrite.io/v1)
   - `EXPO_PUBLIC_APPWRITE_PROJECT_ID`: Your Appwrite project ID (found in project settings)
   - `EXPO_PUBLIC_APPWRITE_DATABASE_ID`: Your database ID where collections are stored
   - `EXPO_PUBLIC_APPWRITE_FUNCTION_URL`: Full URL to your pattern analysis Appwrite Function
   - `APPWRITE_SECRET_KEY`: (Optional) API key for server-side operations

   **Note:** Variables prefixed with `EXPO_PUBLIC_` are exposed to the client-side app.

3. Set up Appwrite collections

   Run the setup script to create required collections:

   ```bash
   node scripts/setup-appwrite-collections.js
   ```

   This creates:
   - `DETECTED_PATTERNS` collection for storing AI-detected patterns
   - `USER_RESPONSES` collection for storing user test responses

4. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── index.tsx          # Dashboard screen
│   ├── pattern/[id].tsx   # Pattern detail screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── services/              # API and backend services
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
└── scripts/               # Setup and utility scripts
```

## Appwrite Collections Schema

### DETECTED_PATTERNS Collection

| Field                | Type    | Description                      |
| -------------------- | ------- | -------------------------------- |
| user_id              | string  | User identifier                  |
| title                | string  | Pattern title                    |
| description          | string  | Detailed pattern description     |
| confidence           | number  | Confidence score (0-100)         |
| evidence             | string  | JSON array of evidence items     |
| recommendation       | string  | AI-generated recommendation      |
| is_resolved          | boolean | Resolution status                |
| subject_distribution | string  | JSON object of subject breakdown |

**Required Indexes:**

- `user_id` + `is_resolved` (for filtering unresolved patterns)
- `user_id` + `confidence` (for sorting by confidence)

### USER_RESPONSES Collection

| Field       | Type     | Description         |
| ----------- | -------- | ------------------- |
| user_id     | string   | User identifier     |
| question_id | string   | Question identifier |
| is_correct  | boolean  | Answer correctness  |
| subject     | string   | Subject category    |
| timestamp   | datetime | Response timestamp  |

**Required Indexes:**

- `user_id` (for user-specific queries)
- `user_id` + `timestamp` (for chronological sorting)

## Error Handling

The app implements comprehensive error handling:

- **Network Errors**: User-friendly alerts for connection issues
- **Configuration Errors**: Clear messages for missing environment variables
- **Data Errors**: Graceful fallbacks for malformed data
- **Loading States**: Proper loading indicators with finally blocks
- **User Feedback**: Informative error messages via Alert dialogs

All errors are logged to console for debugging while showing user-friendly messages in the UI.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
- [Appwrite Documentation](https://appwrite.io/docs): Learn about Appwrite backend services

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
