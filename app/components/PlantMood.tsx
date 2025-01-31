import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";

interface PlantMoodProps {
  moisture: number;
  gas: number;
  temperature: number;
  humidity: number;
  light: number;
}

const getStatusColor = (value: number, type: string) => {
  const ranges:any = {
    moisture: { low: 30, high: 70 },
    temperature: { low: 18, high: 28 },
    gas: { low: 400, high: 1000 },
    light: { low: 500, high: 2000 },
    humidity: { low: 40, high: 60 },
  };

  const range = ranges[type] || { low: 30, high: 70 };

  if (value < range.low) return COLORS.warning;
  if (value > range.high) return COLORS.danger;
  return COLORS.success;
};

const PlantMood: React.FC<PlantMoodProps> = ({
  moisture,
  gas,
  temperature,
  humidity,
  light,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Environment</Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Feather name="droplet" size={20} color={COLORS.textSecondary} />

            <Text
              style={[
                styles.value,
                { color: getStatusColor(moisture, "moisture") },
              ]}
            >
              {moisture}
              <Text style={styles.unit}> %</Text>
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Feather
              name="thermometer"
              size={20}
              color={COLORS.textSecondary}
            />

            <Text
              style={[
                styles.value,
                { color: getStatusColor(temperature, "temperature") },
              ]}
            >
              {temperature}
              <Text style={styles.unit}> °C</Text>
            </Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Feather name="wind" size={20} color={COLORS.textSecondary} />

            <Text style={[styles.value, { color: getStatusColor(gas, "gas") }]}>
              {gas}
              <Text style={styles.unit}> ppm</Text>
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Feather name="sun" size={20} color={COLORS.textSecondary} />
            <Text
              style={[styles.value, { color: getStatusColor(light, "light") }]}
            >
              {light}
              <Text style={styles.unit}> lux</Text>
            </Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Feather name="activity" size={20} color={COLORS.textSecondary} />

            <Text
              style={[
                styles.value,
                { color: getStatusColor(humidity, "humidity") },
              ]}
            >
              {humidity}
              <Text style={styles.unit}> %</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const COLORS = {
  background: "#18181B",
  cardBackground: "#27272A",
  border: "#3F3F46",
  textPrimary: "#E4E4E7",
  textSecondary: "#71717A",
  success: "#22C55E",
  warning: "#EAB308",
  danger: "#EF4444",
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  metricsContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    gap: 12,
  },

  value: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
    marginHorizontal: 4,
  },
  unit: {
    fontSize: 14,
    marginLeft: 5,
    color: COLORS.textSecondary,
  },
});

export default PlantMood;
