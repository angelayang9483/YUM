import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import config from '../config';

const Comment = ({ comment, onLike, liked }) => {
  const [isLiked, setLiked] = useState(liked || false);
  const [likes, setLikes] = useState(comment.likes || 0);
  const [diningHallName, setDiningHallName] = useState("");

  const url = config.BASE_URL;

  useEffect(() => {
    setLiked(liked || false);
  }, [liked]);

  useEffect(() => {
    setLikes(comment.likes || 0);
  }, [comment.likes]);

  useEffect(() => {
    const getDiningHall = async () => {
      try {
        const response = await fetch(`${url}/api/dininghalls/${comment.diningHall}`);
        const data = await response.json();
        setDiningHallName(data.name);
      } catch (error) {
        console.error('Error getting the dining hall:', error);
      }
    };

    getDiningHall();
  }, [comment.diningHall]);

  const handleLikePress = () => {
    if (onLike) onLike(comment._id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {diningHallName}
        </Text>
        <Text style={styles.body} numberOfLines={3} ellipsizeMode="tail">
          {comment.content}
        </Text>
      </View>
      <Pressable onPress={handleLikePress} style={styles.heartContainer}>
        <FontAwesome 
          name={isLiked ? "heart" : "heart-o"} 
          size={20} 
          color="white" 
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