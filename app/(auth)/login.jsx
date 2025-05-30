import { useRouter } from 'expo-router';
import { useState, useContext } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import config from '../config';

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
        console.log("Login response:", response.data);
        const { userId, token } = response.data;
        await SecureStore.setItemAsync('user', JSON.stringify({ userId, token }));
        setUser({ userId, token });
        router.replace('/menus');
        return true;
      }
      catch (error) {
        console.log("error", error);
        console.log(error.response?.data);
        Alert.alert("Login Error", error.response?.data?.error || "An error occurred while logging in");
        return false;
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>YUM</Text>

      <Text style={styles.boldText}>Welcome Back!</Text>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={(text) => setUsername(text)}
        placeholder="Enter your username"
      />

      <TextInput
        style={styles.input}
        value={password}
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        placeholder="Enter your password"
      />

      <Pressable onPress={async () =>  await handleSubmit()} style={styles.button}>
        <Text style={styles.buttonText}>Log In</Text>
      </Pressable>

      <Text style={styles.text}>Don't have an account yet?</Text>
      <Pressable onPress={() => router.navigate('/signup')}>
        <Text style={styles.signIn}>Create Account</Text>
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
  heading: {
    fontWeight: 'bold',
    fontSize: 40,
    color: 'rgba(0, 80, 157, 1)',
  },
  input: {
    fontSize: 17,
    margin: 5,
    width: '80%',
    height: 40,
    borderRadius: 10,
    borderColor: 'grey',
    borderWidth: .5,
    padding: 5,
  },
  boldText: {
    fontSize: 20,
    margin: 20,
    fontWeight: 'bold',
  },
  button: {
    width: '80%',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 80, 157, 1)',
    height: 40,
    borderRadius: 10,
    margin: 20,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
  },
  text: {
    fontSize: 15,
    paddingTop: 10,
  },
  signIn: {
    color: 'rgba(0, 80, 157, 1)',
  },
});
