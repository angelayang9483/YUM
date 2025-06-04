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
  const [openDiningHalls, setOpenDiningHalls] = useState([]);
  const [closedDiningHalls, setClosedDiningHalls] = useState([]);

  const [foodTrucks, setFoodTrucks] = useState([]);
  const [openFoodTrucks, setOpenFoodTrucks] = useState([]);
  const [closedFoodTrucks, setClosedFoodTrucks] = useState([]);

  const [now, setNow] = useState(new Date());

  const [mealPeriod, setMealPeriod] = useState('none');

  const [searchValue, setSearchValue] = useState('');
  const [filteredHalls, setFilteredHalls] = useState([]);

  const [loading, setLoading] = useState(true);

  const mealPeriodDict = {
    'Breakfast': 0,
    'Lunch': 1,
    'Dinner': 2,
    'Extended Dinner': 3,
  }
  
  const mealPeriods = ['Breakfast', 'Lunch', 'Dinner', 'Extended Dinner'];

  function getNextMealPeriodIndex( hall ) {
    const hours = now.getHours();
    
    for (let i = 0; i < mealPeriods.length; i++) {
      const period = mealPeriods[i];
      const matchingHours = hall.hours.find(p => p.label.toLowerCase().trim() === period.toLowerCase().trim());
      if (!matchingHours || !matchingHours.open) continue; // skip if this hall doesn't have that period
    
      let openHour = parseInt(matchingHours.open.split(':')[0], 10);
      if (matchingHours.open.toUpperCase().includes('P.M.') && openHour !== 12) {
        openHour += 12;
      }
  
      if (openHour > hours) {
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
  
  function isDiningHallOpen( hall ) {  
    const hours = now.getHours();

    if (!hall || !hall.hours || hall.hours.length === 0) {
      return false;
    }
    
    const todayString = now.toDateString();

    for (const period of hall.hours) {
      if (!period.label || !period.open || !period.close) continue;
  
      // Compare period label to mealPeriodMore actions
      if (period.label.toLowerCase().trim() !== mealPeriod.toLowerCase().trim()) continue;

      const openTimeString = period.open.replace(/\s*(a\.m\.|p\.m\.)$/i, ' $1').trim();
      const closeTimeString = period.close.replace(/\s*(a\.m\.|p\.m\.)$/i, ' $1').trim();
      console.log("closeTimeString: ", closeTimeString);

      let openTime = parseInt(openTimeString.split(':')[0], 10);
      if (/p\.m\./i.test(openTimeString) && openTime !== 12) openTime += 12;

      let closeTime = parseInt(closeTimeString.split(':')[0], 10);
      if (/p\.m\./i.test(closeTimeString) && closeTime !== 12) closeTime += 12;
      if (closeTimeString === "12:00 a.m.") closeTime = 24;

      console.log(`Checking: ${hall.name}, ${period.label}, ${openTime} - ${closeTime}`);
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
    if (mealPeriod === "Extended Dinner") return 'N/A'
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
      return (hall.hours[mealPeriodDict[mealPeriod]]?.close)
    }
  }

  // get the dining halls and food trucks
  const getFoodTrucks = async () => {
    const response = await axios.get(`${url}/api/foodtrucks/here`);
    console.log("Food truck data response: ", response.data);
    setFoodTrucks(response.data);
  }
  
  const isFoodTruckOpen = ( truck ) => {
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (!truck || !truck.hours || truck.hours.length === 0) {
      return false;
    }

    if (truck.hours[0].label === "Evening") {
      if (hours >= 17 && hours < 21) {
        if (hours === 20 && minutes >= 30) return false;
        return true;
      }
    } else if (truck.hours[0].label === "Late Night") {
      if (hours >= 21 || hours < 1) {
        return true;
      }
    }

    return false;
  }

  const getNextOpenTruckTime = ( truck ) => {
    const hours = now.getHours();

    if (!truck || !truck.hours || truck.hours.length === 0) {
      return false;
    }

    if (truck.hours[0].label === "Evening") {
      if (hours < 5) {
        return "5:00 p.m.";
      }
    } else if (truck.hours[0].label === "Late Night") {
      if (hours < 21) {
        return "9:00 p.m.";
      }
    }

    return "N/A";
  }

  const getClosingTruckTime = ( truck ) => {
    if (!truck || !truck.hours || truck.hours.length === 0) {
      return false;
    }

    if (truck.hours[0].label === "Evening") {
      return "8:30 p.m.";
    } else if (truck.hours[0].label === "Late Night") {
      return "12:00 a.m.";
    }
  }

  // display loading screen if it is still scraping info
  useEffect(() => {
    const checkScraping = async () => {
      let scraping = true;
      while (scraping) {
        try {
          const response = await axios.get(`${url}/scrape-status`);
          console.log(response.data);
          scraping = response.data.isScraping;
          // If we have data, don't keep waiting for scraping status
          if (!scraping || diningHalls.length > 0) {
            console.log('Data loaded or scraping complete, showing content');
            setLoading(false);
            break;  // Exit the loop once we have data
          }
        } catch (err) {
          console.log('Scraping status check error - checking if data is available');
          // If we have data despite scraping status error, show content
          if (diningHalls.length > 0) {
            console.log('Data available, showing content despite scraping error');
            setLoading(false);
            break;
          }
          await new Promise(res => setTimeout(res, 2000));
        }
        await new Promise(res => setTimeout(res, 1000));
      }
    };

    checkScraping();
  }, [diningHalls]);

  useEffect(() => {
    console.log('Getting dining halls');
    getDiningHalls();
    getFoodTrucks();
  }, []);

  // rechecks meal period every 30 minutesAdd commentMore actions
  useEffect(() => {
    const updateTimeAndMealPeriod = () => {
    const currentTime = new Date();
    setNow(currentTime);

    const hours = currentTime.getHours();

      const timeString = now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
      let currentPeriod = 'none';
      if (hours >= 0 && hours < 11) currentPeriod = 'Breakfast';
      else if (hours >= 11 && hours < 17) currentPeriod = 'Lunch';
      else if (hours >= 17 && hours < 22) currentPeriod = 'Dinner';
      else if (hours >= 21 || hours < 25) currentPeriod = 'Extended Dinner';

      setMealPeriod(currentPeriod);
    };

    updateTimeAndMealPeriod();

    const interval = setInterval(() => {
      updateTimeAndMealPeriod()
    }, 30 * 60 * 1000);
  
    return () => clearInterval(interval);
  }, []);

  // checks if dining halls are closed or open
  useEffect(() => {
    if (!diningHalls || diningHalls.length === 0 || !foodTrucks || foodTrucks.length === 0) {
      console.log('Waiting for dining halls data...');
      return;
    }
  
    console.log('Processing dining halls:', diningHalls);
    const openHalls = [];
    const closedHalls = [];
  
    diningHalls.forEach(hall => {
      console.log('Checking hall:', hall.name, 'for period:', mealPeriod);
      if (isDiningHallOpen(hall)) {
        openHalls.push(hall);
      } else {
        closedHalls.push(hall);
      }
    });

    console.log('Processing food trucks: ', foodTrucks);
    const openTrucks = [];
    const closedTrucks = [];

    foodTrucks.forEach(truck => {
      if (isFoodTruckOpen(truck)) {
        openTrucks.push(truck);
      } else {
        closedTrucks.push(truck);
      }
    })
  
    console.log('Open:', openHalls);
    setOpenDiningHalls(openHalls);
    setClosedDiningHalls(closedHalls);
    setOpenFoodTrucks(openTrucks);
    setClosedFoodTrucks(closedTrucks);
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
                isOpen={isDiningHallOpen(hall)}
                closeTime={isDiningHallOpen(hall) ? getClosingTime(hall) : null}
                nextOpenTime={!isDiningHallOpen(hall) ? getNextOpenTime(hall) : null}
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
              closeTime={getClosingTime(hall)}
            />
          </View>
        )) : closedDiningHalls.map((hall) => (
          <View key={hall._id}>
            <DiningHall
              style={styles.diningHall}
              id={hall._id}
              name={hall.name}
              isOpen={false}
              nextOpenTime={getNextOpenTime(hall)}
            />
          </View>
        ))}
        <Text style={styles.subheading}>Food Trucks</Text>
        {section.title === 'Open Now' ? openFoodTrucks.map((truck) => (
          <View key={truck._id}>
            <FoodTruck 
              key={truck._id} 
              truck={truck} 
              isOpen={true}
              closeTime={getClosingTruckTime(truck)}
              location={'menus'}
            />
          </View>
        )) : closedFoodTrucks.map((truck) => (
          <View key={truck._id}>
            <FoodTruck 
              key={truck._id} 
              truck={truck} 
              isOpen={false}
              nextOpenTime={getNextOpenTruckTime(truck)}
              location={'menus'}
            />
          </View>
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
  sectionListContent: {
    padding: 0
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
  },
});