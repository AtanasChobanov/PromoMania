import AsyncStorage from '@react-native-async-storage/async-storage';

const generateUserId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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

// 🗑️ NEW FUNCTION
export const deleteUserId = async () => {
  try {
    await AsyncStorage.removeItem('userId');
    console.log('UserId deleted successfully');
  } catch (error) {
    console.error('Error deleting userId:', error);
    throw error;
  }
};
