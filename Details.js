import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, collection, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

const AddExpenseInput = () => {
  const [expenses, setExpenses] = useState([]);
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Real-time listener to sync changes from expenses collection
      const expensesQuery = query(
        collection(db, "users", user.uid, "expenses"),
        orderBy("createdAt", "desc")
      );

      // Listener to update the expenses from Firestore
      const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
        const expensesFromDb = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExpenses(expensesFromDb);
      });

      // Cleanup listener when component is unmounted
      return () => unsubscribe();
    }
  }, []);

  const handleInputChange = (text, id) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [id]: text,
    }));
  };

  const handleSubmit = async (id) => {
    const spentAmount = parseFloat(inputValues[id]);
    if (isNaN(spentAmount) || spentAmount < 0) {
      Alert.alert("Invalid input", "Please enter a valid amount.");
      return;
    }

    const currentExpense = expenses.find((expense) => expense.id === id);
    if (!currentExpense) {
      Alert.alert("Error", "Expense not found.");
      return;
    }

    const newRemaining = (currentExpense.remaining ?? currentExpense.amount) - spentAmount;
    const newSpent = (currentExpense.spent ?? 0) + spentAmount;

    try {
      const expenseDocRef = doc(db, "users", auth.currentUser.uid, "expenses", id);
      await updateDoc(expenseDocRef, {
        remaining: newRemaining,
        spent: newSpent,
      });

      // Update local state with the new remaining and spent amounts
      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense.id === id
            ? { ...expense, remaining: newRemaining, spent: newSpent }
            : expense
        )
      );

      Alert.alert("Success", `Remaining amount updated to PHP ${newRemaining.toFixed(2)}`);
    } catch (error) {
      console.error("Error updating remaining amount: ", error);
      Alert.alert("Error", "There was an issue updating the remaining amount.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {expenses.map((expense) => (
        <View key={expense.id} style={styles.expenseRow}>
          <Text style={styles.expenseText}>
            {expense.expense}: PHP {expense.amount.toFixed(2)}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount spent"
            keyboardType="numeric"
            value={inputValues[expense.id] || ""}
            onChangeText={(text) => handleInputChange(text, expense.id)}
          />
          <Button
            title="Submit"
            onPress={() => handleSubmit(expense.id)}
          />
          {expense.remaining !== undefined && (
            <Text style={styles.remainingText}>
              Remaining: PHP {expense.remaining.toFixed(2)}
            </Text>
          )}
          {expense.spent !== undefined && (
            <Text style={styles.spentText}>
              Spent: PHP {expense.spent.toFixed(2)}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  expenseRow: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  expenseText: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
  },
  remainingText: {
    fontSize: 16,
    color: "#2ecc71",
    marginTop: 10,
  },
  spentText: {
    fontSize: 16,
    color: "#e74c3c",
    marginTop: 5,
  },
});

export default AddExpenseInput;
