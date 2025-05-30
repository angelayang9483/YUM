import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Line from '../components/line.jsx';
import Comment from '../components/comment.jsx';
import config from '../config';
import { AuthContext } from '../context/AuthContext';

export default function Tab() {
  const url = config.BASE_URL;
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [username, setUsername] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [karma, setKarma] = useState(0);
  const [karmaPercentile, setKarmaPercentile] = useState(0);
  const [likedComments, setLikedComments] = useState([]);

  const getUser = async () => {
    try {
      console.log('Current user object:', user);
      if (!user || !user.userId) {
        throw new Error('User not properly authenticated');
      }

      console.log('Attempting to fetch user data from:', `${url}/api/users/${user.userId}`);
      const response = await axios.get(`${url}/api/users/${user.userId}`);
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

      // Fetch liked comments
      console.log('Fetching liked comments');
      const likedCommentsResponse = await axios.get(`${url}/api/users/${user.userId}/liked-comments`);
      console.log('Liked comments response:', likedCommentsResponse.data);
      setLikedComments(likedCommentsResponse.data.likedComments || []);
    } catch (error) {
      console.error("Error getting user:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      setError(error.message);
      // If there's an authentication error, redirect to signup
      if (!user || !user.userId) {
        router.replace('/signup');
      }
    } finally {
      setIsLoading(false);
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

  const handleLikeUpdate = (commentId, isLiked, newLikeCount) => {
    // Update the local liked comments when a comment is liked/unliked
    setLikedComments(prevComments => 
      prevComments.map(comment => 
        comment._id === commentId 
          ? { ...comment, likes: newLikeCount }
          : comment
      )
    );

    // If comment was unliked, remove it from the list
    if (!isLiked) {
      setLikedComments(prevComments => 
        prevComments.filter(comment => comment._id !== commentId)
      );
    }
  };

  useEffect(() => {
    getUser();
  }, [user]); // Add user as a dependency to re-fetch when user changes

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="rgba(0, 80, 157, 1)" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Pressable onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Return to Login</Text>
        </Pressable>
      </View>
    );
  }

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
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          bounces={true}
          alwaysBounceVertical={true}
        >
          {likedComments.length > 0 ? (
            likedComments.map((comment) => (
              <Comment 
                key={comment._id} 
                comment={comment} 
                onLikeUpdate={handleLikeUpdate}
              />
            ))
          ) : (
            <Text style={styles.noCommentsText}>No comments yet!</Text>
          )}
        </ScrollView>
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
  centered: {
    justifyContent: 'center',
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
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'rgba(0, 80, 157, 1)',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  scrollView: {
    width: '100%',
    maxHeight: 200,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  noCommentsText: {
    color: 'rgba(0, 80, 157, 1)',
    fontSize: 16,
    margin: 20,
  }
});
