import { Dimensions } from "react-native";

export const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
export const wp = (percentage: number): number => (percentage * screenWidth) / 100;
export const hp = (percentage: number): number => (percentage * screenHeight) / 100;

export const getFontSize = (size: number): number => {
  if (screenWidth < 350) return size * 0.85; 
  if (screenWidth > 400) return size * 1.1;  
  return size; 
};