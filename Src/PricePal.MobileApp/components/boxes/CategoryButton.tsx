import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
  Text,
  TouchableOpacity
} from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { styles } from '../styles/homeStyles';
import { getFontSize, wp } from '../utils/dimenstions';


export const CategoryButton: React.FC<{ title: string; index: number }> = React.memo(({ title, index }) => {
  const buttonWidth = useMemo(() => Math.max(wp(35), 120), []);
  const scaleAnim = useSharedValue(1);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }]
  }));

 const handlePressIn = () => {
  scaleAnim.value = withTiming(0.95, { duration: 100 });
};

const handlePressOut = () => {
  scaleAnim.value = withTiming(1, { duration: 100 });
};
  
  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 80).duration(500).springify()}
    >
      <Animated.View style={scaleStyle}>
        <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.9}>
          <LinearGradient 
            style={[styles.categories, { width: buttonWidth }]}
            colors={['rgba(203,230,246,1)', 'rgba(143,228,201,1)']}
            start={{ x: 0, y: 1 }}
          >
            <Text style={[styles.categoryText, { fontSize: getFontSize(16) }]} numberOfLines={1}>
              {title}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});
CategoryButton.displayName = "CategoryButton";