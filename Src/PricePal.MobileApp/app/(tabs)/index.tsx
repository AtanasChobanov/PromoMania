import { CategoryButton } from '@/components/boxes/CategoryButton';
import { ProductSection } from '@/components/boxes/ProductSection';
import { styles } from '@/components/styles/homeStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, Text, View } from "react-native";
import { useProducts } from '../../services/useProducts';

type SectionItem = {
  type: 'header' | 'categories' | 'products' | 'loading' | 'spacer';
  title?: string;
  products?: any[];
  gradientColors?: string[];
  categories?: string[];
};

const Index: React.FC = () => {
  const { products, loading, error, isDataAvailable } = useProducts();
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const categories = useMemo(() => 
    isSimpleMode 
      ? ["Месо", "Зеленчуци", "Плодове"] 
      : ["Месо", "Зеленчуци", "Плодове", "Хляб", "Млечни"], 
  [isSimpleMode]);

  // Build flat list data structure
  const listData: SectionItem[] = useMemo(() => {
    if (loading && !isDataAvailable()) return [];
    if (error && !isDataAvailable()) return [];

    const filteredProducts = {
      ourChoice: products.slice(0, 3),
      top: products.slice(3, 6),
      mostSold: products.slice(6, 9),
      kaufland: [] as any[],
      lidl: [] as any[],
      billa: [] as any[],
      tmarket: [] as any[],
    };

    if (!isSimpleMode && products.length > 0) {
      products.forEach(p => {
        const chain = p.chain?.toLowerCase();
        if (chain === 'kaufland') filteredProducts.kaufland.push(p);
        else if (chain === 'lidl') filteredProducts.lidl.push(p);
        else if (chain === 'billa') filteredProducts.billa.push(p);
        else if (chain === 'tmarket') filteredProducts.tmarket.push(p);
      });
    }

    const sections: SectionItem[] = [
      { type: 'header' },
      { type: 'categories', categories },
      { type: 'products', title: 'Нашият избор', products: filteredProducts.ourChoice, gradientColors: theme.colors.blueTeal },
      { type: 'products', title: 'Топ продукти', products: filteredProducts.top, gradientColors: theme.colors.blueTeal },
      { type: 'products', title: 'Най-купувани продукти', products: filteredProducts.mostSold, gradientColors: theme.colors.blueTeal },
    ];

    if (!isSimpleMode) {
      sections.push(
        { type: 'products', title: 'Предложения от Kaufland', products: filteredProducts.kaufland, gradientColors: theme.colors.blueTeal },
        { type: 'products', title: 'Предложения от Lidl', products: filteredProducts.lidl, gradientColors: theme.colors.lavenderPurple },
        { type: 'products', title: 'Предложения от Billa', products: filteredProducts.billa, gradientColors: theme.colors.peachPink },
        { type: 'products', title: 'Предложения от TMarket', products: filteredProducts.tmarket, gradientColors: theme.colors.blueTeal }
      );
    }

    sections.push({ type: 'spacer' });
    
    if (loading && isDataAvailable()) {
      sections.push({ type: 'loading' });
    }

    return sections;
  }, [products, loading, error, isDataAvailable, isSimpleMode, categories, theme]);

  const keyExtractor = useCallback((item: SectionItem, index: number) => {
    return `${item.type}-${index}-${item.title || ''}`;
  }, []);

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
            renderItem={({ item: cat, index }) => <CategoryButton title={cat} index={index} />}
            keyExtractor={(cat, idx) => `category-${idx}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(2) }}
            ItemSeparatorComponent={() => <View style={{ width: wp(3) }} />}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            windowSize={5}
            initialNumToRender={3}
            scrollEventThrottle={16}
          />
        );
      
      case 'products':
        if (!item.products || item.products.length === 0) return null;
        return (
          <ProductSection 
            title={item.title!} 
            products={item.products} 
            gradientColors={item.gradientColors as [string, string, ...string[]]} 
          />
        );
      
      case 'loading':
        return (
          <View style={styles.backgroundRefresh}>
            <ActivityIndicator size="small" color={theme.colors.loadingIndicator} />
          </View>
        );
      
      case 'spacer':
        return <View style={{ height: hp(22) }} />;
      
      default:
        return null;
    }
  }, [isSimpleMode, theme]);

  const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = useCallback(({ children }) => {
    if (!theme.useBackgroundImage || isPerformanceMode) {
      return (
        <View style={[styles.backgroundImage, { backgroundColor: theme.colors.mainBackground }]}>
          {children}
        </View>
      );
    }
    
    return (
      <ImageBackground 
        source={theme.backgroundImage} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    );
  }, [theme, isPerformanceMode]);

  if (loading && !isDataAvailable()) {
    return (
      <BackgroundWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.loadingIndicator} />
        </View>
      </BackgroundWrapper>
    );
  }

  if (error && !isDataAvailable()) {
    return (
      <BackgroundWrapper>
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
            {error.message}
          </Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: hp(7) }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={isPerformanceMode ? 2 : 3}
        windowSize={isPerformanceMode ? 3 : 5}
        initialNumToRender={isPerformanceMode ? 2 : 3}
        scrollEventThrottle={16}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: hp(40), // Approximate height, adjust based on your sections
          offset: hp(40) * index,
          index,
        })}
      />
    </BackgroundWrapper>
  );
};

export default React.memo(Index);