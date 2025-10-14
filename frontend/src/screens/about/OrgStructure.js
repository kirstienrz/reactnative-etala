// screens/OrganizationalStructure.js
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function OrganizationalStructure() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header 
        title="Organizational Structure" 
        subtitle="GENDER AND DEVELOPMENT OFFICE" 
      />

      {/* Main Content */}
      <View style={styles.contentWrapper}>
        {/* Introduction */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            The GAD Office organizational structure ensures effective implementation 
            of gender and development programs across the university.
          </Text>
        </View>

        {/* Director Level */}
        <View style={styles.levelSection}>
          <Text style={styles.levelTitle}>OFFICE OF THE DIRECTOR</Text>
          
          <View style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>👤</Text>
              </View>
              <View style={styles.positionInfo}>
                <Text style={styles.positionTitle}>GAD Focal Point Director</Text>
                <Text style={styles.positionSubtitle}>Overall leadership and strategic direction</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Management Level */}
        <View style={styles.levelSection}>
          <Text style={styles.levelTitle}>MANAGEMENT TEAM</Text>
          
          <View style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>👥</Text>
              </View>
              <View style={styles.positionInfo}>
                <Text style={styles.positionTitle}>Assistant Director</Text>
                <Text style={styles.positionSubtitle}>Program coordination and implementation</Text>
              </View>
            </View>
          </View>

          <View style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📋</Text>
              </View>
              <View style={styles.positionInfo}>
                <Text style={styles.positionTitle}>Administrative Officer</Text>
                <Text style={styles.positionSubtitle}>Administrative support and documentation</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Technical Teams */}
        <View style={styles.levelSection}>
          <Text style={styles.levelTitle}>TECHNICAL WORKING GROUPS</Text>
          
          <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamIcon}>📊</Text>
              <Text style={styles.teamTitle}>Planning & Research</Text>
            </View>
            <Text style={styles.teamDescription}>
              GAD planning, research, data collection, and policy development
            </Text>
          </View>

          <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamIcon}>🎓</Text>
              <Text style={styles.teamTitle}>Training & Advocacy</Text>
            </View>
            <Text style={styles.teamDescription}>
              Gender sensitivity training, awareness campaigns, and advocacy programs
            </Text>
          </View>

          <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamIcon}>💼</Text>
              <Text style={styles.teamTitle}>Programs & Services</Text>
            </View>
            <Text style={styles.teamDescription}>
              Implementation of GAD programs, counseling, and student services
            </Text>
          </View>

          <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamIcon}>📈</Text>
              <Text style={styles.teamTitle}>Monitoring & Evaluation</Text>
            </View>
            <Text style={styles.teamDescription}>
              Program assessment, impact evaluation, and reporting
            </Text>
          </View>
        </View>

        {/* Focal Points */}
        <View style={styles.levelSection}>
          <Text style={styles.levelTitle}>COLLEGE/DEPARTMENT FOCAL POINTS</Text>
          
          <View style={styles.focalCard}>
            <Text style={styles.focalTitle}>College Representatives</Text>
            <Text style={styles.focalDescription}>
              Each college has designated GAD focal persons who serve as liaisons 
              between the GAD Office and their respective colleges.
            </Text>
          </View>

          <View style={styles.focalCard}>
            <Text style={styles.focalTitle}>Department Coordinators</Text>
            <Text style={styles.focalDescription}>
              Department-level coordinators ensure GAD mainstreaming in academic 
              programs and administrative functions.
            </Text>
          </View>
        </View>

        {/* Committees */}
        <View style={styles.committeeSection}>
          <Text style={styles.sectionTitle}>ADVISORY COMMITTEES</Text>
          <View style={styles.committeeList}>
            <View style={styles.committeeItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.committeeText}>GAD Resource Pool</Text>
            </View>
            <View style={styles.committeeItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.committeeText}>Technical Working Group on Gender Mainstreaming</Text>
            </View>
            <View style={styles.committeeItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.committeeText}>Committee on Decorum and Investigation (CODI)</Text>
            </View>
            <View style={styles.committeeItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.committeeText}>Anti-Sexual Harassment Committee</Text>
            </View>
          </View>
        </View>
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: "#EDE9FE",
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#5B21B6",
    textAlign: "center",
    fontWeight: "500",
  },
  levelSection: {
    marginBottom: 30,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5B21B6",
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: "center",
  },
  positionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  positionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    width: 50,
    height: 50,
    backgroundColor: "#F5F3FF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  badgeText: {
    fontSize: 24,
  },
  positionInfo: {
    flex: 1,
  },
  positionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#5B21B6",
    marginBottom: 4,
  },
  positionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  teamCard: {
    backgroundColor: "#F5F3FF",
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#A78BFA",
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  teamIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5B21B6",
  },
  teamDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  focalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  focalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5B21B6",
    marginBottom: 6,
  },
  focalDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  committeeSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5B21B6",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 20,
  },
  committeeList: {
    paddingLeft: 10,
  },
  committeeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 20,
    color: "#7C3AED",
    marginRight: 12,
    lineHeight: 20,
  },
  committeeText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});









