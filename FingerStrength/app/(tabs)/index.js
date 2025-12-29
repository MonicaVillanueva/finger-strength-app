import { Buffer } from 'buffer';
import * as Device from 'expo-device';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

// Only initialize BLE if we are NOT on web
const manager = Platform.OS !== 'web' ? new BleManager() : null;

const SCALE_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const SCALE_CHAR_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

export default function App() {
  const [weight, setWeight] = useState(0.0);
  const [maxPull, setMaxPull] = useState(1.0);
  const [status, setStatus] = useState('Disconnected');
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Cleanup BLE manager and subscriptions when app closes
    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (manager && typeof manager.destroy === 'function') {
        manager.destroy();
      }
    };
  }, [subscription]);

  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if ((Device.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        return (
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    } else {
      return true; // iOS handles permissions automatically
    }
  };

  const scanAndConnect = async () => {
    console.log("Button pressed: Checking permissions...");
    const permission = await requestPermissions();
    console.log("Permission status:", permission);

    if (!permission) return;

    if (!manager) {
      Alert.alert('BLE not available on web');
      return;
    }

    setDevices([]);
    setScanning(true);
    setStatus('Scanning...');

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("SCAN ERROR:", error.message); // Look for "Bluetooth is powered off" or "Location disabled"
        setScanning(false);
        setStatus('Scan Failed');
        return;
      }

      if (!device) return;

      const displayName = device.name || device.localName || device.id;

      setDevices(prev => {
        if (prev.find(d => d.id === device.id)) return prev;
        return [...prev, { id: device.id, name: displayName, device }];
      });

    });
  };

  const base64ToHex = (base64) => {
    const binary = Buffer.from(base64, "base64").toString("binary")
    return Array.from(binary)
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  }

  const parseWeightData = (manufacturerData) => {
    if (!manufacturerData) return 0

    try {
      const hexData = base64ToHex(manufacturerData)
      const weightHex = hexData.substring(24, 28)
      return parseInt(weightHex, 16) / 100
    } catch (error) {
      console.error("Error parsing weight data:", error)
      return 0
    }
  }

  const connectToScale = async (device) => {
    try {
      setStatus(`Receiving Data from ${device.name || device.id}`);

      // Clear the device list and mark as connected BEFORE starting new scan
      setDevices([]);
      setScanning(false);
      setConnectedDevice(device);

      // Restart scan to keep receiving updates from this device's broadcasts
      manager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.log("Scan error:", error.message);
          return;
        }

        if (!scannedDevice) return;

        // Only process data from the connected device
        if (scannedDevice.id !== device.id) return;

        // Extract weight from manufacturer data or advertisement data
        if (scannedDevice.manufacturerData) {
          try {
            const data = Buffer.from(scannedDevice.manufacturerData, 'base64');
            console.log("Received broadcast data:", data);

            const weightValue = parseWeightData(scannedDevice.manufacturerData);
            if (!isNaN(weightValue)) {
              setWeight(weightValue);
            }
          } catch (e) {
            console.log("Error parsing broadcast data:", e.message);
          }
        }
      });
    } catch (e) {
      console.log("Error setting up broadcast listener:", e.message);
      setStatus('Setup Failed');
    }
  };

  const disconnectDevice = async () => {
    try {
      // Stop scanning
      try { manager && manager.stopDeviceScan(); } catch (e) {}
      
      setConnectedDevice(null);
      setWeight(0.0);
      setStatus('Disconnected');
    } catch (e) {
      console.log("Error disconnecting:", e.message);
    }
  };

  const percentage = Math.min((weight / maxPull) * 100, 100);

  const getZoneColor = () => {
    if (percentage < 50) return '#4CAF50'; // Green
    if (percentage < 85) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>ClimbTracker</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      <View style={styles.ringContainer}>
        <View style={[styles.ring, { borderColor: getZoneColor() }]}>
          <Text style={styles.weightText}>{weight.toFixed(2)}</Text>
          <Text style={styles.unitText}>kg</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statLabel}>Current Effort</Text>
        <Text style={[styles.percentageText, { color: getZoneColor() }]}>
          {percentage.toFixed(0)}%
        </Text>
        <Text style={styles.subText}>of {maxPull.toFixed(1)}kg Max</Text>
      </View>

      <View style={styles.controls}>
        {!connectedDevice ? (
          <>
            <TouchableOpacity style={styles.button} onPress={scanAndConnect}>
              <Text style={styles.buttonText}>Connect Scale</Text>
            </TouchableOpacity>

            {scanning ? (
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => { try { manager && manager.stopDeviceScan(); } catch(e){} setScanning(false); setStatus('Scan cancelled'); }}>
                <Text style={styles.buttonText}>Cancel Scan</Text>
              </TouchableOpacity>
            ) : null}

            {scanning && devices.length === 0 ? (
              <View style={{marginTop:10, alignItems:'center'}}>
                <ActivityIndicator color="#fff" />
                <Text style={{color:'#888', marginTop:6}}>Searching for devices...</Text>
              </View>
            ) : null}

            {/* Device list moved to foreground Modal */}
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setMaxPull(weight > 0 ? weight : 1)}
            >
              <Text style={styles.buttonText}>Set Current as MVC</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={disconnectDevice}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

        <Modal
          visible={devices.length > 0 && !connectedDevice}
          transparent
          animationType="fade"
          onRequestClose={() => { setDevices([]); setScanning(false); setStatus('Scan cancelled'); try { manager && manager.stopDeviceScan(); } catch(e){} }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select a device</Text>
              <FlatList
                data={devices}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.deviceItem}
                    onPress={() => { 
                      try { manager && manager.stopDeviceScan(); } catch(e){} 
                      connectToScale(item.device); 
                    }}
                  >
                    <Text style={styles.deviceName}>{item.name}</Text>
                    <Text style={styles.deviceId}>{item.id}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={[styles.button, styles.secondaryButton, {marginTop:10}]} onPress={() => { setDevices([]); setScanning(false); setStatus('Scan cancelled'); try { manager && manager.stopDeviceScan(); } catch(e){} }}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  status: { color: '#888', marginTop: 5 },
  ringContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  ring: {
    width: 250, height: 250, borderRadius: 125, borderWidth: 15,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E1E',
  },
  weightText: { fontSize: 60, fontWeight: 'bold', color: '#FFF' },
  unitText: { fontSize: 20, color: '#888' },
  statsContainer: { alignItems: 'center', marginVertical: 20 },
  statLabel: { color: '#AAA', fontSize: 16 },
  percentageText: { fontSize: 48, fontWeight: 'bold' },
  subText: { color: '#666' },
  controls: { marginTop: 'auto', gap: 10 },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center' },
  secondaryButton: { backgroundColor: '#444' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { width: '85%', maxHeight: '70%', backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  deviceItem: { padding: 12, borderRadius: 8, backgroundColor: '#2A2A2A', marginBottom: 8 },
  deviceName: { color: '#FFF' },
  deviceId: { color: '#777', fontSize: 12 },
  deviceList: { marginTop: 10 },
});