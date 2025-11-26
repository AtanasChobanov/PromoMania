import { SettingRow } from "@/components/common/SettingRow";
import { optionRegisterStyles } from '@/components/pages/optionsRegister/optionRegisterStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/services/useAuth';
import React from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
const OptionsRegister: React.FC = () => {
  const { finishOnboarding } = useAuth();

  const {
    isDarkMode,
    isPerformanceMode,
    isSimpleMode,
    toggleDarkMode,
    togglePerformanceMode,
    toggleSimpleMode,
  } = useSettings();

  const theme = isDarkMode ? darkTheme : lightTheme;



  return (
    <ImageBackground
      source={theme.backgroundImage} 
      style={optionRegisterStyles.backgroundImage} 
      resizeMode="cover"
    >
      <ScrollView 
        contentContainerStyle={{ paddingTop: hp(2) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[
          optionRegisterStyles.header,
          { 
            fontSize: getFontSize(isSimpleMode ? 32 : 28),
            color: theme.colors.textPrimary,
            marginTop: hp(5)
          }
        ]}>
          Настройки
        </Text>

        <View style={optionRegisterStyles.section}>
          <Text style={[
            optionRegisterStyles.sectionTitle,
            { 
              fontSize: getFontSize(isSimpleMode ? 18 : 16),
              color: theme.colors.textSecondary,
            }
          ]}>
            ИЗГЛЕД
          </Text>

          <SettingRow
            title="Тъмен режим"
            description="Активирайте тъмна тема за по-малко напрежение на очите"
            value={isDarkMode}
            onToggle={toggleDarkMode}
          />
        </View>

        <View style={optionRegisterStyles.section}>
          <Text style={[
            optionRegisterStyles.sectionTitle,
            { 
              fontSize: getFontSize(isSimpleMode ? 18 : 16),
              color: theme.colors.textSecondary,
            }
          ]}>
            ПРОИЗВОДИТЕЛНОСТ
          </Text>

          <SettingRow
            title="Режим на производителност"
            description="Премахва анимации и сложни ефекти за по-бързо представяне"
            value={isPerformanceMode}
            onToggle={togglePerformanceMode}
          />
        </View>

        <View style={optionRegisterStyles.section}>
          <Text style={[
            optionRegisterStyles.sectionTitle,
            { 
              fontSize: getFontSize(isSimpleMode ? 18 : 16),
              color: theme.colors.textSecondary,
            }
          ]}>
            ДОСТЪПНОСТ
          </Text>

          <SettingRow
            title="Опростен режим"
            description="По-голям шрифт и опростен интерфейс за по-лесна употреба"
            value={isSimpleMode}
            onToggle={toggleSimpleMode}
          />
        </View>

        {/* 3. Update the Continue Button */}
        <TouchableOpacity
          style={[optionRegisterStyles.button, { backgroundColor:'rgba(46,170,134,1)' }]}
          onPress={finishOnboarding} // 
          activeOpacity={0.8}
        >
          <Text style={[optionRegisterStyles.buttonText, { color: 'white' }]}>
            Продължи
          </Text>
        </TouchableOpacity>
        
        <View style={{ height: hp(10) }} />
      </ScrollView>
    </ImageBackground>
  );
};



export default OptionsRegister;