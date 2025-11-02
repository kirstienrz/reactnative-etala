import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Plus, Minus, BookOpen, Scale, Briefcase, FileText, Users, AlertCircle, Smartphone } from 'lucide-react-native';

const faqsData = [
    {
        id: '1',
        category: 'About GAD',
        icon: BookOpen,
        question: 'What is Gender and Development (GAD)?',
        answer: 'Gender and Development (GAD) is a development approach that focuses on the socially constructed differences between men and women, the need to challenge existing gender roles and relations, and the creation and effects of class differences on development.',
    },
    {
        id: '2',
        category: 'About GAD',
        icon: BookOpen,
        question: 'What is the GAD Focal Point System?',
        answer: 'The GAD Focal Point System (GAD FPS) is the primary mechanism for catalyzing and accelerating gender mainstreaming efforts of national government agencies, local government units, state colleges and universities, and government-owned and controlled corporations.',
    },
    {
        id: '3',
        category: 'Legal Framework',
        icon: Scale,
        question: 'What is the Magna Carta of Women?',
        answer: 'Republic Act No. 9710, also known as the Magna Carta of Women, is a comprehensive women\'s human rights law that seeks to eliminate discrimination against women by recognizing, protecting, fulfilling and promoting the rights of Filipino women, especially those in marginalized sectors.',
    },
    {
        id: '4',
        category: 'Legal Framework',
        icon: Scale,
        question: 'What is the Anti-Sexual Harassment Act?',
        answer: 'Republic Act No. 7877 declares sexual harassment unlawful in employment, education or training environment. It protects employees, students, and trainees from unwanted sexual advances, requests for sexual favors, and other verbal or physical conduct of sexual nature.',
    },
    {
        id: '5',
        category: 'GAD Budget',
        icon: Briefcase,
        question: 'What is the GAD Budget requirement?',
        answer: 'Under PCW-NEDA-DBM Joint Circular No. 2012-01, all government agencies are mandated to allocate at least 5% of their total budget for GAD programs, projects, and activities that address gender issues and promote gender equality.',
    },
    {
        id: '6',
        category: 'GAD Budget',
        icon: Briefcase,
        question: 'What can the GAD Budget be used for?',
        answer: 'The GAD Budget can be used for programs and activities that: promote gender equality and women\'s empowerment; address gender gaps and issues; build capacities on gender mainstreaming; and create an enabling environment for gender-responsive governance.',
    },
    {
        id: '7',
        category: 'GAD Plan and Budget',
        icon: FileText,
        question: 'What is a GAD Plan and Budget?',
        answer: 'The GAD Plan and Budget is a comprehensive document that outlines programs, activities, and projects designed to address gender issues, along with corresponding budget allocations. It should be aligned with the organization\'s mandate and integrated into the overall organizational plan.',
    },
    {
        id: '8',
        category: 'Implementation',
        icon: Users,
        question: 'What is Gender Mainstreaming?',
        answer: 'Gender Mainstreaming is the process of assessing the implications for women and men of any planned action, including legislation, policies or programs, in all areas and at all levels. It ensures that women\'s and men\'s concerns and experiences are integral to the design, implementation, monitoring and evaluation of policies and programs.',
    },
    {
        id: '9',
        category: 'Implementation',
        icon: Users,
        question: 'What are Gender Issues?',
        answer: 'Gender issues refer to problems, concerns, or conditions affecting women and men due to their socially constructed roles, relationships, and expectations. These may include unequal access to resources and opportunities, discrimination, stereotyping, and violence.',
    },
    {
        id: '10',
        category: 'Reporting',
        icon: FileText,
        question: 'What is a GAD Accomplishment Report?',
        answer: 'A GAD Accomplishment Report documents the implementation, results, and impact of GAD programs, projects, and activities. It shows how the allocated GAD budget was utilized and what outcomes were achieved in promoting gender equality and women\'s empowerment.',
    },
    {
        id: '11',
        category: 'Violence Against Women',
        icon: AlertCircle,
        question: 'What is Republic Act 9262?',
        answer: 'RA 9262 or the Anti-Violence Against Women and Their Children Act of 2004 provides protection to women and children who are victims of violence committed by their intimate partners or former partners. It defines violence and provides legal remedies and support services for victims.',
    },
    {
        id: '12',
        category: 'App Usage',
        icon: Smartphone,
        question: 'How do I report a GAD-related incident?',
        answer: 'Go to the Report tab in the bottom navigation. You can create a new report by selecting "Create New Report" and filling out the form with details about the incident. All reports are treated with confidentiality and handled by authorized GAD personnel.',
    },
    {
        id: '13',
        category: 'App Usage',
        icon: Smartphone,
        question: 'How can I access GAD resources?',
        answer: 'Navigate to the Resources section on the home screen. You can access the Calendar for events, Handbook for guidelines, Knowledge Hub for learning materials, Suggestion Box for feedback, and Infographics for visual information about GAD topics.',
    },
    {
        id: '14',
        category: 'App Usage',
        icon: Smartphone,
        question: 'How do I reset my password?',
        answer: 'Go to Account > Edit Profile. Under Security Settings, enter your current password and your desired new password, then tap Save Changes. Make sure to use a strong password that combines letters, numbers, and special characters.',
    },
];

