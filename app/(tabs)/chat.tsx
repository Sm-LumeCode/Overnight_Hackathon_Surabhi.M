import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import * as Speech from "expo-speech";
import { recommendLoanType } from "../../src/loanType";

export default function ChatScreen() {
  const [messages, setMessages] = useState<{ id: string; from: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loanStep, setLoanStep] = useState(0);

  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanAmount, setLoanAmount] = useState<number | null>(null);
  const [hasCollateral, setHasCollateral] = useState<boolean | null>(null);

  // -------------------------------------
  // HANDLE MESSAGE SEND
  // -------------------------------------
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      from: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMsg]);

    handleLoanFlow(input.trim().toLowerCase());
    setInput("");
  };

  // -------------------------------------
  // LOAN QUESTION LOGIC (MAIN PART)
  // -------------------------------------
  const handleLoanFlow = (userInput: string) => {

    // Step 0 → Ask purpose
    if (loanStep === 0) {
      const aiMsg = {
        id: Date.now().toString() + "_ai",
        from: "ai",
        text:
          "Great! First, what is the purpose of your loan?\n\nOptions:\n• education\n• home_purchase\n• home_rent\n• business\n• vehicle\n• medical\n• debt_consolidation\n• other",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoanStep(1);
      return;
    }

    // Step 1 → User answers purpose
    if (loanStep === 1) {
      setLoanPurpose(userInput);

      const aiMsg = {
        id: Date.now().toString() + "_ai",
        from: "ai",
        text: "How much loan amount do you need? (Enter numbers only)",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoanStep(2);
      return;
    }

    // Step 2 → User answers amount
    if (loanStep === 2) {
      const amount = Number(userInput);
      if (isNaN(amount)) {
        const aiMsg = {
          id: Date.now().toString() + "_ai",
          from: "ai",
          text: "Please enter a valid number for the amount.",
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }
      setLoanAmount(amount);

      const aiMsg = {
        id: Date.now().toString() + "_ai",
        from: "ai",
        text: "Do you have any collateral? (yes / no)",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoanStep(3);
      return;
    }

    // Step 3 → User answers collateral
    if (loanStep === 3) {
      setHasCollateral(userInput === "yes");

      // Now we have all 3 values → generate loan type
      const result = recommendLoanType({
        purpose: loanPurpose as any,
        amount: loanAmount || 0,
        hasCollateral: userInput === "yes",
      });

      const aiMsg = {
        id: Date.now().toString() + "_ai",
        from: "ai",
        text:
          `Based on your answers, the best loan for you is:\n\n` +
          `👉 **${result.loanType}**\n\n` +
          `If you want to try again, type "restart".`,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoanStep(4);
      return;
    }

    // Step 4 → Restart flow
    if (loanStep === 4 && userInput === "restart") {
      setLoanPurpose("");
      setLoanAmount(null);
      setHasCollateral(null);
      setLoanStep(0);

      const aiMsg = {
        id: Date.now().toString() + "_ai",
        from: "ai",
        text: "Loan process restarted. Tell me again, what is your loan purpose?",
      };
      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    // If user types random things
    const aiMsg = {
      id: Date.now().toString() + "_ai",
      from: "ai",
      text: "Please follow the instructions or type 'restart' to begin again.",
    };
    setMessages((prev) => [...prev, aiMsg]);
  };

  // -------------------------------------
  // TEXT-TO-SPEECH
  // -------------------------------------
  const handleSpeak = (text: string) => {
    Speech.speak(text, { language: "en" });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleSpeak(item.text)}>
            <Text style={item.from === "ai" ? styles.aiText : styles.userText}>
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type here..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// -------------------------------------
// STYLES
// -------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  aiText: {
    backgroundColor: "#eee",
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  userText: {
    backgroundColor: "#4f79ff",
    padding: 12,
    marginVertical: 4,
    color: "white",
    alignSelf: "flex-end",
    borderRadius: 8,
  },
  inputBox: {
    flexDirection: "row",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  sendBtn: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
    borderRadius: 8,
  },
});
