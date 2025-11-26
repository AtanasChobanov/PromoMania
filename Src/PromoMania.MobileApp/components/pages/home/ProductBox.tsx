import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import { useShoppingCart } from '@/services/useShoppingCart';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
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
import { HeartIcon } from './HeartIcon';
import { styles } from './homeStyles';

const CartIcon = ({ color = "#1F2937", size = 20 }: { color?: string; size?: number }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size}>
    <Path
      d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      fill={color}
    />
  </Svg>
);

export const ProductBox: React.FC<{
  productId: string;
  productName: string;
  brand: string;
  priceBgn: number;  
  unit?: string;
  priceEur: number; 
  photo?: string;
  colors?: [string, string, ...string[]];
  index: number;
}> = React.memo(({ productId, productName, brand, priceBgn, unit, priceEur, photo, colors, index }) => {

  const { isDarkMode, isSimpleMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Use the shopping cart hook
  const { addItem, isAdding } = useShoppingCart();
  
  // Quantity modal state
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState('1');
  
  const router = useRouter();
  
  const scaleAnim = useSharedValue(1);
  const cartButtonScale = useSharedValue(1);

  // Adjust card width for simple mode
  const cardWidth = useMemo(() => isSimpleMode ? wp(48) : wp(45), [isSimpleMode]);
  const processedBgn = (priceBgn || 0).toFixed(2);
  const processedEur = (priceEur || 0).toFixed(2);

  const gradientColors = colors || ['rgba(203,230,246,1)', 'rgba(143,228,201,1)'];

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }]
  }));

  const cartButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartButtonScale.value }]
  }));

  const handleProductPress = useCallback(() => {
    if (!isPerformanceMode) {
      scaleAnim.value = withTiming(0.95, { duration: 100 });
      setTimeout(() => {
        scaleAnim.value = withTiming(1, { duration: 100 });
      }, 100);
    }
    router.push(`/products/${productId}`);
  }, [productId, router, isPerformanceMode, scaleAnim]);

  const handleAddToCart = useCallback(async (e: any) => {
    e.stopPropagation();

    // Animation for button press
    if (!isPerformanceMode) {
      cartButtonScale.value = withSequence(
        withTiming(1.3, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
    }

    // Open quantity modal instead of directly adding
    setShowQuantityModal(true);
  }, [isPerformanceMode, cartButtonScale]);

  const handleConfirmQuantity = useCallback(async () => {
    const qty = parseInt(quantity);
    
    // Validate quantity
    if (isNaN(qty) || qty < 1) {
      Alert.alert(
        "Невалидно количество",
        "Моля, въведете валидно количество (минимум 1)",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      // Close modal first
      setShowQuantityModal(false);
      
      // Add item to cart using the API
      await addItem(productId, qty);
      
      // Reset quantity to 1 for next time
      setQuantity('1');
      
      // Show success alert
      Alert.alert(
        "Добавено към количката",
        `${qty} x ${productName} ${brand} ${qty === 1 ? 'беше добавен' : 'бяха добавени'} към количката`,
        [{ text: "Продължи" }],
        { cancelable: true }
      );
    } catch (error) {
      // Show error alert
      Alert.alert(
        "Грешка",
        "Не успяхме да добавим продукта към количката. Моля, опитайте отново.",
        [{ text: "OK" }],
        { cancelable: true }
      );
      console.error('Failed to add to cart:', error);
    }
  }, [quantity, productId, productName, brand, addItem]);

  const handleCancelQuantity = useCallback(() => {
    setShowQuantityModal(false);
    setQuantity('1'); // Reset to 1
  }, []);

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => {
      const current = parseInt(prev) || 0;
      return String(current + 1);
    });
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => {
      const current = parseInt(prev) || 1;
      return String(Math.max(1, current - 1));
    });
  }, []);

  return (
    <View style={{ width: cardWidth }}>
      <Animated.View 
        entering={isPerformanceMode ? undefined : FadeInDown.delay((index % 4) * 50) 
                .duration(300) 
                .springify()}
      >
        <Animated.View style={isPerformanceMode ? undefined : scaleStyle}>
          <Pressable 
            onPress={handleProductPress}
            android_ripple={isPerformanceMode ? undefined : { color: 'rgba(0,0,0,0.05)' }}
          >
            <View>
              {/* Image Section */}
              <View style={styles.imageContainer}>
                <Image
                  source={photo ? { uri: photo } : require("@/assets/icons/logo-for-boxes.png")}
                  style={[
                    styles.productImage, 
                    { 
                      width: cardWidth, 
                      height: isSimpleMode ? cardWidth * 1.1 : cardWidth, // Slightly taller in simple mode
                      backgroundColor: 'white' 
                    }
                  ]}
                  resizeMode={photo ? "contain" : "cover"}
                  fadeDuration={0}
                  progressiveRenderingEnabled={true}
                />
                <View style={styles.heartOverlay}>
                  <HeartIcon heartSize={isSimpleMode ? wp(8) : wp(6.5)} />
                </View>
              </View>
              
              {/* Content Section */}
              <View
                style={[
                  styles.products, 
                  { 
                    width: cardWidth, 
                    backgroundColor: theme.colors.backgroundColor, 
                    borderColor: isSimpleMode ? theme.colors.textPrimary : "#FFFFFF", 
                    borderWidth: isSimpleMode ? 2 : 1,
                    paddingVertical: isSimpleMode ? hp(2) : hp(1.5),
                    paddingHorizontal: isSimpleMode ? wp(3) : wp(2),
                  }
                ]}
              >
                <ProductContent
                  productName={productName}
                  unit={unit}
                  processedBgn={processedBgn}
                  processedEur={processedEur}
                  theme={theme}
                  cartButtonStyle={cartButtonStyle}
                  isAddingToCart={isAdding}
                  handleAddToCart={handleAddToCart}
                  isPerformanceMode={isPerformanceMode}
                  isDarkMode={isDarkMode}
                  isSimpleMode={isSimpleMode}
                />
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>

      {/* Quantity Modal */}
      <Modal
        visible={showQuantityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelQuantity}
      >
        <Pressable 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={handleCancelQuantity}
        >
          <Pressable
            style={{
              backgroundColor: theme.colors.skeletonForeground,
              borderRadius: 20,
              padding: isSimpleMode ? wp(8) : wp(6),
              width: isSimpleMode ? wp(85) : wp(80),
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={{
              fontSize: isSimpleMode ? getFontSize(24) : getFontSize(20),
              fontWeight: 'bold',
              color: theme.colors.textOnGradient,
              marginBottom: hp(1),
              textAlign: 'center',
              letterSpacing: isSimpleMode ? 0.5 : 0,
            }}>
              Изберете количество
            </Text>
            
            <Text style={{
              fontSize: isSimpleMode ? getFontSize(18) : getFontSize(14),
              color: theme.colors.textOnGradient,
              marginBottom: hp(2),
              textAlign: 'center',
              fontWeight: isSimpleMode ? '600' : '400',
            }}>
              {productName}
            </Text>

            {/* Quantity Controls */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: hp(3),
              gap: wp(4)
            }}>
              <Pressable
                onPress={decrementQuantity}
                style={{
                  width: isSimpleMode ? wp(14) : wp(12),
                  height: isSimpleMode ? wp(14) : wp(12),
                  borderRadius: isSimpleMode ? wp(7) : wp(6),
                  backgroundColor: theme.colors.backgroundColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: isSimpleMode ? 2 : 1,
                  borderColor: theme.colors.backgroundColor,
                  elevation: 5,
                }}
              >
                <Text style={{
                  fontSize: isSimpleMode ? getFontSize(28) : getFontSize(24),
                  color: theme.colors.textOnGradient,
                  fontWeight: 'bold'
                }}>
                  −
                </Text>
              </Pressable>

              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                style={{
                  fontSize: isSimpleMode ? getFontSize(28) : getFontSize(24),
                  fontWeight: 'bold',
                  color: theme.colors.textOnGradientReverse,
                  textAlign: 'center',
                  minWidth: isSimpleMode ? wp(24) : wp(20),
                  paddingVertical: isSimpleMode ? hp(1.5) : hp(1),
                  paddingHorizontal: isSimpleMode ? wp(4) : wp(3),
                  borderRadius: 12,
                  backgroundColor: '#FFFEFF',
                  borderWidth: isSimpleMode ? 2 : 1,
                  borderColor: 'white',
                  elevation: 5,
                }}
                maxLength={3}
              />

              <Pressable
                onPress={incrementQuantity}
                style={{
                  width: isSimpleMode ? wp(14) : wp(12),
                  height: isSimpleMode ? wp(14) : wp(12),
                  borderRadius: isSimpleMode ? wp(7) : wp(6),
                  backgroundColor: theme.colors.backgroundColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: isSimpleMode ? 2 : 1,
                  borderColor: theme.colors.backgroundColor,
                  elevation: 5,
                }}
              >
                <Text style={{
                  fontSize: isSimpleMode ? getFontSize(28) : getFontSize(24),
                  color: theme.colors.textOnGradient,
                  fontWeight: 'bold'
                }}>
                  +
                </Text>
              </Pressable>
            </View>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              gap: wp(3)
            }}>
              <Pressable
                onPress={handleCancelQuantity}
                style={{
                  flex: 1,
                  paddingVertical: isSimpleMode ? hp(2) : hp(1.5),
                  borderRadius: 12,
                  backgroundColor: theme.colors.cancelColor,
                  borderWidth: isSimpleMode ? 2 : 1,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                }}
              >
                <Text style={{
                  fontSize: isSimpleMode ? getFontSize(18) : getFontSize(16),
                  fontWeight: isSimpleMode ? '700' : '600',
                  color: theme.colors.textOnGradient,
                  textAlign: 'center',
                  letterSpacing: isSimpleMode ? 0.5 : 0,
                }}>
                  Отказ
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmQuantity}
                disabled={isAdding}
                style={{
                  flex: 1,
                  paddingVertical: isSimpleMode ? hp(2) : hp(1.5),
                  borderRadius: 12,
                  backgroundColor: theme.colors.backgroundColor,
                  borderWidth: isSimpleMode ? 2 : 0,
                  borderColor: isSimpleMode ? theme.colors.textPrimary : 'transparent',
                  opacity: isAdding ? 0.7 : 1
                }}
              >
                <Text style={{
                  fontSize: isSimpleMode ? getFontSize(18) : getFontSize(16),
                  fontWeight: isSimpleMode ? '700' : '600',
                  color: theme.colors.textOnGradient,
                  textAlign: 'center',
                  letterSpacing: isSimpleMode ? 0.5 : 0,
                }}>
                  {isAdding ? 'Добавяне...' : 'Добави'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
});

