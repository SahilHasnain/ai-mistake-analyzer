# AI Mistake Pattern Analyzer - React Native Implementation

## Tech Stack

- **Frontend**: React Native + Expo
- **Styling**: NativeWind (Tailwind for React Native)
- **Backend**: Appwrite
- **AI**: Groq AI
- **State Management**: Zustand (lightweight) or React Context
- **Timeline**: 2-3 weeks

---

## Project Setup (Day 1)

### Initialize Expo Project

```bash
npx create-expo-app@latest mistake-analyzer --template blank
cd mistake-analyzer

# Install dependencies
npx expo install nativewind
npx expo install tailwindcss
npm install react-native-appwrite
npm install zustand
npm install @expo/vector-icons
```

### Configure NativeWind

**tailwind.config.js**

```javascript
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#667eea",
        secondary: "#764ba2",
      },
    },
  },
  plugins: [],
};
```

**babel.config.js**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel"],
  };
};
```

### Project Structure

```
/src
  /components
    PatternCard.tsx
    StatsGrid.tsx
    EvidenceList.tsx
    LoadingShimmer.tsx
    ConfidenceBadge.tsx
  /screens
    DashboardScreen.tsx
    PatternDetailScreen.tsx
  /services
    appwrite.ts
    groq.ts
  /store
    patternStore.ts
  /types
    index.ts
  /utils
    formatters.ts
```

---

## Appwrite Configuration (Day 1-2)

### Install & Configure Appwrite SDK

**src/services/appwrite.ts**

```typescript
import {
  Client,
  Databases,
  Functions,
  Account,
  Query,
} from "react-native-appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1") // Your Appwrite endpoint
  .setProject("YOUR_PROJECT_ID"); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);

// Collection IDs (set these after creating collections)
export const DATABASE_ID = "your_database_id";
export const COLLECTIONS = {
  QUESTIONS: "questions",
  USER_RESPONSES: "user_responses",
  TEST_SESSIONS: "test_sessions",
  DETECTED_PATTERNS: "detected_patterns",
};

// Helper functions
export const appwriteService = {
  // Get user patterns
  async getUserPatterns(userId: string) {
    return await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DETECTED_PATTERNS,
      [
        Query.equal("user_id", userId),
        Query.equal("is_resolved", false),
        Query.orderDesc("confidence"),
        Query.limit(10),
      ],
    );
  },

  // Log question response
  async logResponse(data: {
    userId: string;
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    timeTaken: number;
    testId: string;
    questionPosition: number;
    testDurationSoFar: number;
  }) {
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USER_RESPONSES,
      "unique()",
      {
        user_id: data.userId,
        question_id: data.questionId,
        selected_answer: data.selectedAnswer,
        is_correct: data.isCorrect,
        time_taken: data.timeTaken,
        test_id: data.testId,
        timestamp: new Date().toISOString(),
        question_position: data.questionPosition,
        test_duration_so_far: data.testDurationSoFar,
      },
    );
  },

  // Trigger pattern analysis
  async analyzePatterns(userId: string) {
    return await functions.createExecution(
      "analyze-patterns",
      JSON.stringify({ userId }),
      false, // async execution
    );
  },

  // Get user stats
  async getUserStats(userId: string) {
    const responses = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_RESPONSES,
      [Query.equal("user_id", userId), Query.limit(1000)],
    );

    const total = responses.documents.length;
    const correct = responses.documents.filter((r) => r.is_correct).length;
    const mistakes = total - correct;

    return {
      totalQuestions: total,
      mistakes,
      accuracy: total > 0 ? ((correct / total) * 100).toFixed(1) : 0,
    };
  },

  // Mark pattern as resolved
  async resolvePattern(patternId: string) {
    return await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.DETECTED_PATTERNS,
      patternId,
      { is_resolved: true },
    );
  },
};
```

---

## State Management (Day 2)

### Zustand Store

**src/store/patternStore.ts**

```typescript
import { create } from "zustand";
import { appwriteService } from "../services/appwrite";

