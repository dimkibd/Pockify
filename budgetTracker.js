import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, getDocs } from "firebase/firestore"; // Add getDocs import
import { initializeApp, getApps } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvhnJOnzUJzCc8MiCFs2HksNratuRncnA",
  authDomain: "pockify-41e51.firebaseapp.com",
  projectId: "pockify-41e51",
  storageBucket: "pockify-41e51.firebasestorage.app",
  messagingSenderId: "33391220232",
  appId: "1:33391220232:web:528be8515fd882c1b963bd",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

const App = () => {
  const [amount, setAmount] = useState("");
  const [expense, setExpense] = useState("");
  const [userExpenses, setUserExpenses] = useState([]);

  // Fetch expenses from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "users", user.uid, "expenses"),
          orderBy("createdAt", "desc")
        );

        const unsubscribeExpenses = onSnapshot(q, (querySnapshot) => {
          const expenses = [];
          querySnapshot.forEach((doc) => {
            expenses.push({ id: doc.id, ...doc.data() });
          });
          setUserExpenses(expenses);
        });

        return () => unsubscribeExpenses();
      }
    });

    return () => unsubscribe();
  }, []);

  const addExpense = async () => {
    if (amount && expense) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        Alert.alert("Invalid Input", "Please enter a valid amount.");
        return;
      }

      const user = auth.currentUser;
      if (user) {
        try {
          await addDoc(collection(db, "users", user.uid, "expenses"), {
            amount: numericAmount,
            expense,
            createdAt: serverTimestamp(),
          });
          setAmount("");
          setExpense("");
          Alert.alert("Success", "Expense added successfully.");
        } catch (error) {
          console.error("Error adding expense:", error);
          Alert.alert("Error", "Could not add expense.");
        }
      } else {
        Alert.alert("Error", "You need to be logged in to add an expense.");
      }
    } else {
      Alert.alert("Missing Fields", "All fields are required.");
    }
  };

  const clearAllExpenses = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const expensesRef = collection(db, "users", user.uid, "expenses");
        const querySnapshot = await getDocs(expensesRef);  // Use getDocs here
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        Alert.alert("Success", "All expenses have been deleted.");
      } catch (error) {
        console.error("Error deleting expenses:", error);
        Alert.alert("Error", "Could not delete expenses.");
      }
    } else {
      Alert.alert("Error", "You need to be logged in to delete expenses.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Add Expense</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Expense"
          value={expense}
          onChangeText={setExpense}
        />
        <TouchableOpacity style={styles.button} onPress={addExpense}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      {/* Display added expenses */}
      <FlatList
        data={userExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <Text style={styles.expenseText}>
              {item.expense}: ₱{item.amount.toFixed(2)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.expenseList}
      />

      {/* Clear All Button */}
      <TouchableOpacity style={styles.clearButton} onPress={clearAllExpenses}>
        <Text style={styles.buttonText}>Clear All</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  form: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    backgroundColor: "#E8F0FE",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  button: {
    backgroundColor: "#34495e",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  expenseList: {
    marginTop: 20,
    width: "100%",
  },
  expenseItem: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseText: {
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: "center",
  },
});

export default App;
