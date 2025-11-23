import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Index = () => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;

  // Redirect to main app if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, isAuthenticated]);

  // Entrance animations
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
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
                source={require("../../assets/icons/icon.png")}            
                style={styles.logo}
                resizeMode="contain"
              />
              {/* Decorative circle */}
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
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>Оферти от всички големи магазини</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>Мигновено сравнение на цени</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>Проследяване на най-ниските цени</Text>
              </View>
            </View>
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
              activeOpacity={0.9}
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
      </ImageBackground>
    );
  }

  // Return null while redirecting
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 38,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  logo: {
    width: 210,
    height: 210,
    borderRadius: 40,
    shadowColor: '#2eaa86',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex:3
  },
  decorativeCircle: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(46, 170, 134, 0.2)',
    borderStyle: 'dashed',
    zIndex:2
  },
  textContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  subText: {
    fontSize: 17,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
  },
  featuresContainer: {
    marginTop: 24,
    gap: 12,
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(46, 170, 134, 1)',
  },
  featureText: {
    fontSize: 15,
    color: '#444444',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2eaa86',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonArrow: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
});

export default Index;