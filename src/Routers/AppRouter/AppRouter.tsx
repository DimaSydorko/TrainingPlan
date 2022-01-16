import React from "react";
import {Text} from "react-native";
import {TabRouterOptions} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from "../../Screens/HomeScreen/HomeScreen";
import {colors} from "../../Theme/colors";
import {theme} from "../../Theme/theme";
import {PlansScreen} from "../../Screens";

type TabType = {
  name: string,
  component: () => JSX.Element,
  buttonLabel: string,
  icon: (color:string) => JSX.Element,
}

const tabs = [
  {
    name: 'All saved Plans',
    component: PlansScreen,
    buttonLabel: 'My Plans',
    icon: (color) => {
      return <Icon name="clipboard-list-outline" size={28} color={color} />
    },
  }, {
    name: 'All saved Workouts',
    component: PlansScreen,
    buttonLabel: 'My Workouts',
    icon: (color) => {
      return <Icon name="clock-fast" size={28} color={color} />
    },
  }, {
    name: 'My Suggestion',
    component: PlansScreen,
    buttonLabel: 'Suggestion',
    icon: (color) => {
      return <Icon name="tooltip-text-outline" size={28} color={color} />
    },
  }, {
    name: 'More',
    component: PlansScreen,
    buttonLabel: 'More',
    icon: (color) => {
      return <Icon name="dots-horizontal" size={28} color={color} />
    },
  }
] as TabType[]

export default function AppRouter() {
  const Tab = createBottomTabNavigator();
  const Stack = createStackNavigator();

  return (
    <Tab.Navigator
      sceneContainerStyle={{
        backgroundColor: colors.background,
      }}
    >
      {tabs.map(({name,icon, buttonLabel, component}, idx) => (
        <Tab.Screen
          key={`${name}_${idx}`}
          name={name}
          component={() => (
            <Stack.Navigator>
              <Stack.Screen
                name={`${name}_${buttonLabel}`}
                options={{headerShown: false}}
                >
                  {component}
                </Stack.Screen>
            </Stack.Navigator>
          )}
          options={{
            tabBarLabel: ({focused}) => (
              <Text style={focused ? {color: colors.secondPrimary} : {color: colors.black}}>
                {buttonLabel}
              </Text>
            ),
            tabBarIcon: ({focused}) => (
              icon(focused ? colors.secondPrimary : colors.black)
            ),
            ...theme.stackScreenOptions as TabRouterOptions,
            tabBarStyle: {
              backgroundColor: colors.menu,
              paddingTop: 5,
              paddingBottom: 5,
              height: 55
            }
          }}
        />
      ))}
    </Tab.Navigator>
  )
}