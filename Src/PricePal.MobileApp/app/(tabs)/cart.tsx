/* eslint-disable react/display-name */
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';


// Get screen dimensions once and memoize
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Memoize these calculations
const wp = (percentage: number): number => (percentage * screenWidth) / 100;
const hp = (percentage: number): number => (percentage * screenHeight) / 100;

const getFontSize = (size: number): number => {
  if (screenWidth < 350) return size * 0.85;
  if (screenWidth > 400) return size * 1.1;
  return size;
};

// Pre-calculate common values
const FONT_SIZES = {
  title: getFontSize(32),
  optionsTitle: getFontSize(20),
  optionText: getFontSize(16),
  cancelText: getFontSize(16),
  summaryTitle: getFontSize(19),
  savingsText: getFontSize(18),
  priceText: getFontSize(16),
  totalPrice: getFontSize(21),
};
const PHONE_BREAKPOINTS = {
  SMALL: screenWidth < 375,   // iPhone SE, small Android phones
  MEDIUM: screenWidth >= 375 && screenWidth < 414,  // iPhone 12/13, standard phones
  LARGE: screenWidth >= 414,   // iPhone 14 Plus, large phones
};

export const responsiveSize = (small: number, medium: number, large: number): number => {
  if (PHONE_BREAKPOINTS.SMALL) return hp(small);
  if (PHONE_BREAKPOINTS.MEDIUM) return hp(medium);
  return hp(large);
};
const DIMENSIONS = {
  imageSize: wp(30),
  productWidth: wp(95),
  productHeight: hp(20),
  overviewHeight: hp(25),
};

interface ProductBoxProps {
  name: string;
  brand: string;
  price: string;
  photo: ImageSourcePropType;
  onDelete?: () => void;
  onViewDetails?: () => void;
  onSaveForLater?: () => void;
}

interface FinalPriceProps {
  saves: number;
  basePrice: number;
  price: number;
}

interface OverviewPriceProps {
  price: number;
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
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.bottomSheet}>
          <BlurView
            intensity={30}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={styles.blurContainer}
          >
            <View style={styles.handleBar} />
            
            <Text style={styles.optionsTitle}>Опции за продукта</Text>
            
            <TouchableOpacity style={styles.optionItem} onPress={onViewDetails}>
              <Text style={styles.optionIcon}>👁️</Text>
              <Text style={styles.optionText}>Преглед на детайли</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={onSaveForLater}>
              <Text style={styles.optionIcon}>❤️</Text>
              <Text style={styles.optionText}>Запази за по-късно</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={onDelete}>
              <Text style={styles.optionIcon}>🗑️</Text>
              <Text style={[styles.optionText, styles.deleteText]}>Премахни от количката</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Отказ</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const ProductBox: React.FC<ProductBoxProps & { index: number }> = React.memo(({
  name,
  brand,
  price,
  photo,
  onDelete,
  onViewDetails,
  onSaveForLater,
  index,
}) => {
   const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
   const theme = isDarkMode ? darkTheme : lightTheme;


  const [productNumber, setProductNumber] = useState(0);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const addButton = useCallback(() => {
    setProductNumber(prev => prev + 1);
  }, []);

  const removeButton = useCallback(() => {
    setProductNumber(prev => Math.max(0, prev - 1));
  }, []);

  const handleViewDetails = useCallback(() => {
    setOptionsVisible(false);
    onViewDetails?.();
  }, [onViewDetails]);

  const handleDelete = useCallback(() => {
    setOptionsVisible(false);
    onDelete?.();
  }, [onDelete]);

  const handleSaveForLater = useCallback(() => {
    setOptionsVisible(false);
    onSaveForLater?.();
  }, [onSaveForLater]);

  const openOptions = useCallback(() => {
    setOptionsVisible(true);
  }, []);

  const closeOptions = useCallback(() => {
    setOptionsVisible(false);
  }, []);

  return (
    <>
      <LinearGradient
        style={styles.products}
        colors={theme.colors.blueTeal}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.productContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openOptions}
          >
            <Text style={[styles.menuDots,,{color:theme.colors.textPrimary}]}>⋯</Text>
          </TouchableOpacity>

          <Image 
            style={[styles.productImage, { width: DIMENSIONS.imageSize }]} 
            source={photo} 
            resizeMode="cover"
          />

          <View style={styles.productDetails}>
            <View>
              <Text style={[styles.brand,{color:theme.colors.textPrimary}]}>{brand}</Text>
              <Text style={[styles.name,{color:theme.colors.textPrimary}]}>{name}</Text>
              <Text style={[styles.price,{color:theme.colors.textPrimary}]}>{price} €</Text>
              <Text style={[styles.price,{color:theme.colors.textPrimary}]}>{price} лв.</Text>
            </View>

            <View style={styles.quantityRow}>
              <BlurView intensity={50} tint={theme.colors.TabBarColors as 'dark'| 'light'} style={styles.blurButton}>
                <TouchableHighlight 
                  underlayColor="transparent" 
                  style={styles.buttonTouchable} 
                  onPress={removeButton}
                >
                  <Text style={[styles.buttonText,{color:theme.colors.textPrimary}]}>-</Text>
                </TouchableHighlight>
              </BlurView>

              <Text style={[styles.quantityText,{color:theme.colors.textPrimary}]}>{productNumber}</Text>

              <BlurView intensity={50}tint={theme.colors.TabBarColors as 'dark'| 'light'} style={styles.blurButton}>
                <TouchableHighlight 
                  underlayColor="transparent" 
                  style={styles.buttonTouchable} 
                  onPress={addButton}
                >
                  <Text style={[styles.buttonText,{color:theme.colors.textPrimary}]}>+</Text>
                </TouchableHighlight>
              </BlurView>
            </View>
          </View>
        </View>
      </LinearGradient>

      <OptionsMenu
        visible={optionsVisible}
        onClose={closeOptions}
        onViewDetails={handleViewDetails}
        onDelete={handleDelete}
        onSaveForLater={handleSaveForLater}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these props change
  return (
    prevProps.name === nextProps.name &&
    prevProps.brand === nextProps.brand &&
    prevProps.price === nextProps.price &&
    prevProps.index === nextProps.index
  );
});

