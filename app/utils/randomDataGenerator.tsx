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
let previousData = {
  soilMoisture: 450,
  temperature: 25,
  humidity: 60,
  gasLevels: 150,
  lightIntensity: 1,
  timestamp: new Date(),
};

export const collectDataSamples = async () => {
  const generateVariation = (currentValue, minVariation, maxVariation) => {
    const variation = Math.random() * (maxVariation - minVariation) + minVariation;
    return Math.round(currentValue + variation);
  };

  const newData = {
    soilMoisture: generateVariation(previousData.soilMoisture, -20, 20),
    temperature: generateVariation(previousData.temperature, -1, 1),
    humidity: generateVariation(previousData.humidity, -3, 3),
    gasLevels: generateVariation(previousData.gasLevels, -20, 20),
    lightIntensity: Math.random() < 0.5 ? 0 : 1, // Randomly choose between 1 or 0
    timestamp: new Date(),
  };

  previousData = newData; // Update previous data for the next sample

  return newData;
};



export const generateData = (count:any) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      soilMoisture: Math.floor(Math.random() * 101), // 0 to 100
      temperature: Math.floor(Math.random() * 41), // 0 to 40°C
      humidity: Math.floor(Math.random() * 101), // 0 to 100%
      gasLevels: Math.floor(Math.random() * 501), // 0 to 500 ppm
      lightIntensity: Math.floor(Math.random() * 1001), // 0 to 1000 lux
      timestamp: new Date(Date.now() - i * 60000), // Decreasing timestamps
    });
  }
  return data;
};
export const data = generateData(6);
