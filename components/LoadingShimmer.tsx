import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function LoadingShimmer() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  const ShimmerCard = () => (
    <Animated.View
      style={{ opacity }}
      className="bg-gray-200 rounded-2xl p-5 mb-3"
    >
      <View className="bg-gray-300 h-6 w-3/4 rounded mb-3" />
      <View className="bg-gray-300 h-4 w-full rounded mb-2" />
      <View className="bg-gray-300 h-4 w-5/6 rounded mb-4" />
      <View className="flex-row justify-between">
        <View className="bg-gray-300 h-8 w-24 rounded" />
        <View className="bg-gray-300 h-8 w-20 rounded" />
      </View>
    </Animated.View>
  );

  return (
    <View>
      <ShimmerCard />
      <ShimmerCard />
      <ShimmerCard />
    </View>
  );
}
