import React from "react";
import { ScrollView, Text, View } from "react-native";

interface SubjectTagsProps {
  subjectDistribution?: {
    Physics?: number;
    Chemistry?: number;
    Biology?: number;
  };
}

export default function SubjectTags({ subjectDistribution }: SubjectTagsProps) {
  // Don't render if no subject distribution data
  if (!subjectDistribution) {
    return null;
  }

  // Filter out subjects with 0 or undefined counts
  const subjects = Object.entries(subjectDistribution).filter(
    ([_, count]) => count && count > 0,
  );

  // Don't render if no subjects have mistakes
  if (subjects.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row"
    >
      {subjects.map(([subject, count]) => (
        <View
          key={subject}
          className="bg-gray-100 rounded-full px-3 py-1.5 mr-2"
        >
          <Text className="text-xs text-gray-700 font-medium">
            {subject}: {count} {count === 1 ? "mistake" : "mistakes"}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
