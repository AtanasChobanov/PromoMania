import { CategoryButton } from '@/components/boxes/CategoryButton';
import { ProductSection } from '@/components/boxes/ProductSection';
import { gradientPresets } from '@/components/styles/gradients';
import { styles } from '@/components/styles/homeStyles';
import { getFontSize, hp, screenHeight, screenWidth, wp } from '@/components/utils/dimenstions';
import React, { useCallback, useMemo } from 'react';
import ContentLoader, { Rect } from "react-content-loader/native";
import { ActivityIndicator, FlatList, ImageBackground, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useProducts } from '../../services/useProducts';
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




const Index: React.FC = () => {
  const { products, loading, error, isDataAvailable } = useProducts();
  
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
        <Animated.View 
          entering={FadeInDown.delay(100).duration(800).springify()} 
          style={styles.titleContainer}
        >
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

        <ProductSection title="Нашият избор" products={displayProducts.ourChoice} gradientColors={gradientPresets.blueTeal} />
        <ProductSection title="Топ продукти" products={displayProducts.top} gradientColors={gradientPresets.lavenderPurple} />
        <ProductSection title="Най-купувани продукти" products={displayProducts.mostSold} gradientColors={gradientPresets.peachPink} />
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

export default React.memo(Index);