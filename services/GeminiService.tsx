// services/GeminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// For testing without API key - MOCK implementation
const MOCK_MODE = true; // Set to false when you have API key

// Mock responses for testing
const MOCK_RESPONSES: Record<string, string> = {
  "hello": "👋 Hello! I'm your AI Loan Advisor. How can I help you with loans today?",
  "eligibility": "To check loan eligibility, I need:\n1. Monthly Income\n2. Age\n3. Employment Type\n4. City Tier\n5. Existing EMIs\n\nExample: \"I'm 30, salaried, earning ₹75,000/month\"",
  "emi": "EMI = [P × R × (1+R)^N] / [(1+R)^N-1]\n\nExample: ₹5 lakhs at 11% for 5 years = ₹10,870/month",
  "interest rate": "Current rates:\n• Personal Loans: 10.5-15.5%\n• Home Loans: 8.5-9.5%\n• Car Loans: 9.0-12.0%",
  "personal loan": "Personal Loan:\n• Amount: ₹50K-₹25L\n• Tenure: 1-5 years\n• Rate: 10.5-15.5%\n• Processing: 1-3%",
  "home loan": "Home Loan:\n• Amount: Up to ₹5Cr\n• Tenure: Up to 30 years\n• Rate: 8.5-9.5%\n• LTV: 80-90%",
  "documents": "Required documents:\n1. PAN & Aadhaar\n2. Income proof\n3. Address proof\n4. Bank statements",
  "default": "I can help with:\n• Loan eligibility\n• EMI calculations\n• Interest rates\n• Document requirements\n\nTry: \"What loans can I get with ₹50k salary?\""
};

// Real Gemini API function (will use mock if no API key)
let realGeminiInitialized = false;
let geminiModel: any = null;

const initializeGemini = () => {
  if (!realGeminiInitialized) {
    const API_KEY = process.env.GEMINI_API_KEY || '';
    
    if (API_KEY && API_KEY !== 'YOUR_API_KEY_HERE' && !MOCK_MODE) {
      try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        geminiModel = genAI.getGenerativeModel({ 
          model: "gemini-pro",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        });
        realGeminiInitialized = true;
        console.log("✅ Gemini AI initialized successfully");
      } catch (error) {
        console.error("❌ Gemini initialization failed:", error);
      }
    }
  }
};

export const getLoanAdvice = async (userMessage: string, context?: any): Promise<string> => {
  console.log(`📨 User Message: "${userMessage}"`);
  
  // Initialize Gemini if needed
  initializeGemini();
  
  // If real Gemini is available and not in mock mode, use it
  if (geminiModel && !MOCK_MODE) {
    try {
      return await getRealGeminiAdvice(userMessage);
    } catch (error) {
      console.error("Gemini API failed, falling back to mock:", error);
      // Fall through to mock
    }
  }
  
  // Use mock responses
  return getMockLoanAdvice(userMessage);
};

export const getMockLoanAdvice = (userMessage: string): string => {
  console.log("🤖 Using MOCK response");
  
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Check for keywords and return appropriate mock response
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return MOCK_RESPONSES.hello;
  } else if (lowerMessage.includes('eligibility') || lowerMessage.includes('eligible')) {
    return MOCK_RESPONSES.eligibility;
  } else if (lowerMessage.includes('emi') || lowerMessage.includes('monthly payment')) {
    return MOCK_RESPONSES.emi;
  } else if (lowerMessage.includes('interest rate') || lowerMessage.includes('interest')) {
    return MOCK_RESPONSES["interest rate"];
  } else if (lowerMessage.includes('personal loan')) {
    return MOCK_RESPONSES["personal loan"];
  } else if (lowerMessage.includes('home loan') || lowerMessage.includes('housing')) {
    return MOCK_RESPONSES["home loan"];
  } else if (lowerMessage.includes('car loan') || lowerMessage.includes('vehicle')) {
    return "Car Loan:\n• Amount: Up to 90% of car value\n• Tenure: 1-7 years\n• Rate: 9.0-12.0%\n• Quick approval available";
  } else if (lowerMessage.includes('document') || lowerMessage.includes('paper')) {
    return MOCK_RESPONSES.documents;
  } else if (lowerMessage.includes('thank')) {
    return "You're welcome! 😊 Let me know if you have more questions about loans.";
  } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return "Goodbye! 👋 Feel free to return if you need more loan advice.";
  } else if (lowerMessage.includes('test') || lowerMessage.includes('debug')) {
    return "🟢 TEST SUCCESSFUL!\n\nGeminiService is working correctly.\nMock mode: " + (MOCK_MODE ? "ON" : "OFF") + 
           "\nReal Gemini: " + (realGeminiInitialized ? "AVAILABLE" : "NOT AVAILABLE");
  } else {
    return MOCK_RESPONSES.default;
  }
};

export const getRealGeminiAdvice = async (message: string): Promise<string> => {
  console.log("🚀 Using REAL Gemini AI");
  
  if (!geminiModel) {
    throw new Error("Gemini model not initialized");
  }
  
  try {
    const prompt = `You are an AI loan advisor. Respond helpfully and concisely to this loan-related question: "${message}"
    
    Keep response under 150 words. Focus on practical loan advice.`;
    
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Gemini response received");
    return text;
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    throw error;
  }
};

// Test function to verify service works
export const testGeminiService = async (): Promise<{
  status: string;
  mockWorking: boolean;
  realGeminiAvailable: boolean;
  testResponse: string;
}> => {
  console.log("🧪 Testing GeminiService...");
  
  try {
    // Test mock response
    const mockResponse = getMockLoanAdvice("test");
    const mockWorking = mockResponse.includes("TEST") || mockResponse.length > 0;
    
    // Test real Gemini if available
    let realGeminiAvailable = false;
    if (geminiModel) {
      try {
        const testPrompt = "Say 'Gemini working' if you can read this.";
        const result = await geminiModel.generateContent(testPrompt);
        const response = await result.response;
        realGeminiAvailable = response.text().includes("Gemini") || response.text().length > 0;
      } catch (error) {
        console.log("Real Gemini test failed (expected if no API key)");
      }
    }
    
    return {
      status: mockWorking ? "PASS" : "FAIL",
      mockWorking,
      realGeminiAvailable,
      testResponse: mockResponse
    };
  } catch (error) {
    console.error("Test failed:", error);
    return {
      status: "FAIL",
      mockWorking: false,
      realGeminiAvailable: false,
      testResponse: `Error: ${error}`
    };
  }
};

// Function to extract user profile from message
export const extractProfileFromMessage = (message: string) => {
  const profile: any = {};
  const numbers = message.match(/\d+/g)?.map(Number) || [];
  
  // Look for income patterns
  if (message.toLowerCase().includes('income') || 
      message.toLowerCase().includes('salary') || 
      message.toLowerCase().includes('earn')) {
    const income = numbers.find(n => n > 10000 && n < 1000000);
    if (income) profile.monthlyIncome = income;
  }
  
  // Look for age
  if (message.toLowerCase().includes('age') || 
      message.toLowerCase().includes('old')) {
    const age = numbers.find(n => n > 18 && n < 70);
    if (age) profile.age = age;
  }
  
  // Look for EMIs
  if (message.toLowerCase().includes('emi') || 
      message.toLowerCase().includes('existing loan')) {
    const emi = numbers.find(n => n > 1000 && n < 100000);
    if (emi) profile.existingEMIs = emi;
  }
  
  return Object.keys(profile).length > 0 ? profile : null;
};