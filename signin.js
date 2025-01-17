import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {   apiKey: "AIzaSyAvhnJOnzUJzCc8MiCFs2HksNratuRncnA",
  authDomain: "pockify-41e51.firebaseapp.com",
  projectId: "pockify-41e51",
  storageBucket: "pockify-41e51.firebasestorage.app",
  messagingSenderId: "33391220232",
  appId: "1:33391220232:web:528be8515fd882c1b963bd" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function CreateAccount({ navigation }) {
  const [email, setEmail] = useState(''); // State for email
  const [password, setPassword] = useState(''); // State for password

  // Function to create a new account
  const handleCreateAccount = async () => {
    if (!email || !password) {
      Alert.alert('Please fill in both fields.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Account created successfully!', 'Welcome to Pockify!');
      navigation.navigate('Home');  // Navigate to Home screen after account creation
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          Alert.alert('This email is already in use.');
          break;
        case 'auth/invalid-email':
          Alert.alert('Invalid email address.');
          break;
        case 'auth/weak-password':
          Alert.alert('Password should be at least 6 characters.');
          break;
        default:
          Alert.alert('Account creation failed', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>

        <Text style={styles.title}>Pockify</Text>
      </View>
      <StatusBar style="auto" />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      {/* Button to navigate to Login screen */}
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkButtonText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15202b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 250,
    height: 200,
    marginBottom: 5,
  },
  title: {
    fontSize: 71,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#02ffa0',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007a6c',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
  },
  linkButtonText: {
    color: '#02ffa0',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
