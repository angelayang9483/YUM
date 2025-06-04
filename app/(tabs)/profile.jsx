import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Comment from '../components/comment.jsx';
import Line from '../components/line.jsx';
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
  const [comments, setComments] = useState([]);
  const [likedComments, setLikedComments] = useState([]);

  const getUser = async () => {
    try {
      if (!user || !user.userId) throw new Error('User not properly authenticated');

      const response = await axios.get(`${url}/api/users/${user.userId}`);
      const userKarma = response.data.karma;
      setUsername(response.data.username);
      setFavorites(response.data.favorites);
      setKarma(userKarma);

      const allusers = await axios.get(`${url}/api/users/`);
      const karmaArray = allusers.data.map(user => user.karma);
      const usersHigherThan = karmaArray.filter(k => k > userKarma).length;
      const userPercentile = (usersHigherThan / karmaArray.length) * 100;
      setKarmaPercentile(Math.round(userPercentile));

      const commentsResponse = await axios.get(`${url}/api/users/${user.userId}/comments`);
      setComments(commentsResponse.data.comments || []);

      const likedCommentsResponse = await axios.get(`${url}/api/users/${user.userId}/liked-comments`);
      setLikedComments(likedCommentsResponse.data.likedComments || []);

    } catch (error) {
      console.error("Error getting user:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      setError(error.message);
      if (!user || !user.userId) router.replace('/signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      setUser(null);
      router.replace('/signup');
    } catch (error) {
      console.log("Error logging out: ", error);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) return;

    // Optimistic update
    setComments(prev =>
      prev.map(comment =>
        comment._id === commentId
          ? {
              ...comment,
              likes: likedComments.find(c => c._id === commentId) ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );

    // Update likedComments list
    setLikedComments(prev => {
      const alreadyLiked = prev.find(c => c._id === commentId);
      if (alreadyLiked) {
        return prev.filter(c => c._id !== commentId);
      } else {
        const comment = comments.find(c => c._id === commentId);
        return comment ? [...prev, comment] : prev;
      }
    });

    // Backend sync
    try {
      await axios.post(`${url}/api/comments/${commentId}/like`, {
        userId: user.userId
      });

      // Optional: re-fetch user data for full consistency
      getUser();
    } catch (error) {
      console.error("Failed to update like on server:", error);
    }
  };

  useEffect(() => {
    if (user && user.userId) getUser();
  }, [user]);

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
        <View style={styles.padding}></View>
        <Text style={styles.title}>{username}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Karma: {karma}</Text>
        <Text style={styles.content}>You are in the top {karmaPercentile}% of users!</Text>
      </View>
      <Line />
      <View style={styles.section}>
        <Text style={styles.heading}>Your Comments</Text>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Comment 
                key={comment._id} 
                comment={comment} 
                onLike={handleLike}
                liked={likedComments.some(c => c._id === comment._id)}
              />
            ))
          ) : (
            <Text style={styles.noCommentsText}>No comments yet!</Text>
          )}
        </ScrollView>
      </View>
      <Line />
      <View style={styles.section}>
        <Text style={styles.heading}>Your Liked Comments</Text>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {likedComments.length > 0 ? (
            likedComments.map((comment) => (
              <Comment 
                key={comment._id} 
                comment={comment} 
                onLike={handleLike}
                liked={true}
              />
            ))
          ) : (
            <Text style={styles.noCommentsText}>No comments yet!</Text>
          )}
        </ScrollView>
      </View>
      <Line />
      <Pressable onPress={handleLogout}>
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
    backgroundColor: 'white'
  },
  centered: {
    justifyContent: 'center',
  },
  section: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    fontSize: 30,
    color: 'rgba(0, 80, 157, 1)',
    paddingHorizontal: 15,
  },
  post: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 20,
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
  },
  noCommentsText: {
    color: 'rgba(0, 80, 157, 1)',
    fontSize: 16,
    margin: 20,
  }, 
  padding: {
    paddingTop: 60
  }
});
