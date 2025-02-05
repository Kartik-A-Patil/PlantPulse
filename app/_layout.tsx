import { Stack } from "expo-router";
import MoterControl from "./components/MoterControl";
import { View, Image, Text } from "react-native"; // Fixed View import
import { LogBox } from "react-native";

if (!__DEV__) {
  LogBox.ignoreAllLogs(false); // Enable logs in production
}
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerRight: () => <MoterControl />,
        headerLeft: () => (
          <View style={{ flexDirection: "row", alignItems: "center"}}>
            <Image
              source={require("@/assets/images/appIcon.png")}
              style={{ width: 60, height: 60, resizeMode: "contain" }} // Adjusted size for better fit
            />
            <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
              PlantPulse
            </Text>
          </View>
        ),
        headerTitle: "",
        headerStyle: { backgroundColor: "#121212" },
      }}
    />
  );
}
