import { HeartIcon } from '@/components/boxes/HeartIcon';
import { styles } from '@/components/styles/homeStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  Text,
  View
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Svg, { Path } from "react-native-svg";

// Enhanced Cart Icon with dynamic color support
const CartIcon = React.memo<{ color?: string }>(({ color = "#1F2937" }) => (
  <Svg viewBox="0 0 24 24" width={20} height={20}>
    <Path
      d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      fill={color}
    />
  </Svg>
));
CartIcon.displayName = 'CartIcon';

export const ProductBox: React.FC<{
  productName: string;
  brand: string;
  priceBgn: string;
  unit?: string;
  priceEur: string;
  photo?: string;
  colors?: [string, string, ...string[]];
  index: number;
}> = React.memo(({ productName, brand, priceBgn, unit, priceEur, photo, colors, index }) => {

  const { isDarkMode, isSimpleMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  
  const scaleAnim = useSharedValue(1);
  const cartButtonScale = useSharedValue(1);

  // Memoize processed prices
  const processedPrices = useMemo(() => ({
    bgn: priceBgn.replace(/\s*лв\.?.*$/i, ''),
    eur: priceEur.replace(/€.*/, '')
  }), [priceBgn, priceEur]);

  // Memoize card width
  const cardWidth = useMemo(() => wp(45), []);

  // Memoize image source to prevent re-creation
  const imageSource = useMemo(() => 
    photo ? { uri: photo } : require("../../assets/icons/pricelpal-logo.png"),
    [photo]
  );

  // Memoize gradient colors or use solid color in performance mode
  const gradientConfig = useMemo(() => {
    if (isPerformanceMode) {
      // Use solid color instead of gradient for performance
      return {
        colors: [colors?.[0] || 'rgba(203,230,246,1)'],
        useGradient: false
      };
    }
    return {
      colors: colors || ['rgba(203,230,246,1)', 'rgba(143,228,201,1)'],
      useGradient: true
    };
  }, [colors, isPerformanceMode]);

  // Memoize all text styles
  const textStyles = useMemo(() => ({
    productName: [styles.productName, { fontSize: getFontSize(16), color: theme.colors.textOnGradient }],
    unitContainer: [styles.unitContainerAccent, { backgroundColor: theme.colors.unitColor, borderColor: theme.colors.unitBorderColor }],
    unitText: [styles.unitTextAccent, { color: theme.colors.textOnGradient }],
    priceLabel: [styles.priceLabel, { fontSize: getFontSize(12), color: theme.colors.textOnGradient }],
    price: [styles.price, { fontSize: getFontSize(18), color: theme.colors.textOnGradient }]
  }), [theme]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }]
  }), []);

  const cartButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartButtonScale.value }]
  }), []);

  const handleProductPress = useCallback(() => {
    if (isPerformanceMode) {
      // Skip animation in performance mode
      router.push(`/products/${encodeURIComponent(productName)}`);
      return;
    }

    scaleAnim.value = withTiming(0.95, { duration: 100 });
    router.push(`/products/${encodeURIComponent(productName)}`);
    
    setTimeout(() => {
      scaleAnim.value = withTiming(1, { duration: 100 });
    }, 100);
  }, [productName, router, isPerformanceMode, scaleAnim]);

  const handleAddToCart = useCallback((e: any) => {
    e.stopPropagation();
    setIsAddingToCart(true);

    if (!isPerformanceMode) {
      cartButtonScale.value = withSequence(
        withTiming(1.3, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
    }

    Alert.alert(
      "Добавено към количката",
      `${productName} ${brand} беше добавен към количката`,
      [{ text: "Продължи" }],
      { cancelable: true }
    );
    
    setTimeout(() => setIsAddingToCart(false), 500);
  }, [productName, brand, isPerformanceMode, cartButtonScale]);

  // Use View wrapper or Animated wrapper based on performance mode
  const OuterWrapper = isPerformanceMode ? View : Animated.View;
  const outerAnimProps = isPerformanceMode ? {} : { 
    entering: FadeInDown.delay(index * 100).duration(600).springify() 
  };

  const InnerWrapper = isPerformanceMode ? View : Animated.View;
  const innerAnimProps = isPerformanceMode ? {} : { style: scaleStyle };

  return (
    <View style={{ width: cardWidth }}>
      <OuterWrapper {...outerAnimProps}>
        <InnerWrapper {...innerAnimProps}>
          <Pressable 
            onPress={handleProductPress}
            android_ripple={isPerformanceMode ? null : { color: 'rgba(0,0,0,0.05)' }}
          >
            <View>
              <View style={styles.imageContainer}>
                <Image
                  source={imageSource}
                  style={[styles.productImage, { width: cardWidth, height: cardWidth, backgroundColor: 'white' }]}
                  resizeMode={photo ? "contain" : "cover"}
                  // Critical optimizations
                  fadeDuration={0}
                  progressiveRenderingEnabled={true}
                  loadingIndicatorSource={undefined}
                />
                <View style={styles.heartOverlay}>
                  <HeartIcon />
                </View>
              </View>
              
              {gradientConfig.useGradient ? (
                <LinearGradient
                  style={[styles.products, { width: cardWidth }]}
                  colors={gradientConfig.colors as [string, string, ...string[]]}
                  start={{ x: 0, y: 1 }}
                >
                  <ProductContent
                    productName={productName}
                    unit={unit}
                    processedPrices={processedPrices}
                    textStyles={textStyles}
                    cartButtonStyle={cartButtonStyle}
                    isAddingToCart={isAddingToCart}
                    handleAddToCart={handleAddToCart}
                    isPerformanceMode={isPerformanceMode}
                    isDarkMode={isDarkMode}
                  />
                </LinearGradient>
              ) : (
                <View
                  style={[styles.products, { width: cardWidth, backgroundColor: gradientConfig.colors[0] }]}
                >
                  <ProductContent
                    productName={productName}
                    unit={unit}
                    processedPrices={processedPrices}
                    textStyles={textStyles}
                    cartButtonStyle={cartButtonStyle}
                    isAddingToCart={isAddingToCart}
                    handleAddToCart={handleAddToCart}
                    isPerformanceMode={isPerformanceMode}
                    isDarkMode={isDarkMode}
                  />
                </View>
              )}
            </View>
          </Pressable>
        </InnerWrapper>
      </OuterWrapper>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these specific props change
  return (
    prevProps.productName === nextProps.productName &&
    prevProps.priceBgn === nextProps.priceBgn &&
    prevProps.priceEur === nextProps.priceEur &&
    prevProps.photo === nextProps.photo &&
    prevProps.brand === nextProps.brand &&
    prevProps.unit === nextProps.unit &&
    prevProps.colors?.[0] === nextProps.colors?.[0] &&
    prevProps.colors?.[1] === nextProps.colors?.[1]
  );
});

// Extracted content component to reduce re-renders
const ProductContent = React.memo<{
  productName: string;
  unit?: string;
  processedPrices: { bgn: string; eur: string };
  textStyles: any;
  cartButtonStyle: any;
  isAddingToCart: boolean;
  handleAddToCart: (e: any) => void;
  isPerformanceMode: boolean;
  isDarkMode: boolean;
}>(({ productName, unit, processedPrices, textStyles, cartButtonStyle, isAddingToCart, handleAddToCart, isPerformanceMode, isDarkMode }) => {
  
  const ButtonWrapper = isPerformanceMode ? View : Animated.View;
  const buttonAnimProps = isPerformanceMode ? {} : { style: cartButtonStyle };

  return (
    <View style={styles.productContent}>
      <View style={styles.productNameContainer}>
        <Text style={textStyles.productName} numberOfLines={2}>
          {productName}
        </Text>
        {unit && (
          <View style={textStyles.unitContainer}>
            <Text style={textStyles.unitText}>{unit}</Text>
          </View>
        )}
      </View>
      <View style={styles.priceCartContainer}>
        <View style={styles.priceContainer}>
          <Text style={textStyles.priceLabel}>От</Text>
          <Text style={textStyles.price}>{processedPrices.bgn} лв.</Text>
          <Text style={textStyles.price}>{processedPrices.eur} €</Text>
        </View>
        <ButtonWrapper {...buttonAnimProps}>
          <Pressable 
            style={{
              padding: wp(2.5),
              borderRadius: 16,
              backgroundColor: isAddingToCart 
                ? (isDarkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)')
                : (isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.95)'),
              elevation: isAddingToCart ? 1 : 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              borderWidth: 1,
              borderColor: isDarkMode 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.05)'
            }}
            onPress={handleAddToCart}
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
          >
            <CartIcon color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
          </Pressable>
        </ButtonWrapper>
      </View>
    </View>
  );
});

ProductContent.displayName = 'ProductContent';
ProductBox.displayName = "ProductBox";