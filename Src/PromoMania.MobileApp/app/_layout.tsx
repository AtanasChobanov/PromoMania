// app/_layout.tsx
import { SettingsProvider } from '@/contexts/SettingsContext';
import { QueryProvider } from '@/services/providers/QueryProvider';
import { AuthGuard, AuthProvider } from '@/services/useAuth'; // Import BOTH
import { Stack } from "expo-router";
import { StyleSheet, Text } from 'react-native'; // Added Text here
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import "../globals.css";


(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryProvider>
        <SettingsProvider>
          <AuthProvider>
            {/* AuthGuard sits here. It only re-renders itself on route change, 
                not the AuthProvider or the contexts above it. */}
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});