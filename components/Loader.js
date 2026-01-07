import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator animating={true} size="large" color="#4CAF50" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  message: { marginTop: 12, fontSize: 16, color: '#333' },
});

export default Loader;
