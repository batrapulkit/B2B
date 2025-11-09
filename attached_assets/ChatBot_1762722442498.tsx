import { useState, useEffect, useRef } from "react";
import { Calendar, Sparkles, MapPin, TrendingUp, Globe, Send, Mic, X, Plane, Heart, Zap, Coffee, Sun, Moon, DollarSign, Users, Clock, Hotel } from "lucide-react";
import { marked } from "marked";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from "wouter";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

// 🔥 DB Helper Functions
const getCurrentUserId = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
};

const saveChatToDB = async (chatId: string, userId: string | null, message: any, metadata: any = {}) => {
  try {
    const { data: existingChat } = await supabase
      .from('chat_history')
      .select('*')
      .eq('chat_id', chatId)
      .maybeSingle();

    if (existingChat) {
      const updatedMessages = [...(existingChat.messages || []), message];
      await supabase
        .from('chat_history')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
          ...metadata
        })
        .eq('chat_id', chatId);
    } else {
      await supabase
        .from('chat_history')
        .insert({
          id: uuidv4(),
          chat_id: chatId,
          user_id: userId,
          messages: [message],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...metadata
        });
    }
  } catch (error) {
    console.error('DB save warning:', error);
  }
};

const saveItineraryToDB = async (userId: string | null, chatId: string, itineraryData: any, geminiResponse: any, planId: string) => {
  try {
    const itineraryId = uuidv4();
    const durationMatch = itineraryData.duration?.match(/(\d+)/);
    const duration = durationMatch ? `${durationMatch[1]} days` : itineraryData.duration;

    console.log('💾 Saving itinerary with plan_id:', planId);
    console.log('📦 Chat ID:', chatId);
    console.log('📦 Itinerary data:', itineraryData);

    const insertData = {
      id: itineraryId,
      user_id: userId,
      plan_id: planId,
      chat_id: chatId,
      destination: itineraryData.destination || '',
      thumbnail: itineraryData.thumbnail || '',
      duration: duration || '',
      budget: itineraryData.budget || '',
      travelers: parseInt(itineraryData.travelers) || 1,
      interest: itineraryData.interest || '',
      total_cost: itineraryData.totalCost || '',
      flights: itineraryData.flights || null,
      hotel: itineraryData.hotel || null,
      weather: itineraryData.weather || null,
      full_response: geminiResponse || null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('🚀 Inserting to Supabase:', insertData);

    const { data, error } = await supabase.from('itineraries').insert(insertData).select();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }

    console.log('✅ Successfully inserted itinerary:', data);

    // Update chat_history
    const { error: updateError } = await supabase
      .from('chat_history')
      .update({
        itinerary: { itinerary_id: itineraryId, plan_id: planId },
        updated_at: new Date().toISOString()
      })
      .eq('chat_id', chatId);

    if (updateError) {
      console.error('⚠️ Chat history update error:', updateError);
    }

    console.log('✅ Saved to DB - Itinerary ID:', itineraryId, '- Plan ID:', planId);
    return { itineraryId, planId };
  } catch (error) {
    console.error('❌ DB save error:', error);
    throw error;
  }
};

// Animated typing effect component
const TypingText = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 1);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayText}</span>;
};

// Mood-based responses
// Mood-based responses
const getMoodResponse = (mood) => {
  const responses = {
    adventurous: {
      text: "🏔️ Love the energy! Let's find you an adrenaline-pumping adventure!",
      destinations: ["Queenstown, New Zealand", "Interlaken, Switzerland", "Costa Rica", "Iceland"],
      interest: "Adventure & outdoor"
    },
    relaxed: {
      text: "😌 Perfect! Time to unwind. I'll find you the most peaceful escapes.",
      destinations: ["Maldives", "Bali, Indonesia", "Santorini, Greece", "Seychelles"],
      interest: "Relaxation & spa"
    },
    romantic: {
      text: "💕 How lovely! Let's plan an unforgettable romantic getaway.",
      destinations: ["Paris, France", "Venice, Italy", "Santorini, Greece", "Kyoto, Japan"],
      interest: "Romantic & scenic"
    },
    foodie: {
      text: "🍜 Yum! Let's explore the world's best culinary destinations!",
      destinations: ["Tokyo, Japan", "Bangkok, Thailand", "Barcelona, Spain", "Lyon, France"],
      interest: "Food & dining"
    },
    party: {
      text: "🎉 Let’s get the party started! Here are some of the best nightlife and festival destinations!",
      destinations: ["Ibiza, Spain", "Bangkok, Thailand", "Berlin, Germany", "Miami, USA"],
      interest: "Nightlife & entertainment"
    },
    other: {
      text: "🌍 Awesome! Tell me where you'd like to go, any country or city in mind?",
      destinations: [],
      interest: "User-defined"
    }
  };

  return responses[mood] || responses.other;
};


