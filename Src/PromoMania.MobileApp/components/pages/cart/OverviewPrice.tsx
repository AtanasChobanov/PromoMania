import { cartStyles } from '@/components/pages/cart/cartStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useCartSuggestions } from '@/services/useShoppingCart';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { OverviewPriceProps } from './cartInterfaces';


export const OverviewPrice: React.FC<OverviewPriceProps> = React.memo(({
  priceBgn,
  priceEur,
  isExpanded,
  basePrice,
  basePriceEur,
  saves,
  savesEur,
  bestOfferStore,
  onToggle
}) => {
  const { isDarkMode, isPerformanceMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { isLoading } = useCartSuggestions();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const blurViewProps = {
    intensity: 50,
    tint: theme.colors.TabBarColors as 'dark' | 'light',
    experimentalBlurMethod: 'dimezisBlurView' as const,
  };

  const ContainerView = (isPerformanceMode ? View : BlurView) as React.ComponentType<any>;
  const router = useRouter();

  // Pulse animation
  useEffect(() => {
    if (isPerformanceMode) return;
    
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [priceBgn, priceEur, pulseAnim, isPerformanceMode]);

  // Expansion Animation
  useEffect(() => {
    if (isPerformanceMode) {
      heightAnim.setValue(isExpanded ? 1 : 0);
      opacityAnim.setValue(isExpanded ? 1 : 0);
      return;
    }

    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded, heightAnim, opacityAnim, isPerformanceMode]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const OverviewPriceContainer = isPerformanceMode ? View : Animated.View;
  const ExpandedContent = isPerformanceMode ? View : Animated.View;

  const expandedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, moderateScale(120)],
  });

  return (
    <ContainerView
      style={[
        cartStyles.totalPriceContainer,
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
      <TouchableOpacity activeOpacity={0.9} onPress={onToggle}>
        <OverviewPriceContainer
          style={[
            cartStyles.totalPriceRow,
            ...(isPerformanceMode ? [] : [{ transform: [{ scale: pulseAnim }] }]),
          ]}
        >
          <View>
            <Text style={[cartStyles.totalPriceLabel, { color: theme.colors.textPrimary }]}>
              Обща цена
            </Text>
          </View>
          <View style={cartStyles.pricesConclusion}>
            <Text style={[cartStyles.totalPriceValue, { color: theme.colors.textPrimary }]}>
              {isLoading ? '...' : `${priceBgn.toFixed(2)} лв`}
            </Text>
            <Text style={[cartStyles.totalPriceValue, { color: theme.colors.textPrimary }]}>
              {isLoading ? '...' : `${priceEur.toFixed(2)} €`}
            </Text>
          </View>
        </OverviewPriceContainer>
      </TouchableOpacity>

      <ExpandedContent
        style={[
          cartStyles.expandedContent,
          isPerformanceMode
            ? { height: isExpanded ? moderateScale(120) : 0, opacity: isExpanded ? 1 : 0 }
            : { height: expandedHeight, opacity: opacityAnim }
        ]}
      >
        <View style={cartStyles.expandedInner}>
          <View style={cartStyles.divider} />

          {bestOfferStore && (
            <Text style={[cartStyles.bestOfferText, { color: theme.colors.textPrimary }]}>
              Най-добра оферта от {bestOfferStore}
            </Text>
          )}

          <View style={cartStyles.priceRow}>
            <Text style={[cartStyles.priceLabel, { color: theme.colors.textPrimary }]}>
              Оригинална цена:
            </Text>
            <View style={cartStyles.pricesConclusion}>
              <Text style={[cartStyles.priceValue, { color: theme.colors.textPrimary }]}>
                {basePrice.toFixed(2)} лв
              </Text>
              <Text style={[cartStyles.priceValue, { color: theme.colors.textPrimary }]}>
                {basePriceEur.toFixed(2)} €
              </Text>
            </View>
          </View>

         {saves > 0 && (
  <View style={cartStyles.savingsRow}>
    <Text style={[cartStyles.savingsLabel, { color: '#DC2626' }]}>
      Спестяваш:
    </Text>
    <View style={cartStyles.pricesConclusion}>
      <Text style={[cartStyles.savingsValue, { color: '#DC2626' }]}>
        {saves.toFixed(2)} лв
      </Text>
      <Text style={[cartStyles.savingsValue, { color: '#DC2626' }]}>
        {savesEur.toFixed(2)} €
      </Text>
    </View>
  </View>
)}
        </View>
      </ExpandedContent>

      <TouchableHighlight
        style={cartStyles.continueButtonContainer}
        underlayColor="transparent"
        onPress={() => router.navigate('/delivaryAndMap/choiceDelivary')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <BlurView
          intensity={75}
          tint='systemUltraThinMaterialDark'
          experimentalBlurMethod="dimezisBlurView"
          style={cartStyles.continueButton}
        >
          <View>
            <Text style={[cartStyles.continueButtonText, { color: '#F5F5F5' }]}>
              Продължи
            </Text>
          </View>
        </BlurView>
      </TouchableHighlight>
    </ContainerView>
  );
});
OverviewPrice.displayName = "OverviewPrice";