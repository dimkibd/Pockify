import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const Home = ({ navigation }) => {

  const handleDeleteAllExpenses = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const db = getFirestore();
      const expensesRef = collection(db, 'users', user.uid, 'expenses');

      try {
        // Retrieve all expenses documents
        const snapshot = await getDocs(expensesRef);
        const deletePromises = snapshot.docs.map((docSnapshot) => 
          deleteDoc(doc(db, 'users', user.uid, 'expenses', docSnapshot.id))
        );

        // Execute all delete promises
        await Promise.all(deletePromises);

        Alert.alert('Success', 'All expenses have been deleted.');
      } catch (error) {
        console.error('Error deleting expenses:', error);
        Alert.alert('Error', 'There was an issue deleting the expenses.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pockify}>P O C K I F Y</Text>
      <Text style={styles.header}> A Simple Budget</Text>
      <Text style={styles.header}> Tracker</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="View Expenses"
          onPress={() => navigation.navigate('spendingtable')}
          color="blue"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Create/Edit budget"
          onPress={() => navigation.navigate('DateSelector')}
          color="green"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Track Spending"
          onPress={() => navigation.navigate('Details')}
          color="orange"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Profile"
          onPress={() => navigation.navigate('Profile')}
          color="red"
        />
      </View>

      {/* Button to delete all expenses */}
      <View style={styles.buttonContainer}>
        <Button
          title="Delete All Expenses"
          onPress={() => {
            Alert.alert(
              'Confirm Deletion',
              'Are you sure you want to delete all expenses? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: handleDeleteAllExpenses, style: 'destructive' }
              ]
            );
          }}
          color="purple"
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
    backgroundColor: '#fffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#02ffa0'
    
  },
  pockify: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: 'green',
  },
  buttonContainer: {
    marginBottom: 20,
    width: '80%',
  },
});

export default Home;
