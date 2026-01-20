import React from "react";
import { Text, View } from "react-native";

interface EvidenceListProps {
  evidence: string[];
}

export default function EvidenceList({ evidence }: EvidenceListProps) {
  return (
    <View className="bg-gray-100 rounded-xl p-4">
      <Text className="text-sm font-semibold text-gray-700 mb-3">
        Evidence from your tests
      </Text>
      {evidence.map((item, index) => (
        <View key={index} className="flex-row mb-2">
          <Text className="text-purple-600 mr-2">•</Text>
          <Text className="text-sm text-gray-700 flex-1">{item}</Text>
        </View>
      ))}
    </View>
  );
}
