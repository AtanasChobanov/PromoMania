import AsyncStorage from '@react-native-async-storage/async-storage';

const generateUserId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  const randomStr2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}-${randomStr2}`;
};

export const getUserId = async () => {
  try {
    let userId = await AsyncStorage.getItem('userId');
    console.log('Retrieved userId from storage:', userId);
    
    if (!userId) {
      userId = generateUserId();
      await AsyncStorage.setItem('userId', userId);
      console.log('Generated new userId:', userId);
    }
    
    return userId;
  } catch (error) {
    console.error('Error getting userId:', error);
    throw error;
  }
};