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
  const { isDarkMode, isSimpleMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Increased width for simple mode to accommodate larger text
  const buttonWidth = useMemo(() => {
    const baseWidth = isSimpleMode ? wp(40) : wp(35);
    return Math.max(baseWidth, isSimpleMode ? 140 : 120);
  }, [isSimpleMode]);

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

  const OutherLayerContainer = isPerformanceMode ? View : Animated.View;
  const InnerLayerContainer = isPerformanceMode ? View : Animated.View;

  // Simple mode styling adjustments
  const simpleModeStyles = isSimpleMode ? {
    borderWidth: 2, // Thicker border for better visibility
    minHeight: 56, // Larger touch target
  } : {};

  const textSize = isSimpleMode ? getFontSize(20) : getFontSize(16);
  const textWeight = isSimpleMode ? '700' : '600'; // Bolder text in simple mode

  return (
    // Outer wrapper for layout animation (FadeInUp)
    <OutherLayerContainer entering={isPerformanceMode ? undefined : FadeInUp.delay(index * 80).duration(500).springify()}>
      {/* Inner wrapper for transform animation (scale) */}
      <InnerLayerContainer style={isPerformanceMode ? undefined : scaleStyle}>
        <TouchableOpacity 
          onPressIn={handlePressIn} 
          onPressOut={handlePressOut} 
          activeOpacity={0.9}
        >
          <View
            style={[
              styles.categories, 
              { 
                width: buttonWidth, 
                backgroundColor: theme.colors.backgroundColor, 
                borderColor: isSimpleMode ? theme.colors.textPrimary : "#FFFFFF", // Higher contrast border
                borderWidth: isSimpleMode ? 2 : 1,
              },
              simpleModeStyles
            ]}
          >
            <Text 
              style={[
                styles.categoryText, 
                { 
                  fontSize: textSize, 
                  color: theme.colors.textPrimary,
                  fontWeight: textWeight,
                  letterSpacing: isSimpleMode ? 0.5 : 0, // Better letter spacing for readability
                }
              ]} 
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        </TouchableOpacity>
      </InnerLayerContainer>
    </OutherLayerContainer>
  );
});

CategoryButton.displayName = "CategoryButton";