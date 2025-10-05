import { styles } from '@/components/styles/homeStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  Text,
  View
} from "react-native";
import Animated, {
  FadeIn
} from 'react-native-reanimated';
import { Product } from '../types/types';
import { ProductBox } from './ProductBox';


// Memoized separator to prevent re-renders
const ItemSeparator = React.memo(() => <View style={{ width: wp(4) }} />);
ItemSeparator.displayName="ItemSeparator";
// Memoized product wrapper to isolate re-renders
const ProductItem = React.memo<{ 
  item: Product; 
  index: number; 
  gradientColors: [string, string, ...string[]];
}>(({ item, index, gradientColors }) => (
  <View style={{ marginBottom: hp(1.5) }}>  
    <ProductBox
      productName={item.name}
      brand={item.chain}
      priceBgn={item.priceBgn}
      priceEur={item.priceEur}
      unit={item.unit}
      photo={item.imageUrl}
      colors={gradientColors}
      index={index}
    />
  </View>
));

ProductItem.displayName = 'ProductItem';

export const ProductSection: React.FC<{
  title: string;
  products: Product[];
  gradientColors: [string, string, ...string[]];
}> = React.memo(({ title, products, gradientColors }) => {
  const { isDarkMode, isSimpleMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Stable key extractor
  const keyExtractor = useCallback((item: Product, index: number) => 
    item.id?.toString() || `product-${title}-${index}`, 
    [title]
  );

  // getItemLayout for scroll optimization
  const getItemLayout = useCallback((_data: any, index: number) => {
    const itemWidth = wp(45); // approximate width of ProductBox
    const separatorWidth = wp(4);
    return {
      length: itemWidth,
      offset: (itemWidth + separatorWidth) * index,
      index,
    };
  }, []);

  // Render item with stable reference
  const renderProduct = useCallback(({ item, index }: { item: Product; index: number }) => (
    <ProductItem item={item} index={index} gradientColors={gradientColors} />
  ), [gradientColors]);

  // Memoize content container style
  const contentContainerStyle = useMemo(() => ({ 
    paddingHorizontal: wp(4) 
  }), []);

  // Memoize title style
  const titleStyle = useMemo(() => [
    styles.sectionTitle, 
    { 
      fontSize: getFontSize(isSimpleMode ? 22 : 20),
      color: theme.colors.textPrimary 
    }
  ], [isSimpleMode, theme.colors.textPrimary]);

  if (!products || products.length === 0) return null;

  // Use View instead of Animated.View in performance mode
  const Container = isPerformanceMode ? View : Animated.View;
  const animationProps = isPerformanceMode ? {} : { entering: FadeIn.duration(600) };

  return (
    <Container {...animationProps}>
      <View style={styles.sectionHeader}>
        <Text style={titleStyle}>{title}</Text>
      </View>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        ItemSeparatorComponent={ItemSeparator}
        removeClippedSubviews={true}
        maxToRenderPerBatch={isPerformanceMode ? 2 : 3}
        windowSize={isPerformanceMode ? 3 : 5}
        initialNumToRender={2}
        // SDK 54 optimizations
        scrollEventThrottle={16}
        decelerationRate="fast"
        // Prevent unnecessary re-renders
        updateCellsBatchingPeriod={100}
      />
    </Container>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.title === nextProps.title &&
    prevProps.products.length === nextProps.products.length &&
    prevProps.gradientColors[0] === nextProps.gradientColors[0] &&
    prevProps.gradientColors[1] === nextProps.gradientColors[1] &&
    prevProps.products === nextProps.products // Reference equality check
  );
});

ProductSection.displayName = "ProductSection";