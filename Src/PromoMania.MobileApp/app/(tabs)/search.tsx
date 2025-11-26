import { SearchIcon } from '@/components/icons/SearchIcon';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import React, { useRef } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
const Search = () => {
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const inputRef = useRef<TextInput>(null);
  
  useFocusEffect(
    React.useCallback(() => {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);

      return () => clearTimeout(timeout);
    }, [])
  );

  return (
    <ImageBackground
      source={theme.backgroundImage}
      style={styles.backgroundImage}
    >
      <ScrollView
        style={styles.scrollView}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Title */}
        <View style={styles.searchContainer}>
          
          <BlurView
            intensity={50}
        tint={theme.colors.TabBarColors as 'light' | 'dark'}
            experimentalBlurMethod="dimezisBlurView"
            style={styles.blurView}
          >
           <SearchIcon color={theme.colors.textPrimary} size={20}/>
            <TextInput
              ref={inputRef}
              placeholder="Какво Търсиш"
              onChangeText={() => {}}
              placeholderTextColor={theme.colors.textPrimary}
              style={styles.textInput}
            />
          </BlurView>
          <Text style={[styles.cancelText,{color:theme.colors.textPrimary}]}>Откажи</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollView: {
    paddingTop: 80,
  },
  scrollViewContent: {
    paddingHorizontal: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  blurView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'white',
  },

  textInput: {
    width: '75%',
    marginLeft: 8,
  },
  cancelText: {
    textDecorationLine: 'underline',
  },
  categories: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 20,
  },
  button: {
    alignItems: 'center',
  },
});

export default Search;