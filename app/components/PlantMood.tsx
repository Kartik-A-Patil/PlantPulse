import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PlantMoodProps } from "@/app/types/types";


const getStatusColor = (value: number, type: string) => {
  const ranges: any = {
    moisture: { low: 370, high: 600 },
    temperature: { low: 18, high: 28 },
    gas: { low: 400, high: 1000 },
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
  AIResult,
}) => {
  return (
    <View style={styles.container}>
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
              <Text style={styles.unit}></Text>
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
              style={[
                styles.value,
                { color: light ? COLORS.warning : COLORS.success },
              ]}
            >
              {light ? "Bright" : "Dim"}
              <Text style={styles.unit}></Text>
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

      {AIResult && (
        <View style={styles.aiContainer}>
          <Text style={styles.conditionText}>
            Condition: {AIResult.current_plant_condition || "Unknown"}
          </Text>
          {AIResult.suggestions?.length ? (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              {AIResult.suggestions.slice(0, 2).map((suggestion, index) => (
                <Text key={index} style={styles.suggestionText}>
                  • {suggestion}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      )}
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
  aiContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
  },
  conditionText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
});

export default PlantMood;
