import axios from 'axios';
import { useFonts } from 'expo-font';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SearchBar } from 'react-native-elements';
import DiningHall from '../components/diningHall.jsx';
import FoodTruck from '../components/foodTruck.jsx';
import config from '../config';
import { AuthContext } from '../context/AuthContext';
import { getClosingTime, getClosingTruckTime, getDiningHalls, getFoodTrucks, getNextOpenTime, getNextOpenTruckTime, initializeMealAndTruckListeners, isDiningHallOpen, isFoodTruckOpen } from '../utils/helpers.js';

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
  const [filteredFoodTrucks, setFilteredFoodTrucks] = useState([]);
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


  
  // New useEffect to manage the main loading state based on completion flags
useEffect(() => {
  if (isScrapingCheckDone && isInitialDataFetchAttemptDone) {
    console.log('Both scraping check and data fetch attempt are done. Hiding loader.');
    setLoading(false);
  }
}, [isScrapingCheckDone, isInitialDataFetchAttemptDone]);

// New useEffect for checking scraping status
useEffect(() => {
  const checkScrapingLoop = async () => {
    let scrapingIsActive = true;
    console.log('Starting scraping status check loop...');
    let attempts = 0;
    const maxAttempts = 30; // Max ~1 minute of checking if polling every 2s

    while (scrapingIsActive && attempts < maxAttempts) {
      attempts++;
      try {
        const response = await axios.get(`${url}/scrape-status`);
        console.log('Scrape status response:', response.data);
        scrapingIsActive = response.data.isScraping;
        if (!scrapingIsActive) {
          console.log('Scraping is no longer active. Exiting loop.');
          break; 
        }
      } catch (err) {
        console.error('Scraping status check error:', err.message, '- Assuming scraping is not critical or has an issue, proceeding.');
        scrapingIsActive = false; 
        break;
      }
      if (scrapingIsActive) { 
        console.log(`Scraping still active (attempt ${attempts}), waiting 2 seconds...`);
        await new Promise(res => setTimeout(res, 2000));
      }
    }
    if (attempts >= maxAttempts && scrapingIsActive) {
      console.warn('Max attempts reached for scraping check; proceeding as if scraping is done/not critical.');
    }
    console.log('Scraping check loop finished.');
    setIsScrapingCheckDone(true);
  };

  checkScrapingLoop();
}, []); // Run once on mount to check scraping status

