import { productLayoutStyles } from '@/components/pages/productLayout/productLayoutStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';



export default function ProductLayout() {
  const router = useRouter();
  const { productName } = useLocalSearchParams<{ productName: string }>();
  const { isDarkMode,isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor:theme.colors.SafeviewColor }} edges={['top']}>
        <View style={productLayoutStyles.topbar}>
          <LinearGradient
            colors={theme.colors.TopBarColors}
            locations={[0, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[productLayoutStyles.backButton]}
          >
            {isPerformanceMode ? (
              <View 
        
                style={[productLayoutStyles.tabBarBlur,{backgroundColor:theme.colors.backgroundColor}]} 
              />
            ) : (
              <BlurView 
                 intensity={20} 
                           tint={theme.colors.GlassColor}
                experimentalBlurMethod="dimezisBlurView"
                style={[StyleSheet.absoluteFillObject,]}
              />
            )}
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18l-6-6 6-6"
                stroke={theme.colors.textPrimary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* Dynamic Title */}
          <Text style={[productLayoutStyles.title, { color: theme.colors.textPrimary }]}>
            {decodeURIComponent(productName ?? 'Продукт')}
          </Text>
        </View>

        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="[productID]" />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

