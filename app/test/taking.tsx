/**
 * Test Taking Screen
 * User answers questions one by one
 */

import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTestStore } from "../../store/testStore";

export default function TestTaking() {
  const router = useRouter();
  const { currentTest, submitAnswer, nextQuestion, endTest, resetTest } =
    useTestStore();

  const [selectedAnswer, setSelectedAnswer] = useState<
    "A" | "B" | "C" | "D" | null
  >(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Redirect if no active test
  useEffect(() => {
    if (!currentTest) {
      Alert.alert("No Active Test", "Please start a new test first.", [
        { text: "OK", onPress: () => router.replace("/test") },
      ]);
    }
  }, [currentTest, router]);

  // Auto-submit when answer is selected
  useEffect(() => {
    if (selectedAnswer && !showFeedback) {
      handleSubmitAnswer();
    }
  }, [selectedAnswer]);

  if (!currentTest) {
    return null;
  }

  const currentQuestion = currentTest.questions[currentTest.current_question];
  const progress =
    ((currentTest.current_question + 1) / currentTest.total_questions) * 100;
  const isLastQuestion =
    currentTest.current_question === currentTest.total_questions - 1;

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || showFeedback) {
      return;
    }

    try {
      const result = await submitAnswer(selectedAnswer);
      setIsCorrect(result.isCorrect);
      setShowFeedback(true);
    } catch (error) {
      console.error("Error submitting answer:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to submit answer. Please try again.",
      );
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // End test and show results
      handleEndTest();
    } else {
      // Move to next question
      nextQuestion();
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handleEndTest = async () => {
    try {
      const results = await endTest();
      // Navigate immediately to prevent the useEffect from triggering
      router.replace({
        pathname: "/test/results",
        params: {
          results: JSON.stringify(results),
        },
      });
    } catch (error) {
      console.error("Error ending test:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to get test results. Please try again.",
      );
    }
  };

  const handleQuit = () => {
    Alert.alert(
      "Quit Test",
      "Are you sure you want to quit? Your progress will be saved but the test will end.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Quit",
          style: "destructive",
          onPress: () => {
            resetTest();
            router.replace("/");
          },
        },
      ],
    );
  };

  const options = [
    { id: "A", text: currentQuestion.option_a },
    { id: "B", text: currentQuestion.option_b },
    { id: "C", text: currentQuestion.option_c },
    { id: "D", text: currentQuestion.option_d },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-gray-800">
            Question {currentTest.current_question + 1} of{" "}
            {currentTest.total_questions}
          </Text>
          <TouchableOpacity onPress={handleQuit} className="px-3 py-1">
            <Text className="font-semibold text-red-600">Quit</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View className="h-2 overflow-hidden bg-gray-200 rounded-full">
          <View
            className="h-full bg-purple-600"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Subject Badge */}
        <View className="mb-4">
          <View className="self-start px-3 py-1 bg-purple-100 rounded-full">
            <Text className="text-xs font-semibold text-purple-700">
              {currentQuestion.subject}
            </Text>
          </View>
        </View>

        {/* Question */}
        <View className="mb-6">
          <Text className="text-xl font-bold leading-7 text-gray-800">
            {currentQuestion.question_text}
          </Text>
        </View>

        {/* Options */}
        <View className="gap-3 mb-6">
          {options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrectAnswer =
              showFeedback && option.id === currentQuestion.correct_answer;
            const isWrongSelection = showFeedback && isSelected && !isCorrect;

            let bgColor = "bg-white border-2 border-gray-200";
            if (showFeedback) {
              if (isCorrectAnswer) {
                bgColor = "bg-green-100 border-2 border-green-500";
              } else if (isWrongSelection) {
                bgColor = "bg-red-100 border-2 border-red-500";
              }
            } else if (isSelected) {
              bgColor = "bg-purple-100 border-2 border-purple-600";
            }

            return (
              <TouchableOpacity
                key={option.id}
                onPress={() =>
                  !showFeedback &&
                  setSelectedAnswer(option.id as "A" | "B" | "C" | "D")
                }
                disabled={showFeedback}
                className={`p-4 rounded-xl ${bgColor}`}
              >
                <View className="flex-row items-start">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      showFeedback
                        ? isCorrectAnswer
                          ? "bg-green-500"
                          : isWrongSelection
                            ? "bg-red-500"
                            : "bg-gray-300"
                        : isSelected
                          ? "bg-purple-600"
                          : "bg-gray-300"
                    }`}
                  >
                    <Text
                      className={`font-bold ${
                        showFeedback
                          ? isCorrectAnswer || isWrongSelection
                            ? "text-white"
                            : "text-gray-600"
                          : isSelected
                            ? "text-white"
                            : "text-gray-600"
                      }`}
                    >
                      {option.id}
                    </Text>
                  </View>
                  <Text
                    className={`flex-1 text-base ${
                      showFeedback
                        ? isCorrectAnswer || isWrongSelection
                          ? "font-semibold"
                          : ""
                        : ""
                    }`}
                  >
                    {option.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {showFeedback && (
          <View
            className={`p-4 rounded-xl mb-6 ${
              isCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <Text
              className={`text-lg font-bold mb-2 ${
                isCorrect ? "text-green-800" : "text-red-800"
              }`}
            >
              {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </Text>
            {!isCorrect && (
              <Text className="text-sm text-red-700">
                The correct answer is {currentQuestion.correct_answer}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      <View className="px-6 py-4 border-t border-gray-200">
        {showFeedback ? (
          <TouchableOpacity
            onPress={handleNext}
            className="py-4 bg-purple-600 rounded-xl"
          >
            <Text className="text-lg font-bold text-center text-white">
              {isLastQuestion ? "View Results" : "Next Question →"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="rounded-xl py-4 bg-gray-100">
            <Text className="text-lg font-bold text-center text-gray-500">
              Select an answer above
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
