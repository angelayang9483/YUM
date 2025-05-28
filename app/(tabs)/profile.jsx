import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Tab() {
  // use this temp id for now to connect to backend
  const userId = "6837782a2ed6406524a865e5";

  const [username, setUsername] = useState("");
  const [favorites, setFavorites] = useState([]);

  const getUser = async () => {
    try {
      const response = await axios.get(`https://localhost:4000/api/users/${userId}`);
      setUsername(response.data.username);
      setFavorites(response.data.favorites);
      console.log(response);
    } catch (error) {
      console.log("Error getting user", error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Profile Page</Text>
      <Text>User: {username}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
