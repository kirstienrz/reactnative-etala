import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Linking,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const GadOfficePage = () => (
  <SafeAreaView style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Gender & Development Office</Text>
        <Text style={styles.headerSubtitle}>Technological University of the Philippines – Taguig</Text>
        <Text style={styles.headerDescription}>
          Promoting gender equality, empowering all genders, and fostering an inclusive campus environment
        </Text>
      </View> */}

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Us</Text>
        
        <View style={styles.card}>
          <Text style={styles.paragraph}>
            The Gender & Development (GAD) Office at the Technological University of the Philippines – Taguig is dedicated to promoting gender equality, empowering all genders, and fostering an inclusive campus environment.
          </Text>

          <Text style={styles.subsectionTitle}>Our Commitment</Text>
          
          {/* Commitment Cards */}
          <View style={styles.commitmentGrid}>
            <View style={[styles.commitmentCard, styles.purpleCard]}>
              <Text style={styles.commitmentTitle}>Awareness</Text>
              <Text style={styles.commitmentText}>Raise awareness of gender-related issues and rights</Text>
            </View>
            <View style={[styles.commitmentCard, styles.blueCard]}>
              <Text style={styles.commitmentTitle}>Programs</Text>
              <Text style={styles.commitmentText}>Provide programmes and activities that support gender sensitivity</Text>
            </View>
            <View style={[styles.commitmentCard, styles.pinkCard]}>
              <Text style={styles.commitmentTitle}>Responsiveness</Text>
              <Text style={styles.commitmentText}>Ensure policies are responsive to diverse gender needs</Text>
            </View>
          </View>

          <Text style={[styles.paragraph, styles.marginTop]}>
            Through workshops, events (such as our National Women's Month celebration), training, and collaboration with students, faculty, and staff, we strive to build a supportive and respectful community for everyone at TUP Taguig.
          </Text>
        </View>
      </View>

      {/* Vision & Mission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vision & Mission</Text>

        <View style={[styles.visionCard, styles.blueVision]}>
          <Text style={styles.cardTitle}>Vision</Text>
          <Text style={styles.cardText}>
            A campus community where gender equality is celebrated, all individuals are empowered to thrive, and diversity and inclusion are woven into the fabric of university life.
          </Text>
        </View>

        <View style={[styles.visionCard, styles.purpleVision, styles.marginTop]}>
          <Text style={styles.cardTitle}>Mission</Text>
          <Text style={styles.cardText}>
            To advance gender equality and social inclusion through advocacy, education, and collaborative initiatives that empower all members of the TUP Taguig community to build a more equitable and respectful institution.
          </Text>
        </View>
      </View>

      {/* Organization Structure Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Organization Structure</Text>

        <View style={styles.card}>
          <View style={styles.orgHeader}>
            <Text style={styles.orgHeaderLabel}>Office Head</Text>
            <Text style={styles.orgHeaderTitle}>Gender & Development Office Director</Text>
          </View>

          <View style={styles.teamsContainer}>
            {/* Advocacy & Programs */}
            <View style={styles.teamSection}>
              <View style={[styles.teamHeader, styles.purpleHeader]}>
                <Text style={styles.teamTitle}>Advocacy & Programs</Text>
              </View>
              <View style={styles.teamItems}>
                <Text style={styles.teamItem}>• Program Coordinators</Text>
                <Text style={styles.teamItem}>• Event Specialists</Text>
                <Text style={styles.teamItem}>• Community Liaisons</Text>
              </View>
            </View>

            {/* Training & Capacity Building */}
            <View style={styles.teamSection}>
              <View style={[styles.teamHeader, styles.blueHeader]}>
                <Text style={styles.teamTitle}>Training & Capacity Building</Text>
              </View>
              <View style={styles.teamItems}>
                <Text style={styles.teamItem}>• Workshop Facilitators</Text>
                <Text style={styles.teamItem}>• Mentorship Coordinators</Text>
                <Text style={styles.teamItem}>• Resource Developers</Text>
              </View>
            </View>

            {/* Support & Operations */}
            <View style={styles.teamSection}>
              <View style={[styles.teamHeader, styles.pinkHeader]}>
                <Text style={styles.teamTitle}>Support & Operations</Text>
              </View>
              <View style={styles.teamItems}>
                <Text style={styles.teamItem}>• Administrative Staff</Text>
                <Text style={styles.teamItem}>• Communications Officer</Text>
                <Text style={styles.teamItem}>• Documentation Specialist</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get in Touch</Text>

        <View style={styles.card}>
          <Text style={styles.subsectionTitle}>Connect With Us</Text>
          <Text style={styles.paragraph}>
            Follow us on social media for updates on our latest initiatives, events, and programs promoting gender equality and inclusion.
          </Text>

          <TouchableOpacity
            style={styles.facebookButton}
            onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=61551576756370')}
          >
            <Text style={styles.facebookButtonText}>Visit Facebook Page</Text>
          </TouchableOpacity>

          <Text style={[styles.subsectionTitle, styles.marginTop]}>Office Location</Text>
          <Text style={styles.locationText}>Gender & Development Office</Text>
          <Text style={styles.locationText}>Technological University of the Philippines – Taguig</Text>
          <Text style={styles.locationSmall}>
            Km. 14, East Service Road, South Superhighway, Taguig City
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 Gender & Development Office, Technological University of the Philippines – Taguig
        </Text>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: '#2563eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#dbeafe',
    marginBottom: 12,
  },
  headerDescription: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 22,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  paragraph: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 12,
  },
  marginTop: {
    marginTop: 16,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 16,
  },
  commitmentGrid: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  commitmentCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
  purpleCard: {
    backgroundColor: '#f3e8ff',
  },
  blueCard: {
    backgroundColor: '#eff6ff',
  },
  pinkCard: {
    backgroundColor: '#fce7f3',
  },
  commitmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1e293b',
  },
  commitmentText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  visionCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  blueVision: {
    backgroundColor: '#2563eb',
  },
  purpleVision: {
    backgroundColor: '#7c3aed',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: '#f1f5f9',
    lineHeight: 24,
  },
  orgHeader: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  orgHeaderLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  orgHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  teamsContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  teamSection: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  teamHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
  },
  purpleHeader: {
    backgroundColor: '#f3e8ff',
    borderLeftColor: '#7c3aed',
  },
  blueHeader: {
    backgroundColor: '#eff6ff',
    borderLeftColor: '#2563eb',
  },
  pinkHeader: {
    backgroundColor: '#fce7f3',
    borderLeftColor: '#ec4899',
  },
  teamTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  teamItems: {
    padding: 16,
    backgroundColor: '#fff',
  },
  teamItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 20,
  },
  facebookButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facebookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationSmall: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#1e293b',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default GadOfficePage;