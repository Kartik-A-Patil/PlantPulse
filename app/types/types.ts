interface PlantData {
    soilMoisture: number;
    temperature: number;
    humidity: number;
    gasLevels: number;
    lightIntensity?: number;
    timestamp?: Date;
  }
  
  interface MetricCardProps {
    id: string;
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    data: number[];
    unit: string;
    AIResult:any
  }
  interface PlantMoodProps {
    moisture: number;
    gas: number;
    temperature: number;
    humidity: number;
    light: number | undefined | boolean;
    AIResult?: {
      suggestions?: string[];
      current_plant_condition?: "Good" | "Average" | "Poor";
      interpretations?: any;
    };
  }
  export type { PlantData, MetricCardProps,PlantMoodProps };

