import { CartIcon } from '@/components/icons/CartIcon';
import { CategoriesIcon } from '@/components/icons/CategoryIcon';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { ProfilePicIcon } from '@/components/icons/ProfilePicIcon';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { SettingsIcon } from '@/components/icons/SettingsIcon';
import { TabIcon } from '@/components/pages/tabsLayout/TabIcon';
import { tabsLayoutStyles } from '@/components/pages/tabsLayout/tabsLayoutStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, router, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale } from 'react-native-size-matters';

const SearchButton = React.memo(({ bottomInset, isFocused }: { bottomInset: number; isFocused: boolean }) => {
  const { isDarkMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <>

      <TouchableOpacity
        style={[tabsLayoutStyles.searchButton]}
        onPress={() => router.push('/search')}
        activeOpacity={0.8}
      >
        <>
          {isPerformanceMode ? (
            <View style={[tabsLayoutStyles.tabBarBlur, { backgroundColor: theme.colors.textGreen }]} />
          ) : (
            <BlurView 
              intensity={50} 
              experimentalBlurMethod="dimezisBlurView"
              tint={theme.colors.TabBarColors as 'light' | 'dark'}
              style={tabsLayoutStyles.searchButtonBlur}
            />
          )}
        </>   
        <View style={{ zIndex: 1 }}>
          <SearchIcon color={theme.colors.textPrimary} size={24} />
        </View>
      </TouchableOpacity>

      {/* Focused Search Button */}
      {isFocused && (
        <TouchableOpacity
          style={[tabsLayoutStyles.searchButtonFocused]}
          onPress={() => router.push('/search')}
          activeOpacity={0.8}
        >
          <BlurView 
            experimentalBlurMethod="dimezisBlurView"
            intensity={50} 
            tint={theme.colors.GlassColor}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={{ zIndex: 1 }}>
            <SearchIcon color={theme.colors.textPrimary} size={24} />
          </View>
        </TouchableOpacity>
      )}
    </>
  );
});

SearchButton.displayName = 'SearchButton';

const TopBar = React.memo(() => {
  const { isDarkMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <View style={[tabsLayoutStyles.topbar, { paddingTop: 10 }]}>
      <LinearGradient
        colors={theme.colors.TopBarColors}
        locations={[0, 0.6, 1]}
        pointerEvents="none"

        style={tabsLayoutStyles.gradientBackground}
      />
       <TouchableOpacity 
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() => router.push('/(profile)/settings')}
        style={{ zIndex: 2 }}
      >
        <View style={[tabsLayoutStyles.settingsButton,{borderColor:"#FFFFFF", borderWidth:1}]}>
          <>
            {isPerformanceMode ? (
              <View 
        
                style={[tabsLayoutStyles.tabBarBlur,{backgroundColor:theme.colors.backgroundColor}]} 
              />
            ) : (
              <BlurView 
                intensity={20} 
                tint={theme.colors.GlassColor}
                experimentalBlurMethod="dimezisBlurView"
                style={[StyleSheet.absoluteFillObject,]}
              />
            )}
          </>   
          <ProfilePicIcon color={theme.colors.textPrimary} size={30} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() => router.push('/(profile)/settings')}
        style={{ zIndex: 2 }}
      >
        <View style={[tabsLayoutStyles.settingsButton,{borderColor:"#FFFFFF", borderWidth:1}]}>
          <>
            {isPerformanceMode ? (
              <View 
        
                style={[tabsLayoutStyles.tabBarBlur,{backgroundColor:theme.colors.backgroundColor}]} 
              />
            ) : (
              <BlurView 
                intensity={20} 
                tint={theme.colors.GlassColor}
                experimentalBlurMethod="dimezisBlurView"
                style={[StyleSheet.absoluteFillObject,]}
              />
            )}
          </>   
          <SettingsIcon color={theme.colors.textPrimary} size={30} />
        </View>
      </TouchableOpacity>
    </View>
  );
});

TopBar.displayName = 'TopBar';

const Layout = () => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const pathname = usePathname();
  
  // Check if search route is active
  const isSearchFocused = pathname === '/search';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.SafeviewColor }} edges={['top']}>
        <View style={{ flex: 1, }}>
          <TopBar />
          
          <Tabs
            screenOptions={{
              tabBarShowLabel: false,
              tabBarItemStyle: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: scale(30),
              },
              tabBarStyle: {
                position: 'absolute',
                bottom: moderateScale(28),
                paddingLeft: scale(10),
                paddingRight: scale(10),
                marginHorizontal: scale(10),
                height: moderateScale(70),
                width: scale(265),
                borderRadius: scale(70),
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: "white",
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 30,
                elevation: 10,
              },
              tabBarBackground: () => (
                <>
                  {isPerformanceMode ? (
                    <LinearGradient
                      colors={theme.colors.blueTeal} 
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[tabsLayoutStyles.tabBarBlur]}
                      
                    />
                  ) : (
                    <BlurView
                      intensity={50}
                      tint={theme.colors.GlassColorReverse}
                      experimentalBlurMethod="dimezisBlurView"
                      style={tabsLayoutStyles.tabBarBlur}
                    />
                  )}
                </>   
              ),
            }}
          >
            <Tabs.Screen
              name="home"
              options={{
                headerShown: false,
                title: 'Home',
                tabBarIcon: ({ focused }) => (
                  <TabIcon
                    focused={focused}
                    IconComponent={HomeIcon}
                    title={'Начало'}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="cart"
              options={{
                headerShown: false,
                title: 'Cart',
                tabBarIcon: ({ focused }) => (
                  <TabIcon
                    focused={focused}
                    IconComponent={CartIcon}
                    title={'Количка'}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="categories"
              options={{
                headerShown: false,
                title: 'Categories',
                tabBarIcon: ({ focused }) => (
                  <TabIcon
                    focused={focused}
                    IconComponent={CategoriesIcon}
                    title={'Секции'}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="search"
              options={{
                href: null,
                headerShown: false
              }}
            />
          </Tabs>
          
          <SearchButton bottomInset={insets.bottom} isFocused={isSearchFocused} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};



export default Layout;