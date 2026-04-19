import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { ServiceScreen } from "../screens/ServiceScreen";
import { ReaderScreen } from "../screens/ReaderScreen";
import { BookmarksScreen } from "../screens/BookmarksScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { colors } from "../theme/colors";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: "700",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Siddur" }} />
      <Stack.Screen
        name="Service"
        component={ServiceScreen}
        options={({ route }) => ({
          title: route.params.serviceTitle ?? route.params.serviceId,
          headerLargeTitle: false,
        })}
      />
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={({ route }) => ({
          title: route.params.sectionTitle ?? route.params.sectionId,
          headerLargeTitle: false,
        })}
      />
      <Stack.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          title: "Bookmarks",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerLargeTitle: false,
        }}
      />
    </Stack.Navigator>
  );
}
