
import { HeartIcon } from '@/components/boxes/HeartIcon';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import {
  getAllCurrentPricesWithOriginals,
  getBestPrice,
  useProductDetails
} from '@/services/useProductDetails';
import { useShoppingCart } from '@/services/useShoppingCart';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { ComponentType, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
import Svg, { Path } from 'react-native-svg';

enableScreens();

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Utility functions
const wp = (percentage: number): number => (percentage * screenWidth) / 100;
const hp = (percentage: number): number => (percentage * screenHeight) / 100;

const getFontSize = (size: number): number => {
  if (screenWidth < 350) return size * 0.85;
  if (screenWidth > 400) return size * 1.1;
  return size;
};

// Constants
const chainLogos: Record<string, any> = {
  Lidl: require('../../assets/icons/Lidl-logo.png'),
  Kaufland: require('../../assets/icons/kaufland-logo.png'),
  Billa: require('../../assets/icons/billa-logo.jpg'),
  TMarket: require('../../assets/icons/tmarket-logo.png'),
};

const productPriceHistory = [
  { value: 10, label: 'Янр' },
  { value: 15, label: 'Фев' },
  { value: 12, label: 'Мар' },
  { value: 15, label: 'Апр' },
  { value: 9, label: 'Май' },
  { value: 10, label: 'Юни' },
];

export default function ProductPage() {
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [quantity, setQuantity] = useState(1);

  const buttonScale = useSharedValue(1);

  const params = useLocalSearchParams();
  const productIdParam = Array.isArray(params.productID) ? params.productID[0] : params.productID;
  const productId = productIdParam || null;

  // Use the product details hook
  const { product, loading, error, refetch } = useProductDetails(productId);
  
  // Use the shopping cart hook
  const { addItem, isAdding } = useShoppingCart();

  // Animations
  useEffect(() => {
    buttonScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [buttonScale]);

  // Cart handler
  const handleAddToCart = useCallback(async () => {
    // Validate quantity
    if (quantity < 1) {
      Alert.alert(
        "Невалидно количество",
        "Моля, въведете валидно количество (минимум 1)",
        [{ text: "OK" }]
      );
      return;
    }

    if (!productId) {
      Alert.alert(
        "Грешка",
        "Невалиден продукт",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      // Add item to cart using the API
      await addItem(productId, quantity);
      
      // Show success alert
      Alert.alert(
        "Добавено към количката",
        `${quantity} x ${product?.name || 'Продукт'} ${quantity === 1 ? 'беше добавен' : 'бяха добавени'} към количката`,
        [{ text: "Продължи" }],
        { cancelable: true }
      );
      
      // Reset quantity to 1 after successful add
      setQuantity(1);
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
  }, [quantity, productId, product?.name, addItem]);
  const LoadingContainer =isPerformanceMode ? View : Animated.View;

  // Loading state
  if (loading) {
    return (
      <LoadingContainer style={{ flex: 1 }} entering={isPerformanceMode ? undefined :SlideInRight.duration(200)}>
        <ImageBackground
          source={theme.backgroundImage}
          style={styles.backgroundImage}
        >
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>
              Зареждане...
            </Text>
          </View>
        </ImageBackground>
      </LoadingContainer>
    );
  }
   const ErrorContainer =isPerformanceMode ? View : Animated.View;

  // Error or not found state
  if (error || !product) {
    return (

      <ErrorContainer style={{ flex: 1 }} entering={isPerformanceMode ? undefined :SlideInRight.duration(200)}>
        <ImageBackground
          source={theme.backgroundImage}
          style={styles.backgroundImage}
        >
          <View style={styles.notFoundContainer}>
            <Text style={[styles.notFoundText, { color: theme.colors.textPrimary }]}>
              {error ? 'Грешка при зареждане на продукта' : 'Продуктът не е намерен'}
            </Text>
            <TouchableOpacity onPress={refetch} style={styles.retryButton}>
              <Text style={[styles.retryButtonText, { color: theme.colors.textGreen }]}>
                Опитай отново
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ErrorContainer>
    );
  }

  // Get best price across all chains
  const bestPrice = getBestPrice(product.prices);

  // Get all current prices with originals grouped by chain
  const pricesByChain = getAllCurrentPricesWithOriginals(product.prices);

  // Helper function to safely extract numeric price
 const getNumericPrice = (price: string | number | undefined): number => {
  if (price == null) return 0;

  if (typeof price === "number") return price;

  return parseFloat(price.replace("лв.", "").replace(",", "."));
};
   const ImageContainer =isPerformanceMode ? View : Animated.View;
   const ProductContainer =isPerformanceMode ? View : Animated.View;
   const CategoryContainer =isPerformanceMode ? View : Animated.View;
     const RatingContainer =isPerformanceMode ? View : Animated.View;
     const BestPriceContainer =isPerformanceMode ? View : Animated.View;
     const UnitContainer =isPerformanceMode ? View : Animated.View;
     const QuanitityContainer =isPerformanceMode ? View : Animated.View;
     const RetailStoresContainer =isPerformanceMode ? View : Animated.View;
     const PriceHistoryContainer =isPerformanceMode ? View : Animated.View;
     const BuyButtonContainer =isPerformanceMode ? View : Animated.View;
    const TitleText = isPerformanceMode ? Text : Animated.Text;
    const BlurButton = (isPerformanceMode ? LinearGradient : BlurView) as ComponentType<any>;

  return (

      <ImageBackground
        source={theme.backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Product Image */}
          <ImageContainer
            entering={isPerformanceMode ? undefined :FadeInDown.delay(100).duration(600).springify()}
            style={[styles.imageContainer,{borderColor:theme.colors.borderColor}]}
          >
            <Image
              source={
                product.imageUrl
                  ? { uri: product.imageUrl }
                  : require('../../assets/icons/icon.png')
              }
              style={styles.productImage}
              resizeMode={product.imageUrl ? 'contain' : 'cover'}
            />
            <View style={styles.heartOverlay}>
              <HeartIcon heartSize={wp(9)} />
            </View>
          </ImageContainer>

          {/* Product Details */}
          <ProductContainer
            entering={isPerformanceMode ? undefined :FadeInDown.delay(200).duration(600).springify()}
            style={[
              styles.detailsContainer,
              {
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.borderColor,
                borderWidth: 1,
              },
            ]}
          >
            <TitleText
              entering={isPerformanceMode ? undefined :FadeIn.delay(300).duration(500)}
              style={[styles.productName, { color: theme.colors.textPrimary }]}
            >
              {product.name}
            </TitleText>

            {/* Brand */}
            {product.brand && (
              <TitleText
                entering={isPerformanceMode ? undefined :FadeIn.delay(320).duration(500)}
                style={[styles.brandText, { color: theme.colors.textSecondary }]}
              >
                {product.brand}
              </TitleText>
            )}

            {/* Category */}
            <CategoryContainer
              entering={isPerformanceMode ? undefined :FadeIn.delay(340).duration(500)}
              style={styles.categoryContainer}
            >
              <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>
                Категория: {product.category.name}
              </Text>
            </CategoryContainer>

            {/* Rating */}
            <RatingContainer
              entering={isPerformanceMode ? undefined :FadeIn.delay(350).duration(500)}
              style={styles.ratingContainer}
            >
              <View style={styles.starsContainer}>
                {[...Array(5)].map((_, i) => (
                  <RatingContainer
                    key={i}
                    entering={isPerformanceMode ? undefined :ZoomIn.delay(400 + i * 50)
                      .duration(400)
                      .springify()}
                  >
                    <Svg viewBox="0 0 24 24" width={20} height={20} style={styles.star}>
                      <Path
                        d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.868 1.486 8.279L12 18.896l-7.422 4.557 1.486-8.279-6.064-5.868 8.332-1.151z"
                        fill={i < 4 ? theme.colors.textGreen : '#E0E0E0'}
                      />
                    </Svg>
                  </RatingContainer>
                ))}
              </View>
              <Text style={[styles.ratingText, { color: theme.colors.textPrimary }]}>
                4.8 (124 reviews)
              </Text>
            </RatingContainer>

            {/* Best Price */}
            {bestPrice && (
              <BestPriceContainer
                entering={isPerformanceMode ? undefined :FadeIn.delay(450).duration(500)}
                style={styles.priceContainer}
              >
                <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                  Най-добра цена ({bestPrice.storeChain.name}):
                </Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: theme.colors.textGreen }]}>
                    {getNumericPrice(bestPrice.priceBgn)} лв.
                  </Text>
                  <Text style={[styles.price, { color: theme.colors.textGreen }]}>
                    {getNumericPrice(bestPrice.priceEur)} €
                  </Text>
                </View>
                {bestPrice.discount && (
                  <View
                    style={[
                      styles.discountBadge,
                      { backgroundColor: theme.colors.textGreen },
                    ]}
                  >
                    <Text style={styles.discountBadgeText}>
                      {bestPrice.discount}% отстъпка
                    </Text>
                  </View>
                )}
              </BestPriceContainer>
            )}

            <UnitContainer
              entering={isPerformanceMode ? undefined :FadeIn.delay(500).duration(500)}
              style={styles.unitContainer}
            >
              <Text style={{ color: theme.colors.textPrimary }}>{product.unit}</Text>
            </UnitContainer>

            {/* Quantity */}
            <QuanitityContainer
              entering={isPerformanceMode ? undefined :FadeInUp.delay(550).duration(600).springify()}
              style={styles.quantitySection}
            >
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                Брой
              </Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    { backgroundColor: theme.colors.textGreen },
                  ]}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.quantityText, { color: theme.colors.textPrimary }]}>
                  {quantity}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    { backgroundColor: theme.colors.textGreen },
                  ]}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </QuanitityContainer>
          </ProductContainer>

          {/* Retail Prices - Show all active prices with original prices */}
         {pricesByChain.size > 0 && (
  <RetailStoresContainer
    entering={isPerformanceMode ? undefined : FadeInDown.delay(300).duration(600).springify()}
    style={[
      styles.retailsContainer,
      {
        backgroundColor: theme.colors.cardBackground,
        borderColor: theme.colors.borderColor,
        borderWidth: 1,
      },
    ]}
  >
    <Text style={[styles.retailTitle, { color: theme.colors.textPrimary }]}>
      Цени в различните вериги
    </Text>
    {Array.from(pricesByChain.entries()).map(([chainName, pricePair], index) => {
      const AnimatedContainer = isPerformanceMode ? View : Animated.View;
      
      return (
        <AnimatedContainer
          key={chainName}
          entering={isPerformanceMode ? undefined : FadeIn.delay(350 + index * 50).duration(500)}
          style={styles.OneRetailBox}
        >
          <View style={styles.leftSection}>
            <View style={styles.storeInfo}>
              <Image
                style={styles.retailImages}
                source={
                  chainLogos[chainName] ||
                  require('../../assets/icons/icon.png')
                }
              />
              <Text
                style={[styles.retailText, { color: theme.colors.textPrimary }]}
              >
                {chainName}
              </Text>
            </View>
            {pricePair.discounted.discount && (
              <View
                style={[
                  styles.discountContainer,
                  { backgroundColor: theme.colors.textGreen },
                ]}
              >
                <Text
                  style={[
                    styles.discountText,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {pricePair.discounted.discount}%
                </Text>
              </View>
            )}
          </View>

          {/* BGN Prices Column */}
          <View style={styles.rightSection}>
            <Text
              style={[
                styles.retailPrice, 
                { color: theme.colors.textBlue }
              ]}
            >
              {getNumericPrice(pricePair.discounted.priceBgn)} лв.
            </Text>
            {pricePair.original && (
              <Text
                style={[
                  styles.originalPrice,
                  { color: theme.colors.textSecondary }
                ]}
              >
                {getNumericPrice(pricePair.original.priceBgn)} лв.
              </Text>
            )}
          </View>

          {/* EUR Prices Column */}
          <View style={styles.rightSection}>
            <Text
              style={[
                styles.retailPrice, 
                { color: theme.colors.textBlue }
              ]}
            >
              {getNumericPrice(pricePair.discounted.priceEur)} €
            </Text>
            {pricePair.original && (
              <Text
                style={[
                  styles.originalPrice,
                  { color: theme.colors.textSecondary }
                ]}
              >
                {getNumericPrice(pricePair.original.priceEur)} €
              </Text>
            )}
          </View>
        </AnimatedContainer>
      );
    })}
  </RetailStoresContainer>
)}

          {/* Price History Chart */}
          <PriceHistoryContainer
            entering={isPerformanceMode ? undefined :FadeInDown.delay(400).duration(600).springify()}
            style={[
              styles.chartContainer,
              {
                backgroundColor: theme.colors.cardBackground,
                paddingHorizontal: 16,
                overflow: 'hidden',
                borderColor: theme.colors.borderColor,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.chartTitle, { color: theme.colors.textPrimary }]}>
              Ценова история
            </Text>
            <Text style={[styles.chartSubtitle, { color: theme.colors.textPrimary }]}>
              Последни 6 месеца
            </Text>

            <LineChart
              data={productPriceHistory}
              thickness={4}
              color={theme.colors.textGreen}
              width={wp(85)}
              height={200}
              spacing={45}
              initialSpacing={0}
              endSpacing={20}
              areaChart
              startFillColor="rgba(143, 228, 201, 0.3)"
              endFillColor="rgba(143, 228, 201, 0.1)"
              startOpacity={0.4}
              endOpacity={0.05}
              hideDataPoints={false}
              dataPointsColor="#8FE4C9"
              dataPointsRadius={6}
              focusEnabled
              showDataPointOnFocus
              showStripOnFocus
              showTextOnFocus
              stripColor="rgba(143, 228, 201, 0.5)"
              stripHeight={200}
              stripOpacity={0.3}
              rulesType="dashed"
              rulesColor={theme.colors.cardBackground}
              showVerticalLines={false}
              maxValue={20}
              noOfSections={4}
              yAxisThickness={1}
              yAxisColor="rgba(255, 255, 255, 0.4)"
              yAxisTextStyle={{
                color: '#999',
                fontSize: 12,
                fontWeight: '500',
              }}
              yAxisLabelPrefix="€"
              xAxisThickness={1}
              xAxisColor="rgba(255, 255, 255, 0.4)"
              xAxisLabelTextStyle={{
                color: '#999',
                fontSize: 12,
                fontWeight: '500',
              }}
              backgroundColor={theme.colors.cardBackground}
              curved
              curvature={0.2}
              pointerConfig={{
                pointerStripHeight: 200,
                pointerStripColor: 'rgba(143, 228, 201, 0.8)',
                pointerStripWidth: 2,
                pointerColor: 'rgba(143, 228, 201, 1)',
                radius: 8,
                pointerLabelWidth: 100,
                pointerLabelHeight: 90,
                pointerLabelComponent: (items: any[]) => {
                  return (
                    <View style={styles.pointerLabel}>
                      <Text style={styles.pointerLabelText}>€{items[0].value}</Text>
                      <Text style={styles.pointerLabelMonth}>{items[0].label}</Text>
                    </View>
                  );
                },
              }}
            />

            <View style={styles.trendIndicator}>
              <Svg viewBox="0 0 24 24" width={16} height={16}>
                <Path
                  d="M7 14l5-5 5 5"
                  stroke={theme.colors.textGreen}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.trendText, { color: theme.colors.textGreen }]}>
                +15% спрямо миналия месец
              </Text>
            </View>
          </PriceHistoryContainer>
        </ScrollView>

        {/* Cart Button */}
        <BuyButtonContainer entering={isPerformanceMode ? undefined :ZoomIn.delay(500).duration(500).springify()}>
          <BlurButton
                  start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
            intensity={isPerformanceMode? undefined :30}
            tint={isPerformanceMode? undefined :theme.colors.GlassColor}
            colors={isPerformanceMode? theme.colors.blueTeal : undefined}
            experimentalBlurMethod="dimezisBlurView"
            style={[styles.blurContainer, { borderColor: 'white' }]}
          >
            <View>

           
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={handleAddToCart}
              disabled={isAdding}
            >
              <Svg
                width={24}
                height={24}
                viewBox="0 0 902.86 902.86"
                fill={theme.colors.textPrimary}
              >
                <Path d="M671.504,577.829l110.485-432.609H902.86v-68H729.174L703.128,179.2L0,178.697l74.753,399.129h596.751V577.829z M685.766,247.188l-67.077,262.64H131.199L81.928,246.756L685.766,247.188z" />
                <Path d="M578.418,825.641c59.961,0,108.743-48.783,108.743-108.744s-48.782-108.742-108.743-108.742H168.717 c-59.961,0-108.744,48.781-108.744,108.742s48.782,108.744,108.744,108.744c59.962,0,108.743-48.783,108.743-108.744 c0-14.4-2.821-28.152-7.927-40.742h208.069c-5.107,12.59-7.928,26.342-7.928,40.742 C469.675,776.858,518.457,825.641,578.418,825.641z M209.46,716.897c0,22.467-18.277,40.744-40.743,40.744 c-22.466,0-40.744-18.277-40.744-40.744c0-22.465,18.277-40.742,40.744-40.742C191.183,676.155,209.46,694.432,209.46,716.897z M619.162,716.897c0,22.467-18.277,40.744-40.743,40.744s-40.743-18.277-40.743-40.744c0-22.465,18.277-40.742,40.743-40.742 S619.162,694.432,619.162,716.897z" />
              </Svg>
              <Text
                style={[styles.cartButtonText, { color: theme.colors.textPrimary }]}
              >
                {isAdding ? 'Добавяне...' : 'Добави към количката'}
              </Text>
            </TouchableOpacity>
             </View>
          </BlurButton>
        </BuyButtonContainer>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  scrollContent: { paddingBottom: 100 },
  imageContainer: {
    backgroundColor: 'white',
    marginTop: wp(15),
    alignItems: 'center',
    paddingVertical: 0,
    marginBottom: hp(2),
    alignSelf: 'center',
    height: hp(40),
    width: wp(94),
    position: 'relative',
    shadowColor: '#000',
    overflow: 'hidden',
    borderRadius: wp(4),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#666666',
  },
  productImage: { height: '100%', width: '100%', resizeMode: 'contain' },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: wp(95),
    alignSelf: 'center',
    borderRadius: wp(4),
    padding: 20,
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productName: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  brandText: { fontSize: 16, color: '#666', marginBottom: 8 },
  categoryContainer: { marginBottom: 12 },
  categoryText: { fontSize: 14, color: '#666' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(1) },
  starsContainer: { flexDirection: 'row', marginRight: 10 },
  star: { marginRight: 2 },
  ratingText: { fontSize: 16, color: '#1F2937' },
  priceContainer: { marginBottom: hp(1) },
  priceLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitContainer: { flexDirection: 'column', alignItems: 'flex-start', marginBottom: hp(2) },
  price: { fontSize: 32, fontWeight: 'bold', color: '#006D77' },
  discountBadge: {
    backgroundColor: 'rgba(143,228,201,1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  discountBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#1F2937' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  quantitySection: { marginBottom: 25 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: {
    backgroundColor: 'rgba(143,228,201,1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  quantityText: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, color: '#333' },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: wp(4),
    width: wp(95),
    alignSelf: 'center',
    padding: 20,
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chartTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  chartSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  pointerLabel: {
    backgroundColor: 'rgba(143, 228, 201, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pointerLabelText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  pointerLabelMonth: { color: 'white', fontSize: 12, opacity: 0.9 },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  trendText: { color: '#4CAF50', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  retailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: wp(4),
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp(95),
    alignSelf: 'center',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  rightSection: { alignItems: 'flex-end', paddingHorizontal: 5, textAlign: 'center', justifyContent:'center' },
  retailImages: { width: wp(10), height: wp(10) },
  retailText: {
    paddingLeft: wp(2),
    fontWeight: 'bold',
    fontSize: getFontSize(16),
    color: '#1F2937',
  },
  discountText: { color: '#1F2937', fontWeight: 'bold', fontSize: 12 },
  retailPrice: {
    fontSize: getFontSize(20),
    fontWeight: 'bold',
    color: '#006D77',
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: getFontSize(18),
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountContainer: {
    backgroundColor: 'rgba(143,228,201,1)',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'center',
  },
  OneRetailBox: {
    paddingVertical: hp(0.5),
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  retailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: getFontSize(18), fontWeight: '500', color: '#333' },
  notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: {
    fontSize: getFontSize(20),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  retryButton: { marginTop: 16, padding: 12 },
  retryButtonText: { fontSize: 16, fontWeight: '600' },
  blurContainer: {
    position: 'absolute',
    bottom: wp(7),
    width: wp(95),
    alignSelf: 'center',
    borderRadius: 15,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  cartButton: { justifyContent: 'center', flexDirection: 'row', alignItems: 'center' },
  cartButtonText: { fontWeight: '600', fontSize: 20, marginLeft: 8 },
  heartOverlay: {
    position: 'absolute',
    top: hp(1),
    right: wp(2),
    zIndex: 10,
  },
});