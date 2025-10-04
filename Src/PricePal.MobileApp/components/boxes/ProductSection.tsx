import { styles } from '@/components/styles/homeStyles';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
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

export const ProductSection: React.FC<{
  title: string;
  products: Product[];
  gradientColors: [string, string, ...string[]];
}> = React.memo(({ title, products, gradientColors }) => {
  const renderProduct = useCallback(({ item, index }: { item: Product; index: number }) => (
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
  ), [gradientColors]);

  const keyExtractor = useCallback((item: Product, index: number) => 
    item.id || `product-${index}`, []
  );

  if (!products || products.length === 0) return null;

  return (
    <Animated.View entering={FadeIn.duration(600)}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontSize: getFontSize(20) }]}>{title}</Text>
      </View>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp(4) }}
        ItemSeparatorComponent={() => <View style={{ width: wp(4) }} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={2}
      />
    </Animated.View>
  );
});
ProductSection.displayName = "ProductSection";