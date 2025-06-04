import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import { emit } from '../utils/emitter.js';


const FoodTruck = ({
  truck,
  isOpen = false,
  closeTime = "N/A",
  nextOpenTime = "Unavailable",
  location,
  isFavorited = false
}) => {

  const url = config.BASE_URL;
  const { user } = useContext(AuthContext);

  const handleFavorite = async () => {  
    try {
        if (isFavorited) {
            console.log("Unfavoriting truck", truck._id)
            response = await axios.delete(`${url}/api/users/${user.userId}/favorite-truck`, {
                data: { truckId: truck._id } 
            });
            if (response && response.data && response.data.success && response.data.truck) {
                emit('unfavorited-truck', response.data.truck);
                console.log("Emitted unfavorited truck:", response.data.truck)
            }
        } else {
            console.log("Favoriting truck", truck._id)
            response = await axios.post(`${url}/api/users/${user.userId}/favorite-truck`, 
                { truckId: truck._id }
            );
            if (response && response.data && response.data.success && response.data.truck) {
                emit('favorite-truck', response.data.truck);
                console.log("Emitted favorite truck:", response.data.truck)
            }
        }
    } catch (error) {
        console.error('Error toggling favorite truck:', error);
    }
};

  return (
    <View style={location === 'menus' ? styles.menusContainer : styles.otherContainer}>
      <View style={styles.nameTimeContainer}>
        <Text style={styles.name}>{truck.name}</Text>
        {truck.hereToday && (
          <Text style={styles.time}>{isOpen ? 'Closes' : 'Opens'} at {isOpen ? closeTime : nextOpenTime}</Text>
        )}
      </View>
      <Pressable onPress={handleFavorite} style={styles.heartContainer}>
        {location == 'popular' && (
            <Text style={styles.likeCount}>{truck.favoritesCount}</Text>
        )}
        <FontAwesome 
          name={isFavorited ? "heart" : "heart-o"}
          size={20} 
          color="white" 
        />
      </Pressable>
    </View>
  );
};

export default FoodTruck;

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
  menusContainer: {
    backgroundColor: '#467FB6',
    width: '90%',
    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 20,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center'
  },
  otherContainer: {
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
  cardContent: {
    flex: 1,   // take up all available space except the heart
    height: '100%',
    justifyContent: 'center',
  },
  nameTimeContainer: {
    flexDirection: 'column',
    width: '85%'
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
  likeCount: {
    color: 'white',
    paddingTop: 2,
    paddingRight: 5
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 30,
    flexShrink: 0,
  }
});