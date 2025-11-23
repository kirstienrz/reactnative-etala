import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MessageSquare, Send, CheckCircle, Lock } from 'lucide-react-native';
import { createSuggestion } from '../../api/suggestion';

export default function GADSuggestionBox() {
  const [newSuggestion, setNewSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!newSuggestion.trim()) {
      Alert.alert('Required', 'Please enter a suggestion before submitting.');
      return;
    }

    try {
      setLoading(true);
      await createSuggestion({ text: newSuggestion });
      setNewSuggestion('');
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const characterCount = newSuggestion.length;
  const maxCharacters = 500;

  return (
    <KeyboardAvoidingView 
      style={styles.wrapper} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MessageSquare size={28} color="#1F2937" />
            </View>
            <Text style={styles.title}>Suggestion Box</Text>
            <Text style={styles.subtitle}>
              Share your ideas to help improve our Gender and Development programs
            </Text>
          </View>

          {/* Success Message */}
          {showSuccess && (
            <View style={styles.successBanner}>
              <CheckCircle size={20} color="#16A34A" />
              <Text style={styles.successText}>Suggestion submitted successfully!</Text>
            </View>
          )}

          {/* Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Your Suggestion</Text>
            <TextInput
              placeholder="Share your thoughts, ideas, or recommendations..."
              value={newSuggestion}
              onChangeText={setNewSuggestion}
              style={styles.input}
              multiline
              maxLength={maxCharacters}
              placeholderTextColor="#9CA3AF"
            />
            
            {/* Character Count */}
            <View style={styles.inputFooter}>
              <Text style={[
                styles.charCount,
                characterCount > maxCharacters * 0.9 && styles.charCountWarning
              ]}>
                {characterCount} / {maxCharacters}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled
            ]} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Send size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>Submit Suggestion</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Privacy Notice */}
          <View style={styles.privacyCard}>
            <Lock size={16} color="#6B7280" />
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>Anonymous & Private</Text>
              <Text style={styles.privacyText}>
                Your suggestion is completely anonymous. We value your feedback and use it to improve our programs.
              </Text>
            </View>
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelinesTitle}>Guidelines</Text>
            <View style={styles.guidelinesList}>
              <View style={styles.guidelineItem}>
                <Text style={styles.guidelineBullet}>•</Text>
                <Text style={styles.guidelineText}>Be respectful and constructive</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Text style={styles.guidelineBullet}>•</Text>
                <Text style={styles.guidelineText}>Provide specific and actionable feedback</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Text style={styles.guidelineBullet}>•</Text>
                <Text style={styles.guidelineText}>Focus on improving GAD programs and initiatives</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20
  },
  container: {
    flex: 1
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    flex: 1
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    minHeight: 140,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#111827',
    lineHeight: 22
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500'
  },
  charCountWarning: {
    color: '#DC2626'
  },
  submitButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16
  },
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    gap: 12,
    alignItems: 'flex-start'
  },
  privacyTextContainer: {
    flex: 1
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4
  },
  privacyText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18
  },
  guidelinesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12
  },
  guidelinesList: {
    gap: 8
  },
  guidelineItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start'
  },
  guidelineBullet: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '700',
    marginTop: -2
  },
  guidelineText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1
  }
});