// New useEffect for fetching initial data, triggered after scraping check is done (or assumed done)
useEffect(() => {
  const fetchInitialData = async () => {
    console.log('Attempting to fetch initial dining halls and food trucks data...');
    try {
      // Using Promise.allSettled to ensure all fetches complete, regardless of individual failures
      const results = await Promise.allSettled([
        getDiningHalls(setDiningHalls), // Assumes getDiningHalls updates its own state and handles its errors
        getFoodTrucks(setFoodTrucks)   // Assumes getFoodTrucks updates its own state and handles its errors
      ]);
      console.log('Initial data fetch attempts completed.');
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Fetch operation ${index === 0 ? 'getDiningHalls' : 'getFoodTrucks'} failed:`, result.reason);
        }
      });
    } catch (error) {
      // This catch is for unforeseen issues in the Promise.allSettled orchestration itself
      console.error("Critical error during initial data fetch orchestration:", error);
    } finally {
      setIsInitialDataFetchAttemptDone(true);
    }
  };

  if (isScrapingCheckDone) {
    console.log('Scraping check is done (or assumed done), proceeding to fetch initial data.');
    fetchInitialData();
  } else {
    console.log('Waiting for scraping check to complete before fetching data.');
  }
}, [isScrapingCheckDone]); // Trigger data fetch when scraping check is done

  
  // supposed to run every 30 minutes
  useEffect(() => {
    setNow(new Date());
  
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30 * 60 * 1000);
  
    return () => clearInterval(interval);
  }, []);
  
  const fetchFavoriteFoodTrucks = (foodTruck, adding) => {
    if (foodTruck) {
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
    const cleanup = initializeMealAndTruckListeners(null, fetchFavoriteFoodTrucks, "MENUS.JSX");
    return () => {
      cleanup();
    }
  }, [user]);

  // checks if dining halls are closed or open
  useEffect(() => {
    if (!diningHalls || diningHalls.length === 0) {
      console.log('Waiting for dining halls data...');
      return;
    }
  
    console.log('Processing dining halls:', diningHalls);
    const open = [];
    const closed = [];
  
    diningHalls.forEach(hall => {
      if (isDiningHallOpen(hall, now)) {
        open.push(hall);
      } else {
        closed.push(hall);
      }
    });
  
    console.log('Open:', open);
    setOpenDiningHalls(open);
    setClosedDiningHalls(closed);


    console.log('Processing food trucks:', foodTrucks)
      const openFT = [];
      const closedFT = [];
      foodTrucks.forEach(truck => {
        if (isFoodTruckOpen(truck, now)) {
          openFT.push(truck);
        } else {
          closedFT.push(truck);
        }
      });
      console.log('Open:', openFT);
      setOpenFoodTrucks(openFT);
      setClosedFoodTrucks(closedFT);
 
  }, [diningHalls, foodTrucks, now]);

  
  const searchFunc = (text) => {
    setSearchValue(text);

    const filteredDiningHalls = text.trim() === '' ? [] : 
      diningHalls.filter((hall) => 
        hall.name.toLowerCase().includes(text.toLowerCase().trim())
      );
    setFilteredHalls(filteredDiningHalls);
    const filteredFT = text.trim() === '' ? [] : 
      foodTrucks.filter((truck) => 
        truck.name.toLowerCase().includes(text.toLowerCase().trim())
      );
    setFilteredFoodTrucks(filteredFT);
  };

  // Add logging to render function
  const renderContent = ({ section }) => {
    // If searching, show only filtered results without sections
    if (searchValue.trim() !== '') {
      return (
        <View>
          <Text style={styles.heading}>search results</Text>
          <Text style={styles.subheading}>Dining Halls</Text>
          {filteredHalls.length > 0 ? (
            filteredHalls.map((hall) => (
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
            ))
          ) : (
            <Text style={styles.noMatch}>No matching dining halls</Text>
          )}
          <Text style={styles.subheading}>Food Trucks</Text>
          {filteredFoodTrucks.length > 0 ? (
            filteredFoodTrucks.map((truck) => (
              <View key={truck._id}>
                <FoodTruck
                  truck={truck}
                  isOpen={isFoodTruckOpen(truck, now)}
                  closeTime={isFoodTruckOpen(truck, now) ? getClosingTruckTime(truck, now) : null}
                  nextOpenTime={!isFoodTruckOpen(truck, now) ? getNextOpenTruckTime(truck, now) : null}
                  location="menus"
                  isFavorited={favoriteFoodTrucks.some((ft) => ft._id === truck._id)}
                />
              </View>
            ))
          ) : (
            <Text style={styles.noMatch}>No matching food trucks</Text>
          )}
      </View>
      );
    }
    // Normal view with sections
  return (
    <View>
      <Text style={styles.subheading}>Dining Halls</Text>
      {section.title === 'open now' ? openDiningHalls.map((hall) => (
        <View key={hall._id}>
          <DiningHall
            style={styles.diningHall}
            id={hall._id}
            name={hall.name}
            isOpen={true}
            closeTime={getClosingTime(hall, now)}
          />
        </View>
      )) : closedDiningHalls.map((hall) => (
        <View key={hall._id}>
          <DiningHall
            style={styles.diningHall}
            id={hall._id}
            name={hall.name}
            isOpen={false}
            nextOpenTime={getNextOpenTime(hall, now)}
          />
        </View>
      ))}
      <Text style={styles.subheading}>Food Trucks</Text>
      {section.title === 'open now' ? openFoodTrucks.map((truck) => (
          <FoodTruck 
            key={truck._id}
            truck={truck}
            isOpen={true}
            closeTime={getClosingTruckTime(truck, now)}
            location="menus"
            isFavorited={favoriteFoodTrucks.some((ft) => ft._id === truck._id)}
          />
      )) : closedFoodTrucks.map((truck) => (
          <FoodTruck 
            key={truck._id} 
            truck={truck} 
            isOpen={false}
            nextOpenTime={getNextOpenTruckTime(truck, now)}
            location="menus"
            isFavorited={favoriteFoodTrucks.some((ft) => ft._id === truck._id)}
          />
      ))}
    </View>
    );
  };

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
            placeholder="Search for a dining hall or truck..."
            onChangeText={searchFunc}
            value={searchValue}
            round
            containerStyle={styles.searchBar}
            platform="default"
            lightTheme
            searchIcon={{ name: 'search', size: 24 }}
            clearIcon={{ name: 'clear', size: 24 }}
          />
        </View>
        <SectionList
          contentContainerStyle={styles.sectionListContent}
          sections={searchValue.trim() !== '' ? [
            {
              title: 'search results',
              data: [{ id: 'search' }]
            }
          ] : [
            {
              title: 'Open Now',
              data: [{ id: 'open' }]
            },
            {
              title: 'Closed',
              data: [{ id: 'closed' }]
            }
          ]}
          stickySectionHeadersEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={renderContent}
          renderSectionHeader={({ section: { title } }) => (
            searchValue.trim() === '' ? (
              <View style={styles.section}>
                <Text style={styles.heading}>{title}</Text>
              </View>
            ) : null
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(248, 249, 252, 1)',
  },
  sectionListContent: {
    paddingHorizontal: 0,
  },
  section: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  subsection: {
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  title: {
    // fontWeight: '800',
    fontSize: 40,
    color: 'rgba(30, 55, 101, 1)',
    fontFamily: 'perpetua-bold-italic'
  },
  heading: {
    fontWeight: '700',
    fontSize: 30,
    fontFamily: 'perpetua-bold'
  },
  subheading: {
    width: '100%',
    fontSize: 23,
    color: 'rgba(30, 55, 101, 1)',
    fontFamily: 'Gill-Sans',
    fontWeight: '600',
    paddingLeft: 20,
    marginTop: 5,
  },
  padding: {
    paddingTop: 15,
  },
  diningHall: {
    width: '100%',
    marginVertical: 5,
  },
  placeholderContainer: {
    width: '100%',
    height: 60,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 0,
    marginBottom: 10,
  },
  noMatch: {
    fontSize: 15,
    fontFamily: 'Gill-Sans-Bold',
    alignSelf: 'center',
    padding: 10,
  },
});