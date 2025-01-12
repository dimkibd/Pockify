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
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, currentUser } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvhnJOnzUJzCc8MiCFs2HksNratuRncnA",
  authDomain: "pockify-41e51.firebaseapp.com",
  projectId: "pockify-41e51",
  storageBucket: "pockify-41e51.appspot.com",
  messagingSenderId: "33391220232",
  appId: "1:33391220232:web:528be8515fd882c1b963bd",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

const App = () => {
  const [expense, setExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load expenses from Firestore when the user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
    const user = auth.currentUser;
    if (user) {
      try {
        const q = query(
          collection(db, "users", user.uid, "expenses"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);

        const loadedExpenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExpenses(loadedExpenses);
        const totalAmount = loadedExpenses.reduce((acc, item) => acc + item.amount, 0);
        setTotal(totalAmount);
      } catch (error) {
        console.error("Error loading expenses: ", error);
        Alert.alert("Error", "There was an issue loading expenses.");
      }
    }
  };

  const addExpense = async () => {
    if (expense && amount) {
      const numericAmount = parseFloat(amount);

      // Ensure amount is a valid number and greater than zero
      if (isNaN(numericAmount) || numericAmount <= 0) {
        Alert.alert("Invalid Input", "Please enter a valid numeric amount greater than zero.");
        return;
      }

      const user = auth.currentUser; // Correct way to get current user
      if (user) {
        try {
          setIsLoading(true); // Set loading state
          console.log("Adding expense: ", expense, numericAmount);

          // Add expense to Firestore
          await addDoc(collection(db, "users", user.uid, "expenses"), {
            expense,
            amount: numericAmount,
            createdAt: serverTimestamp(),
          });

          // Clear input fields
          setExpense("");
          setAmount("");

          // Reload expenses list
          loadExpenses();


        } catch (error) {
          console.error("Error adding expense: ", error);
          Alert.alert("Error", "There was an issue adding the expense.");
        } finally {
          setIsLoading(false); // Reset loading state
        }
      } else {
        console.log("User is not authenticated.");
        Alert.alert("Error", "You need to be logged in to add an expense.");
      }
    } else {
      Alert.alert("Missing Fields", "Both fields are required.");
    }
  };

  const deleteExpense = async (id) => {
    const user = auth.currentUser;
    if (user) {
      try {
        console.log("Deleting expense with ID:", id);
        await deleteDoc(doc(db, "users", user.uid, "expenses", id));
        loadExpenses(); // Refresh the list
      } catch (error) {
        console.error("Error deleting expense: ", error);
      }
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
        <Button
          title={isLoading ? "Adding..." : "Add Expense"}
          onPress={addExpense}
          color="green"
          disabled={isLoading} // Disable button while loading
        />
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
    backgroundColor: '#15202b',
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
