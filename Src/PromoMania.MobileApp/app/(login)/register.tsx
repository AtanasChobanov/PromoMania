import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/services/useAuth';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const Register = () => {
  const router = useRouter();
  
  // 1. Get logic from Auth Context
  const { register, isLoading: authLoading, validatePassword } = useAuth();
  
  // Settings for theming (if needed for background/colors)
  const { isDarkMode } = useSettings();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Real-time password checks for the UI
  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_]/.test(password)
    };
  }, [password]);

  const handleRegister = async () => {
    // --- 1. Validation ---
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Грешка', 'Моля, попълнете всички полета');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Грешка', 'Паролите не съвпадат');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Грешка', passwordError);
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Грешка', 'Моля, приемете условията за използване');
      return;
    }

    // --- 2. Registration Logic ---
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // SUCCESS!
      // We do NOT manually navigate here (e.g. router.push).
      // The AuthContext sets 'isOnboarding' to true, which
      // automatically redirects the user to the Options screen.
      
    } catch (error: any) {
      Alert.alert(
        'Грешка при регистрация',
        error.message || 'Възникна грешка при регистрацията. Моля, опитайте отново.'
      );
    }
  };

  const CheckIcon = ({ isValid }: { isValid: boolean }) => (
    <View style={[styles.checkIcon, isValid && styles.checkIconValid]}>
      {isValid && (
        <Text style={styles.checkIconText}>✓</Text>
      )}
    </View>
  );

  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <Svg width={24} height={24} viewBox="0 0 32 32" fill="none">
      {visible ? (
        <>
          <Path
            d="M16 8C11.314 8 7.649 10.389 4.431 13.157 3.246 14.093 2.271 15.099 1.547 16c.724.901 1.699 1.907 2.884 2.843C7.649 21.611 11.314 24 16 24s8.351-2.389 11.569-5.157c1.185-.936 2.16-1.942 2.884-2.843-.724-.901-1.699-1.907-2.884-2.843C24.351 10.389 20.686 8 16 8z"
            stroke="#666666"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M16 20a4 4 0 100-8 4 4 0 000 8z"
            stroke="#666666"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <Path
            d="M22 16a1 1 0 10-2 0h2zm-6 4a1 1 0 100 2v-2zm-6-4a1 1 0 102 0h-2zm6-4a1 1 0 100-2v2zm-2.776 11.68a1 1 0 00-.448 1.95l.448-1.95zm-7.9-2.007a1 1 0 001.351-1.475l-1.35 1.475zM19.242 8.436a1 1 0 00.518-1.932l-.518 1.932zm7.358 1.822a1 1 0 10-1.34 1.484l1.34-1.484zM28 16c0 .464-.243 1.203-.853 2.116-.593.888-1.471 1.845-2.578 2.727C22.351 22.611 19.314 24 16 24v2c3.866 0 7.329-1.611 9.816-3.593 1.246-.993 2.271-2.099 2.994-3.18C29.515 18.172 30 17.037 30 16h-2zM4 16c0-.464.243-1.203.853-2.116.593-.888 1.471-1.845 2.578-2.727C9.649 9.389 12.686 8 16 8V6c-3.866 0-7.329 1.611-9.816 3.593-1.246.993-2.271 2.098-2.994 3.18C2.485 13.828 2 14.963 2 16h2zm16 0a4 4 0 01-4 4v2a6 6 0 006-6h-2zm-8 0a4 4 0 014-4v-2a6 6 0 00-6 6h2zm4 8c-.952 0-1.881-.114-2.776-.32l-.448 1.95c1.031.236 2.111.37 3.224.37v-2zm0-16c1.118 0 2.205.158 3.24.436l.52-1.932A14.489 14.489 0 0016 6v2zm9.258 3.742c.899.812 1.6 1.655 2.071 2.427.482.79.671 1.423.671 1.831h2c0-.928-.389-1.93-.963-2.872-.586-.962-1.42-1.95-2.438-2.87l-1.34 1.484zM6.675 20.198c-.878-.804-1.563-1.636-2.021-2.395C4.184 17.024 4 16.403 4 16H2c0 .917.38 1.906.941 2.836.573.95 1.389 1.926 2.384 2.837l1.35-1.475z"
            fill="#666666"
          />
          <Path
            d="M7 25L25 7"
            stroke="#666666"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );

  return (
    <ImageBackground
      source={require('@/assets/images/background2.webp')} 
      style={styles.backgroundImage} 
      resizeMode="cover"
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
            disabled={authLoading}
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
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Минимум 8 символа"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!authLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={authLoading}
              >
                <EyeIcon visible={showPassword} />
              </TouchableOpacity>
            </View>
            
            {/* Password Requirements Visualization */}
            {password.length > 0 && (
              <View style={styles.passwordRequirements}>
                <View style={styles.requirementRow}>
                  <CheckIcon isValid={passwordChecks.minLength} />
                  <Text style={[
                    styles.requirementText,
                    passwordChecks.minLength && styles.requirementTextValid
                  ]}>
                    Минимум 8 символа
                  </Text>
                </View>
                
                <View style={styles.requirementRow}>
                  <CheckIcon isValid={passwordChecks.hasUpperCase} />
                  <Text style={[
                    styles.requirementText,
                    passwordChecks.hasUpperCase && styles.requirementTextValid
                  ]}>
                    Поне една главна буква
                  </Text>
                </View>
                
                <View style={styles.requirementRow}>
                  <CheckIcon isValid={passwordChecks.hasLowerCase} />
                  <Text style={[
                    styles.requirementText,
                    passwordChecks.hasLowerCase && styles.requirementTextValid
                  ]}>
                    Поне една малка буква
                  </Text>
                </View>
                
                <View style={styles.requirementRow}>
                  <CheckIcon isValid={passwordChecks.hasNumber} />
                  <Text style={[
                    styles.requirementText,
                    passwordChecks.hasNumber && styles.requirementTextValid
                  ]}>
                    Поне една цифра
                  </Text>
                </View>
                
                <View style={styles.requirementRow}>
                  <CheckIcon isValid={passwordChecks.hasSpecialChar} />
                  <Text style={[
                    styles.requirementText,
                    passwordChecks.hasSpecialChar && styles.requirementTextValid
                  ]}>
                    Поне един специален символ (!@#$%^&*)
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Потвърди парола</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Въведете паролата отново"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!authLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={authLoading}
              >
                <EyeIcon visible={showConfirmPassword} />
              </TouchableOpacity>
            </View>
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
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#ffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  passwordRequirements: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconValid: {
    backgroundColor: 'rgba(46, 170, 134, 1)',
    borderColor: 'rgba(46, 170, 134, 1)',
  },
  checkIconText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: 13,
    color: '#666666',
    flex: 1,
  },
  requirementTextValid: {
    color: 'rgba(46, 170, 134, 1)',
    fontWeight: '500',
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor:'#FFFF',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(46, 170, 134, 1)',
    borderColor: 'rgba(255, 255, 255, 1)',
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