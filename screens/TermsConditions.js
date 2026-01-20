import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsConditionsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.lastUpdated}>Last updated: January 19, 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using this turf booking application, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Booking Policy</Text>
          <Text style={styles.text}>
            • All bookings are subject to availability{'\n'}
            • Booking confirmation will be sent via email/SMS{'\n'}
            • Payment must be completed to confirm booking{'\n'}
            • Booking slots are for the specified time duration only
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Cancellation Policy</Text>
          <Text style={styles.text}>
            • Cancellations made 24 hours before booking: Full refund{'\n'}
            • Cancellations made 12-24 hours before: 50% refund{'\n'}
            • Cancellations made less than 12 hours: No refund{'\n'}
            • Refunds will be processed within 5-7 business days
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
          <Text style={styles.text}>
            • Users must arrive on time for their booking{'\n'}
            • Users are responsible for any damage to the turf{'\n'}
            • Users must follow venue rules and regulations{'\n'}
            • Inappropriate behavior may result in booking cancellation
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Payment Terms</Text>
          <Text style={styles.text}>
            • All payments are processed securely{'\n'}
            • Prices are subject to change without notice{'\n'}
            • Additional charges may apply for extra services{'\n'}
            • Payment receipts will be sent via email
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Privacy Policy</Text>
          <Text style={styles.text}>
            We are committed to protecting your privacy. Your personal information will be used only for booking purposes and will not be shared with third parties without your consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Liability</Text>
          <Text style={styles.text}>
            The platform is not liable for any injuries, losses, or damages that may occur during the use of the turf facilities. Users participate at their own risk.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
          <Text style={styles.text}>
            We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the modified terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.text}>
            If you have any questions about these Terms & Conditions, please contact us:
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:support@playbhoomi.com')}
          >
            <Ionicons name="mail" size={20} color="#004CE8" />
            <Text style={styles.contactText}>support@playbhoomi.com</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
