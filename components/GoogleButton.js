
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';

let googleIcon = require('../assets/google.png')

const GoogleButton = ({ onPress, disabled }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.disabledButton]} 
      activeOpacity={0.8} 
      onPress={onPress}
      disabled={disabled}
    >
      <Image
        source={googleIcon}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.text}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    alignSelf: 'stretch'
  },
  disabledButton: {
    opacity: 0.6,
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  text: {
    color: "#1E1E1E",
    fontSize: 16,
    fontFamily:'Inter_400Regular'
  },
});

export default GoogleButton;
