import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import EventDetailsScreen from '../screens/EventDetailsScreen';
import JoinEventScreen from '../screens/JoinEventScreen';
import LoginScreen from "../screens/LoginScreen";
import ManageEvetScreen from '../screens/ManageEventScreen';
import RegisterScreen from "../screens/RegisterScreen";
import MainTabNavigator from "./MainTabNavigator";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Kad udje */}
      <Stack.Screen
        name="Home"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />


      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{ title: "EventDetails" }}
      />

       <Stack.Screen
        name="ManageEvent"
        component={ManageEvetScreen}
        options={{ title: "ManageEvent" }}
      />


      <Stack.Screen
        name="JoinEvent"
        component={JoinEventScreen}
        options={{ title: "JoinEventScreen" }}
      />
    </Stack.Navigator>
  );
}