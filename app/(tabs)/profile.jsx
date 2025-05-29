import axios from 'axios';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Line from '../components/line.jsx';
import Post from '../components/post.jsx';
import config from '../config';

export default function Tab() {
  // use this temp id for now to connect to backend
  const userId = "6837782a2ed6406524a865e5";
  const url = config.BASE_URL;

  const [username, setUsername] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [karma, setKarma] = useState(0);
  const [karmaPercentile, setKarmaPercentile] = useState(0);

  const getUser = async () => {
    try {
      console.log('Attempting to fetch user data from:', `${url}/api/users/${userId}`);
      const response = await axios.get(`${url}/api/users/${userId}`);
      console.log('User data response:', response.data);
      const userKarma = response.data.karma;
      setUsername(response.data.username);
      setFavorites(response.data.favorites);
      setKarma(userKarma);

      console.log('Fetching all users for karma calculation');
      const allusers = await axios.get(`${url}/api/users/`);
      console.log('All users response:', allusers.data);
      const users = allusers.data;
      const karmaArray = users.map(user => user.karma);
      const usersHigherThan = karmaArray.filter(k => k > userKarma).length;
      const userPercentile = (usersHigherThan / karmaArray.length) * 100;
      setKarmaPercentile(Math.round(userPercentile));

      // console.log(response);
    } catch (error) {
      console.error("Error getting user:", error.message);
      console.error("Full error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
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
        <Text style={styles.content}>You are in the top {karmaPercentile}% of users!</Text>
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
