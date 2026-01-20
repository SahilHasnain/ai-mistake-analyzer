import React from "react";
import { Text, View } from "react-native";

interface ConfidenceBadgeProps {
  confidence: number;
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const isHighConfidence = confidence >= 85;
  const bgColor = isHighConfidence ? "bg-green-500" : "bg-yellow-500";

  return (
    <View className={`${bgColor} px-3 py-1 rounded-full`}>
      <Text className="text-white text-xs font-semibold">
        {confidence}% confident
      </Text>
    </View>
  );
}
