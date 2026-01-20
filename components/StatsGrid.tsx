import React from "react";
import { Text, View } from "react-native";

interface StatsGridProps {
  stats: {
    totalQuestions: number;
    mistakes: number;
    accuracy: string;
    patternsDetected: number;
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const StatCard = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%]">
      <Text className="text-2xl font-bold text-purple-600 mb-1">{value}</Text>
      <Text className="text-xs text-gray-600">{label}</Text>
    </View>
  );

  return (
    <View className="flex-row flex-wrap gap-3">
      <StatCard label="Questions Answered" value={stats.totalQuestions} />
      <StatCard label="Mistakes Made" value={stats.mistakes} />
      <StatCard label="Accuracy" value={`${stats.accuracy}%`} />
      <StatCard label="Patterns Detected" value={stats.patternsDetected} />
    </View>
  );
}
