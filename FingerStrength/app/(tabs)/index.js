/**
 * app/(tabs)/index.js
 * Brief: Main tab entry — wires BLE hook to UI components used on the primary tab.
 * Exports: default React component composing `DisplayRing`, `ControlButtons` and `DeviceModal`.
 */
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useBluetooth } from '@/hooks/useBluetooth';
import { DisplayRing } from '@/components/DisplayRing';
import { ControlButtons } from '@/components/ControlButtons';
import { DeviceModal } from '@/components/DeviceModal';
import { COLORS } from '@/constants/colors';

/**
 * The main tab entry — wires BLE hook to UI components used on the primary tab.
 *
 * It uses the `useBluetooth` hook to manage the state of the BLE connection and weight data,
 * and renders the `DisplayRing`, `ControlButtons`, and `DeviceModal` components.
 *
 * @returns {React.ReactElement} The main app component.
 */
export default function App() {
  const {
    weight,
    maxPull,
    setMaxPull,
    status,
    connectedDevice,
    devices,
    scanning,
    scanAndConnect,
    connectToScale,
    disconnectDevice,
    stopScanning,
  } = useBluetooth();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <DisplayRing weight={weight} maxPull={maxPull} status={status} />

      <ControlButtons
        connectedDevice={connectedDevice}
        scanning={scanning}
        weight={weight}
        onConnectPress={scanAndConnect}
        onSetMaxPress={() => setMaxPull(weight > 0 ? weight : 1)}
        onDisconnectPress={disconnectDevice}
        onCancelScan={stopScanning}
      />

      <DeviceModal
        visible={devices.length > 0 && !connectedDevice}
        devices={devices}
        onSelectDevice={(device) => {
          stopScanning();
          connectToScale(device);
        }}
        onClose={() => {
          stopScanning();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
    paddingTop: 60,
  },
});