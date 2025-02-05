import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Droplet, Thermometer, CloudRain, Sun } from "lucide-react-native";
import { PlantData, MetricCardProps } from "./types/types";
import { COLORS } from "./utils/constant";
import { collectDataSamples } from "./utils/randomDataGenerator";
import PlantMood from "./components/PlantMood";
import { MetricCard } from "./components/graph";
import {
  setupDatabase,
  insertData,
  fetchAllData,
  fetchFirstRow,
} from "./services/dbService";
import analyzePlantHealth from "./utils/Gemini";
// import { router } from "expo-router";
import MqttService from "./services/mqttService";

// Number of samples to collect before averaging (15 minutes: 180 samples at 5-second intervals)
const SAMPLES_BEFORE_AVERAGE = 180;
// Limit to store only the latest 6 averaged entries (adjust based on your needs)
const HISTORICAL_ENTRIES_LIMIT = 6;

const Index: React.FC = () => {
  const [useMqtt, setUseMqtt] = useState(false);

  const [currentData, setCurrentData] = useState<PlantData | null>({
    soilMoisture: 60,
    temperature: 20,
    humidity: 40,
    lightIntensity: 0,
    gasLevels: 120,
  });
  const [historicalData, setHistoricalData] = useState<PlantData[]>([
    {
      soilMoisture: 234,
      temperature: 30,
      humidity: 50,
      gasLevels: 40,
    },
    {
      soilMoisture: 39,
      temperature: 30,
      humidity: 10,
      gasLevels: 120,
    },
    {
      soilMoisture: 20,
      temperature: 23,
      humidity: 30,
      gasLevels: 120,
    },
  ]);
  const tempDataStorage = useRef<PlantData[]>([]);

  // For detecting hidden taps on PlantMood
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate the average for a list of samples
  const calculateAverage = (samples: PlantData[]): PlantData => {
    const sum = samples.reduce(
      (acc, curr) => ({
        soilMoisture: acc.soilMoisture + curr.soilMoisture,
        temperature: acc.temperature + curr.temperature,
        humidity: acc.humidity + curr.humidity,
        gasLevels: acc.gasLevels + curr.gasLevels,
      }),
      {
        soilMoisture: 0,
        temperature: 0,
        humidity: 0,
        gasLevels: 0,
      }
    );

    const count = samples.length;
    return {
      soilMoisture: parseFloat((sum.soilMoisture / count).toFixed(2)),
      temperature: parseFloat((sum.temperature / count).toFixed(2)),
      humidity: parseFloat((sum.humidity / count).toFixed(2)),
      gasLevels: parseFloat((sum.gasLevels / count).toFixed(2)),
    };
  };

  const collectMqttData = async () => {
    MqttService.setMessageCallback((message) => {
      if (message.destinationName === "esp8266/sensors") {
        try {
          const data = JSON.parse(message.payloadString);
          setCurrentData(data); // Update state immediately
        } catch (err) {
          console.error("Error parsing sensor JSON:", err);
        }
      }
    });
  };

  useEffect(() => {
    if (!MqttService.getIsConnected()) {
      MqttService.connect();
      collectMqttData();
    }
  }, [MqttService.getIsConnected()]);

  useEffect(() => {
    if (useMqtt) {
      collectMqttData();
    } else {
      const dataInterval = setInterval(async () => {
        const newData = await collectDataSamples();
        setCurrentData(newData);
        tempDataStorage.current.push(newData);

        if (tempDataStorage.current.length >= SAMPLES_BEFORE_AVERAGE) {
          const averageData = calculateAverage(tempDataStorage.current);
          const db = await setupDatabase();
          await insertData(db, {
            moisture: averageData.soilMoisture,
            temperature: averageData.temperature,
            humidity: averageData.humidity,
            gas: averageData.gasLevels,
          });

          const data = await fetchAllData(db);
          const mappedData = data.map((row: any) => ({
            soilMoisture: row.moisture,
            temperature: row.temperature,
            humidity: row.humidity,
            gasLevels: row.gas,
          }));

          setHistoricalData(mappedData.slice(-HISTORICAL_ENTRIES_LIMIT));
          tempDataStorage.current = []; // Reset the temporary storage
        }
      }, 5000);

      return () => clearInterval(dataInterval);
    }
  }, [useMqtt]);

  useEffect(() => {
    // Initialize the database with some sample data if it is empty.
    const initializeDatabaseWithSamples = async () => {
      try {
        const db = await setupDatabase();
        const newData = await fetchAllData(db);
        const mappedData = newData.map((row: any) => ({
          soilMoisture: row.moisture,
          temperature: row.temperature,
          humidity: row.humidity,
          gasLevels: row.gas,
        }));
        console.log("Fetched data:", newData);
        setHistoricalData(mappedData.slice(-HISTORICAL_ENTRIES_LIMIT));
      } catch (error) {
        console.error("Error initializing DB with samples:", error);
      }
    };
    initializeDatabaseWithSamples();
  }, []);

  // Show a loading state until we have at least one current data sample.
  if (!currentData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: COLORS.onSurface }}>Loading...</Text>
      </View>
    );
  }

  // Example usage with sensor data
  const [Result, setResult] = useState({
    current_plant_condition: "Good",
    suggestions: [
      "Maintain current soil moisture.",
      "Reduce humidity level to ideal.",
    ],
    interpretations: {
      soil_moisture: "Soil moisture is adequate.",
      gas_Level: "Gas Level is good for snake plant.",
      temperature: "Temperature is ideal for snake plants.",
      humidity: "Humidity is above average for snake plant.",
    },
  });

  const fetchGemni = async () => {
    const db = await setupDatabase();
    const data = await fetchFirstRow(db);
    const sensorData = {
      soilMoisture: data.moisture || currentData.soilMoisture, // in range 0-1000
      gasValue: data.gas || currentData.gasLevels, // MQ-135 gas reading
      temperature: data.temperature || currentData.temperature, // in Celsius
      humidity: data.humidity || currentData.humidity, // in percentage
      plantAge: "17 months", // age of the plant
      plantName: "Snake Plant", // name of the plant
    };
    const result = await analyzePlantHealth(sensorData);
    setResult(result);
  };

  useEffect(() => {
    fetchGemni();
  }, []);

  // Prepare the metrics for display.
  const metrics: MetricCardProps[] = [
    {
      id: "moisture",
      title: "Soil Moisture",
      value: `${currentData.soilMoisture}%`,
      icon: <Droplet color={COLORS.moisture} size={24} />,
      color: COLORS.moisture,
      data:
        historicalData.length > 0
          ? historicalData.map((d) => d.soilMoisture)
          : [],
      unit: "",
      AIResult: Result.interpretations.soil_moisture,
    },
    {
      id: "temperature",
      title: "Temperature",
      value: `${currentData.temperature}°C`,
      icon: <Thermometer color={COLORS.temperature} size={24} />,
      color: COLORS.temperature,
      data:
        historicalData.length > 0
          ? historicalData.map((d) => d.temperature)
          : [],
      unit: "°C",
      AIResult: Result.interpretations.temperature,
    },
    {
      id: "humidity",
      title: "Humidity",
      value: `${currentData.humidity}%`,
      icon: <CloudRain color={COLORS.humidity} size={24} />,
      color: COLORS.humidity,
      data:
        historicalData.length > 0 ? historicalData.map((d) => d.humidity) : [],
      unit: "%",
      AIResult: Result.interpretations.humidity,
    },
    {
      id: "Gas",
      title: "Gas Level",
      value: `${currentData.gasLevels} `,
      icon: <Sun color={COLORS.light} size={24} />,
      color: COLORS.light,
      data:
        historicalData.length > 0
          ? historicalData.map((d) => d.gasLevels)
          : [],
      unit: "ppm",
      AIResult: Result.interpretations.gas_Level,
    },
  ];

  // Handle taps on the PlantMood component
  const handlePlantMoodTap = () => {
    tapCountRef.current += 1;
    // Clear any existing timer
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }
    // Reset tap count if no further taps in 1 second
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1000);

    if (tapCountRef.current === 5) {
      setUseMqtt((prev) => {
        const newState = !prev;
        ToastAndroid.show(
          `MQTT ${newState ? "Started" : "Stopped"}`,
          ToastAndroid.SHORT
        );
        // For a little chuckle: even plants like a good toggle now and then!
        console.log("Plant tapped 5 times - toggling MQTT", newState);
        return newState;
      });
      tapCountRef.current = 0;
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        animated
      />
      <ScrollView contentContainerStyle={styles.Maincontainer}>
        <TouchableOpacity activeOpacity={0.8} onPress={handlePlantMoodTap}>
          <PlantMood
            moisture={currentData.soilMoisture}
            gas={currentData.gasLevels}
            temperature={currentData.temperature}
            humidity={currentData.humidity}
            light={currentData.lightIntensity}
            AIResult={Result}
          />
        </TouchableOpacity>
        {metrics.map((metric) => (
          <MetricCard
            id={metric.id}
            key={metric.id}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            data={metric.data}
            unit={metric.unit}
            AIResult={metric.AIResult}
          />
        ))}
        {/* The visible button has been removed in favor of the hidden tap on PlantMood */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Maincontainer: {
    paddingBottom: 80,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    width: "100%",
  },
});

export default Index;
