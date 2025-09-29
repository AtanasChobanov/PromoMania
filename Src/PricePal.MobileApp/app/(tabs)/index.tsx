import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ContentLoader, { Rect } from "react-content-loader/native";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useProducts } from '../../services/useProducts';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Product {
  id?: string; 
  name: string;
  chain: string;
  category: string;
  unit?: string;
  priceBgn: string;
  priceEur: string;
  imageUrl: string;
}

const wp = (percentage: number): number => (percentage * screenWidth) / 100;
const hp = (percentage: number): number => (percentage * screenHeight) / 100;

const getFontSize = (size: number): number => {
  if (screenWidth < 350) return size * 0.85; 
  if (screenWidth > 400) return size * 1.1;  
  return size; 
};

const SkeletonCard: React.FC<{ x: number; y: number; width: number; height: number }> = ({ x, y, width, height }) => (
  <Rect x={x} y={y} rx="15" ry="15" width={width} height={height} />
);

const Skeleton: React.FC = () => {
  const cardWidth = wp(45);
  const cardHeight = hp(30);
  
  return (
    <View style={{ flex: 1, paddingTop: hp(7) }}>
      <ContentLoader 
        speed={2}
        width={screenWidth}
        height={screenHeight}
        viewBox={`0 0 ${screenWidth} ${screenHeight}`}
        backgroundColor="#e0e0e0"
        foregroundColor="#f5f5f5"
      >
        <Rect x={wp(20)} y={hp(2)} rx="6" ry="6" width={wp(60)} height={hp(4)} />
        <Rect x={wp(30)} y={hp(7)} rx="4" ry="4" width={wp(40)} height={hp(2.5)} />
        <Rect x={wp(35)} y={hp(15)} rx="5" ry="5" width={wp(30)} height={hp(2.5)} />
        <SkeletonCard x={wp(4)} y={hp(20)} width={cardWidth} height={cardHeight} />
        <SkeletonCard x={wp(51)} y={hp(20)} width={cardWidth} height={cardHeight} />
        <Rect x={wp(33)} y={hp(55)} rx="5" ry="5" width={wp(34)} height={hp(2.5)} />
        <SkeletonCard x={wp(4)} y={hp(60)} width={cardWidth} height={cardHeight} />
        <SkeletonCard x={wp(51)} y={hp(60)} width={cardWidth} height={cardHeight} />
      </ContentLoader>
    </View>
  );
};

