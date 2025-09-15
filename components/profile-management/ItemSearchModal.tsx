import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTheme } from '@/lib/Theme';

const { width: screenWidth } = Dimensions.get('window');

export interface SearchItem {
  id: string;
  name: string;
  emoji: string;
}

interface ItemSearchModalProps {
  visible: boolean;
  items: SearchItem[];
  selectedItems: string[];
  multiSelect: boolean;
  searchPlaceholder: string;
  minSelection?: number;
  maxSelection?: number;
  onSelectionChange: (selectedIds: string[]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

// Reuse the same PickerItemComponent from ItemPickerSheet
const PickerItemComponent: React.FC<{
  item: SearchItem;
  isSelected: boolean;
  onPress: () => void;
  theme: any;
}> = ({ item, isSelected, onPress, theme }) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(16),
      borderRadius: scale(12),
      marginVertical: verticalScale(2),
      backgroundColor: isSelected ? `${theme.colors.primary}15` : theme.colors.background,
      borderWidth: isSelected ? 1 : 0,
      borderColor: theme.colors.primary,
    },
    content: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    emoji: {
      fontSize: moderateScale(18),
      marginRight: scale(12),
    },
    name: {
      fontSize: moderateScale(15),
      color: isSelected ? theme.colors.primary : theme.colors.text,
      fontWeight: isSelected ? "600" : "500",
    },
    checkIcon: {
      marginLeft: scale(8),
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      {isSelected && (
        <Ionicons
          name="checkmark"
          size={scale(18)}
          color={theme.colors.primary}
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );
};

export const ItemSearchModal: React.FC<ItemSearchModalProps> = ({
  visible,
  items,
  selectedItems,
  multiSelect,
  searchPlaceholder,
  minSelection = 0,
  maxSelection,
  onSelectionChange,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Filter items based on search query, show max 3 results
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.slice(0, 3); // Show at most 3 items
  }, [items, searchQuery]);

  useEffect(() => {
    if (visible) {
      setSearchQuery('');

      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [visible]);

  const handleCancel = useCallback(() => {
    setSearchQuery('');
    onCancel();
  }, [onCancel]);

  const handleItemPress = useCallback((itemId: string) => {
    if (multiSelect) {
      const isSelected = selectedItems.includes(itemId);
      if (isSelected) {
        // Deselecting - check minimum
        const newSelection = selectedItems.filter((id) => id !== itemId);
        if (minSelection > 0 && newSelection.length < minSelection) {
          // Don't allow deselection if it would go below minimum
          return;
        }
        onSelectionChange(newSelection);
      } else {
        // Selecting - check maximum
        if (maxSelection && selectedItems.length >= maxSelection) {
          // Don't allow selection if it would exceed maximum
          return;
        }
        const newSelection = [...selectedItems, itemId];
        onSelectionChange(newSelection);
      }
    } else {
      // For single select, deselect existing and select new
      onSelectionChange([itemId]);
    }
  }, [selectedItems, onSelectionChange, multiSelect, minSelection, maxSelection]);

  const handleConfirm = useCallback(() => {
    // Check minimum selection requirement
    if (minSelection > 0 && selectedItems.length < minSelection) {
      return; // Don't confirm if minimum not met
    }
    onConfirm();
  }, [onConfirm, selectedItems.length, minSelection]);

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
      fontSize: moderateScale(18),
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    content: {
      paddingHorizontal: scale(24),
      paddingBottom: verticalScale(16),
    },
    searchContainer: {
      marginBottom: verticalScale(16),
    },
    searchInput: {
      backgroundColor: theme.colors.background,
      borderRadius: scale(theme.borderRadius.md),
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
      fontSize: moderateScale(16),
      color: theme.colors.text,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    searchInputFocused: {
      borderColor: theme.colors.primary,
    },
    resultsContainer: {
      maxHeight: verticalScale(180), // Space for 3 items
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: verticalScale(20),
    },
    emptyText: {
      fontSize: moderateScale(36),
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      paddingHorizontal: scale(24),
      paddingBottom: verticalScale(24),
      gap: scale(30),
    },
    actionButton: {
      width: scale(100),
      height: scale(50),
      borderRadius: scale(25),
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceSecondary,
    },
    confirmButton: {
      backgroundColor: theme.colors.primary,
    },
    confirmButtonDisabled: {
      backgroundColor: theme.colors.surfaceSecondary,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
           <Ionicons
              name="search"
              size={scale(32)}
              color={theme.colors.primary}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.searchInput,
                  inputRef.current?.isFocused() && styles.searchInputFocused,
                ]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={theme.colors.textMuted}
                selectionColor={theme.colors.primary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Search Results */}
            <View style={styles.resultsContainer}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  return (
                    <PickerItemComponent
                      key={item.id}
                      item={item}
                      isSelected={isSelected}
                      onPress={() => handleItemPress(item.id)}
                      theme={theme}
                    />
                  );
                })
              ) : searchQuery.trim() ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>4️⃣0️⃣4️⃣</Text>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>🌍</Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={scale(20)}
                color={theme.colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                selectedItems.length >= minSelection ? styles.confirmButton : styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              activeOpacity={0.7}
              disabled={selectedItems.length < minSelection}
            >
              <Ionicons
                name="checkmark"
                size={scale(20)}
                color={selectedItems.length >= minSelection ? theme.colors.white : theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
