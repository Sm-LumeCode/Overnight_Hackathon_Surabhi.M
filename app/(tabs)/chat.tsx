import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import * as Speech from "expo-speech";
import { recommendLoanType } from "../../src/loanType";

type Msg = { id: string; from: "user" | "ai"; text: string };

export default function ChatScreen() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loanStep, setLoanStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  const [loanPurpose, setLoanPurpose] = useState<string>("");
  const [loanAmount, setLoanAmount] = useState<number | null>(null);
  const [hasCollateral, setHasCollateral] = useState<boolean | null>(null);
  const [lastAiMessage, setLastAiMessage] = useState("");

  const addMessage = (from: "user" | "ai", text: string) => {
    const msg: Msg = { id: Date.now().toString() + Math.random(), from, text };
    setMessages((prev) => [...prev, msg]);
    if (from === "ai") setLastAiMessage(text);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    addMessage("user", trimmed);
    handleLoanFlow(trimmed.toLowerCase());
    setInput("");
  };

  const handleLoanFlow = (userInput: string) => {
    // Step 0: start flow
    if (loanStep === 0) {
      addMessage(
        "ai",
        "Welcome! Let's understand which loan fits you.\n\nFirst, what is the purpose of your loan?\nOptions: education, home_purchase, home_rent, business, vehicle, medical, debt_consolidation, other."
      );
      setLoanStep(1);
      return;
    }

    // Step 1: purpose
    if (loanStep === 1) {
      setLoanPurpose(userInput);
      addMessage(
        "ai",
        "Got it. Approximately how much loan amount do you need? (only numbers, in rupees)"
      );
      setLoanStep(2);
      return;
    }

    // Step 2: amount
    if (loanStep === 2) {
      const amount = Number(userInput.replace(/[^0-9]/g, ""));
      if (isNaN(amount) || amount <= 0) {
        addMessage("ai", "Please enter a valid number for the amount.");
        return;
      }
      setLoanAmount(amount);
      addMessage(
        "ai",
        "Do you have any collateral (property/vehicle) to keep as security? (yes / no)"
      );
      setLoanStep(3);
      return;
    }

    // Step 3: collateral
    if (loanStep === 3) {
      const hasCol =
        userInput.includes("yes") ||
        userInput.includes("ha") ||
        userInput.includes("haan") ||
        userInput.includes("houdu");
      setHasCollateral(hasCol);

      const recommendation = recommendLoanType({
        purpose: (loanPurpose || "other") as any,
        amount: loanAmount || 0,
        hasCollateral: hasCol,
      });

      let explanation =
        `Based on your answers, the most suitable loan for you is:\n\n` +
        `👉 ${recommendation.loanType}\n\n`;

      if (recommendation.subtype) {
        explanation += `Type: ${recommendation.subtype}\n\n`;
      }

      explanation +=
        `This is a rough suggestion. In the full app, the AI will explain documents, interest range, and next steps in your language.\n\n` +
        `If you want to try again with different details, type "restart".`;

      addMessage("ai", explanation);
      setLoanStep(4);
      return;
    }

    // Step 4: restart
    if (loanStep === 4 && userInput.includes("restart")) {
      setLoanPurpose("");
      setLoanAmount(null);
      setHasCollateral(null);
      setLoanStep(0);
      addMessage("ai", "Loan flow restarted. Tell me your loan purpose again.");
      return;
    }

    addMessage(
      "ai",
      'Please follow the steps or type "restart" to start over.'
    );
  };

  const handleSpeak = () => {
    if (!lastAiMessage) return;
    Speech.stop();
    Speech.speak(lastAiMessage, {
      language: "en-IN",
      rate: 1.0,
      pitch: 1.0,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Loan Advisor Chat</Text>
        <TouchableOpacity style={styles.speakBtn} onPress={handleSpeak}>
          <Text style={styles.speakText}>Speak</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.from === "user" ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={{
                color: item.from === "user" ? "white" : "#111827",
              }}
            >
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 16, backgroundColor: "#f3f4f6" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "700" },
  speakBtn: {
    backgroundColor: "#f97316",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  speakText: { color: "white", fontWeight: "600", fontSize: 12 },
  bubble: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
  },
  inputRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#16a34a",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 10,
  },
  sendText: { color: "white", fontWeight: "600" },
});

