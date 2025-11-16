import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, router, usePathname } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const { height: ScreenHeight } = Dimensions.get('window');

// SVG Icons
const HomeIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12h6v10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CartIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="21" r="1" stroke={color} strokeWidth={2} />
    <Circle cx="20" cy="21" r="1" stroke={color} strokeWidth={2} />
    <Path
      d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CategoriesIcon = ({ color = '#000', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SearchIcon = ({ color = '#fff', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SettingsIcon = ({ color = '#000', size = 30 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.5} />
    <Path
      d="M13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74457 2.35523 9.35522 2.74458 9.15223 3.23463C9.05957 3.45834 9.0233 3.7185 9.00911 4.09799C8.98826 4.65568 8.70226 5.17189 8.21894 5.45093C7.73564 5.72996 7.14559 5.71954 6.65219 5.45876C6.31645 5.2813 6.07301 5.18262 5.83294 5.15102C5.30704 5.08178 4.77518 5.22429 4.35436 5.5472C4.03874 5.78938 3.80577 6.1929 3.33983 6.99993C2.87389 7.80697 2.64092 8.21048 2.58899 8.60491C2.51976 9.1308 2.66227 9.66266 2.98518 10.0835C3.13256 10.2756 3.3397 10.437 3.66119 10.639C4.1338 10.936 4.43789 11.4419 4.43786 12C4.43783 12.5581 4.13375 13.0639 3.66118 13.3608C3.33965 13.5629 3.13248 13.7244 2.98508 13.9165C2.66217 14.3373 2.51966 14.8691 2.5889 15.395C2.64082 15.7894 2.87379 16.193 3.33973 17C3.80568 17.807 4.03865 18.2106 4.35426 18.4527C4.77508 18.7756 5.30694 18.9181 5.83284 18.8489C6.07289 18.8173 6.31632 18.7186 6.65204 18.5412C7.14547 18.2804 7.73556 18.27 8.2189 18.549C8.70224 18.8281 8.98826 19.3443 9.00911 19.9021C9.02331 20.2815 9.05957 20.5417 9.15223 20.7654C9.35522 21.2554 9.74457 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8477 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.902C15.0117 19.3443 15.2977 18.8281 15.781 18.549C16.2643 18.2699 16.8544 18.2804 17.3479 18.5412C17.6836 18.7186 17.927 18.8172 18.167 18.8488C18.6929 18.9181 19.2248 18.7756 19.6456 18.4527C19.9612 18.2105 20.1942 17.807 20.6601 16.9999C21.1261 16.1929 21.3591 15.7894 21.411 15.395C21.4802 14.8691 21.3377 14.3372 21.0148 13.9164C20.8674 13.7243 20.6602 13.5628 20.3387 13.3608C19.8662 13.0639 19.5621 12.558 19.5621 11.9999C19.5621 11.4418 19.8662 10.9361 20.3387 10.6392C20.6603 10.4371 20.8675 10.2757 21.0149 10.0835C21.3378 9.66273 21.4803 9.13087 21.4111 8.60497C21.3592 8.21055 21.1262 7.80703 20.6602 7C20.1943 6.19297 19.9613 5.78945 19.6457 5.54727C19.2249 5.22436 18.693 5.08185 18.1671 5.15109C17.9271 5.18269 17.6837 5.28136 17.3479 5.4588C16.8545 5.71959 16.2644 5.73002 15.7811 5.45096C15.2977 5.17191 15.0117 4.65566 14.9909 4.09794C14.9767 3.71848 14.9404 3.45833 14.8477 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TabIcon = React.memo(({ focused, IconComponent, title }: any) => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  if (focused) {
    return (
      <View style={[styles.focusedTab, { overflow: 'hidden', elevation:2 }]}>
        <BlurView 
          experimentalBlurMethod="dimezisBlurView"
          intensity={30} 
          tint='systemUltraThinMaterialDark'
          style={StyleSheet.absoluteFillObject}
        />
        <View style={{ zIndex: 1 }}>
          <IconComponent color={theme.colors.textPrimary} size={20} />
        </View>
        <Text style={[styles.focusedText, { zIndex: 1, color: theme.colors.textPrimary }]}>{title}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.defaultTab}>
      <IconComponent color={theme.colors.textPrimary} size={20} />
      <Text style={[styles.defaultText, { color: theme.colors.textPrimary }]}>{title}</Text>
    </View>
  );
});

TabIcon.displayName = 'TabIcon';

const SearchButton = React.memo(({ bottomInset, isFocused }: { bottomInset: number; isFocused: boolean }) => {
  const { isDarkMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <>

      <TouchableOpacity
        style={[styles.searchButton]}
        onPress={() => router.push('/search')}
        activeOpacity={0.8}
      >
        <>
          {isPerformanceMode ? (
            <View style={[styles.tabBarBlur, { backgroundColor: theme.colors.textGreen }]} />
          ) : (
            <BlurView 
              intensity={50} 
              experimentalBlurMethod="dimezisBlurView"
              tint={theme.colors.TabBarColors as 'light' | 'dark'}
              style={styles.searchButtonBlur}
            />
          )}
        </>   
        <View style={{ zIndex: 1 }}>
          <SearchIcon color={theme.colors.textPrimary} size={24} />
        </View>
      </TouchableOpacity>

      {/* Focused Search Button - Rendered on top when focused */}
      {isFocused && (
        <TouchableOpacity
          style={[styles.searchButtonFocused]}
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
    <View style={[styles.topbar, { paddingTop: 10 }]}>
      <LinearGradient
        colors={theme.colors.TopBarColors}
        locations={[0, 0.6, 1]}
        pointerEvents="none"

        style={styles.gradientBackground}
      />
      <TouchableOpacity 
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() => router.push('/(profile)/profile')}
        style={{ zIndex: 2 }}
      >
        <Image className='w-[40px] h-[40px]' source={require("../../assets/icons/profile-pic.png")} />      
      </TouchableOpacity>
      <TouchableOpacity 
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() => router.push('/(profile)/settings')}
        style={{ zIndex: 2 }}
      >
        <View style={[styles.settingsButton,{borderColor:"#FFFFFF", borderWidth:1}]}>
          <>
            {isPerformanceMode ? (
              <View 
        
                style={[styles.tabBarBlur,{backgroundColor:theme.colors.backgroundColor}]} 
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
                      style={[styles.tabBarBlur]}
                      
                    />
                  ) : (
                    <BlurView
                      intensity={50}
                      tint={theme.colors.GlassColorReverse}
                      experimentalBlurMethod="dimezisBlurView"
                      style={styles.tabBarBlur}
                    />
                  )}
                </>   
              ),
            }}
          >
            <Tabs.Screen
              name="index"
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

const styles = StyleSheet.create({
  topbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 1,
    
  },

  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    justifyContent: 'center',
    borderRadius: 20,
    height: 40,
    width: 40,
    borderWidth: 1,
    borderColor: 'white',
  },

  focusedTab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(100),
    marginTop:  moderateScale(32),
    height: moderateScale(60),
    borderColor: "white",
    borderWidth: 0.5,
    paddingHorizontal: scale(12),
    minWidth: scale(90),
    maxWidth: scale(120),
    
  },
  focusedText: {
    marginLeft: moderateScale(5),
    fontSize: moderateScale(14),
    color: '#000000',
    fontWeight: '500',
  },
  defaultTab: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(38),
    height: verticalScale(20), 
    width: scale(70),
  },
  defaultText: {
    fontSize: moderateScale(13),
    color: '#000000',
    textAlign: 'center',
    marginTop: 4,
  },
  searchButton: {
    position: 'absolute',
    right: scale(13),
    width: scale(58),
    height: moderateScale(62),
    borderRadius: scale(202),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 15,
    elevation: 20,
    borderColor: "white",
    bottom: moderateScale(32)
  },
  searchButtonFocused: {
    position: 'absolute',
    right: scale(17),
    width: scale(50),
    height: moderateScale(52),
    borderRadius: scale(52),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 15,
    elevation: 20,
    borderColor: "white",
    bottom: moderateScale(37),
    zIndex: 10,
  },
  searchButtonBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  searchIcon: {
    width: 24,
    height: 24,
    zIndex: 1,
  },
  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default Layout;