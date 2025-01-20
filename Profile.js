import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons from react-native-vector-icons

const Profile = ({ navigation }) => {
  const [userEmail, setUserEmail] = useState('');

  // Get current user's email
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email || 'No email provided'); // Use email if available
    }
  }, []);

  // Logout function
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigation.replace('Login'); // Navigate to Login screen after logout
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  // Show confirmation dialog
  const showLogoutConfirmation = () => {
    Alert.alert(
      "Pockify",
      "Are you sure you want to exit Pockify?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: handleLogout
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Logo */}
      <Icon name="person-circle" size={100} color="#555" style={styles.profileLogo} />

      <Text style={styles.header}>User Profile</Text>
      
      {/* Display user's email */}
      <Text style={styles.emailText}>{userEmail}</Text>

      {/* Logout Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Log Out"
          onPress={showLogoutConfirmation} // Call the confirmation dialog
          color="red"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, // Adjusted margin to fit design
    color: '#333',
  },
  profileLogo: {
    marginBottom: 20,
  },
  emailText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
    textAlign: 'center', // Center text
  },
  buttonContainer: {
    marginBottom: 20,
    width: '80%',
  },
});

export default Profile;
