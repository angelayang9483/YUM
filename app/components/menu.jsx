import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useFonts } from 'expo-font';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import Comment from './comment.jsx';
import { initializeMealAndTruckListeners } from '../utils/helpers.js';
import Meal from './meal.jsx';

const { height } = Dimensions.get('window');
const SNAP_POINT = height * 0.1;

const Menu = ({ visible, onClose, diningHallId }) => {
  const url = config.BASE_URL;
  const [menu, setMenu] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [diningHall, setDiningHall] = useState(null);

  const { user } = useContext(AuthContext);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [fontsLoaded] = useFonts({
    'perpetua-bold-italic': require('../../assets/Perpetua-Font-Family/perpetua-bold-italic.ttf'),
    'perpetua-bold': require('../../assets/Perpetua-Font-Family/perpetua-bold.ttf'),
    'Perpetua-MT-Regular': require('../../assets/Perpetua-Font-Family/Perpetua-MT-Regular.ttf'),
    'Gil-Sans': require('../../assets/gill-sans-2/Gill-Sans.otf'),
    'Gil-Sans-Light': require('../../assets/gill-sans-2/Gill-Sans-Light.otf'),
    'Gil-Sans-Bold': require('../../assets/gill-sans-2/Gill-Sans-Bold.otf')
  });

  const fetchFavoriteMeals = (meal, adding) => {
    if (meal) {
        setMenu(prevMenu => 
          prevMenu.map(period => ({
            ...period,
            data: period.data.map(station => ({
              ...station,
              data: station.data.map(mealToUpdate => 
                mealToUpdate._id === meal._id 
                  ? meal
                  : mealToUpdate
              ),
            })),
          }))
        );
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

  useEffect(() => {
    const cleanup = initializeMealAndTruckListeners(fetchFavoriteMeals, null, "MENU.JSX");
    return () => {
      cleanup();
    };
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

  useEffect(() => {
    const fetchDiningHall = async () => {
      try {
        const response = await axios.get(`${url}/api/diningHalls/${diningHallId}`);
        setDiningHall(response.data);
      } catch (err) {
        console.error('Error fetching dining hall:', err);
      }
    };

    if (visible) {
      fetchDiningHall();
    }
  }, [diningHallId, visible]);

  const handleAddComment = async () => {
    if (comment.trim() === '') return;
    try {
      const response = await axios.post(`${url}/api/comments`, {
        content: comment,
        diningHallName: diningHallId,
        userId: user.userId
      });
      
      console.log("Full response from comment creation:", response);
      
      const commentId = response.data.comment._id;
      
      if (!commentId) {
        console.warn('commentId is undefined; aborting link step.');
        return;
      }
      
      console.log('Attempting to link comment to user...');
      await axios.post(`${url}/api/comments/${commentId}/link`, {
        userId: user.userId
      });

      console.log('Successfully linked to user, now linking to dining hall...');
      await axios.post(`${url}/api/comments/${commentId}/toDiningHall`, {
        diningHallId: diningHallId
      });
      
      setComment('');
      console.log('Comment input cleared');

      // Refresh dining hall data to show new comment
      const diningresponse = await axios.get(`${url}/api/diningHalls/${diningHallId}`);
      setDiningHall(diningresponse.data);
    } catch (err) {
      console.error('Error in handleAddComment:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      });
      
      if (err.response) {
        console.log("Server responded with:", err.response.status, err.response.data);
      } else {
        console.error("Error adding comment:", err.message);
      }
    }
  }

  return (
    <Modal visible={visible} animationType="none" transparent>
      <View style={styles.backdrop} />
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: animTranslateY }] },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header} {...panResponder.panHandlers}>
            <View style={styles.grabber} />
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>menu</Text>
          </View>

          <View style={styles.mainContent}>
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
                  <View style={styles.listContainer}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      sections={selectedPeriod.data}
                      keyExtractor={(item, idx) => item._id + idx}
                      renderSectionHeader={({ section }) => (
                        <Text style={styles.sectionHeader}>{section.title.toLowerCase()}</Text>
                      )}
                      renderItem={({ item, idx }) => (
                        <Meal
                          key={item._id + idx}
                          id={item._id}
                          name={item.name}
                          diningHall={item.diningHall}
                          isFavorited={favoriteMeals.some(a => a._id === item._id)}
                          location={'menu'}
                          favoritesCount={item.favoritesCount}
                        />
                      )}
                      contentContainerStyle={styles.sectionListContent}
                    >
                      {selectedPeriod.data.map((section, sectionIndex) => (
                        <View key={section.title + sectionIndex}>
                          <Text style={styles.sectionHeader}>{section.title.toLowerCase()}</Text>
                          {section.data.map((item, idx) => (
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
                          ))}
                        </View>
                      ))}
                      <View style={styles.header}>
                        <Text style={styles.title}>comments</Text>
                      </View>
                      <View style={styles.commentsSection}>
                        {diningHall?.comments?.map((comment, index) => (
                          <Comment
                            key={comment._id || index}
                            comment={comment}
                          />
                        ))}
                        {(!diningHall?.comments || diningHall.comments.length === 0) && (
                          <Text style={styles.noCommentsText}>No comments yet</Text>
                        )}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.commentContainer}>
            <TextInput 
              style={styles.commentText}
              placeholder="Write a comment..."
              value={comment}
              onChangeText={setComment}
            />
            <Pressable onPress={handleAddComment} style={styles.sendButton}>
              <FontAwesome name="paper-plane" size={20} color="black" />
            </Pressable>   
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 249, 252, 1)',
  },
  safeArea: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingBottom: 60,
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '90%',
    backgroundColor: 'rgba(207, 207, 208, 1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    zIndex: 1000,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  title: {
    fontSize: 40,
    color: 'rgba(30, 55, 101, 1)',
    fontFamily: 'perpetua-bold-italic'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
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
      backgroundColor: 'rgba(110, 105, 93, 1)',
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
    fontSize: 20,
    fontFamily: 'Perpetua-MT-Regular',
    backgroundColor: '#f6f6f6',
    padding: 8,
    margin: 1,
    marginAbove: 2,
    width: '200%',
  },
  listContainer: {
    flex: 1,
  },
  sectionListContent: {
    paddingBottom: 20,
  },
  commentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f6f6f6',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  commentText: {
    flex: 1,
    marginRight: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
    fontStyle: 'italic',
  },
});

export default Menu;
