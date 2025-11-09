import { HeartIcon } from '@/components/boxes/HeartIcon';
import { styles } from '@/components/styles/homeStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import { useShoppingCart } from '@/services/useShoppingCart';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

const CartIcon = ({ color = "#1F2937" }: { color?: string }) => (
  <Svg viewBox="0 0 24 24" width={20} height={20}>
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
  priceBgn: string;
  unit?: string;
  priceEur: string;
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

  const cardWidth = wp(45);
  const processedBgn = priceBgn.replace(/\s*лв\.?.*$/i, '');
  const processedEur = priceEur.replace(/€.*/, '');

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
        entering={isPerformanceMode ? undefined : FadeInDown.delay(index * 100).duration(600).springify()}
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
                  source={photo ? { uri: photo } : require("../../assets/icons/icon.png")}
                  style={[styles.productImage, { width: cardWidth, height: cardWidth, backgroundColor: 'white' }]}
                  resizeMode={photo ? "contain" : "cover"}
                  fadeDuration={0}
                  progressiveRenderingEnabled={true}
                />
                <View style={styles.heartOverlay}>
                  <HeartIcon heartSize={wp(6.5)} />
                </View>
              </View>
              
              {/* Content Section */}
              <View
                style={[styles.products, { width: cardWidth, backgroundColor: theme.colors.backgroundColor }]}
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
              padding: wp(6),
              width: wp(80),
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
              fontSize: getFontSize(20),
              fontWeight: 'bold',
              color: theme.colors.textOnGradient,
              marginBottom: hp(1),
              textAlign: 'center'
            }}>
              Изберете количество
            </Text>
            
            <Text style={{
              fontSize: getFontSize(14),
              color: theme.colors.textOnGradient,
              marginBottom: hp(2),
              textAlign: 'center'
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
                  width: wp(12),
                  height: wp(12),
                  borderRadius: wp(6),
                  backgroundColor: theme.colors.backgroundColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor:theme.colors.backgroundColor,
                      elevation: 5,

                }}
              >
                <Text style={{
                  fontSize: getFontSize(24),
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
                  fontSize: getFontSize(24),
                  fontWeight: 'bold',
                  color: theme.colors.textOnGradientReverse,
                  textAlign: 'center',
                  minWidth: wp(20),
                  paddingVertical: hp(1),
                  paddingHorizontal: wp(3),
                  borderRadius: 12,
                  backgroundColor: '#FFFEFF',
                  borderWidth: 1,
                  borderColor: 'white',
                  elevation: 5,

                }}
                maxLength={3}
                
              />

              <Pressable
                onPress={incrementQuantity}
                style={{
                  width: wp(12),
                  height: wp(12),
                  borderRadius: wp(6),
                  backgroundColor:theme.colors.backgroundColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor:theme.colors.backgroundColor,
                      elevation: 5,

                }}
              >
                <Text style={{
                  fontSize: getFontSize(24),
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
                  paddingVertical: hp(1.5),
                  borderRadius: 12,
                  backgroundColor:theme.colors.cancelColor,
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                }}
              >
                <Text style={{
                  fontSize: getFontSize(16),
                  fontWeight: '600',
                  color: theme.colors.textOnGradient,
                  textAlign: 'center'
                }}>
                  Отказ
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmQuantity}
                disabled={isAdding}
                style={{
                  flex: 1,
                  paddingVertical: hp(1.5),
                  borderRadius: 12,
                  backgroundColor:
                  theme.colors.backgroundColor,
                  opacity: isAdding ? 0.7 : 1
                }}
              >
                <Text style={{
                  fontSize: getFontSize(16),
                  fontWeight: '600',
                  color: theme.colors.textOnGradient,
                  textAlign: 'center'
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
  isDarkMode
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
}) => {
  return (
    <View style={styles.productContent}>
      <View style={styles.productNameContainer}>
        <Text 
          style={[
            styles.productName, 
            { fontSize: getFontSize(16), color: theme.colors.textOnGradient }
          ]} 
          numberOfLines={2}
        >
          {productName}
        </Text>
        {unit && (
          <View style={[
            styles.unitContainerAccent, 
            { backgroundColor: theme.colors.unitColor, borderColor: theme.colors.unitBorderColor }
          ]}>
            <Text style={[styles.unitTextAccent, { color: theme.colors.textOnGradient }]}>
              {unit}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.priceCartContainer}>
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, { fontSize: getFontSize(12), color: theme.colors.textOnGradient }]}>
            От
          </Text>
          <Text style={[styles.price, { fontSize: getFontSize(18), color: theme.colors.textOnGradient }]}>
            {processedBgn} лв.
          </Text>
          <Text style={[styles.price, { fontSize: getFontSize(18), color: theme.colors.textOnGradient }]}>
            {processedEur} €
          </Text>
        </View>
        
        <Animated.View style={isPerformanceMode ? undefined : cartButtonStyle}>
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
                : 'rgba(0, 0, 0, 0.05)',
              opacity: isAddingToCart ? 0.6 : 1, // Visual feedback when adding
            }}
            onPress={handleAddToCart}
            disabled={isAddingToCart} // Prevent multiple clicks
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
          >
            <CartIcon color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

ProductBox.displayName = "ProductBox";