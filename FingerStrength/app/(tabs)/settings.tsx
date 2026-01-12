/**
 * app/(tabs)/settings.tsx
 * Settings screen with top dropdown, info card and edit/delete controls for the selected user.
 */
import React, { useMemo, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { UserProvider, useUserContext } from '@/contexts/UserContext';
import { COLORS } from '@/constants/colors';

/**
 * React component for the settings screen.
 * Displays a dropdown with user profiles and a modal for editing/creating a new user.
 * Also includes edit and delete controls for the currently selected user.
 * @returns {JSX.Element} The SettingsContent component.
 */
function SettingsContent() {
  const { users, activeUser, loading, createUser, updateUser, setActiveUserId, deleteUser } = useUserContext();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<{ x: number; y: number; height: number; width?: number } | null>(null);
  const containerRef = useRef<any>(null);
  const btnRef = useRef<any>(null);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const selectedId = activeUser?.id ?? null;

/**
 * Opens the modal for creating a new user.
 * Resets the editing user ID, name and weight input fields.
 */
  const openCreate = () => {
    setEditingUserId(null);
    setName('');
    setWeight('');
    setModalOpen(true);
  };

/**
 * Opens the modal for editing the selected user.
 * If no user is selected, does nothing.
 * If the selected user is not found in the list of users, does nothing.
 * Otherwise, sets the editing user ID to the selected user's ID, sets the name and weight input fields to the selected user's name and weight,
 * and opens the modal.
 */
  const openEditSelected = () => {
    if (!selectedId) return;
    const u = users.find((x) => x.id === selectedId);
    if (!u) return;
    setEditingUserId(selectedId);
    setName(u.name ?? '');
    setWeight(u.bodyWeightKg ? String(u.bodyWeightKg) : '');
    setModalOpen(true);
  };

/**
 * Confirms deletion of the currently selected user.
 * Does nothing if no user is selected.
 * Otherwise, deletes the user with the selected ID.
 * @returns {Promise<void>} A promise that resolves when the deletion operation is complete.
 */
  const confirmDeleteSelected = async () => {
    if (!selectedId) return;
    await deleteUser(selectedId);
  };

/**
 * Saves the current user name and weight to AsyncStorage.
 * If the user is being edited (i.e. `editingUserId` is not null), updates the user with the given name and weight.
 * If the user is being created (i.e. `editingUserId` is null), creates a new user with the given name and weight.
 * Afterwards, closes the modal.
 * @returns {Promise<void>} A promise that resolves when the save operation is complete.
 */
  const save = async () => {
    const parsed = weight ? Number(weight) : undefined;
    if (editingUserId) {
      const u = users.find((x) => x.id === editingUserId);
      if (!u) return;
      await updateUser({ ...u, name, bodyWeightKg: parsed });
    } else {
      await createUser(name || 'User', parsed);
    }
    setModalOpen(false);
  };

  const onPick = async (id: string) => {
    await setActiveUserId(id);
    setPickerOpen(false);
  };

/**
 * Renders a single item in the user profile picker.
 * @param {{ item: any }} props
 * @param {any} props.item The item to render, which should have an `id` property and a `name` property.
 * @returns {JSX.Element} The rendered item.
 */
  const renderPickerItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.pickerItem} onPress={() => onPick(item.id)}>
      <Text style={styles.userName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} ref={containerRef}>
      
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
      </View>

      {loading ? <ActivityIndicator /> : (
        <>
          <View style={styles.topRow}>
            <TouchableOpacity
              ref={btnRef}
              style={styles.dropdown}
              onPress={() => {
                const opening = !pickerOpen;
                setPickerOpen(opening);
                if (opening) {
                  // measure the button relative to the root container to compute dropdown position
                  setTimeout(() => {
                    if (btnRef.current && containerRef.current && typeof btnRef.current.measureLayout === 'function') {
                      try {
                        btnRef.current.measureLayout(
                          containerRef.current,
                          (x: number, y: number, _width: number, height: number) => setButtonLayout({ x, y, height }),
                          () => {}
                        );
                      } catch (e) {}
                    }
                  }, 0);
                }
              }}
            >
              <Text style={styles.userName}>{activeUser ? activeUser.name : 'No user selected'}</Text>
              <Text style={styles.chev}>▾</Text>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.button} onPress={openEditSelected} disabled={!selectedId}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>            
              <View style={{ width: 8 }} />
              <TouchableOpacity style={[styles.button, {backgroundColor: COLORS.ZONE_RED}]} onPress={confirmDeleteSelected} disabled={!selectedId} >
                <Text style={styles.buttonText}>Del</Text>
              </TouchableOpacity>   
            </View>
          </View>

          {pickerOpen && (
            <>
              <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setPickerOpen(false)} />
              <View
                style={[
                  styles.dropdownList,
                  {
                    top: (buttonLayout?.y ?? 0) + (buttonLayout?.height ?? 40) + 8,
                    left: buttonLayout?.x ?? 0,
                    width: buttonLayout?.width ?? '100%',
                  },
                ]}
              >
                <FlatList
                  data={users}
                  keyExtractor={(i) => i.id}
                  renderItem={renderPickerItem}
                  ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: COLORS.SECONDARY }} />}
                />
              </View>
            </>
          )}

          <View style={styles.info}>
            <Text style={styles.infoLabel}>Body weight</Text>
            <Text style={styles.infoValue}>{activeUser?.bodyWeightKg != null ? `${activeUser.bodyWeightKg} kg` : ''}</Text>

            <Text style={[styles.infoLabel, { marginTop: 8 }]}>Max pull</Text>
            <Text style={styles.infoValue}>{activeUser?.maxPull != null ? `${activeUser.maxPull} kg` : ''}</Text>
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity style={styles.button} onPress={openCreate}>
            <Text style={styles.buttonText}>Create New User</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{editingUserId ? 'Edit User' : 'Create User'}</Text>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.modalInputText} />
          <TextInput placeholder="Body weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.modalInputText} />
          <View style={{ height: 12 }} />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, {backgroundColor: COLORS.SECONDARY}]} onPress={() => setModalOpen(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>            
            <View style={{ width: 8 }} />
            <TouchableOpacity style={styles.button} onPress={save}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>            
          </View>
        </View>
      </Modal>
    </View>
  );
}

