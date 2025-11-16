/* eslint-disable react/display-name */
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useCartSuggestions, useShoppingCart } from '@/services/useShoppingCart';
import { BlurView } from 'expo-blur';
import { router, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Svg, { Circle, Path } from 'react-native-svg';


interface ProductBoxProps {
  publicId: string;
  name: string;
  brand: string | null;
  price: number;
  priceEur: number;
  unit: string;
  imageUrl: string;
  quantity: number;
  discount: number | null;
  onDelete?: () => void;
  onViewDetails?: () => void;
  onSaveForLater?: () => void;
}

interface FinalPriceProps {
  saves: number;
  basePrice: number;
  basePriceEur:number;
  bestOfferStore?: string;
}

interface OverviewPriceProps {
  priceBgn: number;
  priceEur: number;
}

interface OptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  onDelete: () => void;
  onSaveForLater: () => void;
}

const OptionsMenu: React.FC<OptionsMenuProps> = React.memo(({
  visible,
  onClose,
  onViewDetails,
  onDelete,
  onSaveForLater,
}) => {
    const {isPerformanceMode, isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const slideAnim = useRef(new Animated.Value(300)).current;
 const MoreOptionsContainer =  isPerformanceMode ? View :Animated.View;
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 9,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <MoreOptionsContainer
         style={[
    styles.bottomSheet,
    ...(isPerformanceMode ? [] : [{ transform: [{ translateY: slideAnim }] }]),
  ]}
>
          <BlurView
  intensity={30}
  tint="light"
  experimentalBlurMethod="dimezisBlurView"
  style={styles.blurContainer}
>
  <View style={styles.handleBar} />
  
  <Text style={styles.optionsTitle}>Опции за продукта</Text>
  
  <TouchableOpacity style={styles.optionItem} onPress={onViewDetails}>
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
        fill="#333"
      />
      <Circle cx="12" cy="12.5" r="2.5" fill="#333" />
    </Svg>
    <Text style={styles.optionText}>Преглед на детайли</Text>
  </TouchableOpacity>
  
  <TouchableOpacity style={styles.optionItem} onPress={onSaveForLater}>
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="#FF6B6B"
      />
    </Svg>
    <Text style={styles.optionText}>Запази за по-късно</Text>
  </TouchableOpacity>
  
  <TouchableOpacity style={styles.optionItem} onPress={onDelete}>
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
        fill="#FF3B30"
      />
    </Svg>
    <Text style={[styles.optionText, styles.deleteText]}>Премахни от количката</Text>
  </TouchableOpacity>

    <TouchableOpacity style={styles.cancelButton}  onPress={onClose}>
    <Text style={styles.cancelText}>Отказ</Text>
  </TouchableOpacity>
  </BlurView>

        </MoreOptionsContainer>
      </TouchableOpacity>
    </Modal>
  );
});

