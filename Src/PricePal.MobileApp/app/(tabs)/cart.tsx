/* eslint-disable react/display-name */
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useShoppingCart } from '@/services/useShoppingCart';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [optionsVisible, setOptionsVisible] = useState(false);

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
            <Text style={[styles.menuDots, {color:theme.colors.textPrimary}]}>⋯</Text>
          </TouchableOpacity>

          <Image 
            style={[styles.productImage, { width: scale(120) }]} 
            source={{ uri: imageUrl }} 
            resizeMode="cover"
          />

          <View style={styles.productDetails}>
            <View>
              {brand && <Text style={[styles.brand,{color:theme.colors.textPrimary}]}>{brand}</Text>}
              <Text style={[styles.name,{color:theme.colors.textPrimary}]}>{name}</Text>
              <Text style={[styles.unit,{color:theme.colors.textPrimary}]}>{unit}</Text>
              <Text style={[styles.price,{color:theme.colors.textPrimary}]}>
                {priceEur.toFixed(2)} €
              </Text>
              <Text style={[styles.price,{color:theme.colors.textPrimary}]}>
                {price.toFixed(2)} лв.
              </Text>
              {discount && (
                <Text style={[styles.discount,{color: '#DC2626'}]}>
                  {discount}% отстъпка
                </Text>
              )}
            </View>

            <View style={styles.quantityRow}>
  <BlurView
    intensity={50}
    tint={theme.colors.TabBarColors as 'dark' | 'light'}
    style={styles.blurButton}
  >
    <TouchableHighlight 
      underlayColor="transparent"
      style={styles.buttonTouchable}
      onPress={() => removeButton(publicId)} // you’ll define this below
    >
      <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>-</Text>
    </TouchableHighlight>
  </BlurView>

  <Text style={[styles.quantityText, { color: theme.colors.textPrimary }]}>{quantity}</Text>

  <BlurView
    intensity={50}
    tint={theme.colors.TabBarColors as 'dark' | 'light'}
    style={styles.blurButton}
  >
    <TouchableHighlight 
      underlayColor="transparent"
      style={styles.buttonTouchable}
      onPress={() => addButton(publicId)} // define below
    >
      <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>+</Text>
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
  return (
    prevProps.publicId === nextProps.publicId &&
    prevProps.quantity === nextProps.quantity &&
    prevProps.price === nextProps.price &&
    prevProps.index === nextProps.index
  );
});

const FinalPrice: React.FC<FinalPriceProps> = React.memo(({
  price,
  basePrice,
  saves
}) => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <LinearGradient
      colors={theme.colors.blueTeal}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={[styles.overviewContainer, { padding: scale(20) }]}
    >
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={[styles.summaryTitle, { fontSize: moderateScale(19), color:theme.colors.textPrimary }]}>
            Обобщение на покупките
          </Text>
          {saves > 0 && (
            <Text style={[styles.savingsText, { fontSize: moderateScale(18) }]}>
              Спестяваш {saves.toFixed(2)} лв
            </Text>
          )}
        </View>

        <View style={styles.priceBreakdown}>
          <Text style={{ fontSize: moderateScale(18),color:theme.colors.textPrimary }}>
            Обща цена:
          </Text>
          <Text style={[styles.totalPriceText, { fontSize: moderateScale(18),color:theme.colors.textPrimary }]}>
            {price.toFixed(2)} лв ({(price * 0.51).toFixed(2)} €)
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
});

const OverviewPrice: React.FC<OverviewPriceProps> = React.memo(({
  price,
}) => {
  const { isDarkMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const blurViewProps = {
    intensity: 20,
    tint: theme.colors.TabBarColors as 'dark' | 'light',
    experimentalBlurMethod: 'dimezisBlurView' as const,
  };
  
  const ContainerView = (isPerformanceMode
    ? LinearGradient
    : BlurView) as React.ComponentType<any>;
  const router = useRouter();

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
      <View style={styles.totalPriceRow}>
        <Text style={[styles.totalPriceLabel,{color:theme.colors.textPrimary}]}>
          Обща цена
        </Text>
        <Text style={[styles.totalPriceValue,{color:theme.colors.textPrimary}]}>
          {price.toFixed(2)} лв
        </Text>
      </View>

      <BlurView
        intensity={55}
        tint={theme.colors.TabBarColors as 'dark'| 'light'}
        experimentalBlurMethod="dimezisBlurView"
        style={styles.continueButtonContainer}
      >
        <TouchableHighlight 
          style={styles.continueButton} 
          underlayColor="transparent" 
          onPress={() => router.navigate('/delivaryAndMap/choiceDelivary')}
        >
          <Text style={[styles.continueButtonText,{color:theme.colors.textPrimary}]}>
            Продължи
          </Text>
        </TouchableHighlight>
      </BlurView>
    </ContainerView>
  );
});

