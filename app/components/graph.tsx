import React from "react";
import { LineChart } from "react-native-chart-kit";
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { COLORS, chartConfig } from "../utils/constant";
import { MetricCardProps } from "../types/types";

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  data,
  unit,
  AIResult,
}) => {
  const screenWidth = Dimensions.get("window").width - 50;

  // Generate labels for the last 7 intervals.
  const labels = Array.from({ length: 7 }, (_, i) => `${(6 - i) * 15}m`);

  // Slice and reverse the data for display.
  let rawReversedData = [...data.slice(-7)].reverse();

  // --- Data Safety Checks ---
  // If there are no data points, fallback to a default array.
  if (!rawReversedData || rawReversedData.length === 0) {
    rawReversedData = [0, 0, 0, 0, 0, 0, 0];
  }

  // Replace any non-finite numbers (Infinity, NaN) with 0.
  let safeData = rawReversedData.map((d) => (isFinite(d) ? d : 0));

  // Check if all numbers are identical.
  const minVal = Math.min(...safeData);
  const maxVal = Math.max(...safeData);
  if (minVal === maxVal) {
    // Adjust all but the first point very slightly so the chart can render a valid scale.
    safeData = safeData.map((d, idx) => (idx === 0 ? d : d + 0.001));
  }

  return (
    <View
      style={[
        styles.metricCard,
        { borderLeftWidth: 4, borderLeftColor: color },
      ]}
    >
      <View style={styles.metricHeader}>
        <View style={styles.metricHeaderLeft}>
          <View
            style={[styles.iconContainer, { backgroundColor: `${color}10` }]}
          >
            {icon}
          </View>
          <View style={styles.metricHeaderText}>
            <Text style={[styles.metricTitle, { color: COLORS.onSurface }]}>
              {title}
            </Text>
            <Text style={[styles.metricValue, { color }]}>{value}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: safeData,
              },
            ],
          }}
          width={screenWidth}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) =>
              `${color}${Math.round(opacity * 255)
                .toString(16)
                .padStart(2, "0")}`,
            propsForLabels: {
              fontSize: 12,
            },
            style: {
              paddingLeft: 0,
            },
          }}
          yAxisSuffix={unit === "lux" ? " " + unit : unit}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            paddingLeft: 0,
          }}
        />
        {AIResult && (
          <View style={styles.aiContainer}>
            <Text style={styles.aiTitle}>AI Insights</Text>
            <Text style={styles.aiText}>{AIResult}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const ALCOLORS = {
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
    flex: 1,
    backgroundColor: COLORS.background,
  },
  metricCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    margin: 16,
    paddingVertical: 20,
    paddingHorizontal: 5,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
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
    fontWeight: "500",
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 4,
  },
  chartWrapper: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
  },
  aiContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: ALCOLORS.textPrimary,
  },
  aiText: {
    fontSize: 14,
    color: ALCOLORS.textSecondary,
    marginTop: 4,
  },
});
