/**
 * Test Selection Screen
 * User selects subject and starts a new test
 */

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTestStore } from "../../store/testStore";
import { getUserId } from "../../utils/getUserId";

export default function TestSelection() {
  const router = useRouter();
  const { startTest, loading } = useTestStore();
  const [selectedSubject, setSelectedSubject] = useState<
    "Physics" | "Chemistry" | "Biology" | "Mixed"
  >("Mixed");
  const [questionCount, setQuestionCount] = useState(10);

  const subjects = [
    { id: "Physics", name: "Physics", icon: "⚛️", color: "bg-blue-500" },
    { id: "Chemistry", name: "Chemistry", icon: "🧪", color: "bg-green-500" },
    { id: "Biology", name: "Biology", icon: "🧬", color: "bg-red-500" },
    { id: "Mixed", name: "Mixed", icon: "🎯", color: "bg-purple-500" },
  ];

  const questionCounts = [5, 10, 15, 20];

  const handleStartTest = async () => {
    try {
      const userId = await getUserId();

      Alert.alert(
        "Start Test",
        `Ready to start ${questionCount} ${selectedSubject} questions?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start",
            onPress: async () => {
              try {
                await startTest(userId, selectedSubject, questionCount);
                router.push("/test/taking");
              } catch (error) {
                console.error("Error starting test:", error);
                Alert.alert(
                  "Error",
                  error instanceof Error
                    ? error.message
                    : "Failed to start test. Please try again.",
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("Error getting user ID:", error);
      Alert.alert("Error", "Failed to initialize test. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-6"
      >
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 -ml-2"
          >
            <Text className="text-white text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">New Test</Text>
        </View>
        <Text className="text-purple-100 text-sm">
          Select subject and number of questions
        </Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Subject Selection */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Select Subject
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                onPress={() =>
                  setSelectedSubject(
                    subject.id as "Physics" | "Chemistry" | "Biology" | "Mixed",
                  )
                }
                className={`flex-1 min-w-[45%] p-4 rounded-xl ${
                  selectedSubject === subject.id
                    ? subject.color
                    : "bg-white border-2 border-gray-200"
                }`}
              >
                <Text className="text-3xl mb-2">{subject.icon}</Text>
                <Text
                  className={`text-base font-semibold ${
                    selectedSubject === subject.id
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Question Count Selection */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Number of Questions
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {questionCounts.map((count) => (
              <TouchableOpacity
                key={count}
                onPress={() => setQuestionCount(count)}
                className={`flex-1 min-w-[22%] p-4 rounded-xl ${
                  questionCount === count
                    ? "bg-purple-600"
                    : "bg-white border-2 border-gray-200"
                }`}
              >
                <Text
                  className={`text-2xl font-bold text-center ${
                    questionCount === count ? "text-white" : "text-gray-800"
                  }`}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Test Info */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <Text className="text-blue-800 text-sm mb-2">
            📝 <Text className="font-semibold">Test Details:</Text>
          </Text>
          <Text className="text-blue-700 text-sm">
            • Subject: {selectedSubject}
          </Text>
          <Text className="text-blue-700 text-sm">
            • Questions: {questionCount}
          </Text>
          <Text className="text-blue-700 text-sm">
            • Estimated time: ~{questionCount * 1.5} minutes
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          onPress={handleStartTest}
          disabled={loading}
          className={`rounded-xl py-4 px-6 ${
            loading ? "bg-purple-300" : "bg-purple-600"
          }`}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? "Generating Questions..." : "Start Test"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <View className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <Text className="text-yellow-800 text-sm text-center">
              ⏳ AI is generating your questions... This may take a moment.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
