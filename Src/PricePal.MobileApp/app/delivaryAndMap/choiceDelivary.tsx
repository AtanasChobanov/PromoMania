import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Svg, { G, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TruckIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const TruckIcon: React.FC<TruckIconProps> = ({
  width = 200,
  height = 200,
  color = "#ffcd1b",
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 512 512"
    fill="none"
  >
    <G>
      <Path
        fill={color}
        d="M311.069,130.515c-0.963-5.641-5.851-9.768-11.578-9.768H35.43
        c-7.61,0-13.772,6.169-13.772,13.765c0,7.61,6.162,13.772,13.772,13.772h64.263
        c7.61,0,13.772,6.17,13.772,13.773c0,7.603-6.162,13.772-13.772,13.772H13.772
        C6.169,175.829,0,181.998,0,189.601c0,7.603,6.169,13.764,13.772,13.764h117.114
        c6.72,0,12.172,5.46,12.172,12.18c0,6.72-5.452,12.172-12.172,12.172H68.665
        c-7.61,0-13.772,6.17-13.772,13.773c0,7.602,6.162,13.772,13.772,13.772h45.857
        c6.726,0,12.179,5.452,12.179,12.172c0,6.719-5.453,12.172-12.179,12.172H51.215
        c-7.61,0-13.772,6.169-13.772,13.772c0,7.603,6.162,13.772,13.772,13.772h87.014
        l5.488,31.042h31.52c-1.854,4.504-2.911,9.421-2.911,14.598c0,21.245,17.218,38.464,38.464,38.464
        c21.237,0,38.456-17.219,38.456-38.464c0-5.177-1.057-10.094-2.911-14.598h100.04
        L311.069,130.515z M227.342,352.789c0,9.146-7.407,16.553-16.553,16.553
        c-9.152,0-16.56-7.407-16.56-16.553c0-6.364,3.627-11.824,8.892-14.598h15.329
        C223.714,340.965,227.342,346.424,227.342,352.789z"
      />
      <Path
        fill={color}
        d="M511.598,314.072l-15.799-77.941l-57.689-88.759H333.074l32.534,190.819h38.42
        c-1.846,4.504-2.904,9.421-2.904,14.598c0,21.245,17.219,38.464,38.456,38.464
        c21.246,0,38.464-17.219,38.464-38.464c0-5.177-1.057-10.094-2.91-14.598h16.741
        c6.039,0,11.759-2.708,15.582-7.386C511.273,326.136,512.8,319.988,511.598,314.072z
        M392.529,182.882h26.314l34.162,52.547h-51.512L392.529,182.882z
        M456.14,352.789c0,9.146-7.407,16.553-16.56,16.553
        c-9.138,0-16.552-7.407-16.552-16.553c0-6.364,3.635-11.824,8.892-14.598h15.329
        C452.513,340.965,456.14,346.424,456.14,352.789z"
      />
    </G>
  </Svg>
);

interface ToolIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const ToolIcon: React.FC<ToolIconProps> = ({
  width = 24,
  height = 24,
  color = "#67dabf",
}) => (
  <Svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
  >
    <Path
      d="M14 22V16.9612C14 16.3537 13.7238 15.7791 13.2494 15.3995L11.5 14
         M11.5 14L13 7.5M11.5 14L10 13M13 7.5L11 7M13 7.5L15.0426 10.7681
         C15.3345 11.2352 15.8062 11.5612 16.3463 11.6693L18 12
         M10 13L11 7M10 13L9.40011 16.2994
         C9.18673 17.473 8.00015 18.2 6.85767 17.8573L4 17
         M11 7L8.10557 8.44721C7.428 8.786 7 9.47852 7 10.2361V12
         M14.5 3.5C14.5 4.05228 14.0523 4.5 13.5 4.5
         C12.9477 4.5 12.5 4.05228 12.5 3.5
         C12.5 2.94772 12.9477 2.5 13.5 2.5
         C14.0523 2.5 14.5 2.94772 14.5 3.5Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChoiceDelivery = () => {
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ImageBackground
      source={theme.backgroundImage}
      style={styles.backgroundImage}
    >
      
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { 
            fontSize: moderateScale(32), 
            color: theme.colors.textPrimary 
          }]}>
            Избери начин на доставка
          </Text>
          <Text style={[styles.subtitle, { 
            fontSize: moderateScale(15), 
            color: theme.colors.textSecondary || theme.colors.textPrimary,
            opacity: 0.7
          }]}>
            Как искате да получите поръчката си?
          </Text>
        </View>

        <View style={styles.optionsWrapper}>
          <TouchableOpacity 
            style={[styles.optionContainer, {  
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.textPrimary,
            }]}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#fff3cd' , borderColor:theme.colors.textTertiary }]}>
              <TruckIcon height={48} width={48} color="#ffcd1b"/>
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(18), 
                color: theme.colors.textPrimary
              }]}>
                Glovo доставка
              </Text>
              <Text style={[styles.optionDescription, {
                fontSize: moderateScale(13), 
                color: theme.colors.textSecondary || theme.colors.textPrimary,
                opacity: 0.6
              }]}>
                Бърза доставка до вратата ви
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={[styles.arrow, { color: theme.colors.textPrimary, opacity: 0.3 }]}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionContainer, {  
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.textPrimary,
            }]}
            onPress={() => router.navigate('/delivaryAndMap/mapDelivery')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#d4f4ea',    borderColor:theme.colors.textTertiary, }]}>
              <ToolIcon height={48} width={48} color="#67dabf"/>
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.optionTitle, {
                fontSize: moderateScale(18), 
                color: theme.colors.textPrimary
              }]}>
                Лично вземане
              </Text>
              <Text style={[styles.optionDescription, {
                fontSize: moderateScale(13), 
                color: theme.colors.textSecondary || theme.colors.textPrimary,
                opacity: 0.6
              }]}>
                Вземете сами от магазина
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={[styles.arrow, { color: theme.colors.textPrimary, opacity: 0.3 }]}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: moderateScale(10),
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: moderateScale(70),
    marginBottom: moderateScale(50),
  },
  mainTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: moderateScale(12),
  },
  subtitle: {
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  optionsWrapper: {
    gap: moderateScale(20),
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    minHeight: moderateScale(100),
  },
  iconContainer: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: 16,
    borderWidth:1,
    borderColor:'gray',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(16),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionTitle: {
    fontWeight: '700',
    marginBottom: moderateScale(4),
    letterSpacing: 0.2,
  },
  optionDescription: {
    fontWeight: '400',
    lineHeight: moderateScale(18),
  },
  arrowContainer: {
    marginLeft: moderateScale(8),
  },
  arrow: {
    fontSize: moderateScale(32),
    fontWeight: '300',
  },
});

export default ChoiceDelivery;