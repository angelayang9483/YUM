import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Meal = (props) => {
    const [isLiked, setLiked] = useState(props.isLiked);
    const [likes, setLikes] = useState(props.likes);
    const [favorites, setFavorites] = useState([]);
    const [favoriteFoodTrucks, setFavoriteFoodTrucks] = useState([]);

    const handleLike = async () => {   
        try {
        // send to database 

        setLiked(!isLiked);

        } catch (error) {
          console.error('Error liking meal:', error);
        }
    };

    return (
        <View style={styles.cardContainer}>
            <View style={styles.textContainer}>
                <Text style={styles.item}>{props.name}</Text>
                <Text style={styles.diningHall}>{props.diningHall}</Text>
            </View>
            <Pressable onPress={handleLike} style={styles.heartContainer}>
                <FontAwesome 
                name={isLiked ? "heart" : "heart-o"} 
                size={20} 
                color="white" 
                />
            </Pressable>
        </View>
    );
};

export default Meal;

const styles = StyleSheet.create({
    cardContainer: {
      backgroundColor: '#467FB6',
      width: '100%',
      borderRadius: 10,
      marginTop: 10,
      paddingHorizontal: 15,
      height: 75,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    cardContent: {
      flex: 1,   // take up all available space except the heart
      height: '100%',
      justifyContent: 'center',
    },
    textContainer: {
      flexDirection: 'column',
      width: '80%'
    },
    item: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
    },
    diningHall: {
      color: 'white',
      paddingTop: 2,
    },
    heartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        minWidth: 30,
    }
  });