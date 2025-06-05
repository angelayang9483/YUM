import axios from 'axios';
import { useFonts } from 'expo-font';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SearchBar } from 'react-native-elements';
import DiningHall from '../components/diningHall.jsx';
import FoodTruck from '../components/foodTruck.jsx';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import {
  getClosingTime,
  getClosingTruckTime,
  getDiningHalls,
  getFoodTrucks,
  getNextOpenTime,
  getNextOpenTruckTime,
  initializeMealAndTruckListeners,
  isDiningHallOpen,
  isFoodTruckOpen
} from '../utils/helpers.js';

export default function Tab() {
  const url = config.BASE_URL;
  const { user } = useContext(AuthContext);

  const [diningHalls, setDiningHalls] = useState([]);
  const [openFoodTrucks, setOpenFoodTrucks] = useState([]);
  const [foodTrucks, setFoodTrucks] = useState([]);
  const [openDiningHalls, setOpenDiningHalls] = useState([]);
  const [closedDiningHalls, setClosedDiningHalls] = useState([]);
  const [now, setNow] = useState(new Date());
  const [searchValue, setSearchValue] = useState('');
  const [closedFoodTrucks, setClosedFoodTrucks] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [filteredTrucks, setFilteredTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrapingCheckDone, setIsScrapingCheckDone] = useState(false);
  const [isInitialDataFetchAttemptDone, setIsInitialDataFetchAttemptDone] = useState(false);
  const [favoriteFoodTrucks, setFavoriteFoodTrucks] = useState([]);

  const [fontsLoaded] = useFonts({
    'perpetua-bold-italic': require('../../assets/Perpetua-Font-Family/perpetua-bold-italic.ttf'),
    'perpetua-bold': require('../../assets/Perpetua-Font-Family/perpetua-bold.ttf'),
    'Perpetua-MT-Regular': require('../../assets/Perpetua-Font-Family/Perpetua-MT-Regular.ttf'),
    'Gil-Sans': require('../../assets/gill-sans-2/Gill-Sans.otf'),
    'Gil-Sans-Light': require('../../assets/gill-sans-2/Gill-Sans-Light.otf'),
    'Gil-Sans-Bold': require('../../assets/gill-sans-2/Gill-Sans-Bold.otf')
  });

  useEffect(() => {
    if (isScrapingCheckDone && isInitialDataFetchAttemptDone) {
      setLoading(false);
    }
  }, [isScrapingCheckDone, isInitialDataFetchAttemptDone]);

  useEffect(() => {
    const checkScrapingLoop = async () => {
      let scrapingIsActive = true;
      let attempts = 0;
      const maxAttempts = 30;

      while (scrapingIsActive && attempts < maxAttempts) {
        attempts++;
        try {
          const response = await axios.get(`${url}/scrape-status`);
          scrapingIsActive = response.data.isScraping;
          if (!scrapingIsActive) break;
        } catch {
          scrapingIsActive = false;
          break;
        }
        if (scrapingIsActive) {
          await new Promise(res => setTimeout(res, 2000));
        }
      }
      setIsScrapingCheckDone(true);
    };

    checkScrapingLoop();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const results = await Promise.allSettled([
          getDiningHalls(setDiningHalls),
          getFoodTrucks(setFoodTrucks)
        ]);
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(
              `Fetch operation ${index === 0 ? 'getDiningHalls' : 'getFoodTrucks'} failed:`,
              result.reason
            );
          }
        });
      } catch (error) {
        console.error('Critical error during initial data fetch orchestration:', error);
      } finally {
        setIsInitialDataFetchAttemptDone(true);
      }
    };

    if (isScrapingCheckDone) {
      fetchInitialData();
    }
  }, [isScrapingCheckDone]);

  useEffect(() => {
    setNow(new Date());

    const interval = setInterval(() => {
      setNow(new Date());
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchFavoriteFoodTrucks = (foodTruck, adding) => {
    if (foodTruck) {
      if (!adding) {
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
    const cleanup = initializeMealAndTruckListeners(null, fetchFavoriteFoodTrucks, 'MENUS.JSX');
    return () => {
      cleanup();
    };
  }, [user]);

  useEffect(() => {
    if (!diningHalls || diningHalls.length === 0) return;

    const open = [];
    const closed = [];

    diningHalls.forEach(hall => {
      if (isDiningHallOpen(hall, now)) {
        open.push(hall);
      } else {
        closed.push(hall);
      }
    });

    setOpenDiningHalls(open);
    setClosedDiningHalls(closed);

    const openFT = [];
    const closedFT = [];

    foodTrucks.forEach(truck => {
      if (isFoodTruckOpen(truck, now)) {
        openFT.push(truck);
      } else {
        closedFT.push(truck);
      }
    });

    setOpenFoodTrucks(openFT);
    setClosedFoodTrucks(closedFT);
  }, [diningHalls, foodTrucks, now]);

  const searchFunc = text => {
    setSearchValue(text);

    const filteredDiningHalls =
      text.trim() === ''
        ? []
        : diningHalls.filter(hall =>
            hall.name.toLowerCase().includes(text.toLowerCase().trim())
          );
    const filteredFoodTrucks =
      text.trim() === ''
        ? []
        : foodTrucks.filter(truck =>
            truck.name.toLowerCase().includes(text.toLowerCase().trim())
          );

    setFilteredHalls(filteredDiningHalls);
    setFilteredTrucks(filteredFoodTrucks);
  };

  const renderContent = ({ item, section }) => {
    // If searching, show only filtered results without sections
    if (searchValue.trim() !== '') {
      return (
        <View>
          <Text style={styles.subheading}>Search Results</Text>
          <Text style={styles.subheading}>DINING HALLS</Text>
          {filteredHalls.map((hall) => (
            <View key={hall._id}>
              <DiningHall
                style={styles.diningHall}
                id={hall._id}
                name={hall.name}
                isOpen={isDiningHallOpen(hall, now)}
                closeTime={isDiningHallOpen(hall, now) ? getClosingTime(hall, now) : null}
                nextOpenTime={!isDiningHallOpen(hall, now) ? getNextOpenTime(hall, now) : null}
              />
            </View>
          ))}
          <Text style={styles.subheading}>FOOD TRUCKS</Text>
          {filteredTrucks.map((truck) => (
            <View key={truck._id}>
              <FoodTruck
                key={truck._id} 
                truck={truck} 
                isOpen={isFoodTruckOpen(truck, now)}
                closeTime={isFoodTruckOpen(truck, now) ? getClosingTruckTime(truck, now) : null}
                nextOpenTime={!isFoodTruckOpen(truck, now) ? getNextOpenTruckTime(truck, now) : null}
                location={'menus'}
              />
            </View>
          ))
        }
      </View>
    );
    }
    return (
      <View>
        <Text style={styles.subheading}>DINING HALLS</Text>
        {section.title === 'Open Now'
          ? openDiningHalls.map((hall, _idx) => (
                <DiningHall
                  key={hall._id + _idx}
                  style={styles.diningHall}
                  id={hall._id}
                  name={hall.name}
                  isOpen={true}
                  closeTime={getClosingTime(hall, now)}
                />
              ))
            : closedDiningHalls.map((hall, _idx) => (
                <DiningHall
                  key={hall._id + _idx}
                  style={styles.diningHall}
                  id={hall._id}
                  name={hall.name}
                  isOpen={false}
                  nextOpenTime={getNextOpenTime(hall, now)}
                />
              ))}
          <Text style={styles.subheading}>FOOD TRUCKS</Text>
          {section.title === 'Open Now'
            ? openFoodTrucks.map((truck, _idx) => (
                <FoodTruck
                  key={truck._id + _idx}
                  isFavorited={favoriteFoodTrucks.some(ft => ft._id === truck._id)}
                  truck={truck}
                  isOpen={true}
                  closeTime={getClosingTruckTime(truck, now)}
                  location={'menus'}
                />
              ))
            : closedFoodTrucks.map((truck, _idx) => (
                <FoodTruck
                  key={truck._id + _idx}
                  isFavorited={favoriteFoodTrucks.some(ft => ft._id === truck._id)}
                  truck={truck}
                  isOpen={false}
                  nextOpenTime={getNextOpenTruckTime(truck, now)}
                  location={'menus'}
                />
              ))}
        </View>
      );
    }

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text>Loading menu...</Text>
        </View>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.section}>
            <Text style={styles.title}>MENUS</Text>
            <SearchBar
              placeholder="search for a dining hall or truck..."
              onChangeText={searchFunc}
              value={searchValue}
              round
              containerStyle={styles.searchBar}
              platform="default"
              lightTheme
            />
          </View>
          <SectionList
            contentContainerStyle={styles.sectionListContent}
            sections={
              searchValue.trim() !== ''
                ? [
                    {
                      title: 'search results',
                      data: [{ id: 'search' }]
                    }
                  ]
                : [
                    {
                      title: 'Open Now',
                      data: [{ id: 'open' }]
                    },
                    {
                      title: 'Closed',
                      data: [{ id: 'closed' }]
                    }
                  ]
            }
            stickySectionHeadersEnabled={false}
            keyExtractor={item => item.id}
            renderItem={renderContent}
            renderSectionHeader={({ section: { title } }) =>
              searchValue.trim() === '' ? (
                <View style={styles.section}>
                  <Text style={styles.heading}>{title}</Text>
                </View>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(248, 249, 252, 1)'
  },
  sectionListContent: {
    padding: 0
  },
  section: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  subsection: {
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 5
  },
  title: {
    fontSize: 40,
    color: 'rgba(30, 55, 101, 1)',
    fontFamily: 'perpetua-bold-italic'
  },
  heading: {
    fontWeight: '500',
    fontSize: 25,
    fontFamily: 'Gill-Sans'
  },
  subheading: {
    width: '100%',
    fontSize: 25,
    color: 'rgba(30, 55, 101, 1)',
    fontFamily: 'Perpetua-MT-Regular',
    paddingLeft: 20,
    marginTop: 5
  },
  padding: {
    paddingTop: 15
  },
  diningHall: {
    width: '100%',
    marginVertical: 5
  },
  placeholderContainer: {
    width: '100%',
    height: 60,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    fontWeight: '600',
    fontSize: 16,
    color: 'rgba(0, 80, 157, 0.5)'
  },
  searchBar: {
    backgroundColor: 'rgba(248, 249, 252, 1)',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    paddingHorizontal: 0
  }
});
