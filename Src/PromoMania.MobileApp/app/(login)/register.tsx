import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/services/useAuth';
import { Ionicons } from '@expo/vector-icons';
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
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
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
            <View
         
              style={{backgroundColor:'rgba(46,170,134,1)'}}
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
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
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
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={authLoading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={moderateScale(20)} 
                  color="#666666" 
                />
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
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
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
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={authLoading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={moderateScale(20)} 
                  color="#666666" 
                />
              </TouchableOpacity>
            </View>
          </View>

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

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ИЛИ</Text>
            <View style={styles.dividerLine} />
          </View>

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
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(40),
  },
  header: {
    marginBottom: verticalScale(32),

  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    borderColor: 'white',
    borderStyle: 'solid',
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'rgba(103, 218, 191, 1)'
  

  },
  title: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: verticalScale(8),
    alignSelf:'center'
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#666666',
        alignSelf:'center'

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
    backgroundColor: '#ffff',
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
  passwordRequirements: {
    marginTop: verticalScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    gap: verticalScale(8),
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  checkIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
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
    fontSize: moderateScale(10),
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: moderateScale(13),
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
    marginBottom: verticalScale(24),
  },
  checkbox: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(6),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor:'#FFFF',
    marginRight: scale(12),
    marginTop: verticalScale(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(46, 170, 134, 1)',
    borderColor: 'rgba(255, 255, 255, 1)',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#666666',
    lineHeight: moderateScale(20),
  },
  link: {
    color: 'rgba(46, 170, 134, 1)',
    fontWeight: '500',
  },
  button: {
    backgroundColor: 'rgba(46, 170, 134, 1)',
    borderColor:'white',
    borderWidth:1,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666666',
    fontSize: moderateScale(14),
  },
  loginLink: {
    color: 'rgba(46, 170, 134, 1)',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
});

export default Register;