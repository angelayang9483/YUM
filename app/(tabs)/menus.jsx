import axios from 'axios';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SearchBar } from 'react-native-elements';
import DiningHall from '../components/diningHall.jsx';
import FoodTruck from '../components/foodTruck.jsx';
import config from '../config';
import { AuthContext } from '../context/AuthContext';

export default function Tab() {
  const url = config.BASE_URL;
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [diningHalls, setDiningHalls] = useState([]);
  const [openFoodTrucks, setOpenFoodTrucks] = useState([]);
  const [foodTrucks, setFoodTrucks] = useState([]);
  const [openDiningHalls, setOpenDiningHalls] = useState([]);
  const [closedDiningHalls, setClosedDiningHalls] = useState([]);
  const [time, setTime] = useState('');
  const [mealPeriod, setMealPeriod] = useState('none');
  const [searchValue, setSearchValue] = useState('');
  const [closedFoodTrucks, setClosedFoodTrucks] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrapingCheckDone, setIsScrapingCheckDone] = useState(false);
  const [isInitialDataFetchAttemptDone, setIsInitialDataFetchAttemptDone] = useState(false);

  const mealPeriodDict = {
    'Breakfast': 0,
    'Lunch': 1,
    'Dinner': 2,
    'Extended Dinner': 3,
  }
  
  const mealPeriods = ['Breakfast', 'Lunch', 'Dinner', 'Extended Dinner'];

  function getNextMealPeriodIndex(now, hall) {
    const nowHour = now.getHours();
    
    for (let i = 0; i < mealPeriods.length; i++) {
      const period = mealPeriods[i];
      const matchingHours = hall.hours.find(p => p.label.toLowerCase().trim() === period.toLowerCase().trim());
      if (!matchingHours || !matchingHours.open) continue; // skip if this hall doesn't have that period
    
      let openHour = parseInt(matchingHours.open.split(':')[0], 10);
      if (matchingHours.open.toUpperCase().includes('PM') && openHour !== 12) {
        openHour += 12;
      }
  
      if (openHour > nowHour) {
        return i;
      }
    }
  
    // if nothing found, loop back to the first meal period
    return 0;
  }

  const getDiningHalls = async () => {
    try {
      const response = await axios.get(`${url}/api/dininghalls`);
      console.log('Dining halls data received:', response.data?.length || 0, 'halls');
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid dining halls data format:', response.data);
        return;
      }
      
      setDiningHalls(response.data);
    } catch (error) {
      console.error('Error fetching dining halls:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  const now = new Date();
  

  function isDiningHallOpen(hall, mealPeriod, now) {
    if (!hall || !hall.hours || hall.hours.length === 0) {
      return false;
    }
  
    const todayString = now.toDateString();
    const hours = now.getHours();
  
    for (const period of hall.hours) {
      if (!period.label || !period.open || !period.close) continue;
  
      // Compare period label to mealPeriod
      if (period.label.toLowerCase().trim() !== mealPeriod.toLowerCase().trim()) continue;
  
      const openTimeString = period.open.replace(/\s*(a\.m\.|p\.m\.)$/i, ' $1').trim();
      const closeTimeString = period.close.replace(/\s*(a\.m\.|p\.m\.)$/i, ' $1').trim();
  
      let openTime = parseInt(openTimeString.split(':')[0], 10);
      if (/p\.m\./i.test(openTimeString) && openTime !== 12) openTime += 12;
  
      let closeTime = parseInt(closeTimeString.split(':')[0], 10);
      if (/p\.m\./i.test(closeTimeString) && closeTime !== 12) closeTime += 12;
  
      console.log('Checking: ${hall.name}, ${period.label}, ${openTime} - ${closeTime}');
      console.log(hours);
      console.log(closeTime);
  
      if (hours >= openTime && hours < closeTime) {
        console.log('here');
        return true;
      }
    }
  
    return false;
  }  

  function getNextOpenTime( hall ) {
    let nextIndex = getNextMealPeriodIndex( hall );
    let nextTime = hall.hours[ nextIndex ]
    // console.log(`NEXT TIME FOR ${hall.name}: `, nextTime.open);
    return (
      nextTime?.open || 'N/A'
    )
  }

  function getClosingTime ( hall ) {
    // check for extended dinner
    if ( mealPeriod === "Dinner" && hall.hours[3].open ) {
      return hall.hours[3].close;
    }
    else {
      return (
        hall.hours[
          mealPeriod === 'none'
            ? null
            : (mealPeriodDict[mealPeriod]) % mealPeriods.length
        ]?.close || 'N/A'
      )
    }
  }

  // get the dining halls and food trucks
  const getFoodTrucks = async () => {
    const response = await axios.get(`${url}/api/foodtrucks/here`);
    console.log("Food truck data response: ", response.data);
    setFoodTrucks(response.data);
  }
  
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
        getDiningHalls(), // Assumes getDiningHalls updates its own state and handles its errors
        getFoodTrucks()   // Assumes getFoodTrucks updates its own state and handles its errors
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
    const hours = now.getHours();
  
    const timeString = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    setTime(timeString);
  
    let currentPeriod = 'none';
    if (hours >= 7 && hours < 10) currentPeriod = 'Breakfast';
    else if (hours >= 11 && hours < 16) currentPeriod = 'Lunch';
    else if (hours >= 17 && hours < 21) currentPeriod = 'Dinner';
    else if (hours >= 21 && hours < 24) currentPeriod = 'Extended Dinner';
  
    setMealPeriod(currentPeriod);
  
    const interval = setInterval(() => {
      // re-run the time update logic every 30 minutes
      const now = new Date();
      const hours = now.getHours();
  
      const timeString = now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
      setTime(timeString);
  
      let currentPeriod = '';
      if (hours >= 7 && hours < 10) currentPeriod = 'Breakfast';
      else if (hours >= 11 && hours < 16) currentPeriod = 'Lunch';
      else if (hours >= 17 && hours < 21) currentPeriod = 'Dinner';
      else if (hours >= 21 && hours < 24) currentPeriod = 'Extended Dinner';
  
      setMealPeriod(currentPeriod);
    }, 30 * 60 * 1000);
  
    return () => clearInterval(interval);
  }, []);
  
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
      console.log('Checking hall:', hall.name, 'for period:', mealPeriod);
      if (isDiningHallOpen(hall, mealPeriod, now)) {
        open.push(hall);
      } else {
        closed.push(hall);
      }
    });
  
    console.log('Open:', open);
    setOpenDiningHalls(open);
    setClosedDiningHalls(closed);
  }, [diningHalls, mealPeriod]);

  
  const searchFunc = (text) => {
    setSearchValue(text);
    const filtered = text.trim() === '' ? [] : 
      diningHalls.filter((hall) => 
        hall.name.toLowerCase().includes(text.toLowerCase().trim())
      );
    setFilteredHalls(filtered);
  };

  // Add logging to render function
  const renderContent = ({ item, section }) => {
    // If searching, show only filtered results without sections
    if (searchValue.trim() !== '') {
      return (
        <View>
          <Text style={styles.subheading}>Search Results</Text>
          {filteredHalls.map((hall) => (
            <View key={hall._id}>
              <DiningHall
                style={styles.diningHall}
                id={hall._id}
                name={hall.name}
                isOpen={isDiningHallOpen(hall, mealPeriod, now)}
                closeTime={isDiningHallOpen(hall, mealPeriod, now) ? hall.hours[mealPeriodDict[mealPeriod]]?.close : null}
                nextOpenTime={!isDiningHallOpen(hall, mealPeriod, now) ? hall.hours[getNextMealPeriodIndex(now, hall)]?.open : null}
              />
            </View>
          ))}
        </View>
      );
    }

    // Normal view with sections
    return (
      <View>
        <Text style={styles.subheading}>Dining Halls</Text>
        {section.title === 'Open Now' ? openDiningHalls.map((hall) => (
          <View key={hall._id}>
            <DiningHall
              style={styles.diningHall}
              id={hall._id}
              name={hall.name}
              isOpen={true}
              closeTime={hall.hours[mealPeriodDict[mealPeriod]]?.close}
            />
          </View>
        )) : closedDiningHalls.map((hall) => (
          <View key={hall._id}>
            <DiningHall
              style={styles.diningHall}
              id={hall._id}
              name={hall.name}
              isOpen={false}
              nextOpenTime={hall.hours[getNextMealPeriodIndex(now, hall)]?.open}
            />
          </View>
        ))}
        <Text style={styles.subheading}>Food Trucks</Text>
        {
          foodTrucks.map(truck => (
            <FoodTruck 
              key={truck._id} 
              truck={truck} 
            />
          ))
        }
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
        // <Text style={styles.heading}>Open Now</Text>
        // <View style={styles.subsection}>
        //   <Text style={styles.subheading}>Dining Halls</Text>
        //   {
        //     openDiningHalls.map(hall => (
        //       <DiningHall
        //         key={hall._id}
        //         name={hall.name}
        //         isOpen={true}
        //         closeTime={ getClosingTime(hall) }
        //         nextOpenTime={null}
        //       />
        //     ))
        //   }
        // </View>
        // <View style={styles.subsection}>
        //   <Text style={styles.subheading}>Food Trucks</Text>
          // {
          //   foodTrucks.map(truck => (
          //     <FoodTruck 
          //       key={truck._id} 
          //       truck={truck} 
          //     />
          //   ))
          // }
        // </View>
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.section}>
          <Text style={styles.padding}></Text>
          <Text style={styles.title}>Menus</Text>
          <SearchBar
            placeholder="Type here ..."
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
          sections={searchValue.trim() !== '' ? [
            {
              title: 'Search Results',
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
    backgroundColor: 'white',
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
    fontWeight: '800',
    fontSize: 30,
    color: 'rgba(0, 80, 157, 1)',
    paddingHorizontal: 15,
  },
  heading: {
    fontWeight: '700',
    fontSize: 25,
    color: 'rgba(0, 80, 157, 1)',
  },
  subheading: {
    width: '100%',
    fontWeight: '600',
    fontSize: 20,
    color: 'rgba(0, 80, 157, 1)',
    paddingLeft: 20,
    marginBottom: 10,
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
    backgroundColor: 'white',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    paddingHorizontal: 0,
    marginBottom: 10,
  },
});
