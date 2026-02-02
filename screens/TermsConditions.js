import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../config';

const TermsConditionsScreen = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default fallback content
  const defaultContent = {
    title: "Terms & Conditions",
    lastUpdated: "January 19, 2026",
    sections: [
      {
        id: 1,
        title: "1. Acceptance of Terms",
        content: "By accessing and using this turf booking application, you accept and agree to be bound by the terms and provision of this agreement."
      },
      {
        id: 2,
        title: "2. Booking Policy",
        content: "• All bookings are subject to availability\n• Booking confirmation will be sent via email/SMS\n• Payment must be completed to confirm booking\n• Booking slots are for the specified time duration only"
      },
      {
        id: 3,
        title: "3. Cancellation Policy",
        content: "• Cancellations made 24 hours before booking: Full refund\n• Cancellations made 12-24 hours before: 50% refund\n• Cancellations made less than 12 hours: No refund\n• Refunds will be processed within 5-7 business days"
      },
      {
        id: 4,
        title: "4. User Responsibilities",
        content: "• Users must arrive on time for their booking\n• Users are responsible for any damage to the turf\n• Users must follow venue rules and regulations\n• Inappropriate behavior may result in booking cancellation"
      },
      {
        id: 5,
        title: "5. Payment Terms",
        content: "• All payments are processed securely\n• Prices are subject to change without notice\n• Additional charges may apply for extra services\n• Payment receipts will be sent via email"
      },
      {
        id: 6,
        title: "6. Privacy Policy",
        content: "We are committed to protecting your privacy. Your personal information will be used only for booking purposes and will not be shared with third parties without your consent."
      },
      {
        id: 7,
        title: "7. Liability",
        content: "The platform is not liable for any injuries, losses, or damages that may occur during the use of the turf facilities. Users participate at their own risk."
      },
      {
        id: 8,
        title: "8. Changes to Terms",
        content: "We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the modified terms."
      }
    ],
    contactEmail: "support@playbhoomi.com"
  };

  useEffect(() => {
    fetchTermsContent();
  }, []);

  const fetchTermsContent = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API
      const response = await axios.get(`${config.API_URL}/content/terms-conditions`);
      
      if (response.data) {
        setContent(response.data);
        // Cache the content
        await AsyncStorage.setItem('terms_conditions_content', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching terms content:', error);
      
      // Try to load from cache
      try {
        const cachedContent = await AsyncStorage.getItem('terms_conditions_content');
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
      <View style={styles.content}>
        <Text style={styles.title}>{displayContent.title}</Text>
        <Text style={styles.lastUpdated}>Last updated: {displayContent.lastUpdated}</Text>

        {displayContent.sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.text}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.text}>
            If you have any questions about these Terms & Conditions, please contact us:
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Linking.openURL(`mailto:${displayContent.contactEmail}`)}
          >
            <Ionicons name="mail" size={20} color="#004CE8" />
            <Text style={styles.contactText}>{displayContent.contactEmail}</Text>
          </TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004CE8',
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#004CE8',
    fontWeight: '500',
  },
});

export default TermsConditionsScreen;
