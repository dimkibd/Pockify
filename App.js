import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Import screens
import Login from './Login'; // Import Login screen
import Home from './Home';   // Import Home screen
import SignInScreen from './signin';   // Import Home screen
import Details from './Details'; // Import Details screen
import Profile from './Profile'; // Import Profile screen

import DateSelector from './DateSelector';
import BudgetTracker from './budgetTracker';
import SpendingTable from './spendingtable';
import { setStatusBarBackgroundColor } from 'expo-status-bar';
import { Background } from '@react-navigation/elements';




const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator for Home
function HomeDrawer({ navigation }) {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen 
        name="Home" 
        component={Home} 
        options={{
          title: 'Home', 
          headerStyle: {
            backgroundColor: '#15202b',
          }, 
          headerTintColor: '#fff',
        }} 
      />


      <Drawer.Screen name="View Expenses" component={SpendingTable} 
        options={{
          headerStyle: {
            backgroundColor: '#15202b',
          }, 
          headerTintColor: '#fff',
        }} />
      <Drawer.Screen 
        name="Track Spending" 
        component={Details} 
        options={{
          headerStyle: {
            backgroundColor: '#15202b',
          }, 
          headerTintColor: '#fff',
        }} 
      />
      <Drawer.Screen name="DateSelector" component={DateSelector} 
        options={{
          headerStyle: {
            backgroundColor: '#15202b',
          }, 
          headerTintColor: '#fff',
        }} />
      <Drawer.Screen name="Edit Expenses" component={BudgetTracker}
        options={{
          headerStyle: {
            backgroundColor: '#15202b',
          }, 
          headerTintColor: '#fff',
        }}  />
      <Drawer.Screen name="Logout" component={Profile}
        options={{
          headerStyle: {
            backgroundColor: '#15202b',
          }, 
          headerTintColor: '#fff',
        }}  />
    </Drawer.Navigator>
  );
}

export default function App( {navigation} ) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{headerShown: false, 
      }}>
        <Stack.Screen name="Login" component={Login} option={{headerShown: false}}/>
        <Stack.Screen name="Home" component={HomeDrawer} options={{headerLeft: () => (
          <Button onPress={() => navigation.toggleDrawer()}
          title="☰" //icon
          color="000s"
          />
        ), title: 'Home', }}
        />
        <Stack.Screen name="signin" component={SignInScreen} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="budgetTracker" component={BudgetTracker} />
        <Stack.Screen name="spendingtable" component={SpendingTable} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