//  import React from "react";
// import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
// import Header from "../../components/Header";
// import Footer from "../../components/Footer";

// export default function GADCommittee() {
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Header title="GAD Committee" subtitle="GENDER AND DEVELOPMENT OFFICE" />

//       <View style={styles.contentWrapper}>
//         {/* Introduction */}
//         <View style={styles.introCard}>
//           <Text style={styles.introText}>
//             The GAD Committee is composed of dedicated members who lead the
//             planning, implementation, and monitoring of gender-responsive
//             initiatives across the university.
//           </Text>
//         </View>

//         {/* Committee Leadership */}
//         <View style={styles.levelSection}>
//           <Text style={styles.levelTitle}>LEADERSHIP</Text>

//           <View style={styles.positionCard}>
//             <View style={styles.positionHeader}>
//               <Image
//                 source={require("../../assets/committee/director.png")}
//                 style={styles.icon}
//               />
//               <View style={styles.positionInfo}>
//                 <Text style={styles.positionTitle}>GAD Director</Text>
//                 <Text style={styles.positionSubtitle}>
//                   Provides overall leadership and policy guidance for GAD
//                   initiatives.
//                 </Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.positionCard}>
//             <View style={styles.positionHeader}>
//               <Image
//                 source={require("../../assets/committee/assistant_director.png")}
//                 style={styles.icon}
//               />
//               <View style={styles.positionInfo}>
//                 <Text style={styles.positionTitle}>Assistant Director</Text>
//                 <Text style={styles.positionSubtitle}>
//                   Assists in managing operations and coordinates inter-departmental programs.
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Committee Members */}
//         <View style={styles.levelSection}>
//           <Text style={styles.levelTitle}>COMMITTEE MEMBERS</Text>

//           <View style={styles.teamCard}>
//             <View style={styles.teamHeader}>
//               <Image
//                 source={require("../../assets/committee/training.png")}
//                 style={styles.smallIcon}
//               />
//               <Text style={styles.teamTitle}>Training & Advocacy Team</Text>
//             </View>
//             <Text style={styles.teamDescription}>
//               Conducts gender sensitivity training, advocacy campaigns, and
//               information drives.
//             </Text>
//           </View>

//           <View style={styles.teamCard}>
//             <View style={styles.teamHeader}>
//               <Image
//                 source={require("../../assets/committee/research.png")}
//                 style={styles.smallIcon}
//               />
//               <Text style={styles.teamTitle}>Research & Planning Team</Text>
//             </View>
//             <Text style={styles.teamDescription}>
//               Handles gender-related studies, research coordination, and
//               monitoring of gender indicators.
//             </Text>
//           </View>

//           <View style={styles.teamCard}>
//             <View style={styles.teamHeader}>
//               <Image
//                 source={require("../../assets/committee/services.png")}
//                 style={styles.smallIcon}
//               />
//               <Text style={styles.teamTitle}>Programs & Services Team</Text>
//             </View>
//             <Text style={styles.teamDescription}>
//               Oversees GAD projects, outreach services, and community partnership activities.
//             </Text>
//           </View>