// Intent detection
const detectIntent = (text) => {
  const lower = text.toLowerCase();

  // Mood detection (5 moods + party)
  const moods = {
    adventurous: /adventure|thrill|excit|adrenaline|extreme|wild|active/i,
    relaxed: /relax|chill|peace|calm|unwind|spa|beach|quiet/i,
    romantic: /romantic|love|honeymoon|couple|valentine|anniversary/i,
    foodie: /food|cuisine|eat|restaurant|culinary|taste|gastronomic/i,
    party: /party|nightlife|club|bar|festival|dance|music/i
  };

  for (const [mood, pattern] of Object.entries(moods)) {
    if (pattern.test(lower)) {
      return { type: "mood", mood };
    }
  }

  // Duration detection
  const durationPatterns = [
    { regex: /(\d+)\s*(day|week)s?\s*(trip|vacation|holiday|getaway)/i, multiplier: { day: 1, week: 7 } },
    { regex: /weekend/i, days: 3 },
    { regex: /quick|short/i, days: 3 },
    { regex: /long|extended/i, days: 10 },
    { regex: /disappear.*?(\d+)\s*days?/i, direct: true }
  ];

  for (const pattern of durationPatterns) {
    const match = lower.match(pattern.regex);
    if (match) {
      if (pattern.direct) {
        return { type: "duration", days: parseInt(match[1]) };
      } else if (pattern.days) {
        return { type: "duration", days: pattern.days };
      } else {
        const unit = match[2];
        const days = parseInt(match[1]) * (pattern.multiplier[unit] || 1);
        return { type: "duration", days };
      }
    }
  }

  // Surprise detection
  if (/surprise|random|pick.*?me|choose.*?me|decide/i.test(lower)) {
    return { type: "surprise", days: 5 };
  }

  // If user typed a destination or general travel intent, classify as “other”
  if (
    /travel|trip|vacation|holiday|explore|visit|go somewhere|plan|destination/i.test(lower) ||
    /[a-zA-Z]{2,}\s*(,?\s*[a-zA-Z]{2,})?/.test(lower)
  ) {
    return { type: "mood", mood: "other" };
  }

  // Default fallback
  return { type: "mood", mood: "other" };
}; // ✅ closes detectIntent properly


// Trip Summary Card Component
const TripSummaryCard = ({ trip, onModify, onViewFullPlan }) => {
  console.log("TripSummaryCard rendered with trip:", trip);
  console.log("onViewFullPlan handler:", onViewFullPlan);
  
  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl p-6 border-2 border-purple-200 shadow-xl animate-slideUp">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{trip.destination}</h3>
            <p className="text-sm text-gray-600">Your perfect itinerary is ready!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Duration</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{trip.duration}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 text-pink-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-semibold">Budget</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{trip.budget}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold">Travelers</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{trip.travelers}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold">Vibe</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{trip.interest}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            console.log("Modify button clicked");
            if (onModify) onModify();
          }}
          className="flex-1 bg-white border-2 border-purple-300 text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition"
        >
          Modify Plan
        </button>
        <button
          onClick={() => {
            console.log("View Full Plan button clicked!");
            console.log("Trip plan_id:", trip.plan_id);
            if (onViewFullPlan) {
              onViewFullPlan();
            } else {
              console.error("onViewFullPlan handler is missing!");
            }
          }}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition cursor-pointer"
        >
          View Full Plan
        </button>
      </div>
    </div>
  );
};

