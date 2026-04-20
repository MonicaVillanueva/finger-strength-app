import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useUserContext } from '@/contexts/UserContext';
import { COLORS } from '@/constants/colors';

/**
 * UserDropDown component for selecting and switching between user profiles.
 */
export const UserDropDown: React.FC = () => {
  const { users, activeUser, loading, setActiveUserId } = useUserContext();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<{ x: number; y: number; height: number; width?: number } | null>(null);
  const containerRef = useRef<View>(null);
  const btnRef = useRef<TouchableOpacity>(null);

  const onPick = async (id: string) => {
    await setActiveUserId(id);
    setPickerOpen(false);
  };

  const renderPickerItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.pickerItem} onPress={() => onPick(item.id)}>
      <Text style={styles.userNameText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading && !users.length) {
    return <ActivityIndicator color={COLORS.PRIMARY} style={{ marginBottom: 10 }} />;
  }

  return (
    <View style={styles.container} ref={containerRef} collapsable={false}>
      <TouchableOpacity
        ref={btnRef}
        style={styles.dropdown}
        onPress={() => {
          const opening = !pickerOpen;
          setPickerOpen(opening);
          if (opening) {
            setTimeout(() => {
              if (btnRef.current && containerRef.current) {
                btnRef.current.measureLayout(
                  containerRef.current,
                  (x, y, width, height) => {
                    setButtonLayout({ x, y, height, width });
                  },
                  () => {}
                );
              }
            }, 0);
          }
        }}
      >
        <Text style={styles.activeUserName} numberOfLines={1}>
          {activeUser ? activeUser.name : 'Select User'}
        </Text>
        <Text style={styles.chev}>▾</Text>
      </TouchableOpacity>

      {pickerOpen && (
        <>
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={() => setPickerOpen(false)} 
          />
          <View
            style={[
              styles.dropdownList,
              {
                top: (buttonLayout?.y ?? 0) + (buttonLayout?.height ?? 48) + 4,
                left: buttonLayout?.x ?? 0,
                width: buttonLayout?.width ?? '100%',
              },
            ]}
          >
            <FlatList
              data={users}
              keyExtractor={(i) => i.id}
              renderItem={renderPickerItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No users found.</Text>
                  <Text style={styles.emptySubtext}>Create one in Settings.</Text>
                </View>
              )}
              style={styles.list}
              contentContainerStyle={users.length === 0 ? { flexGrow: 1 } : undefined}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1000, // Ensure it's above other components in the same parent
    elevation: 1000, // For Android
    marginBottom: 10,
    position: 'relative',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    backgroundColor: COLORS.SURFACE,
    minHeight: 48,
  },
  activeUserName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  chev: {
    color: COLORS.TEXT_ACCENT,
    fontSize: 18,
    marginLeft: 8,
  },
  overlay: {
    position: 'absolute',
    top: -500, // Use a large enough value to cover the screen
    left: -500,
    right: -500,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 8,
    maxHeight: 250,
    zIndex: 2000,
    elevation: 1001,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  list: {
    width: '100%',
  },
  pickerItem: {
    padding: 15,
    backgroundColor: COLORS.SURFACE,
  },
  userNameText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },
  emptySubtext: {
    color: COLORS.TEXT_MUTED,
    fontSize: 12,
    marginTop: 4,
  },
});
