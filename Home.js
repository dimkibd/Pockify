import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Alert, RefreshControl, Button, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, query, orderBy } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import Icon from 'react-native-vector-icons/Ionicons'; // Import the Ionicons library

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

const Home = () => {
  const navigation = useNavigation();
  const [initialBudget, setInitialBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const calculateTotalSpent = (expenses) => {
    const total = expenses.reduce((acc, expense) => acc + (expense.amount || 0), 0);
    setTotalSpent(total);
  };

  const loadData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        // Fetch the initial budget if it's not already set
        if (initialBudget === 0) {
          const budgetDocRef = doc(db, "users", user.uid, "expenses", "dates");
          const budgetDoc = await getDoc(budgetDocRef);

          if (budgetDoc.exists()) {
            const data = budgetDoc.data();
            if (data) {
              const fetchedBudget = data.budget || 0;
              setInitialBudget(fetchedBudget);
            }
          }
        }

        // Fetch the expenses
        const expensesQuery = query(
          collection(db, "users", user.uid, "expenses"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(expensesQuery);
        const loadedExpenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExpenses(loadedExpenses);

        calculateTotalSpent(loadedExpenses);
      } catch (error) {
        console.error("Error fetching data: ", error);
        Alert.alert("Error", "Unable to load data.");
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []); // Only call loadData when the component is first mounted

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, []);

  const handleAddExpense = () => {
    Alert.alert(
      "Pockify",
      "Do you want to add another expense?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => navigation.navigate('budgetTracker')
        }
      ]
    );
  };

  const ViewAnalytics = () => {
    Alert.alert(
      "Pockify",
      "Do you want to view your analytics?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => navigation.navigate('spendingtable')
        }
      ]
    );
  };

  const handleUpdateBudget = async (newBudget) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const budgetDocRef = doc(db, "users", user.uid, "expenses", "dates");
        await setDoc(budgetDocRef, { budget: newBudget });
        
        // After updating the budget, reload the data
        setInitialBudget(newBudget);
        loadData();
        Alert.alert("Success", "Budget updated successfully.");
      } catch (error) {
        console.error("Error updating budget:", error);
        Alert.alert("Error", "Could not update budget.");
      }
    } else {
      Alert.alert("Error", "You need to be logged in to update the budget.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="wallet" size={24} color="#fff" style={styles.walletIcon} />
          <Text style={styles.headerTitle}>My Budget</Text>
        </View>
        <Text style={styles.headerAmount}>₱ {(initialBudget - totalSpent).toFixed(2)}</Text>
      </View>

      {/* Budget Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Allocated Budget is ₱ {totalSpent.toFixed(2)}.</Text>
      </View>

      {/* Expenses Title */}
      <Text style={styles.expensesTitle}>Expenses</Text>

      {/* Expenses Table */}
      <ScrollView
        style={styles.expensesContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseRow}>
              <Text style={styles.expenseName}>{expense.expense}</Text>
              <Text style={styles.expenseAmount}>₱{expense.amount.toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noExpensesText}>No expenses recorded.</Text>
        )}
      </ScrollView>

      {/* Button to navigate to Spending Table */}
      <Button
        title="View Analytics"
        onPress={ViewAnalytics}
        color="#34495e"
        height="50"
      />

      {/* Plus Sign Button to navigate to Budget Tracker */}
      <TouchableOpacity
        style={styles.plusButton}
        onPress={handleAddExpense}
      >
        <Icon name="add-circle" size={60} color="#15202b" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9ecef",
    elevation: 6,
  },
  header: {
    backgroundColor: "#15202b",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 120,
    elevation: 6,
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  headerAmount: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 10,
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: "#34495e",
    marginTop: 10,
    borderRadius: 10,
    elevation: 6,
  },
  summaryText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
    fontWeight: "bold",
  },
  expensesTitle: {
    fontSize: 18,
    color: "#15202b",
    fontWeight: "bold",
    marginTop: 10,
    marginLeft: 20,
  },
  expensesContainer: {
    flex: 1,
    padding: 20,
    marginTop: 2,
    backgroundColor: "white",
    borderRadius: 25,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 4,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    elevation: 5,
  },
  expenseName: {
    fontSize: 14,
    color: "#000",
  },
  expenseAmount: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
  },
  noExpensesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  plusButton: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    borderRadius: 30,
  },
});

export default Home;
