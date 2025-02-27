// MqttService.ts
import init from "react_native_mqtt";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Declare Paho as any if types are not available. Replace with proper import if available.
declare var Paho: any;

// Initialize the MQTT client with storage settings.
init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

// MQTT connection options for HiveMQ Cloud via secure WebSocket
// const host: string = Constants.expoConfig.extra.HIVE_HOST || "";
const host: string = process.env.EXPO_PUBLIC_HIVE_HOST || "";
const port: number = 8884;
const clientId: string =
  "ReactNativeClient_" + Math.floor(Math.random() * 1000);
interface ConnectionOptions {
  useSSL: boolean;
  userName: string;
  password: string;
  onSuccess: () => void;
  onFailure: (err: any) => void;
}
const options: ConnectionOptions = {
  useSSL: true,
  userName: "ESP8266",
  password: "ESP8266Connect",
  onSuccess: onConnect,
  onFailure: onFailure,
};

// Create the client instance
let client = new Paho.MQTT.Client(host, port, clientId);

// Add the isConnected state
let isConnected: boolean = false;

// Connection success callback
function onConnect(): void {
  isConnected = true;
  console.log("Connected to HiveMQ Cloud");
  // Subscribe to the sensor data topic
  client.subscribe("esp8266/sensors");
}

// Connection failure callback
function onFailure(err: any): void {
  isConnected = false;
  console.log("Failed to connect", err);
}

// Handle connection lost
client.onConnectionLost = function (responseObject: {
  errorCode: number;
  errorMessage: string;
}): void {
  if (responseObject.errorCode !== 0) {
    isConnected = false;
    console.log("Connection lost:", responseObject.errorMessage);
  }
};

// Define a type for the message callback function
type MessageCallback = (message: any) => void;
let messageCallback: MessageCallback | null = null;

// Handle incoming messages
client.onMessageArrived = function (message: { payloadString: string }): void {
  //   console.log("Message arrived: " + message.payloadString);
  if (messageCallback) {
    messageCallback(message);
  }
};

// Public function to connect to the broker
const connect = (): void => {
  client.connect(options);
};

// Public function to publish messages
const publishMessage = (topic: string, payload: string): void => {
  const message = new Paho.MQTT.Message(payload);
  message.destinationName = topic;
  client.send(message);
};

// Public function to set the callback for incoming messages
const setMessageCallback = (callback: MessageCallback): void => {
  messageCallback = callback;
};

// Public function to check connection status
const getIsConnected = (): boolean => {
  return isConnected;
};

export default {
  connect,
  publishMessage,
  setMessageCallback,
  getIsConnected,
};
