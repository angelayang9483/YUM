import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import FoodTruck from '../components/foodTruck.jsx';
import Line from '../components/line.jsx';
import Meal from '../components/meal.jsx';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import { getClosingTruckTime, getNextOpenTruckTime, initializeMealAndTruckListeners, isFoodTruckOpen } from '../utils/helpers.js';

export default function Tab() {
  const url = config.BASE_URL;
  const { user } = useContext(AuthContext);
  const [hereTodayMeals, setHereTodayMeals] = useState([]);
  const [notHereTodayMeals, setNotHereTodayMeals] = useState([]);
  const [hereTodayFoodTrucks, setHereTodayFoodTrucks] = useState([]);
  const [notHereTodayFoodTrucks, setNotHereTodayFoodTrucks] = useState([]);

  const fetchFavoriteMeals = (meal, adding) => {
    if (meal) {
      if(!adding) {
        if (meal.hereToday) {
          setHereTodayMeals(prev => prev.filter(a => a._id !== meal._id));
        } else {
          setNotHereTodayMeals(prev => prev.filter(a => a._id !== meal._id));
        }
      } else {
        if (meal.hereToday) {
          setHereTodayMeals(prev => [...prev, meal]);
        } else {
          setNotHereTodayMeals(prev => [...prev, meal]);
        }
      }
    }
    if (!user) {
      setHereTodayMeals([]);
      setNotHereTodayMeals([]);
      return;
    }
    if (!meal) {
      axios
        .get(`${url}/api/users/${user.userId}/favorite-meals`)
        .then(res => {
          setHereTodayMeals(res.data.favoriteMeals.filter(meal => meal.hereToday));
          setNotHereTodayMeals(res.data.favoriteMeals.filter(meal => !meal.hereToday));
        })
        .catch(err => {
          console.error('Error fetching favorite meals:', err);
          setHereTodayMeals([]);
          setNotHereTodayMeals([]);
      });
    }
  };

  const fetchFavoriteFoodTrucks = (foodTruck, adding) => {
    if (foodTruck) {
      if(!adding) {
        if (foodTruck.hereToday) {
          setHereTodayFoodTrucks(prev => prev.filter(a => a._id !== foodTruck._id));
        } else {
          setNotHereTodayFoodTrucks(prev => prev.filter(a => a._id !== foodTruck._id));
        }
      } else {
        if (foodTruck.hereToday) {
          setHereTodayFoodTrucks(prev => [...prev, foodTruck]);
        } else {
          setNotHereTodayFoodTrucks(prev => [...prev, foodTruck]);
        }
      }
    }
    if (!user) {
      setHereTodayFoodTrucks([]);
      setNotHereTodayFoodTrucks([]);
      return;
    }
    if (!foodTruck) {
      axios
        .get(`${url}/api/users/${user.userId}/favorite-trucks`)
        .then(res => {
          setHereTodayFoodTrucks(res.data.favoriteFoodTrucks.filter(truck => truck.hereToday));
          setNotHereTodayFoodTrucks(res.data.favoriteFoodTrucks.filter(truck => !truck.hereToday));
        })
        .catch(err => {
          console.error('Error fetching favorite food trucks:', err);
          setHereTodayFoodTrucks([]);
          setNotHereTodayFoodTrucks([]);
      });
    }
  };

  useEffect(() => {
    const cleanup = initializeMealAndTruckListeners(fetchFavoriteMeals, fetchFavoriteFoodTrucks, "FAVORITES.JSX");
    return () => {
      cleanup();
    }
  }, [user]);

  // useEffect(() => {
  //   if (favoriteMealIds.length > 0) {
  //     fetchFavoriteMeals();
  //   }
  //   if (favoriteFoodTruckIds.length > 0) {
  //     fetchFavoriteFoodTrucks();
  //   }
  // }, [favoriteMealIds, favoriteFoodTruckIds]);

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
            hereTodayMeals.map((meal, _idx) => (
              <Meal
                key={meal._id + _idx}
                id={meal._id}
                name={meal.name}
                diningHall={meal.diningHall}
                isFavorited={true}
                location={'favorites'}
                favoritesCount={meal.favoritesCount}
              />
            ))
          }
        </View>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Food Trucks</Text>
          {
            hereTodayFoodTrucks.map((truck, _idx) => (
              <FoodTruck
                key={truck._id + _idx}
                truck={truck}
                location={'favorites'}
                isOpen={isFoodTruckOpen(truck, new Date())}
                closeTime={getClosingTruckTime(truck, new Date())}
                nextOpenTime={getNextOpenTruckTime(truck, new Date())}
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
            notHereTodayMeals.map((meal, _idx) => (
              <Meal
                key={meal._id + _idx}
                id={meal._id}
                name={meal.name}
                diningHall={meal.diningHall}
                isFavorited={true}
                location={'favorites'}
                favoritesCount={meal.favoritesCount}
              />
            ))
          }
        </View>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Food Trucks</Text>
          {
            notHereTodayFoodTrucks.map((truck, _idx) => (
              <FoodTruck
                key={truck._id + _idx}
                truck={truck}
                isFavorited={true}
                location={'favorites'}
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