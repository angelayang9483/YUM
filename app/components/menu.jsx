// Menu.jsx
import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import Meal from './meal.jsx';

const { height } = Dimensions.get('window');
const SNAP_POINT = height / 8;

const Menu = ({ visible, onClose, diningHallId }) => {
  const url = config.BASE_URL;
  const [menu, setMenu] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);
  const [favoriteMeals, setFavoriteMeals] = useState([]);

  const fetchFavoriteMeals = (mealIdToUpdate, newCount) => {
    if (mealIdToUpdate && typeof newCount !== 'undefined') {
        setMenu(prevMenu => 
          prevMenu.map(period => ({
            ...period,
            data: period.data.map(station => ({
              ...station,
              data: station.data.map(meal => 
                meal._id === mealIdToUpdate 
                  ? { ...meal, favoritesCount: newCount } 
                  : meal
              ),
            })),
          }))
        );
      }
    if (!user) {
      setFavoriteMeals([]);
      return;
    }
    axios
      .get(`${url}/api/users/${user.userId}/favorite-meal`)
      .then(res => setFavoriteMeals(res.data.favoriteMeals || []))
      .catch(err => {
        console.error('Error fetching favorite meals:', err);
        setFavoriteMeals([]);
      });
  };

  useEffect(() => {
    fetchFavoriteMeals();
  }, [user]);

  const translateY = useRef(new Animated.Value(height)).current;
  const pan = useRef(new Animated.Value(0)).current;
  const animTranslateY = Animated.add(translateY, pan);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          pan.setValue(dy);
        }
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 100 || vy > 1.0) {
          Animated.timing(translateY, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            pan.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            bounciness: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${url}/api/menus/${diningHallId}`);
        const periodList = Object.values(response.data.mealPeriods);
        const newMenu = periodList.map((period) => ({
          title: period.name,
          data: period.stations.map((station) => ({
            title: station.name,
            data: station.meals,
          })),
        }));
        setMenu(newMenu);

        if (newMenu.length > 0) {
          setSelectedPeriod(newMenu[0]);
        } else {
          setError('No menu found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Failed to fetch menu');
        setLoading(false);
      }
    };

    fetchMenu();
  }, [diningHallId]);

  useEffect(() => {
    if (visible) {
      translateY.setValue(height);
      Animated.timing(translateY, {
        toValue: SNAP_POINT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        pan.setValue(0);
      });
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="none" transparent>
        <View style={styles.backdrop} />
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: animTranslateY }] },
        ]}
      >
        <View style={styles.header} {...panResponder.panHandlers}>
          <View style={styles.grabber} />
          <Text style={styles.title}>Menu</Text>
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        )}
        {!loading && error && (
          <View style={styles.center}>
            <Text>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <View style={styles.content}>
            <View style={styles.buttonsRow}>
              {menu.map((p, idx) => (
                <View key={p.title + idx} style={styles.buttonWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setSelectedPeriod(p)}
                    style={[
                      styles.segmentButton,
                      p.title === selectedPeriod.title
                        ? styles.segmentButtonSelected
                        : styles.segmentButtonUnselected,
                      idx > 0 && {
                        borderLeftWidth: 1,
                        borderLeftColor: '#d1d1d6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        p.title === selectedPeriod.title
                          ? styles.segmentTextSelected
                          : styles.segmentTextUnselected,
                      ]}
                    >
                      {p.title.charAt(0).toUpperCase() + p.title.slice(1)}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {!selectedPeriod && (
              <View style={styles.center}>
                <Text>Please select a meal period</Text>
              </View>
            )}

            {selectedPeriod && (
              <SectionList
              showsVerticalScrollIndicator={false}
                sections={selectedPeriod.data}
                keyExtractor={(item, idx) => item._id + idx}
                renderSectionHeader={({ section }) => (
                  <Text style={styles.sectionHeader}>{section.title}</Text>
                )}
                renderItem={({ item, idx }) => (
                  <Meal
                    key={item._id + idx}
                    id={item._id}
                    name={item.name}
                    diningHall={item.diningHall}
                    isLiked={favoriteMeals.includes(item._id)}
                    location={'menu'}
                    favoritesCount={item.favoritesCount}
                    onLikeChange={fetchFavoriteMeals}
                  />
                )}
              />
            )}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    backdrop: {
        position:  'absolute',
        top:       0,
        left:      0,
        right:     0,
        bottom:    0,
        backgroundColor: 'rgba(0,0,0,0.3)',

    },

  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    color: '#222',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    height: 36,
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  segmentButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentButtonSelected: {
    backgroundColor: '#467FB6',
  },
  segmentButtonUnselected: {
    backgroundColor: '#ffffff',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  segmentTextSelected: {
    color: '#ffffff',
  },
  segmentTextUnselected: {
    color: '#000000',
  },
  sectionHeader: {
    fontWeight: '600',
    fontSize: 18,
    color: '#222',
    backgroundColor: '#f6f6f6',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
});

export default Menu;
