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
        backgroundColor: '#00509d',
        borderTopWidth: 0, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.2, 
        shadowRadius: 3,
      }, 
      tabBarActiveTintColor: '#FFFFFF', 
      tabBarInactiveTintColor: '#CCCCCC'  
      }}>
      <Tabs.Screen
        name="menus"
        options={{
          title: 'Menus',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faUtensils} color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faHeart} color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="popular"
        options={{
          title: 'Popular',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faComment} color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faUser} color={color} />,
        }}
      />
    </Tabs>
  );
}
