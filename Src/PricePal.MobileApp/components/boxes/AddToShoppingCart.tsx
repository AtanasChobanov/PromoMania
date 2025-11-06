import { darkTheme, lightTheme } from '@/components/styles/theme';
import { getFontSize, hp, wp } from '@/components/utils/dimenstions';
import { useSettings } from '@/contexts/SettingsContext';
import { Product } from '@/services/useProducts';
import { useShoppingCart } from '@/services/useShoppingCart';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AddToCartModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddToCartModal: React.FC<AddToCartModalProps> = ({
  visible,
  product,
  onClose,
  onSuccess,
}) => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { addItem, isAdding } = useShoppingCart();
  const [quantity, setQuantity] = useState(1);

  const handleClose = () => {
    setQuantity(1); // Reset quantity
    onClose();
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addItem(product.publicId, quantity);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // You might want to show an error toast here
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.container, { backgroundColor: theme.colors.backgroundColor }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text
              style={[
                styles.productName,
                { color: theme.colors.textPrimary, fontSize: getFontSize(18) },
              ]}
              numberOfLines={2}
            >
              {product.name}
            </Text>
            {product.brand && (
              <Text
                style={[
                  styles.productBrand,
                  { color: theme.colors.textSecondary, fontSize: getFontSize(14) },
                ]}
              >
                {product.brand}
              </Text>
            )}
            <Text
              style={[
                styles.productPrice,
                { color: theme.colors.textPrimary, fontSize: getFontSize(20) },
              ]}
            >
              {product.priceBgn} лв
            </Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text
              style={[
                styles.quantityLabel,
                { color: theme.colors.textPrimary, fontSize: getFontSize(16) },
              ]}
            >
              Количество:
            </Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  { backgroundColor: theme.colors.cardBackground },
                ]}
                onPress={decrementQuantity}
                disabled={isAdding}
              >
                <Text
                  style={[
                    styles.quantityButtonText,
                    { color: theme.colors.textPrimary, fontSize: getFontSize(24) },
                  ]}
                >
                  −
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  styles.quantityValue,
                  { color: theme.colors.textPrimary, fontSize: getFontSize(20) },
                ]}
              >
                {quantity}
              </Text>

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  { backgroundColor: theme.colors.cardBackground },
                ]}
                onPress={incrementQuantity}
                disabled={isAdding}
              >
                <Text
                  style={[
                    styles.quantityButtonText,
                    { color: theme.colors.textPrimary, fontSize: getFontSize(24) },
                  ]}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: theme.colors.cardBackground },
              ]}
              onPress={handleClose}
              disabled={isAdding}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.colors.textPrimary, fontSize: getFontSize(16) },
                ]}
              >
                Отказ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.addButton,
                { backgroundColor: theme.colors.textPrimary },
                isAdding && styles.buttonDisabled,
              ]}
              onPress={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    styles.addButtonText,
                    { fontSize: getFontSize(16) },
                  ]}
                >
                  Добави в количката
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: wp(85),
    borderRadius: 20,
    padding: wp(5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productInfo: {
    marginBottom: hp(3),
    alignItems: 'center',
  },
  productName: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: hp(0.5),
  },
  productBrand: {
    fontWeight: '500',
    marginBottom: hp(1),
  },
  productPrice: {
    fontWeight: '700',
  },
  quantitySection: {
    marginBottom: hp(3),
  },
  quantityLabel: {
    fontWeight: '600',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontWeight: '700',
  },
  quantityValue: {
    fontWeight: '700',
    marginHorizontal: wp(8),
    minWidth: wp(10),
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: wp(3),
  },
  button: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {},
  addButton: {},
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});