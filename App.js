import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Import screens
import Login from './Login'; // Import Login screen
import Home from './Home';   // Import Home screen
import SignInScreen from './signin';   // Import Home screen
import Details from './Details'; // Import Details screen
import Profile from './Profile'; // Import Profile screen
import { setStatusBarBackgroundColor } from 'expo-status-bar';
import { Background } from '@react-navigation/elements';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();


//Drawer Navigator for Home
function HomeDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={Home} options={{title: 'Home', headerStyle: {
        backgroundColor: '#15202b',
      }, headerTintColor: '#fff',
      }} />

      <Drawer.Screen name="Details" component={Details} options={{headerStyle: {
        backgroundColor: '#15202b',
      }, headerTintColor: '#fff',
      }} />

      <Drawer.Screen name="Profile" component={Profile} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
