import { BackButton } from '@/components/common/BackButton';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { registerStyles } from '@/components/pages/register/registerStyles';
import { useAuth } from '@/services/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
const Register = () => {
  const router = useRouter();
  
  const { register, isLoading: authLoading, validatePassword } = useAuth();
  
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
    //Validation
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

    //Registration Logic
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      
    } catch (error: any) {
      Alert.alert(
        'Грешка при регистрация',
        error.message || 'Възникна грешка при регистрацията. Моля, опитайте отново.'
      );
    }
  };


  return (
    <ImageBackground
      source={require('@/assets/images/background2.webp')} 
      style={registerStyles.backgroundImage} 
      resizeMode="cover"
    >
      
         <BackButton />
      <ScrollView 
        contentContainerStyle={registerStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header */}
        <View style={registerStyles.header}>
         
        
     
          <Text style={registerStyles.title}>Регистрация</Text>
          <Text style={registerStyles.subtitle}>Създайте нов акаунт</Text>
        </View>

        {/* Form */}
        <View style={registerStyles.form}>
          {/* Name Input */}
          <View style={registerStyles.inputContainer}>
            <Text style={registerStyles.label}>Име</Text>
            <TextInput
              style={registerStyles.input}
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
          <View style={registerStyles.inputContainer}>
            <Text style={registerStyles.label}>Имейл</Text>
            <TextInput
              style={registerStyles.input}
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
          <View style={registerStyles.inputContainer}>
            <Text style={registerStyles.label}>Парола</Text>
            <View style={registerStyles.passwordWrapper}>
              <TextInput
                style={[registerStyles.input, registerStyles.passwordInput]}
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
                style={registerStyles.eyeIcon}
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
              <View style={registerStyles.passwordRequirements}>
                <View style={registerStyles.requirementRow}>
                  <CheckIcon isValid={passwordChecks.minLength} />
                  <Text style={[
                    registerStyles.requirementText,
                    passwordChecks.minLength && registerStyles.requirementTextValid
                  ]}>
                    Минимум 8 символа
                  </Text>
                </View>
                
                <View style={registerStyles.requirementRow}>
                  <CheckIcon isValid={passwordChecks.hasUpperCase} />
                  <Text style={[
                    registerStyles.requirementText,
                    passwordChecks.hasUpperCase && registerStyles.requirementTextValid
                  ]}>
                    Поне една главна буква
                  </Text>
                </View>
                
                <View style={registerStyles.requirementRow}>
                  <CheckIcon isValid={passwordChecks.hasLowerCase} />
                  <Text style={[
                    registerStyles.requirementText,
                    passwordChecks.hasLowerCase && registerStyles.requirementTextValid
                  ]}>
                    Поне една малка буква
                  </Text>
                </View>
                
                <View style={registerStyles.requirementRow}>
                  <CheckIcon isValid={passwordChecks.hasNumber} />
                  <Text style={[
                    registerStyles.requirementText,
                    passwordChecks.hasNumber && registerStyles.requirementTextValid
                  ]}>
                    Поне една цифра
                  </Text>
                </View>
                
                <View style={registerStyles.requirementRow}>
                  <CheckIcon isValid={passwordChecks.hasSpecialChar} />
                  <Text style={[
                    registerStyles.requirementText,
                    passwordChecks.hasSpecialChar && registerStyles.requirementTextValid
                  ]}>
                    Поне един специален символ (!@#$%^&*)
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={registerStyles.inputContainer}>
            <Text style={registerStyles.label}>Потвърди парола</Text>
            <View style={registerStyles.passwordWrapper}>
              <TextInput
                style={[registerStyles.input, registerStyles.passwordInput]}
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
                style={registerStyles.eyeIcon}
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
            style={registerStyles.checkboxContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
            activeOpacity={0.7}
            disabled={authLoading}>
            <View style={[registerStyles.checkbox, acceptTerms && registerStyles.checkboxChecked]}>
              {acceptTerms && <Text style={registerStyles.checkmark}>✓</Text>}
            </View>
            <Text style={registerStyles.checkboxText}>
              Приемам <Text style={registerStyles.link}>условията за използване</Text> и{' '}
              <Text style={registerStyles.link}>политиката за поверителност</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[registerStyles.button, authLoading && registerStyles.buttonDisabled]}
            onPress={handleRegister}
            disabled={authLoading}
            activeOpacity={0.8}
          >
            <Text style={registerStyles.buttonText}>
              {authLoading ? 'Регистриране...' : 'Регистрирай се'}
            </Text>
          </TouchableOpacity>

          <View style={registerStyles.divider}>
            <View style={registerStyles.dividerLine} />
            <Text style={registerStyles.dividerText}>ИЛИ</Text>
            <View style={registerStyles.dividerLine} />
          </View>

          <View style={registerStyles.loginContainer}>
            <Text style={registerStyles.loginText}>Вече имате акаунт? </Text>
            <TouchableOpacity onPress={() => router.push('/(login)/login')}>
              <Text style={registerStyles.loginLink}>Влезте тук</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};



export default Register;