import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { deleteUserId, getUserId } from '@/components/utils/UUID';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@react-navigation/elements';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
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
const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const loadUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);
    const handleDelete = async () => {
    await deleteUserId();
    setUserId(null);
    Alert.alert('User ID deleted successfully');
  };

  if (!userId) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading user ID...</Text>
      </View>
    );
  }
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
      styles.settingRow,
      { 
        backgroundColor: theme.colors.cardBackground,
        borderColor: theme.colors.border,
      }
      
    ]} onPress={pressed}>
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
          <View style={styles.arrowContainer}>
                <Text style={[styles.arrow, { color: theme.colors.textPrimary, opacity: 0.6 }]}>›</Text>
              </View>
    </Pressable>
  );


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
        trackColor={{ false: '#767577', true: 'rgba(46, 170, 134, 1)' }}
        thumbColor={value ? 'rgba(103, 218, 191, 1)' : '#f4f3f4'}
        ios_backgroundColor="#767577"
      />
    </View>
  );

  return (

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
            marginTop:moderateScale(40)
          }
        ]}>
          Настройки
        </Text>
          <Text style={[
            styles.sectionTitle,
            { 
              fontSize: getFontSize(isSimpleMode ? 12 : 16),
              color: theme.colors.textSecondary,
            }
          ]}>
            Профил
          </Text>

          <SettingPageNav
            title="Редкатирай си профила"
            description="Промени си името, местополжението, пароли и др."
            value={isSimpleMode}
            onToggle={toggleSimpleMode}
            pressed={() => router.navigate('/(profile)/userSettings')}

          />
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
            <Text style={[
            styles.sectionTitle,
            { 
              fontSize: getFontSize(isSimpleMode ? 12 : 16),
              color: theme.colors.textSecondary,
            }
          ]}>
            Правна информация
          </Text>

          <SettingPageNav
            title="Правна информация"
            description="Детайли относно източниците на данни, авторски права и принципа на добросъвестно използване (fair use)"
            value={isSimpleMode}
            onToggle={toggleSimpleMode}
            pressed={() => router.navigate('/(profile)/ToS')}
          />
          <Text>Debugging:</Text>
          <Text>{userId ?? 'Loading...'}</Text>
         <Button onPress={handleDelete} color="red">
  Delete User ID
</Button>
        <View style={{ height: hp(10) }} />
      </ScrollView>
      </ImageBackground>

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
    arrowContainer: {
      marginLeft: moderateScale(8),
    },
    arrow: {
      fontSize: moderateScale(36),
      fontWeight: '200',
    },
});

export default SettingsScreen;