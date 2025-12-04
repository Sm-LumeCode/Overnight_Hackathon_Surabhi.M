// screens/TestGeminiScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { getLoanAdvice, testGeminiService } from '../services/GeminiService';

const TestGeminiScreen = () => {
  const [testInput, setTestInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [testHistory, setTestHistory] = useState<Array<{input: string, output: string}>>([]);
  const [serviceStatus, setServiceStatus] = useState<string>('Not tested');

  const runTest = async () => {
    if (!testInput.trim()) return;
    
    setLoading(true);
    try {
      const result = await getLoanAdvice(testInput);
      setResponse(result);
      
      // Add to history
      setTestHistory(prev => [
        ...prev.slice(-4), // Keep only last 5
        { input: testInput, output: result.substring(0, 200) + '...' }
      ]);
      
      console.log(`✅ Test successful: "${testInput}"`);
    } catch (error: any) {
      setResponse(`❌ Error: ${error.message}`);
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    try {
      const testCases = [
        'Hello',
        'Loan eligibility',
        'EMI calculation',
        'Interest rates',
        'test'
      ];
      
      let allPassed = true;
      const results: string[] = [];
      
      for (const testCase of testCases) {
        try {
          const result = await getLoanAdvice(testCase);
          results.push(`✅ "${testCase}": ${result.substring(0, 50)}...`);
        } catch (error) {
          results.push(`❌ "${testCase}": Failed`);
          allPassed = false;
        }
      }
      
      Alert.alert(
        allPassed ? '🎉 All Tests Passed!' : '⚠️ Some Tests Failed',
        results.join('\n\n'),
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Running tests failed');
    } finally {
      setLoading(false);
    }
  };

  const checkServiceStatus = async () => {
    setLoading(true);
    try {
      const status = await testGeminiService();
      setServiceStatus(`Mock: ${status.mockWorking ? '✅' : '❌'} | Real: ${status.realGeminiAvailable ? '✅' : '❌'}`);
      
      Alert.alert(
        'Service Status',
        `Status: ${status.status}\n\nMock Working: ${status.mockWorking ? 'YES' : 'NO'}\nReal Gemini: ${status.realGeminiAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'}\n\nTest Response: ${status.testResponse.substring(0, 100)}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setServiceStatus('Error');
      Alert.alert('Error', 'Failed to check service status');
    } finally {
      setLoading(false);
    }
  };

  const clearTests = () => {
    setResponse('');
    setTestHistory([]);
    setServiceStatus('Not tested');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GeminiService Tester</Text>
        <Text style={styles.subtitle}>Test your AI loan advisor service</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Status</Text>
          <Text style={styles.statusText}>{serviceStatus}</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={checkServiceStatus}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Check Status</Text>
          </TouchableOpacity>
        </View>

        {/* Test Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test Input</Text>
          <TextInput
            style={styles.input}
            value={testInput}
            onChangeText={setTestInput}
            placeholder="Enter test message (e.g., 'hello', 'loan eligibility')"
            placeholderTextColor="#999"
            multiline
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={runTest}
              disabled={loading || !testInput.trim()}
            >
              <Text style={styles.buttonText}>Run Test</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button} 
              onPress={runAllTests}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Run All Tests</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Test Buttons */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Tests</Text>
          <View style={styles.quickButtons}>
            {['hello', 'eligibility', 'emi', 'interest', 'test'].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.quickButton}
                onPress={() => {
                  setTestInput(item);
                  setTimeout(() => runTest(), 100);
                }}
                disabled={loading}
              >
                <Text style={styles.quickButtonText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Response */}
        {response ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Response</Text>
            <View style={styles.responseBox}>
              <Text style={styles.responseText}>{response}</Text>
            </View>
          </View>
        ) : null}

        {/* Test History */}
        {testHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Test History</Text>
            {testHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyInput}>📝 {item.input}</Text>
                <Text style={styles.historyOutput}>🤖 {item.output}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Testing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={clearTests}>
          <Text style={styles.footerButtonText}>Clear All</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Enter 'test' to verify service is working
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#666',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickButtonText: {
    color: '#4A90E2',
    fontSize: 13,
    fontWeight: '500',
  },
  responseBox: {
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  responseText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  historyItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyInput: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
    marginBottom: 3,
  },
  historyOutput: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  footer: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  footerButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  footerButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default TestGeminiScreen;