const ProductBox: React.FC<ProductBoxProps & { index: number }> = React.memo(({
  publicId,
  name,
  brand,
  price,
  priceEur,
  unit,
  imageUrl,
  quantity,
  discount,
  onDelete,
  onViewDetails,
  onSaveForLater,
  index,
}) => {
  const { isDarkMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const updateTimeoutRef = useRef<number | null>(null);
  const { updateItemQuantity } = useShoppingCart();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const quantityScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 100,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim,index, slideAnim]);

  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  const animateQuantityChange = useCallback(() => {
    Animated.sequence([
      Animated.timing(quantityScaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(quantityScaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [quantityScaleAnim]);

  const handleViewDetails = useCallback(() => {
    setOptionsVisible(false);
    onViewDetails?.();
  }, [onViewDetails]);

  const handleDelete = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOptionsVisible(false);
      onDelete?.();
    });
  }, [onDelete,fadeAnim,slideAnim]);

  const handleSaveForLater = useCallback(() => {
    setOptionsVisible(false);
    onSaveForLater?.();
  }, [onSaveForLater]);

  const openOptions = useCallback(() => setOptionsVisible(true), []);
  const closeOptions = useCallback(() => setOptionsVisible(false), []);

  const debouncedUpdate = useCallback((newQuantity: number) => {
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);

    updateTimeoutRef.current = setTimeout(async () => {
      try {
        await updateItemQuantity(publicId, newQuantity);
      } catch (error) {
        console.error('Failed to update quantity:', error);
        setLocalQuantity(quantity);
      }
    }, 500);
  }, [publicId, updateItemQuantity, quantity]);

  const handleDecreaseQuantity = useCallback(() => {
    const newQuantity = localQuantity - 1;
    if (newQuantity <= 0) {
      onDelete?.();
      return;
    }
    setLocalQuantity(newQuantity);
    animateQuantityChange();
    debouncedUpdate(newQuantity);
  }, [localQuantity, animateQuantityChange, debouncedUpdate, onDelete]);

  const handleIncreaseQuantity = useCallback(() => {
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    animateQuantityChange();
    debouncedUpdate(newQuantity);
  }, [localQuantity, animateQuantityChange, debouncedUpdate]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  }, [scaleAnim]);
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }).start();
  }, [scaleAnim]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, []);

  const ProductContainer = isPerformanceMode ? View : Animated.View;
  const QuantityText = isPerformanceMode ? Text : Animated.Text;

  return (
    <>
      <ProductContainer
        style={[
          styles.products,
          {
            backgroundColor: theme.colors.backgroundColor,
            borderColor: '#FFFFFF',
            borderWidth: 1,
            ...(isPerformanceMode ? {} : { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }),
          },
        ]}
      >
        <View style={styles.productContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openOptions}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={[styles.menuDots, { color: theme.colors.textPrimary }]}>⋯</Text>
          </TouchableOpacity>

          <Image
            style={[styles.productImage, { width: scale(120) }]}
            source={imageUrl ? { uri: imageUrl } : require("../../assets/icons/icon.png")}
            resizeMode={imageUrl ? "contain" : "cover"}
          />

          <View style={styles.productDetails}>
            <View>
              {brand ? <Text style={[styles.brand, { color: theme.colors.textPrimary }]}>{brand}</Text> : null}
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.name, { color: theme.colors.textPrimary }]}>{name ?? ""}</Text>
              <Text style={[styles.unit, { color: theme.colors.textPrimary }]}>{unit ?? ""}</Text>
              <Text style={[styles.price, { color: theme.colors.textPrimary }]}>{priceEur != null ? priceEur.toFixed(2) : "0.00"} €</Text>
              <Text style={[styles.price, { color: theme.colors.textPrimary }]}>{price != null ? price.toFixed(2) : "0.00"} лв.</Text>
              {discount != null && <Text style={[styles.discount, { color: '#DC2626' }]}>{discount}% отстъпка</Text>}
            </View>

            <View style={styles.quantityRow}>
              <BlurView intensity={50} tint={theme.colors.TabBarColors as 'dark' | 'light'} style={styles.blurButton}>
                <TouchableHighlight underlayColor="transparent" style={styles.buttonTouchable} onPress={handleDecreaseQuantity}>
                  <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>-</Text>
                </TouchableHighlight>
              </BlurView>

              <QuantityText style={[styles.quantityText, { color: theme.colors.textPrimary, ...(isPerformanceMode ? {} : { transform: [{ scale: quantityScaleAnim }] }) }]}>
                {localQuantity}
              </QuantityText>

              <BlurView intensity={50} tint={theme.colors.TabBarColors as 'dark' | 'light'} style={styles.blurButton}>
                <TouchableHighlight underlayColor="transparent" style={styles.buttonTouchable} onPress={handleIncreaseQuantity}>
                  <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>+</Text>
                </TouchableHighlight>
              </BlurView>
            </View>
          </View>
        </View>
      </ProductContainer>

      <OptionsMenu
        visible={optionsVisible}
        onClose={closeOptions}
        onViewDetails={handleViewDetails}
        onDelete={handleDelete}
        onSaveForLater={handleSaveForLater}
      />
    </>
  );
}, (prevProps, nextProps) => (
  prevProps.publicId === nextProps.publicId &&
  prevProps.quantity === nextProps.quantity &&
  prevProps.price === nextProps.price &&
  prevProps.index === nextProps.index
));

const FinalPrice: React.FC<FinalPriceProps> = React.memo(({
  basePrice,
  basePriceEur,
  saves,
  bestOfferStore
}) => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { bestOffer, isLoading } = useCartSuggestions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim,slideAnim]);
    const {isPerformanceMode } = useSettings();

