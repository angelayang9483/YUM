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

    const isMenu = props.location === "menu";
    const isFavorites = props.location === "favorites";
    const isPopular = props.location === "popular";

    return (
        <View style={isMenu ? styles.menusContainer : styles.favoritesContainer}>
            <View style={styles.textContainer}>
                <Text style={isMenu ? styles.menusItem : styles.favoritesItem}>{props.name}</Text>
                {!isMenu && (
                    <Text style={styles.diningHall}>{props.diningHall}</Text>
                )}
            </View>
            {isPopular && (
                <Text style={styles.favoritesCount}>{props.favoritesCount}</Text>
            )}
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
        marginVertical: 5,
        paddingHorizontal: 20,
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center'
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
        width: '87%',
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
        paddingTop: 2,
        paddingRight: 5
    }
});