/**
 * The main settings screen for the app.
 * It wraps the SettingsContent component in a UserProvider with a unique key.
 * The key is generated randomly using Math.random().toString(36).slice(2).
 * This ensures that the UserProvider instance is recreated whenever the component is re-rendered.
 */
export default function SettingsScreen() {
  const providerKey = useMemo(() => Math.random().toString(36).slice(2), []);
  return (
    <UserProvider key={providerKey}>
      <SettingsContent />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
    paddingTop: 60,
    position: 'relative',
  },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY },

  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: COLORS.TEXT_PRIMARY, fontWeight: 'bold', fontSize: 16 },

  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, backgroundColor: 'transparent' },
  dropdownList: { position: 'absolute', backgroundColor: COLORS.SURFACE, borderWidth: 1, borderColor: COLORS.SECONDARY, borderRadius: 6, maxHeight: 220, zIndex: 2 },
  dropdown: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: COLORS.SECONDARY, borderRadius: 6, backgroundColor: COLORS.SURFACE },
  chev: { color: COLORS.TEXT_ACCENT, marginLeft: 8 },

  actions: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },

  info: { padding: 12, borderRadius: 6, backgroundColor: COLORS.SURFACE, marginBottom: 12 },
  infoLabel: { color: COLORS.TEXT_ACCENT, fontSize: 13 },
  infoValue: { color: COLORS.TEXT_PRIMARY, fontSize: 16, fontWeight: '600' },

  modal: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 16, justifyContent: 'center' },
  modalTitle: { color: COLORS.TEXT_PRIMARY, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalInputText: { color: COLORS.TEXT_PRIMARY, borderWidth: 1, borderColor: COLORS.SECONDARY, padding: 8, marginBottom: 8, borderRadius: 4 },

  pickerItem: { padding: 12 },
  userName: { color: COLORS.TEXT_PRIMARY, fontSize: 16 }
});  