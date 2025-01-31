import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Droplet, Thermometer, CloudRain, Sun } from "lucide-react-native";
import { PlantData, MetricCardProps } from "./types/types";
import { COLORS } from "./utils/constant";
import { collectDataSamples } from "./utils/randomDataGenerator";
import PlantMood from "./components/PlantMood";
import { MetricCard } from "./components/graph";
import { setupDatabase, insertData, fetchAllData } from "./services/dbService";
import analyzePlantHealth from "./utils/Gemini";
// Number of samples to collect before averaging (5 minutes = 300 seconds = 60 samples at 5-second intervals)
const SAMPLES_BEFORE_AVERAGE = 180; // 15 minutes (180 samples at 5-second intervals)
const HISTORICAL_ENTRIES_LIMIT = 32; // Store last 8 hours (32 x 15-min intervals)
const index: React.FC = () => {
  const [currentData, setCurrentData] = useState<PlantData | null>(null);
  const [historicalData, setHistoricalData] = useState<PlantData[]>([]);
  const tempDataStorage = useRef<PlantData[]>([]);

  const calculateAverage = (samples: PlantData[]): PlantData => {
    const sum = samples.reduce(
      (acc, curr) => ({
        soilMoisture: acc.soilMoisture + curr.soilMoisture,
        temperature: acc.temperature + curr.temperature,
        humidity: acc.humidity + curr.humidity,
        lightIntensity: acc.lightIntensity + curr.lightIntensity,
        gasLevels: acc.gasLevels + curr.gasLevels,
      }),
      {
        soilMoisture: 0,
        temperature: 0,
        humidity: 0,
        lightIntensity: 0,
        gasLevels: 0,
      }
    );

    const count = samples.length;
    return {
      soilMoisture: parseFloat((sum.soilMoisture / count).toFixed(2)),
      temperature: parseFloat((sum.temperature / count).toFixed(2)),
      humidity: parseFloat((sum.humidity / count).toFixed(2)),
      lightIntensity: parseFloat((sum.lightIntensity / count).toFixed(2)),
      gasLevels: parseFloat((sum.gasLevels / count).toFixed(2)),
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (tempDataStorage.current.length >= SAMPLES_BEFORE_AVERAGE) {
        const averageData = calculateAverage(tempDataStorage.current);

        try {
          const db = await setupDatabase(); // Get the database instance
          await insertData(db, {
            // Pass the instance to insertData
            moisture: averageData.soilMoisture,
            gas: averageData.gasLevels,
            temperature: averageData.temperature,
            humidity: averageData.humidity,
            light: averageData.lightIntensity,
          });

          const data = await fetchAllData(db); // Pass the instance to fetchAllData
          const mappedData = data.map((row) => ({
            soilMoisture: row.moisture,
            temperature: row.temperature,
            humidity: row.humidity,
            lightIntensity: row.light,
            gasLevels: row.gas,
          }));
          setHistoricalData(mappedData.slice(-HISTORICAL_ENTRIES_LIMIT));
        } catch (error) {
          console.error("Error storing data:", error);
        }

        tempDataStorage.current = [];
      }

      // Update fetchAllData in dbService.ts to include ordering:

      const collectData = async () => {
        const newData = await collectDataSamples();
        setCurrentData(newData);

        tempDataStorage.current.push(newData);

        if (tempDataStorage.current.length >= SAMPLES_BEFORE_AVERAGE) {
          const averageData = calculateAverage(tempDataStorage.current);

          try {
            await insertData(setupDatabase, {
              moisture: averageData.soilMoisture,
              temperature: averageData.temperature,
              humidity: averageData.humidity,
              light: averageData.lightIntensity,
              gas: averageData.gasLevels,
            });
            console.log("Stored 15-min average data");

            const data = await fetchAllData(setupDatabase);
            setHistoricalData(data.slice(-HISTORICAL_ENTRIES_LIMIT));
          } catch (error) {
            console.error("Error storing data:", error);
          }

          tempDataStorage.current = [];
        }
      };

      const dataInterval = setInterval(collectData, 5000);
      return () => clearInterval(dataInterval);
    };
    // In the useEffect's collectData function:
    fetchData();
  }, []);

  if (!currentData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: COLORS.onSurface }}>Loading...</Text>
      </View>
    );
  }

  const metrics = [
    {
      id: "moisture",
      title: "Soil Moisture",
      value: `${currentData.soilMoisture}%`,
      icon: <Droplet color={COLORS.moisture} size={24} />,
      color: COLORS.moisture,
      data:
        historicalData && historicalData.length > 0
          ? historicalData.map((d) => d.soilMoisture)
          : [],
      unit: "%",
    },
    {
      id: "temperature",
      title: "Temperature",
      value: `${currentData.temperature}°C`,
      icon: <Thermometer color={COLORS.temperature} size={24} />,
      color: COLORS.temperature,
      data:
        historicalData && historicalData.length > 0
          ? historicalData.map((d) => d.temperature)
          : [],
      unit: "°C",
    },
    {
      id: "humidity",
      title: "Humidity",
      value: `${currentData.humidity}%`,
      icon: <CloudRain color={COLORS.humidity} size={24} />,
      color: COLORS.humidity,
      data:
        historicalData && historicalData.length > 0
          ? historicalData.map((d) => d.humidity)
          : [],
      unit: "%",
    },
    {
      id: "light",
      title: "Light Intensity",
      value: `${currentData.lightIntensity} lux`,
      icon: <Sun color={COLORS.light} size={24} />,
      color: COLORS.light,
      data:
        historicalData && historicalData.length > 0
          ? historicalData.map((d) => d.lightIntensity)
          : [],
      unit: " lux",
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
    justifyContent: "center",
    alignItems: "center",
  },
});

export default index;
