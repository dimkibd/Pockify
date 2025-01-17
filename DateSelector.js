import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert, TextInput } from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Firestore functions
import { getAuth } from "firebase/auth"; // To get current user's ID

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvhnJOnzUJzCc8MiCFs2HksNratuRncnA",
  authDomain: "pockify-41e51.firebaseapp.com",
  projectId: "pockify-41e51",
  storageBucket: "pockify-41e51.appspot.com",
  messagingSenderId: "33391220232",
  appId: "1:33391220232:web:528be8515fd882c1b963bd",
};

const DateSelector = () => {
  const navigation = useNavigation(); // Use the hook to get navigation
  const auth = getAuth(); // Get the Firebase authentication instance
  const db = getFirestore(); // Get Firestore instance

  // Local state management within the DateSelector component
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [budget, setBudget] = useState(""); // State for the budget

  const onDateChange = (date, type) => {
    if (type === "startDate") {
      setStartDate(date.dateString);
      setShowStartDatePicker(false);
    } else if (type === "endDate") {
      setEndDate(date.dateString);
      setShowEndDatePicker(false);
    }
  };

  // Function to save the selected dates and budget to Firestore
  const saveDataToFirestore = async () => {
    const user = auth.currentUser;
    if (user) {
      if (!startDate || !endDate || !budget) {
        Alert.alert("Error", "Start date, end date, and budget are required.");
        return;
      }

      // Validate the budget input
      const parsedBudget = parseFloat(budget);
      if (isNaN(parsedBudget) || parsedBudget <= 0) {
        Alert.alert("Error", "Please enter a valid budget amount.");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid, "expenses", "dates"); // Save data in userSettings > dates
        await setDoc(userRef, {
          startDate,
          endDate,
          budget: parsedBudget,
        }, { merge: true }); // merge=true ensures existing data is not overwritten
        
        // Navigate to the BudgetTracker screen
        navigation.navigate("budgetTracker", {
          startDate,
          endDate,
          budget: parsedBudget,
        });

        Alert.alert("Success", "Dates and budget saved successfully!");
      } catch (error) {
        console.error("Error saving data: ", error);
        Alert.alert("Error", "There was an issue saving the data.");
      }
    } else {
      Alert.alert("Error", "You must be logged in to save the data.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <Text style={styles.label}>Start Date</Text>
        <Text
          style={styles.dateText}
          onPress={() => setShowStartDatePicker(true)}
        >
          {startDate || "Select Start Date"}
        </Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.label}>End Date</Text>
        <Text
          style={styles.dateText}
          onPress={() => setShowEndDatePicker(true)}
        >
          {endDate || "Select End Date"}
        </Text>
      </View>

      <View style={styles.dateContainer}>
        <Text style={styles.label}>Total Budget (PHP)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter total budget"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Set Dates & Budget"
          onPress={saveDataToFirestore} // Save dates and budget to Firestore when clicked
          color="green"
        />
      </View>

      {/* Start Date Picker */}
      {showStartDatePicker && (
        <Calendar
          current={startDate || undefined} // Set current date conditionally
          onDayPress={(day) => onDateChange(day, "startDate")}
          markedDates={{
            [startDate]: { selected: true, selectedColor: "blue" },
          }}
          theme={{
            backgroundColor: "#15202b", // Set background color for the calendar
            calendarBackground: "#15202b",
            textSectionTitleColor: "#b6c1cd",
            textSectionTitleDisabledColor: "#d9e1e8",
            selectedDayBackgroundColor: "#00adf5",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#00adf5",
            dayTextColor: "#2d4150",
            textDisabledColor: "#d9e1e8",
            dotColor: "#00adf5",
            selectedDotColor: "#ffffff",
            arrowColor: "orange",
            disabledArrowColor: "#d9e1e8",
            monthTextColor: "#ffffff",
            indicatorColor: "#ffffff",
            "stylesheet.calendar.header": {
              week: {
                marginTop: 5,
                flexDirection: "row",
                justifyContent: "space-between",
              },
            },
          }}
        />
      )}

      {/* End Date Picker */}
      {showEndDatePicker && (
        <Calendar
          current={endDate || undefined} // Set current date conditionally
          onDayPress={(day) => onDateChange(day, "endDate")}
          markedDates={{
            [endDate]: { selected: true, selectedColor: "blue" },
          }}
          theme={{
            backgroundColor: "#15202b", // Set background color for the calendar
            calendarBackground: "#15202b",
            textSectionTitleColor: "#b6c1cd",
            textSectionTitleDisabledColor: "#d9e1e8",
            selectedDayBackgroundColor: "#00adf5",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#00adf5",
            dayTextColor: "#2d4150",
            textDisabledColor: "#d9e1e8",
            dotColor: "#00adf5",
            selectedDotColor: "#ffffff",
            arrowColor: "orange",
            disabledArrowColor: "#d9e1e8",
            monthTextColor: "blue",
            indicatorColor: "blue",
            "stylesheet.calendar.header": {
              week: {
                marginTop: 5,
                flexDirection: "row",
                justifyContent: "space-between",
              },
            },
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes the full screen
    backgroundColor: "#15202b", // Set the background color for the entire page
    padding: 20,
  },
  label: {
    fontSize: 23,
    marginBottom: 5,
    color: "white", // Change the label color to white
  },
  dateContainer: {
    marginBottom: 10,
  },
  dateText: {
    borderWidth: 1,
    borderColor: "grey",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "white",
    color: "#000", // Set the text color to black for better visibility
  },
  input: {
    borderWidth: 1,
    borderColor: "grey",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "white", // Keep input background white for contrast
    marginTop: 5,
    color: "#000", // Set the text color to black inside the input field
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default DateSelector;
