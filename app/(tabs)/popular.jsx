import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import FoodTruck from '../components/foodTruck.jsx';
import Line from '../components/line.jsx';
import Meal from '../components/meal.jsx';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import { initializeMealAndTruckListeners } from '../utils/helpers.js';


export default function Tab() {
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [favoriteFoodTrucks, setFavoriteFoodTrucks] = useState([]);
  const url = config.BASE_URL;
  const { user } = useContext(AuthContext);
  const [popularMeals, setPopularMeals] = useState([]);
  const [popularFoodTrucks, setPopularFoodTrucks] = useState([]);

  const fetchPopularMeals = async () => {
    try {
      const response = await axios.get(`${url}/api/meals/popular`);
      setPopularMeals(response.data);
    } catch (err) {
      console.error("Error fetching popular meals:", err.message);
    }
  };

  const fetchPopularFoodTrucks = async () => {
    try {
      const response = await axios.get(`${url}/api/foodtrucks/popular`);
      setPopularFoodTrucks(response.data);
    } catch (err) {
      console.error('Error fetching popular food trucks:', err.message);
    }
  };

  const fetchFavoriteMeals = (meal, adding) => {
    if (meal) {
        setPopularMeals(prev => prev.map(a => {
            if(a._id === meal._id) {
                return meal;
            }
            return a;
        }))
        
        if(!adding) {
            setFavoriteMeals(prev => prev.filter(a => a._id !== meal._id));
        } else {
            setFavoriteMeals(prev => [...prev, meal]);
        }
      }
    if (!user) {
      setFavoriteMeals([]);
      return;
    }
    if (!meal) {
      axios
        .get(`${url}/api/users/${user.userId}/favorite-meals`)
        .then(res => setFavoriteMeals(res.data.favoriteMeals || []))
        .catch(err => {
          console.error('Error fetching favorite meals:', err);
          setFavoriteMeals([]);
      });
    }
  };
  const fetchFavoriteFoodTrucks = (foodTruck, adding) => {
    if (foodTruck) {
        setPopularFoodTrucks(prev => prev.map(a => {
            if(a._id === foodTruck._id) {
                return foodTruck;
            }
            return a;
        }))
        
        if(!adding) {
            setFavoriteFoodTrucks(prev => prev.filter(a => a._id !== foodTruck._id));
        } else {
            setFavoriteFoodTrucks(prev => [...prev, foodTruck]);
        }
      }
    if (!user) {
      setFavoriteFoodTrucks([]);
      return;
    }
    if (!foodTruck) {
      axios
        .get(`${url}/api/users/${user.userId}/favorite-trucks`)
        .then(res => setFavoriteFoodTrucks(res.data.favoriteFoodTrucks || []))
        .catch(err => {
          console.error('Error fetching favorite food trucks:', err);
          setFavoriteFoodTrucks([]);
      });
    }
  };

  useEffect(() => {
    const cleanup = initializeMealAndTruckListeners(fetchFavoriteMeals, fetchFavoriteFoodTrucks, "POPULAR.JSX");
    return () => {
      cleanup();
    };
  }, [user]);


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
          popularMeals.map((meal, _idx) => (
            <Meal
              key={meal._id + _idx}
              id={meal._id}
              name={meal.name}
              diningHall={meal.diningHall}
              isFavorited={favoriteMeals.some(a => a._id === meal._id)}
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
          popularFoodTrucks.map((foodTruck, _idx) => (
            // <FoodTruck
            //   key={foodTruck._id}
            //   name={foodTruck.name}
            //   isLiked={true}
            //   location={'favorites'}
            // />
            <FoodTruck
              key={foodTruck._id + _idx}
              truck={foodTruck}
              isFavorited={favoriteFoodTrucks.includes(foodTruck._id)}
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
    paddingTop: 15
  }
});