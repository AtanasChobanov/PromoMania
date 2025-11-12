import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { ComponentType } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';
import Svg, { Path } from 'react-native-svg';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const wp = (percentage: number) => (percentage * screenWidth) / 100;
const hp = (percentage: number) => (percentage * screenHeight) / 100;
const getFontSize = (size: number) => {
  if (screenWidth < 350) return size * 0.85;
  if (screenWidth > 400) return size * 1.1;
  return size;
};

export default function SubcategoryProductLayout() {
  const router = useRouter();
  const { categoryName } = useLocalSearchParams();
  const { isDarkMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const segments = useSegments();

  // Get the current screen (last part of the path)
  const currentRoute = segments[segments.length - 1];

  const showTopBar = currentRoute !== 'mapDelivery'; // hide for mapDelivery
  const BackButton = (isPerformanceMode ? View : BlurView) as ComponentType<any>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.SafeviewColor }} edges={['top']}>
      {showTopBar && (
        <View style={styles.topbar}>
          <LinearGradient
            colors={theme.colors.TopBarColors}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            {isPerformanceMode ? (
                         <View 
                   
                           style={[styles.tabBarBlur,{backgroundColor:theme.colors.backgroundColor}]} 
                         />
                       ) : (
                         <BlurView 
                           intensity={20} 
                           tint={theme.colors.TabBarColors as 'light' | 'dark'}
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
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{categoryName}</Text>
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

const styles = StyleSheet.create({
  topbar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 100,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    paddingTop: hp(2.2)
  },
  backButton: {
    width: 40,
    height: 40,
    top:scale(6),
    borderRadius: 20,
    borderColor: 'white',
    borderStyle: 'solid',
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    marginRight: 40,
  },
  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
  },
});