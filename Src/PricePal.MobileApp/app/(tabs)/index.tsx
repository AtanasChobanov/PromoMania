import { CategoryButton } from '@/components/boxes/CategoryButton';
import { ProductSection } from '@/components/boxes/ProductSection';
import { styles } from '@/components/styles/homeStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { getUserId } from '@/components/utils/UUID';
import { useSettings } from '@/contexts/SettingsContext';
import { SectionType } from '@/services/useProducts';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, ImageBackground, Text, View } from "react-native";

// Defines the different types of sections that can appear in the home screen list
type SectionItem = {
  type: 'header' | 'categories' | 'product-section' | 'loading' | 'spacer';
  sectionType?: SectionType;
  title?: string;
  gradientColors?: [string, string, ...string[]];
  categories?: string[];
};

// Separator component between category buttons (3% screen width)
const CategorySeparator = () => <View style={{ width: wp(3) }} />;

// Individual category button - memoized to prevent unnecessary re-renders
const CategoryItem = React.memo(({ item, index }: { item: string; index: number }) => (
  <CategoryButton title={item} index={index} />
));
CategoryItem.displayName = 'CategoryItem';

const Home: React.FC = () => {
  // Get user settings (dark mode, performance mode, simple mode)
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  
  // Select appropriate theme based on dark mode setting
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Initialize user ID on mount
  useEffect(() => {
    const initUser = async () => {
      const id = await getUserId();
      console.log('User ID:', id);
    };
    initUser();
  }, []);

  // Category list - changes based on simple mode (3 vs 5 categories)
  const categories = useMemo(
    () =>
      isSimpleMode
        ? ["Месо", "Зеленчуци", "Плодове"]
        : ["Месо", "Зеленчуци", "Плодове", "Хляб", "Млечни"],
    [isSimpleMode]
  );

  // Define which sections to show
  const sectionsToShow: {
    sectionType: SectionType;
    title?: string;
    gradientColors: [string, string, ...string[]];
  }[] = useMemo(() => {
    const baseSections = [
      { 
        sectionType: 'top' as SectionType, 
        gradientColors: theme.colors.blueTeal as [string, string, ...string[]]
      },
      { 
        sectionType: 'our-choice' as SectionType, 
        gradientColors: theme.colors.lavenderPurple as [string, string, ...string[]]
      },
    ];

    // Add store sections only in advanced mode
    if (!isSimpleMode) {
      baseSections.push(
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
      );
    }

    return baseSections;
  }, [isSimpleMode, theme]);

  // Build the entire list structure with all sections
  const listData: SectionItem[] = useMemo(() => {
    const listSections: SectionItem[] = [
      // Title section at the top
      { type: 'header' },
      
      // Horizontal scrolling category buttons
      { type: 'categories', categories },
    ];

    // Add each product section
    sectionsToShow.forEach(({ sectionType, gradientColors }) => {
      listSections.push({
        type: 'product-section',
        sectionType,
        gradientColors
      });
    });

    // Bottom spacing for better scrolling experience
    listSections.push({ type: 'spacer' });

    return listSections;
  }, [categories, sectionsToShow]);

  // Generate unique key for each section item
  const keyExtractor = useCallback((item: SectionItem, index: number) => 
    `${item.type}-${index}-${item.sectionType || ''}`, 
    []
  );

  // Generate unique key for each category button
  const categoryKeyExtractor = useCallback((cat: string, idx: number) => 
    `category-${cat}`, 
    []
  );

  // Render function for category buttons
  const renderCategory = useCallback(({ item, index }: { item: string; index: number }) => (
    <CategoryItem item={item} index={index} />
  ), []);

  // Main render function for each section type
  const renderItem = useCallback(({ item }: { item: SectionItem }) => {
    switch (item.type) {
      // Header section with titles
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
      
      // Horizontal scrolling category buttons
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
      
      // Product section with lazy loading (now powered by React Query!)
      case 'product-section':
        if (!item.sectionType) return null;
        return (
          <ProductSection 
            section={item.sectionType}
            gradientColors={item.gradientColors!}
            initialLimit={4}
          />
        );
      
      // Empty space at bottom for better UX
      case 'spacer':
        return <View style={{ height: hp(13) }} />;
      
      default:
        return null;
    }
  }, [isSimpleMode, theme, renderCategory, categoryKeyExtractor]);

  // Main scrollable content
  const content = (
    <FlatList
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: hp(7) }}
      // Performance optimizations
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
      {content}
    </ImageBackground>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(Home);