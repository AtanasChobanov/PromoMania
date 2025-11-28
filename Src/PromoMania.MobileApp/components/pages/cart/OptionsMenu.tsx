import { useSettings } from "@/contexts/SettingsContext";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { OptionsMenuProps } from "./cartInterfaces";
import { cartStyles } from "./cartStyles";

export const OptionsMenu: React.FC<OptionsMenuProps> = React.memo(({
  visible,
  onClose,
  onViewDetails,
  onDelete,
  onSaveForLater,
}) => {
  const { isPerformanceMode } = useSettings();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const MoreOptionsContainer = isPerformanceMode ? View : Animated.View;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 9,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={cartStyles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <MoreOptionsContainer
          style={[
            cartStyles.bottomSheet,
            ...(isPerformanceMode ? [] : [{ transform: [{ translateY: slideAnim }] }]),
          ]}
        >
          <BlurView
            intensity={30}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={cartStyles.blurContainer}
          >
            <View style={cartStyles.handleBar} />

            <Text style={cartStyles.optionsTitle}>Опции за продукта</Text>

            <TouchableOpacity style={cartStyles.optionItem} onPress={onViewDetails}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
                  fill="#333"
                />
                <Circle cx="12" cy="12.5" r="2.5" fill="#333" />
              </Svg>
              <Text style={cartStyles.optionText}>Преглед на детайли</Text>
            </TouchableOpacity>

            <TouchableOpacity style={cartStyles.optionItem} onPress={onSaveForLater}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#FF6B6B"
                />
              </Svg>
              <Text style={cartStyles.optionText}>Запази за по-късно</Text>
            </TouchableOpacity>

            <TouchableOpacity style={cartStyles.optionItem} onPress={onDelete}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                  fill="#FF3B30"
                />
              </Svg>
              <Text style={[cartStyles.optionText, cartStyles.deleteText]}>Премахни от количката</Text>
            </TouchableOpacity>

            <TouchableOpacity style={cartStyles.cancelButton} onPress={onClose}>
              <Text style={cartStyles.cancelText}>Отказ</Text>
            </TouchableOpacity>
          </BlurView>

        </MoreOptionsContainer>
      </TouchableOpacity>
    </Modal>
  );
});
OptionsMenu.displayName = "OptionsMenu";