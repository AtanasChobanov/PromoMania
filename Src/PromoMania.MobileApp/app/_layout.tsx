import { SettingsProvider } from '@/contexts/SettingsContext';
import { QueryProvider } from '@/services/providers/QueryProvider';
import { Stack } from "expo-router";
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../globals.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryProvider>
        <SettingsProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              animation: 'slide_from_right',
            }}
          >
            {/* Nested layout groups automatically pick up their _layout.tsx */}
            <Stack.Screen name="(login)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(profile)" />
            <Stack.Screen name="products" />
            <Stack.Screen name="subcategories" />
            <Stack.Screen name="productsCategories" />
            <Stack.Screen name="delivaryAndMap" />
          </Stack>
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
