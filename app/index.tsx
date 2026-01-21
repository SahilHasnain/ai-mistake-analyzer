import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LoadingShimmer from "../components/LoadingShimmer";
import PatternCard from "../components/PatternCard";
import StatsGrid from "../components/StatsGrid";
import { usePatternStore } from "../store/patternStore";
import { getUserId } from "../utils/getUserId";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();

  // Access store state and actions
  const {
    patterns,
    loading,
    analyzing,
    stats,
    fetchPatterns,
    fetchStats,
    analyzePatterns,
    resolvePattern,
  } = usePatternStore();

  // Local state for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Animated pulse for AI status badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = await getUserId();
        await fetchPatterns(userId);
      } catch (error) {
        console.error("Failed to load patterns:", error);
        Alert.alert(
          "Error Loading Patterns",
          error instanceof Error
            ? error.message
            : "Unable to load patterns. Please check your connection and try again.",
        );
      }

      try {
        const userId = await getUserId();
        await fetchStats(userId);
      } catch (error) {
        console.error("Failed to load stats:", error);
        // Stats failure is less critical, just log it
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    const userId = await getUserId();

    try {
      await Promise.all([fetchPatterns(userId), fetchStats(userId)]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert(
        "Refresh Failed",
        error instanceof Error
          ? error.message
          : "Unable to refresh data. Please try again.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Handle analyze button press
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
              Alert.alert(
                "Analysis Complete",
                "Your patterns have been updated with the latest insights.",
              );
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

  // Handle resolve pattern
  const handleResolve = (patternId: string, patternTitle: string) => {
    Alert.alert(
      "Mark as Resolved",
      `Are you sure you want to mark "${patternTitle}" as resolved? This will remove it from your active patterns list.`,
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
              await resolvePattern(patternId);
              Alert.alert("Success", "Pattern marked as resolved.");
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-6 pb-8"
      >
        {/* App Title, Subtitle, and Analyze Button */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1">
            <Text className="mb-2 text-3xl font-bold text-white">
              Pattern Analyzer
            </Text>
            <Text className="text-sm text-purple-100">
              AI-powered insights for NEET preparation
            </Text>
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={analyzing}
            className={`px-4 py-2 rounded-lg ${
              analyzing ? "bg-purple-300" : "bg-white"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                analyzing ? "text-purple-100" : "text-purple-600"
              }`}
            >
              {analyzing ? "Analyzing..." : "Analyze"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Status Badge */}
        <View className="flex-row items-center">
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
            className="w-2 h-2 mr-2 bg-green-400 rounded-full"
          />
          <Text className="text-xs font-medium text-white">
            AI Analysis Ready
          </Text>
        </View>
      </LinearGradient>

      {/* Content area */}
      <ScrollView
        className="flex-1 px-6 pt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Alert Banner for Detected Patterns */}
        {patterns.length > 0 && (
          <View className="flex-row items-center p-4 mb-6 border border-red-200 bg-red-50 rounded-xl">
            <Text className="mr-3 text-2xl">⚠️</Text>
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-red-800">
                {patterns.length} Pattern{patterns.length === 1 ? "" : "s"}{" "}
                Detected
              </Text>
              <Text className="text-xs text-red-600">
                Review your mistake patterns below to improve your performance
              </Text>
            </View>
          </View>
        )}

        {/* Stats Grid */}
        <View className="mb-6">
          <StatsGrid
            stats={{
              ...stats,
              patternsDetected: patterns.length,
            }}
          />
        </View>

        {/* Take Test Button */}
        <TouchableOpacity
          onPress={() => router.push("/test")}
          className="flex-row items-center justify-center px-6 py-4 mb-6 bg-purple-600 rounded-xl"
        >
          <Text className="mr-2 text-lg font-bold text-white">📝</Text>
          <Text className="text-lg font-bold text-white">Take a Test</Text>
        </TouchableOpacity>

        {/* Patterns Section */}
        <View className="mb-6">
          <Text className="mb-4 text-xl font-bold text-gray-800">
            Detected Patterns
          </Text>

          {/* Loading State */}
          {loading && <LoadingShimmer />}

          {/* Empty State */}
          {!loading && patterns.length === 0 && (
            <View className="items-center p-8 bg-white rounded-2xl">
              <Text className="mb-4 text-6xl">🎯</Text>
              <Text className="mb-2 text-lg font-semibold text-gray-800">
                No Patterns Detected Yet
              </Text>
              <Text className="text-sm text-center text-gray-600">
                Complete some tests and run AI analysis to discover your mistake
                patterns
              </Text>
            </View>
          )}

          {/* Patterns List */}
          {!loading &&
            patterns.map((pattern) => (
              <PatternCard
                key={pattern.$id}
                pattern={pattern}
                onPress={() => {
                  router.push({
                    pathname: "/pattern/[id]",
                    params: {
                      id: pattern.$id,
                      pattern: JSON.stringify(pattern),
                    },
                  });
                }}
                onResolve={() => {
                  handleResolve(pattern.$id, pattern.title);
                }}
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
