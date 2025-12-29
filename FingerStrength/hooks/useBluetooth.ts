import { useEffect, useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import * as Device from 'expo-device';
import { BleManager, Subscription } from 'react-native-ble-plx';
import { parseWeightData } from '../utils/weightParser';
import { Buffer } from 'buffer';

interface BluetoothDevice {
  id: string;
  name: string;
  device: any;
}

const manager = Platform.OS !== 'web' ? new BleManager() : null;

export const useBluetooth = () => {
  const [weight, setWeight] = useState(0.0);
  const [maxPull, setMaxPull] = useState(1.0);
  const [status, setStatus] = useState('Disconnected');
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [scanning, setScanning] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (manager && typeof manager.destroy === 'function') {
        manager.destroy();
      }
    };
  }, [subscription]);

  const requestPermissions = async (): Promise<boolean> => {
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
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
    } else {
      return true; // iOS handles permissions automatically
    }
  };

  const scanAndConnect = async (): Promise<void> => {
    console.log('Button pressed: Checking permissions...');
    const permission = await requestPermissions();
    console.log('Permission status:', permission);

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
        console.log('SCAN ERROR:', error.message);
        setScanning(false);
        setStatus('Scan Failed');
        return;
      }

      if (!device) return;

      const displayName = device.name || device.localName || device.id;

      setDevices((prev) => {
        if (prev.find((d) => d.id === device.id)) return prev;
        return [...prev, { id: device.id, name: displayName, device }];
      });
    });
  };

  const connectToScale = async (device: any): Promise<void> => {
    try {
      setStatus(`Receiving Data from ${device.name || device.id}`);

      // Clear the device list and mark as connected BEFORE starting new scan
      setDevices([]);
      setScanning(false);
      setConnectedDevice(device);

      // Restart scan to keep receiving updates from this device's broadcasts
      manager?.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.log('Scan error:', error.message);
          return;
        }

        if (!scannedDevice) return;

        // Only process data from the connected device
        if (scannedDevice.id !== device.id) return;

        // Extract weight from manufacturer data or advertisement data
        if (scannedDevice.manufacturerData) {
          try {
            const data = Buffer.from(scannedDevice.manufacturerData, 'base64');
            console.log('Received broadcast data:', data);

            const weightValue = parseWeightData(scannedDevice.manufacturerData);
            if (!isNaN(weightValue)) {
              setWeight(weightValue);
            }
          } catch (e: any) {
            console.log('Error parsing broadcast data:', e.message);
          }
        }
      });
    } catch (e: any) {
      console.log('Error setting up broadcast listener:', e.message);
      setStatus('Setup Failed');
    }
  };

  const disconnectDevice = async (): Promise<void> => {
    try {
      try {
        manager?.stopDeviceScan();
      } catch (e) {}

      setConnectedDevice(null);
      setWeight(0.0);
      setStatus('Disconnected');
    } catch (e: any) {
      console.log('Error disconnecting:', e.message);
    }
  };

  const stopScanning = (): void => {
    try {
      manager?.stopDeviceScan();
    } catch (e) {}
    setScanning(false);
    setStatus('Scan cancelled');
  };

  return {
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
  };
};
