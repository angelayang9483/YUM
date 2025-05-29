import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUtensils, faHeart, faComment, faUser } from '@fortawesome/free-solid-svg-icons';
import { useRouter, Tabs } from 'expo-router';
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
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="menus"
        options={{
          title: 'Menus',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faUtensils} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faHeart} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trending"
        options={{
          title: 'Trending',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faComment} color={color} />,
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
