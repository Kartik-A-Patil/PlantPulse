export const generateRandomData = () => {
    return {
      moisture: Math.random() * 100, // Moisture in percentage
      gas: Math.random() * 300, // MQ135 Gas concentration (ppm)
      temp: Math.random() * 35 + 10, // Temperature (10°C to 45°C)
      humidity: Math.random() * 100, // Humidity in percentage
      light: Math.random() * 1000, // Light intensity in lx
      timestamp: new Date().toISOString(),
    };
  };
  
  // Data collection (mock)
export const collectDataSamples = async () => ({
  soilMoisture: Math.round(Math.random() * 70 + 30),
  temperature: Math.round(Math.random() * 20 + 15),
  humidity: Math.round(Math.random() * 50 + 40),
  gasLevels: Math.round(Math.random() * 300 + 100),
  lightIntensity: Math.round(Math.random() * 500 + 200),
  timestamp: new Date(),
});
