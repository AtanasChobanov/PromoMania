import { ProductBoxProps } from "@/components/pages/cart/cartInterfaces";
import { cartStyles } from '@/components/pages/cart/cartStyles';
import { OptionsMenu } from "@/components/pages/cart/OptionsMenu";
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useShoppingCart } from '@/services/useShoppingCart';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';
import Svg, { Path } from "react-native-svg";

type Props = ProductBoxProps & { index: number };

export const ProductBox: React.FC<Props> = React.memo(({
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
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const updateTimeoutRef = useRef<number | null>(null);
  const { updateItemQuantity } = useShoppingCart();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const quantityScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 100,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);

  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  const animateQuantityChange = useCallback(() => {
    Animated.sequence([
      Animated.timing(quantityScaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(quantityScaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [quantityScaleAnim]);

  const handleViewDetails = useCallback(() => {
    setOptionsVisible(false);
    onViewDetails?.();
  }, [onViewDetails]);

  const handleDelete = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOptionsVisible(false);
      onDelete?.();
    });
  }, [onDelete, fadeAnim, slideAnim]);

  const handleSaveForLater = useCallback(() => {
    setOptionsVisible(false);
    onSaveForLater?.();
  }, [onSaveForLater]);

  const openOptions = useCallback(() => setOptionsVisible(true), []);
  const closeOptions = useCallback(() => setOptionsVisible(false), []);

  const debouncedUpdate = useCallback((newQuantity: number) => {
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);

    updateTimeoutRef.current = setTimeout(async () => {
      try {
        await updateItemQuantity(publicId, newQuantity);
      } catch (error) {
        console.error('Failed to update quantity:', error);
        setLocalQuantity(quantity);
      }
    }, 500) as unknown as number;
  }, [publicId, updateItemQuantity, quantity]);

  const handleDecreaseQuantity = useCallback(() => {
    const newQuantity = localQuantity - 1;
    if (newQuantity <= 0) {
      onDelete?.();
      return;
    }
    setLocalQuantity(newQuantity);
    animateQuantityChange();
    debouncedUpdate(newQuantity);
  }, [localQuantity, animateQuantityChange, debouncedUpdate, onDelete]);

  const handleIncreaseQuantity = useCallback(() => {
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    animateQuantityChange();
    debouncedUpdate(newQuantity);
  }, [localQuantity, animateQuantityChange, debouncedUpdate]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  }, [scaleAnim]);
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }).start();
  }, [scaleAnim]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, []);

  const ProductContainer = isPerformanceMode ? View : Animated.View;
  const QuantityText = isPerformanceMode ? Text : Animated.Text;

  return (
    <>
      <ProductContainer
        style={[
          cartStyles.products,
          {
            height: isSimpleMode? moderateScale(200):  moderateScale(170),
            backgroundColor: theme.colors.backgroundColor,
            borderColor: isSimpleMode? theme.colors.textPrimary : '#FFFFFF',
            borderWidth: isSimpleMode? 3 : 1,
            ...(isPerformanceMode ? {} : { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }),
          },
        ]}
      >
        <View style={cartStyles.productContainer}>
          {discount != null && discount !== 0 && <View style={[cartStyles.discount, { padding: 1, backgroundColor: '#DC2626' }]}>
            <Text style={[{ color: 'white', fontSize: isSimpleMode? 20: 14 }]}>-{discount}%</Text>
          </View>}
          <TouchableOpacity
            style={cartStyles.menuButton}
            onPress={openOptions}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={[cartStyles.menuDots, { color: theme.colors.textOnGradient }]}>⋯</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onViewDetails}>
            <Image
              style={[cartStyles.productImage, { width: scale(120) }]}
              source={imageUrl ? { uri: imageUrl } : require("../../../assets/icons/logo-for-boxes.png")}
              resizeMode={imageUrl ? "contain" : "cover"}
            />
          </TouchableOpacity>
          <View style={cartStyles.productDetails}>
            <View>
              {brand ? <Text style={[cartStyles.brand, { color: theme.colors.textOnGradient }]}>{brand}</Text> : null}
              <Text numberOfLines={isSimpleMode?2:1} ellipsizeMode="tail" style={[cartStyles.name, { color: theme.colors.textOnGradient, fontSize: isSimpleMode? moderateScale(18) :moderateScale(17), }]}>{name ?? ""}</Text>
              <Text style={[cartStyles.unit, { color: theme.colors.textOnGradient, fontSize: isSimpleMode? moderateScale(18): moderateScale(14)  }]}>{unit ?? ""}</Text>
              <Text style={[cartStyles.price, { color: theme.colors.textOnGradient,    fontSize: isSimpleMode? moderateScale(22): moderateScale(17), }]}>{price != null ? price.toFixed(2) : "0.00"} лв.</Text>
              <Text style={[cartStyles.price, { color: theme.colors.textOnGradient,fontSize: isSimpleMode? moderateScale(22): moderateScale(17),}]}>{priceEur != null ? priceEur.toFixed(2) : "0.00"} €</Text>
            </View>

        <View style={cartStyles.quantityRow}>
  <BlurView 
    intensity={50} 
    tint={theme.colors.TabBarColors as 'dark' | 'light'} 
    style={[
      cartStyles.blurButton,
      {
        borderWidth: isSimpleMode ? 2 : 0,
        width: isSimpleMode ? moderateScale(40) : moderateScale(30),
        height: isSimpleMode ? moderateScale(40) : moderateScale(30),
      }
    ]}
  >
    <TouchableHighlight 
      underlayColor="transparent" 
      style={[
        cartStyles.buttonTouchable,
        {
          width: isSimpleMode ? moderateScale(40) : moderateScale(30),
          height: isSimpleMode ? moderateScale(40) : moderateScale(30),
        }
      ]} 
      onPress={handleDecreaseQuantity}
    >
      <Svg 
        width={isSimpleMode ? moderateScale(24) : moderateScale(16)} 
        height={isSimpleMode ? moderateScale(24) : moderateScale(16)} 
        viewBox="0 0 24 24"
        style={{ alignSelf: 'center', marginRight:isSimpleMode ? 0:-2}}
      >
        <Path 
          d="M4 12H17" 
          stroke={theme.colors.textPrimary} 
          strokeWidth={isSimpleMode ? "3" : "2.5"} 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableHighlight>
  </BlurView>

  <QuantityText 
    style={[
      cartStyles.quantityText, 
      { 
        color: theme.colors.textPrimary,
        fontSize: isSimpleMode ? moderateScale(22) : moderateScale(16),
        marginHorizontal: isSimpleMode ? moderateScale(20) : moderateScale(16),
        fontWeight: "600",
        ...(isPerformanceMode ? {} : { transform: [{ scale: quantityScaleAnim }] }) 
      }
    ]}
  >
    {localQuantity}
  </QuantityText>

  <BlurView 
    intensity={50} 
    tint={theme.colors.TabBarColors as 'dark' | 'light'} 
    style={[
      cartStyles.blurButton,
      {
        borderWidth: isSimpleMode ? 2 : 0,
        width: isSimpleMode ? moderateScale(40) : moderateScale(30),
        height: isSimpleMode ? moderateScale(40) : moderateScale(30),
      }
    ]}
  >
    <TouchableHighlight 
      underlayColor="transparent" 
      style={[
        cartStyles.buttonTouchable,
        {
          width: isSimpleMode ? moderateScale(40) : moderateScale(30),
          height: isSimpleMode ? moderateScale(40) : moderateScale(30),
        }
      ]} 
      onPress={handleIncreaseQuantity}
    >
      <Svg 
        width={isSimpleMode ? moderateScale(20) : moderateScale(16)} 
        height={isSimpleMode ? moderateScale(20) : moderateScale(16)} 
        
        viewBox="0 0 24 24"
        style={{ alignSelf: 'center', marginRight:isSimpleMode ? 5 :0 }}
      >
        <Path 
          d="M12 4V20M4 12H20" 
          stroke={theme.colors.textPrimary} 
          strokeWidth={isSimpleMode ? "3" : "2.5"} 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableHighlight>
  </BlurView>
</View>
          </View>
        </View>
      </ProductContainer>

      <OptionsMenu
        visible={optionsVisible}
        onClose={closeOptions}
        onViewDetails={handleViewDetails}
        onDelete={handleDelete}
        onSaveForLater={handleSaveForLater}
      />
    </>
  );
}, (prevProps, nextProps) => (
  prevProps.publicId === nextProps.publicId &&
  prevProps.quantity === nextProps.quantity &&
  prevProps.price === nextProps.price &&
  prevProps.index === nextProps.index
));
ProductBox.displayName='ProductBox';