import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/services/useAuth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const Login = () => {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Validate empty fields
    if (!email || !password) {
      Alert.alert('Грешка', 'Моля, попълнете всички полета');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Грешка', 'Моля, въведете валиден имейл адрес');
      return;
    }

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      // Successfully logged in, navigate to home
      router.push('/(tabs)/home');
    } catch (error: any) {
      Alert.alert(
        'Грешка при влизане',
        error.message || 'Невалиден имейл или парола. Моля, опитайте отново.'
      );
    }
  };
  const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
      <ImageBackground
                source={theme.backgroundImage} 
                style={styles.backgroundImage} 
                resizeMode="cover"
              >
    <KeyboardAvoidingView 
     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Добре дошли</Text>
          <Text style={styles.subtitle}>Влезте в профила си</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Имейл</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!authLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Парола</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!authLoading}
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            disabled={authLoading}
          >
            <Text style={styles.forgotPasswordText}>Забравена парола?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, authLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={authLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {authLoading ? 'Влизане...' : 'Вход'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ИЛИ</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Нямате акаунт? </Text>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: "/(login)/register" })}
              disabled={authLoading}
            >
              <Text style={styles.registerLink}>Регистрирайте се</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
   backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: 'rgba(46, 170, 134, 1)',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: 'rgba(46, 170, 134, 1)',
    borderColor:'white',
    borderWidth:1,
    paddingVertical: 16,
    borderRadius: 12,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999999',
    fontSize: 14,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666666',
    fontSize: 14,
  },
  registerLink: {
    color: 'rgba(46, 170, 134, 1)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Login;