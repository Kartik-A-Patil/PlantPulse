const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro", // Use the specific Gemini model
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 200,
    responseMimeType: "text/plain",
  };
  
  async function analyzePlantHealth(sensorData) {
    try {
      // Create a formatted input message using sensor data
      const inputMessage = `
        Here is the data for a plant:
        - Soil Moisture: ${sensorData.soilMoisture}(0-1000)
        - Gas Value (MQ-135): ${sensorData.gasValue}
        - Light Intensity: ${sensorData.lightIntensity} lux
        - Temperature: ${sensorData.temperature}°C
        - Humidity: ${sensorData.humidity}%
        - Plant Age: ${sensorData.plantAge}
        - Plant Name: ${sensorData.plantName}
  
        Based on this data, provide:
        1. The current plant condition (Good, Average, Poor).
        2. Suggestions to improve the plant's health.
        3. Any additional notes about the plant's environment or care.
      `;
  
      // Start a chat session with the model
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });
  
      // Send the message to Gemini
      const result = await chatSession.sendMessage(inputMessage);
  
      // Parse and log the response
      console.log("Gemini Response:", result.response.text());
  
      return result.response.text();
    } catch (error) {
      console.error("Error with Gemini analysis:", error);
      throw new Error("Failed to analyze plant health.");
    }
  }
  
  // Example usage with sensor data
  const sensorData = {
    soilMoisture: 600,       // in range 0-1000
    gasValue: 200,          // MQ-135 gas reading
    lightIntensity: 300,    // in lux
    temperature: 25,        // in Celsius
    humidity: 40,           // in percentage
    plantAge: "2 years",    // age of the plant
    plantName: "Aloe Vera", // name of the plant
  };
 export default analyzePlantHealth;