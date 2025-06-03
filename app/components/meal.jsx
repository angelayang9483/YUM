import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Meal = (props) => {
    const [isLiked, setLiked] = useState(props.isLiked);
    const [likes, setLikes] = useState(props.likes);

    const handleLike = async () => {   
        try {
            // send to database 
            setLiked(!isLiked);
        } catch (error) {
            console.error('Error liking meal:', error);
        }
    };

    const isFavorites = props.location === "favorites";

    return (
        <View style={isFavorites ? styles.favoritesContainer : styles.menusContainer}>
            <View style={styles.textContainer}>
                <Text style={isFavorites ? styles.favoritesItem : styles.menusItem}>{props.name}</Text>
                {isFavorites && (
                    <Text style={styles.diningHall}>{props.diningHall}</Text>
                )}
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
    favoritesContainer: {
        backgroundColor: '#467FB6',
        width: '100%',
        borderRadius: 10,
        marginTop: 10,
        paddingHorizontal: 15,
        height: 75,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menusContainer: {
        backgroundColor: '#467FB6',
        width: '100%',
        borderRadius: 10,
        marginTop: 5,
        paddingHorizontal: 15,
        height: 50, // thinner height
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
    },
    textContainer: {
        flexDirection: 'column',
        width: '80%',
    },
    favoritesItem: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    menusItem: {
        color: 'white',
        fontSize: 15,
        fontWeight: '500'
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
