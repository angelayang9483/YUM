import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import DiningHall from '../components/diningHall.jsx';
import Line from '../components/line.jsx';
import config from '../config';

export default function Tab() {
  const url = config.BASE_URL;
  const router = useRouter();
  const [diningHalls, setDiningHalls] = useState([]);
  const [openDiningHalls, setOpenDiningHalls] = useState([]);
  const [closedDiningHalls, setClosedDiningHalls] = useState([]);
  const [time, setTime] = useState('');
  const [mealPeriod, setMealPeriod] = useState('none');
  const [loading, setLoading] = useState(true);

  const mealPeriodDict = {
    'Breakfast': 0,
    'Lunch': 1,
    'Dinner': 2,
    'Extended Dinner': 3
  };
  
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
    // console.log('Attempting to fetch dining hall data from:', `${url}/api/dininghalls/`);
    const response = await axios.get(`${url}/api/dininghalls`);
    console.log('Dining hall data response:', response.data);
    setDiningHalls(response.data);
  }

  const now = new Date();

  // test
  // const now = new Date(
  //   new Date().getFullYear(),  // year
  //   new Date().getMonth(),     // month (0-indexed)
  //   new Date().getDate(),      // day of the month
  //   13,                        // hour (1 PM)
  //   0,                         // minutes
  //   0,                         // seconds
  //   0                          // milliseconds
  // );

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
  
  useEffect(() => {
    getDiningHalls();
  }, []);  // Run once on mount

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
    if (!diningHalls || diningHalls.length === 0) return;
  
    const open = [];
    const closed = [];
  
    diningHalls.forEach(hall => {
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

  useEffect(() => {
    const checkScraping = async () => {
      let scraping = true;
      while (scraping) {
        try {
          const response = await axios.get(`${url}/scrape-status`);
          console.log(response.data);
          scraping = response.data.isScraping;
          if (!scraping) setLoading(false);
        } catch (err) {
          console.error('Error checking scraping status:', err);
          // Optional: fallback to hide loader after timeout
          setLoading(false);
          break;
        }
        await new Promise(res => setTimeout(res, 1000));
      }
    };

    checkScraping();
  }, []);
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading menu...</Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.padding}></Text>
        <Text style={styles.title}>Menus</Text>
      </View>

      <Line/>

      <View style={styles.section}>
        <Text style={styles.heading}>Open Now</Text>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Dining Halls</Text>
          {
            openDiningHalls.map(hall => (
              <DiningHall
                key={hall._id}
                id={hall._id}
                name={hall.name}
                isOpen={true}
                closeTime={                  
                  hall.hours[
                    mealPeriod === 'none'
                      ? null
                      : (mealPeriodDict[mealPeriod]) % mealPeriods.length
                  ]?.close || 'N/A'}
                nextOpenTime={null}
              />
            ))
          }
        </View>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Food Trucks</Text>
        </View>
      </View>

      <Line/>

      <View style={styles.section}>
        <Text style={styles.heading}>Closed</Text>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Dining Halls</Text>
          {
            closedDiningHalls.map(hall => (
              <DiningHall
                key={hall._id}
                id={hall._id}
                name={hall.name}
                isOpen={false}
                closeTime={null}
                nextOpenTime={
                  hall.hours[
                    mealPeriod === 'none'
                      ? getNextMealPeriodIndex(now, hall)
                      : (mealPeriodDict[mealPeriod] + 1) % mealPeriods.length
                  ]?.open || 'N/A'
                }
              />
            ))
          }
        </View>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Food Trucks</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  section: {
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  subsection: {
    paddingVertical: 5,
    paddingHorizontal: 5
  },
  title: {
    fontWeight: '800',
    fontSize: 30,
    color: 'rgba(0, 80, 157, 1)',
  },
  heading: {
    fontWeight: '700',
    fontSize: 25,
    color: 'rgba(0, 80, 157, 1)',
  },
  subheading: {
    fontWeight: '600',
    fontSize: 20,
    color: 'rgba(0, 80, 157, 1)',
  },
  padding: {
    paddingTop: 15
  },
  placeholderDiningHall: {
    backgroundColor: '#467FB6',
    width: '100%',
    height: 60,
    borderRadius: 10,
    marginTop: 10
  }
});
