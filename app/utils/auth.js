import * as SecureStore from 'expo-secure-store';

export const handleLogout = async (setUser, router) => {
  try {
    console.log("deleting user");
    await SecureStore.deleteItemAsync('user');
    setUser(null);
    router.replace('/signup');
  } catch (error) {
    console.log("Error logging out: ", error);
  }
}; 