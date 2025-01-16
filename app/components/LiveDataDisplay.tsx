import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SensorDataProps {
  moisture: number;
  gas: number;
  temperature: number;
  humidity: number;
  light: number;
}

const LiveDataDisplay: React.FC<SensorDataProps> = ({
  moisture,
  gas,
  temperature,
  humidity,
  light,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Sensor Data</Text>
      <View style={styles.dataRow}>
        <View style={styles.valueContainer}>
          <MaterialIcons name="opacity" size={20} color="#4fc3f7" />
          <Text style={styles.label}>Moist:</Text>
          <Text style={styles.value}> {moisture.toFixed(1)}%</Text>
        </View>
        <View style={styles.valueContainer}>
          <MaterialIcons name="cloud" size={20} color="#ff8a65" />
          <Text style={styles.label}>Gas:</Text>
          <Text style={styles.value}> {gas.toFixed(1)} ppm</Text>
        </View>
      </View>
      <View style={styles.dataRow}>
        <View style={styles.valueContainer}>
          <MaterialIcons name="thermostat" size={20} color="#ff7043" />
          <Text style={styles.label}>Temp:</Text>
          <Text style={styles.value}> {temperature.toFixed(1)}°C</Text>
        </View>
        <View style={styles.valueContainer}>
          <MaterialIcons name="water-drop" size={20} color="#4dd0e1" />
          <Text style={styles.label}>Hum:</Text>
          <Text style={styles.value}> {humidity.toFixed(1)}%</Text>
        </View>
      </View>
      <View style={styles.dataRow}>
        <View style={styles.valueContainer}>
          <MaterialIcons name="wb-sunny" size={20} color="#fbc02d" />
          <Text style={styles.label}>Light:</Text>
          <Text style={styles.value}> {light.toFixed(1)} lux</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2b2b2b',
    padding: 16,
    borderRadius: 12,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    color: '#e0e0e0',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: '#bdbdbd',
    marginLeft: 6,
  },
  value: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default LiveDataDisplay;
