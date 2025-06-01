import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Line from '../components/line.jsx';

export default function Tab() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.padding}></Text>
        <Text style={styles.title}>Favorites</Text>
      </View>

      <Line/>

      <View style={styles.section}>
        <Text style={styles.heading}>Open Now</Text>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Dining Halls</Text>
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
