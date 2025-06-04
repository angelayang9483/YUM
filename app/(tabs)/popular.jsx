import axios from 'axios';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import FoodTruck from '../components/foodTruck.jsx';
import Line from '../components/line.jsx';
import Meal from '../components/meal.jsx';
import config from '../config';
import { AuthContext } from '../context/AuthContext';

export default function Tab() {
  const [favorites, setFavorites] = useState([]);
  const url = config.BASE_URL;
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popularMeals, setPopularMeals] = useState([]);
  const [popularFoodTrucks, setPopularFoodTrucks] = useState([]);

  const fetchPopularMeals = async () => {
    try {
      const response = await axios.get(`${url}/api/meals/popular`);
      setPopularMeals(response.data);
      console.log('popular meals:', popularMeals);
    } catch (err) {
      console.error("Error fetching popular meals:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPopularFoodTrucks = async () => {
    try {
      const response = await axios.get(`${url}/api/foodtrucks/popular`);
      setPopularFoodTrucks(response.data);
      console.log('popular food trucks:', response.data);
    } catch (err) {
      console.error('Error fetching popular food trucks:', err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPopularMeals();
    fetchPopularFoodTrucks();
  }, []);


  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.padding}></Text>
        <Text style={styles.title}>Popular</Text>
      </View>

      <Line/>

      <View style={styles.section}>
        <Text style={styles.heading}>Meals</Text>
        <View style={styles.subsection}>
          {
          popularMeals.map(meal => (
            <Meal
              key={meal._id}
              name={meal.name}
              diningHall={meal.diningHall}
              isLiked={true}
              location={'popular'}
              favoritesCount={meal.favoritesCount}
            />
          ))
          }
        </View>
      </View>

      <Line/>

      <View style={styles.section}>
        <Text style={styles.heading}>Food Trucks</Text>
        <View style={styles.subsection}>
          {
          popularFoodTrucks.map(foodTruck => (
            // <FoodTruck
            //   key={foodTruck._id}
            //   name={foodTruck.name}
            //   isLiked={true}
            //   location={'favorites'}
            // />
            <FoodTruck
              key={foodTruck._id}
              truck={foodTruck}
              location={'popular'}
            />
          ))
          }
        </View>
      </View>
    </ScrollView>
  );
}

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
    paddingTop: 40
  }
});