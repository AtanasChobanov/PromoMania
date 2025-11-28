import { cartStyles } from '@/components/pages/cart/cartStyles';
import { OverviewPrice } from "@/components/pages/cart/OverviewPrice";
import { ProductBox } from "@/components/pages/cart/ProductBox";
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useCartSuggestions, useShoppingCart } from '@/services/useShoppingCart';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';



const Cart: React.FC = () => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [isPriceExpanded, setIsPriceExpanded] = useState(false);
  
  //Add state for tracking content and layout dimensions
  const [contentHeight, setContentHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  
  const {
    items,
    totalPrice,
    itemCount,
    isLoading,
    error,
    refresh,
    removeItem,
    updateItemQuantity
  } = useShoppingCart();

  const { bestOffer, isLoading: isSuggestionsLoading } = useCartSuggestions();

  const totalSavings = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.product.prices[0]?.discount) {
        const originalPrice = item.product.prices[0].priceBgn || 0;
        const discountAmount = (originalPrice * Math.abs(item.product.prices[0].discount) / 100);
        return sum + (discountAmount * item.quantity);
      }
      return sum;
    }, 0);
  }, [items]);
  const totalSavingsEur = useMemo(() => {
  return items.reduce((sum, item) => {
    if (item.product.prices[0]?.discount) {
      const originalPriceEur = item.product.prices[0].priceEur || 0;
      const discountAmount = (originalPriceEur * Math.abs(item.product.prices[0].discount) / 100);
      return sum + (discountAmount * item.quantity);
    }
    return sum;
  }, 0);
}, [items]);

  const products = useMemo(() => {
    return items.map(item => ({
      publicId: item.publicId,
      productPublicId: item.product.publicId,
      name: item.product.name,
      brand: item.product.brand,
      price: item.product.prices[0]?.priceBgn || 0,
      priceEur: item.product.prices[0]?.priceEur || 0,
      unit: item.product.unit,
      imageUrl: item.product.imageUrl,
      quantity: item.quantity,
      discount: item.product.prices[0]?.discount,
    }));
  }, [items]);

  //Callback to handle content size changes
  const handleContentSizeChange = useCallback((width: number, height: number) => {
    setContentHeight(height);
  }, []);

  //Callback to handle layout changes
  const handleLayout = useCallback((event: any) => {
    setLayoutHeight(event.nativeEvent.layout.height);
  }, []);

  //Auto-expand when content is not scrollable
  useEffect(() => {
    if (contentHeight > 0 && layoutHeight > 0) {
      const isScrollable = contentHeight > layoutHeight;
      
      if (!isScrollable && !isPriceExpanded) {
        setIsPriceExpanded(true);
      }
    }
  }, [contentHeight, layoutHeight, isPriceExpanded, products.length]);

  const handleDeleteProduct = useCallback(async (cartItemId: string) => {
    try {
      await removeItem(cartItemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }, [removeItem]);

  const handleViewDetails = useCallback((productPublicId: string) => {
    router.push(`/products/${productPublicId}`);
  }, []);

  const handleSaveForLater = useCallback((cartItemId: string) => {
    console.log('Save for later:', cartItemId);
  }, []);

  const renderProduct = useCallback(({ item, index }: { item: typeof products[0]; index: number }) => (
    <ProductBox
      key={item.publicId}
      publicId={item.publicId}
      name={item.name}
      brand={item.brand}
      price={item.price}
      priceEur={item.priceEur}
      unit={item.unit}
      imageUrl={item.imageUrl}
      quantity={item.quantity}
      discount={item.discount}
      index={index}
      onDelete={() => handleDeleteProduct(item.publicId)}
      onViewDetails={() => handleViewDetails(item.productPublicId)}
      onSaveForLater={() => handleSaveForLater(item.publicId)}
    />
  ), [handleDeleteProduct, handleViewDetails, handleSaveForLater]);

  const keyExtractor = useCallback((item: typeof products[0]) => item.publicId, []);

  const ListHeaderComponent = useMemo(() => (
    <View style={cartStyles.titleContainer}>
      <Text style={[cartStyles.mainTitle, { fontSize: moderateScale(30), color: theme.colors.textPrimary }]}>
        Количка
      </Text>
      {itemCount > 0 && (
        <Text style={[cartStyles.itemCount, { color: theme.colors.textPrimary }]}>
          {itemCount} {itemCount === 1 ? 'артикул' : 'артикула'}
        </Text>
      )}
    </View>
  ), [theme.colors.textPrimary, itemCount]);

  const displayPriceBgn = bestOffer?.totalPriceBgn ?? totalPrice.bgn;
  const displayPriceEur = bestOffer?.totalPriceEur ?? totalPrice.eur;

  const ListFooterComponent = useMemo(() => (
    <View style={{ height: moderateScale(360) }} />
  ), []);

  const ListEmptyComponent = useMemo(() => (
    <View style={cartStyles.emptyContainer}>
      <Text style={[cartStyles.emptyText, { color: theme.colors.textPrimary }]}>
        Количката ви е празна
      </Text>
      <TouchableOpacity
        style={[cartStyles.shopButton, { backgroundColor: theme.colors.textGreen }]}
        onPress={() => router.push('/(tabs)/home')}
      >
        <Text style={cartStyles.shopButtonText}>Започни пазаруване</Text>
      </TouchableOpacity>
    </View>
  ), [theme.colors.textPrimary, theme.colors.textGreen]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: moderateScale(176),
    offset: moderateScale(176) * index,
    index,
  }), []);

  //Scroll Handling with scrollability check
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // Check if content is scrollable
    const isScrollable = contentHeight > layoutHeight;
    
    // If content is not scrollable (few items), auto-expand
    if (!isScrollable) {
      if (!isPriceExpanded) {
        setIsPriceExpanded(true);
      }
      return; // Don't process scroll-based logic
    }

    // Threshold: 80 pixels from the bottom
    const isCloseToBottom = layoutHeight + offsetY >= contentHeight - 80;

    if (isCloseToBottom && !isPriceExpanded) {
      setIsPriceExpanded(true);
    } else if (!isCloseToBottom && isPriceExpanded) {
      setIsPriceExpanded(false);
    }
  }, [isPriceExpanded]);

  const togglePriceExpansion = useCallback(() => {
    setIsPriceExpanded(prev => !prev);
  }, []);

  if (isLoading) {
    return (
      <ImageBackground source={theme.backgroundImage} style={cartStyles.backgroundImage}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.textPrimary} />
          <Text style={{
            marginTop: scale(2),
            fontSize: scale(16),
            color: theme.colors.textPrimary,
            fontWeight: '600'
          }}>
            Зареждане на продукти...
          </Text>
        </View>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground source={theme.backgroundImage} style={cartStyles.backgroundImage}>
        <View style={[cartStyles.container, cartStyles.centerContent]}>
          <Text style={[cartStyles.errorText, { color: '#DC2626' }]}>
            Грешка при зареждане на количката
          </Text>
          <TouchableOpacity style={cartStyles.retryButton} onPress={refresh}>
            <Text style={cartStyles.retryButtonText}>Опитай отново</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={theme.backgroundImage} style={cartStyles.backgroundImage}>
      <View style={cartStyles.container}>
       <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={cartStyles.flatListContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={false}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={3}
          getItemLayout={getItemLayout}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange} 
          onLayout={handleLayout}  
      />

        {products.length > 0 && (
      <OverviewPrice
        priceBgn={displayPriceBgn}
        priceEur={displayPriceEur}
        isExpanded={isPriceExpanded}
        basePrice={displayPriceBgn + totalSavings}
        basePriceEur={displayPriceEur + totalSavingsEur} 
        saves={totalSavings}
        savesEur={totalSavingsEur} 
        bestOfferStore={bestOffer?.storeChain}
        onToggle={togglePriceExpansion}
      />
        )}
      </View>
    </ImageBackground>
  );
};



export default React.memo(Cart);