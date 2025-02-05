const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
import Constants from "expo-constants";
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 200,
  responseMimeType: "application/json",
};

async function analyzePlantHealth(sensorData) {
  try {
    // Create a formatted input message using sensor data
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

    // Start a chat session with the model
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the message to Gemini
    const result = await chatSession.sendMessage(inputMessage);

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error with Gemini analysis:", error);
    throw new Error("Failed to analyze plant health.");
  }
}

// Example usage with sensor data
const sensorData = {
  soilMoisture: 600, // in range 0-1000
  gasValue: 200, // MQ-135 gas reading
  temperature: 25, // in Celsius
  humidity: 40, // in percentage
  plantAge: "2 years", // age of the plant
  plantName: "Snake Plant", // name of the plant
};

export default analyzePlantHealth;
