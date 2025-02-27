import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Droplet, Thermometer, CloudRain, Sun } from "lucide-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

import { PlantData, MetricCardProps } from "./types/types";
import { COLORS } from "./utils/constant";
import { collectDataSamples } from "./utils/randomDataGenerator";
import { calculateAverage } from "./utils/average";
import {
  setupDatabase,
  insertData,
  fetchAllData,
  fetchFirstRow
} from "./services/dbService";
import { router } from "expo-router";
import { analyzePlantHealth } from "./utils/Gemini";
import MqttService from "./services/mqttService";

import PlantMood from "./components/PlantMood";
import { MetricCard } from "./components/graph";
import { Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Constants
const SAMPLES_BEFORE_AVERAGE = 180;
const HISTORICAL_ENTRIES_LIMIT = 6;

const HomeScreen: React.FC = () => {
  // State hooks
  const [useMqtt, setUseMqtt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState<PlantData | null>({
    soilMoisture: 60,
    temperature: 20,
    humidity: 40,
    lightIntensity: 0,
    gasLevels: 120
  });
  const [historicalData, setHistoricalData] = useState<PlantData[]>([]);
  const [result, setResult] = useState<{
    suggestions?: string[];
    current_plant_condition?: "Good" | "Average" | "Poor";
    interpretations?: Record<string, any>;
  }>({
    current_plant_condition: "Good",
    suggestions: [
      "Maintain current soil moisture.",
      "Reduce humidity level to ideal."
    ],
    interpretations: {
      soil_moisture: "Soil moisture is adequate.",
      gas_Level: "Gas Level is good for snake plant.",
      temperature: "Temperature is ideal for snake plants.",
      humidity: "Humidity is above average for snake plant."
    }
  });

  // Refs for temporary data and tap detection
  const tempDataStorage = useRef<PlantData[]>([]);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // MQTT data collection
  const collectMqttData = async () => {
    MqttService.setMessageCallback((message) => {
      if (message.destinationName === "esp8266/sensors") {
        try {
          const data = JSON.parse(message.payloadString);
          setCurrentData(data);
        } catch (err) {
          console.error("Error parsing sensor JSON:", err);
        }
      }
    });
  };

  // MQTT connection effect
  useEffect(() => {
    if (!MqttService.getIsConnected()) {
      MqttService.connect();
      collectMqttData();
    }
  }, []);

  // Sensor data collection (non-MQTT)
  useEffect(() => {
    if (!useMqtt) {
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
            gas: averageData.gasLevels
          });

          const data = await fetchAllData(db);
          const mappedData = data.map((row: any) => ({
            soilMoisture: row.moisture,
            temperature: row.temperature,
            humidity: row.humidity,
            gasLevels: row.gas
          }));

          setHistoricalData(mappedData.slice(-HISTORICAL_ENTRIES_LIMIT));
          tempDataStorage.current = [];
        }
      }, 5000);

      return () => clearInterval(dataInterval);
    } else {
      collectMqttData();
    }
  }, [useMqtt]);

  // Initialize historical data from the database
  useEffect(() => {
    const initializeDatabaseWithSamples = async () => {
      try {
        const db = await setupDatabase();
        const newData = await fetchAllData(db);
        const mappedData = newData.map((row: any) => ({
          soilMoisture: row.moisture,
          temperature: row.temperature,
          humidity: row.humidity,
          gasLevels: row.gas
        }));
        setHistoricalData(mappedData.slice(-HISTORICAL_ENTRIES_LIMIT));
      } catch (error) {
        console.error("Error initializing DB with samples:", error);
      }
    };
    initializeDatabaseWithSamples();
  }, []);

  // Gemini analysis fetch
  const fetchGemini = async () => {
    try {
      setLoading(true);
      const db = await setupDatabase();
      const data = await fetchFirstRow(db);
      const sensorData = {
        soilMoisture: data.moisture || currentData?.soilMoisture,
        gasValue: data.gas || currentData?.gasLevels,
        temperature: data.temperature || currentData?.temperature,
        humidity: data.humidity || currentData?.humidity,
        plantAge: "17 months",
        plantName: "Snake Plant"
      };
      // const geminiResult = await analyzePlantHealth(sensorData);
      // setResult(geminiResult);
    } catch (error) {
      console.error("Error fetching Gemini Response:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGemini();
  }, []);

  // Handle PlantMood taps to toggle MQTT
  const handlePlantMoodTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }
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
        console.log("Plant tapped 5 times - toggling MQTT", newState);
        return newState;
      });
      tapCountRef.current = 0;
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    }
  };

  if (!currentData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: COLORS.onSurface }}>Loading...</Text>
      </View>
    );
  }

  // Prepare metric cards data
  const metrics: MetricCardProps[] = [
    {
      id: "moisture",
      title: "Soil Moisture",
      value: `${currentData.soilMoisture}`,
      icon: <Droplet color={COLORS.moisture} size={24} />,
      color: COLORS.moisture,
      data: historicalData.map((d) => d.soilMoisture),
      unit: "",
      AIResult: result.interpretations?.soil_moisture
    },
    {
      id: "temperature",
      title: "Temperature",
      value: `${currentData.temperature}°C`,
      icon: <Thermometer color={COLORS.temperature} size={24} />,
      color: COLORS.temperature,
      data: historicalData.map((d) => d.temperature),
      unit: "°C",
      AIResult: result.interpretations?.temperature
    },
    {
      id: "humidity",
      title: "Humidity",
      value: `${currentData.humidity}%`,
      icon: <CloudRain color={COLORS.humidity} size={24} />,
      color: COLORS.humidity,
      data: historicalData.map((d) => d.humidity),
      unit: "%",
      AIResult: result.interpretations?.humidity
    },
    {
      id: "gas",
      title: "Gas Level",
      value: `${currentData.gasLevels}`,
      icon: <Sun color={COLORS.light} size={24} />,
      color: COLORS.light,
      data: historicalData.map((d) => d.gasLevels),
      unit: "ppm",
      AIResult: result.interpretations?.gas_Level
    }
  ];

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
            AIResult={result}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.CameraButton}
          onPress={() => router.push("Camera")}
        >
          <View style={styles.content}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.text}>ScanPlant</Text>
          </View>
        </TouchableOpacity>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            id={metric.id}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            data={metric.data}
            unit={metric.unit}
            AIResult={metric.AIResult}
          />
        ))}
        <View style={styles.ReloadContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={fetchGemini}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <AntDesign name="reload1" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Maincontainer: {
    paddingBottom: 80
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  centered: {
    justifyContent: "center",
    alignItems: "center"
  },
  button: {
    backgroundColor: "#1E1E1E",
    padding: 14,
    borderRadius: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  ReloadContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20
  },
  CameraButton: {
    backgroundColor: "#1a1a1a", // dark background
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal:40

  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16
  }
});

export default HomeScreen;
