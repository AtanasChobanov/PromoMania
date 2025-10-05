import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import React from 'react';
import { ImageBackground, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

const SettingsScreen: React.FC = () => {
  const {
    isDarkMode,
    isPerformanceMode,
    isSimpleMode,
    toggleDarkMode,
    togglePerformanceMode,
    toggleSimpleMode,
  } = useSettings();

  const theme = isDarkMode ? darkTheme : lightTheme;

  const SettingRow = ({ 
    title, 
    description, 
    value, 
    onToggle 
  }: { 
    title: string; 
    description: string; 
    value: boolean; 
    onToggle: () => void;
  }) => (
    <View style={[
      styles.settingRow,
      { 
        backgroundColor: theme.colors.cardBackground,
        borderColor: theme.colors.border,
      }
    ]}>
      <View style={styles.settingText}>
        <Text style={[
          styles.settingTitle,
          { 
            fontSize: getFontSize(isSimpleMode ? 20 : 18),
            color: theme.colors.textPrimary,
          }
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.settingDescription,
          { 
            fontSize: getFontSize(isSimpleMode ? 16 : 14),
            color: theme.colors.textSecondary,
          }
        ]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#007AFF' : '#f4f3f4'}
        ios_backgroundColor="#767577"
      />
    </View>
  );

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: theme.colors.mainBackground }
    ]}>
       <ImageBackground
              source={theme.backgroundImage} 
              style={styles.backgroundImage} 
              resizeMode="cover"
            >
      <ScrollView 
        contentContainerStyle={{ paddingTop: hp(2) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[
          styles.header,
          { 
            fontSize: getFontSize(isSimpleMode ? 32 : 28),
            color: theme.colors.textPrimary,
            marginTop:hp(5)
          }
        ]}>
          Настройки
        </Text>

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
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

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
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

        <View style={styles.section}>
          <Text style={[
            styles.sectionTitle,
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

        <View style={{ height: hp(10) }} />
      </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontWeight: 'bold',
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    marginTop: hp(1),
  },
  section: {
    marginTop: hp(2),
  },
  sectionTitle: {
    fontWeight: '600',
    marginHorizontal: wp(5),
    marginBottom: hp(1),
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: wp(5),
    marginBottom: hp(1.5),
    padding: wp(4),
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    flex: 1,
    marginRight: wp(3),
  },
  settingTitle: {
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  settingDescription: {
    lineHeight: 20,
  },
   backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default SettingsScreen;