const FinalPriceContainer = isPerformanceMode ? View : Animated.View;

  return (
    <FinalPriceContainer 
       style={[
    styles.overviewContainer,
    {
      padding: scale(20),
      borderColor: '#FFFFFF',
      backgroundColor: theme.colors.backgroundColor,
      ...(isPerformanceMode
        ? {}
        : {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }),
    },
  ]}
>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={[styles.summaryTitle, { fontSize: moderateScale(19), color: theme.colors.textPrimary }]}>
            Обобщение на покупките
          </Text>
          {saves > 0 && (
            <Text style={[styles.savingsText, { fontSize: moderateScale(18) }]}>
              Спестяваш {saves.toFixed(2)} лв
            </Text>
          )}
        </View>
        <View style={styles.priceBreakdown}>
          {bestOfferStore && (
            <Text style={{ fontSize: moderateScale(14), color: theme.colors.textPrimary, marginBottom: 4 }}>
              Най-добра оферта от {bestOfferStore}
            </Text>
          )}
          <Text style={{ fontSize: moderateScale(16), color: theme.colors.textPrimary }}>
            Оригинална цена:</Text>
            <View style={styles.pricesConclusion}>
            <Text style={[styles.totalPriceText, { fontSize: moderateScale(18), color: theme.colors.textPrimary }]}>
              {isLoading ? '...' : `${basePrice.toFixed(2)} лв`}
            </Text>
               <Text style={[styles.totalPriceText, { fontSize: moderateScale(18), color: theme.colors.textPrimary }]}>
              {isLoading ? '...' : `${basePriceEur.toFixed(2)} €`}
            </Text>
            </View>
           <Text style={{ fontSize: moderateScale(16), color: theme.colors.textPrimary }}>
            Обща цена:
          </Text>
          
          <View style={styles.pricesConclusion}>
            <Text style={[styles.totalPriceText, { fontSize: moderateScale(18), color: theme.colors.textPrimary }]}>
              {isLoading ? '...' : `${(basePrice - saves).toFixed(2)} лв`}
            </Text>
            <Text style={[styles.totalPriceText, { fontSize: moderateScale(18), color: theme.colors.textPrimary }]}>
              {isLoading ? '...' : `${(basePriceEur - saves).toFixed(2)} €`}
            </Text>
          </View>
        </View>
      </View>
    </FinalPriceContainer>
  );
});

const OverviewPrice: React.FC<OverviewPriceProps> = React.memo(({
  priceBgn,
  priceEur,
}) => {
  const { isDarkMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isLoading } = useCartSuggestions();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const blurViewProps = {
    intensity: 20,
    tint: theme.colors.TabBarColors as 'dark' | 'light',
    experimentalBlurMethod: 'dimezisBlurView' as const,
  };
  
  const ContainerView = (isPerformanceMode ? View : BlurView) as React.ComponentType<any>;
  const router = useRouter();

  // Pulse animation for price changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [priceBgn, priceEur,pulseAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
 const OverviewPriceContainer = isPerformanceMode ? View : Animated.View;

  return (
    <ContainerView
      style={[
        styles.totalPriceContainer,
        { bottom: moderateScale(105) },
        isPerformanceMode && { backgroundColor: theme.colors.textGreen },
      ]}
      {...(!isPerformanceMode
        ? blurViewProps
        : {
            colors: theme.colors.blueTeal,
            start: { x: 0, y: 1 },
            end: { x: 1, y: 0 },
          })}
    >
      <OverviewPriceContainer
         style={[
    styles.totalPriceRow,
    ...(isPerformanceMode ? [] : [{ transform: [{ scale: pulseAnim }] }]),
  ]}
>

        <View>
          <Text style={[styles.totalPriceLabel, {color: theme.colors.textPrimary}]}>
            Обща цена
          </Text>
        </View>
        <View style={styles.pricesConclusion}>
          <Text style={[styles.totalPriceValue, {color: theme.colors.textPrimary}]}>
            {isLoading ? '...' : `${priceBgn.toFixed(2)} лв`}
          </Text>
          <Text style={[styles.totalPriceValue, {color: theme.colors.textPrimary}]}>
            {isLoading ? '...' : `${priceEur.toFixed(2)} €`}
          </Text>
        </View>
      </OverviewPriceContainer>
    <TouchableHighlight 
            style={ styles.continueButtonContainer } 
            underlayColor="transparent" 
            onPress={() => router.navigate('/delivaryAndMap/choiceDelivary')}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
      <BlurView
        intensity={55}
        tint='systemUltraThinMaterialDark'
        experimentalBlurMethod="dimezisBlurView"
        style={styles.continueButton}
      >
        <View >
      
            <Text style={[styles.continueButtonText, {color: theme.colors.textPrimary}]}>
              Продължи
            </Text>
        </View>
      </BlurView>
                </TouchableHighlight>

    </ContainerView>
  );
});

