/**
 * Test Results Screen
 * Shows test performance and statistics
 */

import { getUserId } from "@/utils/getUserId";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePatternStore } from "../../store/patternStore";
import { useTestStore } from "../../store/testStore";

export default function TestResults() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { resetTest } = useTestStore();
  const { analyzePatterns, analyzing } = usePatternStore();

  // Clear test state when results page loads
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  // Parse results from route params
  const results = JSON.parse(params.results as string);

  const getGrade = (accuracy: number) => {
    if (accuracy >= 90)
      return { grade: "A+", color: "text-green-600", emoji: "🌟" };
    if (accuracy >= 80)
      return { grade: "A", color: "text-green-600", emoji: "🎉" };
    if (accuracy >= 70)
      return { grade: "B", color: "text-blue-600", emoji: "👍" };
    if (accuracy >= 60)
      return { grade: "C", color: "text-yellow-600", emoji: "📚" };
    return { grade: "D", color: "text-red-600", emoji: "💪" };
  };

  const gradeInfo = getGrade(results.accuracy);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleAnalyze = () => {
    Alert.alert(
      "Analyze Patterns",
      "This will analyze your recent test data using AI to detect mistake patterns. This may take a few moments.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Analyze",
          onPress: async () => {
            try {
              const userId = await getUserId();
              await analyzePatterns(userId);
              // Directly redirect to dashboard on success
              router.replace("/");
            } catch (error) {
              console.error("Analysis error:", error);
              Alert.alert(
                "Analysis Failed",
                error instanceof Error
                  ? error.message
                  : "Unable to analyze patterns. Please try again later.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-8 items-center"
      >
        <Text className="text-white text-4xl mb-2">{gradeInfo.emoji}</Text>
        <Text className="text-white text-3xl font-bold mb-2">
          Test Complete!
        </Text>
        <Text className="text-purple-100 text-sm">
          Here's how you performed
        </Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Overall Score */}
        <View className="bg-white rounded-2xl p-6 mb-4 items-center shadow-sm">
          <Text className="text-gray-600 text-sm mb-2">Your Score</Text>
          <Text className={`text-6xl font-bold ${gradeInfo.color} mb-2`}>
            {results.accuracy.toFixed(1)}%
          </Text>
          <Text className={`text-2xl font-bold ${gradeInfo.color}`}>
            Grade: {gradeInfo.grade}
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          <View className="flex-1 min-w-[45%] bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-3xl font-bold text-green-600 mb-1">
              {results.correctAnswers}
            </Text>
            <Text className="text-xs text-gray-600">Correct Answers</Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-3xl font-bold text-red-600 mb-1">
              {results.incorrectAnswers}
            </Text>
            <Text className="text-xs text-gray-600">Incorrect Answers</Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-3xl font-bold text-blue-600 mb-1">
              {formatTime(results.totalTime)}
            </Text>
            <Text className="text-xs text-gray-600">Total Time</Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-3xl font-bold text-purple-600 mb-1">
              {results.avgTimePerQuestion.toFixed(0)}s
            </Text>
            <Text className="text-xs text-gray-600">Avg per Question</Text>
          </View>
        </View>

        {/* Subject Breakdown */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Subject Breakdown
          </Text>

          {Object.entries(results.subjectBreakdown).map(
            ([subject, data]: [string, any]) => {
              if (data.total === 0) return null;

              return (
                <View key={subject} className="mb-4 last:mb-0">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-base font-semibold text-gray-800">
                      {subject}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {data.correct}/{data.total}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className={`h-full ${
                        data.accuracy >= 70
                          ? "bg-green-500"
                          : data.accuracy >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${data.accuracy}%` }}
                    />
                  </View>

                  <Text className="text-xs text-gray-500 mt-1">
                    {data.accuracy.toFixed(1)}% accuracy
                  </Text>
                </View>
              );
            },
          )}
        </View>

        {/* Recommendations */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <Text className="text-blue-800 font-semibold mb-2">
            💡 What's Next?
          </Text>
          {results.accuracy < 70 && (
            <Text className="text-blue-700 text-sm mb-2">
              • Review incorrect answers and understand the concepts
            </Text>
          )}
          <Text className="text-blue-700 text-sm mb-2">
            • Take more tests to improve your performance
          </Text>
          <Text className="text-blue-700 text-sm">
            • Use AI analysis to detect mistake patterns
          </Text>
        </View>

        {/* Action Buttons Grid */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Quick Actions
          </Text>

          {/* 2x2 Grid */}
          <View className="flex-row flex-wrap gap-3">
            {/* Review Answers */}
            {results.testData && (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/test/review",
                    params: {
                      testData: JSON.stringify(results.testData),
                    },
                  })
                }
                className="flex-1 min-w-[45%] bg-blue-600 rounded-xl p-4 items-center"
              >
                <Text className="text-3xl mb-2">📝</Text>
                <Text className="text-white font-bold text-base text-center">
                  Review Answers
                </Text>
              </TouchableOpacity>
            )}

            {/* Analyze Patterns */}
            <TouchableOpacity
              onPress={handleAnalyze}
              disabled={analyzing}
              className={`flex-1 min-w-[45%] rounded-xl p-4 items-center ${
                analyzing ? "bg-orange-400" : "bg-orange-600"
              }`}
            >
              <Text className="text-3xl mb-2">🔍</Text>
              <Text className="text-white font-bold text-base text-center">
                {analyzing ? "Analyzing..." : "AI Analysis"}
              </Text>
            </TouchableOpacity>

            {/* Take Another Test */}
            <TouchableOpacity
              onPress={() => router.replace("/test")}
              className="flex-1 min-w-[45%] bg-purple-600 rounded-xl p-4 items-center"
            >
              <Text className="text-3xl mb-2">📚</Text>
              <Text className="text-white font-bold text-base text-center">
                New Test
              </Text>
            </TouchableOpacity>

            {/* Back to Dashboard */}
            <TouchableOpacity
              onPress={() => router.replace("/")}
              className="flex-1 min-w-[45%] bg-white border-2 border-purple-600 rounded-xl p-4 items-center"
            >
              <Text className="text-3xl mb-2">🏠</Text>
              <Text className="text-purple-600 font-bold text-base text-center">
                Dashboard
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