//           <View style={styles.teamCard}>
//             <View style={styles.teamHeader}>
//               <Image
//                 source={require("../../assets/committee/monitoring.png")}
//                 style={styles.smallIcon}
//               />
//               <Text style={styles.teamTitle}>Monitoring & Evaluation Team</Text>
//             </View>
//             <Text style={styles.teamDescription}>
//               Evaluates the progress, effectiveness, and impact of all GAD-related
//               activities.
//             </Text>
//           </View>
//         </View>

//         {/* Advisory Committees */}
//         <View style={styles.committeeSection}>
//           <Text style={styles.sectionTitle}>ADVISORY COMMITTEES</Text>

//           <View style={styles.committeeItem}>
//             <Image
//               source={require("../../assets/committee/resource_pool.png")}
//               style={styles.listIcon}
//             />
//             <Text style={styles.committeeText}>GAD Resource Pool</Text>
//           </View>

//           <View style={styles.committeeItem}>
//             <Image
//               source={require("../../assets/committee/mainstreaming.png")}
//               style={styles.listIcon}
//             />
//             <Text style={styles.committeeText}>
//               Technical Working Group on Gender Mainstreaming
//             </Text>
//           </View>

//           <View style={styles.committeeItem}>
//             <Image
//               source={require("../../assets/committee/codi.png")}
//               style={styles.listIcon}
//             />
//             <Text style={styles.committeeText}>
//               Committee on Decorum and Investigation (CODI)
//             </Text>
//           </View>

//           <View style={styles.committeeItem}>
//             <Image
//               source={require("../../assets/committee/anti_harassment.png")}
//               style={styles.listIcon}
//             />
//             <Text style={styles.committeeText}>Anti-Sexual Harassment Committee</Text>
//           </View>
//         </View>
//       </View>

//       <Footer />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#F9FAFB",
//   },
//   contentWrapper: {
//     paddingHorizontal: 20,
//     paddingTop: 30,
//     paddingBottom: 40,
//   },
//   introCard: {
//     backgroundColor: "#EDE9FE",
//     borderRadius: 8,
//     padding: 20,
//     marginBottom: 30,
//     borderLeftWidth: 4,
//     borderLeftColor: "#7C3AED",
//   },
//   introText: {
//     fontSize: 15,
//     lineHeight: 24,
//     color: "#5B21B6",
//     textAlign: "center",
//     fontWeight: "500",
//   },
//   levelSection: {
//     marginBottom: 30,
//   },
//   levelTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#5B21B6",
//     letterSpacing: 1.5,
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   positionCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 8,
//     padding: 20,
//     marginBottom: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: "#7C3AED",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   positionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   icon: {
//     width: 50,
//     height: 50,
//     marginRight: 16,
//     resizeMode: "contain",
//   },
//   smallIcon: {
//     width: 35,
//     height: 35,
//     marginRight: 12,
//     resizeMode: "contain",
//   },
//   positionInfo: {
//     flex: 1,
//   },
//   positionTitle: {
//     fontSize: 17,
//     fontWeight: "700",
//     color: "#5B21B6",
//     marginBottom: 4,
//   },
//   positionSubtitle: {
//     fontSize: 13,
//     color: "#6B7280",
//     lineHeight: 18,
//   },
//   teamCard: {
//     backgroundColor: "#F5F3FF",
//     borderRadius: 8,
//     padding: 18,
//     marginBottom: 12,
//     borderLeftWidth: 3,
//     borderLeftColor: "#A78BFA",
//   },
//   teamHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   teamTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#5B21B6",
//   },
//   teamDescription: {
//     fontSize: 13,
//     color: "#6B7280",
//     lineHeight: 20,
//   },
//   committeeSection: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 8,
//     padding: 24,
//     marginTop: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#5B21B6",
//     letterSpacing: 1.5,
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   committeeItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   listIcon: {
//     width: 30,
//     height: 30,
//     marginRight: 12,
//     resizeMode: "contain",
//   },
//   committeeText: {
//     fontSize: 14,
//     color: "#374151",
//     lineHeight: 20,
//     flex: 1,
//   },
// });
