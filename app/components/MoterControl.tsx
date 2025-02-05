import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from "react-native";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import MqttService from "../services/mqttService";
import { insertData, setupDatabase } from "../services/dbService";
import { collectDataSamples } from "../utils/randomDataGenerator";
import { Stack } from "expo-router";
import MoterControl from "../components/MoterControl";
const MotorControl: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<"manual" | "auto">("manual");
  const [CurrentData, setCurrentData] = useState<any>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [localState, setLocalState] = useState<{
    isAutoMode: boolean;
    isMotorRunning: boolean;
  }>({ isAutoMode: false, isMotorRunning: false });

  useEffect(() => {
    MqttService.setMessageCallback((message) => {
      if (message.destinationName === "esp8266/sensors") {
        try {
          const data = JSON.parse(message.payloadString);
          setCurrentData(data);
          setLocalState({
            isAutoMode: data.isMotorAutoMode,
            isMotorRunning: data.isMotorRunning,
          });
        } catch (err) {
          console.error("Error parsing sensor JSON:", err);
        }
      }
    });
  }, []);

  const sendControlCommand = (command: string) => {
    setCurrentCommand(command);
    MqttService.publishMessage("esp8266/control", command);
    if (command === "MOTOR_AUTO_ON")
      setLocalState((prev) => ({ ...prev, isAutoMode: true }));
    if (command === "MOTOR_AUTO_OFF")
      setLocalState((prev) => ({ ...prev, isAutoMode: false }));
    if (command === "MOTOR_ON")
      setLocalState((prev) => ({ ...prev, isMotorRunning: true }));
    if (command === "MOTOR_OFF")
      setLocalState((prev) => ({ ...prev, isMotorRunning: false }));
  };

  const isAutoMode = localState.isAutoMode;
  const isMotorRunning = localState.isMotorRunning;

  const controlOptions = {
    manual: [
      {
        label: "Motor ON",
        value: "MOTOR_ON",
        disabled: isAutoMode || isMotorRunning,
      },
      {
        label: "Motor OFF",
        value: "MOTOR_OFF",
        disabled: isAutoMode || !isMotorRunning,
      },
    ],
    auto: [
      {
        label: "Enable Auto Mode",
        value: "MOTOR_AUTO_ON",
        disabled: isAutoMode,
      },
      {
        label: "Disable Auto Mode",
        value: "MOTOR_AUTO_OFF",
        disabled: !isAutoMode,
      },
    ],
  };
  const insertSampleData = async () => {
    const db = await setupDatabase();
    for (let i = 0; i < 6; i++) {
      const sample = await collectDataSamples();
      await insertData(db, {
        moisture: sample.soilMoisture,
        temperature: sample.temperature,
        humidity: sample.humidity,
        light: sample.lightIntensity,
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
        <Entypo
          name="flow-branch"
          size={28}
          color="white"
        />
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
                <Ionicons name="close-circle-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  selectedMode === "manual" && styles.selectedModeButton,
                ]}
                onPress={() => setSelectedMode("manual")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    selectedMode === "manual" && styles.selectedModeButtonText,
                  ]}
                >
                  Manual Mode
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  selectedMode === "auto" && styles.selectedModeButton,
                ]}
                onPress={() => setSelectedMode("auto")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    selectedMode === "auto" && styles.selectedModeButtonText,
                  ]}
                >
                  Auto Mode
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.controlContainer}>
              {controlOptions[selectedMode].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radioContainer,
                    option.disabled && styles.disabledButton,
                  ]}
                  onPress={() => sendControlCommand(option.value)}
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
              ))}
            </View>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Demo Mode</Text>
              <Switch value={demoMode} onValueChange={setDemoMode} />
            </View>
            <TouchableOpacity
              style={styles.sampleDataButton}
              onPress={insertSampleData}
            >
              <Text style={styles.sampleDataButtonText}>
                Insert Sample Data
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
  modalTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  closeButton: { padding: 5 },
  modeSelector: {
    flexDirection: "row",
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  selectedModeButton: {
    backgroundColor: "#444",
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  modeButtonText: { fontSize: 16, color: "#AAA", fontWeight: "500" },
  selectedModeButtonText: { color: "#0A84FF", fontWeight: "600" },
  controlContainer: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  radioContainer: {
    paddingVertical: 12,
    marginVertical: 4,
    alignItems: "center",
  },
  radioLabel: { fontSize: 16, color: "#FFF" },
  disabledButton: { opacity: 0.5 },
  disabledText: { color: "#777" },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  toggleLabel: { fontSize: 18, color: "#FFF" },
  sampleDataButton: {
    backgroundColor: "#0A84FF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  sampleDataButtonText: { color: "white", fontSize: 16, fontWeight: "500" },
});

export default MotorControl;
