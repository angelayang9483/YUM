import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useState, useEffect } from 'react';

const Post = ({ restaurant, review }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{restaurant}</Text>
      <Text style={styles.body}>{review}</Text>
    </View>
  );
};

export default Post;

const styles = StyleSheet.create ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(70, 127, 182, 1)',
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  body: {
    textAlign: 'left',
    width: '50%',
    color: 'white',
  }
})