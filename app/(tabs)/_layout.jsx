import { faComment, faHeart, faUser, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Tabs, useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function TabLayout() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/signup');
    }
  }, [user]);

  if (!user) return null;

  return (
    <Tabs screenOptions={{ 
      tabBarStyle: {
        backgroundColor: 'rgba(30, 55, 101, 1)',
        borderTopWidth: 10, 
        borderColor: 'rgba(30, 55, 101, 1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.2, 
        shadowRadius: 3,
      }, 
      tabBarActiveTintColor: 'rgba(208, 195, 171, 1)', 
      tabBarInactiveTintColor: 'rgba(207, 207, 208, 1)'  
      }}>
      <Tabs.Screen
        name="menus"
        options={{
          title: 'menus',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faUtensils} color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'favorites',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faHeart} color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="popular"
        options={{
          title: 'popular',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faComment} color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'profile',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faUser} color={color} />,
          headerShown: false
        }}
      />
    </Tabs>
  );
}
