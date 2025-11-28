import { SettingsProvider } from '@/contexts/SettingsContext';
import { QueryProvider } from '@/services/providers/QueryProvider';
import { AuthGuard, AuthProvider } from '@/services/useAuth';
import { Stack } from "expo-router";
import { Platform, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import "../globals.css";

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

function RootContent() {
  const insets = useSafeAreaInsets();



  return (
    <View style={[styles.container,         { paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }]}>
      <QueryProvider>
        <SettingsProvider>
          <AuthProvider>
            <AuthGuard>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="(login)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(profile)" />
                <Stack.Screen name="products" />
                <Stack.Screen name="subcategories" />
                <Stack.Screen name="productsCategories" />
                <Stack.Screen name="delivaryAndMap" />
              </Stack>
            </AuthGuard>
          </AuthProvider>
        </SettingsProvider>
      </QueryProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <RootContent />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});