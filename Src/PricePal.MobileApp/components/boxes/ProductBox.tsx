import { HeartIcon } from '@/components/boxes/HeartIcon';
import { styles } from '@/components/styles/homeStyles';
import { getFontSize, wp } from '@/components/utils/dimenstions';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    Text,
    TouchableOpacity,
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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  
  const scaleAnim = useSharedValue(1);
  const cartButtonScale = useSharedValue(1);

  const processedPrices = useMemo(() => ({
    bgn: priceBgn.replace(/\s*лв\.?.*$/i, ''),
    eur: priceEur.replace(/€.*/, '')
  }), [priceBgn, priceEur]);

  const cardWidth = useMemo(() => wp(45), []);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }]
  }));

  const cartButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartButtonScale.value }]
  }));

const handleProductPress = useCallback(() => {
  scaleAnim.value = withTiming(0.95, { duration: 100 });
  
  router.push(`/products/${encodeURIComponent(productName)}`);

  setTimeout(() => {
    scaleAnim.value = withTiming(1, { duration: 100 });
  }, 100);
}, [productName, router]);

const handleAddToCart = useCallback((e: any) => {
  e.stopPropagation();
  setIsAddingToCart(true);

  cartButtonScale.value = withSequence(
    withTiming(1.3, { duration: 300 }),
    withTiming(1, { duration: 300 })
  );

  Alert.alert(
    "Добавено към количката",
    `${productName} ${brand} беше добавен към количката`,
    [{ text: "Продължи" }],
    { cancelable: true }
  );
  
  setTimeout(() => setIsAddingToCart(false), 500);
}, [productName, brand]);

  return (
    <View style={{ width: cardWidth }}>
      <Animated.View 
        entering={FadeInDown.delay(index * 100).duration(600).springify()}
      >
        <Animated.View style={scaleStyle}>
          <TouchableOpacity onPress={handleProductPress} activeOpacity={0.9}>
            <View>
              <View style={styles.imageContainer}>
                <Image
                  source={photo ? { uri: photo } : require("../../assets/icons/pricelpal-logo.png")}
                  style={[styles.productImage, { width: cardWidth, height: cardWidth, backgroundColor:'white' }]}
                  resizeMode={photo ? "contain" : "cover"}
                />
                <View style={styles.heartOverlay}>
                  <HeartIcon />
                </View>
              </View>
              
              <LinearGradient
                style={[styles.products, { width: cardWidth }]}
                colors={colors || ['rgba(203,230,246,1)', 'rgba(143,228,201,1)']}
                start={{ x: 0, y: 1 }}
              >
                <View style={styles.productContent}>
                  <View style={styles.productNameContainer}>
                    <Text style={[styles.productName, { fontSize: getFontSize(16) }]} numberOfLines={2}>
                      {productName}
                    </Text>
                    {unit && (
                      <View style={styles.unitContainerAccent}>
                        <Text style={styles.unitTextAccent}>{unit}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.priceCartContainer}>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.priceLabel, { fontSize: getFontSize(12) }]}>От</Text>
                      <Text style={[styles.price, { fontSize: getFontSize(18) }]}>{processedPrices.bgn} лв.</Text>
                      <Text style={[styles.price, { fontSize: getFontSize(18) }]}>{processedPrices.eur} €</Text>
                    </View>
                    <Animated.View style={cartButtonStyle}>
                      <TouchableOpacity 
                        style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonPressed]}
                        onPress={handleAddToCart}
                        activeOpacity={0.7}
                      >
                        <Svg viewBox="0 0 24 24" width={20} height={20}>
                          <Path
                            d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                            fill="#1F2937"
                          />
                        </Svg>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
});
ProductBox.displayName = "ProductBox";