const Cart: React.FC = () => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Use the shopping cart hook
  const { 
    items, 
    totalPrice, 
    itemCount,
    isLoading, 
    error,
    refresh 
  } = useShoppingCart();

  // Calculate savings (if you track original prices)
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

  // Convert cart items to ProductBoxProps format
  const products = useMemo(() => {
    return items.map(item => ({
      publicId: item.publicId,
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

  const handleDeleteProduct = useCallback((publicId: string) => {
    // TODO: Implement delete when you add mutations
    console.log('Delete product:', publicId);
  }, []);

  const handleViewDetails = useCallback((publicId: string) => {
    router.push(`/products/${publicId}`);
  }, []);

  const handleSaveForLater = useCallback((publicId: string) => {
    // TODO: Implement save for later
    console.log('Save for later:', publicId);
  }, []);

  // Render item function for FlatList
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
      onViewDetails={() => handleViewDetails(item.publicId)}
      onSaveForLater={() => handleSaveForLater(item.publicId)}
    />
  ), [handleDeleteProduct, handleViewDetails, handleSaveForLater]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: typeof products[0]) => item.publicId, []);

  const ListHeaderComponent = useMemo(() => (
    <View style={styles.titleContainer}>
      <Text style={[styles.mainTitle, { fontSize: moderateScale(30), color:theme.colors.textPrimary }]}>
        Количка
      </Text>
      {itemCount > 0 && (
        <Text style={[styles.itemCount, { color:theme.colors.textPrimary }]}>
          {itemCount} {itemCount === 1 ? 'артикул' : 'артикула'}
        </Text>
      )}
    </View>
  ), [theme.colors.textPrimary, itemCount]);

  const ListFooterComponent = useMemo(() => (
    <>
      {products.length > 0 && (
        <FinalPrice
          price={totalPrice.bgn}
          basePrice={totalPrice.bgn + totalSavings}
          saves={totalSavings}
        />
      )}
      <View style={{ height: moderateScale(250) }} />
    </>
  ), [products.length, totalPrice.bgn, totalSavings]);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textPrimary }]}>
        Количката ви е празна
      </Text>
      <TouchableOpacity 
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.shopButtonText}>Започни пазаруване</Text>
      </TouchableOpacity>
    </View>
  ), [theme.colors.textPrimary]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: moderateScale(176),
    offset: moderateScale(176) * index,
    index,
  }), []);

  // Show loading state
  if (isLoading) {
    return (
      <ImageBackground
        source={theme.backgroundImage}
        style={styles.backgroundImage}
      >
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={theme.colors.textPrimary} />
          <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>
            Зареждане на количката...
          </Text>
        </View>
      </ImageBackground>
    );
  }

  // Show error state
  if (error) {
    return (
      <ImageBackground
        source={theme.backgroundImage}
        style={styles.backgroundImage}
      >
        <View style={[styles.container, styles.centerContent]}>
          <Text style={[styles.errorText, { color: '#DC2626' }]}>
            Грешка при зареждане на количката
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>Опитай отново</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

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
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={3}
          getItemLayout={getItemLayout}
        />
        
        {products.length > 0 && <OverviewPrice price={totalPrice.bgn} />}
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
    height: moderateScale(195),
    borderRadius: 15,
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
    width: '100%',
    height: '100%',
  },
  continueButtonText: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(100),
  },
  emptyText: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    marginBottom: moderateScale(20),
  },
  shopButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(15),
    borderRadius: 12,
  },
  shopButtonText: {
    color: 'white',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: moderateScale(20),
    fontSize: moderateScale(18),
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

});

export default React.memo(Cart);