// Menu.jsx
import axios from 'axios';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import config from '../config';

const { height } = Dimensions.get('window');

const Menu = async ({diningHallId }) => {
  const url = config.BASE_URL;
  const response = await axios.get(`${url}/api/menus/${diningHallId}/today`);
  const mealPeriods = response.data.mealPeriods;

  const [selectedPeriod, setSelectedPeriod] = useState(mealPeriods[0].name);

  const sections = (mealPeriods[selectedPeriod] || []).map((station) => ({
    title: station.name,
    data: station.meals,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
      {mealPeriods.map((mealPeriod) => (
        <Pressable
        key={mealPeriod.name}
        onPress={() => setSelectedPeriod(mealPeriod.name)}
        style={[
          styles.tabButton,
          selectedPeriod === mealPeriod.name && styles.tabButtonActive,
        ]}
      >
        <Text style={[
                styles.tabButtonText,
                selectedPeriod === mealPeriod.name && styles.tabButtonTextActive,
              ]}>{mealPeriod.name}</Text>
      </Pressable>
      ))}
      </View>
      <SectionList
        styles={styles.sectionsList}
        sections={sections}
        keyExtractor={(item, index) => item + index}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.mealContainer}>
            <View style={styles.infoContainer}>
              <Text style={styles.mealName}>{item.id}</Text>
            </View>
          </View>
        )}
      />
    </View>
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
