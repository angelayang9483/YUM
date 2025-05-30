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
      const user = {
        username: username,
        password: password,
      };
      try {
        console.log("Sending user to backend:", user);
        const response = await axios.post(`${url}/api/users/`, user);
        console.log(response.data);
        const { _id: userId, token } = response.data;

        await SecureStore.setItemAsync('user', JSON.stringify({ userId, token }));
        setUser({ userId, token });
        Alert.alert("Success", "Form submitted successfully!");
        return true;
      } catch (error) {
        console.log("Error:", error);
        console.log("Error response:", error.response);
        console.log("Error response data:", error.response?.data);

        let errorMessage = "An error occurred while submitting the form.";

        if (error.response && error.response.data) {
          if (error.response.data.errors) {
            const fieldErrors = error.response.data.errors;
            if (fieldErrors.email) {
              errorMessage = fieldErrors.email;
            } else if (fieldErrors.username) {
              errorMessage = fieldErrors.username;
            } else {
              const firstErrorField = Object.keys(fieldErrors)[0];
              if (firstErrorField) {
                errorMessage = fieldErrors[firstErrorField];
              }
            }
          }
          else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
        Alert.alert("Registration Error", errorMessage);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>YUM</Text>

      <Text style={styles.boldText}>Create an account</Text>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={(text) => setUsername(text)}
        placeholder="Create a username"
      />

      <TextInput
        style={styles.input}
        value={password}
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        placeholder="Create a password"
      />

      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>

      <Text style={styles.text}>Have an account?</Text>
      <Pressable onPress={() => router.navigate('/login')}>
        <Text style={styles.signIn}>Sign In</Text>
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
