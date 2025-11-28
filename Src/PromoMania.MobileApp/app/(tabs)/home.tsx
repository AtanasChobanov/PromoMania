import { CategoryButton } from '@/components/pages/home/CategoryButton';
import { styles } from '@/components/pages/home/homeStyles';
import { ProductSection } from '@/components/pages/home/ProductSection';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import { SectionType, useProductSection } from '@/services/useProducts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
type SectionItem = {
  type: 'header' | 'categories' | 'product-section' | 'loading' | 'spacer';
  sectionType?: SectionType;
  title?: string;
  categories?: string[];
};

const CategorySeparator = () => <View style={{ width: wp(3) }} />;

const CategoryItem = React.memo(({ item, index }: { item: string; index: number }) => (
  <CategoryButton title={item} index={index} />
));
CategoryItem.displayName = 'CategoryItem';

// Loading Screen Component
const LoadingScreen = ({ theme }: { theme: typeof lightTheme }) => (
  <Animated.View
    entering={FadeIn.duration(200)}
    exiting={FadeOut.duration(200)}
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    }}
  >
    <ActivityIndicator size="large" color={theme.colors.textPrimary} />
    <Text style={{
      marginTop: hp(2),
      fontSize: getFontSize(16),
      color: theme.colors.textPrimary,
      fontWeight: '600'
    }}>
      Зареждане на продукти...
    </Text>
  </Animated.View>
);

const Home: React.FC = () => {
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Check the loading state of the first section to determine initial load

  const { loading: topSectionLoading } = useProductSection('top', 4);
  const { loading: ourChoiceLoading } = useProductSection('our-choice', 4);
  const { loading: kauflandLoading } = useProductSection('kaufland', 4);

  // Update loading state when at least the first few sections finish loading
  useEffect(() => {
    const allInitialSectionsLoaded = !topSectionLoading && !ourChoiceLoading && !kauflandLoading;
    
    if (allInitialSectionsLoaded && isInitialLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [topSectionLoading, ourChoiceLoading, kauflandLoading, isInitialLoading]);

  // Update loading state when top section finishes loading
  useEffect(() => {
    if (!topSectionLoading && isInitialLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [topSectionLoading, isInitialLoading]);

  const categories = useMemo(
    () =>
      isSimpleMode
        ? ["Месо", "Зеленчуци", "Плодове"]
        : ["Месо", "Зеленчуци", "Плодове", "Хляб", "Млечни"],
    [isSimpleMode]
  );

  const sectionsToShow: {
    sectionType: SectionType;
    title?: string;
    gradientColors: [string, string, ...string[]];
  }[] = useMemo(() => {
    const baseSections = [
      { 
        sectionType: 'our-choice' as SectionType, 
        gradientColors: theme.colors.lavenderPurple as [string, string, ...string[]]
      },
      { 
        sectionType: 'top' as SectionType, 
        gradientColors: theme.colors.blueTeal as [string, string, ...string[]]
      },
      
         { 
          sectionType: 'kaufland' as SectionType, 
          gradientColors: theme.colors.blueTeal as [string, string, ...string[]]
        },
        { 
          sectionType: 'lidl' as SectionType, 
          gradientColors: theme.colors.lavenderPurple as [string, string, ...string[]]
        },
        { 
          sectionType: 'billa' as SectionType, 
          gradientColors: theme.colors.peachPink as [string, string, ...string[]]
        },
        { 
          sectionType: 'tmarket' as SectionType, 
          gradientColors: theme.colors.blueTeal as [string, string, ...string[]]
        }
    ];



    return baseSections;
  }, [isSimpleMode, theme]);

  const listData: SectionItem[] = useMemo(() => {
    const listSections: SectionItem[] = [
      { type: 'header' },
      { type: 'categories', categories },
    ];

    sectionsToShow.forEach(({ sectionType }) => {
      listSections.push({
        type: 'product-section',
        sectionType,
        
      });
    });

    listSections.push({ type: 'spacer' });

    return listSections;
  }, [categories, sectionsToShow]);

  const keyExtractor = useCallback((item: SectionItem, index: number) => 
    `${item.type}-${index}-${item.sectionType || ''}`, 
    []
  );

  const categoryKeyExtractor = useCallback((cat: string, idx: number) => 
    `category-${cat}`, 
    []
  );

  const renderCategory = useCallback(({ item, index }: { item: string; index: number }) => (
    <CategoryItem item={item} index={index} />
  ), []);

  const renderItem = useCallback(({ item }: { item: SectionItem }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.titleContainer}>
            <Text style={[
              styles.mainTitle, 
              { 
                fontSize: getFontSize(isSimpleMode ? 36 : 32),
                color: theme.colors.textPrimary 
              }
            ]}>
              Тази седмица
            </Text>
            <Text style={[
              styles.subtitle, 
              { 
                fontSize: getFontSize(isSimpleMode ? 22 : 20),
                color: theme.colors.textPrimary 
              }
            ]}>
              Топ категории
            </Text>
          </View>
        );
      
      case 'categories':
        return (
          <FlatList
            data={item.categories}
            renderItem={renderCategory}
            keyExtractor={categoryKeyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(2) }}
            ItemSeparatorComponent={CategorySeparator}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={7}
            initialNumToRender={5}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            getItemLayout={(data, index) => ({
              length: wp(28),
              offset: wp(28) * index + wp(3) * index,
              index,
            })}
          />
        );
      
      case 'product-section':
        if (!item.sectionType) return null;
        return (
          <ProductSection 
            section={item.sectionType}
            initialLimit={4}
          />
        );
      
      case 'spacer':
        return <View style={{ height: hp(13) }} />;
      
      default:
        return null;
    }
  }, [isSimpleMode, theme, renderCategory, categoryKeyExtractor]);

  const content = (
    <FlatList
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: hp(7) }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={isPerformanceMode ? 3 : 4}
      windowSize={isPerformanceMode ? 5 : 7}
      initialNumToRender={isPerformanceMode ? 3 : 4}
      scrollEventThrottle={16}
      updateCellsBatchingPeriod={50}
      disableVirtualization={false}
    />
  );

  return (
    <ImageBackground 
      source={theme.backgroundImage} 
      style={styles.backgroundImage} 
      resizeMode="cover"
    >
      {isInitialLoading ? (
        <LoadingScreen theme={theme} />
      ) : (
        content
      )}
    </ImageBackground>
  );
};

export default React.memo(Home);