const FinalPrice: React.FC<FinalPriceProps> = React.memo(({
  price,
  basePrice,
  saves
}) => {
   const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  
  // Select appropriate theme based on dark mode setting
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <LinearGradient
      colors={theme.colors.blueTeal}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={[styles.overviewContainer, { padding: wp(5) }]}
    >
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={[styles.summaryTitle, { fontSize: FONT_SIZES.summaryTitle, color:theme.colors.textPrimary }]}>
            Обобщение на покупките
          </Text>
          <Text style={[styles.savingsText, { fontSize: FONT_SIZES.savingsText }]}>
            Спестяваш €{saves}
          </Text>
        </View>

        <View style={styles.priceBreakdown}>
          <Text style={{ fontSize: FONT_SIZES.priceText,color:theme.colors.textPrimary }}>Нормална цена: €{basePrice}</Text>
          <Text style={{ fontSize: FONT_SIZES.priceText,color:theme.colors.textPrimary }}>Обща цена:</Text>
          <Text style={[styles.totalPriceText, { fontSize: FONT_SIZES.totalPrice,color:theme.colors.textPrimary }]}>
            €{price}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
});

const OverviewPrice: React.FC<OverviewPriceProps> = React.memo(({

  price,
}) => {
   const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
     const theme = isDarkMode ? darkTheme : lightTheme;

   const blurViewProps = {
  intensity: 20,
  tint: theme.colors.TabBarColors as 'dark' | 'light',
  experimentalBlurMethod: 'dimezisBlurView' as const,
};
const ContainerView = (isPerformanceMode
  ? LinearGradient
  : BlurView) as React.ComponentType<any>;

  // Select appropriate theme based on dark mode setting
  return (
  <ContainerView
    style={[
      styles.totalPriceContainer,
      { bottom: wp(30) },
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
  <View style={styles.totalPriceRow}>
    <Text style={[styles.totalPriceLabel,{color:theme.colors.textPrimary}]}>Обща цена</Text>
    <Text style={[styles.totalPriceValue,{color:theme.colors.textPrimary}]}>€{price}</Text>
  </View>

  <BlurView
    intensity={55}
    tint={theme.colors.TabBarColors as 'dark'| 'light'}
    experimentalBlurMethod="dimezisBlurView"
    style={styles.continueButtonContainer}
  >
    <TouchableHighlight style={styles.continueButton} underlayColor="transparent">
      <Text style={[styles.continueButtonText,{color:theme.colors.textPrimary}]}>Продължи</Text>
    </TouchableHighlight>
  </BlurView>
</ContainerView>

  );
});

const Cart: React.FC = () => {
   const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  
  // Select appropriate theme based on dark mode setting
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [products, setProducts] = useState<ProductBoxProps[]>([
    { name: "Хляб", brand: "Ресенски", price: "5.99", photo: require("../../assets/images/hlqb.jpg") },
    { name: "Хляб", brand: "Ресенски", price: "5.99", photo: require("../../assets/images/hlqb.jpg") },
    { name: "Хляб", brand: "Ресенски", price: "5.99", photo: require("../../assets/images/hlqb.jpg") },
  ]);

  // Memoize expensive calculations
  const price = useMemo(() => 
    products.reduce((sum, item) => sum + parseFloat(item.price), 0), 
    [products]
  );

  const finalPrice: FinalPriceProps = useMemo(() => ({
    saves: 15.99,
    price: price,
    basePrice: 200.99,
  }), [price]);

  const handleDeleteProduct = useCallback((index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleViewDetails = useCallback((index: number) => {
    router.push('../products/[productID].tsx');
  }, []);

  const handleSaveForLater = useCallback((index: number) => {
    console.log(`Saving product ${index} for later`);
    alert(`Saving product ${index} for later`);
  }, []);

  // Render item function for FlatList
  const renderProduct = useCallback(({ item, index }: { item: ProductBoxProps; index: number }) => (
    <ProductBox
      key={`product-${index}`}
      name={item.name}
      brand={item.brand}
      price={item.price}
      photo={item.photo}
      index={index}
      onDelete={() => handleDeleteProduct(index)}
      onViewDetails={() => handleViewDetails(index)}
      onSaveForLater={() => handleSaveForLater(index)}
    />
  ), [handleDeleteProduct, handleViewDetails, handleSaveForLater]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: ProductBoxProps, index: number) => 
    `product-${index}-${item.name}`, []
  );

  const ListHeaderComponent = useMemo(() => (
    <View style={styles.titleContainer}>
      <Text style={[styles.mainTitle, { fontSize: FONT_SIZES.title, color:theme.colors.textPrimary }]}>Количка</Text>
    </View>
  ), []);

  const ListFooterComponent = useMemo(() => (
    <>
      <FinalPrice
        price={finalPrice.price}
        basePrice={finalPrice.basePrice}
        saves={finalPrice.saves} 
      />
      <View style={{ height: hp(20) }} />
    </>
  ), [finalPrice]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: DIMENSIONS.productHeight + 16,
    offset: (DIMENSIONS.productHeight + 16) * index,
    index,
  }), []);

  return (
    <ImageBackground
      source={theme.backgroundImage}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={3}
          getItemLayout={getItemLayout}
        />
        
        <OverviewPrice price={price} />
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
  flatListContent: {
    paddingTop: hp(5),
    paddingBottom: hp(22),
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: hp(2)
  },
  products: {
    width: wp(95),
    height: responsiveSize(25,20,15),
    borderRadius: 15,
    marginBottom: 16,
    position: 'relative',
  },
  overviewContainer: {
    width: DIMENSIONS.productWidth,
    height: DIMENSIONS.overviewHeight,
    borderRadius: 15,
  },
  mainTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: hp(3),
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
    color: '#333',
  },
  productImage: {
    height: "100%",
    borderRadius: 15,
  },
  productDetails: {
    marginLeft: 16,
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
    paddingVertical: 8,
  },
  brand: {
    fontSize: 18,
    fontWeight: "600",
  },
  name: {
    fontSize: 18,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    overflow: "hidden",
  },
  blurButton: {
    borderRadius: 9999,
    overflow: "hidden",
  },
  buttonTouchable: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 18,
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
    color: '#1F2937',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    maxHeight: hp(50),
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
    fontSize: FONT_SIZES.optionsTitle,
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
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  optionText: {
    fontSize: FONT_SIZES.optionText,
    color: '#333',
    fontWeight: '500',
  },
  deleteText: {
    color: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  cancelText: {
    fontSize: FONT_SIZES.cancelText,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
    totalPriceContainer: {
    position: 'absolute',
    width:wp(95),
    alignSelf:'center',
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
    fontSize: 18, // text-lg ≈ 18px
    fontWeight: 'bold',
    color: '#000',
  },
  totalPriceValue: {
    fontSize: 18, // text-lg ≈ 18px
    fontWeight: '600',
    color: '#000',
  },
  continueButtonContainer: {
    height: 50,
    borderRadius: 10,
    margin: 20, // m-5 ≈ 20px
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
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
  },
  continueButtonText: {
    fontWeight: 'bold',
  },
});

export default React.memo(Cart);