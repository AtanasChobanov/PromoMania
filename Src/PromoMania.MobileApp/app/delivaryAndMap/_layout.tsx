import { delivaryAndMapStyles } from '@/components/pages/delivaryAndMapLayout/delivaryAndMapStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

export default function SubcategoryProductLayout() {
  const router = useRouter();
  const { categoryName } = useLocalSearchParams();
  const { isDarkMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const segments = useSegments();

  const currentRoute = segments[segments.length - 1];

  const showTopBar = currentRoute !== 'mapDelivery'; 
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.SafeviewColor }} edges={['top']}>
      {showTopBar && (
        <View style={delivaryAndMapStyles.topbar}>
          <LinearGradient
            colors={theme.colors.TopBarColors}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity onPress={() => router.back()} style={delivaryAndMapStyles.backButton}>
            {isPerformanceMode ? (
                         <View 
                   
                           style={[delivaryAndMapStyles.tabBarBlur,{backgroundColor:theme.colors.backgroundColor}]} 
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
          <Text style={[delivaryAndMapStyles.title, { color: theme.colors.textPrimary }]}>{categoryName}</Text>
        </View>
      )}

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="mapDelivery" options={{ headerShown: false }} />
        <Stack.Screen name="choiceDelivary" />
      </Stack>
    </SafeAreaView>
  );
}

