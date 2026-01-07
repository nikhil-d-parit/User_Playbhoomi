import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DividerWithText = ({ text = 'OR' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 25,
  },
  text: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#888',
    fontFamily: 'Inter_500Medium',
  },
});

export default DividerWithText;