import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView, Button, FlatList } from 'react-native';
import { Picker } from 'react-native';

const App = () => {
  const [expense, setExpense] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);


  const addExpense = () => {
    if (expense && amount) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        Alert.alert('Please enter a valid amount.');
        return;
      }
      setExpenses([
        ...expenses,
        { id: Date.now(), expense, amount: numericAmount, },
      ]);
      setTotal(total + numericAmount);
      setExpense('');
      setAmount('');
    } else {
      Alert.alert('Please fill in both fields.');
    }
  };

  const deleteExpense = (id, amount) => {
    const updatedExpenses = expenses.filter((item) => item.id !== id);
    setExpenses(updatedExpenses);
    setTotal(total - amount);
  };

  const renderExpense = ({ item }) => (
    <View style={styles.expenseItem}>
      <View>
        <Text style={styles.expenseText}>
        </Text>
        <Text style={styles.expenseAmount}>PHP{item.amount.toFixed(2)}</Text>
      </View>
      <Button
        title="Delete"
        color="red"
        onPress={() => deleteExpense(item.id, item.amount)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Budget Tracker</Text>
      <Text style={styles.total}>Total: PHP{total.toFixed(2)}</Text>

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
        <Button title="Add Expense" color="green" onPress={addExpense} />
      </View>

      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id.toString()}
        style={styles.expenseList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'green',
  },
  inputContainer: {
    marginBottom: 20,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  expenseList: {
    marginTop: 10,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  expenseText: {
    fontSize: 16,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;