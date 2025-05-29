import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUtensils, faHeart, faComment, faUser } from '@fortawesome/free-solid-svg-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
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
      <Tabs.Screen
        name="signup"
        options={{
          title: 'Signup',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faUser} color={color} />,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />
      {/* USE THIS TO HIDE THE SIGNUP TAB */}
      {/* <Tabs.Screen
        name="signup"
        options={{
          href: null,
        }}
      /> */}
    </Tabs>
  );
}
