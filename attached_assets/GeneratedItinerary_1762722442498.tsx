import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AIEditChat from "@/components/AIEditChat";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  Share2,
  VolumeX,
  Plane,
  Hotel,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

const YOUR_PEXELS_API_KEY = "P2dLrk5TWTRGCbNvBizKynGkuHNP68q4a4gC6PXuIEmGtlxzHSivyUPw";

/** TYPES */
type Activity = { activity: string; description?: string };
export type Meals = { breakfast?: string; lunch?: string; dinner?: string };
export type Day = {
  dayNumber: number;
  title: string;
  description?: string;
  morning: Activity;
  afternoon: Activity;
  evening: Activity;
  travelTips?: string[];
  meals?: Meals;
  notes?: string;
  image?: string;
  weather?: string;
  transport?: string;
};
export type Itinerary = { days: Day[]; destination: string; thumbnail: string };

const getItineraryByPlanId = async (planId: string) => {
  try {
    const { data: itinerary } = await supabase
      .from('itineraries')
      .select('*')
      .eq('plan_id', planId)
      .single();
    return itinerary;
  } catch {
    return null;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(0,255,240,0.15)" }}
    transition={{ type: "spring", stiffness: 120 }}
    className={`p-6 rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl
      bg-gradient-to-br from-[#0b0c0e]/80 via-[#15181b]/80 to-[#0a0a0a]/80 border border-white/10 
      hover:border-[#00ffe0]/30 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const CardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;

// Helper functions for flight booking
const locationToAirport: Record<string, string> = {
  "new york": "JFK", "los angeles": "LAX", "san francisco": "SFO",
  "chicago": "ORD", "miami": "MIA", "dallas": "DFW", "seattle": "SEA",
  "toronto": "YYZ", "vancouver": "YVR", "montreal": "YUL",
  "paris": "CDG", "london": "LHR", "tokyo": "HND", "dubai": "DXB",
  "singapore": "SIN", "delhi": "DEL", "mumbai": "BOM", "bangalore": "BLR",
  "sydney": "SYD", "melbourne": "MEL", "rome": "FCO", "barcelona": "BCN",
  "amsterdam": "AMS", "berlin": "BER", "madrid": "MAD", "lisbon": "LIS",
  "bali": "DPS", "bangkok": "BKK", "hong kong": "HKG", "seoul": "ICN",
};

function getAirportCode(location: string): string {
  const key = location.toLowerCase().trim();
  for (const [place, code] of Object.entries(locationToAirport)) {
    if (key.includes(place)) return code;
  }
  return location.substring(0, 3).toUpperCase();
}

function formatDateMDY(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

// Extract user location
const getUserLocation = () => {
  try {
    const rawLocation = localStorage.getItem("userLocation");
    if (rawLocation) {
      const locationData = JSON.parse(rawLocation);
      return locationData.city || "New York";
    }
  } catch (e) {
    console.warn("Failed to parse user location");
  }
  return "New York";
};

const EnhancedItinerary: React.FC = () => {
  const [location] = useLocation();
  const [rawPath] = location.split("?");
  const planIdFromUrl = (rawPath || "").split("/")[2] || "";
  const planId = planIdFromUrl ? `plan-${planIdFromUrl}` : "";

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [dayData, setDayData] = useState<Day[]>([]);
  const [error, setError] = useState<string>("");
  const [geminiResponse, setGeminiResponse] = useState<any>(null);
  const [notes, setNotes] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  
  // Trip data from chatbot
  const [userOrigin, setUserOrigin] = useState<string>("");
  const [tripStartDate, setTripStartDate] = useState<string>("");
  const [tripEndDate, setTripEndDate] = useState<string>("");
  const [tripBudget, setTripBudget] = useState<string>("");
  const [tripTravelers, setTripTravelers] = useState<string>("1");
  const [tripInterest, setTripInterest] = useState<string>("");

  const speak = (text: string) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const u = new SpeechSynthesisUtterance(text);
      u.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(u);
      setIsSpeaking(true);
    }
  };

  const handleAIPlanUpdate = async (updatedDay: any) => {
    const dayIndex = dayData.findIndex(d => d.dayNumber === updatedDay.dayNumber);
    
    if (dayIndex !== -1) {
      const newDayData = [...dayData];
      newDayData[dayIndex] = {
        dayNumber: updatedDay.dayNumber || updatedDay.day,
        title: updatedDay.title,
        description: updatedDay.description || "",
        morning: {
          activity: updatedDay.activities?.[0] || "",
          description: updatedDay.activitiesDescription?.[0] || "",
        },
        afternoon: {
          activity: updatedDay.activities?.[1] || "",
          description: updatedDay.activitiesDescription?.[1] || "",
        },
        evening: {
          activity: updatedDay.activities?.[2] || "",
          description: updatedDay.activitiesDescription?.[2] || "",
        },
        travelTips: updatedDay.travelTips || [],
        meals: updatedDay.meals || {},
        notes: updatedDay.notes || "",
        image: dayData[dayIndex].image,
        weather: updatedDay.weather || "",
        transport: updatedDay.transport || "",
      };
      
      setDayData(newDayData);

      if (planId) {
        const dbItinerary = await getItineraryByPlanId(planId);
        if (dbItinerary?.id && dbItinerary.full_response) {
          const updatedFullResponse = { ...dbItinerary.full_response };
          if (updatedFullResponse.detailedPlan?.dailyPlan) {
            updatedFullResponse.detailedPlan.dailyPlan[dayIndex] = {
              day: updatedDay.dayNumber,
              title: updatedDay.title,
              description: updatedDay.description,
              activities: updatedDay.activities,
              activitiesDescription: updatedDay.activitiesDescription,
              travelTips: updatedDay.travelTips,
              meals: updatedDay.meals,
              weather: updatedDay.weather,
              transport: updatedDay.transport,
              notes: updatedDay.notes
            };
          }

          await supabase
            .from('itineraries')
            .update({
              full_response: updatedFullResponse,
              updated_at: new Date().toISOString()
            })
            .eq('id', dbItinerary.id);
        }
      }
    }
  };

  /** Load itinerary and extract all data from chatbot */
  useEffect(() => {
    if (!planId) {
      setError("Plan ID is missing from URL");
      return;
    }
    const historyKey = `chatHistory-${planId}`;
    const storedHistory = localStorage.getItem(historyKey);
    if (!storedHistory) {
      setError("No itinerary found in storage for this plan id.");
      return;
    }

    try {
      const parsedHistory = JSON.parse(storedHistory);
      const lastEntry = parsedHistory.length > 0 ? parsedHistory[parsedHistory.length - 1] : null;
      
      if (lastEntry?.geminiResponse?.detailedPlan) {
        setGeminiResponse(lastEntry.geminiResponse);
        const geminiData = lastEntry.geminiResponse;
        const detailedPlan = geminiData.detailedPlan;

        const userCity = getUserLocation();
        setUserOrigin(detailedPlan.flights?.departure || userCity);
        
        setTripBudget(detailedPlan.budget || "");
        setTripTravelers(detailedPlan.travelers?.toString() || "1");
        setTripInterest(detailedPlan.interest || "");

        const durationMatch = detailedPlan.duration?.match(/(\d+)/);
        const numDays = durationMatch ? parseInt(durationMatch[1]) : 5;
        
        const today = new Date();
        today.setDate(today.getDate() + 14);
        setTripStartDate(today.toISOString().split('T')[0]);
        
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + numDays);
        setTripEndDate(endDate.toISOString().split('T')[0]);

        const days: Day[] = geminiData.detailedPlan.dailyPlan.map((day: any) => ({
          dayNumber: day.day,
          title: day.title,
          description: day.description || "",
          morning: {
            activity: day.activities?.[0] || "No morning activity listed.",
            description: day.activitiesDescription?.[0] || "",
          },
          afternoon: {
            activity: day.activities?.[1] || "No afternoon activity listed.",
            description: day.activitiesDescription?.[1] || "",
          },
          evening: {
            activity: day.activities?.[2] || "No evening activity listed.",
            description: day.activitiesDescription?.[2] || "",
          },
          travelTips: day.travelTips || [],
          meals: day.meals || {},
          notes: day.notes || "",
          image: day.image || "",
          weather: day.weather || "",
          transport: day.transport || "",
        }));

        setItinerary({
          days,
          destination: geminiData.detailedPlan.destination,
          thumbnail: geminiData.detailedPlan.thumbnail,
        });
        setDayData(days);
        setError("");
      } else setError("Itinerary data format is incorrect or missing detailedPlan.");
    } catch (err) {
      setError("Failed to parse stored itinerary data.");
      console.error("Parse error:", err);
    }
  }, [planId]);

  /** Pexels: per-day images */
  useEffect(() => {
    const enhance = async () => {
      if (!itinerary?.days) return;
      let photos: string[] = [];
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(
            itinerary.thumbnail || itinerary.destination
          )}&per_page=15`,
          { headers: { Authorization: YOUR_PEXELS_API_KEY } }
        );
        if (!response.ok) throw new Error(`Pexels API error: ${response.status}`);
        const data = await response.json();
        photos = data?.photos
          ?.map((p: any) => p.src?.landscape || p.src?.medium)
          .filter(Boolean);
      } catch (e) {
        console.error("Pexels error:", e);
      }
      setDayData(
        itinerary.days.map((d, i) => ({
          ...d,
          image:
            photos[i] ||
            d.image ||
            "https://via.placeholder.com/1200x800?text=No+Image",
        }))
      );
    };
    enhance();
  }, [itinerary]);

  /** Notes */
  useEffect(() => {
    if (!itinerary) {
      setNotes("");
      return;
    }
    const saved = localStorage.getItem(
      `notes-${itinerary.destination}-${currentDay}`
    );
    if (saved !== null) setNotes(saved);
    else if (dayData[currentDay]?.notes)
      setNotes(dayData[currentDay].notes || "");
    else setNotes("");
  }, [currentDay, itinerary, dayData]);

  const handleNoteChange = (val: string) => {
    if (!itinerary) return;
    setNotes(val);
    localStorage.setItem(`notes-${itinerary.destination}-${currentDay}`, val);
  };

  const handleBookFlights = () => {
    if (!itinerary?.destination || !tripStartDate) {
      alert("Please ensure travel dates are available");
      return;
    }

    const fromCode = getAirportCode(userOrigin);
    const toCode = getAirportCode(itinerary.destination);
    const fromDate = formatDateMDY(tripStartDate);
    const toDate = tripEndDate ? formatDateMDY(tripEndDate) : "";

    let url = `https://www.expedia.com/Flights-Search?flight-type=on&mode=search&trip=${
      tripEndDate ? "roundtrip" : "oneway"
    }`;
    url += `&leg1=from:${fromCode},to:${toCode},departure:${fromDate}TANYT`;
    if (tripEndDate) {
      url += `&leg2=from:${toCode},to:${fromCode},departure:${toDate}TANYT`;
    }
    url += `&options=cabinclass:economy&passengers=adults:${tripTravelers || 1}`;

    window.open(url, "_blank");
  };
  
  // ✅ NEW: Hotel booking (direct Expedia search)
  const handleBookHotels = () => {
    if (!itinerary?.destination) {
      alert("Destination missing");
      return;
    }

    const dest = itinerary.destination.split(",")[0].trim();
    const checkIn = tripStartDate; // YYYY-MM-DD
    const checkOut = tripEndDate || "";
    const adults = tripTravelers || "1";

    const url = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(
      dest
    )}${checkIn ? `&startDate=${checkIn}` : ""}${checkOut ? `&endDate=${checkOut}` : ""}&adults=${adults}&rooms=1`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const current = dayData[currentDay];
  if (!current)
    return (
      <div className="text-center mt-20 text-red-500 font-semibold">
        {error || "Loading itinerary..."}
      </div>
    );

  return (
    <div className="relative min-h-screen font-sans text-white bg-gradient-to-br from-[#050505] via-[#0a0f14] to-[#0b1c25] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,240,0.07),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(255,215,0,0.05),transparent_60%)]"></div>

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 max-w-8xl mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Hero */}
        <motion.div
          variants={itemVariants}
          className="w-full relative rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,255,240,0.05)]"
        >
          <motion.img
            src={current.image}
            alt={`Visual for day ${current.dayNumber}`}
            className="w-full h-[600px] object-cover brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-12">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center">
              <div className="flex flex-col text-left">
                <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-[#00ffe0] via-[#00d4ff] to-[#7afcff] text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(0,255,255,0.4)]">
                  {itinerary?.destination}
                </h1>
                <h2 className="text-3xl md:text-4xl font-semibold mt-2 text-gray-100">
                  Day {current.dayNumber}: {current.title}
                </h2>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* GRID - Original Itinerary Content */}
        <div className="grid md:grid-cols-4 gap-8 w-full mt-8">
          <Card className="col-span-4 lg:col-span-2">
            <CardContent className="space-y-4 text-gray-100">
              <h3 className="text-2xl font-bold text-[#00ffe0]">Daily Plan</h3>
              {["morning", "afternoon", "evening"].map((time) => {
                const activity = current[time as keyof Day] as Activity;
                return (
                  <div key={time}>
                    <h4 className="font-semibold text-lg capitalize text-[#ffd166]">
                      {time}
                    </h4>
                    <p>{activity?.activity || ""}</p>
                    {activity?.description && (
                      <p className="text-sm text-gray-400">
                        {activity.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {geminiResponse?.detailedPlan?.flights && (
            <Card className="col-span-4 sm:col-span-2 lg:col-span-1">
              <CardContent className="space-y-2 text-gray-100">
                <h3 className="text-2xl font-bold text-[#00ffe0]">
                  Flight Details
                </h3>
                <p>
                  <strong>Route:</strong>{" "}
                  {geminiResponse.detailedPlan.flights.departure}
                </p>
                <p>
                  <strong>Price:</strong>{" "}
                  {geminiResponse.detailedPlan.flights.price}
                </p>
                <p>
                  <strong>Airline:</strong>{" "}
                  {geminiResponse.detailedPlan.flights.airline}
                </p>
                <p>
                  <strong>Duration:</strong>{" "}
                  {geminiResponse.detailedPlan.flights.duration}
                </p>
              </CardContent>
            </Card>
          )}

          {current.meals && (
            <Card className="col-span-4 sm:col-span-2 lg:col-span-1">
              <CardContent className="space-y-4 text-gray-100">
                <h3 className="text-2xl font-bold text-[#00ffe0]">
                  Meals & Transport
                </h3>
                {current.meals.breakfast && (
                  <p>
                    <strong>Breakfast:</strong> {current.meals.breakfast}
                  </p>
                )}
                {current.meals.lunch && (
                  <p>
                    <strong>Lunch:</strong> {current.meals.lunch}
                  </p>
                )}
                {current.meals.dinner && (
                  <p>
                    <strong>Dinner:</strong> {current.meals.dinner}
                  </p>
                )}
                {current.transport && (
                  <p className="text-sm text-gray-400">
                    🚗 {current.transport}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {current.travelTips && current.travelTips.length > 0 && (
            <Card className="col-span-4 sm:col-span-2 lg:col-span-2">
              <CardContent className="space-y-4 text-gray-100">
                <h3 className="text-2xl font-bold text-[#00ffe0]">
                  Travel Tips
                </h3>
                <ul className="list-disc pl-5 text-sm text-gray-400">
                  {current.travelTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="col-span-4">
            <CardContent className="space-y-4 text-gray-100">
              <h3 className="text-2xl font-bold text-[#00ffe0]">Your Notes</h3>
              <textarea
                className="w-full border p-4 rounded-xl text-sm bg-white/5 text-gray-100 placeholder-gray-400 border-white/10 focus:border-[#00ffe0] focus:ring-1 focus:ring-[#00ffe0]"
                value={notes}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Write your thoughts..."
                rows={6}
              />
            </CardContent>
          </Card>
        </div>

        {/* READY TO BOOK SECTION - MOVED TO BOTTOM */}
        <motion.div variants={itemVariants} className="w-full mt-10">
          <button
            onClick={() => setShowBooking(!showBooking)}
            className="w-full group"
          >
            <div className="relative backdrop-blur-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-8 hover:border-cyan-400/30 transition-all duration-300 shadow-[0_4px_40px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-3xl font-bold text-white mb-1">✈️ Ready to Book Your Trip?</h3>
                    <p className="text-white/60">Complete your journey to {itinerary?.destination}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showBooking ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-8 h-8 text-cyan-400" />
                </motion.div>
              </div>
            </div>
          </button>

          <AnimatePresence>
            {showBooking && (
              <div // Removed motion.div for instant appearance
                className="overflow-hidden mt-6"
              >
                {/* Trip Summary Banner */}
                <Card className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-orange-900/40 mb-6">
                  <CardContent>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-[#00ffe0] to-[#00d4ff] rounded-2xl">
                          <Sparkles className="w-7 h-7 text-black" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#00ffe0]">Your Triponic Journey</h3>
                          <p className="text-sm text-gray-400">Everything ready for booking</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 max-w-2xl">
                        <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-[#00ffe0]" />
                            <p className="text-xs text-gray-400">Duration</p>
                          </div>
                          <p className="text-white font-bold">{dayData.length} days</p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-[#ffd166]" />
                            <p className="text-xs text-gray-400">Budget</p>
                          </div>
                          <p className="text-white font-bold text-sm">{tripBudget || "Flexible"}</p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-[#00d4ff]" />
                            <p className="text-xs text-gray-400">Travelers</p>
                          </div>
                          <p className="text-white font-bold">{tripTravelers}</p>
                        </div>

                        <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-[#7afcff]" />
                            <p className="text-xs text-gray-400">Vibe</p>
                          </div>
                          <p className="text-white font-bold text-sm">{tripInterest || "Mixed"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Flight Booking Card */}
                  <Card className="col-span-1">
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                          <Plane className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-[#00ffe0]">Book Flights</h3>
                          <p className="text-sm text-gray-400">From {userOrigin || "your city"}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-[#1a1b1e]/50 to-[#2a2b2e]/50 rounded-xl p-4 border border-white/5 space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-[#00ffe0] mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Route</p>
                            <p className="text-white font-semibold">{userOrigin} → {itinerary?.destination}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-[#ffd166] mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Travel Dates</p>
                            <p className="text-white font-semibold">
                              {tripStartDate && new Date(tripStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {tripEndDate && ` - ${new Date(tripEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-[#00d4ff] mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Travelers</p>
                            <p className="text-white font-semibold">{tripTravelers} {parseInt(tripTravelers) > 1 ? 'people' : 'person'}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleBookFlights}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
                      >
                        <Plane className="w-5 h-5 mr-2" />
                        Search Flights on Expedia
                      </Button>

                      <div className="flex items-center gap-2 p-3 bg-blue-600/10 border border-blue-400/20 rounded-xl">
                        <Sparkles className="w-4 h-4 text-[#00ffe0]" />
                        <p className="text-xs text-gray-300">
                          <strong className="text-[#00ffe0]">Tip:</strong> Tuesday-Thursday flights are typically 15-20% cheaper
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hotel Booking Card */}
                  <Card className="col-span-1">
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-pink-600 to-orange-600 rounded-xl">
                          <Hotel className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-[#00ffe0]">Book Hotels</h3>
                          <p className="text-sm text-gray-400">Stay in {itinerary?.destination.split(',')[0]}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-[#1a1b1e]/50 to-[#2a2b2e]/50 rounded-xl p-4 border border-white/5 space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-[#00ffe0] mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-white font-semibold">{itinerary?.destination}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-[#ffd166] mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Check-in / Check-out</p>
                            <p className="text-white font-semibold">
                              {tripStartDate && new Date(tripStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {tripEndDate && ` - ${new Date(tripEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-[#00d4ff] mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Travelers</p>
                            <p className="text-white font-semibold">{tripTravelers} {parseInt(tripTravelers) > 1 ? 'people' : 'person'}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleBookHotels}
                        className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all"
                      >
                        <Hotel className="w-5 h-5 mr-2" />
                        Search Hotels on Expedia
                      </Button>

                      <div className="flex items-center gap-2 p-3 bg-pink-600/10 border border-pink-400/20 rounded-xl">
                        <TrendingUp className="w-4 h-4 text-[#00ffe0]" />
                        <p className="text-xs text-gray-300">
                          <strong className="text-[#00ffe0]">Tip:</strong> Hotels near {dayData[0]?.morning.activity.split(' ').slice(0, 3).join(' ') || 'main attractions'} save transport time
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* NAV + TTS */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between gap-4 w-full max-w-2xl mt-8"
        >
          <Button
            onClick={() => setCurrentDay((prev) => Math.max(0, prev - 1))}
            disabled={currentDay === 0}
            className="hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button
            onClick={() =>
              speak(current.title + ". " + (current.description || ""))
            }
            className={`transition-all ${
              isSpeaking
                ? "bg-[#00ffe0] text-black shadow-[0_0_25px_rgba(0,255,255,0.5)]"
                : "hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 mr-2" /> Stop
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" /> Listen
              </>
            )}
          </Button>
          <Button
            onClick={() =>
              setCurrentDay((prev) => Math.min(dayData.length - 1, prev + 1))
            }
            disabled={currentDay === dayData.length - 1}
            className="hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]"
          >
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        <motion.a
          variants={itemVariants}
          href={`https://twitter.com/intent/tweet?text=Check out my travel itinerary for ${encodeURIComponent(
            itinerary?.destination ?? ""
          )}!`}
          target="_blank"
          className="mt-8 text-[#00ffe0] underline flex items-center hover:text-[#7afcff] transition-all"
          rel="noopener noreferrer"
        >
          <Share2 className="inline w-5 h-5 mr-2" /> Share Your Journey
        </motion.a>

       </motion.div>
      <AIEditChat 
        itinerary={itinerary}
        currentDayData={current}
        onPlanUpdate={handleAIPlanUpdate}
        planId={planId}
      />
    </div>
  );
};

export default EnhancedItinerary;
