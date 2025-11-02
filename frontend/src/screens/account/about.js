import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Info, Smartphone, Shield, Zap, Database, Lock, Code, Globe, CheckCircle, Server } from 'lucide-react-native';

const About = () => {
    const FeatureCard = ({ icon: Icon, title, description }) => (
        <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
                <Icon size={22} color="#4338CA" />
            </View>
            <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </View>
    );

    const TechSpec = ({ label, value }) => (
        <View style={styles.techSpecRow}>
            <Text style={styles.techSpecLabel}>{label}</Text>
            <Text style={styles.techSpecValue}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.heroIconContainer}>
                        <View style={styles.heroIconOuter}>
                            <View style={styles.heroIconInner}>
                                <Smartphone size={36} color="#4338CA" strokeWidth={2.5} />
                            </View>
                        </View>
                    </View>
                    <Text style={styles.heroTitle}>E-TALA</Text>
                    <Text style={styles.heroSubtitle}>Gender and Development Mobile Application</Text>
                    <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>Version 1.0.0</Text>
                    </View>
                </View>

                {/* App Overview */}
                <View style={styles.overviewCard}>
                    <View style={styles.overviewHeader}>
                        <Info size={24} color="#4338CA" />
                        <Text style={styles.overviewTitle}>About This Application</Text>
                    </View>
                    <Text style={styles.overviewText}>
                        E-TALA is a mobile application designed to digitize and streamline Gender and Development 
                        (GAD) operations. The app provides a centralized platform for accessing GAD resources, 
                        submitting reports, tracking incidents, and staying informed about GAD initiatives and policies.
                    </Text>
                </View>

                {/* Technical Specifications */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderContainer}>
                        <View style={styles.sectionHeaderLine} />
                        <Text style={styles.sectionTitle}>Technical Specifications</Text>
                        <View style={styles.sectionHeaderLine} />
                    </View>

                    <View style={styles.techSpecCard}>
                        <TechSpec label="Platform" value="React Native (Expo)" />
                        <View style={styles.divider} />
                        <TechSpec label="Minimum OS" value="Android 8.0 / iOS 12.0" />
                        <View style={styles.divider} />
                        <TechSpec label="Storage Required" value="~50 MB" />
                        <View style={styles.divider} />
                        <TechSpec label="Internet Connection" value="Required" />
                        <View style={styles.divider} />
                        <TechSpec label="Backend" value="Node.js REST API" />
                        <View style={styles.divider} />
                        <TechSpec label="Database" value="MySQL" />
                    </View>
                </View>

                {/* Core Features */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderContainer}>
                        <View style={styles.sectionHeaderLine} />
                        <Text style={styles.sectionTitle}>Core Features</Text>
                        <View style={styles.sectionHeaderLine} />
                    </View>

                    <FeatureCard 
                        icon={Shield}
                        title="Secure Authentication"
                        description="User authentication with email verification and secure PIN protection"
                    />
                    <FeatureCard 
                        icon={Database}
                        title="Report Management"
                        description="Create, submit, and track incident reports with real-time status updates"
                    />
                    <FeatureCard 
                        icon={Globe}
                        title="Resource Access"
                        description="Browse GAD policies, guidelines, handbooks, and educational materials"
                    />
                    <FeatureCard 
                        icon={Code}
                        title="QR Code Scanner"
                        description="Scan QR codes for event attendance and verification"
                    />
                    <FeatureCard 
                        icon={Server}
                        title="Cloud Synchronization"
                        description="Data synced across devices with secure cloud storage"
                    />
                    <FeatureCard 
                        icon={Zap}
                        title="Real-time Notifications"
                        description="Push notifications for updates, announcements, and report status changes"
                    />
                </View>

                {/* Security Features */}
                <View style={styles.securityCard}>
                    <View style={styles.securityHeader}>
                        <Lock size={24} color="#DC2626" />
                        <Text style={styles.securityTitle}>Security & Privacy</Text>
                    </View>
                    <View style={styles.securityList}>
                        <View style={styles.securityItem}>
                            <CheckCircle size={18} color="#059669" />
                            <Text style={styles.securityText}>End-to-end encryption for sensitive data</Text>
                        </View>
                        <View style={styles.securityItem}>
                            <CheckCircle size={18} color="#059669" />
                            <Text style={styles.securityText}>Secure token-based authentication</Text>
                        </View>
                        <View style={styles.securityItem}>
                            <CheckCircle size={18} color="#059669" />
                            <Text style={styles.securityText}>PIN protection for sensitive operations</Text>
                        </View>
                        <View style={styles.securityItem}>
                            <CheckCircle size={18} color="#059669" />
                            <Text style={styles.securityText}>Anonymous reporting capability</Text>
                        </View>
                        <View style={styles.securityItem}>
                            <CheckCircle size={18} color="#059669" />
                            <Text style={styles.securityText}>HTTPS secure data transmission</Text>
                        </View>
                        <View style={styles.securityItem}>
                            <CheckCircle size={18} color="#059669" />
                            <Text style={styles.securityText}>Regular security audits and updates</Text>
                        </View>
                    </View>
                </View>

                {/* App Capabilities */}
                <View style={styles.capabilitiesCard}>
                    <Text style={styles.capabilitiesTitle}>What You Can Do</Text>
                    <View style={styles.capabilitiesList}>
                        <Text style={styles.capabilityItem}>
                            <Text style={styles.bullet}>•</Text> View and download GAD policies, plans, and reports
                        </Text>
                        <Text style={styles.capabilityItem}>
                            <Text style={styles.bullet}>•</Text> Submit confidential incident reports with attachments
                        </Text>
                        <Text style={styles.capabilityItem}>
                            <Text style={styles.bullet}>•</Text> Track report status and receive updates
                        </Text>
                        <Text style={styles.capabilityItem}>
                            <Text style={styles.bullet}>•</Text> Access GAD calendar for upcoming events
                        </Text>
                        <Text style={styles.capabilityItem}>
                            <Text style={styles.bullet}>•</Text> Browse knowledge hub and educational resources
                        </Text>
                        <Text style={styles.capabilityItem}>
                            <Text style={styles.bullet}>•</Text> Submit suggestions through the suggestion box
                        </Text>
                        <Text style={styles.capabilityItem}>
                            <Text style={styles.bullet}>•</Text> Read latest GAD news and articles
                        </Text>
                        <Text style={styles.capabilityItem}>
                            <Text style={styles.bullet}>•</Text> Scan QR codes for event verification
                        </Text>
                    </View>
                </View>

                {/* System Requirements */}
                <View style={styles.requirementsCard}>
                    <Text style={styles.requirementsTitle}>System Requirements</Text>
                    <View style={styles.requirementsGrid}>
                        <View style={styles.requirementItem}>
                            <Text style={styles.requirementLabel}>Android</Text>
                            <Text style={styles.requirementValue}>8.0 or higher</Text>
                        </View>
                        <View style={styles.requirementItem}>
                            <Text style={styles.requirementLabel}>iOS</Text>
                            <Text style={styles.requirementValue}>12.0 or higher</Text>
                        </View>
                        <View style={styles.requirementItem}>
                            <Text style={styles.requirementLabel}>RAM</Text>
                            <Text style={styles.requirementValue}>2GB minimum</Text>
                        </View>
                        <View style={styles.requirementItem}>
                            <Text style={styles.requirementLabel}>Storage</Text>
                            <Text style={styles.requirementValue}>50MB free space</Text>
                        </View>
                    </View>
                </View>

                {/* Developer Info */}
                <View style={styles.developerCard}>
                    <Text style={styles.developerTitle}>Developed By</Text>
                    <Text style={styles.developerText}>
                        E-TALA Development Team
                    </Text>
                    <Text style={styles.developerSubtext}>
                        In partnership with the GAD Office
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerDivider} />
                    <Text style={styles.footerText}>
                        © {new Date().getFullYear()} E-TALA Mobile Application
                    </Text>
                    <Text style={styles.footerSubtext}>
                        Version 1.0.0 • Build 100 • Last Updated: November 2024
                    </Text>
                </View>

                <View style={styles.spacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F9FAFB' 
    },
    content: { 
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    
    // Hero Section
    hero: {
        alignItems: 'center',
        marginBottom: 28,
        paddingVertical: 20,
    },
    heroIconContainer: {
        marginBottom: 20,
    },
    heroIconOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4338CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    heroIconInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: { 
        fontSize: 36, 
        fontWeight: '800', 
        color: '#4338CA',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    heroSubtitle: { 
        fontSize: 15, 
        color: '#6B7280', 
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    versionBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    versionText: {
        color: '#4338CA',
        fontSize: 13,
        fontWeight: '600',
    },

    // Overview Card
    overviewCard: {
        backgroundColor: '#4338CA',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#4338CA',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    overviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    overviewTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 12,
    },
    overviewText: {
        fontSize: 15,
        color: '#E0E7FF',
        lineHeight: 24,
        fontWeight: '400',
    },

    // Section
    section: {
        marginBottom: 28,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        paddingHorizontal: 12,
    },
    sectionHeaderLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },

    // Tech Spec Card
    techSpecCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    techSpecRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    techSpecLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    techSpecValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },

    // Feature Cards
    featureCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    featureIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    featureContent: {
        flex: 1,
        justifyContent: 'center',
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },

    // Security Card
    securityCard: {
        backgroundColor: '#FEF2F2',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    securityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    securityTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#991B1B',
        marginLeft: 12,
    },
    securityList: {
        gap: 12,
    },
    securityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    securityText: {
        flex: 1,
        fontSize: 14,
        color: '#7F1D1D',
        lineHeight: 20,
    },

    // Capabilities Card
    capabilitiesCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    capabilitiesTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    capabilitiesList: {
        gap: 10,
    },
    capabilityItem: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        paddingLeft: 8,
    },
    bullet: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4338CA',
        marginRight: 8,
    },

    // Requirements Card
    requirementsCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    requirementsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    requirementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    requirementItem: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    requirementLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 6,
    },
    requirementValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
    },

    // Developer Card
    developerCard: {
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    developerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#065F46',
        marginBottom: 8,
    },
    developerText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#059669',
        marginBottom: 4,
    },
    developerSubtext: {
        fontSize: 13,
        color: '#047857',
    },

    // Footer
    footer: {
        alignItems: 'center',
        paddingTop: 24,
    },
    footerDivider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 6,
    },
    footerSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 18,
    },
    spacer: {
        height: 20,
    },
});

export default About;