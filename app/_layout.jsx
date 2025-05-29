// import { Stack } from 'expo-router';
// import { AuthProvider } from './context/AuthContext'
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, { useState, useEffect } from "react";
// import { ActivityIndicator } from 'react-native';

// const LOGIN_KEY = "isloggedin";

// export default function Layout() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
  
//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       try {
//         console.log("Checking AsyncStorage for login status...");
//         const loggedIn = await AsyncStorage.getItem(LOGIN_KEY);
//         console.log("AsyncStorage status:", loggedIn);
        
//         if (loggedIn === 'true') {
//           console.log("User is logged in, showing main app");
//           setIsLoggedIn(true);
//         } else {
//           console.log("User is not logged in, showing intro");
//           setIsLoggedIn(false);
//         }
//       } catch (error) {
//         console.log('Error checking login status:', error);
//         setIsLoggedIn(false);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     checkLoginStatus();
//   })

//   if (isLoading) return <ActivityIndicator />;

//   return isLoggedIn? (
//     <AuthProvider>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>
//     </AuthProvider>
//   ) : (
//     <AuthProvider>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>
//     </AuthProvider>
//   );
// }
import { Slot } from 'expo-router';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
