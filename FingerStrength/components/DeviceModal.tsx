/**
 * components/DeviceModal.tsx
 * Brief: Modal UI to list discovered Bluetooth devices and allow selection.
 * Exports: `DeviceModal` React component. Props: `visible`, `devices`, `onSelectDevice`, `onClose`.
 */
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';

import { COLORS } from '@/constants/colors';

interface Device {
  id: string;
  name: string;
  device: any;
}

interface DeviceModalProps {
  visible: boolean;
  devices: Device[];
  onSelectDevice: (device: any) => void;
  onClose: () => void;
}

/**
 * DeviceModal component
 * 
 * A modal component that displays a list of discovered Bluetooth devices and allows the user to select one.
 * 
 * @param {boolean} visible - Whether the modal should be visible or not.
 * @param {Device[]} devices - An array of discovered Bluetooth devices.
 * @param {(device: any) => void} onSelectDevice - A callback function that is called when the user selects a device.
 * @param {() => void} onClose - A callback function that is called when the user closes the modal.
 */
export const DeviceModal: React.FC<DeviceModalProps> = ({
  visible,
  devices,
  onSelectDevice,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a device</Text>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceItem}
                onPress={() => onSelectDevice(item.device)}
              >
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceId}>{item.id}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { marginTop: 10 }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: COLORS.SURFACE,
    padding: 16,
    borderRadius: 12,
  },
  modalTitle: { color: COLORS.TEXT_PRIMARY, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  deviceItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.SURFACE_VARIANT,
    marginBottom: 8,
  },
  deviceName: { color: COLORS.TEXT_PRIMARY },
  deviceId: { color: COLORS.TEXT_TERTIARY, fontSize: 12 },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: { backgroundColor: COLORS.SECONDARY },
  buttonText: { color: COLORS.TEXT_PRIMARY, fontWeight: 'bold', fontSize: 16 },
});
