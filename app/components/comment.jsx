import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import config from '../config';
import { useFonts } from 'expo-font';

const Comment = ({ comment, onLike, liked }) => {
  const [isLiked, setLiked] = useState(liked || false);
  const [likes, setLikes] = useState(comment.likes || 0);
  const [diningHallName, setDiningHallName] = useState("");
  const [fontsLoaded] = useFonts({
    'perpetua-bold-italic': require('../../assets/Perpetua-Font-Family/perpetua-bold-italic.ttf'),
    'perpetua-bold': require('../../assets/Perpetua-Font-Family/perpetua-bold.ttf'),
    'Perpetua-MT-Regular': require('../../assets/Perpetua-Font-Family/Perpetua-MT-Regular.ttf'),
    'Gil-Sans': require('../../assets/gill-sans-2/Gill-Sans.otf'),
    'Gil-Sans-Light': require('../../assets/gill-sans-2/Gill-Sans-Light.otf'),
    'Gil-Sans-Bold': require('../../assets/gill-sans-2/Gill-Sans-Bold.otf')
  });

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
    backgroundColor: 'rgba(119, 140, 159, 1)',
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  title: {
    color: 'rgba(30, 55, 101, 1)',
    fontSize: 20,
    fontFamily: 'perpetua-bold'
  },
  body: {
      color: 'rgba(248, 249, 252, 1)',
    paddingTop: 2,
    fontSize: 15,
    fontFamily: 'Gill-Sans'
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 50,
  },
  likeCount: {
      color: 'rgba(248, 249, 252, 1)',
    marginLeft: 5,
    fontSize: 14,
  }
})