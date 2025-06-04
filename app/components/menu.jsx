// Menu.jsx
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Pressable,
    SectionList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import config from '../config';
import Meal from './meal.jsx';

const { height } = Dimensions.get('window');

const Menu = ({ visible, onClose, diningHallId }) => {
    const url = config.BASE_URL;
    const [menu, setMenu] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await axios.get(`${url}/api/menus/${diningHallId}/today`);
                console.log("raw menu response:", response.data);
                const newMenu = response.data.mealPeriods.map(period => ({
                    title: period.name,
                    data: period.stations.map(station => ({
                      title: station.name,
                      data: station.meals
                    }))
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
        <View>
        <View style={styles.buttonsRow}>
        {menu.map((p, idx) => (
          <View key={p.title} style={styles.buttonWrapper}>
            <TouchableOpacity
                key={p.title}
                activeOpacity={0.7}
                onPress={() => setSelectedPeriod(p)}
                style={[
                styles.segmentButton,
                p.title === selectedPeriod.title ? styles.segmentButtonSelected : styles.segmentButtonUnselected,

                idx > 0 && { borderLeftWidth: 1, borderLeftColor: '#d1d1d6' },
                ]}
            >
                <Text
                style={[
                    styles.segmentText,
                    p.title === selectedPeriod.title ? styles.segmentTextSelected : styles.segmentTextUnselected,
                ]}
                >
                {p.title}
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
            sections={selectedPeriod.data}
            keyExtractor={(item) => item._id}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <Meal
                  key={item._id}
                  name={item.name}
                  diningHall={item.diningHall}
                  isLiked={true}
                  location={'menu'}
              />
            )}
          />
        )}
        </View>
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
      left: 0,
      right: 0,
      height: height,
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 16,
      paddingHorizontal: 16,
    },
  
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
    
      segmentButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },

      segmentButtonSelected: {
        backgroundColor: '#007AFF',
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
        color: '#007AFF',
      },

    buttonWrapper: {
      flex: 1,
      justifyContent: 'center',
    },
  
    sectionHeader: {
      fontWeight: '600',
      fontSize: 18,
      color: '#222',
      backgroundColor: '#f6f6f6',
      paddingVertical: 8,
      paddingHorizontal: 8,
    },
  
    closeButton: {
      alignSelf: 'center',
      marginTop: 16,
      marginBottom: 32,
    },
    closeText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#007AFF',
    },
  });

export default Menu;