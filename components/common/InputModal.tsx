import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTheme } from '@/lib/Theme';
import { Button } from '../ui/Button';

const { width: screenWidth } = Dimensions.get('window');

interface InputModalProps {
  visible: boolean;
  title: string;
  inputPlaceholder: string;
  maxCharacters: number;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  submitIcon?: string;
  initialValue?: string;
}

export const InputModal: React.FC<InputModalProps> = ({
  visible,
  title,
  inputPlaceholder,
  maxCharacters,
  onSubmit,
  onCancel,
  submitIcon = 'checkmark',
  initialValue = '',
}) => {
  const theme = useTheme();
  const [inputText, setInputText] = useState(initialValue);
  const inputRef = useRef<TextInput>(null);

  const characterCount = inputText.length;
  const canSubmit = inputText.trim().length > 0 && characterCount <= maxCharacters;

  useEffect(() => {
    if (visible) {
      // Reset input text
      setInputText(initialValue);
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 360);
    }
  }, [visible, initialValue]);

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(inputText.trim());
      setInputText('');
    }
  };

  const handleCancel = () => {
    setInputText('');
    onCancel();
  };

  const getCharacterCountColor = () => {
    if (characterCount > maxCharacters || characterCount === maxCharacters) {
      return theme.colors.error;
    } else if (characterCount > maxCharacters * 0.8) {
      return theme.colors.warning;
    } else if (characterCount > maxCharacters * 0.3) {
      return theme.colors.success;
    }
    return theme.colors.textMuted;
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.xl),
      width: screenWidth * 0.9,
      maxWidth: scale(400),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 20,
    },
    header: {
      alignItems: 'center',
      paddingTop: verticalScale(24),
      paddingHorizontal: scale(24),
      paddingBottom: verticalScale(16),
    },
    title: {
      fontSize: moderateScale(20),
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: verticalScale(12),
    },
    content: {
      paddingHorizontal: scale(24),
      paddingBottom: verticalScale(16),
    },
    inputContainer: {
      marginBottom: verticalScale(20),
    },
    textInput: {
      backgroundColor: theme.colors.background,
      borderRadius: scale(theme.borderRadius.md),
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
      fontSize: moderateScale(16),
      color: theme.colors.text,
      borderWidth: 2,
      borderColor: theme.colors.border,
      minHeight: verticalScale(50),
      textAlignVertical: 'top',
    },
    textInputFocused: {
      borderColor: theme.colors.primary,
    },
    characterCounter: {
      alignItems: 'flex-end',
      marginTop: verticalScale(8),
    },
    characterCountText: {
      fontSize: moderateScale(12),
      fontWeight: '500',
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: scale(24),
      paddingBottom: verticalScale(24),
      gap: scale(12),
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.textInput,
                  inputRef.current?.isFocused() && styles.textInputFocused,
                ]}
                value={inputText}
                onChangeText={setInputText}
                placeholder={inputPlaceholder}
                placeholderTextColor={theme.colors.textMuted}
                selectionColor={theme.colors.primary}
                maxLength={maxCharacters}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.characterCounter}>
                <Text
                  style={[
                    styles.characterCountText,
                    { color: getCharacterCountColor() },
                  ]}
                >
                  {characterCount}/{maxCharacters}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button
              iconName='close'
              bgColor={theme.colors.error}
              onPress={handleCancel}
              style={{flex: 1}}
              />

          <Button
            iconName={submitIcon as any}
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={{flex: 1}}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
