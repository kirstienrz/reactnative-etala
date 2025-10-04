
// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   Dimensions,
//   StyleSheet,
//   StatusBar,
//   Animated,
//   FlatList,
//   Linking,
//   Alert
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const { width } = Dimensions.get("window");

// export default function LandingPage({ navigation }) {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const scrollViewRef = useRef(null);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//    const [expandedMenu, setExpandedMenu] = useState(null);
//   const animationValues = useRef({
//     0: new Animated.Value(0),
//     1: new Animated.Value(0),
//     2: new Animated.Value(0)
//   }).current;

//   const carouselImages = [
//     {
//       uri: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
//       title: "Excellence in Governance",
//       subtitle: "Building stronger communities"
//     },
//     {
//       uri: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop",
//       title: "Innovation & Progress",
//       subtitle: "Leading with transparency"
//     },
//     {
//       uri: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
//       title: "Community Partnership",
//       subtitle: "Working together for development"
//     }
//   ];

//   const menuItems = [
//     {
//       title: "About",
//       subtitle: "Vision & Mission, Org Structure, GAD Committee, Contact Us, Hotlines",
//       color: "#8B5CF6",
//       bgColor: "#F3E8FF",
//       submenus: [
//         { name: "Vision & Mission", screen: "VisionMission" },
//         { name: "Org Structure", screen: "OrgStructure" },
//         { name: "GAD Committee", screen: "GADCommittee" },
//         { name: "Contact Us", screen: "ContactUs" },
//         { name: "Hotlines", screen: "Hotlines" }
//       ]
//     },
//     {
//       title: "Policies",
//       subtitle: "Circular, Resolutions, Memoranda, Office Order",
//       color: "#059669",
//       bgColor: "#ECFDF5",
//       submenus: [
//         { name: "Circular", screen: "Circular" },
//         { name: "Resolutions", screen: "Resolutions" },
//         { name: "Memoranda", screen: "Memoranda" },
//         { name: "Office Order", screen: "OfficeOrder" }
//       ]
//     },
//     {
//       title: "Resources",
//       subtitle: "Handbook, Knowledge Hub, Suggestion Box",
//       color: "#DC2626",
//       bgColor: "#FEF2F2",
//       submenus: [
//         { name: "Handbook", screen: "Handbook" },
//         { name: "Knowledge Hub", screen: "KnowledgeHub" },
//         { name: "Suggestion Box", screen: "SuggestionBox" }
//       ]
//     }
//   ];

//   const newsItems = [
//     {
//       id: 1,
//       image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=150&fit=crop",
//       title: "New GAD Policy Implementation",
//       excerpt: "Comprehensive guidelines for gender and development initiatives...",
//       date: "Sept 25, 2025"
//     },
//     {
//       id: 2,
//       image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop",
//       title: "Annual Accomplishment Report",
//       excerpt: "Highlighting key achievements and milestones reached...",
//       date: "Sept 20, 2025"
//     }
//   ];

//   const quickLinks = [
//     { title: "GAD Plan and Budget", screen: "GADPlanBudget" },
//     { title: "GAD Accomplishment Report", screen: "GADReport" },
//     { title: "GAD Projects", screen: "GADProjects" },
//     { title: "Committee Reports", screen: "CommitteeReports" },
//     { title: "Resource Materials", screen: "Resources" }
//   ];

//    const handleQuickLinkPress = (link) => {
//     navigation.navigate(link.screen);
//   };

//   useEffect(() => {
//     // Fade in animation
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 1000,
//       useNativeDriver: true,
//     }).start();

