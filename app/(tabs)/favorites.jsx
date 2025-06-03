import { ScrollView, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import Comment from '../components/comment.jsx';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import Line from '../components/line.jsx';
import Meal from '../components/meal.jsx';

export default function Tab() {
  const url = config.BASE_URL;
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [favoriteFoodTrucks, setFavoriteFoodTrucks] = useState([]);

  const fetchFavoriteMeals = async () => {
    try {
      const mealData = await Promise.all(
        favorites.map(async (id) => {
          try {
            const response = await axios.get(`${url}/api/meals/${id}`);
            return response.data;
          } catch (err) {
            console.warn(`Meal ID ${id} not found`);
            return null;  // Skip missing meals
          }
        })
      );
      setFavoriteMeals(mealData.filter(meal => meal !== null));
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  const getFavorites = async () => {
    try {
      if (!user || !user.userId) throw new Error('User not properly authenticated');

      const response = await axios.get(`${url}/api/users/${user.userId}`);
      setFavorites(response.data.favorites || []);
      setFavoriteFoodTrucks(response.data.favoriteFoodTrucks || []);
      console.log("Fetched Favorites:", response.data.favorites);

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

  useEffect(() => {
    if (favorites.length > 0) {
      fetchFavoriteMeals();
    }
  }, [favorites]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.padding}></Text>
        <Text style={styles.title}>Favorites</Text>
      </View>

      <Line/>

      <View style={styles.section}>
        <Text style={styles.heading}>Available Now</Text>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Meals</Text>
          {
          favoriteMeals.map(meal => (
            <Meal
              key={meal._id}
              name={meal.name}
              diningHall={meal.diningHall}
              isLiked={true}
            />
          ))
        }
        </View>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Food Trucks</Text>
        </View>
      </View>

      <Line/>

      <View style={styles.section}>
        <Text style={styles.heading}>Later Today</Text>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Meals</Text>
        </View>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Food Trucks</Text>
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
