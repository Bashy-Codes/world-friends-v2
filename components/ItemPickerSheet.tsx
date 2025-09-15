import React, { forwardRef, useMemo, useState, useCallback, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Dimensions, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { ItemSearchModal, SearchItem } from "@/components/profile-management/ItemSearchModal";
import { Button } from "./ui/Button";

const { height: screenHeight } = Dimensions.get('window');

export interface PickerItem {
  id: string;
  name: string;
  emoji: string;
}

interface ItemPickerSheetProps {
  items: PickerItem[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onConfirm: () => void;
  multiSelect?: boolean;
  searchPlaceholder?: string;
  minSelection?: number;
  maxSelection?: number;
}

export interface ItemPickerSheetRef {
  present: () => void;
  dismiss: () => void;
}

// Item Component
const PickerItemComponent: React.FC<{
  item: PickerItem;
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

export const ItemPickerSheet = forwardRef<ItemPickerSheetRef, ItemPickerSheetProps>(
  ({ items, selectedItems, onSelectionChange, onConfirm, multiSelect = false, searchPlaceholder, minSelection = 0, maxSelection }, ref) => {
    const theme = useTheme();
    const [visible, setVisible] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [tempSelectedItems, setTempSelectedItems] = useState<string[]>([]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      present: () => {
        setVisible(true);
        setTempSelectedItems(selectedItems); // Initialize temp selection
      },
      dismiss: () => {
        setVisible(false);
        setTempSelectedItems([]);
      },
    }), [selectedItems]);

    // Convert items to SearchItem format
    const searchItems: SearchItem[] = useMemo(() =>
      items.map(item => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
      })), [items]
    );

    const handleItemPress = useCallback(
      (itemId: string) => {
        if (multiSelect) {
          const isSelected = tempSelectedItems.includes(itemId);
          if (isSelected) {
            // Deselecting - check minimum
            const newSelection = tempSelectedItems.filter((id) => id !== itemId);
            if (minSelection > 0 && newSelection.length < minSelection) {
              // Don't allow deselection if it would go below minimum
              return;
            }
            setTempSelectedItems(newSelection);
          } else {
            // Selecting - check maximum
            if (maxSelection && tempSelectedItems.length >= maxSelection) {
              // Don't allow selection if it would exceed maximum
              return;
            }
            const newSelection = [...tempSelectedItems, itemId];
            setTempSelectedItems(newSelection);
          }
        } else {
          // For single select, deselect existing and select new
          setTempSelectedItems([itemId]);
        }
      },
      [tempSelectedItems, multiSelect, minSelection, maxSelection]
    );

    const handleClose = useCallback(() => {
      setVisible(false);
      setTempSelectedItems([]);
    }, []);

    const handleConfirm = useCallback(() => {
      // Check minimum selection requirement
      if (minSelection > 0 && tempSelectedItems.length < minSelection) {
        return; // Don't confirm if minimum not met
      }
      onSelectionChange(tempSelectedItems);
      onConfirm();
      setVisible(false);
      setTempSelectedItems([]);
    }, [onConfirm, tempSelectedItems, onSelectionChange, minSelection]);

    const handleOpenSearch = useCallback(() => {
      setShowSearchModal(true);
      setVisible(false); // Dismiss sheet when opening search
    }, []);

    const handleSearchSelectionChange = useCallback((selectedIds: string[]) => {
      setTempSelectedItems(selectedIds);
    }, []);

    const handleSearchConfirm = useCallback(() => {
      // Apply the selection and close everything
      onSelectionChange(tempSelectedItems);
      onConfirm();
      setShowSearchModal(false);
      setVisible(false);
      setTempSelectedItems([]);
    }, [tempSelectedItems, onSelectionChange, onConfirm]);

    const handleSearchCancel = useCallback(() => {
      setShowSearchModal(false);
      setVisible(true); // Show sheet again
      setTempSelectedItems(selectedItems); // Reset to original selection
    }, [selectedItems]);

    const styles = StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      },
      container: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: scale(theme.borderRadius.xl),
        borderTopRightRadius: scale(theme.borderRadius.xl),
        height: screenHeight * 0.9,
        paddingTop: verticalScale(8),
      },
      headerLine: {
        width: scale(40),
        height: verticalScale(4),
        backgroundColor: theme.colors.textMuted,
        borderRadius: scale(theme.borderRadius.full),
        alignSelf: 'center',
        marginBottom: verticalScale(16),
      },
      searchButtonContainer: {
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(12),
      },
      searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: scale(theme.borderRadius.md),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      searchIcon: {
        marginRight: scale(8),
      },
      searchButtonText: {
        fontSize: moderateScale(14),
        color: theme.colors.textMuted,
        flex: 1,
      },
      listContainer: {
        flex: 1,
        paddingHorizontal: scale(20),
      },
      emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: scale(20),
      },
      emptyText: {
        fontSize: moderateScale(14),
        color: theme.colors.textMuted,
        textAlign: "center",
      },
      actionsContainer: {
        backgroundColor: theme.colors.background,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(20),
        paddingTop: verticalScale(16),
        borderTopLeftRadius: scale(theme.borderRadius.xl),
        borderTopRightRadius: scale(theme.borderRadius.xl),
        gap: scale(30),
      },
    });

    const renderItem = useCallback(
      ({ item }: { item: PickerItem }) => {
        const isSelected = tempSelectedItems.includes(item.id);
        return (
          <PickerItemComponent
            item={item}
            isSelected={isSelected}
            onPress={() => handleItemPress(item.id)}
            theme={theme}
          />
        );
      },
      [tempSelectedItems, handleItemPress, theme]
    );

    const renderEmpty = useCallback(
      () => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items available</Text>
        </View>
      ),
      [styles]
    );

    const keyExtractor = useCallback((item: PickerItem) => item.id, []);

    return (
      <>
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={handleClose}
        >
          <Pressable style={styles.overlay} onPress={handleClose}>
            <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
              {/* Drag indicator */}
              <View style={styles.headerLine} />

              {/* Search button */}
              <View style={styles.searchButtonContainer}>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleOpenSearch}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="search"
                    size={scale(16)}
                    color={theme.colors.textMuted}
                    style={styles.searchIcon}
                  />
                  <Text style={styles.searchButtonText}>
                    {searchPlaceholder || "Search..."}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Items list */}
              <View style={styles.listContainer}>
                <FlatList
                  data={items}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={renderEmpty}
                  contentContainerStyle={{
                    paddingBottom: verticalScale(20),
                  }}
                />
              </View>

              {/* Bottom Actions */}
              <View style={styles.actionsContainer}>
                <Button
                  iconName="close"
                  bgColor={theme.colors.error}
                  onPress={handleClose}
                  style={{ flex: 1 }}
                />
                <Button
                  iconName="checkmark"
                  onPress={handleConfirm}
                  disabled={tempSelectedItems.length < minSelection}
                  style={{ flex: 1 }}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Search Modal */}
        <ItemSearchModal
          visible={showSearchModal}
          items={searchItems}
          selectedItems={tempSelectedItems}
          multiSelect={multiSelect}
          minSelection={minSelection}
          maxSelection={maxSelection}
          searchPlaceholder={searchPlaceholder || "Search..."}
          onSelectionChange={handleSearchSelectionChange}
          onConfirm={handleSearchConfirm}
          onCancel={handleSearchCancel}
        />
      </>
    );
  }
);

ItemPickerSheet.displayName = "ItemPickerSheet";
