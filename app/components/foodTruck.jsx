import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import config from '../config';
import { AuthContext } from '../context/AuthContext';


const FoodTruck = ({
  truck,
  onMenu,
  isOpen = false,
  closeTime = "N/A",
  nextOpenTime = "Unavailable",
  isLiked = false,
}) => {
  const [isFavorited, setFavorited] = useState(isLiked);
  const [favoriteCount, setFavoriteCount] = useState(truck.favoriteCount || 0);

  const url = config.BASE_URL;
  const { user } = useContext(AuthContext);

  const getFoodTruck = async () => {
    try {
      const response = await axios.get(`${url}/api/foodtrucks/${truck._id}`);
      setFavoriteCount(response.data.favoriteCount);
    } catch (error) {
      console.error("Failed to retrieve food truck info:", error);
    }
  };

  useEffect(() => {
    if (user && Array.isArray(user.favoriteFoodTrucks)) {
      setFavorited(user.favoriteFoodTrucks.includes(truck._id));
    }
    getFoodTruck();
  }, [user, truck._id]);


const handleFav = async () => {
  if (!user) return;

  const wasFavorited = isFavorited;
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
    <View style={styles.cardContainer}>
      <View style={styles.nameTimeContainer}>
        <Text style={styles.name}>{truck.name}</Text>
        {onMenu && <Text style={styles.time}>{isOpen ? 'Closes' : 'Opens'} at {isOpen ? closeTime : nextOpenTime}</Text>}
      </View>
      <Pressable onPress={handleFav} style={styles.heartContainer}>
        <FontAwesome 
          name={isFavorited ? "heart" : "heart-o"} 
          size={20} 
          color="white" 
        />
        <Text style={styles.time}>{favoriteCount}</Text>
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
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 50,
  }
});