const ProductContent = ({
  productName,
  unit,
  processedBgn,
  processedEur,
  theme,
  cartButtonStyle,
  isAddingToCart,
  handleAddToCart,
  isPerformanceMode,
  isDarkMode,
  isSimpleMode
}: {
  productName: string;
  unit?: string;
  processedBgn: string;
  processedEur: string;
  theme: any;
  cartButtonStyle: any;
  isAddingToCart: boolean;
  handleAddToCart: (e: any) => void;
  isPerformanceMode: boolean;
  isDarkMode: boolean;
  isSimpleMode: boolean;
}) => {
  return (
    <View style={styles.productContent}>
      <View style={styles.productNameContainer}>
        <Text 
          style={[
            styles.productName, 
            { 
              
              fontSize: isSimpleMode ? getFontSize(18) : getFontSize(16), 
              color: theme.colors.textOnGradient,
              fontWeight: isSimpleMode ? '700' : '600',
              letterSpacing: isSimpleMode ? 0.3 : 0,
              lineHeight: isSimpleMode ? getFontSize(22) : getFontSize(18),
              height: isSimpleMode ? getFontSize(22)*2 : getFontSize(18)*2,
            }
          ]} 
          numberOfLines={2}
        >
          {productName}
        </Text>
     
      </View>
         {unit ? (
  <View style={[
    styles.unitContainerAccent, 
    { 
      backgroundColor: theme.colors.unitColor, 
      borderColor: theme.colors.unitBorderColor,
      borderWidth: isSimpleMode ? 2 : 1,
    }
  ]}>
    <Text style={[
      styles.unitTextAccent, 
      { 
        color: theme.colors.textOnGradient,
        fontSize: isSimpleMode ? getFontSize(13) : getFontSize(11),
        fontWeight: isSimpleMode ? '700' : '600',
      }
    ]}>
      {unit}
    </Text>
  </View>
) : (
  <View style={styles.unitPlaceholder} />
)}
      <View style={styles.priceCartContainer}>
        <View style={styles.priceContainer}>
          <Text style={[
            styles.priceLabel, 
            { 
              fontSize: isSimpleMode ? getFontSize(14) : getFontSize(12), 
              color: theme.colors.textOnGradient,
              fontWeight: isSimpleMode ? '600' : '400',
            }
          ]}>
            От
          </Text>
          <Text style={[
            styles.price, 
            { 
              fontSize: isSimpleMode ? getFontSize(20) : getFontSize(18), 
              color: theme.colors.textOnGradient,
              fontWeight: isSimpleMode ? '800' : '700',
              letterSpacing: isSimpleMode ? 0.5 : 0,
            }
          ]}>
            {processedBgn} лв.
          </Text>
          <Text style={[
            styles.price, 
            { 
              fontSize: isSimpleMode ? getFontSize(20) : getFontSize(18), 
              color: theme.colors.textOnGradient,
              fontWeight: isSimpleMode ? '800' : '700',
              letterSpacing: isSimpleMode ? 0.5 : 0,
            }
          ]}>
            {processedEur} €
          </Text>
        </View>
        
        <Animated.View style={isPerformanceMode ? undefined : cartButtonStyle}>
          <Pressable 
            style={{
              padding: isSimpleMode ? wp(3.5) : wp(2.5),
              borderRadius: 16,
              backgroundColor: isAddingToCart 
                ? (isDarkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)')
                : (isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.95)'),
              elevation: isAddingToCart ? 1 : 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              borderWidth: isSimpleMode ? 2 : 1,
              borderColor: isDarkMode 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.05)',
              opacity: isAddingToCart ? 0.6 : 1,
            }}
            onPress={handleAddToCart}
            disabled={isAddingToCart}
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
          >
            <CartIcon 
              color={isDarkMode ? '#FFFFFF' : '#1F2937'} 
              size={isSimpleMode ? 24 : 20}
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

ProductBox.displayName = "ProductBox";