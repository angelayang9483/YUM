import axios from 'axios';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import FoodTruck from '../components/foodTruck.jsx';
import Line from '../components/line.jsx';
import Meal from '../components/meal.jsx';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import { useFonts } from 'expo-font';


export default function Tab() {
  const url = config.BASE_URL;
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [favoriteFoodTrucks, setFavoriteFoodTrucks] = useState([]);
  const [fontsLoaded] = useFonts({
    'perpetua-bold-italic': require('../../assets/Perpetua-Font-Family/perpetua-bold-italic.ttf'),
    'perpetua-bold': require('../../assets/Perpetua-Font-Family/perpetua-bold.ttf'),
    'Perpetua-MT-Regular': require('../../assets/Perpetua-Font-Family/Perpetua-MT-Regular.ttf'),
    'Gil-Sans': require('../../assets/gill-sans-2/Gill-Sans.otf'),
    'Gil-Sans-Light': require('../../assets/gill-sans-2/Gill-Sans-Light.otf'),
    'Gil-Sans-Bold': require('../../assets/gill-sans-2/Gill-Sans-Bold.otf')
  });

  const getFavorites = async () => {
    try {
      if (!user || !user.userId) throw new Error('User not properly authenticated');

      const meals = await axios.get(`${url}/api/users/${user.userId}/favorite-meals`);
      setFavoriteMeals(meals.data.favoriteMeals || []);

      const trucks = await axios.get(`${url}/api/users/${user.userId}/favorite-trucks`);
      setFavoriteFoodTrucks(trucks.data.favoriteFoodTrucks || []);
    } catch (error) {
      console.error(error);
      setError(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getFavorites();
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // useEffect(() => {
  //   if (favoriteMealIds.length > 0) {
  //     fetchFavoriteMeals();
  //   }
  //   if (favoriteFoodTruckIds.length > 0) {
  //     fetchFavoriteFoodTrucks();
  //   }
  // }, [favoriteMealIds, favoriteFoodTruckIds]);

  const hereTodayMeals = favoriteMeals.filter(meal => meal.hereToday);
  // console.log(hereTodayMeals);
  const notHereTodayMeals = favoriteMeals.filter(meal => !meal.hereToday);
  // console.log(notHereTodayMeals);

  const hereTodayFoodTrucks = favoriteFoodTrucks.filter(truck => truck.hereToday);
  const notHereTodayFoodTrucks = favoriteFoodTrucks.filter(truck => !truck.hereToday);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.padding}></Text>
        <Text style={styles.title}>favorites</Text>
      </View>

      {/* <Line/> */}

      <View style={styles.section}>
        <Text style={styles.heading}>here today</Text>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>MEALS</Text>
          {
            hereTodayMeals.map(meal => (
              <Meal
                key={meal._id}
                name={meal.name}
                diningHall={meal.diningHall}
                isLiked={true}
                location={'favorites'}
              />
            ))
          }
        </View>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>FOOD TRUCKS</Text>
          {
            hereTodayFoodTrucks.map(truck => (
              <FoodTruck
                key={truck._id}
                truck={truck}
                location={'favorites'}
                isFavorited={true}
              />
            ))
          }
        </View>
      </View>

      {/* <Line/> */}

      <View style={styles.section}>
        <Text style={styles.heading}>not here today</Text>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>MEALS</Text>
          {
            notHereTodayMeals.map(meal => (
              <Meal
                key={meal._id}
                name={meal.name}
                diningHall={meal.diningHall}
                isLiked={true}
                location={'favorites'}
              />
            ))
          }
        </View>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>FOOD TRUCKS</Text>
          {
            notHereTodayFoodTrucks.map(truck => (
              <FoodTruck
                key={truck._id}
                truck={truck}
                isFavorited={true}
              />
            ))
          }
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(248, 249, 252, 1)',
  },
  section: {
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  subsection: {
    paddingVertical: 5,
    paddingHorizontal: 5
  },
  title: {
    // fontWeight: '800',
    fontSize: 40,
    color: 'rgba(30, 55, 101, 1)',
    fontFamily: 'perpetua-bold-italic'
  },
  heading: {
    fontWeight: '500',
    fontSize: 25,
    fontFamily: 'Gill-Sans'
  },
  subheading: {
    fontSize: 25,
    color: 'rgba(30, 55, 101, 1)',
    fontFamily: 'Perpetua-MT-Regular',
    marginTop: 5,
  },
  padding: {
    paddingTop: 40
  }
});