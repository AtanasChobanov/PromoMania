import { useAuth } from '@/services/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const Index = () => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;
  const featuresFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration:  800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration:  800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction:  4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction:  5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(featuresFadeAnim, {
        toValue: 1,
        duration:  600,
        delay: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, isAuthenticated]);

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="rgba(103, 218, 191, 1)" />
        <Text style={styles.loadingText}>Зареждане...</Text>
      </View>
    );
  }

  // Only show welcome screen if not authenticated
  if (!isAuthenticated) {
    return (
      <ImageBackground
        source={require('@/assets/images/background2.webp')} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Logo Container */}
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: logoScale }]
                }
              ]}
            >
              <View style={styles.logoWrapper}>
                <Image
                  source={require("../../assets/icons/logo.png")}            
                  style={styles.logo}
                  resizeMode="contain"
                />
                  <View style={styles.decorativeCircle} />
              </View>
              <Text style={styles.brandName}>ПромоМания</Text>
            </Animated.View>

            {/* Welcome Text */}
            <Animated.View 
              style={[
                styles.textContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.welcomeText}>
                Откривай. Сравнявай. Пести.
              </Text>
              <Text style={styles.subText}>
                Всички намаления на едно място.{"\n"}
                Сравнявай цени. Спести повече.
              </Text>
              
              {/* Feature highlights */}
              <Animated.View 
                style={[
                  styles.featuresContainer,
                  { opacity: featuresFadeAnim }
                ]}
              >
                <FeatureItem text="Оферти от всички големи магазини" />
                <FeatureItem text="Мигновено сравнение на цени" />
                <FeatureItem text="Проследяване на най-ниските цени" />
              </Animated.View>
            </Animated.View>

            {/* Login Button */}
            <Animated.View 
              style={[
                styles.buttonContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: buttonScale }]
                }
              ]}
            >
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(login)/login" })}
                activeOpacity={0.8}
                style={styles.button}
              >
                <LinearGradient
                  colors={['rgba(46, 170, 134, 1)', 'rgba(40, 150, 120, 1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Започни сега</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }

  // Return null while redirecting
  return null;
};


const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureDot} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: moderateScale(15),
    color: '#666666',
    marginTop: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: isTablet ? '10%' : scale(24),
    paddingTop: Platform.OS === 'ios' 
      ? verticalScale(60) 
      : verticalScale(40),
    paddingBottom: verticalScale(40),
    minHeight: height - (Platform.OS === 'ios' ? 0 : 24),
  },
  logoContainer: {
    alignItems: 'center',
    gap: verticalScale(16),
    marginBottom: verticalScale(20),
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: isSmallDevice 
      ? moderateScale(32) 
      : isTablet 
        ? moderateScale(48) 
        : moderateScale(38),
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: isTablet ? 2 : 1,
    textShadowColor: 'rgba(46, 170, 134, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logo: {
    width: isSmallDevice 
      ? moderateScale(160) 
      : isTablet 
        ? moderateScale(240) 
        : moderateScale(200),
    height: isSmallDevice 
      ? moderateScale(160) 
      : isTablet 
        ? moderateScale(240) 
        : moderateScale(200),
    borderRadius: moderateScale(40),
    shadowColor: '#2eaa86',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 3,
  },
  decorativeCircle: {
    position: 'absolute',
    width: isSmallDevice 
      ? moderateScale(190) 
      : isTablet 
        ? moderateScale(270) 
        : moderateScale(230),
    height: isSmallDevice 
      ? moderateScale(190) 
      : isTablet 
        ? moderateScale(270) 
        : moderateScale(230),
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(46, 170, 134, 0.2)',
    borderStyle: 'dashed',
    zIndex: 2,
  },
  textContainer: {
    alignItems: 'center',
    gap: verticalScale(16),
    paddingHorizontal: scale(16),
    maxWidth: isTablet ? 600 : '100%',
  },
  welcomeText: {
    fontSize: isSmallDevice 
      ? moderateScale(24) 
      : isTablet 
        ? moderateScale(38) 
        : moderateScale(30),
    fontWeight: '800',
    textAlign: 'center',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    lineHeight: isSmallDevice 
      ? moderateScale(34) 
      : isTablet 
        ? moderateScale(50) 
        : moderateScale(42),
    paddingHorizontal: scale(8),
  },
  subText: {
    fontSize: isSmallDevice 
      ? moderateScale(13) 
      : isTablet 
        ? moderateScale(17) 
        : moderateScale(15),
    color: '#555555',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 22 : isTablet ? 28 : 26,
    fontWeight: '400',
    paddingHorizontal: scale(8),
  },
  featuresContainer: {
    marginTop: verticalScale(20),
    gap: verticalScale(12),
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: scale(20),
    maxWidth: isTablet ? 500 : '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    width: '100%',
  },
  featureDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: 'rgba(46, 170, 134, 1)',
    flexShrink: 0,
  },
  featureText: {
    fontSize: isSmallDevice 
      ? moderateScale(12) 
      : isTablet 
        ? moderateScale(16) 
        : moderateScale(14),
    color: '#444444',
    fontWeight: '500',
    flex: 1,
    lineHeight: isSmallDevice ? 18 : isTablet ? 24 : 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: verticalScale(16),
    paddingTop: verticalScale(20),
    maxWidth: isTablet ? 500 : '100%',
  },
  button: {
    width: '100%',
    borderRadius: scale(16),
    overflow: 'hidden',
    shadowColor: '#2eaa86',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth:1,
    borderColor:'white'
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  buttonText: {
    color: '#ffffff',
    fontSize: isSmallDevice 
      ? moderateScale(16) 
      : isTablet 
        ? moderateScale(20) 
        : moderateScale(18),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonArrow: {
    color: '#ffffff',
    textAlign:'center',
    fontSize: isSmallDevice ? 20 : isTablet ? 28 : 24,
    fontWeight: '600',
  },
});

export default Index;