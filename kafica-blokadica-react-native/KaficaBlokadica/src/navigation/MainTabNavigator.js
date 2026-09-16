import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; 

// Screens
import MyEventsScreen from "../screens/MyEventsScreen";
import CreateEventScreen from "../screens/CreateEventScreen";
import InvitesScreen from "../screens/InvitesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import JoinEventScreen from "../screens/JoinEventScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
     
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Events") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Create") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Invites") {
            iconName = focused ? "mail-open" : "mail-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

         
          return <Ionicons name={iconName} size={size} color={color} />;
        },
  
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
      })}
    >
      
      <Tab.Screen name="Events" component={MyEventsScreen} options={{ title: "My Events" }} />
      <Tab.Screen name="Create" component={CreateEventScreen} options={{ title: "Create New Event" }} />
      <Tab.Screen name="Invites" component={JoinEventScreen} options={{ title: "Invites" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}