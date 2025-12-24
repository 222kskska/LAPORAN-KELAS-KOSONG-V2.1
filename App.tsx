import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

interface Report {
  id: string;
  className: string;
  time: string;
  date: string;
  reason: string;
}

const App = () => {
  const [className, setClassName] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = () => {
    if (!className || !time || !reason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newReport: Report = {
      id: Date.now().toString(),
      className,
      time,
      date: new Date().toLocaleDateString('id-ID'),
      reason,
    };

    setReports([newReport, ...reports]);
    
    // Clear form
    setClassName('');
    setTime('');
    setReason('');

    Alert.alert('Success', 'Report submitted successfully!');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setReports(reports.filter(report => report.id !== id)),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>📚 Laporan Kelas Kosong</Text>
            <Text style={styles.headerSubtitle}>Version 2.0</Text>
          </Animatable.View>

          {/* Form Card */}
          <Animated.View 
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
              style={styles.cardGradient}
            >
              <Text style={styles.cardTitle}>Submit New Report</Text>

              {/* Class Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Class Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., XII RPL 1"
                    placeholderTextColor="#999"
                    value={className}
                    onChangeText={setClassName}
                  />
                </View>
              </View>

              {/* Time Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Time</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 08:00 - 09:30"
                    placeholderTextColor="#999"
                    value={time}
                    onChangeText={setTime}
                  />
                </View>
              </View>

              {/* Reason Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Reason</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter reason for empty classroom..."
                    placeholderTextColor="#999"
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Reports List */}
          {reports.length > 0 && (
            <Animatable.View 
              animation="fadeInUp" 
              duration={800}
              style={styles.reportsSection}
            >
              <Text style={styles.reportsTitle}>Recent Reports</Text>
              {reports.map((report, index) => (
                <Animatable.View
                  key={report.id}
                  animation="fadeInUp"
                  delay={index * 100}
                  style={styles.reportCard}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                    style={styles.reportCardGradient}
                  >
                    <View style={styles.reportHeader}>
                      <View>
                        <Text style={styles.reportClassName}>{report.className}</Text>
                        <Text style={styles.reportDate}>📅 {report.date}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(report.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.reportDetails}>
                      <Text style={styles.reportTime}>⏰ {report.time}</Text>
                      <Text style={styles.reportReason}>💬 {report.reason}</Text>
                    </View>
                  </LinearGradient>
                </Animatable.View>
              ))}
            </Animatable.View>
          )}

          {/* Empty State */}
          {reports.length === 0 && (
            <Animatable.View 
              animation="pulse" 
              iterationCount="infinite"
              duration={2000}
              style={styles.emptyState}
            >
              <Text style={styles.emptyStateText}>📝</Text>
              <Text style={styles.emptyStateTitle}>No Reports Yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Submit your first empty classroom report above
              </Text>
            </Animatable.View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
    fontWeight: '600',
  },
  card: {
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 25,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  textAreaWrapper: {
    minHeight: 100,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportsSection: {
    marginTop: 10,
  },
  reportsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  reportCard: {
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  reportCardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportClassName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
  deleteButtonText: {
    fontSize: 20,
  },
  reportDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  reportTime: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    fontWeight: '600',
  },
  reportReason: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
    padding: 30,
  },
  emptyStateText: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});

export default App;
