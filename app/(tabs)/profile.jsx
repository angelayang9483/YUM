import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import config from '../config';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Post from '../components/post.jsx';
import Line from '../components/line.jsx';
import { AuthContext } from '../context/AuthContext';

export default function Tab() {

  const url = config.BASE_URL;
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const userId = user.userId;

  const [username, setUsername] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [karma, setKarma] = useState(0);

  const getUser = async () => {
    try {
      const response = await axios.get(`${url}/api/users/${userId}`);
      setUsername(response.data.username);
      setFavorites(response.data.favorites);
      setKarma(response.data.karma);
    } catch (error) {
      console.log("Error getting user", error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("deleting user");
      await SecureStore.deleteItemAsync('user');
      setUser(null);
      router.replace('/signup');
    } catch (error) {
      console.log("Error logging out: ", error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>{username}</Text>
      </View>
      <Line/>
      <View style={styles.section}>
        <Text style={styles.heading}>Karma: {karma}</Text>
        <Text style={styles.content}>You are in the top 0% of users!</Text>
      </View>
      <Line/>
      <View style={styles.section}>
        <Text style={styles.heading}>Activity</Text>
        <Post restaurant="Bruin Plate" review="The chipotle chicken bowl was super good!" />
        <Post restaurant="Bruin Plate" review="The chipotle chicken bowl was super good!" />
      </View>
      <Line/>
      <Pressable onPress={ handleLogout }>
        <Text style={styles.heading}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  section: {
    alignItems: 'center',
  },
  post: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 25,
    color: 'rgba(0, 80, 157, 1)',
  },
  content: {
    fontSize: 17,
    color: 'rgba(0, 80, 157, 1)',
    margin: 5,
  },
});
