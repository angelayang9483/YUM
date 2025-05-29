import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

import Post from '../components/post.jsx';
import Line from '../components/line.jsx';

export default function Tab() {
  // use this temp id for now to connect to backend
  const userId = "6837782a2ed6406524a865e5";
  const url = config.BASE_URL;

  const [username, setUsername] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [karma, setKarma] = useState(0);

  const getUser = async () => {
    try {
      const response = await axios.get(`${url}/api/users/${userId}`);
      setUsername(response.data.username);
      setFavorites(response.data.favorites);
      setKarma(response.data.karma)
      // console.log(response);
    } catch (error) {
      console.log("Error getting user", error);
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
      <Text style={styles.heading}>Log Out</Text>
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
