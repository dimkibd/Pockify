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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { useNavigation } from "@react-navigation/native";

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
  const [expense, setExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [budget, setBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(""); // Start date state
  const [endDate, setEndDate] = useState("");     // End date state

  const navigation = useNavigation(); // Initialize navigation hook

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadExpenses();
        loadDates(); // Load dates when user is authenticated
      } else {
        setExpenses([]);
        setTotal(0);
        setBudget("");
      }
    });
    return () => unsubscribe();
  }, []);

  // Load expenses from Firestore
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

  // Load startDate, endDate, and budget from Firestore
  const loadDates = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "expenses", "dates");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const { startDate, endDate, budget } = docSnap.data();
          setStartDate(startDate); // Set start date
          setEndDate(endDate);     // Set end date
          setBudget(budget);       // Set budget
        } else {
          Alert.alert("No dates found", "There are no dates saved in the database.");
        }
      } catch (error) {
        console.error("Error fetching dates: ", error);
        Alert.alert("Error", "There was an issue loading the dates.");
      }
    }
  };

  const addExpense = async () => {
    if (expense && amount) {
      const numericAmount = parseFloat(amount);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        Alert.alert("Invalid Input", "Please enter a valid numeric amount greater than zero.");
        return;
      }

      const user = auth.currentUser;
      if (user) {
        try {
          setIsLoading(true);

          await addDoc(collection(db, "users", user.uid, "expenses"), {
            expense,
            amount: numericAmount,
            expenseRemain: numericAmount, // Add the expenseRemain field
            createdAt: serverTimestamp(),
          });

          setExpense("");
          setAmount("");
          loadExpenses();
        } catch (error) {
          console.error("Error adding expense: ", error);
          Alert.alert("Error", "There was an issue adding the expense.");
        } finally {
          setIsLoading(false);
        }
      } else {
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
        // Delete from the 'expenses' collection
        await deleteDoc(doc(db, "users", user.uid, "expenses", id));

        loadExpenses(); // Reload the expenses list
      } catch (error) {
        console.error("Error deleting expense: ", error);
        Alert.alert("Error", "There was an issue deleting the expense.");
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

  const remainingBudget = budget ? parseFloat(budget) - total : 0;

  const handleRedirectToHome = () => {
    Alert.alert("Confirmation", "Are you sure you want to go to the Home page?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => navigation.navigate("Home") },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Add Expenses</Text>

      <Text style={styles.Date}>{startDate} - {endDate}</Text>
      <Text style={styles.total}>Total Budget: PHP {budget}</Text>
      <Text style={styles.total}>Estimated Expenses: PHP {total.toFixed(2)}</Text>
      <Text
        style={[styles.remaining, { color: remainingBudget < 0 ? "red" : "green" }]}
      >
        Estimated Remaining Budget: PHP {remainingBudget.toFixed(2)}
      </Text>

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
          disabled={isLoading}
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

      {/* Button to confirm and redirect to the Home page */}
      <Button
        title="Confirm Expenses"
        onPress={handleRedirectToHome}
        color='#15202b'
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    
  },
  total: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "green",
  },
  remaining: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
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
    fontSize: 14,
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
  Date: {
    textAlign: "center",
  
    color: "black",
    fontSize: 16,
  },
});

export default App;
