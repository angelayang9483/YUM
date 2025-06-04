import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import React, { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import config from '../config';
import { AuthContext } from '../context/AuthContext';

const Meal = (props) => {
    const url = config.BASE_URL;
    const { user } = useContext(AuthContext);
    const [isLiked, setLiked] = useState(props.isLiked);
    const [favoritesCount, setFavoritesCount] = useState(props.favoritesCount);
    const { onLikeChange } = props;

    const handleLike = async () => {  
        try {
            if (isLiked) {
                response = await axios.delete(`${url}/api/users/${user.userId}/favorite-meal`, {
                    data: { mealId: props.id } 
                });
                setFavoritesCount(favoritesCount - 1);
            } else {
                response = await axios.post(`${url}/api/users/${user.userId}/favorite-meal`, 
                    { mealId: props.id }
                );
                setFavoritesCount(favoritesCount + 1);
            }
            setLiked(!isLiked);
            if (response && response.data && response.data.success && response.data.meal) {
                const updatedMeal = response.data.meal;
                if (onLikeChange) {
                    onLikeChange(updatedMeal._id, updatedMeal.favoritesCount);
                }
            } else if (onLikeChange) {
                onLikeChange(); 
            }
        } catch (error) {
            console.error('Error toggling favorite meal:', error);
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
            <Text style={styles.favoritesCount}>{favoritesCount}</Text>
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
    },
    favoritesCount: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    }
});