//     // Auto-scroll carousel
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => {
//         const nextSlide = (prev + 1) % carouselImages.length;
//         scrollViewRef.current?.scrollToOffset({
//           offset: nextSlide * width,
//           animated: true,
//         });
//         return nextSlide;
//       });
//     }, 4000);

//     return () => clearInterval(interval);
//   }, []);

//   const renderCarouselItem = ({ item }) => (
//     <View style={styles.carouselItem}>
//       <Image source={{ uri: item.uri }} style={styles.carouselImage} />
//       <View style={styles.carouselOverlay}>
//         <View style={styles.carouselContent}>
//           <Text style={styles.carouselTitle}>{item.title}</Text>
//           <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
//         </View>
//       </View>
//     </View>
//   );

//   const renderMenuCard = (item, index) => (
//     <TouchableOpacity key={index} style={[styles.menuCard, { backgroundColor: item.bgColor }]}>
//       <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
//         <Text style={styles.menuIconText}>📋</Text>
//       </View>
//       <Text style={styles.menuTitle}>{item.title}</Text>
//       <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
//     </TouchableOpacity>
//   );

//   const renderNewsItem = ({ item }) => (
//     <TouchableOpacity style={styles.newsCard}>
//       <Image source={{ uri: item.image }} style={styles.newsImage} />
//       <View style={styles.newsContent}>
//         <View style={styles.newsHeader}>
//           <Text style={styles.newsTitle}>{item.title}</Text>
//           <Text style={styles.newsDate}>{item.date}</Text>
//         </View>
//         <Text style={styles.newsExcerpt}>{item.excerpt}</Text>
//         <TouchableOpacity style={styles.readMoreButton}>
//           <Text style={styles.readMoreText}>Read More →</Text>
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <View style={styles.logo}>
//             <Text style={styles.logoText}>GAD</Text>
//           </View>
//           <View>
//             <Text style={styles.headerTitle}>GAD Portal</Text>
//             <Text style={styles.headerSubtitle}>Gender & Development Committee</Text>
//           </View>
//         </View>
//         <TouchableOpacity
//           style={styles.loginButton}
//           onPress={() => navigation.navigate("Login")}
//         >
//           <Text style={styles.loginButtonText}>Login</Text>
//         </TouchableOpacity>
//       </View>

//       <Animated.ScrollView
//         style={[styles.scrollView, { opacity: fadeAnim }]}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Hero Carousel */}
//         <View style={styles.carouselContainer}>
//           <FlatList
//             ref={scrollViewRef}
//             data={carouselImages}
//             renderItem={renderCarouselItem}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(_, index) => index.toString()}
//             onMomentumScrollEnd={(event) => {
//               const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
//               setCurrentSlide(slideIndex);
//             }}
//           />

//           {/* Slide Indicators */}
//           <View style={styles.indicators}>
//             {carouselImages.map((_, index) => (
//               <View
//                 key={index}
//                 style={[
//                   styles.indicator,
//                   { backgroundColor: index === currentSlide ? "#FFFFFF" : "#FFFFFF80" }
//                 ]}
//               />
//             ))}
//           </View>
//         </View>

//         {/* Main Menu */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Main Menu</Text>
//             <Text style={styles.sectionSubtitle}>Access key resources and information</Text>
//           </View>
//           <View style={styles.menuGrid}>
//             {menuItems.map((item, index) => renderMenuCard(item, index))}
//           </View>
//         </View>

//         {/* Latest News */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Latest News</Text>
//             <Text style={styles.sectionSubtitle}>Stay updated with recent developments</Text>
//           </View>
//           <FlatList
//             data={newsItems}
//             renderItem={renderNewsItem}
//             keyExtractor={(item) => item.id.toString()}
//             showsVerticalScrollIndicator={false}
//             scrollEnabled={false}
//           />
//         </View>

//         {/* Quick Links & Infographics Row */}
//         <View style={styles.row}>
//           {/* Quick Links */}
//           <View style={styles.quickLinksContainer}>
//             <Text style={styles.cardTitle}>Quick Links</Text>
//             {quickLinks.map((link, index) => (
//               <TouchableOpacity 
//                 key={index} 
//                 style={styles.quickLink}
//                 onPress={() => handleQuickLinkPress(link)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.quickLinkText}>• {link.title}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Infographics */}
//           <View style={styles.infographicsContainer}>
//             <Text style={styles.cardTitle}>Infographics</Text>
//             <TouchableOpacity style={styles.infographicCard}>
//               <Image
//                 source={{ uri: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop" }}
//                 style={styles.infographicImage}
//               />
//               <View style={styles.infographicOverlay}>
//                 <Text style={styles.infographicText}>GAD Statistics 2025</Text>
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Contact Section */}
//         <View style={styles.contactSection}>
//           <Text style={styles.contactTitle}>Get in Touch</Text>
//           <Text style={styles.contactText}>📍 123 Government Street, City</Text>
//           <Text style={styles.contactText}>📞 +63 123 456 7890</Text>
//           <Text style={styles.contactText}>✉️ gad@government.ph</Text>
//         </View>
//       </Animated.ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F8FAFC" },
//   header: {
//     backgroundColor: "#FFFFFF",
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   headerLeft: { flexDirection: "row", alignItems: "center" },
//   logo: {
//     width: 50,
//     height: 50,
//     backgroundColor: "#8B5CF6",
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 15,
//   },
//   logoText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
//   headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
//   headerSubtitle: { fontSize: 12, color: "#6B7280" },
//   loginButton: {
//     backgroundColor: "#8B5CF6",
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 25,
//     shadowColor: "#8B5CF6",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   loginButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
//   scrollView: { flex: 1 },
//   carouselContainer: { height: 250, marginBottom: 20 },
//   carouselItem: { width: width, height: 250 },
//   carouselImage: { width: "100%", height: "100%", resizeMode: "cover" },
//   carouselOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "flex-end",
//   },
//   carouselContent: { padding: 20, paddingBottom: 40 },
//   carouselTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold", marginBottom: 5 },
//   carouselSubtitle: { color: "#F3F4F6", fontSize: 16 },
//   indicators: { position: "absolute", bottom: 15, left: 0, right: 0, flexDirection: "row", justifyContent: "center" },
//   indicator: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
//   section: { paddingHorizontal: 20, marginBottom: 25 },
//   sectionHeader: { marginBottom: 15 },
//   sectionTitle: { fontSize: 24, fontWeight: "bold", color: "#1F2937", marginBottom: 5 },
//   sectionSubtitle: { fontSize: 14, color: "#6B7280" },
//   menuGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
//   menuCard: {
//     width: (width - 60) / 3,
//     padding: 15,
//     borderRadius: 16,
//     marginBottom: 15,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
//   menuIconText: { fontSize: 18 },
//   menuTitle: { fontSize: 16, fontWeight: "bold", color: "#1F2937", marginBottom: 5, textAlign: "center" },
//   menuSubtitle: { fontSize: 10, color: "#6B7280", textAlign: "center", lineHeight: 14 },
//   newsCard: { backgroundColor: "#FFFFFF", borderRadius: 16, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: "hidden" },
//   newsImage: { width: "100%", height: 180, resizeMode: "cover" },
//   newsContent: { padding: 15 },
//   newsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
//   newsTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937", flex: 1, marginRight: 10 },
//   newsDate: { fontSize: 12, color: "#6B7280" },
//   newsExcerpt: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 12 },
//   readMoreButton: { alignSelf: "flex-start" },
//   readMoreText: { color: "#8B5CF6", fontSize: 14, fontWeight: "600" },
//   row: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 25 },
//   quickLinksContainer: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 15, marginRight: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   infographicsContainer: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 15, marginLeft: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   cardTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 15 },
//   quickLink: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
//   quickLinkText: { fontSize: 14, color: "#4B5563" },
//   infographicCard: { borderRadius: 12, overflow: "hidden", position: "relative" },
//   infographicImage: { width: "100%", height: 120, resizeMode: "cover" },
//   infographicOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.7)", padding: 10 },
//   infographicText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
//   contactSection: { backgroundColor: "#8B5CF6", margin: 20, padding: 20, borderRadius: 16, alignItems: "center" },
//   contactTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold", marginBottom: 15 },
//   contactText: { color: "#E5E7EB", fontSize: 14, marginBottom: 5 },
// });


