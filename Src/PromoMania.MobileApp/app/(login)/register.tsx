import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/services/useAuth';
import { BlurView } from 'expo-blur';
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
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const Register = () => {
  const router = useRouter();
  const { register, isLoading: authLoading, validatePassword } = useAuth();
    const { isDarkMode, isPerformanceMode, isSimpleMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = async () => {
    // Validate empty fields
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Грешка', 'Моля, попълнете всички полета');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      Alert.alert('Грешка', 'Паролите не съвпадат');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Грешка', passwordError);
      return;
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      Alert.alert('Грешка', 'Моля, приемете условията за използване');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      Alert.alert('Успех', 'Регистрацията беше успешна!', [
        { text: 'OK', onPress: () => router.push('/(login)/optionsRegister') }
      ]);
    } catch (error: any) {
      Alert.alert(
        'Грешка при регистрация',
        error.message || 'Възникна грешка при регистрацията. Моля, опитайте отново.'
      );
    }
  };

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
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <BlurView
              intensity={20} 
              tint={'light'}
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFillObject}
            />
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18l-6-6 6-6"
                stroke={'#000000'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>Създайте нов акаунт</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Име</Text>
            <TextInput
              style={styles.input}
              placeholder="Вашето име"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              editable={!authLoading}
            />
          </View>

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
              placeholder="Минимум 8 символа"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              editable={!authLoading}
            />
            <Text style={styles.passwordHint}>
              Паролата трябва да съдържа поне 8 символа, главни и малки букви, цифри и специални символи
            </Text>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Потвърди парола</Text>
            <TextInput
              style={styles.input}
              placeholder="Въведете паролата отново"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              editable={!authLoading}
            />
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
            activeOpacity={0.7}
            disabled={authLoading}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
              {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              Приемам <Text style={styles.link}>условията за използване</Text> и{' '}
              <Text style={styles.link}>политиката за поверителност</Text>
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, authLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={authLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {authLoading ? 'Регистриране...' : 'Регистрирай се'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ИЛИ</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Вече имате акаунт? </Text>
            <TouchableOpacity onPress={() => router.push('/(login)/login')}>
              <Text style={styles.loginLink}>Влезте тук</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: 'gray',
    borderStyle: 'solid',
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
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
    backgroundColor: '#ffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    lineHeight: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(46, 170, 134, 1)',
    borderColor: 'rgba(46, 170, 134, 1)',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  link: {
    color: 'rgba(46, 170, 134, 1)',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666666',
    fontSize: 14,
  },
  loginLink: {
    color: 'rgba(46, 170, 134, 1)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Register;