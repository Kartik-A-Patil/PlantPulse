// import { AsyncStorage } from '@react-native-async-storage/async-storage';
// import init from 'react-native-mqtt';

// init({
//   storageBackend: AsyncStorage,
// });

// const options = {
//   host: 'http:192.168.0.1',
//   port: 8000,
//   path: '/mqtt',
//   id: `mqtt_${Math.random().toString(16).slice(2)}`,
// };

// const client = new Paho.MQTT.Client(options.host, options.port, options.path, options.id);

// const topic = 'sensor/data';

// const subscribeToSensorData = (onMessage: (data: any) => void) => {
//   client.onMessageArrived = message => {
//     const data = JSON.parse(message.payloadString);
//     onMessage(data);
//   };

//   client.connect({
//     onSuccess: () => {
//       console.log('Connected to MQTT broker');
//       client.subscribe(topic);
//     },
//     useSSL: false,
//     timeout: 3,
//   });
// };

// export default { subscribeToSensorData };
