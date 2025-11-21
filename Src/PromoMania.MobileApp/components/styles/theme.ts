import { BlurTint } from "expo-blur";

export const lightTheme = {
  colors: {
    // Backgrounds
    mainBackground: '#FFFFFF',
    cardBackground: 'rgba(255, 255, 255, 1)',
    cardBackgroundAlt: '#F5F5F5',
    
    // Text
    textReverse:'#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textGreen:'rgba(103, 218, 191, 1)',
    textBlue:'rgba(163, 216, 239, 1)',
    textOnGradient: '#1F2937',
        textOnGradientReverse:'#1F2937', // Dark gray-blue (better than pure black)
    textOnGradientAlt: '#111827', // Even darker for less vibrant gradients
        borderColor:'#C8C8C8',

    // Borders
    border: 'rgba(0, 0, 0, 0.1)',
    borderLight: 'rgba(0, 0, 0, 0.05)',
    
    // Status
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    
    // Loading
    loadingIndicator: 'rgba(143, 228, 201, 0.7)',
    
    // Skeleton
    skeletonBackground: '#e0e0e0',
    skeletonForeground: '#f5f5f5',

    // Gradients
   blueTeal: ['rgba(163, 216, 239, 1)', 'rgba(103, 218, 191, 1)'] as [string, string, ...string[]],
    peachPink: ['rgba(255, 200, 165, 1)', 'rgba(255, 160, 175, 1)'] as [string, string, ...string[]],
    lavenderPurple: ['rgba(200, 191, 231, 1)', 'rgba(167, 139, 250, 1)'] as [string, string, ...string[]],
        backgroundColor:  'rgba(103, 218, 191, 1)',
    secondaryBackgroundColor:'rgba(163, 216, 239, 1)',
     cancelColor:'rgba(255, 77, 109, 1)',

    unitColor:"rgba(31, 41, 55, 0.1)",
    unitBorderColor: "rgba(31, 41, 55, 0.2)",
GlassColor:'systemUltraThinMaterialDark' as BlurTint,
GlassColorReverse:'light'as BlurTint,

    TopBarColors:['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)', 'rgba(255,255,255,0)'] as [string, string, ...string[]],
    TabBarColors:'light',
SafeviewColor:'rgba(255, 255, 255, 0.9)'


  },
  
  // Use background image
  useBackgroundImage: true,
  backgroundImage: require('@/assets/images/background2.webp'),
};

export const darkTheme = {
  colors: {
    // Backgrounds
    mainBackground: '#121212',
    cardBackground: 'rgba(30, 30, 30, 0.9)',
    cardBackgroundAlt: '#1E1E1E',
    
    // Text
     textReverse:'#000000',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    textGreen:'rgba(46, 170, 134, 1)',
    textBlue:'rgba(45, 153, 211, 1)',
    borderColor:'#C8C8C8',
    textOnGradient: '#FFFFFF',
    textOnGradientReverse:'#1F2937', 
    textOnGradientAlt: '#F9FAFB', // Slightly off-white for subtle depth
    // Borders
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    
    // Status
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    
    // Loading
    loadingIndicator: 'rgba(143, 228, 201, 0.7)',
    
    // Skeleton
    skeletonBackground: '#2a2a2a',
    skeletonForeground: '#3a3a3a',

    // Gradients
    blueTeal: ['rgba(45, 153, 211, 1)', 'rgba(46, 170, 134, 1)'] as [string, string, ...string[]],
    peachPink: ['rgba(239, 122, 20, 1)', 'rgba(239, 30, 63, 1)'] as [string, string, ...string[]],
    lavenderPurple: ['rgba(110, 80, 180, 1)', 'rgba(140, 80, 200, 1)'] as [string, string, ...string[]],
    backgroundColor:  'rgba(46, 170, 134, 1)',
    secondaryBackgroundColor:'rgba(45, 153, 211, 1)',
    cancelColor:'rgba(239, 30, 63, 1)',
//Unit
unitColor: "rgba(229, 231, 235, 0.1)",
unitBorderColor: "rgba(229, 231, 235, 0.2)",

            
GlassColor:'light'as BlurTint,
GlassColorReverse:'systemUltraThinMaterialDark'as BlurTint,

TopBarColors:['rgba(31, 41, 55, 0.9)', 'rgba(31, 41, 55, 0.7)', 'transparent'] as [string, string, ...string[]],
TabBarColors:'dark',
SafeviewColor:'#1c2534'


  },

  useBackgroundImage: true,
  backgroundImage: require('@/assets/images/background_dark.webp'),
};

export type Theme = typeof lightTheme;