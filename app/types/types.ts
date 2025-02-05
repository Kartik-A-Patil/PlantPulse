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
  export type { PlantData, MetricCardProps };