const Cart: React.FC = () => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const { 
    items, 
    totalPrice, 
    itemCount,
    isLoading, 
    error,
    refresh,
    removeItem, 
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

  const handleDeleteProduct = useCallback(async (cartItemId: string) => {
    try {
      await removeItem(cartItemId);
      console.log('Item removed successfully');
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
    <View style={styles.titleContainer}>
      <Text style={[styles.mainTitle, { fontSize: moderateScale(30), color: theme.colors.textPrimary }]}>
        Количка
      </Text>
      {itemCount > 0 && (
        <Text style={[styles.itemCount, { color: theme.colors.textPrimary }]}>
          {itemCount} {itemCount === 1 ? 'артикул' : 'артикула'}
        </Text>
      )}
    </View>
  ), [theme.colors.textPrimary, itemCount]);

 const displayPriceBgn = bestOffer?.totalPriceBgn ?? totalPrice.bgn;
  const displayPriceEur = bestOffer?.totalPriceEur ?? totalPrice.eur;

  const ListFooterComponent = useMemo(() => (
    <>
      {products.length > 0 && (
        <FinalPrice
          basePrice={displayPriceBgn + totalSavings}
          basePriceEur={displayPriceEur + totalSavings}
          saves={totalSavings}
          bestOfferStore={bestOffer?.storeChain}
        />
      )}
      <View style={{ height: moderateScale(250) }} />
    </>
  ), [products.length, displayPriceBgn, displayPriceEur, totalSavings, bestOffer]);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textPrimary }]}>
        Количката ви е празна
      </Text>
      <TouchableOpacity 
        style={[styles.shopButton,{backgroundColor:theme.colors.textGreen}]}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.shopButtonText}>Започни пазаруване</Text>
      </TouchableOpacity>
    </View>
  ), [theme.colors.textPrimary, theme.colors.textGreen]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: moderateScale(176),
    offset: moderateScale(176) * index,
    index,
  }), []);

  if (isLoading) {
    return (
      <ImageBackground source={theme.backgroundImage} style={styles.backgroundImage}>
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
      <ImageBackground source={theme.backgroundImage} style={styles.backgroundImage}>
        <View style={[styles.container, styles.centerContent]}>
          <Text style={[styles.errorText, { color: '#DC2626' }]}>
            Грешка при зареждане на количката
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Опитай отново</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }



  return (
    <ImageBackground source={theme.backgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={false}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={3}
          getItemLayout={getItemLayout}
        />
        
        {products.length > 0 && (
          <OverviewPrice 
            priceBgn={displayPriceBgn} 
            priceEur={displayPriceEur}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(20),
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: moderateScale(40),
    marginBottom: moderateScale(10),
  },
  mainTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: moderateScale(10),
  },
  itemCount: {
    fontSize: moderateScale(16),
    opacity: 0.7,
  },
  products: {
    width: scale(325),
    height: moderateScale(170),
    borderRadius: 15,
    marginBottom: 16,
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewContainer: {
    width: scale(325),
    height: moderateScale(245),
    borderRadius: 15,
    elevation:5,
    borderWidth:1,
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    height: "100%",
    borderRadius: 15,
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  menuDots: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  productImage: {
    backgroundColor:'white',
    height: "100%",
    borderRadius: 15,
  },
  productDetails: {
    marginLeft: 16,
    marginRight:scale(30),
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
    paddingVertical: 8,
  },
  brand: {
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
  name: {
    fontSize: moderateScale(17),
    fontWeight: "500",
  },
  unit: {
    fontSize: moderateScale(14),
    opacity: 0.7,
  },
  price: {
    fontSize: moderateScale(17),
    fontWeight: "bold",
  },
  discount: {
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  quantityRow: {
    flexDirection:'row',
        alignItems: "center",

    marginTop: 8,
  },
    storeLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  quantityText: {
    fontSize: moderateScale(16),
        marginHorizontal: 16,
    fontWeight: "600",
  },
  summaryContainer: {
    flex: 1,
    justifyContent: 'space-between',
    
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  savingsText: {
    fontWeight: '600',
    color: '#DC2626',
  },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    paddingTop: 12,


  },
  totalPriceText: {
    fontWeight: 'bold',
    marginTop: 4,
  
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    maxHeight: verticalScale(500),
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  blurContainer: {
    padding: 20,
    paddingTop: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(185, 185, 185, 1)',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  optionText: {
    fontSize: moderateScale(18),
    color: '#333',
    marginLeft:moderateScale(5),
    fontWeight: '500',
  },
  deleteText: {
    color: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 15,
    borderRadius: 12,
    overflow:'hidden',
    marginTop: 10,
    borderColor:'gray',
    borderWidth:1,
  },
  cancelText: {
    fontSize: moderateScale(20),
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  totalPriceContainer: {
    position: 'absolute',
    width: scale(325),
    alignSelf: 'center',
    padding: 20,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  continueButtonContainer: {
    height: 50,
    borderRadius: 10,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  continueButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  continueButtonText: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height:'100%',
  },
  emptyText: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    marginBottom: moderateScale(20),
  },
  shopButton: {
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(15),
    borderRadius: 12,
    elevation:10,
  
  },
  shopButtonText: {
    color: 'white',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: moderateScale(20),
    fontSize: moderateScale(12),
  },
  errorText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: moderateScale(20),
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(15),
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
    blurButton: {
    borderRadius: 9999,
    width: moderateScale(30),
    height: moderateScale(30),
    overflow: "hidden",
  },
  buttonTouchable: {
    width: moderateScale(30),
    height: moderateScale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  pricesConclusion:{
    flexDirection:'row',
    gap:moderateScale(10),
  }
});

export default React.memo(Cart);