// Enhanced Date Picker
const DatePicker = ({ onDateSelect, onClose }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedQuick, setSelectedQuick] = useState(null);

  const handleQuickSelect = (days) => {
    setSelectedQuick(days);
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 7);
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    
    setTimeout(() => {
      onDateSelect(`${days} days (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`);
    }, 300);
  };

  const handleCustomSubmit = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      onDateSelect(`${diffDays} days (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Pick Your Dates</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Quick Pick
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 7, 10, 14, 21].map(days => (
                <button 
                  key={days}
                  onClick={() => handleQuickSelect(days)} 
                  className={`relative overflow-hidden py-3 rounded-xl transition-all font-semibold ${
                    selectedQuick === days 
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-105 shadow-lg' 
                      : 'bg-gradient-to-br from-blue-50 to-purple-50 text-purple-700 hover:scale-105 border border-purple-200'
                  }`}
                >
                  {selectedQuick === days && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  )}
                  <span className="relative">{days}d</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-sm text-gray-500">or choose custom dates</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {startDate && endDate && (
            <button 
              onClick={handleCustomSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-slideUp"
            >
              Confirm Selection ✨
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon, label, onClick, gradient }) => (
  <button
    onClick={onClick}
    className={`group relative overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r ${gradient} text-white text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105`}
  >
    <div className="relative z-10 flex items-center gap-2">
      {icon}
      {label}
    </div>
    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-300"></div>
  </button>
);

// Context-based suggestion chip
const SuggestionChip = ({ text, onClick, emoji }) => (
  <button
    onClick={onClick}
    className="group px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-purple-700 rounded-full text-sm font-medium transition-all hover:shadow-md border border-purple-200 hover:scale-105 flex items-center gap-2"
  >
    {emoji && <span className="group-hover:scale-125 transition-transform">{emoji}</span>}
    {text}
  </button>
);

// Typing Indicator
const TypingIndicator = () => (
  <div className="flex justify-start animate-slideInLeft">
    <div className="bg-white rounded-3xl px-6 py-4 shadow-md border border-gray-100 rounded-bl-md">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
);

// Main ChatBot Component
const ChatBot = ({ isOpen = true, onClose, onStartPlanning, initialInput = "" }) => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm Tono ✨",
      type: "text",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [conversationState, setConversationState] = useState("initial");
  const [collectedData, setCollectedData] = useState({
    location: "",
    date: "",
    budget: "",
    travelers: "",
    interest: "",
  });
  const chatRef = useRef(null);
  const chatIdRef = useRef<string | null>(null);
  const inputRef = useRef(null);
  const [, setLocation] = useLocation();

  // Initialize chat ID
  useEffect(() => {
    if (isOpen && !chatIdRef.current) {
      chatIdRef.current = `chat-${Date.now()}`;
      localStorage.setItem("currentChatId", chatIdRef.current);
    }

    if (!isOpen) {
      chatIdRef.current = null;
      localStorage.removeItem("currentChatId");
    }
  }, [isOpen]);

  // Add welcome message
  
useEffect(() => {
  if (messages.length === 1) {
    // Ensure typing animation is turned off
    if (typeof setIsTyping === "function") setIsTyping(false);

    // Instantly add the welcome message
    setMessages(prev => [
      ...prev,
      {
        sender: "bot",
        text: "What kind of trip are you dreaming about? 🌍 You can pick a mood or simply type any destination, like ‘Japan’ or ‘Paris’.",
        type: "text",
        showMoods: true,
        timestamp: Date.now()
      }
    ]);
  }
}, [messages]);

  // Handle initial input
  useEffect(() => {
    if (initialInput && initialInput.trim() !== "") {
      handleInputSubmit(initialInput);
    }
  }, [initialInput]);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Text-to-speech
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = "en-US";
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => voice.name === "Google US English");
      if (preferredVoice) speech.voice = preferredVoice;
      window.speechSynthesis.speak(speech);
    }
  };

    // Validate destination using a simple check for now
  const isValidDestination = (destination: string): boolean => {
    if (!destination) return false;
    // Basic validation - you can enhance this with a more robust check
    // like calling a geocoding API or using a list of valid destinations
    return destination.trim().length > 1; // At least 2 characters
  };

  // Call Gemini API
  const callGemini = async (userMessage: string, messages: any[], finalCollectedData?: any) => {
    try {
      const rawLocation = localStorage.getItem("userLocation");
      let locationDetails = { city: "", state: "", countryCode: "", currency: "" };

      if (rawLocation) {
        try {
          locationDetails = JSON.parse(rawLocation);
        } catch (e) {
          console.warn("Failed to parse location");
        }
      }

      const dataToUse = finalCollectedData || collectedData;

      const prompt = `You are an AI travel planner. Generate a complete trip itinerary.

Trip Details:
- Destination: ${dataToUse.location}
- Duration: ${dataToUse.date}
- Travelers: ${dataToUse.travelers}
- Budget: ${dataToUse.budget}
- Interests: ${dataToUse.interest}
- User City: ${locationDetails.city || "unknown"}
- Currency: ${locationDetails.currency || "USD"}

Return ONLY valid JSON:

{
  "content": "Welcome message (50-80 words)",
  "detailedPlan": {
    "destination": "${locationDetails.city}",
    "description": "Description (40-60 words)",
    "thumbnail": "Landmark name",
    "duration": "${dataToUse.date}",
    "travelers": ${dataToUse.travelers.match(/\d+/)?.[0] || 1},
    "budget": "${dataToUse.budget}",
    "interest": "${dataToUse.interest}",
    "totalCost": "Estimated cost range",
    "flights": { "departure": "${locationDetails.city}", "price": "$XXX", "airline": "Name", "duration": "X hours" },
    "hotel": { "name": "Hotel name", "location": "Area", "price": "$XXX/night", "rating": 4.5, "amenities": ["WiFi", "Breakfast"] },
    "dailyPlan": [
      {
        "day": 1,
        "title": "Day title",
        "description": "Brief description",
        "activities": ["Activity 1", "Activity 2", "Activity 3", "Activity 4"],
        "activitiesDescription": ["Detail 1 (30-40 words)", "Detail 2", "Detail 3", "Detail 4"],
        "travelTips": ["Tip 1", "Tip 2"],
        "meals": { "breakfast": "Suggestion", "lunch": "Suggestion", "dinner": "Suggestion" },
        "notes": "Notes",
        "image": "Landmark",
        "weather": "Weather",
        "transport": "Transport"
      }
    ],
    "weather": { "temp": "XX-XX°C", "condition": "Condition", "recommendation": "What to pack" }
  },
  "suggestions": ["Tip 1", "Tip 2", "Tip 3"]
}

Generate ${dataToUse.date.match(/\d+/)?.[0] || 5} days. Return pure JSON only.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 8192 }
          })
        }
      );

      if (!isValidDestination(dataToUse.location)) {
        return "⚠️ I couldn't find that place. Try rephrasing or checking the spelling.";
      }

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) throw new Error("No text in response");

      let cleanText = textResponse.trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/```\s*$/g, "");

      const parsed = JSON.parse(cleanText);

      if (parsed?.content && parsed?.detailedPlan) {
        return parsed;
      }

      throw new Error("Invalid JSON structure");

    } catch (error) {
      console.error("Gemini Error:", error);
      return { error: error.message || "API call failed" };
    }
  };

  // Generate trip plan
  const generateTripPlan = async (finalData) => {
    console.log("🚀 Starting trip generation with:", finalData);
    
    try {
      setLoading(true);

      const required = ['location', 'date', 'budget', 'travelers', 'interest'];
      const missing = required.filter(key => !finalData[key]);
      
      if (missing.length > 0) {
        throw new Error(`Missing: ${missing.join(', ')}`);
      }

      const userId = await getCurrentUserId();

      const confirmMsg = { 
        sender: "bot", 
        text: "Perfect! Creating your personalized trip plan... ✈️", 
        suggestions: [], 
        type: "text" 
      };
      setMessages(prev => [...prev, confirmMsg]);
      
      if (chatIdRef.current) {
        saveChatToDB(chatIdRef.current, userId, { role: "assistant", content: confirmMsg.text, timestamp: new Date().toISOString() });
      }
      
      await new Promise(r => setTimeout(r, 1000));

      const genMsg = { 
        sender: "bot", 
        text: "✨ Tono is crafting your itinerary...", 
        suggestions: [], 
        type: "text" 
      };
      setMessages(prev => [...prev, genMsg]);
      await new Promise(r => setTimeout(r, 1500));

      const botResponse = await callGemini("", messages, finalData);

      if (botResponse.error) {
        throw new Error(botResponse.error);
      }

      const uniqueId = Date.now().toString();
      const planId = `plan-${uniqueId}`;

      const botMessage = { 
        sender: "bot", 
        id: uniqueId, 
        plan_id: planId, 
        ...botResponse, 
        type: "tripPlan" 
      };

      setMessages(prev => [...prev, botMessage]);

      const historyKey = `chatHistory-${planId}`;
      localStorage.setItem(historyKey, JSON.stringify([{
        id: uniqueId,
        plan_id: planId,
        timestamp: new Date().toISOString(),
        userPrompt: `${finalData.location} | ${finalData.date} | ${finalData.budget} | ${finalData.travelers} | ${finalData.interest}`,
        geminiResponse: botResponse,
      }]));

      if (chatIdRef.current && botResponse.detailedPlan) {
        saveItineraryToDB(userId, chatIdRef.current, { ...botResponse.detailedPlan, plan_id: planId, budget: finalData.budget, interest: finalData.interest }, botResponse);
      }

    } catch (error) {
      console.error("❌ Generation error:", error);
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: `⚠️ Error: ${error.message}. Please try again.`, 
        suggestions: [], 
        type: "text" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Auto trip generator based on intent
  const generateAutoTrip = async (intent) => {
    setLoading(true);

    let tripData = { ...collectedData };

    if (intent.type === 'mood') {
      const moodData = getMoodResponse(intent.mood);
      
      const moodMsg = {
        sender: "bot",
        text: moodData.text,
        type: "text",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, moodMsg]);
      await new Promise(r => setTimeout(r, 1000));

      tripData.interest = moodData.interest;
      tripData.location = moodData.destinations[Math.floor(Math.random() * moodData.destinations.length)];
    }

    if (intent.type === 'duration') {
      tripData.date = `${intent.days} days`;
    }

    if (intent.type === 'surprise') {
      const surpriseDestinations = [
        "Bali, Indonesia", "Barcelona, Spain", "Tokyo, Japan", 
        "Santorini, Greece", "Dubai, UAE", "Iceland"
      ];
      tripData.location = surpriseDestinations[Math.floor(Math.random() * surpriseDestinations.length)];
      tripData.date = `${intent.days} days`;
    }

    // Fill missing data with smart defaults
    if (!tripData.budget) tripData.budget = "Mid-range ($1500-3000)";
    if (!tripData.travelers) tripData.travelers = "1";
    if (!tripData.interest) tripData.interest = "Mixed";

    setCollectedData(tripData);

    // Check if we have enough data to generate
    if (tripData.location && tripData.date) {
      await generateTripPlan(tripData);
    } else {
      // Ask for missing info
      if (!tripData.location) {
        setConversationState("location");
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: "bot",
            text: "Where would you like to go?",
            type: "text",
            showTrending: true,
            timestamp: Date.now()
          }]);
          setLoading(false);
        }, 800);
      } else if (!tripData.date) {
        setConversationState("date");
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: "bot",
            text: "When are you planning to travel?",
            type: "text",
            showCalendar: true,
            timestamp: Date.now()
          }]);
          setLoading(false);
        }, 800);
      }
    }
  };

  // Handle input submission
  const handleInputSubmit = async (inputValue?: string) => {
    const userText = (inputValue ?? input).trim();
    if (!userText || loading) return;

    console.log("\n📍 State:", conversationState, "| Input:", userText);
    
    // Check for casual conversation keywords
    const lowerUserText = userText.toLowerCase();
    
    const greetingKeywords = [
      "hi", "hello", "hey", "hola", "namaste", "what's up", "sup",
      "good morning", "good afternoon", "good evening", "greetings"
    ];

    const identityKeywords = [
      "who are you", "what is your name", "what are you", "are you an ai",
      "tell me about yourself"
    ];

    const pleasantryKeywords = [
      "how are you", "how are you doing", "how's it going"
    ];
    
    let hardcodedResponse = null;

    if (greetingKeywords.some(keyword => lowerUserText === keyword)) {
      hardcodedResponse = "👋 Hello! I'm here to help you plan your perfect trip. What's your destination?";
    } else if (identityKeywords.some(keyword => lowerUserText.includes(keyword))) {
      hardcodedResponse = "I'm Tono, your AI Travel Planning Expert for Triponic. I'm here to turn your travel dreams into a seamless itinerary!";
    } else if (pleasantryKeywords.some(keyword => lowerUserText.includes(keyword))) {
      hardcodedResponse = "I'm doing great, thanks for asking! How about we start planning your next adventure?";
    } else if (lowerUserText === "thanks" || lowerUserText === "thank you") {
      hardcodedResponse = "You're most welcome! Let me know if you need any more help.";
    } else if (lowerUserText === "bye" || lowerUserText === "goodbye") {
      hardcodedResponse = "Goodbye! Happy travels and see you soon on Triponic.";
    }

    if (hardcodedResponse) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: userText, type: "text", suggestions: [] },
        { sender: "bot", text: hardcodedResponse, type: "text", suggestions: [] },
      ]);
      setInput("");
      return;
    }

    // Clear input and add user message
    setInput("");
    
    const userMsg = { sender: "user", text: userText, type: "text", suggestions: [] };
    setMessages(prev => [...prev, userMsg]);

    // Save user message to DB
    const userId = await getCurrentUserId();
    if (chatIdRef.current) {
      saveChatToDB(chatIdRef.current, userId, { role: "user", content: userText, timestamp: new Date().toISOString() });
    }

    setLoading(true);

    // Detect intent
    const intent = detectIntent(userText);
    
    if (intent && conversationState === "initial") {
      await generateAutoTrip(intent);
      return;
    }

    // Normal conversation flow
    if (conversationState === "initial") {
      setCollectedData(prev => ({ ...prev, location: userText }));
      setConversationState("date");
      
      setTimeout(() => {
        const botMsg = {
          sender: "bot",
          text: `Great choice! ${userText} is amazing! 🌟 When would you like to go?`,
          type: "text",
          showCalendar: true,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMsg]);
        
        if (chatIdRef.current) {
          saveChatToDB(chatIdRef.current, userId, { role: "assistant", content: botMsg.text, timestamp: new Date().toISOString() });
        }
        setLoading(false);
      }, 800);
      return;
    }

    // Define the flow sequence
    const flowSequence = {
      location: {
        storeIn: "location",
        nextQuestion: "Great! When are you planning to travel? Please provide your travel dates or duration.",
        nextSuggestions: [],
        showCalendar: true,
        nextState: "date"
      },
      date: {
        storeIn: "date",
        nextQuestion: "Nice! What's your budget range for this trip?",
        nextSuggestions: [
          { text: "Budget ($500-1500)", emoji: "💵" },
          { text: "Mid-range ($1500-3000)", emoji: "💰" },
          { text: "Luxury ($3000+)", emoji: "💎" },
          { text: "Flexible", emoji: "✨" }
        ],
        nextState: "budget"
      },
      budget: {
        storeIn: "budget",
        nextQuestion: "How many travelers will be going on this trip?",
        nextSuggestions: [
          { text: "Solo", emoji: "🧳" },
          { text: "Couple (2)", emoji: "💑" },
          { text: "Small group (3-4)", emoji: "👥" },
          { text: "Family", emoji: "👨‍👩‍👧" }
        ],
        nextState: "travelers"
      },
      travelers: {
        storeIn: "travelers",
        nextQuestion: "Great! What are your main interests or what type of activities do you prefer?",
        nextSuggestions: [
          { text: "Adventure", emoji: "🏔️" },
          { text: "Culture", emoji: "🏛️" },
          { text: "Food", emoji: "🍜" },
          { text: "Beach", emoji: "🏖️" },
          { text: "Nightlife", emoji: "🎉" }
        ],
        nextState: "interest"
      },
      interest: {
        storeIn: "interest",
        nextState: "generate"
      }
    };

    const currentStep = flowSequence[conversationState];
    
    if (!currentStep) {
      console.error("❌ Invalid state:", conversationState);
      setLoading(false);
      return;
    }

    // Update collected data
    const updatedData = { ...collectedData, [currentStep.storeIn]: userText };
    setCollectedData(updatedData);
       
    console.log("✅ Updated:", updatedData);

    // Check if we should generate or ask next question
    if (currentStep.nextState === "generate") {
      console.log("🎯 All data collected, generating...");
      setConversationState("generate");
      await generateTripPlan(updatedData);
    } else {
      // Ask next question
      setTimeout(() => {
        const botMsg = {
          sender: "bot",
          text: currentStep.nextQuestion,
          suggestions: currentStep.nextSuggestions,
          showCalendar: currentStep.showCalendar || false,
          type: "text",
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, botMsg]);
        setConversationState(currentStep.nextState);
        
        if (chatIdRef.current) {
          saveChatToDB(chatIdRef.current, userId, { role: "assistant", content: botMsg.text, timestamp: new Date().toISOString() }, { 
            destination: updatedData.location || null, 
            start_date: updatedData.date || null, 
            budget: updatedData.budget || null 
          });
        }
        
        setLoading(false);
        console.log("➡️ Next state:", currentStep.nextState);
      }, 800);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleInputSubmit(suggestion);
  };

  // Handle date selection
  const handleDateSelect = (dateString) => {
    setShowCalendar(false);
    setCollectedData(prev => ({ ...prev, date: dateString }));
    
    setMessages(prev => [...prev, {
      sender: "user",
      text: dateString,
      type: "text",
      timestamp: Date.now()
    }]);

    setConversationState("budget");
    
    setTimeout(async () => {
      const userId = await getCurrentUserId();
      const botMsg = {
        sender: "bot",
        text: "Perfect timing! What's your budget?",
        suggestions: [
          { text: "Budget ($500-1500)", emoji: "💵" },
          { text: "Mid-range ($1500-3000)", emoji: "💰" },
          { text: "Luxury ($3000+)", emoji: "💎" }
        ],
        type: "text",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
      
      if (chatIdRef.current) {
        saveChatToDB(chatIdRef.current, userId, { role: "assistant", content: botMsg.text, timestamp: new Date().toISOString() });
      }
    }, 800);
  };

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    handleInputSubmit(`I want a ${mood} trip`);
  };

  // Handle quick action
  const handleQuickAction = (action) => {
    const actions = {
      surprise: "Surprise me with a 5 day trip",
      weekend: "Quick weekend getaway",
      adventure: "I want an adventurous trip",
      beach: "I want to relax at the beach",
      culture: "I want a cultural experience"
    };
    handleInputSubmit(actions[action]);
  };

  // Handle microphone
  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " : "") + transcript);
      setRecording(false);
    };
    recognition.onerror = () => {
      setRecording(false);
    };
    recognition.onend = () => {
      setRecording(false);
    };
    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.4s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.4s ease-out; }
      `}</style>

      <div className="fixed inset-0 bg-gradient-to-br from-black/50 via-purple-900/30 to-black/50 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 z-50 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 border-b border-white/20 shadow-md">
          <div className="relative flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Chat with Tono
              </h2>
              <p className="text-white/90 text-xs sm:text-sm font-medium">
                Your AI Travel Companion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition p-2 hover:bg-white/20 rounded-xl"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>


          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-white" style={{ scrollBehavior: "smooth" }}>
            {messages.map((msg, i) => {
              // Trip Plan Message
              if (msg.type === "tripPlan") {
  const plan = msg.detailedPlan || {};
  const weather = plan.weather || {};
  const flights = plan.flights || {};
  const hotel = plan.hotel || {};
  const suggestions = msg.suggestions || [];

  return (
    <div key={i} className="animate-slideUp flex justify-start">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden max-w-[85%] sm:max-w-[70%] text-gray-800">

        {/* 🏙️ Destination Image Header */}
        {/* 🏙️ Destination Image Header */}
<div className="relative">
  <img
    alt={plan.destination}
    className="w-full h-40 object-cover transition-all duration-700 ease-in-out"
    loading="lazy"
    src={`https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80`} // safe placeholder
    ref={(img) => {
      if (!img || !plan.destination) return;
      const cleanQuery = plan.destination
        .replace(/,/g, "") // remove commas
        .replace(/\s+/g, " ") // fix spaces
        .trim();

      // Add travel keywords for better relevance
      const query = `${cleanQuery} travel city landscape`;

      fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
        headers: {
          Authorization: import.meta.env.VITE_PEXELS_API_KEY,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const photo = data.photos?.[0]?.src?.landscape;
          if (photo) {
            img.src = photo;
          } else {
            // Fallback to a travel photo related to the region
            img.src = `https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&q=80`;
          }
        })
        .catch(() => {
          img.src =
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80";
        });
    }}
  />

  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
    <h3 className="text-lg sm:text-xl font-semibold text-white drop-shadow-md">
      {plan.destination || "Dream Destination"}
    </h3>
  </div>
</div>

        

        {/* ✈️ Intro */}
        <div className="p-4 pb-1">
          <p className="text-sm sm:text-base leading-relaxed">
            {msg.content ||
              `Get ready for an amazing trip to ${plan.destination || "this destination"}!`}
          </p>
        </div>

        {/* 🌦️ Weather */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 mx-4 mt-3">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold text-gray-700">Weather</span>
          </div>
          <p className="text-sm">
            <strong>Temp:</strong> {weather.temp || "—"} <br />
            <strong>Condition:</strong> {weather.condition || "—"} <br />
            {weather.recommendation && (
              <span>
                <strong>Tip:</strong> {weather.recommendation}
              </span>
            )}
          </p>
        </div>

        {/* 🛫 Flight / 💰 Cost / 🏨 Hotel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 py-4">
          {/* Flight */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Plane className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-gray-700">Flight</span>
            </div>
            <p className="text-sm text-gray-700">
              {flights.departure || "Your city"} <br />
              {flights.airline && <>{flights.airline}<br /></>}
              {flights.price && <>{flights.price}<br /></>}
              {flights.duration && (
                <span className="text-gray-600 text-xs">{flights.duration}</span>
              )}
            </p>
          </div>

          {/* Trip Cost */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-gray-700">Trip Cost</span>
            </div>
            <p className="text-sm text-gray-700">
              {plan.totalCost || plan.budget || "—"} <br />
              {plan.travelers && (
                <span className="text-gray-600 text-xs">
                  {plan.travelers} traveler{plan.travelers > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>

          {/* Hotel */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Hotel className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold text-gray-700">Hotel</span>
            </div>
            <p className="text-sm text-gray-700">
              {hotel.name || "Suggested hotel"}{" "}
              {hotel.rating && (
                <span className="text-xs text-gray-600">
                  ({hotel.rating}⭐)
                </span>
              )}
              <br />
              {hotel.location && (
                <span className="text-gray-600 text-xs">{hotel.location}</span>
              )}
              <br />
              {hotel.price && (
                <span className="text-gray-600 text-xs">{hotel.price}</span>
              )}
              {hotel.amenities && (
                <p className="text-xs text-gray-500 mt-1">
                  {hotel.amenities.slice(0, 3).join(", ")}
                </p>
              )}
            </p>
          </div>
        </div>

        {/* 💡 Suggestions */}
        {suggestions.length > 0 && (
          <div className="px-4 pb-4">
            <h4 className="text-sm font-semibold mb-2 text-gray-700">💡 Travel Tips</h4>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {suggestions.slice(0, 3).map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 🔗 CTA */}
        <div className="flex justify-end bg-gray-50 border-t px-4 py-3">
          <button
            onClick={() => {
              if (msg.id) {
                setLocation(`/itinerary/${msg.id}`);
                if (onClose) onClose();
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition"
          >
            View Full Itinerary →
          </button>
        </div>
      </div>
    </div>
  );
}


              // Regular messages
              return (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex flex-col space-y-3 max-w-[85%] sm:max-w-[75%] ${msg.sender === "user" ? "animate-slideInRight" : "animate-slideInLeft"}`}>
                    <div className={`rounded-3xl px-4 sm:px-5 py-2.5 sm:py-3 ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md shadow-lg"
                        : "bg-white text-gray-800 rounded-bl-md shadow-md border border-gray-100 relative"
                    }`}>
                      {msg.sender === "bot" ? (
                        <>
                          {i < 2 ? (
                            <TypingText text={msg.text} />
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.text || "") }} />
                          )}
                          {msg.text && (
                            <button
                              onClick={() => speak(msg.text || "")}
                              className="absolute -top-2 -right-2 bg-gray-200 text-gray-700 p-1 rounded-full shadow-md hover:bg-gray-300 transition-colors"
                              aria-label="Read message aloud"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.383 3.018a1.5 1.5 0 011.66 0l4.5 2.25A1.5 1.5 0 0116 6.643v6.714a1.5 1.5 0 01-1.457.76l-4.5-2.25a1.5 1.5 0 01-.826-1.34V4.358a1.5 1.5 0 01.826-1.34zM11 11.25V5.5L7 7.5v6l4-2z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </>
                      ) : (
                        msg.text
                      )}
                    </div>

                    {/* Mood Selection */}
                    {msg.showMoods && (
                      <div className="space-y-3 animate-slideUp">
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleMoodSelect("adventurous")} className="bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 p-3 sm:p-4 rounded-2xl border-2 border-orange-200 hover:border-orange-300 transition-all hover:scale-105 shadow-sm">
                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏔️</div>
                            <div className="font-bold text-gray-800 text-sm sm:text-base">Adventure</div>
                            <div className="text-xs text-gray-600">Thrills & excitement</div>
                          </button>
                          <button onClick={() => handleMoodSelect("relaxed")} className="bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 p-3 sm:p-4 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all hover:scale-105 shadow-sm">
                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏖️</div>
                            <div className="font-bold text-gray-800 text-sm sm:text-base">Relaxation</div>
                            <div className="text-xs text-gray-600">Peace & tranquility</div>
                          </button>
                          <button onClick={() => handleMoodSelect("romantic")} className="bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 p-3 sm:p-4 rounded-2xl border-2 border-pink-200 hover:border-pink-300 transition-all hover:scale-105 shadow-sm">
                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">💕</div>
                            <div className="font-bold text-gray-800 text-sm sm:text-base">Romantic</div>
                            <div className="text-xs text-gray-600">Love & connection</div>
                          </button>
                          
                          <button onClick={() => handleMoodSelect("foodie")} className="bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 p-3 sm:p-4 rounded-2xl border-2 border-yellow-200 hover:border-yellow-300 transition-all hover:scale-105 shadow-sm">
                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🍜</div>
                            <div className="font-bold text-gray-800 text-sm sm:text-base">Foodie</div>
                            <div className="text-xs text-gray-600">Culinary journey</div>
                          </button>
                          <button onClick={() => handleMoodSelect("party")} className="bg-gradient-to-br from-violet-50 to-fuchsia-50 hover:from-violet-100 hover:to-fuchsia-100 p-3 sm:p-4 rounded-2xl border-2 border-violet-200 hover:border-violet-300 transition-all hover:scale-105 shadow-sm">
                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🎉</div>
                            <div className="font-bold text-gray-800 text-sm sm:text-base">Party</div>
                            <div className="text-xs text-gray-600">Nightlife & fun</div>
                          </button>
                          <button onClick={() => handleMoodSelect("Other")} className="bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 p-3 sm:p-4 rounded-2xl border-2 border-purple-200 hover:border-purple-300 transition-all hover:scale-105 shadow-sm">
                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏛️</div>
                            <div className="font-bold text-gray-800 text-sm sm:text-base">Choose your Own Destination</div>
                            <div className="text-xs text-gray-600">Choose your Own Destination</div>
                          </button>
                        </div>

                        {/* Quick actions */}
                        <div className="flex flex-wrap gap-2">
                          <QuickActionButton icon={<Sparkles className="w-4 h-4" />} label="Surprise me" onClick={() => handleQuickAction("surprise")} gradient="from-purple-500 to-pink-500" />
                          <QuickActionButton icon={<Coffee className="w-4 h-4" />} label="Weekend" onClick={() => handleQuickAction("weekend")} gradient="from-blue-500 to-cyan-500" />
                          <QuickActionButton icon={<Sun className="w-4 h-4" />} label="Beach" onClick={() => handleQuickAction("beach")} gradient="from-yellow-500 to-orange-500" />
                        </div>
                      </div>
                    )}

                    {/* Trending Destinations */}
                    {msg.showTrending && (
                      <div className="space-y-2 animate-slideUp">
                        <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm mb-2">
                          <TrendingUp className="w-4 h-4" />
                          Trending Destinations
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {["Bali, Indonesia", "Tokyo, Japan", "Santorini, Greece", "Dubai, UAE", "Iceland", "Barcelona, Spain"].map((dest, idx) => {
                            const emojis = ["🏝️", "🗼", "🌅", "🏙️", "🌋", "🏛️"];
                            return (
                              <button key={idx} onClick={() => handleInputSubmit(dest)} className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 p-3 rounded-xl border border-purple-200 hover:border-purple-300 transition-all hover:scale-105 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{emojis[idx]}</span>
                                  <div className="text-left flex-1">
                                    <div className="text-sm font-bold text-gray-800">{dest.split(',')[0]}</div>
                                    <div className="text-xs text-gray-500">{dest.split(',')[1]}</div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Calendar Button */}
                    {msg.showCalendar && (
                      <button onClick={() => setShowCalendar(true)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold animate-slideUp">
                        <Calendar className="w-5 h-5" />
                        Select Dates
                      </button>
                    )}

                    {/* Context Suggestions */}
                    {msg.suggestions?.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-slideUp">
                        {msg.suggestions.map((sug, idx) => (
                          <SuggestionChip key={idx} text={typeof sug === 'string' ? sug : sug.text} emoji={typeof sug === 'object' ? sug.emoji : null} onClick={() => handleSuggestionClick(typeof sug === 'string' ? sug : sug.text)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && <TypingIndicator />}
          </div>

          {/* Input Area */}
          <div className="border-t bg-white rounded-b-3xl">
            <div className="px-3 sm:px-4 py-3 flex items-center gap-2">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()} placeholder="Type 'surprise me' or your destination..." className="flex-1 border-2 border-gray-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800 placeholder-gray-400" disabled={loading} />
              <button onClick={() => handleInputSubmit()} disabled={loading || !input.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105">
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={handleMicClick} className={`bg-gray-200 text-gray-700 rounded-full p-2 shadow hover:bg-gray-300 active:bg-gray-400 transition ${recording ? "animate-pulse ring-2 ring-blue-400" : ""}`} aria-label="Speak your request" type="button" disabled={loading || recording}>
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
              <button onClick={() => { if (onStartPlanning) onStartPlanning(); if (onClose) onClose(); }} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl hover:shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow">
                Use Planning Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showCalendar && (
        <DatePicker 
          onDateSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </>
  );
};

export default ChatBot;
