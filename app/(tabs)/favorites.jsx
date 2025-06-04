import axios from 'axios';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Line from '../components/line.jsx';
import Meal from '../components/meal.jsx';
import FoodTruck from '../components/foodTruck.jsx';
import config from '../config';
import { AuthContext } from '../context/AuthContext';

export default function Tab() {
  const url = config.BASE_URL;
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [favoriteFoodTrucks, setFavoriteFoodTrucks] = useState([]);

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
        <Text style={styles.title}>Favorites</Text>
      </View>

      <Line/>

      <View style={styles.section}>
        <Text style={styles.heading}>Here Today</Text>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Meals</Text>
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
          <Text style={styles.subheading}>Food Trucks</Text>
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

      <Line/>

      <View style={styles.section}>
        <Text style={styles.heading}>Not Here Today</Text>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Meals</Text>
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
          <Text style={styles.subheading}>Food Trucks</Text>
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
    backgroundColor: 'white',
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
    fontWeight: '800',
    fontSize: 30,
    color: 'rgba(0, 80, 157, 1)',
  },
  heading: {
    fontWeight: '700',
    fontSize: 25,
    color: 'rgba(0, 80, 157, 1)',
  },
  subheading: {
    fontWeight: '600',
    fontSize: 20,
    color: 'rgba(0, 80, 157, 1)',
  },
  padding: {
    paddingTop: 15
  }
});