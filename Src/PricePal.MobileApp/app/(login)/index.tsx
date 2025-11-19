import { useAuth } from '@/services/useAuth'; // Adjust path as needed
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Index = () => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  // Redirect to main app if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/home'); // Replace with your main app route
    }
  }, [isLoading, isAuthenticated]);

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="rgba(103, 218, 191, 1)" />
      </View>
    );
  }

  // Only show welcome screen if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/icons/icon.png")}            
              style={styles.logo}
              resizeMode="contain"
            />     
          </View>

          {/* Welcome Text */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeText}>Откривай. Сравнявай. Пести.</Text>
            <Text style={styles.subText}>
              Всички намаления на едно място.{"\n"}
              Сравнявай цени. Спести повече.
            </Text>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/(login)/login" })}
            activeOpacity={0.8}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Започни</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Return null while redirecting
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    alignSelf: 'center',
    justifyContent:'center',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: 'rgba(103, 218, 191, 1)',
    paddingVertical: 20,
    paddingHorizontal: 100,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Index;