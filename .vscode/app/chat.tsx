import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import * as Speech from "expo-speech";

export default function ChatScreen() {
  const [messages, setMessages] = useState<{ id: string; from: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [lastAiMessage, setLastAiMessage] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now().toString(), from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Simple AI mock reply
    const aiReply = "This is an AI reply example. Later your teammate will connect real AI.";
    const aiMsg = { id: Date.now().toString() + "_ai", from: "ai", text: aiReply };

    setLastAiMessage(aiReply);
    setMessages((prev) => [...prev, aiMsg]);

    setInput("");
  };

  const handleSpeak = () => {
    if (!lastAiMessage) return;

    Speech.stop();
    Speech.speak(lastAiMessage, {
      language: "en-IN", // Later you will switch by chosen language
      rate: 1.0,
      pitch: 1.0,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Loan Chat</Text>
        <TouchableOpacity style={styles.speakButton} onPress={handleSpeak}>
          <Text style={styles.speakText}>Speak</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.from === "user" ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "700" },
  speakButton: {
    backgroundColor: "#f97316",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  speakText: { color: "white", fontWeight: "600" },
  messageBubble: {
    margin: 8,
    padding: 10,
    borderRadius: 12,
    maxWidth: "75%",
  },
  userBubble: {
    backgroundColor: "#dbeafe",
    alignSelf: "flex-end",
  },
  aiBubble: {
    backgroundColor: "#e5e7eb",
    alignSelf: "flex-start",
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopColor: "#e5e7eb",
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },
  sendText: { color: "white", fontWeight: "600" },
});
