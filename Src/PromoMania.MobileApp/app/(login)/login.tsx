import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

 
import { useAuth } from '@/services/useAuth';

const Login = () => {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    if (!email || !password) {
      Alert.alert('Грешка', 'Моля, попълнете всички полета');
      return;
    }

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
      // Auto-redirect happens in Context via protected route
    } catch (error: any) {
      Alert.alert(
        'Грешка при влизане',
        error.message || 'Невалиден имейл или парола.'
      );
    }
  };

  return (
    <ImageBackground source={require('@/assets/images/background2.webp')} style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
                  placeholderTextColor="#999999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!authLoading}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Парола</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    ref={passwordInputRef}
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor="#999999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    editable={!authLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={moderateScale(20)} 
                      color="#666666" 
                    />
                  </TouchableOpacity>
                </View>
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
                {authLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Вход</Text>
                )}
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
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(40), 
    paddingBottom: verticalScale(40),
    justifyContent: 'center',
  },
  header: {
    marginBottom: verticalScale(32),
    justifyContent:'center',
    alignItems:'center'
  },
  title: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#666666',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(16),
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: verticalScale(48),
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: scale(45),
  },
  eyeIcon: {
    position: 'absolute',
    right: scale(12),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: verticalScale(24),
  },
  forgotPasswordText: {
    color: 'rgba(46, 170, 134, 1)',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  button: {
    backgroundColor: 'rgba(46, 170, 134, 1)',
    borderColor: 'white',
    borderWidth: 1,
    height: verticalScale(50),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(32),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: scale(16),
    color: '#999999',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666666',
    fontSize: moderateScale(14),
  },
  registerLink: {
    color: 'rgba(46, 170, 134, 1)',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
});

export default Login;