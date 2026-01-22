/**
 * Test Review Screen
 * Shows all questions with user answers and correct answers
 */

import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Question } from "../../types";

export default function TestReview() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse test data from route params
  const testData = JSON.parse(params.testData as string);
  const questions: Question[] = testData.questions;
  const userAnswers: Map<number, "A" | "B" | "C" | "D"> = new Map(
    testData.userAnswers,
  );

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
            className="p-2 mr-4 -ml-2"
          >
            <Text className="text-2xl text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-white">Review Answers</Text>
        </View>
        <Text className="text-sm text-purple-100">
          See all questions and correct answers
        </Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-6">
        {questions.map((question, index) => {
          const userAnswer = userAnswers.get(index);
          const isCorrect = userAnswer === question.correct_answer;

          const options = [
            { id: "A", text: question.option_a },
            { id: "B", text: question.option_b },
            { id: "C", text: question.option_c },
            { id: "D", text: question.option_d },
          ];

          return (
            <View
              key={question.$id}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
            >
              {/* Question Header */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    <Text className="text-white font-bold">
                      {isCorrect ? "✓" : "✗"}
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-gray-800">
                    Question {index + 1}
                  </Text>
                </View>
                <View className="px-3 py-1 bg-purple-100 rounded-full">
                  <Text className="text-xs font-semibold text-purple-700">
                    {question.subject}
                  </Text>
                </View>
              </View>

              {/* Question Text */}
              <Text className="text-base text-gray-800 mb-4 leading-6">
                {question.question_text}
              </Text>

              {/* Options */}
              <View className="gap-2">
                {options.map((option) => {
                  const isUserAnswer = userAnswer === option.id;
                  const isCorrectAnswer = option.id === question.correct_answer;

                  let bgColor = "bg-gray-50";
                  let borderColor = "border-gray-200";
                  let textColor = "text-gray-800";

                  if (isCorrectAnswer) {
                    bgColor = "bg-green-50";
                    borderColor = "border-green-500";
                    textColor = "text-green-800";
                  } else if (isUserAnswer && !isCorrect) {
                    bgColor = "bg-red-50";
                    borderColor = "border-red-500";
                    textColor = "text-red-800";
                  }

                  return (
                    <View
                      key={option.id}
                      className={`p-3 rounded-lg border ${bgColor} ${borderColor}`}
                    >
                      <View className="flex-row items-start">
                        <Text className={`font-bold mr-2 ${textColor}`}>
                          {option.id}.
                        </Text>
                        <Text className={`flex-1 ${textColor}`}>
                          {option.text}
                        </Text>
                        {isCorrectAnswer && (
                          <Text className="text-green-600 ml-2">✓</Text>
                        )}
                        {isUserAnswer && !isCorrect && (
                          <Text className="text-red-600 ml-2">✗</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Answer Info */}
              <View className="mt-3 pt-3 border-t border-gray-200">
                <Text className="text-sm text-gray-600">
                  Your answer:{" "}
                  <Text
                    className={`font-semibold ${isCorrect ? "text-green-600" : "text-red-600"}`}
                  >
                    {userAnswer || "Not answered"}
                  </Text>
                </Text>
                {!isCorrect && (
                  <Text className="text-sm text-gray-600 mt-1">
                    Correct answer:{" "}
                    <Text className="font-semibold text-green-600">
                      {question.correct_answer}
                    </Text>
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-purple-600 rounded-xl py-4 mb-6"
        >
          <Text className="text-white text-center font-bold text-lg">
            Back to Results
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
