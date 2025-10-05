import { styles } from '@/components/styles/homeStyles';
import React, { useCallback, useState } from 'react';
import {
  TouchableOpacity
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Svg, { Path } from "react-native-svg";


export const HeartIcon: React.FC<{ filled?: boolean }> = React.memo(({ filled = false }) => {
  const [isFavorite, setIsFavorite] = useState(filled);
  const scaleAnim = useSharedValue(1);
  
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }]
  }));
  
const toggleFavorite = useCallback(() => {
  setIsFavorite(prev => !prev);
  
  scaleAnim.value = withSequence(
    withTiming(1.3, { duration: 150 }),
    withTiming(1, { duration: 150 })
  );
}, []);

  return (
    <Animated.View style={scaleStyle}>
      <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite} activeOpacity={0.7}>
        <Svg viewBox="0 0 24 24" width={24} height={24}>
          <Path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={isFavorite ? "#1F2937" : "transparent"}
            stroke="#1F2937"
            strokeWidth={2}
          />
        </Svg>
      </TouchableOpacity>
    </Animated.View>
  );
});
HeartIcon.displayName = "HeartIcon";