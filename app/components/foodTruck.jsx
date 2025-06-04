import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import config from '../config';
import { AuthContext } from '../context/AuthContext';


const FoodTruck = ({
  truck,
  isOpen = false,
  closeTime = "N/A",
  nextOpenTime = "Unavailable",
  location,
  isFavorited=false
}) => {

  const url = config.BASE_URL;
  const { user } = useContext(AuthContext);

  const [favorited, setFavorited] = useState( isFavorited );
  const [favoriteCount, setFavoriteCount] = useState(truck.favoriteCount || 0);

  const getFoodTruck = async () => {
    try {
      const response = await axios.get(`${url}/api/foodtrucks/${truck._id}`);
      setFavoriteCount(response.data.favoriteCount);
    } catch (error) {
      console.error("Failed to retrieve food truck info:", error);
    }
  };

  useEffect(() => {
    if (location === 'favorites') {
      setFavorited(true);
    } else if (user && Array.isArray(user.favoriteFoodTrucks)) {
      setFavorited(user.favoriteFoodTrucks.includes(truck._id));
    }
    getFoodTruck();
  }, [user?.favoriteFoodTrucks, truck._id, location]);


const handleFav = async () => {
  if (!user) return;

  const wasFavorited = favorited;
  const updatedCount = wasFavorited ? favoriteCount - 1 : favoriteCount + 1;

  try {
    await axios.post(`${url}/api/foodtrucks/${truck._id}/favorite`, {
      userId: user.userId
    });

    setFavorited(!wasFavorited);
    setFavoriteCount(updatedCount);
  } catch (error) {
    console.error("Failed to update favorite on server:", error);
  }
};

  return (
    <View style={location === 'menus' ? styles.menusContainer : styles.otherContainer}>
      <View style={styles.nameTimeContainer}>
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
          {truck.name}
        </Text>
        { location === 'menus'? 
          <Text style={styles.time}>{isOpen ? 'Closes' : 'Opens'} at {isOpen ? closeTime : nextOpenTime}</Text>:
          <View/>
        }
      </View>
      <Pressable onPress={handleFav} style={styles.heartContainer}>
        {location != 'menus' && (
            <Text style={styles.likeCount}>{favoriteCount}</Text>
        )}
        <FontAwesome 
          name={favorited ? "heart" : "heart-o"}
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
    width: '90%'
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
    justifyContent: 'flex-end',
    flexShrink: 0,
  }
});