interface Pattern {
  $id: string;
  pattern_type: string;
  title: string;
  description: string;
  confidence: number;
  evidence: string;
  recommendation: string;
  detected_at: string;
  is_resolved: boolean;
}

interface PatternStore {
  patterns: Pattern[];
  loading: boolean;
  analyzing: boolean;
  stats: {
    totalQuestions: number;
    mistakes: number;
    accuracy: string;
  };
  fetchPatterns: (userId: string) => Promise<void>;
  analyzePatterns: (userId: string) => Promise<void>;
  resolvePattern: (patternId: string) => Promise<void>;
  fetchStats: (userId: string) => Promise<void>;
}

export const usePatternStore = create<PatternStore>((set, get) => ({
  patterns: [],
  loading: false,
  analyzing: false,
  stats: {
    totalQuestions: 0,
    mistakes: 0,
    accuracy: "0",
  },

  fetchPatterns: async (userId: string) => {
    set({ loading: true });
    try {
      const response = await appwriteService.getUserPatterns(userId);
      set({
        patterns: response.documents.map((doc) => ({
          ...doc,
          evidence: JSON.parse(doc.evidence || "[]"),
        })),
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching patterns:", error);
      set({ loading: false });
    }
  },

  analyzePatterns: async (userId: string) => {
    set({ analyzing: true });
    try {
      await appwriteService.analyzePatterns(userId);
      // Wait a bit for function to complete, then refresh
      setTimeout(() => {
        get().fetchPatterns(userId);
        set({ analyzing: false });
      }, 5000);
    } catch (error) {
      console.error("Error analyzing patterns:", error);
      set({ analyzing: false });
    }
  },

  resolvePattern: async (patternId: string) => {
    try {
      await appwriteService.resolvePattern(patternId);
      set((state) => ({
        patterns: state.patterns.filter((p) => p.$id !== patternId),
      }));
    } catch (error) {
      console.error("Error resolving pattern:", error);
    }
  },

  fetchStats: async (userId: string) => {
    try {
      const stats = await appwriteService.getUserStats(userId);
      set({ stats });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  },
}));
```

---

## Components (Day 3-5)

### PatternCard Component

**src/components/PatternCard.tsx**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PatternCardProps {
  pattern: {
    $id: string;
    title: string;
    description: string;
    confidence: number;
    evidence: string[];
    recommendation: string;
  };
  onPress: () => void;
  onResolve: () => void;
}

export default function PatternCard({ pattern, onPress, onResolve }: PatternCardProps) {
  const confidenceColor = pattern.confidence >= 85
    ? 'bg-green-100 text-green-800'
    : 'bg-yellow-100 text-yellow-800';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-lg font-semibold text-gray-800 flex-1 pr-2">
          {pattern.title}
        </Text>
        <View className={`px-3 py-1 rounded-full ${confidenceColor}`}>
          <Text className="text-xs font-semibold">
            {pattern.confidence}%
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text className="text-gray-600 text-sm leading-5 mb-4">
        {pattern.description}
      </Text>

      {/* Evidence Count */}
      <View className="flex-row items-center mb-4">
        <Ionicons name="document-text-outline" size={16} color="#9ca3af" />
        <Text className="text-gray-500 text-xs ml-2">
          {pattern.evidence.length} evidence items
        </Text>
      </View>

      {/* Recommendation Preview */}
      <View className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg mb-4">
        <View className="flex-row items-start">
          <Ionicons name="bulb-outline" size={16} color="#667eea" />
          <Text className="text-gray-700 text-xs ml-2 flex-1" numberOfLines={2}>
            {pattern.recommendation}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={onPress}
          className="flex-1 bg-purple-600 py-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold text-sm">
            View Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onResolve}
          className="px-4 py-3 bg-gray-100 rounded-lg"
        >
          <Ionicons name="checkmark" size={18} color="#374151" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
```

### StatsGrid Component

**src/components/StatsGrid.tsx**

```typescript
import React from 'react';
import { View, Text } from 'react-native';

interface StatsGridProps {
  stats: {
    totalQuestions: number;
    mistakes: number;
    accuracy: string;
    patternsDetected: number;
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3 mb-6">
      <View className="flex-1 min-w-[45%] bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-3xl font-bold text-purple-600">
          {stats.totalQuestions}
        </Text>
        <Text className="text-gray-600 text-xs mt-1">
          Questions Analyzed
        </Text>
      </View>

      <View className="flex-1 min-w-[45%] bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-3xl font-bold text-purple-600">
          {stats.mistakes}
        </Text>
        <Text className="text-gray-600 text-xs mt-1">
          Mistakes Found
        </Text>
      </View>

      <View className="flex-1 min-w-[45%] bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-3xl font-bold text-purple-600">
          {stats.patternsDetected}
        </Text>
        <Text className="text-gray-600 text-xs mt-1">
          Patterns Detected
        </Text>
      </View>

      <View className="flex-1 min-w-[45%] bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-3xl font-bold text-purple-600">
          {stats.accuracy}%
        </Text>
        <Text className="text-gray-600 text-xs mt-1">
          Accuracy Score
        </Text>
      </View>
    </View>
  );
}
```

### LoadingShimmer Component

**src/components/LoadingShimmer.tsx**

```typescript
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export default function LoadingShimmer() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={{ opacity }}
          className="bg-gray-200 rounded-2xl p-5 h-48"
        />
      ))}
    </View>
  );
}
```

---

## Screens (Day 6-8)

### Dashboard Screen

**src/screens/DashboardScreen.tsx**

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePatternStore } from '../store/patternStore';
import PatternCard from '../components/PatternCard';
import StatsGrid from '../components/StatsGrid';
import LoadingShimmer from '../components/LoadingShimmer';

export default function DashboardScreen({ navigation }) {
  const {
    patterns,
    loading,
    analyzing,
    stats,
    fetchPatterns,
    analyzePatterns,
    resolvePattern,
    fetchStats
  } = usePatternStore();

  const [refreshing, setRefreshing] = useState(false);
  const userId = 'user123'; // Get from auth context

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchPatterns(userId),
      fetchStats(userId)
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAnalyze = async () => {
    Alert.alert(
      'Analyze Patterns',
      'This will analyze your recent test performance. It may take a few seconds.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Analyze',
          onPress: async () => {
            await analyzePatterns(userId);
            Alert.alert('Success', 'Analysis complete! Check your new patterns.');
          },
        },
      ]
    );
  };

  const handleResolve = (patternId: string) => {
    Alert.alert(
      'Mark as Resolved',
      'Have you addressed this pattern?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Resolved',
          onPress: () => resolvePattern(patternId),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="px-5 pt-6 pb-8"
      >
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">
              🤖 Pattern Analyzer
            </Text>
            <Text className="text-white/80 text-sm mt-1">
              Discover your error fingerprint
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={analyzing}
            className="bg-white/20 px-4 py-2 rounded-full"
          >
            <Text className="text-white font-semibold text-sm">
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Status Badge */}
        <View className="flex-row items-center bg-white/20 px-3 py-2 rounded-full self-start">
          <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
          <Text className="text-white text-xs">
            AI analyzing {stats.totalQuestions} questions
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-5 -mt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid */}
        <StatsGrid
          stats={{
            ...stats,
            patternsDetected: patterns.length,
          }}
        />

        {/* Alert Banner */}
        {patterns.length > 0 && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex-row items-start">
            <Ionicons name="warning" size={20} color="#dc2626" />
            <View className="flex-1 ml-3">
              <Text className="text-red-800 font-semibold text-sm">
                {patterns.length} patterns detected!
              </Text>
              <Text className="text-red-700 text-xs mt-1">
                Review them now to improve your performance
              </Text>
            </View>
          </View>
        )}

        {/* Patterns List */}
        <View className="mb-6">
          <Text className="text-gray-800 font-semibold text-lg mb-3">
            Your Patterns
          </Text>

          {loading ? (
            <LoadingShimmer />
          ) : patterns.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="analytics-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-4">
                No patterns detected yet
              </Text>
              <Text className="text-gray-400 text-xs text-center mt-2">
                Take a few tests to unlock AI insights
              </Text>
            </View>
          ) : (
            patterns.map((pattern) => (
              <PatternCard
                key={pattern.$id}
                pattern={pattern}
                onPress={() =>
                  navigation.navigate('PatternDetail', { pattern })
                }
                onResolve={() => handleResolve(pattern.$id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Pattern Detail Screen

**src/screens/PatternDetailScreen.tsx**

```typescript
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PatternDetailScreen({ route, navigation }) {
  const { pattern } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4 flex-1">
          Pattern Details
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          {pattern.title}
        </Text>

        {/* Confidence Badge */}
        <View className="bg-green-100 px-3 py-1 rounded-full self-start mb-6">
          <Text className="text-green-800 font-semibold text-sm">
            {pattern.confidence}% Confidence
          </Text>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-gray-700 leading-6">
            {pattern.description}
          </Text>
        </View>

        {/* Evidence Section */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="font-semibold text-gray-800 mb-3">
            📊 Evidence from your tests:
          </Text>
          {pattern.evidence.map((item, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <Ionicons name="close-circle" size={18} color="#ef4444" />
              <Text className="text-gray-600 text-sm ml-2 flex-1">
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Recommendation */}
        <View className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-5 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="bulb" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              AI Recommendation
            </Text>
          </View>
          <Text className="text-white/90 leading-6">
            {pattern.recommendation}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity className="bg-purple-600 py-4 rounded-xl mb-3">
          <Text className="text-white text-center font-semibold">
            Practice Similar Questions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-gray-100 py-4 rounded-xl">
          <Text className="text-gray-700 text-center font-semibold">
            Mark as Resolved
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## App.tsx (Day 9)

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from './src/screens/DashboardScreen';
import PatternDetailScreen from './src/screens/PatternDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="PatternDetail" component={PatternDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## Installation Commands

```bash
# Core dependencies
npx expo install react-native-safe-area-context
npx expo install expo-linear-gradient
npx expo install @react-navigation/native
npx expo install @react-navigation/native-stack
npx expo install react-native-screens

# Install all at once
npm install react-native-appwrite zustand @expo/vector-icons
```

---

## Testing (Day 10-12)

### Test on Device

```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on physical device (scan QR code with Expo Go app)
```

### Create Test Data

```typescript
// Add this to your app for testing
async function generateTestData() {
  const userId = "user123";
  const testId = "test_" + Date.now();

  for (let i = 1; i <= 50; i++) {
    await appwriteService.logResponse({
      userId,
      questionId: `q_${i}`,
      selectedAnswer: Math.random() > 0.5 ? "correct" : "wrong",
      isCorrect: Math.random() > 0.4,
      timeTaken: 30 + Math.random() * 40,
      testId,
      questionPosition: i,
      testDurationSoFar: i * 1.5,
    });
  }
}
```

---

## Build & Deploy (Day 13-14)

### Build for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

### Configure EAS

```bash
npm install -g eas-cli
eas login
eas build:configure
```

---

## Environment Variables

**app.json**

```json
{
  "expo": {
    "name": "Mistake Analyzer",
    "slug": "mistake-analyzer",
    "extra": {
      "appwriteEndpoint": "https://cloud.appwrite.io/v1",
      "appwriteProjectId": "YOUR_PROJECT_ID",
      "databaseId": "YOUR_DATABASE_ID"
    }
  }
}
```

Access in code:

```typescript
import Constants from "expo-constants";

const APPWRITE_ENDPOINT = Constants.expoConfig?.extra?.appwriteEndpoint;
```

---

## Next Steps

1. **Day 1**: Set up Expo project with NativeWind
2. **Day 2**: Configure Appwrite SDK and create store
3. **Day 3-5**: Build components (PatternCard, StatsGrid, etc.)
4. **Day 6-8**: Build screens (Dashboard, PatternDetail)
5. **Day 9**: Set up navigation
6. **Day 10-12**: Testing with real data
7. **Day 13-14**: Polish and deploy

Ready to start? Want me to help you initialize the Expo project or set up the Appwrite configuration?
