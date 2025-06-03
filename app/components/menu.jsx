// Menu.jsx
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

const Menu = ({ visible, onClose, todayMeals }) => {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: height / 2,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      {(!meals || meals.length === 0) && (
        <Text style={styles.text}>No meals available for today.</Text>
      )}
      {meals && meals.length > 0 && (
        <ScrollView style={styles.mealsList}>
          {meals.map((mealItem, index) => (
            <View key={index} style={styles.mealContainer}>
              <View style={styles.infoContainer}>
                <Text style={styles.mealName}>{mealItem.name}</Text>
                <Text style={styles.mealDesc}>{mealItem.description}</Text>
              </View>
              <Text style={styles.mealPrice}>
                ${mealItem.price.toFixed(2)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height / 2,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    elevation: 5,
    zIndex: 10,
  },
  text: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginTop: 10,
  },
  mealsList: {
    flex: 1,
    marginBottom: 12,
  },
  mealContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  infoContainer: {
    flex: 1,
    paddingRight: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mealDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#467FB6',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

const todayMeals = [
  {
    name:        'Grilled Chicken Salad',
    description: 'Fresh greens topped with grilled chicken, cherry tomatoes, and a balsamic vinaigrette.',
    price:       12.99,
  },
  {
    name:        'Veggie Burger',
    description: 'Black bean patty with lettuce, tomato, avocado, and our special sauce.',
    price:       10.50,
  },
  {
    name:        'Spaghetti Carbonara',
    description: 'Penne pasta in a creamy sauce with pancetta, parmesan, and cracked pepper.',
    price:       14.75,
  },
  {
    name:        'Smoothie Bowl',
    description: 'Acai base topped with granola, banana, berries, and a honey drizzle.',
    price:       8.00,
  },
];

export default Menu;