import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
  Animated,
  FlatList,
  Linking,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function LandingPage({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [expandedMenu, setExpandedMenu] = useState(null);
  const animationValues = useRef({
    0: new Animated.Value(0),
    1: new Animated.Value(0),
    2: new Animated.Value(0)
  }).current;

  const carouselImages = [
    {
      image: require("../../assets/carousel/CAROUSEL.png"),
      title: "Excellence in Governance",
      subtitle: "Building stronger communities"
    },
    {
      image: require("../../assets/carousel/CAROUSEL.png"),
      title: "Innovation & Progress",
      subtitle: "Leading with transparency"
    },
    {
      image: require("../../assets/carousel/CAROUSEL.png"),
      title: "Community Partnership",
      subtitle: "Working together for development"
    }
  ];

  const menuItems = [
    {
      title: "About",
      subtitle: "Vision & Mission, Org Structure, GAD Committee, Contact Us, Hotlines",
      color: "#8B5CF6",
      bgColor: "#F3E8FF",
      submenus: [
        { name: "Vision and Mission", screen: "VisionMission" },
        { name: "Organizational Structure", screen: "OrgStructure" },
        { name: "GAD Committee", screen: "GADCommittee" },
        { name: "Contact Us", screen: "ContactUs" },
        { name: "Hotlines", screen: "Hotlines" }
      ]
    },
    {
      title: "Policies",
      subtitle: "Circular, Resolutions, Memoranda, Office Order",
      color: "#059669",
      bgColor: "#ECFDF5",
      submenus: [
        { name: "Circular", screen: "Circular" },
        { name: "Resolutions", screen: "Resolutions" },
        { name: "Memoranda", screen: "Memoranda" },
        { name: "Office Order", screen: "OfficeOrder" }
      ]
    },
    {
      title: "Resources",
      subtitle: "Handbook, Knowledge Hub, Suggestion Box",
      color: "#DC2626",
      bgColor: "#FEF2F2",
      submenus: [
        { name: "Handbook", screen: "Handbook" },
        { name: "Knowledge Hub", screen: "KnowledgeHub" },
        { name: "Suggestion Box", screen: "SuggestionBox" }
      ]
    }
  ];

  const newsItems = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=150&fit=crop",
      title: "New GAD Policy Implementation",
      excerpt: "Comprehensive guidelines for gender and development initiatives...",
      date: "Sept 25, 2025"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=150&fit=crop",
      title: "Annual Accomplishment Report",
      excerpt: "Highlighting key achievements and milestones reached...",
      date: "Sept 20, 2025"
    }
  ];

  const quickLinks = [
    { title: "Plan and Budget", screen: "GADPlanBudget" },
    { title: "Accomplishment Report", screen: "GADReport" },
    { title: "Projects", screen: "GADProjects" },
    { title: "Committee Reports", screen: "CommitteeReports" },
    // { title: "Resource Materials", screen: "Resources" }
  ];

  const handleQuickLinkPress = (link) => {
    navigation.navigate(link.screen);
  };

  const toggleMenu = (index) => {
    const isExpanding = expandedMenu !== index;

    if (expandedMenu !== null && expandedMenu !== index) {
      // Collapse previously expanded menu
      Animated.timing(animationValues[expandedMenu], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    if (isExpanding) {
      setExpandedMenu(index);
      Animated.timing(animationValues[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animationValues[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setExpandedMenu(null));
    }
  };

  const handleSubmenuPress = (screen) => {
    navigation.navigate(screen);
  };

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Auto-scroll carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % carouselImages.length;
        scrollViewRef.current?.scrollToOffset({
          offset: nextSlide * width,
          animated: true,
        });
        return nextSlide;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const renderCarouselItem = ({ item }) => (
  <View style={styles.carouselItem}>
    <Image source={item.image} style={styles.carouselImage} />
    <View style={styles.carouselOverlay}>
      <View style={styles.carouselContent}>
        <Text style={styles.carouselTitle}>{item.title}</Text>
        <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  </View>
);


  const renderMenuCard = (item, index) => {
    const maxHeight = animationValues[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 250]
    });

    const rotation = animationValues[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg']
    });

    const isExpanded = expandedMenu === index;

    return (
      <View key={index} style={styles.menuCardWrapper}>
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: item.bgColor }]}
          onPress={() => toggleMenu(index)}
          activeOpacity={0.8}
        >
          <View style={styles.menuCardTop}>
            <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
              <Text style={styles.menuIconText}>📋</Text>
            </View>
            <Animated.Text style={[styles.expandIconNew, { transform: [{ rotate: rotation }] }]}>
              ▼
            </Animated.Text>
          </View>
          <Text style={styles.menuTitle}>
            {item.title}{" "}
            <Text style={styles.menuSubtitleCount}>{item.submenus.length} items</Text>
          </Text>

        </TouchableOpacity>

        <Animated.View style={[styles.submenuContainer, { maxHeight, overflow: 'hidden' }]}>
          <View style={styles.submenuInner}>
            {item.submenus.map((submenu, subIndex) => (
              <TouchableOpacity
                key={subIndex}
                style={[styles.submenuItem, { backgroundColor: item.bgColor }]}
                onPress={() => handleSubmenuPress(submenu.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.submenuDot, { backgroundColor: item.color }]} />
                <Text style={styles.submenuText}>{submenu.name}</Text>
                <Text style={styles.submenuArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity style={styles.newsCard}>
      <Image source={{ uri: item.image }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <Text style={styles.newsTitle}>{item.title}</Text>
          <Text style={styles.newsDate}>{item.date}</Text>
        </View>
        <Text style={styles.newsExcerpt}>{item.excerpt}</Text>
        <TouchableOpacity style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>Read More →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>GAD</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>GAD Portal</Text>
            <Text style={styles.headerSubtitle}>Gender & Development </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={scrollViewRef}
            data={carouselImages}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentSlide(slideIndex);
            }}
          />

          {/* Slide Indicators */}
          <View style={styles.indicators}>
            {carouselImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { backgroundColor: index === currentSlide ? "#FFFFFF" : "#FFFFFF80" }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Main Menu */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Main Menu</Text>
            <Text style={styles.sectionSubtitle}>Access key resources and information</Text>
          </View>
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => renderMenuCard(item, index))}
          </View>
        </View>

        {/* Latest News */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest News</Text>
            <Text style={styles.sectionSubtitle}>Stay updated with recent developments</Text>
          </View>
          <FlatList
            data={newsItems}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={styles.viewOlderButton}
            onPress={() => navigation.navigate("NewsArchive")}
            activeOpacity={0.7}
          >
            <Text style={styles.viewOlderText}>View Older Posts</Text>
            <Text style={styles.viewOlderArrow}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links & Infographics Row */}
        <View style={styles.row}>
          {/* Quick Links */}
          <View style={styles.quickLinksContainer}>
            <Text style={styles.cardTitle}>Quick Links</Text>
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickLink}
                onPress={() => handleQuickLinkPress(link)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickLinkText}> {link.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Infographics */}
          <View style={styles.infographicsContainer}>
            <Text style={styles.cardTitle}>Infographics</Text>
            <TouchableOpacity style={styles.infographicCard}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop" }}
                style={styles.infographicImage}
              />
              <View style={styles.infographicOverlay}>
                <Text style={styles.infographicText}>GAD Statistics 2025</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <Text style={styles.contactText}>📍 Technological University of the Philippines - Taguig</Text>
          <Text style={styles.contactText}>📞 +63 123 456 7890</Text>
          <Text style={styles.contactText}>✉️ gad@government.ph</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: {
    width: 50,
    height: 50,
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  logoText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  headerSubtitle: { fontSize: 12, color: "#6B7280" },
  loginButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  scrollView: { flex: 1 },
  carouselContainer: { height: 250, marginBottom: 20 },
  carouselItem: { width: width, height: 250 },
  carouselImage: { width: "100%", height: "100%", resizeMode: "cover" },
  carouselOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  carouselContent: { padding: 20, paddingBottom: 40 },
  carouselTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold", marginBottom: 5 },
  carouselSubtitle: { color: "#F3F4F6", fontSize: 16 },
  indicators: { position: "absolute", bottom: 15, left: 0, right: 0, flexDirection: "row", justifyContent: "center" },
  indicator: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionHeader: { marginBottom: 15 },
  sectionTitle: { fontSize: 24, fontWeight: "bold", color: "#1F2937", marginBottom: 5 },
  sectionSubtitle: { fontSize: 14, color: "#6B7280" },
  menuGrid: { flexDirection: "column" },
  menuCardWrapper: {
    width: "100%",
    marginBottom: 15,
  },
  menuCard: {
    width: "100%",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconText: { fontSize: 22 },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  menuSubtitleCount: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  expandIconNew: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "bold",
  },
  submenuContainer: {
    overflow: "hidden",
    marginTop: 8,
  },
  submenuInner: {
    paddingTop: 8,
  },
  submenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  submenuDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  submenuText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  submenuArrow: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "bold",
  },
  newsCard: { backgroundColor: "#FFFFFF", borderRadius: 16, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: "hidden" },
  newsImage: { width: "100%", height: 180, resizeMode: "cover" },
  newsContent: { padding: 15 },
  newsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  newsTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937", flex: 1, marginRight: 10 },
  newsDate: { fontSize: 12, color: "#6B7280" },
  newsExcerpt: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 12 },
  readMoreButton: { alignSelf: "flex-start" },
  readMoreText: { color: "#8B5CF6", fontSize: 14, fontWeight: "600" },
  row: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 25 },
  quickLinksContainer: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 15, marginRight: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  infographicsContainer: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 15, marginLeft: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 15 },
  quickLink: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  quickLinkText: { fontSize: 13, color: "#4B5563" },
  infographicCard: { borderRadius: 12, overflow: "hidden", position: "relative" },
  infographicImage: { width: "100%", height: 120, resizeMode: "cover" },
  infographicOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.7)", padding: 10 },
  infographicText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  contactSection: { backgroundColor: "#8B5CF6", margin: 20, padding: 20, borderRadius: 16, alignItems: "center" },
  contactTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  contactText: { color: "#E5E7EB", fontSize: 11, marginBottom: 5 },
  viewOlderText: {
  fontSize: 15,
  fontWeight: '500',
  color: '#C4B5FD',
  letterSpacing: 0.2,
},

viewOlderArrow: {
  fontSize: 16,
  color: '#8B5CF6',
  fontWeight: '400',
  marginLeft: 8,
},
});