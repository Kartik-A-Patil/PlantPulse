import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Droplet, Thermometer, CloudRain, Sun, Smile, Frown, Meh,
  TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react-native';
import { PlantData, MetricCardProps } from './types/types';
import { COLORS ,chartConfig} from './utils/constant';
import { collectDataSamples } from './utils/randomDataGenerator';
import  PlantMood  from './components/PlantMood';
import { MetricCard } from './components/graph';
import {createTable,fetchData} from './services/dbService';
const PlantMonitoringScreen: React.FC = () => {
  const [currentData, setCurrentData] = useState<PlantData | null>(null);
  const [historicalData, setHistoricalData] = useState<PlantData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const newData = await collectDataSamples();
      const dbData = await fetchData();
      setCurrentData(newData);
      setHistoricalData(prev => [...prev, newData].slice(-20));
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  
  if (!currentData || !historicalData.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: COLORS.onSurface }}>Loading...</Text>
      </View>
    );
  }

  const metrics = [
    {
      id: 'moisture',
      title: 'Soil Moisture',
      value: `${currentData.soilMoisture}%`,
      icon: <Droplet color={COLORS.moisture} size={24} />,
      color: COLORS.moisture,
      data: historicalData.map(d => d.soilMoisture),
      unit: '%',
    },
    {
      id: 'temperature',
      title: 'Temperature',
      value: `${currentData.temperature}°C`,
      icon: <Thermometer color={COLORS.temperature} size={24} />,
      color: COLORS.temperature,
      data: historicalData.map(d => d.temperature),
      unit: '°C',
    },
    {
      id: 'humidity',
      title: 'Humidity',
      value: `${currentData.humidity}%`,
      icon: <CloudRain color={COLORS.humidity} size={24} />,
      color: COLORS.humidity,
      data: historicalData.map(d => d.humidity),
      unit: '%',
    },
    {
      id: 'light',
      title: 'Light Intensity',
      value: `${currentData.lightIntensity} lux`,
      icon: <Sun color={COLORS.light} size={24} />,
      color: COLORS.light,
      data: historicalData.map(d => d.lightIntensity),
      unit: ' lux',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <PlantMood 
          moisture={currentData.soilMoisture}
          gas={currentData.gasLevels}
          temperature={currentData.temperature}
          humidity={currentData.humidity}
          light={currentData.lightIntensity}
        />
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            data={metric.data}
            unit={metric.unit}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    margin: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statusIconContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: `${COLORS.primary}10`,
    padding: 12,
    borderRadius: 12,
  },
  trendText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  overviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    margin: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    margin: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 12,
    borderRadius: 12,
  },
  metricHeaderText: {
    marginLeft: 12,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
  },
  chartWrapper: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
  },
});

export default PlantMonitoringScreen;