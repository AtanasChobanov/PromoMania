import { darkTheme, lightTheme } from "@/components/styles/theme";
import { useSettings } from "@/contexts/SettingsContext";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { tabsLayoutStyles } from "./tabsLayoutStyles";

export const TabIcon = React.memo(({ focused, IconComponent, title }: any) => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  if (focused) {
    return (
      <View style={[tabsLayoutStyles.focusedTab, { overflow: 'hidden', elevation:2 }]}>
        <BlurView 
          experimentalBlurMethod="dimezisBlurView"
          intensity={30} 
          tint='systemUltraThinMaterialDark'
          style={StyleSheet.absoluteFillObject}
        />
        <View style={{ zIndex: 1 }}>
          <IconComponent color={theme.colors.textPrimary} size={20} />
        </View>
        <Text style={[tabsLayoutStyles.focusedText, { zIndex: 1, color: theme.colors.textPrimary }]}>{title}</Text>
      </View>
    );
  }
  
  return (
    <View style={tabsLayoutStyles.defaultTab}>
      <IconComponent color={theme.colors.textPrimary} size={20} />
      <Text style={[tabsLayoutStyles.defaultText, { color: theme.colors.textPrimary }]}>{title}</Text>
    </View>
  );
});

TabIcon.displayName = 'TabIcon';