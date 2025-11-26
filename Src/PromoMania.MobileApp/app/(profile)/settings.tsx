
import { SettingRow } from '@/components/common/SettingRow';
import { settingStyles } from '@/components/pages/settings/settingsStyle';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/services/useAuth';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const SettingsScreen: React.FC = () => {
  const {
    isDarkMode,
    isPerformanceMode,
    isSimpleMode,
    toggleDarkMode,
    togglePerformanceMode,
    toggleSimpleMode,
  } = useSettings();
  const { logout } = useAuth();

const handleLogout = async () => {
  Alert.alert(
    'Потвърждение',
    'Сигурни ли сте, че искате да излезете?',
    [
      {
        text: 'Отказ',
        style: 'cancel',
      },
      {
        text: 'Изход',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            // Just navigate directly - simple!
            router.replace('/(login)/login');
          } catch (error) {
            Alert.alert('Грешка', 'Неуспешно излизане от профила');
          }
        },
      },
    ]
  );
};
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  const SettingPageNav = ({ 
    title, 
    description, 
    value, 
    onToggle,
    pressed
  }: { 
    title: string; 
    description: string; 
    value: boolean; 
    onToggle: () => void;
    pressed: () => void;
  }) => (
    <Pressable style={[
      settingStyles.settingRow,
      { 
        backgroundColor: theme.colors.cardBackground,
        borderColor: theme.colors.border,
      }
      
    ]} onPress={pressed}>
      <View style={settingStyles.settingText}>
        <Text style={[
          settingStyles.settingTitle,
          { 
            fontSize: getFontSize(isSimpleMode ? 20 : 18),
            color: theme.colors.textPrimary,
          }
        ]}>
          {title}
        </Text>
        <Text style={[
          settingStyles.settingDescription,
          { 
            fontSize: getFontSize(isSimpleMode ? 16 : 14),
            color: theme.colors.textSecondary,
          }
        ]}>
          {description}
        </Text>
      </View>
          <View style={settingStyles.arrowContainer}>
                <Text style={[settingStyles.arrow, { color: theme.colors.textPrimary, opacity: 0.6 }]}>›</Text>
              </View>
    </Pressable>
  );




  return (

       <ImageBackground
              source={theme.backgroundImage} 
              style={settingStyles.backgroundImage} 
              resizeMode="cover"
            >
      <ScrollView 
        contentContainerStyle={{ paddingTop: hp(2) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[
          settingStyles.header,
          { 
            fontSize: getFontSize(isSimpleMode ? 32 : 28),
            color: theme.colors.textPrimary,
            marginTop:moderateScale(40)
          }
        ]}>
          Настройки
        </Text>
          <Text style={[
            settingStyles.sectionTitle,
            { 
              fontSize: getFontSize(isSimpleMode ? 12 : 16),
              color: theme.colors.textSecondary,
            }
          ]}>
            Профил
          </Text>

          <SettingPageNav
            title="Редактирай си профила"
            description="Промени си името, местополжението, пароли и др."
            value={isSimpleMode}
            onToggle={toggleSimpleMode}
            pressed={() => router.navigate('/(profile)/userSettings')}

          />
        <View style={settingStyles.section}>
          <Text style={[
            settingStyles.sectionTitle,
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

        <View style={settingStyles.section}>
          <Text style={[
            settingStyles.sectionTitle,
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

        <View style={settingStyles.section}>
          <Text style={[
            settingStyles.sectionTitle,
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
            <Text style={[
            settingStyles.sectionTitle,
            { 
              fontSize: getFontSize(isSimpleMode ? 18 : 16),
              color: theme.colors.textSecondary,
            }
          ]}>
            ПРАВНА ИНФОРМАЦИЯ
          </Text>

          <SettingPageNav
            title="Правна информация"
            description="Детайли относно източниците на данни, авторски права и принципа на добросъвестно използване (fair use)"
            value={isSimpleMode}
            onToggle={toggleSimpleMode}
            pressed={() => router.navigate('/(profile)/ToS')}
          />
          <TouchableOpacity 
            style={[
              settingStyles.logoutButton,
              { 
                backgroundColor: '#dc3545',
                marginHorizontal: wp(5),
                marginTop: hp(3),
              }
            ]}
            onPress={handleLogout}
          >
            <Text style={[
              settingStyles.logoutText,
              { fontSize: getFontSize(isSimpleMode ? 18 : 16) }
            ]}>
              Изход
            </Text>
          </TouchableOpacity>
              

                  <View style={{ height: hp(10) }} />
                </ScrollView>
                </ImageBackground>

  );
};



export default SettingsScreen;