import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/Theme';

interface ToastProps {
  text1?: string;
  text2?: string;
}

export const toastConfig = {
  success: ({ text1, text2 }: ToastProps) => {
    const theme = useTheme();
   
    
    return (
      <View style={[styles.toastContainer, { backgroundColor: theme.colors.success }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.white} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.text1, { color: theme.colors.white }]} numberOfLines={1}>
            {text1}
          </Text>
          {text2 && (
            <Text style={[styles.text2, { color: theme.colors.white }]} numberOfLines={1}>
              {text2}
            </Text>
          )}
        </View>
      </View>
    );
  },

  error: ({ text1, text2 }: ToastProps) => {
    const theme = useTheme();
    
    return (
      <View style={[styles.toastContainer, { backgroundColor: theme.colors.error }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle" size={24} color={theme.colors.white} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.text1, { color: theme.colors.white }]} numberOfLines={1}>
            {text1}
          </Text>
          {text2 && (
            <Text style={[styles.text2, { color: theme.colors.white }]} numberOfLines={1}>
              {text2}
            </Text>
          )}
        </View>
      </View>
    );
  },

  info: ({ text1, text2 }: ToastProps) => {
    const theme = useTheme();
     
    
    return (
      <View style={[styles.toastContainer, { backgroundColor: theme.colors.info }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="information-circle" size={24} color={theme.colors.white} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.text1, { color: theme.colors.white }]} numberOfLines={1}>
            {text1}
          </Text>
          {text2 && (
            <Text style={[styles.text2, { color: theme.colors.white }]} numberOfLines={1}>
              {text2}
            </Text>
          )}
        </View>
      </View>
    );
  },
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 6,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 60,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  text2: {
    fontSize: 14,
    opacity: 0.9,
  },
});
