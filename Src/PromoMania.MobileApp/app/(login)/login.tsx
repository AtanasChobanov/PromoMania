import { loginStyles } from '@/components/pages/login/loginStyles';
import { useAuth } from '@/services/useAuth';
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
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';

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

    } catch (error: any) {
      Alert.alert(
        'Грешка при влизане',
        error.message || 'Невалиден имейл или парола.'
      );
    }
  };

  return (
    <ImageBackground source={require('@/assets/images/background2.webp')} style={loginStyles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}>
          
          <ScrollView 
            contentContainerStyle={loginStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={loginStyles.header}>
              <Text style={loginStyles.title}>Добре дошли</Text>
              <Text style={loginStyles.subtitle}>Влезте в профила си</Text>
            </View>

            <View style={loginStyles.form}>
              {/* Email Input */}
              <View style={loginStyles.inputContainer}>
                <Text style={loginStyles.label}>Имейл</Text>
                <TextInput
                  style={loginStyles.input}
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
                />
              </View>

              {/* Password Input */}
              <View style={loginStyles.inputContainer}>
                <Text style={loginStyles.label}>Парола</Text>
                <View style={loginStyles.passwordWrapper}>
                  <TextInput
                    ref={passwordInputRef}
                    style={[loginStyles.input, loginStyles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor="#999999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    editable={!authLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}/>
                  <TouchableOpacity 
                    style={loginStyles.eyeIcon}
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

              <TouchableOpacity 
                style={loginStyles.forgotPassword}
                disabled={authLoading}>
                <Text style={loginStyles.forgotPasswordText}>Забравена парола?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[loginStyles.button, authLoading && loginStyles.buttonDisabled]}
                onPress={handleLogin}
                disabled={authLoading}
                activeOpacity={0.8}>
                {authLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={loginStyles.buttonText}>Вход</Text>
                )}
              </TouchableOpacity>

              <View style={loginStyles.divider}>
                <View style={loginStyles.dividerLine} />
                <Text style={loginStyles.dividerText}>ИЛИ</Text>
                <View style={loginStyles.dividerLine} />
              </View>

              {/* Register Link */}
              <View style={loginStyles.registerContainer}>
                <Text style={loginStyles.registerText}>Нямате акаунт? </Text>
                <TouchableOpacity 
                  onPress={() => router.push({ pathname: "/(login)/register" })}
                  disabled={authLoading}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={loginStyles.registerLink}>Регистрирайте се</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
    </ImageBackground>
  );
};



export default Login;