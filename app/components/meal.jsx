import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Meal = (props) => {
    const [isLiked, setLiked] = useState(props.isLiked);
    const [likes, setLikes] = useState(props.likes);

    const handleLike = async () => {
        // if (!user || !comment) return;
        
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
                <Text style={styles.item}>Chipotle Chicken Bowl</Text>
                <Text style={styles.diningHall}>Bruin Plate</Text>
            </View>
            {/* <Pressable onPress={handleLikePress} style={styles.heartContainer}>
                <FontAwesome 
                name={isLiked ? "heart" : "heart-o"} 
                size={20} 
                color="white" 
                />
            </Pressable> */}
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
      height: 70,
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
    },
    item: {
      color: 'white',
      fontSize: 20,
      fontWeight: '700',
    },
    diningHall: {
      color: 'white',
      paddingTop: 2,
    }
  });