export default function FAQsScreen() {
    const [openId, setOpenId] = useState(null);

    const toggle = (id) => {
        setOpenId(prev => (prev === id ? null : id));
    };

    // Group FAQs by category
    const groupedFaqs = faqsData.reduce((acc, faq) => {
        if (!acc[faq.category]) {
            acc[faq.category] = [];
        }
        acc[faq.category].push(faq);
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Frequently Asked Questions</Text>
                <Text style={styles.subtitle}>Gender and Development Portal</Text>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {Object.keys(groupedFaqs).map((category) => {
                    const CategoryIcon = groupedFaqs[category][0].icon;
                    
                    return (
                        <View key={category} style={styles.categorySection}>
                            <View style={styles.categoryHeader}>
                                <View style={styles.categoryIconContainer}>
                                    <CategoryIcon size={20} color="#4338CA" strokeWidth={2.5} />
                                </View>
                                <Text style={styles.categoryTitle}>{category}</Text>
                            </View>

                            {groupedFaqs[category].map((item) => {
                                const expanded = item.id === openId;
                                const ItemIcon = item.icon;
                                
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => toggle(item.id)}
                                        activeOpacity={0.95}
                                        style={[styles.faqCard, expanded && styles.faqCardExpanded]}
                                    >
                                        <View style={styles.faqHeader}>
                                            <View style={styles.faqLeft}>
                                                <View style={styles.faqIconContainer}>
                                                    <ItemIcon size={18} color="#6B7280" strokeWidth={2} />
                                                </View>
                                                <Text style={[styles.question, expanded && styles.questionExpanded]}>
                                                    {item.question}
                                                </Text>
                                            </View>
                                            <View style={[styles.expandButton, expanded && styles.expandButtonActive]}>
                                                {expanded ? (
                                                    <Minus size={16} color="#FFFFFF" strokeWidth={3} />
                                                ) : (
                                                    <Plus size={16} color="#4338CA" strokeWidth={3} />
                                                )}
                                            </View>
                                        </View>

                                        {expanded && (
                                            <View style={styles.answerSection}>
                                                <View style={styles.answerLine} />
                                                <Text style={styles.answer}>{item.answer}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}

                <View style={styles.helpSection}>
                    <View style={styles.helpCard}>
                        <View style={styles.helpHeader}>
                            <View style={styles.helpIconCircle}>
                                <AlertCircle size={24} color="#4338CA" strokeWidth={2} />
                            </View>
                            <Text style={styles.helpTitle}>Need Additional Support?</Text>
                        </View>
                        <Text style={styles.helpText}>
                            For further inquiries or assistance, please contact your designated GAD Focal Point or refer to the Philippine Commission on Women (PCW) official resources.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 32,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#4338CA',
    },
    categoryIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
    },
    faqCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    faqCardExpanded: {
        borderColor: '#4338CA',
        shadowColor: '#4338CA',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    faqLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: 12,
    },
    faqIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    question: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        lineHeight: 21,
    },
    questionExpanded: {
        color: '#4338CA',
    },
    expandButton: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4338CA',
    },
    expandButtonActive: {
        backgroundColor: '#4338CA',
    },
    answerSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    answerLine: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 16,
        marginLeft: 44,
    },
    answer: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 22,
        paddingLeft: 44,
    },
    helpSection: {
        marginTop: 16,
    },
    helpCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderLeftWidth: 4,
        borderLeftColor: '#4338CA',
    },
    helpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    helpIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
    },
    helpText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 22,
    },
});