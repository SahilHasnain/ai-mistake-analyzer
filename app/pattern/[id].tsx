import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConfidenceBadge from "../../components/ConfidenceBadge";
import EvidenceList from "../../components/EvidenceList";
import SubjectTags from "../../components/SubjectTags";
import { usePatternStore } from "../../store/patternStore";
import { Pattern } from "../../types";

export default function PatternDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { resolvePattern } = usePatternStore();

  // Parse pattern data from route params
  const pattern: Pattern = JSON.parse(params.pattern as string);

  // Handle resolve pattern
  const handleResolve = () => {
    Alert.alert(
      "Mark as Resolved",
      `Are you sure you want to mark "${pattern.title}" as resolved? This will remove it from your active patterns list.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Mark Resolved",
          style: "destructive",
          onPress: async () => {
            try {
              await resolvePattern(pattern.$id);
              Alert.alert("Success", "Pattern marked as resolved.", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.error("Resolve error:", error);
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Unable to mark pattern as resolved. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  // Handle practice button (placeholder)
  const handlePractice = () => {
    Alert.alert(
      "Coming Soon",
      "Practice questions feature will be available soon!",
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200 flex-row items-center">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2 -ml-2"
        >
          <Text className="text-2xl text-purple-600">←</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-xl font-bold text-gray-800">Pattern Details</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        {/* Pattern Title and Confidence */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-3">
            {pattern.title}
          </Text>
          <ConfidenceBadge confidence={pattern.confidence} />
        </View>

        {/* Subject Tags */}
        {pattern.subject_distribution && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Affected Subjects
            </Text>
            <SubjectTags subjectDistribution={pattern.subject_distribution} />
          </View>
        )}

        {/* Pattern Description */}
        <View className="mb-6">
          <Text className="text-base text-gray-700 leading-6">
            {pattern.description}
          </Text>
        </View>

        {/* Evidence Section */}
        <View className="mb-6">
          <EvidenceList evidence={pattern.evidence} />
        </View>

        {/* Recommendation Box */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-xl p-5 mb-6"
        >
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">💡</Text>
            <Text className="text-white font-bold text-lg">
              AI Recommendation
            </Text>
          </View>
          <Text className="text-white text-base leading-6">
            {pattern.recommendation}
          </Text>
        </LinearGradient>

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          {/* Practice Similar Questions Button */}
          <TouchableOpacity
            onPress={handlePractice}
            className="bg-purple-600 rounded-lg py-4 px-6"
          >
            <Text className="text-white text-center font-semibold text-base">
              Practice Similar Questions
            </Text>
          </TouchableOpacity>

          {/* Mark as Resolved Button */}
          <TouchableOpacity
            onPress={handleResolve}
            className="bg-gray-200 rounded-lg py-4 px-6"
          >
            <Text className="text-gray-800 text-center font-semibold text-base">
              Mark as Resolved
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
