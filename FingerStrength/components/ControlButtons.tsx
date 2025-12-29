import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../constants/colors';

interface ControlButtonsProps {
  connectedDevice: any;
  scanning: boolean;
  weight: number;
  onConnectPress: () => void;
  onSetMaxPress: () => void;
  onDisconnectPress: () => void;
  onCancelScan: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  connectedDevice,
  scanning,
  weight,
  onConnectPress,
  onSetMaxPress,
  onDisconnectPress,
  onCancelScan,
}) => {
  return (
    <View style={styles.controls}>
      {!connectedDevice ? (
        <>
          <TouchableOpacity style={styles.button} onPress={onConnectPress}>
            <Text style={styles.buttonText}>Connect Scale</Text>
          </TouchableOpacity>

          {scanning ? (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onCancelScan}
            >
              <Text style={styles.buttonText}>Cancel Scan</Text>
            </TouchableOpacity>
          ) : null}

          {scanning ? (
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <ActivityIndicator color="#fff" />
              <Text style={{ color: COLORS.TEXT_SECONDARY, marginTop: 6 }}>
                Searching for devices...
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={onSetMaxPress}>
            <Text style={styles.buttonText}>Set Current as MVC</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onDisconnectPress}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controls: { marginTop: 'auto', gap: 10 },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: { backgroundColor: COLORS.SECONDARY },
  buttonText: { color: COLORS.TEXT_PRIMARY, fontWeight: 'bold', fontSize: 16 },
});
