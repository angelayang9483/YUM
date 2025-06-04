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
  const [now, setNow] = useState(new Date());
  const [searchValue, setSearchValue] = useState('');
  const [closedFoodTrucks, setClosedFoodTrucks] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [filteredFoodTrucks, setFilteredFoodTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrapingCheckDone, setIsScrapingCheckDone] = useState(false);
  const [isInitialDataFetchAttemptDone, setIsInitialDataFetchAttemptDone] = useState(false);
  const [favoriteFoodTrucks, setFavoriteFoodTrucks] = useState([]);


  const fetchFavoriteFoodTrucks = async () => {
    try {
      const response = await axios.get(`${url}/api/users/${user.userId}/favorite-trucks`);
      setFavoriteFoodTrucks(response.data.favoriteFoodTrucks);
      console.log('favorite food trucks:', favoriteFoodTrucks);
    } catch (err) {
      console.error('Error fetching favorite food trucks:', err.message);
      setError(err.message);
    }
  };
  useEffect(() => {
    fetchFavoriteFoodTrucks();
  }, [user]);

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

  function parseTime(timeString) {
    if (!timeString) return null;
    const parts = timeString.split(' ');
    const timePart = parts[0];
    const modifier = parts[1];
  
    let [hours, minutes] = timePart.split(':').map(Number);
  
    if (modifier) {
      if (modifier.toLowerCase() === 'p.m.' && hours !== 12) {
        hours += 12;
      } else if (modifier.toLowerCase() === 'a.m.' && hours === 12) {
        hours = 0;
      }
    }
    return { hours, minutes };
  }
  

  function isDiningHallOpen(hall, now) {
    if (!hall || !hall.hours || hall.hours.length === 0) {
      return false;
    }
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
  
    for (const period of hall.hours) {
      if (!period.label || !period.open || !period.close) continue;
  
      const openTime = parseTime(period.open);
      const closeTime = parseTime(period.close);
  
      if (!openTime || !closeTime) continue;
  
      if (closeTime.hours < openTime.hours || (closeTime.hours === openTime.hours && closeTime.minutes <= openTime.minutes)) {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) || 
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          return true;
        }
      } else {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) && 
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          return true;
        }
      }
    }
  
    return false;
  }

  function getClosingTime(hall, now) {
    if (!hall || !hall.hours || hall.hours.length === 0) {
      return 'N/A';
    }
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes(); // Get current minutes
  
    for (const period of hall.hours) {
      if (!period.label || !period.open || !period.close) continue;

      // Use parseTime for open and close times
      const openTime = parseTime(period.open);
      const closeTime = parseTime(period.close);

      if (!openTime || !closeTime) continue; // Skip if parsing failed
      
      // Check if current time falls within this period
      let isActivePeriod = false;
      if (closeTime.hours < openTime.hours || (closeTime.hours === openTime.hours && closeTime.minutes <= openTime.minutes)) { // Overnight period
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) || 
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          isActivePeriod = true;
        }
      } else { // Same day period
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) && 
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          isActivePeriod = true;
        }
      }

      if (isActivePeriod) {
        return period.close; // Return the original closing time string of the active period
      }
    }

    return 'N/A'; // No currently active period found
  }

  function getNextOpenTime(hall, now) {
    if (!hall || !hall.hours || !hall.hours.length === 0) {
      return 'N/A';
    }
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes(); // Get current minutes
    const currentTotalMinutes = currentHour * 60 + currentMinute; // Current time in minutes from midnight

    let nextOpenTimeStr = 'N/A';
    let minDiffToNextOpen = Infinity; // Stores the smallest difference in minutes to the next open time today
    let earliestOpenTimeTodayStr = 'N/A';
    let minMinutesForEarliestToday = Infinity; // Stores the earliest opening time of the day in minutes from midnight

    for (const period of hall.hours) {
      if (!period.label || !period.open || !period.close) continue;
  
      const openTime = parseTime(period.open);
      if (!openTime) continue; // Skip if parsing failed

      const periodOpenTotalMinutes = openTime.hours * 60 + openTime.minutes;

      // Track the absolute earliest opening time for the day
      if (periodOpenTotalMinutes < minMinutesForEarliestToday) {
        minMinutesForEarliestToday = periodOpenTotalMinutes;
        earliestOpenTimeTodayStr = period.open;
      }

      // If this period opens after the current time today
      if (periodOpenTotalMinutes > currentTotalMinutes) {
        const diff = periodOpenTotalMinutes - currentTotalMinutes;
        if (diff < minDiffToNextOpen) {
          minDiffToNextOpen = diff;
          nextOpenTimeStr = period.open;
        }
      }
    }
  
    // If no opening time found for later today, the next opening is the earliest one (implying next day)
    if (nextOpenTimeStr === 'N/A' && earliestOpenTimeTodayStr !== 'N/A') {
      return earliestOpenTimeTodayStr;
    }
  
    return nextOpenTimeStr;
  }

  function isFoodTruckOpen(truck, now) {
    if (!truck || !truck.hereToday || !truck.hours || !truck.hours.length) {
      return false;
    }
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
  
    for (const period of truck.hours) {
      if (!period.open || !period.close) continue;
      const openTime = parseTime(period.open);
      const closeTime = parseTime(period.close);
  
      if (!openTime || !closeTime) continue;
  
      if (closeTime.hours < openTime.hours || (closeTime.hours === openTime.hours && closeTime.minutes <= openTime.minutes)) {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) ||
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          return true;
        }
      } else {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) &&
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          return true;
        }
      }
    }
  
    return false;
  }

  function getClosingTruckTime(truck, now) {
    if (!isFoodTruckOpen(truck, now)) return null;
  
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
  
    for (const period of truck.hours) {
      if (!period.open || !period.close) continue;
  
      const openTime = parseTime(period.open);
      const closeTime = parseTime(period.close);
  
      if (!openTime || !closeTime) continue;
  
      let isOpenInThisPeriod = false;
      if (closeTime.hours < openTime.hours || (closeTime.hours === openTime.hours && closeTime.minutes <= openTime.minutes)) {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) ||
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          isOpenInThisPeriod = true;
        }
      } else {
        if ((currentHour > openTime.hours || (currentHour === openTime.hours && currentMinute >= openTime.minutes)) &&
            (currentHour < closeTime.hours || (currentHour === closeTime.hours && currentMinute < closeTime.minutes))) {
          isOpenInThisPeriod = true;
        }
      }
  
      if (isOpenInThisPeriod) {
        return period.close;
      }
    }
    return null;
  }

  function getNextOpenTruckTime(truck, now) {
    if (isFoodTruckOpen(truck, now) || !truck.hours || truck.hours.length === 0) return null;
  
    let nextOpenTimeStr = null;
    let minDiff = Infinity;
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  
    truck.hours.forEach(period => {
      if (!period.open) return;
  
      const openTime = parseTime(period.open);
      if (!openTime) return;
  
      let openTotalMinutes = openTime.hours * 60 + openTime.minutes;
      let diff = openTotalMinutes - currentTotalMinutes;
  
      if (diff < 0) {
        diff += 24 * 60;
      }
  
      if (diff < minDiff) {
        minDiff = diff;
        nextOpenTimeStr = period.open;
      }
    });
  
    return nextOpenTimeStr;
  }

  // get the dining halls and food trucks
  const getFoodTrucks = async () => {
    const response = await axios.get(`${url}/api/foodtrucks/here`);
    console.log("Food truck data response: ", response.data);
    console.log(response.data[0])
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
    setNow(new Date());
  
    const interval = setInterval(() => {
      setNow(new Date());
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
    const filtered = text.trim() === '' ? [] : 
      diningHalls.filter((hall) => 
        hall.name.toLowerCase().includes(text.toLowerCase().trim())
      );
    setFilteredHalls(filtered);
    const filteredFT = text.trim() === '' ? [] : 
      foodTrucks.filter((truck) => 
        truck.name.toLowerCase().includes(text.toLowerCase().trim())
      );
    setFilteredFoodTrucks(filteredFT);
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
                isOpen={isDiningHallOpen(hall, now)}
                closeTime={isDiningHallOpen(hall, now) ? getClosingTime(hall, now) : null}
                nextOpenTime={!isDiningHallOpen(hall, now) ? getNextOpenTime(hall, now) : null}
              />
            </View>
          ))}
          {filteredFoodTrucks.map((truck) => (
            <View key={truck._id}>
              <FoodTruck
                style={styles.foodTruck}
                onMenu={true}
                truck={truck}
                isOpen={isFoodTruckOpen(truck, now)}
                closeTime={isFoodTruckOpen(truck, now) ? getClosingTruckTime(truck, now) : null}
                nextOpenTime={!isFoodTruckOpen(truck, now) ? getNextOpenTruckTime(truck, now) : null}
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
        {section.title === 'Open Now' ? openFoodTrucks.map(truck => (
            <FoodTruck 
              key={truck._id}
              truck={truck}
              onMenu={true}
              isOpen={true}
              closeTime={getClosingTruckTime(truck, now)}
            />
        )) : closedFoodTrucks.map((truck) => (
            <FoodTruck 
              key={truck._id} 
              truck={truck} 
              onMenu={true}
              isOpen={false}
              nextOpenTime={getNextOpenTruckTime(truck, now)}
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
            searchIcon={{ name: 'search', size: 24 }}
            clearIcon={{ name: 'clear', size: 24 }}
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
  sectionListContent: {
    paddingHorizontal: 15,
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
