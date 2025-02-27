import { PlantData } from "../types/types";

export const calculateAverage = (samples: PlantData[]): PlantData => {
  const sum = samples.reduce(
    (acc, curr) => ({
      soilMoisture: acc.soilMoisture + curr.soilMoisture,
      temperature: acc.temperature + curr.temperature,
      humidity: acc.humidity + curr.humidity,
      gasLevels: acc.gasLevels + curr.gasLevels,
    }),
    { soilMoisture: 0, temperature: 0, humidity: 0, gasLevels: 0 }
  );

  const count = samples.length;
  return {
    soilMoisture: parseFloat((sum.soilMoisture / count).toFixed(2)),
    temperature: parseFloat((sum.temperature / count).toFixed(2)),
    humidity: parseFloat((sum.humidity / count).toFixed(2)),
    gasLevels: parseFloat((sum.gasLevels / count).toFixed(2)),
  };
};
