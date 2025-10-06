import { styles } from '@/components/styles/homeStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import React, { useCallback } from 'react';
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

// Simple separator component
const ItemSeparator = () => <View style={{ width: wp(4) }} />;

// Product wrapper component
const ProductItem = ({ 
  item, 
  index, 
  gradientColors 
}: { 
  item: Product; 
  index: number; 
  gradientColors: [string, string, ...string[]];
}) => (
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
);

export const ProductSection: React.FC<{
  title: string;
  products: Product[];
  gradientColors: [string, string, ...string[]];
}> = React.memo(({ title, products, gradientColors }) => {
  const { isDarkMode, isSimpleMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Key extractor
  const keyExtractor = useCallback((item: Product, index: number) => 
    item.id?.toString() || `product-${title}-${index}`, 
    [title]
  );

  // Render item
  const renderProduct = useCallback(({ item, index }: { item: Product; index: number }) => (
    <ProductItem item={item} index={index} gradientColors={gradientColors} />
  ), [gradientColors]);

  if (!products || products.length === 0) return null;

  const titleStyle = [
    styles.sectionTitle, 
    { 
      fontSize: getFontSize(isSimpleMode ? 22 : 20),
      color: theme.colors.textPrimary 
    }
  ];

  const content = (
    <>
      <View style={styles.sectionHeader}>
        <Text style={titleStyle}>{title}</Text>
      </View>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp(4) }}
        ItemSeparatorComponent={ItemSeparator}
        removeClippedSubviews={true}
        maxToRenderPerBatch={isPerformanceMode ? 2 : 3}
        windowSize={isPerformanceMode ? 3 : 5}
        initialNumToRender={2}
        scrollEventThrottle={16}
        decelerationRate="fast"
        updateCellsBatchingPeriod={100}
      />
    </>
  );

  // Conditionally wrap with animation
  if (isPerformanceMode) {
    return <View>{content}</View>;
  }

  return (
    <Animated.View entering={FadeIn.duration(600)}>
      {content}
    </Animated.View>
  );
});

ProductSection.displayName = "ProductSection";