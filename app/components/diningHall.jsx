import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import Menu from './menu.jsx';
import { FontAwesome } from '@expo/vector-icons';

const DiningHall = (props) => {
    const [isLiked, setLiked] = useState(props.isLiked);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedDiningHall, setSelectedDiningHall] = useState('');

    const handleLike = async () => {
        // if (!user || !comment) return;
        
        try {
        // send to database 

        setLiked(!isLiked);

        } catch (error) {
          console.error('Error liking dining hall:', error);
        }
    };

    const handleDiningHallPress = (name) => {
        setSelectedDiningHall(name);
        setMenuVisible(true);
    };

    return (
        <View style={styles.cardContainer}>
            <Pressable 
            style={styles.cardContent} 
            onPress={() => {
                console.log('Navigate to detail page');
                handleDiningHallPress('Bruin Plate');
            }}
            >
            <View style={styles.nameTimeContainer}>
                <Text style={styles.name}>Bruin Plate</Text>
                <Text style={styles.time}>Closes at 3:00pm</Text>
            </View>
            </Pressable>

            <Pressable 
            onPress={() => {
                console.log('Toggle favorite');
                handleLike();
            }}
            hitSlop={10}   // optional: makes it easier to tap
            >
                <FontAwesome 
                    name={isLiked ? "heart" : "heart-o"} 
                    size={20} 
                    color={isLiked ? "white" : "white"} 
                />
            </Pressable>

            {menuVisible && (
            <Menu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                content={`Menu for ${selectedDiningHall}`}
            />
            )}
        </View>
    );
};

export default DiningHall;

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
    nameTimeContainer: {
      flexDirection: 'column',
    },
    name: {
      color: 'white',
      fontSize: 20,
      fontWeight: '700',
    },
    time: {
      color: 'white',
      paddingTop: 2,
    },
    heart: {
      color: 'white',
    }
  });



