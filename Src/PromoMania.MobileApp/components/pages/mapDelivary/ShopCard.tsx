// @/components/pages/mapDelivary/ShopCard.tsx
import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { shopColors, shopImages } from './mapDelivaryConstants';
import { AlertIcon, CarIcon, ClockIcon, LocationIcon, SparkleIcon } from './mapDelivaryIcons';
import { ShopData } from './mapDelivaryInterfaces';
import { mapDelivaryStyles } from './mapDelivaryStyles';

interface ShopCardProps {
  shopData: ShopData;
  isSelected: boolean;
  isBestOffer: boolean;
  isClosest: boolean;
  theme: any; // Or your Theme type
  onPress: (name: string) => void;
}

const ShopCard = ({ shopData, isSelected, isBestOffer, isClosest, theme, onPress }: ShopCardProps) => {
  const colors = shopColors[shopData.name as keyof typeof shopColors];
  const shopImage = shopImages[shopData.name as keyof typeof shopImages];
  
  // Disable interaction if not found
  const isDisabled = !shopData.isLocationFound;

  return (
    <Pressable  
      style={[
        mapDelivaryStyles.optionContainer, 
        {  
          backgroundColor: theme.colors.cardBackground,
          borderColor: isSelected ? colors.primary : theme.colors.border,
          borderWidth: isSelected ? 2 : 1,
          transform: [{ scale: isSelected ? 1.02 : 1 }],
          opacity: isDisabled ? 0.7 : 1, 
        }
      ]}
      onPress={() => !isDisabled && onPress(shopData.name)}
    >
      <View style={[mapDelivaryStyles.iconContainer, { backgroundColor: isDisabled ? '#f0f0f0' : colors.secondary }]}>
        <Image 
          style={{ width: 28, height: 28, opacity: isDisabled ? 0.5 : 1 }} 
          source={shopImage}
          resizeMode="contain"
        />
        <Text style={[mapDelivaryStyles.chainName, { color: isDisabled ? '#666' : colors.primary }]}>
          {shopData.name}
        </Text>
      </View>

      {/* --- PRICE SECTION --- */}
      <View style={mapDelivaryStyles.infoSection}>
        <Text style={[mapDelivaryStyles.sectionLabel, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
          Цена
        </Text>
        <View style={mapDelivaryStyles.dataGroup}>
          <View style={[mapDelivaryStyles.dataBadge, { borderColor: isDisabled ? '#ccc' : colors.primary, backgroundColor:theme.colors.cardBackground }]}>
            <Text style={[mapDelivaryStyles.dataText, { color: theme.colors.textPrimary }]}>
              {shopData.price_bgn.toFixed(2)} лв
            </Text>
          </View>
          <View style={[mapDelivaryStyles.dataBadge, { borderColor: isDisabled ? '#ccc' : colors.primary }]}>
            <Text style={[mapDelivaryStyles.dataText, { color: theme.colors.textPrimary }]}>
              {shopData.price_eur.toFixed(2)} €
            </Text>
          </View>
        </View>
      </View>

      {/* --- DISTANCE SECTION --- */}
      <View style={mapDelivaryStyles.infoSection}>
        <Text style={[mapDelivaryStyles.sectionLabel, { color: theme.colors.textSecondary || theme.colors.textPrimary }]}>
          Разстояние
        </Text>
        
        {!shopData.isLocationFound ? (
           <View style={mapDelivaryStyles.dataGroup}>
             <View style={[mapDelivaryStyles.dataBadge, { borderColor: theme.colors.error || '#FF4444', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
               <AlertIcon size={14} color={theme.colors.error || '#FF4444'} />
               <Text style={[mapDelivaryStyles.dataText, { color: theme.colors.error || '#FF4444', fontSize: moderateScale(11) }]}>
                 Няма локация
               </Text>
             </View>
           </View>
        ) : shopData.route ? (
          <View style={mapDelivaryStyles.dataGroup}>
            <View style={[mapDelivaryStyles.dataBadge, { borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <CarIcon size={15} color={theme.colors.textPrimary} />
              <Text style={[mapDelivaryStyles.dataText, { color: theme.colors.textPrimary }]}>
                {shopData.route.distanceText}
              </Text>
            </View>
            <View style={[mapDelivaryStyles.dataBadge, { borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
              <ClockIcon size={14} color={theme.colors.textPrimary} />
              <Text style={[mapDelivaryStyles.dataText, { color: theme.colors.textPrimary }]}>
                {shopData.route.durationText}
              </Text>
            </View>
          </View>
        ) : (
          <View style={mapDelivaryStyles.dataGroup}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[mapDelivaryStyles.calculatingText, { color: theme.colors.textSecondary }]}>
              Изчисляване...
            </Text>
          </View>
        )}
      </View>

      <View style={mapDelivaryStyles.arrowContainer}>
        {!isDisabled && (
           <Text style={[mapDelivaryStyles.arrow, { color: colors.primary, opacity: 0.6 }]}>›</Text>
        )}
      </View>

      {isBestOffer && (
        <View style={[mapDelivaryStyles.bestDealBadge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
          <SparkleIcon size={14} color="#fff" />
          <Text style={mapDelivaryStyles.bestDealText}>Най-добра цена</Text>
        </View>
      )}
      
      {isClosest && !isBestOffer && shopData.isLocationFound && (
        <View style={[mapDelivaryStyles.closestBadge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
          <LocationIcon size={14} color="#fff" />
          <Text style={mapDelivaryStyles.closestText}>Най-близък магазин</Text>
        </View>
      )}
    </Pressable>
  );
};

export default ShopCard;