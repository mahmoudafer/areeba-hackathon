'use strict'
console.disableYellowBox = true
import 'react-native-gesture-handler'
import React from 'react'
import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-community/async-storage'
import Scan from './screens/scan'
import Profile from './screens/profile'
import Authentication from './screens/authenticate'

import { persistStore, persistReducer } from 'redux-persist'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { PersistGate } from 'redux-persist/integration/react'
import ScansReducer from './redux/reducer'


const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const persistConfig = {
	key: 'root',
	storage: AsyncStorage
}

const persistedReducer = persistReducer(persistConfig, ScansReducer)
const store = createStore(persistedReducer)
const persistor = persistStore(store)

function HomeStack (props) {
	return (
		<Tab.Navigator
			backBehavior="initialRoute"
			initialRouteName="Scan"
			tabBarOptions={{
				showLabel: false,
				activeTintColor: "white",
				activeBackgroundColor: "#FB4239",
				inactiveTintColor: "black"
			}}
		>
			<Tab.Screen
				name="Profile"
				component={Profile}
				options={{
					tabBarIcon: ({color, size}) => <MaterialCommunity name="history" size={35} color={color} />
				}}
			/>
			<Tab.Screen
				name="Scan"
				component={Scan}
				options={{
					tabBarIcon: ({color, size}) => <MaterialCommunity name="qrcode-scan" size={27} color={color} />
				}}
			/>
		</Tab.Navigator>
	)
}

function RootStack (props) {
	return (
		<Stack.Navigator
			initialRouteName="Login"
			screenOptions={{ gestureEnabled: false, headerShown: false }}
		>
			<Stack.Screen
				name="Home"
				component={HomeStack}
			/>
			<Stack.Screen
				name="Login"
				component={Authentication}
			/>
		</Stack.Navigator>
	)
}

export default function App (props) {
	return (
		<Provider store={ store }>
			<PersistGate loading={null} persistor={persistor}>
				<StatusBar backgroundColor="white" barStyle="dark-content"/>
				<NavigationContainer>
					<RootStack/>
				</NavigationContainer>
			</PersistGate>
		</Provider>
	)
}