const ProductBox: React.FC<{
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
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cartButtonScale = useRef(new Animated.Value(1)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const processedPrices = useMemo(() => ({
    bgn: priceBgn.replace(/\s*лв\.?.*$/i, ''),
    eur: priceEur.replace(/€.*/, '')
  }), [priceBgn, priceEur]);

  const cardWidth = useMemo(() => wp(45), []);

  const handleProductPress = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 80,
      useNativeDriver: true,
    }).start();

    router.push(`/products/${encodeURIComponent(productName)}`);

    setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }, 80);
  }, [productName, router, scaleAnim]);

  const handleAddToCart = useCallback((e: any) => {
    e.stopPropagation();
    setIsAddingToCart(true);

    Animated.sequence([
      Animated.spring(cartButtonScale, { toValue: 1.3, friction: 3, useNativeDriver: true }),
      Animated.spring(cartButtonScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    Alert.alert(
      "Добавено към количката",
      `${productName} ${brand} беше добавен към количката`,
      [{ text: "Продължи" }],
      { cancelable: true }
    );
    
    setTimeout(() => setIsAddingToCart(false), 500);
  }, [productName, brand, cartButtonScale]);

  return (
    <View style={{ width: cardWidth }}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
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
                    <Animated.View style={{ transform: [{ scale: cartButtonScale }] }}>
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

const HeartIcon: React.FC<{ filled?: boolean }> = React.memo(({ filled = false }) => {
  const [isFavorite, setIsFavorite] = useState(filled);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const toggleFavorite = useCallback(() => {
    setIsFavorite(prev => !prev);
    
   Animated.sequence([
  Animated.timing(scaleAnim, {
    toValue: 1.3,
    duration: 150,   
    useNativeDriver: true,
  }),
  Animated.spring(scaleAnim, {
    toValue: 1,
    friction: 6,
    tension: 150,
    useNativeDriver: true,
  }),
]).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite} activeOpacity={0.7}>
        <Svg viewBox="0 0 24 24" width={24} height={24}>
          <Path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={isFavorite ? "#1F2937" : "transparent"}
            stroke="#1F2937"
            strokeWidth={2}
          />
        </Svg>
      </TouchableOpacity>
    </Animated.View>
  );
});
HeartIcon.displayName = "HeartIcon";

const CategoryButton: React.FC<{ title: string; index: number }> = React.memo(({ title, index }) => {
  const buttonWidth = useMemo(() => Math.max(wp(35), 120), []);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, delay: index * 80, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };
  
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.9}>
          <LinearGradient 
            style={[styles.categories, { width: buttonWidth }]}
            colors={['rgba(203,230,246,1)', 'rgba(143,228,201,1)']}
            start={{ x: 0, y: 1 }}
          >
            <Text style={[styles.categoryText, { fontSize: getFontSize(16) }]} numberOfLines={1}>
              {title}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});
CategoryButton.displayName = "CategoryButton";
const ProductSection: React.FC<{
  title: string;
  products: Product[];
  gradientColors: [string, string, ...string[]];
}> = React.memo(({ title, products, gradientColors }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

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
    <Animated.View style={{ opacity: fadeAnim }}>
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
const Index: React.FC = () => {
  const { products, loading, error, isDataAvailable } = useProducts();
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-50)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!loading && !hasAnimated.current) {
      hasAnimated.current = true;
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);
  
  const categories = useMemo(() => ["Месо", "Зеленчуци", "Плодове", "Хляб", "Млечни"], []);

  const filteredProducts = useMemo(() => {
    if (!products.length) return null;

    return {
      ourChoice: products.slice(0, 3),
      top: products.slice(3, 6), 
      mostSold: products.slice(6, 9),
      kaufland: products.filter(p => p.chain === "Kaufland"),
      lidl: products.filter(p => p.chain === "Lidl"),
      billa: products.filter(p => p.chain === "Billa"),
      tmarket: products.filter(p => p.chain === "TMarket"),
    };
  }, [products]);

  const renderCategory = useCallback(({ item, index }: { item: string; index: number }) => (
    <CategoryButton title={item} index={index} />
  ), []);

  if (loading && !isDataAvailable()) {
    return (
      <ImageBackground source={require("../../assets/images/background2.png")} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.loadingContainer}>
          <Skeleton />
        </View>
      </ImageBackground>
    );
  }

  if (error && !isDataAvailable()) {
    return (
      <ImageBackground source={require("../../assets/images/background2.png")} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { fontSize: getFontSize(20) }]}>Грешка при зареждане на продуктите</Text>
          <Text style={[styles.errorDetails, { fontSize: getFontSize(16) }]}>{error.message}</Text>
        </View>
      </ImageBackground>
    );
  }

  const displayProducts = filteredProducts || {
    ourChoice: [], top: [], mostSold: [], kaufland: [], lidl: [], billa: [], tmarket: [],
  };

  return (
    <ImageBackground source={require("../../assets/images/background2.png")} style={styles.backgroundImage} resizeMode="cover">
      <ScrollView 
        style={[styles.container, { paddingTop: hp(7) }]} 
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.titleContainer, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <Text style={[styles.mainTitle, { fontSize: getFontSize(32) }]}>Тази седмица</Text>
          <Text style={[styles.subtitle, { fontSize: getFontSize(20) }]}>Топ категории</Text>
        </Animated.View>
      
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item, index) => `category-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(2) }}
          ItemSeparatorComponent={() => <View style={{ width: wp(3) }} />}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
          initialNumToRender={5}
        />

        <ProductSection title="Нашият избор" products={displayProducts.ourChoice} gradientColors={['rgba(203,230,246,1)', 'rgba(143,228,201,1)']} />
        <ProductSection title="Топ продукти" products={displayProducts.top} gradientColors={['rgba(255,218,185,1)', 'rgba(255,182,193,1)']} />
        <ProductSection title="Най-купувани продукти" products={displayProducts.mostSold} gradientColors={['rgba(221,214,243,1)', 'rgba(196,181,253,1)']} />
        <ProductSection title="Предложения от Kaufland" products={displayProducts.kaufland} gradientColors={['rgba(203,230,246,1)', 'rgba(143,228,201,1)']} />
        <ProductSection title="Предложения от Lidl" products={displayProducts.lidl} gradientColors={['rgba(203,230,246,1)', 'rgba(143,228,201,1)']} />
        <ProductSection title="Предложения от Billa" products={displayProducts.billa} gradientColors={['rgba(203,230,246,1)', 'rgba(143,228,201,1)']} />
        <ProductSection title="Предложения от TMarket" products={displayProducts.tmarket} gradientColors={['rgba(203,230,246,1)', 'rgba(143,228,201,1)']} />
        
        <View style={{ height: hp(22) }} />
        
        {loading && isDataAvailable() && (
          <View style={styles.backgroundRefresh}>
            <ActivityIndicator size="small" color="rgba(143,228,201,0.7)" />
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  //Layout & Containers
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  sectionHeader: {
    alignItems: "center",
    paddingVertical: hp(2),
  },

  //Text Styles
  mainTitle: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#1F2937",
    paddingVertical: hp(1),
  },
  subtitle: {
    fontWeight: "600",
    textAlign: "center",
    color: "#1F2937",
    paddingVertical: hp(1),
  },
  sectionTitle: {
    fontWeight: "600",
    color: "#1F2937",
  },
  categoryText: {
    fontWeight: "500",
    textAlign: "center",
    color: "#1F2937",
  },
  productName: {
    fontWeight: "500",
    textAlign: "center",
  },
  priceLabel: {
    color: "#1F2937",
  },
  price: {
    fontWeight: "bold",
    color: "#1F2937",
  },
  unitTextAccent: {
    fontSize: getFontSize(10),
    fontWeight: "600",
    textAlign: "center",
    color: "#1F2937",
  },
  errorText: {
    fontWeight: "bold",
    textAlign: "center",
    color: "red",
    marginBottom: hp(1),
  },
  errorDetails: {
    textAlign: "center",
    color: "gray",
  },

  // Categories
  categories: {
    padding: wp(3),
    height: hp(6),
    borderRadius: 15,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
    color: "#1F2937",
  },

  //Product Card
  imageContainer: {
    position: "relative",
  },
  productImage: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  heartOverlay: {
    position: "absolute",
    top: hp(1),
    right: wp(2),
    zIndex: 10,
  },
  products: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: wp(3),
    paddingBottom: hp(1),
    elevation: 5,
  },
  productContent: {
    width: "100%",
  },
  productNameContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: hp(3.6) * 2.4,
  },
  priceContainer: {
    alignItems: "flex-start",
  },
  priceCartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  unitContainerAccent: {
    marginTop: hp(0.5),
    alignSelf: "flex-start",
    paddingHorizontal: wp(2),
    paddingVertical: wp(0.5),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(31, 41, 55, 0.2)",
    backgroundColor: "rgba(31, 41, 55, 0.1)",
  },

  //Buttons
  favoriteButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "white",
    elevation: 5,
  },
  addToCartButton: {
    padding: wp(2),
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    elevation: 3,
  },
  addToCartButtonPressed: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    marginTop: hp(7),
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    paddingHorizontal: wp(4),
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundRefresh: {
    position: "absolute",
    top: hp(2),
    right: wp(4),
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});

export default React.memo(Index);