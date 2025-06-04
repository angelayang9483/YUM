import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useFonts } from 'expo-font';
import React, { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import { emit } from '../utils/emitter';

const Meal = (props) => {
    const url = config.BASE_URL;
    const { user } = useContext(AuthContext);
  const [fontsLoaded] = useFonts({
    'perpetua-bold-italic': require('../../assets/Perpetua-Font-Family/perpetua-bold-italic.ttf'),
    'perpetua-bold': require('../../assets/Perpetua-Font-Family/perpetua-bold.ttf'),
    'Perpetua-MT-Regular': require('../../assets/Perpetua-Font-Family/Perpetua-MT-Regular.ttf'),
    'Gil-Sans': require('../../assets/gill-sans-2/Gill-Sans.otf'),
    'Gil-Sans-Light': require('../../assets/gill-sans-2/Gill-Sans-Light.otf'),
    'Gil-Sans-Bold': require('../../assets/gill-sans-2/Gill-Sans-Bold.otf')
  });

    const handleFavorite = async () => {  
        try {
            if (props.isFavorited) {
                console.log("Unfavoriting meal", props.id)
                response = await axios.delete(`${url}/api/users/${user.userId}/favorite-meal`, {
                    data: { mealId: props.id } 
                });
                if (response && response.data && response.data.success && response.data.meal) {
                    emit('unfavorited-meal', response.data.meal);
                    console.log("Emitted unfavorited meal:", response.data.meal)
                }
            } else {
                console.log("Favoriting meal", props.id)
                response = await axios.post(`${url}/api/users/${user.userId}/favorite-meal`, 
                    { mealId: props.id }
                );
                if (response && response.data && response.data.success && response.data.meal) {
                    emit('favorite-meal', response.data.meal);
                    console.log("Emitted favorite meal:", response.data.meal)
                }
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
            <Pressable onPress={handleFavorite} style={styles.heartContainer}>
                <FontAwesome
                    name={props.isFavorited ? "heart" : "heart-o"} 
                    size={20} 
                    color={'rgba(60, 60, 60, 1)'} 
                />
            </Pressable>
        </View>
    );
};

export default Meal;

const styles = StyleSheet.create({
    favoritesContainer: {
        backgroundColor: 'rgba(169, 190, 209, 1)',
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
        backgroundColor: 'rgba(169, 190, 209, 1)',
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
        color: 'rgba(30, 55, 101, 1)',
        fontSize: 17,
        fontFamily: 'Gill-Sans-Bold',
        fontWeight: 500
    },
    menusItem: {
        color: 'rgba(30, 55, 101, 1)',
        fontSize: 15,
        fontWeight: '500',
        fontFamily: 'Gill-Sans'
    },
    diningHall: {
        color: 'rgba(60, 60, 60, 1)',
        paddingTop: 2,
        fontSize: 17,
        fontFamily: 'perpetua-bold-italic'
    },
    heartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        minWidth: 30,
    },
    favoritesCount: {
        color: 'rgba(60, 60, 60, 1)',
        paddingTop: 2,
        paddingRight: 5
    }
});