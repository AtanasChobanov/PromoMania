import { optionRegisterStyles } from "@/components/pages/optionsRegister/optionRegisterStyles";
import { darkTheme, lightTheme } from "@/components/styles/theme";
import { getFontSize } from "@/components/utils/dimenstions";
import { useSettings } from "@/contexts/SettingsContext";
import React from "react";
import { Switch, Text, View } from "react-native";

interface SettingRowProps {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  title,
  description,
  value,
  onToggle
}) => {
  const { isDarkMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View
      style={[
        optionRegisterStyles.settingRow,
        {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.border
        }
      ]}
    >
      <View style={optionRegisterStyles.settingText}>
        <Text
          style={[
            optionRegisterStyles.settingTitle,
            {
              fontSize: getFontSize(isSimpleMode ? 20 : 18),
              color: theme.colors.textPrimary
            }
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            optionRegisterStyles.settingDescription,
            {
              fontSize: getFontSize(isSimpleMode ? 16 : 14),
              color: theme.colors.textSecondary
            }
          ]}
        >
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#767577", true: "rgba(46, 170, 134, 1)" }}
        thumbColor={value ? "rgba(103, 218, 191, 1)" : "#f4f3f4"}
        ios_backgroundColor="#767577"
      />
    </View>
  );
};
