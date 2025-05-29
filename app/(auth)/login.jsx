import { useRouter } from 'expo-router';
import { useState, useContext } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import config from '../config';
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const LOGIN_KEY = 'isloggedin';

export default function Tab() {
  const url = config.BASE_URL;
  const router = useRouter();
  const { setUser } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if ( !username || !password ) {
      Alert.alert("Error", "Please fill out all the fields.");
      return false;
    } else {
      try {
        const response = await axios.post(`${url}/api/users/login`, { username: username, password: password });
        console.log("Login successful");
        console.log(response.data);
        const { _id: userId, token } = response.data;
        await SecureStore.setItemAsync('user', JSON.stringify({ userId, token }));
        setUser({ userId, token });
        router.replace('/menus');
        return true;
      }
      catch (error) {
        console.log("error", error);
        console.log(error.response.data);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text>Login Page</Text>

      <Text>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={(text) => setUsername(text)}
        placeholder="Enter your username"
      />

      <Text>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        placeholder="Enter your password"
      />

      <Pressable onPress={async () =>  await handleSubmit()}>
        <Text>Log In</Text>
      </Pressable>
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
