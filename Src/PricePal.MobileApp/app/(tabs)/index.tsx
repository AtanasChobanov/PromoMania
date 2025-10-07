
import { CategoryButton } from '@/components/boxes/CategoryButton';
import { ProductSection } from '@/components/boxes/ProductSection';
import { styles } from '@/components/styles/homeStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, Text, View } from "react-native";
import { useProducts } from '../../services/useProducts';



// Defines the different types of sections that can appear in the home screen list
type SectionItem = {
  type: 'header' | 'categories' | 'products' | 'loading' | 'spacer';
  title?: string;
  products?: any[];
  gradientColors?: string[];
  categories?: string[];
};



// Separator component between category buttons (3% screen width)
const CategorySeparator = () => <View style={{ width: wp(3) }} />;

// Individual category button - memoized to prevent unnecessary re-renders
const CategoryItem = React.memo(({ item, index }: { item: string; index: number }) => (
  <CategoryButton title={item} index={index} />
));
CategoryItem.displayName = 'CategoryItem';



const Index: React.FC = () => {

  
  // Get product data from API hook
  const { products, loading, error, isDataAvailable } = useProducts();
  
  // Get user settings (dark mode, performance mode, simple mode)
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  
  // Select appropriate theme based on dark mode setting
  const theme = isDarkMode ? darkTheme : lightTheme;
  

  // Category list - changes based on simple mode (3 vs 5 categories)
  const categories = useMemo(
    () =>
      isSimpleMode
        ? ["Месо", "Зеленчуци", "Плодове"]
        : ["Месо", "Зеленчуци", "Плодове", "Хляб", "Млечни"],
    [isSimpleMode]
  );

  // Build the entire list structure with all sections
  const listData: SectionItem[] = useMemo(() => {
    // Don't show anything while initial loading
    if (loading && !isDataAvailable()) return [];
    if (error && !isDataAvailable()) return [];

    // Split products into different categories
    const filteredProducts = {
      ourChoice: products.slice(0, 3),      // First 3 products
      top: products.slice(3, 6),            // Next 3 products
      mostSold: products.slice(6, 9),       // Next 3 products
      kaufland: [] as any[],                // Products from Kaufland
      lidl: [] as any[],                    // Products from Lidl
      billa: [] as any[],                   // Products from Billa
      tmarket: [] as any[],                 // Products from TMarket
    };

    // Filter products by store chain (only in advanced mode)
    if (!isSimpleMode && products.length > 0) {
      products.forEach(p => {
        const chain = p.chain?.toLowerCase();
        if (chain === 'kaufland') filteredProducts.kaufland.push(p);
        else if (chain === 'lidl') filteredProducts.lidl.push(p);
        else if (chain === 'billa') filteredProducts.billa.push(p);
        else if (chain === 'tmarket') filteredProducts.tmarket.push(p);
      });
    }

    // Build the main sections array
    const sections: SectionItem[] = [
      // Title section at the top
      { type: 'header' },
      
      // Horizontal scrolling category buttons
      { type: 'categories', categories },
      
      // Main product sections (always visible)
      { 
        type: 'products', 
        title: 'Нашият избор', 
        products: filteredProducts.ourChoice, 
        gradientColors: theme.colors.blueTeal 
      },
      { 
        type: 'products', 
        title: 'Топ продукти', 
        products: filteredProducts.top, 
        gradientColors: theme.colors.blueTeal 
      },
      { 
        type: 'products', 
        title: 'Най-купувани продукти', 
        products: filteredProducts.mostSold, 
        gradientColors: theme.colors.blueTeal 
      },
    ];

    // Add store-specific sections (only in advanced mode)
    if (!isSimpleMode) {
      sections.push(
        { 
          type: 'products', 
          title: 'Предложения от Kaufland', 
          products: filteredProducts.kaufland, 
          gradientColors: theme.colors.blueTeal 
        },
        { 
          type: 'products', 
          title: 'Предложения от Lidl', 
          products: filteredProducts.lidl, 
          gradientColors: theme.colors.lavenderPurple 
        },
        { 
          type: 'products', 
          title: 'Предложения от Billa', 
          products: filteredProducts.billa, 
          gradientColors: theme.colors.peachPink 
        },
        { 
          type: 'products', 
          title: 'Предложения от TMarket', 
          products: filteredProducts.tmarket, 
          gradientColors: theme.colors.blueTeal 
        }
      );
    }

    // Bottom spacing for better scrolling experience
    sections.push({ type: 'spacer' });
    
    // Show loading indicator at bottom during background refresh
    if (loading && isDataAvailable()) {
      sections.push({ type: 'loading' });
    }

    return sections;
  }, [products, loading, error, isDataAvailable, isSimpleMode, categories, theme]);


  
  // Generate unique key for each section item
  const keyExtractor = (item: SectionItem, index: number) => 
    `${item.type}-${index}-${item.title || ''}`;

  // Generate unique key for each category button

  const categoryKeyExtractor = (cat: string, idx: number) => `category-${cat}`;

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
      
      // Product section (horizontal scrolling products)
      case 'products':
        if (!item.products || item.products.length === 0) return null;
        return (
          <ProductSection 
            title={item.title!} 
            products={item.products} 
            gradientColors={item.gradientColors as [string, string, ...string[]]} 
          />
        );
      
      // Loading spinner at bottom during refresh
      case 'loading':
        return (
          <View style={styles.backgroundRefresh}>
            <ActivityIndicator size="small" color={theme.colors.loadingIndicator} />
          </View>
        );
      
      // Empty space at bottom for better UX
      case 'spacer':
        return <View style={{ height: hp(13) }} />;
      
      default:
        return null;
    }
  }, [isSimpleMode, theme, renderCategory, categoryKeyExtractor]);

 
  
  // Show full-screen loading on initial load
  if (loading && !isDataAvailable()) {
    return (
      <View style={[styles.backgroundImage, { backgroundColor: theme.colors.mainBackground }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.loadingIndicator} />
        </View>
      </View>
    );
  }

  // Show error screen if loading failed
  if (error && !isDataAvailable()) {
    return (
      <View style={[styles.backgroundImage, { backgroundColor: theme.colors.mainBackground }]}>
        <View style={styles.errorContainer}>
          <Text style={[
            styles.errorText, 
            { 
              fontSize: getFontSize(isSimpleMode ? 24 : 20),
              color: theme.colors.textPrimary 
            }
          ]}>
            Грешка при зареждане на продуктите
          </Text>
          <Text style={[
            styles.errorDetails, 
            { 
              fontSize: getFontSize(isSimpleMode ? 18 : 16),
              color: theme.colors.textSecondary 
            }
          ]}>
            {error?.message}
          </Text>
        </View>
      </View>
    );
  }


  
  // Determine if we should use background image
  
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
      maintainVisibleContentPosition={
        loading && isDataAvailable() 
          ? { minIndexForVisible: 0 }
          : undefined
      }
      disableVirtualization={false}
    />
  );

return(
   <ImageBackground 
        source={theme.backgroundImage} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        {content}
      </ImageBackground>
)
   


};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(Index);