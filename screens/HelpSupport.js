// src/screens/HelpSupport.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../config";

const HelpSupportScreen = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default fallback content
  const defaultContent = {
    greeting: "Hi, How can we help you?",
    contactOptions: [
      {
        id: 1,
        title: "Email Us",
        subtitle: "support@playbhoomi.com",
        icon: "mail",
        type: "email"
      },
      {
        id: 2,
        title: "Call Us",
        subtitle: "+91 1234567890",
        icon: "call",
        type: "phone"
      },
      {
        id: 3,
        title: "WhatsApp",
        subtitle: "Chat with us",
        icon: "logo-whatsapp",
        type: "whatsapp",
        whatsappNumber: "+911234567890"
      }
    ],
    faqs: [
      {
        id: 1,
        question: "How do I book a turf?",
        answer: "Browse available turfs on the home screen, select your preferred turf, choose date and time slots, and proceed to payment to confirm your booking."
      },
      {
        id: 2,
        question: "What is the cancellation policy?",
        answer: "Cancellations made 24+ hours before: Full refund\nCancellations made 12-24 hours before: 50% refund\nCancellations made less than 12 hours: No refund"
      },
      {
        id: 3,
        question: "How do I get a refund?",
        answer: "Refunds are processed automatically based on our cancellation policy. The amount will be credited to your original payment method within 5-7 business days."
      },
      {
        id: 4,
        question: "Can I modify my booking?",
        answer: "Yes, you can modify your booking from the 'My Bookings' section. However, modifications are subject to availability and may incur additional charges."
      },
      {
        id: 5,
        question: "What payment methods are accepted?",
        answer: "We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway."
      },
    ],
    supportHours: "Monday - Sunday: 9:00 AM - 9:00 PM"
  };

  useEffect(() => {
    fetchHelpContent();
  }, []);

  const fetchHelpContent = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API
      const response = await axios.get(`${config.API_URL}/content/help-support`);
      
      if (response.data) {
        setContent(response.data);
        // Cache the content
        await AsyncStorage.setItem('help_support_content', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching help content:', error);
      
      // Try to load from cache
      try {
        const cachedContent = await AsyncStorage.getItem('help_support_content');
        if (cachedContent) {
          setContent(JSON.parse(cachedContent));
        } else {
          setContent(defaultContent);
        }
      } catch (cacheError) {
        setContent(defaultContent);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactAction = (option) => {
    if (option.type === 'email') {
      Linking.openURL(`mailto:${option.subtitle}`);
    } else if (option.type === 'phone') {
      Linking.openURL(`tel:${option.subtitle.replace(/\s/g, '')}`);
    } else if (option.type === 'whatsapp') {
      Linking.openURL(`https://wa.me/${option.whatsappNumber.replace(/\D/g, '')}`);
    }
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004CE8" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const displayContent = content || defaultContent;

  return (
    <ScrollView style={styles.container}>
      {/* Greeting */}
      <Text style={styles.greeting}>{displayContent.greeting}</Text>

      {/* Contact Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        {displayContent.contactOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.contactCard}
            onPress={() => handleContactAction(option)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={option.icon} size={24} color="#004CE8" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {displayContent.faqs.map((faq) => (
          <View key={faq.id} style={styles.faqCard}>
            <TouchableOpacity
              style={styles.faqHeader}
              onPress={() => toggleFAQ(faq.id)}
            >
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"}
                size={20}
                color="#333"
              />
            </TouchableOpacity>
            {expandedFAQ === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Support Hours */}
      <View style={styles.infoCard}>
        <Ionicons name="time-outline" size={24} color="#004CE8" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Support Hours</Text>
          <Text style={styles.infoText}>{displayContent.supportHours}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    color: "#000",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 20,
    marginBottom: 12,
    color: "#000",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  faqCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#004CE8",
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
  },
});

export default HelpSupportScreen;
