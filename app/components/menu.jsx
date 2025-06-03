import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const Menu = ({ visible, onClose, content }) => {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: height / 2, // Slide to half the screen
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height, // Slide off the screen
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
      <Text style={styles.text}>{content}</Text>
      <Pressable onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height / 2, // covers half of the screen
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    elevation: 5,
    zIndex: 10
  },
  text: {
    fontSize: 18,
    color: 'black'
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#467FB6',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center'
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default Menu;
