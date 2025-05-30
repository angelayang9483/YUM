import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import config from '../config';
import { AuthContext } from '../context/AuthContext';

const Comment = ({ comment, onLikeUpdate }) => {
  const [isLiked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const {user} = useContext(AuthContext);
  const url = config.BASE_URL;

  useEffect(() => {
    if (comment?.likes) {
      setLikes(comment.likes);
    }
  }, [comment?.likes]);

  // Check if user has liked this comment
  useEffect(() => {
    const checkIfCommentIsLiked = async () => {
      if (!user || !comment) return;

      try {
        const response = await axios.get(`${url}/api/users/${user.userId}`);
        const userData = response.data;
        
        // Check if this comment's ID is in the user's likedComments array
        const isCommentLiked = userData.likedComments.includes(comment._id);
        setLiked(isCommentLiked);
        
      } catch (error) {
        console.error('Error checking if comment is liked:', error);
        // If error, assume not liked (safe fallback)
        setLiked(false);
      }
    };

    checkIfCommentIsLiked();
  }, [user, comment._id, url]); // Re-run when user, comment, or url changes

  const handleLike = async () => {
    if (!user || !comment) return;
    
    try {
      const response = await axios.post(`${url}/api/users/${user.userId}/like-comment`, {
        commentId: comment._id
      });

      if (response.data.success) {
        setLiked(response.data.isLiked);
        setLikes(response.data.likeCount);
        
        // Notify parent component if callback provided
        if (onLikeUpdate) {
          onLikeUpdate(comment._id, response.data.isLiked, response.data.likeCount);
        }
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {comment.diningHall}
        </Text>
        <Text style={styles.body} numberOfLines={3} ellipsizeMode="tail">
          {comment.content}
        </Text>
      </View>
      
      <Pressable onPress={handleLike} style={styles.heartContainer}>
        <FontAwesome 
          name={isLiked ? "heart" : "heart-o"} 
          size={20} 
          color={isLiked ? "white" : "white"} 
        />
        <Text style={styles.likeCount}>{likes}</Text>
      </Pressable>
    </View>
  );
};

export default Comment;

const styles = StyleSheet.create ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '90%',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(70, 127, 182, 1)',
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  body: {
    fontSize: 14,
    color: 'white',
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 50,
  },
  likeCount: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  }
})