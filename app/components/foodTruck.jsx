import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import { useFonts } from 'expo-font';

const FoodTruck = ({
  truck,
  isOpen = false,
  closeTime = "N/A",
  nextOpenTime = "Unavailable",
  location,
  isFavorited=false
}) => {
  const [fontsLoaded] = useFonts({
    'perpetua-bold-italic': require('../../assets/Perpetua-Font-Family/perpetua-bold-italic.ttf'),
    'perpetua-bold': require('../../assets/Perpetua-Font-Family/perpetua-bold.ttf'),
    'Perpetua-MT-Regular': require('../../assets/Perpetua-Font-Family/Perpetua-MT-Regular.ttf'),
    'Gil-Sans': require('../../assets/gill-sans-2/Gill-Sans.otf'),
    'Gil-Sans-Light': require('../../assets/gill-sans-2/Gill-Sans-Light.otf'),
    'Gil-Sans-Bold': require('../../assets/gill-sans-2/Gill-Sans-Bold.otf')
  });


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
        {location == 'popular' && (
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
    backgroundColor: 'rgba(119, 140, 159, 1)',
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
    backgroundColor: 'rgba(119, 140, 159, 1)',
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
    color: 'rgba(30, 55, 101, 1)',
    fontSize: 18,
    fontFamily: 'Gill-Sans-Bold'
  },
  time: {
      color: 'rgba(248, 249, 252, 1)',
    paddingTop: 2,
    fontSize: 17,
    fontFamily: 'perpetua-bold-italic'
  },
  likeCount: {
      color: 'rgba(248, 249, 252, 1)',
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