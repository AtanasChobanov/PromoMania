import { HeartIcon } from '@/components/pages/home/HeartIcon';
import { DealTimer, chainLogos, productPriceHistory } from '@/components/pages/product/productConsts';
import { createStyles } from '@/components/pages/product/productStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import {
  extractPricesByChain,
  getBestPrice,
  useProductDetails
} from '@/services/useProductDetails';
import { useShoppingCart } from '@/services/useShoppingCart';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
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


export default function ProductPage() {
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
   const styles = useMemo(
    () => createStyles({ isSimpleMode }),
    [ isSimpleMode]
  );


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

      await addItem(productId, quantity);
      
      Alert.alert(
        "Добавено към количката",
        `${quantity} x ${product?.name || 'Продукт'} ${quantity === 1 ? 'беше добавен' : 'бяха добавени'} към количката`,
        [{ text: "Продължи" }],
        { cancelable: true }
      );

      setQuantity(1);
    } catch (error) {

      Alert.alert(
        "Грешка",
        "Не успяхме да добавим продукта към количката. Моля, опитайте отново.",
        [{ text: "OK" }],
        { cancelable: true }
      );
      console.error('Failed to add to cart:', error);
    }
  }, [quantity, productId, product?.name, addItem]);

  const LoadingContainer = isPerformanceMode ? View : Animated.View;

  if (loading) {
    return (
      <LoadingContainer style={{ flex: 1 }} entering={isPerformanceMode ? undefined : SlideInRight.duration(200)}>
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

  const ErrorContainer = isPerformanceMode ? View : Animated.View;

  if (error || !product) {
    return (
      <ErrorContainer style={{ flex: 1 }} entering={isPerformanceMode ? undefined : SlideInRight.duration(200)}>
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


  const bestPrice = getBestPrice(product.prices);

  const pricesByChain = extractPricesByChain(product.prices);

 const getNumericPrice = (price: string | number | undefined): string => {
  if (price == null) return "0.00";

  let numericPrice: number;
  
  if (typeof price === "number") {
    numericPrice = price;
  } else {
    numericPrice = parseFloat(price.replace("лв.", "").replace(",", "."));
  }
  
  return numericPrice.toFixed(2);
};

  const ImageContainer = isPerformanceMode ? View : Animated.View;
  const ProductContainer = isPerformanceMode ? View : Animated.View;
  const CategoryContainer = isPerformanceMode ? View : Animated.View;
  const RatingContainer = isPerformanceMode ? View : Animated.View;
  const UnitContainer = isPerformanceMode ? View : Animated.View;
  const QuanitityContainer = isPerformanceMode ? View : Animated.View;
  const RetailStoresContainer = isPerformanceMode ? View : Animated.View;
  const PriceHistoryContainer = isPerformanceMode ? View : Animated.View;
  const BuyButtonContainer = isPerformanceMode ? View : Animated.View;
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
          entering={isPerformanceMode ? undefined : FadeInDown.delay(100).duration(600).springify()}
          style={[styles.imageContainer, { borderColor: theme.colors.borderColor }]}
        >
          <Image
            source={
              product.imageUrl
                ? { uri: product.imageUrl }
                : require('../../assets/icons/logo-for-boxes.png')
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
          entering={isPerformanceMode ? undefined : FadeInDown.delay(200).duration(600).springify()}
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
            entering={isPerformanceMode ? undefined : FadeIn.delay(300).duration(500)}
            style={[styles.productName, { color: theme.colors.textPrimary }]}
          >
            {product.name}
          </TitleText>
             {!!product.brand && (
            <TitleText
              entering={isPerformanceMode ? undefined : FadeIn.delay(320).duration(500)}
              style={[styles.brandText, { color: theme.colors.textSecondary }]}
            >
              {product.brand}
            </TitleText>
          )}

          {/* Brand */}
          {product.brand && (
            <TitleText
              entering={isPerformanceMode ? undefined : FadeIn.delay(320).duration(500)}
              style={[styles.brandText, { color: theme.colors.textSecondary }]}
            >
              {product.brand}
            </TitleText>
          )}

          {/* Category */}
          <CategoryContainer
            entering={isPerformanceMode ? undefined : FadeIn.delay(340).duration(500)}
            style={styles.categoryContainer}
          >
            <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>
              {product.category.name}
            </Text>
          </CategoryContainer>

          {/* Rating */}
          <RatingContainer
            entering={isPerformanceMode ? undefined : FadeIn.delay(350).duration(500)}
            style={styles.ratingContainer}
          >
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <RatingContainer
                  key={i}
                  entering={isPerformanceMode ? undefined : ZoomIn.delay(400 + i * 50)
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

         

          <UnitContainer
            entering={isPerformanceMode ? undefined : FadeIn.delay(500).duration(500)}
            style={styles.unitContainer}
          >
            <Text style={{ color: theme.colors.textPrimary }}>{product.unit}</Text>
          </UnitContainer>

          {/* Quantity */}
          <QuanitityContainer
            entering={isPerformanceMode ? undefined : FadeInUp.delay(550).duration(600).springify()}
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

        {/* Retail Prices */}
{Object.keys(pricesByChain).length > 0 && (
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

    {Object.entries(pricesByChain).map(([chainName, pricePair], index) => {
      const AnimatedContainer = isPerformanceMode ? View : Animated.View;
      const isBestPrice = bestPrice && pricePair.discounted.priceBgn === bestPrice.priceBgn;

      //  Best Price
  if (isBestPrice) {
  return (
    <AnimatedContainer
      key={chainName}
      entering={isPerformanceMode ? undefined : FadeIn.delay(350 + index * 50).duration(500)}
      style={[
        styles.bestDealBox,
        {
          backgroundColor: 'rgba(143, 228, 201, 0.1)',
          borderColor: theme.colors.textGreen,
        }
      ]}
    >
      <View style={styles.bestDealHeader}>
        <View style={styles.bestDealLabelColumn}> 
          <View style={styles.bestDealLabelRow}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill={theme.colors.textGreen}>
              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </Svg>
            <Text style={[styles.bestDealLabel, { color: theme.colors.textGreen }]}>
              НАЙ-ДОБРА ЦЕНА
            </Text>
          </View>
          
          {pricePair.discounted.validTo && (
            <DealTimer validTo={pricePair.discounted.validTo} theme={theme} />
          )}
        </View>
        
        {pricePair.discounted.discount && (
          <View style={[styles.bestDealDiscountPill,{backgroundColor:theme.colors.textGreen}]}>
            <Text style={[styles.bestDealDiscountText, { color: theme.colors.textPrimary }]}>
              -{pricePair.discounted.discount}%
            </Text>
          </View>
        )}
      </View>


            <View style={styles.bestDealContent}>
              <View style={styles.bestDealChainInfo}>
                <Image
                  source={chainLogos[chainName] || require('../../assets/icons/icon.png')}
                  style={styles.bestDealLogo}
                  resizeMode="contain"
                />
                <Text style={[styles.bestDealChainName, { color: theme.colors.textPrimary }]}>
                  {chainName}
                </Text>
              </View>

              <View style={styles.bestDealPriceStack}>
                {/*  Price (BGN) */}
                <View style={styles.priceWrapper}>
                  <Text style={[styles.bestDealPriceMain, { color: theme.colors.textGreen }]}>
                    {getNumericPrice(pricePair.discounted.priceBgn)}
                    <Text style={{ fontSize: 16 }}> лв.</Text>
                  </Text>
                  {pricePair.original && (
                    <Text style={[styles.originalPriceSmall, { color: theme.colors.textSecondary }]}>
                      {getNumericPrice(pricePair.original.priceBgn)} лв.
                    </Text>
                  )}
                </View>

                {/*  Price (EUR) */}
                <View style={styles.priceWrapper}>
                  <Text style={[styles.bestDealPriceMain, { color: theme.colors.textGreen }]}>
                    {getNumericPrice(pricePair.discounted.priceEur)} €
                  </Text>
                  {pricePair.original && (
                    <Text style={[styles.originalPriceSmall, { color: theme.colors.textSecondary }]}>
                      {getNumericPrice(pricePair.original.priceEur)} €
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </AnimatedContainer>
        );
      }

      // Other Options
      return (
        <AnimatedContainer
          key={chainName}
          entering={isPerformanceMode ? undefined : FadeIn.delay(350 + index * 50).duration(500)}
          style={[styles.OneRetailBox,{borderColor:theme.colors.textTertiary, borderTopColor:theme.colors.textTertiary}]}
        >
          <View style={styles.leftSection}>
            <View style={styles.storeInfo}>
              <Image
                style={styles.retailImages}
                source={chainLogos[chainName] || require('../../assets/icons/icon.png')}
              />
              <Text style={[styles.retailText, { color: theme.colors.textPrimary }]}>
                {chainName}
              </Text>
            </View>
            {pricePair.discounted.discount && (
              <View style={[styles.discountContainer, { backgroundColor: theme.colors.textGreen }]}>
                <Text style={[styles.discountText, { color: theme.colors.textPrimary }]}>
                  -{pricePair.discounted.discount}%
                </Text>
              </View>
            )}
          </View>

          {/* BGN Prices Column */}
          <View style={styles.rightSection}>
            <Text style={[styles.retailPrice, { color: theme.colors.textBlue }]}>
              {getNumericPrice(pricePair.discounted.priceBgn)} лв.
            </Text>
            {pricePair.original && (
              <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
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
          entering={isPerformanceMode ? undefined : FadeInDown.delay(400).duration(600).springify()}
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
      <BuyButtonContainer entering={isPerformanceMode ? undefined : ZoomIn.delay(500).duration(500).springify()}>
        <BlurButton
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          intensity={isPerformanceMode ? undefined : 30}
          tint={isPerformanceMode ? undefined : theme.colors.GlassColor}
          colors={isPerformanceMode ? theme.colors.blueTeal : undefined}
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

