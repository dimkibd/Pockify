import React, { useState, useEffect } from "react"; 
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { LineChart } from 'react-native-chart-kit'; 
import { Dimensions } from 'react-native';
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvhnJOnzUJzCc8MiCFs2HksNratuRncnA",
  authDomain: "pockify-41e51.firebaseapp.com",
  projectId: "pockify-41e51",
  storageBucket: "pockify-41e51.firebasestorage.app",
  messagingSenderId: "33391220232",
  appId: "1:33391220232:web:528be8515fd882c1b963bd"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// Separate function to fetch budget
const getBudgetFromFirestore = async (user) => {
  const budgetDocRef = doc(db, "users", user.uid, "expenses", "dates");
  const budgetDoc = await getDoc(budgetDocRef);

  if (budgetDoc.exists()) {
    const data = budgetDoc.data();
    const fetchedBudget = data.budget;
    const startDate = data.startDate;
    const endDate = data.endDate;

    if (typeof fetchedBudget === 'number') {
      return { budget: fetchedBudget, startDate, endDate };
    } else {
      console.warn("Budget field is not a number or missing, defaulting to 0.");
      return { budget: 0, startDate, endDate };
    }
  } else {
    console.warn("Budget document does not exist.");
    return { budget: 0, startDate: null, endDate: null };
  }
};

// Helper function to calculate the number of days between two dates
const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end - start;
  const days = timeDiff / (1000 * 3600 * 24);
  return Math.ceil(days);
};

const ExpenseTable = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);  // Added totalSpent state
  const [averageAmount, setAverageAmount] = useState(0);
  const [highestExpense, setHighestExpense] = useState(0);
  const [lowestExpense, setLowestExpense] = useState(0);
  const [budget, setBudget] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [daysBetween, setDaysBetween] = useState(null);
  const [remainingBudgetPercentage, setRemainingBudgetPercentage] = useState(0);
  const [percentageSpent, setPercentageSpent] = useState(0); // Added state for percentage spent

  const safeToFixed = (value) => {
    return value && !isNaN(value) ? value.toFixed(2) : '0.00';
  };

  useEffect(() => {
    const loadExpenses = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const { budget: fetchedBudget, startDate, endDate } = await getBudgetFromFirestore(user);
          setBudget(fetchedBudget);
          setStartDate(startDate);
          setEndDate(endDate);

          if (startDate && endDate) {
            const days = calculateDaysBetween(startDate, endDate);
            setDaysBetween(days);
          }

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

          const total = loadedExpenses.reduce((acc, expense) => acc + expense.amount, 0);
          setTotalAmount(total);

          // Calculate total spent value
          const totalSpentAmount = loadedExpenses.reduce((acc, expense) => acc + (expense.spent || 0), 0);
          setTotalSpent(totalSpentAmount);

          if (loadedExpenses.length > 0) {
            const amounts = loadedExpenses.map((expense) => expense.amount);
            setAverageAmount(total / loadedExpenses.length);
            setHighestExpense(Math.max(...amounts));
            setLowestExpense(Math.min(...amounts));
          }

          const remaining = fetchedBudget - total;
          setRemainingBudget(remaining);

          const totalRemainingAmount = loadedExpenses.reduce((acc, expense) => acc + (expense.remaining || 0), 0);
          setTotalRemaining(totalRemainingAmount);

          const percentage = (remaining / fetchedBudget) * 100;
          setRemainingBudgetPercentage(percentage);

          // Calculate percentage of totalSpent out of totalBudget
          const spentPercentage = (totalSpentAmount / fetchedBudget) * 100;
          setPercentageSpent(spentPercentage);

        } catch (error) {
          console.error("Error loading expenses or budget: ", error);
          Alert.alert("Error", "There was an issue loading expenses or budget.");
        }
      }
    };
    loadExpenses();
  }, [totalAmount, budget]);

  const renderItem = (item) => {
    const percentage = ((item.amount / totalAmount) * 100).toFixed(2);
    return (
      <View style={styles.row} key={item.id}>
        <Text style={styles.cell}>{item.expense}</Text>
        <Text style={styles.cell}>
          PHP {safeToFixed(item.amount)} ({percentage}%)
        </Text>
        <Text style={styles.cell}>
          {item.spent !== undefined && item.spent !== null 
            ? `PHP ${safeToFixed(item.spent)}`
            : 'PHP 0.00'}
        </Text> 
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Expense Table</Text>
      
      {startDate && <Text style={styles.dateText}> {startDate}  -  {endDate} </Text>}
  
      {daysBetween !== null && (
        <Text style={styles.dateText}>Expenses in the next {daysBetween} days</Text>
      )}

      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={styles.headerCell}>Expenses</Text>
          <Text style={styles.headerCell}>Est. Total Amount</Text>
          <Text style={styles.headerCell}>Spent</Text>
        </View>

        <ScrollView>
          {expenses.length > 0 ? (
            expenses.map((expense) => renderItem(expense))
          ) : (
            <Text style={styles.noDataText}>No expenses added yet.</Text>
          )}
        </ScrollView>
      </View>
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetText}>Budget: PHP {safeToFixed(budget)}</Text>
      </View>
      {expenses.length > 0 && (
        <View style={styles.analyticsContainer}>
          <Text style={styles.totalText}>Estimated Total Expenses: PHP {safeToFixed(totalAmount)}</Text>
          <Text style={styles.analyticsText}>Average: PHP {safeToFixed(averageAmount)}</Text>
          <Text style={styles.analyticsText}>Highest: PHP {safeToFixed(highestExpense)}</Text>
          <Text style={styles.analyticsText}>Lowest: PHP {safeToFixed(lowestExpense)}</Text>
        </View>
      )}
      <Text style={styles.separator}>Estimate Analytics </Text>
      <View style={styles.remainingBudgetContainer}>
        <Text style={styles.remainingBudgetText}>Estimated Remaining Budget: PHP {safeToFixed(remainingBudget)}</Text>
      </View>

      <View style={styles.analyticsContainer}>
        <Text style={styles.remainingBudgetText}>In the following {daysBetween} days, you will save {safeToFixed(remainingBudgetPercentage)}% 
          of your total budget.
        </Text>
      </View>

      <Text style={styles.separator}>Current Analytics </Text>

      <View style={styles.analyticsContainer}>
        <Text style={styles.remainingBudgetText}>Current Remaining Budget: PHP {safeToFixed(budget - totalRemaining)}</Text>
      </View>

      {/* Displaying the total spent */}
      <View style={styles.analyticsContainer}>
        <Text style={styles.remainingBudgetText}>Total Spent: PHP {safeToFixed(totalSpent)}</Text>
      </View>

      {/* Displaying the percentage of total spent */}
      <View style={styles.analyticsContainer}>
        <Text style={styles.remainingBudgetText}>Percentage of Budget Spent: {safeToFixed(percentageSpent)}%</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#15202b",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#2c3e50",
    padding: 10,
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: "white",
    textAlign: "center",
  },
  noDataText: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
  analyticsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#34495e",
    borderRadius: 5,
    alignItems: "center",
  },
  totalText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  analyticsText: {
    fontSize: 13,
    color: "white",
  },
  budgetContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#2ecc71",
    borderRadius: 5,
    alignItems: "center",
  },
  budgetText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  dateText: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    marginTop: 5,
  },
  remainingBudgetContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e74c3c",
    borderRadius: 5,
    alignItems: "center",
  },
  remainingBudgetText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  separator: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

export default ExpenseTable;
