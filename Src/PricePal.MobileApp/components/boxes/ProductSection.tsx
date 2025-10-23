import { styles } from '@/components/styles/homeStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import { Product, SectionType, useProductSection } from '@/services/useProducts';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  View
} from "react-native";
import Animated, {
  FadeIn
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ProductBox } from './ProductBox';

// Simple separator component
const ItemSeparator = () => <View style={{ width: wp(4) }} />;

// ChevronRight Icon Component
const ChevronRight = ({ size = 24, color = '#000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M9 18l6-6-6-6" 
      stroke={color} 
      strokeWidth={2} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

// Product wrapper component
const ProductItem = React.memo(({ 
  item, 
  index, 
  gradientColors,
  section
}: { 
  item: Product; 
  index: number; 
  gradientColors: [string, string, ...string[]];
  section: SectionType;
}) => (
  <View style={{ marginBottom: hp(1.5) }}>  
    <ProductBox
      productName={item.name}
      brand={item.brand || ''}
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

interface ProductSectionProps {
  section: SectionType;
  gradientColors: [string, string, ...string[]];
  initialLimit?: number;
}

export const ProductSection: React.FC<ProductSectionProps> = React.memo(({ 
  section, 
  gradientColors,
  initialLimit = 4 
}) => {
  const { isDarkMode, isSimpleMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Use the lazy loading hook
  const { products, title, loading, hasMore, loadMore, error } = useProductSection(section, initialLimit);
  
  const flatListRef = useRef<FlatList>(null);
  const loadMoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
    };
  }, []);

  // Key extractor - ensure globally unique keys across all sections
  const keyExtractor = useCallback((item: Product, index: number) => {
    // Create a unique key by combining section, product ID, and index
    // This ensures no conflicts even if same product appears in multiple sections
    const uniqueKey = `${section}-${item.id || 'no-id'}-${index}`;
    return uniqueKey;
  }, [section]);

  // Render item
  const renderProduct = useCallback(({ item, index }: { item: Product; index: number }) => (
    <ProductItem item={item} index={index} gradientColors={gradientColors} section={section} />
  ), [gradientColors, section]);

  // Handle end reached for lazy loading
  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      // Debounce the load more call
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
      
      loadMoreTimeoutRef.current = setTimeout(() => {
        loadMore();
      }, 300);
    }
  }, [hasMore, loading, loadMore]);

  // Manual load more button handler
  const handleLoadMorePress = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  // Render footer with loading indicator or load more button
  const renderFooter = useCallback(() => {
 

    if (hasMore) {
      return (
        <Pressable
          onPress={handleLoadMorePress}
          style={{
            width: wp(40),
            height: wp(82),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundColor,
            borderRadius: 16,
            marginLeft: wp(2),
            borderWidth: 2,
            borderColor: 'rgba(0,0,0,0.1)',
            borderStyle: 'dashed'
          }}
        >
          <ChevronRight 
            size={wp(10)} 
            color={theme.colors.textSecondary}
          />
          <Text style={{
            fontSize: getFontSize(14),
            color: theme.colors.textSecondary,
            marginTop: hp(1),
            fontWeight: '600'
          }}>
            Зарежда се още..
          </Text>
        </Pressable>
      );
    }

    return null;
  }, [loading, hasMore, theme, handleLoadMorePress]);

  // Show error if there is one
  if (error && products.length === 0) {
    return (
      <View style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
        <Text style={[
          styles.sectionTitle,
          { 
            fontSize: getFontSize(isSimpleMode ? 22 : 20),
            color: theme.colors.textPrimary 
          }
        ]}>
          {title || section}
        </Text>
        <View style={{
          padding: wp(4),
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          borderRadius: 12,
          marginTop: hp(1)
        }}>
          <Text style={{ 
            color: '#DC2626', 
            fontSize: getFontSize(14) 
          }}>
            Грешка при зареждане: {error.message}
          </Text>
        </View>
      </View>
    );
  }

  // Don't render if no products
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
        {products.length > 0 && (
          <Text style={{
            fontSize: getFontSize(12),
            color: theme.colors.textSecondary,
            marginTop: hp(0.5)
          }}>
            {products.length} продукт{products.length !== 1 ? 'а' : ''}
            {hasMore && ' • плъзнете за още'}
          </Text>
        )}
      </View>
      <FlatList
        ref={flatListRef}
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp(4) }}
        ItemSeparatorComponent={ItemSeparator}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        maxToRenderPerBatch={isPerformanceMode ? 2 : 3}
        windowSize={isPerformanceMode ? 3 : 5}
        initialNumToRender={initialLimit}
        scrollEventThrottle={16}
        decelerationRate="fast"
        updateCellsBatchingPeriod={100}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
      />
    </>
  );

  // Conditionally wrap with animation
  if (isPerformanceMode) {
    return <View>{content}</View>;
  }

  return (
    <Animated.View entering={FadeIn.duration(100)}>
      {content}
    </Animated.View>
  );
});

ProductSection.displayName = "ProductSection";