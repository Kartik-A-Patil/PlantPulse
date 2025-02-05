import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Animated,
} from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import MqttService from "../services/mqttService";
import { insertData, setupDatabase } from "../services/dbService";
import { collectDataSamples } from "../utils/randomDataGenerator";

const MotorControl: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<any>(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [motorRunning, setMotorRunning] = useState(false);
  // Animated value for button press effect
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Function to animate button when pressed
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // MQTT sensor callback
  useEffect(() => {
    MqttService.setMessageCallback((message) => {
      if (message.destinationName === "esp8266/sensors") {
        try {
          const data = JSON.parse(message.payloadString);
          setCurrentData(data);
          // Note: We're managing motorRunning based on our own commands.
        } catch (err) {
          console.error("Error parsing sensor JSON:", err);
        }
      }
    });
  }, []);

  // Auto mode logic: when auto mode is enabled, check soil moisture from sensor data
  useEffect(() => {
    if (isAutoMode && currentData?.soilMoisture !== undefined) {
      const moisture = currentData.soilMoisture;
      // If moisture is high (>700) and motor is off, then turn it on
      if (moisture > 700 && !motorRunning) {
        sendControlCommand("MOTOR_ON");
      }
      // If moisture is low (<=500) and motor is on, then turn it off
      else if (moisture <= 500 && motorRunning) {
        sendControlCommand("MOTOR_OFF");
      }
    }
  }, [isAutoMode, currentData, motorRunning]);

  const sendControlCommand = (command: string) => {
    setCurrentCommand(command);
    MqttService.publishMessage("esp8266/control", command);
    if (command === "MOTOR_ON") {
      setMotorRunning(true);
    } else if (command === "MOTOR_OFF") {
      setMotorRunning(false);
    }
  };

  // Manual control options with emojis
  const manualControlOptions = [
    {
      label: "Turn Motor ON",
      value: "MOTOR_ON",
      disabled: isAutoMode || motorRunning,
    },
    {
      label: "Turn Motor OFF",
      value: "MOTOR_OFF",
      disabled: isAutoMode || !motorRunning,
    },
  ];

  const insertSampleData = async () => {
    const db = await setupDatabase();
    for (let i = 0; i < 6; i++) {
      const sample = await collectDataSamples();
      await insertData(db, {
        moisture: sample.soilMoisture,
        temperature: sample.temperature,
        humidity: sample.humidity,
        gas: sample.gasLevels,
      });
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.iconButton}
      >
        <Entypo name="flow-branch" size={28} color="white" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Control Panel</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close-circle-outline" size={32} color="#aaa" />
              </TouchableOpacity>
            </View>

            {/* Auto mode toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Auto Mode </Text>
              <Switch
                value={isAutoMode}
                onValueChange={setIsAutoMode}
                thumbColor={isAutoMode ? "#0A84FF" : "#FFF"}
                style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.2 }] }}
              />
            </View>

            <View style={styles.controlContainer}>
              {manualControlOptions.map((option) => (
                <Animated.View
                  key={option.value}
                  style={{ transform: [{ scale: scaleAnim }] }}
                >
                  <TouchableOpacity
                    style={[
                      styles.radioContainer,
                      // Highlight the active button if the motor is running and it's the ON command
                      motorRunning && option.value === "MOTOR_ON"
                        ? styles.activeButton
                        : {},
                      option.disabled && styles.disabledButton,
                    ]}
                    onPress={() => {
                      animateButton();
                      sendControlCommand(option.value);
                    }}
                    disabled={option.disabled}
                  >
                    <Text
                      style={[
                        styles.radioLabel,
                        option.disabled && styles.disabledText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.sampleDataButton}
              onPress={insertSampleData}
            >
              <Text style={styles.sampleDataButtonText}>
                Insert Sample Data (6 rows)
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: { padding: 10, alignSelf: "flex-end" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  closeButton: {
    padding: 5,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 18,
    color: "#FFF",
  },
  controlContainer: {
    backgroundColor: "#252525",
    borderRadius: 30,
    padding: 15,
    marginBottom: 20,
  },
  radioContainer: {
    paddingVertical: 12,
    marginVertical: 4,
    alignItems: "center",
    backgroundColor: "#444",
    borderRadius: 40,
  },
  radioLabel: {
    fontSize: 16,
    color: "#FFF",
  },
  activeButton: {
    backgroundColor: "#28a745", // Green for active motor
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#333",
  },
  disabledText: {
    color: "#DDD",
  },
  sampleDataButton: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sampleDataButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default MotorControl;
