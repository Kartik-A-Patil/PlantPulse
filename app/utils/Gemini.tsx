import {
  GoogleGenerativeAI,
  HarmCategory,
  type GenerativeModel,
  type ChatSession
} from "@google/generative-ai";

import * as FileSystem from 'expo-file-system';
// Environment configuration
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Type definitions
interface SensorData {
  soilMoisture: number;
  gasValue: number;
  temperature: number;
  humidity: number;
  plantAge: number;
  plantName: string;
}

interface PlantHealthAnalysis {
  current_plant_condition: "Good" | "Average" | "Poor";
  suggestions: string[];
  interpretations: {
    soil_moisture: string;
    gas_Level: string;
    temperature: string;
    humidity: string;
  };
}

interface PlantImageAnalysis {
  fungus_detected: boolean;
  disease_detected: boolean;
  suggestions: string[];
  explanation: string;
}


interface AnalysisError extends Error {
  analysisType: "health" | "image";
  originalError?: unknown;
}

// Model configuration
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 200,
  responseMimeType: "application/json" as const
};

async function createInlineImage(fileUri, mimeType) {
  try {
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return {
      inlineData: {  // Directly use inlineData (no fileData wrapper)
        data: base64Data,
        mimeType,
      }
    };
  } catch (error) {
    console.error("Error reading file:", error);
    throw new Error("Failed to read image file");
  }
}
const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig
});


function createAnalysisError(
  message: string,
  analysisType: "health" | "image",
  error?: unknown
): AnalysisError {
  return {
    name: "AnalysisError",
    message,
    analysisType,
    originalError: error
  };
}

// Core functionality
async function analyzePlantHealth(
  sensorData: SensorData
): Promise<PlantHealthAnalysis> {
  const inputMessage = `
    Here is the data for a plant:
    - Soil Moisture: ${sensorData.soilMoisture} (0-1023)
    - Gas Value (MQ-135): ${sensorData.gasValue} (0-1023)
    - Temperature: ${sensorData.temperature}°C
    - Humidity: ${sensorData.humidity}%
    - Plant Age: ${sensorData.plantAge}
    - Plant Name: ${sensorData.plantName}

    Return a JSON response with the following format:
    {
      "current_plant_condition": "Good | Average | Poor",
      "suggestions": ["Suggestion 1", "Suggestion 2"],
      "interpretations": {
        "soil_moisture": "Max 10 words, use simple words.",
        "gas_Level": "Max 10 words, use simple words.",
        "temperature": "Max 10 words, use simple words.",
        "humidity": "Max 10 words, use simple words."
      }
    }
    Ensure the response is easy to understand, avoiding technical terms.
  `;

  try {
    const chatSession: ChatSession = model.startChat({ history: [] });
    const result = await chatSession.sendMessage(inputMessage);

    return JSON.parse(result.response.text()) as PlantHealthAnalysis;
  } catch (error) {
    throw createAnalysisError("Plant health analysis failed", "health", error);
  }
}
async function analyzePlantImage(imagePath) {
  try {
    // Create inline file object with expo-file-system
    const file = await createInlineImage(imagePath, "image/jpeg");

    const inputMessage = `
      Analyze this plant leaf image for fungus or disease signs.
      Return JSON response with:
      {
        "fungus_detected": boolean,
        "disease_detected": boolean,
        "suggestions": string[],
        "explanation": "Brief explanation <20 words"
      }
      Keep explanations simple and concise.
    `;

    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            // Use the inlineData directly as a part
            await createInlineImage(imagePath, "image/jpeg"),
            { text: inputMessage }
          ]
        }
      ]
    });

    const result = await chatSession.sendMessage("");
    return JSON.parse(result.response.text());
  } catch (error) {
    throw createAnalysisError("Plant image analysis failed", "image", error);
  }
}


export { analyzePlantHealth, analyzePlantImage };
export type {
  SensorData,
  PlantHealthAnalysis,
  PlantImageAnalysis,
  AnalysisError
};
