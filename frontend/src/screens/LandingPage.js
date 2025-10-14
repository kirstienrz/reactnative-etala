import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Users, BookOpen, Target } from "lucide-react-native";
import Header from "../components/Header";

export default function LandingPage({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Users,
      title: "Gender Equality",
      description: "Promoting inclusive development and equal opportunities for all.",
    },
    {
      icon: BookOpen,
      title: "Education & Awareness",
      description: "Building knowledge and understanding through comprehensive resources.",
    },
    {
      icon: Target,
      title: "Sustainable Goals",
      description: "Working towards achieving gender equality and women's empowerment.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}>
        <View style={{ alignItems: "center" }}>
          <View style={{ backgroundColor: "#E0E7FF", borderRadius: 100, padding: 16, marginBottom: 12 }}>
            <CurrentIcon size={64} color="#4338CA" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#1F2937", marginBottom: 4 }}>
            {slides[currentSlide].title}
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 4, lineHeight: 20, paddingHorizontal: 12 }}>
            {slides[currentSlide].description}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("LoginScreen")}
        style={{ backgroundColor: "#4338CA", borderRadius: 8, paddingVertical: 10, marginHorizontal: 20, marginBottom: 20 }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 15, fontWeight: "500" }}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}
