import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Pattern } from "../types";
import ConfidenceBadge from "./ConfidenceBadge";
import SubjectTags from "./SubjectTags";

interface PatternCardProps {
  pattern: Pattern;
  onPress: () => void;
  onResolve: () => void;
}

export default function PatternCard({
  pattern,
  onPress,
  onResolve,
}: PatternCardProps) {
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
      activeOpacity={0.7}
    >
      {/* Title and Confidence Badge */}
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-lg font-bold text-gray-800 flex-1 mr-2">
          {pattern.title}
        </Text>
        <ConfidenceBadge confidence={pattern.confidence} />
      </View>

      {/* Description */}
      <Text className="text-sm text-gray-600 mb-3">
        {truncateText(pattern.description)}
      </Text>

      {/* Evidence Count */}
      <View className="flex-row items-center mb-3">
        <Text className="text-purple-600 mr-1">📊</Text>
        <Text className="text-xs text-gray-500">
          {pattern.evidence.length} evidence{" "}
          {pattern.evidence.length === 1 ? "item" : "items"}
        </Text>
      </View>

      {/* Subject Tags */}
      {pattern.subject_distribution && (
        <View className="mb-3">
          <SubjectTags subjectDistribution={pattern.subject_distribution} />
        </View>
      )}

      {/* Recommendation Preview */}
      <View className="bg-purple-50 rounded-lg p-3 mb-3">
        <Text className="text-xs text-purple-700">
          💡 {truncateText(pattern.recommendation, 80)}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={onPress}
          className="bg-purple-600 rounded-lg px-4 py-2"
        >
          <Text className="text-white text-sm font-semibold">View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onResolve();
          }}
          className="bg-gray-200 rounded-lg px-4 py-2"
        >
          <Text className="text-gray-700 text-sm font-semibold">Resolve</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
