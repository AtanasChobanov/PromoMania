import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import React, { useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  View
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
  const { isDarkMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

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
    // Outer wrapper for layout animation (FadeInUp)
    <Animated.View entering={FadeInUp.delay(index * 80).duration(500).springify()}>
      {/* Inner wrapper for transform animation (scale) */}
      <Animated.View style={scaleStyle}>
        <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.9}>
          <View
            style={[styles.categories, { width: buttonWidth, backgroundColor:theme.colors.backgroundColor }]}
            
          >
            <Text style={[styles.categoryText, { fontSize: getFontSize(16), color: theme.colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});

CategoryButton.displayName = "CategoryButton";