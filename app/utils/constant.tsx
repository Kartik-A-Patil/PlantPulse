export const COLORS = {
  background: '#121212', // Very dark gray for the background
  surface: '#1E1E1E', // Dark gray for surface elements
  surfaceLight: '#2C2C2C', // Lighter gray for slight contrast
  primary: '#7C3AED', // Purple accent remains consistent
  secondary: '#06B6D4',
  error: '#F87171', // Softer red for errors
  onBackground: '#E5E5E5', // Light gray text for contrast
  onSurface: '#CCCCCC', // Slightly darker light gray for muted contrast
  happy: '#34D399', // Green accent for positive status
  neutral: '#FBBF24', // Warm yellow for neutral
  stressed: '#F87171', // Matching error
  moisture: '#60A5FA', // Soft blue
  temperature: '#FB923C', // Orange for temperature
  humidity: '#A78BFA', // Soft purple
  light: '#FBBF24', // Yellow for light
  border: '#333333', // Subtle gray for borders
} as const;

export const chartConfig = {
  backgroundColor: COLORS.surface,
  backgroundGradientFrom: COLORS.surface,
  backgroundGradientTo: COLORS.surfaceLight,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`, // Primary purple accent
  style: {
    borderRadius: 16,
  },
  propsForLabels: {
    fontSize: 12,
    fill: COLORS.onSurface, // Ensures labels contrast well with dark surfaces
  },
};

// export const CONFIG = {
//   SAMPLES_BEFORE_AVERAGE: 180,
//   HISTORICAL_ENTRIES_LIMIT: 6,
//   DATA_COLLECTION_INTERVAL: 5000,
//   MQTT_TOPIC: {
//     SENSORS: 'esp8266/sensors',
//     CONTROL: 'esp8266/control'
//   }
// } as const;