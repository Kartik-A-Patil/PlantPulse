import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { COLORS, chartConfig } from '../utils/constant';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { MetricCardProps } from '../types/types';

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  data,
}) => {
  const screenWidth = Dimensions.get('window').width - 60;
  
  // Reverse the labels array and data array to change orientation
  const labels = Array.from({ length: 8 }, (_, i) => `${(7-i) * 5}m`);
  const reversedData = [...data.slice(-8)].reverse();

  return (
    <View
      style={[styles.metricCard, { borderLeftWidth: 4, borderLeftColor: color }]}
    >
      <View style={styles.metricHeader}>
        <View style={styles.metricHeaderLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}10` }]}>
            {icon}
          </View>
          <View style={styles.metricHeaderText}>
            <Text style={[styles.metricTitle, { color: COLORS.onSurface }]}>{title}</Text>
            <Text style={[styles.metricValue, { color }]}>{value}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={{
            labels: labels,
            datasets: [{
              data: reversedData,
            }]
          }}
          width={screenWidth}
          height={180}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
            propsForLabels: {
              fontSize: 12,
            },
            
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          // Add these props to further customize the chart
          
        />
      </View>
    </View>
  );
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
    paddingHorizontal: 10
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