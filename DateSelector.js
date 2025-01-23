import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const DateSelector = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const db = getFirestore();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentSelection, setCurrentSelection] = useState('');

    const onDateChange = (date) => {
        if (currentSelection === 'start') {
            setStartDate(date.dateString);
        } else if (currentSelection === 'end') {
            setEndDate(date.dateString);
        }
        setShowCalendar(false);
    };

    const clearInputs = () => {
        setStartDate('');
        setEndDate('');
        setBudget('');
        Alert.alert('Inputs Cleared', 'All inputs have been reset.');
    };

    const validateBudget = () => {
        const value = parseFloat(budget);
        return !isNaN(value) && value > 0;
    };

    const saveData = async () => {
        const user = auth.currentUser;
        if (user && validateBudget() && startDate && endDate) {
            const userRef = doc(db, 'users', user.uid, 'expenses', 'dates');
            await setDoc(userRef, { startDate, endDate, budget: parseFloat(budget) }, { merge: true });
            Alert.alert('Success', 'Dates and budget saved successfully!');
            clearInputs(); // Reset after saving
        } else {
            Alert.alert('Error', 'Ensure all fields are filled and budget is valid.');
        }
    };

    const handleSubmit = () => {
        if (startDate && endDate && validateBudget()) {
            saveData();
            navigation.goBack(); // Navigate back after submission
        } else {
            Alert.alert('Error', 'Please complete all fields before submitting.');
        }
    };

    const showDatePicker = (type) => {
        setCurrentSelection(type);
        setShowCalendar(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Set Your Dates and Budget</Text>
            <View style={styles.form}>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity style={styles.input} onPress={() => showDatePicker('start')}>
                    <Text style={styles.inputText}>{startDate || 'Select Start Date'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>End Date</Text>
                <TouchableOpacity style={styles.input} onPress={() => showDatePicker('end')}>
                    <Text style={styles.inputText}>{endDate || 'Select End Date'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Total Budget (PHP)</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Enter total budget"
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="numeric"
                />
            </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearButton} onPress={clearInputs}>
                    <Text style={styles.buttonText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={showCalendar} transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.calendarContainer}>
                        <Calendar
                            onDayPress={onDateChange}
                            markedDates={{
                                [startDate]: { selected: true, selectedColor: '#00adf5' },
                                [endDate]: { selected: true, selectedColor: '#00adf5' },
                            }}
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowCalendar(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    inputText: {
        color: '#333',
        fontSize: 16,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    submitButton: {
        backgroundColor: '#4caf50',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    clearButton: {
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    calendarContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#00adf5',
        alignItems: 'center',
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
});

export default DateSelector;
