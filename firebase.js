import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { initializeApp } from "firebase/app";
import firestore from '@react-native-firebase/firestore';


import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {   apiKey: "AIzaSyAvhnJOnzUJzCc8MiCFs2HksNratuRncnA",
  authDomain: "pockify-41e51.firebaseapp.com",
  projectId: "pockify-41e51",
  storageBucket: "pockify-41e51.firebasestorage.app",
  messagingSenderId: "33391220232",
  appId: "1:33391220232:web:528be8515fd882c1b963bd" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


const App = () => {
  const [expense, setExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        loadExpenses();
      } else {
        setExpenses([]);
        setTotal(0);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadExpenses = async () => {
    const user = auth().currentUser;
    if (user) {
      const snapshot = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('expenses')
        .orderBy('createdAt', 'desc')
        .get();

      const loadedExpenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setExpenses(loadedExpenses);
      const totalAmount = loadedExpenses.reduce((acc, item) => acc + item.amount, 0);
      setTotal(totalAmount);
    }
  };

  const addExpense = async () => {
    if (expense && amount) {
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount)) {
        const user = auth().currentUser;
        if (user) {
          await firestore()
            .collection('users')
            .doc(user.uid)
            .collection('expenses')
            .add({
              expense,
              amount: numericAmount,
              createdAt: firestore.FieldValue.serverTimestamp(),
            });
          setExpense("");
          setAmount("");
          loadExpenses(); // Refresh the list
        }
      } else {
        Alert.alert("Invalid Input", "Please enter a valid numeric amount.");
      }
    } else {
      Alert.alert("Missing Fields", "Both fields are required.");
    }
  };

  const deleteExpense = async (id) => {
    const user = auth().currentUser;
    if (user) {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('expenses')
        .doc(id)
        .delete();
      loadExpenses(); // Refresh the list
    }
  };

  const renderExpense = ({ item }) => (
    <View style={styles.expenseItem}>
      <View>
        <Text style={styles.expenseText}>{item.expense}</Text>
        <Text style={styles.expenseAmount}>PHP {item.amount.toFixed(2)}</Text>
      </View>
      <Button
        title="Delete"
        color="red"
        onPress={() => deleteExpense(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Budget Tracker</Text>
      <Text style={styles.total}>Total: PHP {total.toFixed(2)}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Expense"
          value={expense}
          onChangeText={setExpense}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Button title="Add Expense" onPress={addExpense} color="green" />
      </View>

      {expenses.length > 0 ? (
        <FlatList
          data={expenses}
          renderItem={renderExpense}
          keyExtractor={(item) => item.id}
          style={styles.expenseList}
        />
      ) : (
        <Text style={styles.noExpensesText}>No expenses added yet.</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "black",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "white",
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "green",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "grey",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  expenseList: {
    marginTop: 10,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 5,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  expenseText: {
    fontSize: 16,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noExpensesText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    marginTop: 20,
  },
});

export default App;