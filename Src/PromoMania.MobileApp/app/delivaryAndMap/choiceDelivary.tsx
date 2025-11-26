import { PersonIcon } from '@/components/icons/PersonIcon';
import { TruckIcon } from '@/components/icons/TruckIcon';
import { choiceDelivaryStyles } from '@/components/pages/choiceDelivary/choiceDelivaryStyles';
import { darkTheme, lightTheme } from '@/components/styles/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const ChoiceDelivery = () => {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ImageBackground
      source={theme.backgroundImage}
      style={choiceDelivaryStyles.backgroundImage}
    >
      
      <View style={choiceDelivaryStyles.container}>
        <View style={choiceDelivaryStyles.titleContainer}>
          <Text style={[choiceDelivaryStyles.mainTitle, { 
            fontSize: moderateScale(32), 
            color: theme.colors.textPrimary 
          }]}>
            Избери начин на доставка
          </Text>
          <Text style={[choiceDelivaryStyles.subtitle, { 
            fontSize: moderateScale(15), 
            color: theme.colors.textSecondary || theme.colors.textPrimary,
            opacity: 0.7
          }]}>
            Как искате да получите поръчката си?
          </Text>
        </View>

        <View style={choiceDelivaryStyles.optionsWrapper}>
          <TouchableOpacity 
            style={[choiceDelivaryStyles.optionContainer, {  
                  backgroundColor:'rgba(240,240,240,1)',

              borderColor: theme.colors.textPrimary,
            }]}
            activeOpacity={0.7}
          >
            <View style={[choiceDelivaryStyles.iconContainer, { backgroundColor: 'rgba(255, 243, 205, 0.2)' , borderColor:theme.colors.textTertiary }]}>
              <TruckIcon height={48} width={48} color="#rgba(255, 205, 27, 0.3)"/>
            </View>
            <View style={choiceDelivaryStyles.textContainer}>
              <Text style={[choiceDelivaryStyles.optionTitle, {
                fontSize: moderateScale(18), 
                color: "rgba(0,0,0,0.5)"
              }]}>
                Glovo доставка
              </Text>
              <Text style={[choiceDelivaryStyles.optionDescription, {
                fontSize: moderateScale(13), 
                color: theme.colors.textSecondary || theme.colors.textPrimary,
                opacity: 0.6
              }]}>
                Бърза доставка до вратата ви
              </Text>
            </View>
            <View style={choiceDelivaryStyles.arrowContainer}>
              <Text style={[choiceDelivaryStyles.arrow, { color: theme.colors.textPrimary, opacity: 0.3 }]}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[choiceDelivaryStyles.optionContainer, {  
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.textPrimary,
            }]}
            onPress={() => router.navigate('/delivaryAndMap/mapDelivery')}
          >
            <View style={[choiceDelivaryStyles.iconContainer, { backgroundColor: '#d4f4ea',    borderColor:theme.colors.textTertiary, }]}>
              <PersonIcon height={48} width={48} color="#67dabf"/>
            </View>
            <View style={choiceDelivaryStyles.textContainer}>
              <Text style={[choiceDelivaryStyles.optionTitle, {
                fontSize: moderateScale(18), 
                color: theme.colors.textPrimary
              }]}>
                Лично вземане
              </Text>
              <Text style={[choiceDelivaryStyles.optionDescription, {
                fontSize: moderateScale(13), 
                color: theme.colors.textSecondary || theme.colors.textPrimary,
                opacity: 0.6
              }]}>
                Вземете сами от магазина
              </Text>
            </View>
            <View style={choiceDelivaryStyles.arrowContainer}>
              <Text style={[choiceDelivaryStyles.arrow, { color: theme.colors.textPrimary, opacity: 0.3 }]}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default ChoiceDelivery;