import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Menu from './menu.jsx';
import { useFonts } from 'expo-font';

const DiningHall = (props) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedDiningHall, setSelectedDiningHall] = useState('');
    const [fontsLoaded] = useFonts({
      'perpetua-bold-italic': require('../../assets/Perpetua-Font-Family/perpetua-bold-italic.ttf'),
      'perpetua-bold': require('../../assets/Perpetua-Font-Family/perpetua-bold.ttf'),
      'Perpetua-MT-Regular': require('../../assets/Perpetua-Font-Family/Perpetua-MT-Regular.ttf'),
      'Gil-Sans': require('../../assets/gill-sans-2/Gill-Sans.otf'),
      'Gil-Sans-Light': require('../../assets/gill-sans-2/Gill-Sans-Light.otf'),
      'Gil-Sans-Bold': require('../../assets/gill-sans-2/Gill-Sans-Bold.otf')
    });

    const handleDiningHallPress = () => {
        setMenuVisible(true);
    };

    return (
        <View style={styles.cardContainer}>
            <Pressable 
            style={styles.cardContent} 
            onPress={() => {
                console.log('Navigate to detail page');
                console.log(props.id);
                handleDiningHallPress(props.id);
            }}
            >
            <View style={styles.nameTimeContainer}>
                <Text style={styles.name}>{props.name}</Text>
                <Text style={styles.time}>{props.isOpen ? 'Closes' : 'Opens'} at {props.isOpen ? props.closeTime : props.nextOpenTime}</Text>
            </View>
            </Pressable>

            {menuVisible && (
            <Menu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                diningHallId={props.id}
            />
            )}
        </View>
    );
};

export default DiningHall;

const styles = StyleSheet.create({
    cardContainer: {
      backgroundColor: 'rgba(119, 140, 159, 1)',
      width: '90%',
      borderRadius: 10,
      marginVertical: 5,
      paddingHorizontal: 20,
      height: 70,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      alignSelf: 'center',
    },
    cardContent: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
    },
    nameTimeContainer: {
      flexDirection: 'column',
    },
    name: {
      color: 'rgba(30, 55, 101, 1)',
      fontSize: 18,
      fontFamily: 'Gill-Sans-Bold'
    },
    time: {
      color: 'rgba(248, 249, 252, 1)',
      paddingTop: 2,
      fontSize: 17,
      fontFamily: 'perpetua-bold-italic'
    }
  });



