/**
 * hooks/useBluetooth.ts
 * Brief: Custom hook encapsulating BLE scanning, connection and lightweight broadcast parsing.
 * - Exposes: `weight`, `maxPull`, `status`, `connectedDevice`, `devices`, `scanning` and action methods.
 * 
 * @todo: Currently mixes scanning, connect and broadcast parsing in a single hook; consider splitting responsibilities.
 */
import { useEffect, useState, useRef } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import * as Device from 'expo-device';
import { BleManager, Subscription } from 'react-native-ble-plx';
import { parseWeightData } from '@/utils/weightParser';
import { Buffer } from 'buffer';
import { connected } from 'process';

interface BluetoothDevice {
  id: string;
  name: string;
  device: any;
}

const manager = Platform.OS !== 'web' ? new BleManager() : null;

/**
 * Custom hook encapsulating BLE scanning, connection and lightweight broadcast parsing.
 *
 * Exposes: `weight`, `maxPull`, `status`, `connectedDevice`, `devices`, `scanning` and action methods.
 *
 * Notes: Currently mixes scanning, connect and broadcast parsing in a single hook; consider splitting responsibilities.
 *
 * @returns {Object} An object containing the hook's state and methods.
 * @property {number} weight - The most recently received weight value.
 * @property {number} maxPull - The maximum pull force observed on the device.
 * @property {string} status - The current status of the hook (e.g. 'Disconnected', 'Scanning...').
 * @property {any} connectedDevice - The currently connected BLE device.
 * @property {BluetoothDevice[]} devices - The list of discovered BLE devices.
 * @property {boolean} scanning - Whether the hook is currently scanning for BLE devices.
 * @property {function} scanAndConnect - Starts scanning for BLE devices and connects to the first device that is discovered.
 * @property {function} connectToScale - Connect to a BLE device and start listening for its broadcasts to receive weight data.
 * @property {function} disconnectDevice - Disconnects the connected BLE device, stops any ongoing scan, and resets the UI state.
 * @property {function} stopScanning - Stop BLE device scanning and cancel any ongoing scan.
 */
export const useBluetooth = () => {
  const [weight, setWeight] = useState(0.0);
  const [maxPull, setMaxPull] = useState(1.0);
  //const [status, setStatus] = useState('Disconnected');
  const statusMap: Record<string, { label: string; color: string }> = {
    disconnected: { label: '🔴 Not connected', color: '#d9534f' },
    scanning: { label: '🔎 Scanning...', color: '#007bff' },    
    connected: { label: '🟢 Connected to {}', color: '#5cb85c' },
    scan_failed: { label: '⚠️ Scan Failed', color: '#d9534f' },
    unknown_data: { label: '🚫 Unknown Data', color: '#d9534f' },


    //connecting: { label: '🟡 Connecting…', color: '#f0ad4e' },
    //training: { label: '🔵 Training in progress', color: '#007bff' },
    //'scan cancelled': { label: 'ℹ️ Scan cancelled', color: '#6c757d' },
  };
  const [status, setStatus] = useState<{ label: string }>(
    statusMap.disconnected
  );

  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const discoveryRef = useRef(false); // Track wheter discovery scanning should accept results
  const lastUpdateRef = useRef<number>(0);
  const lastLogRef = useRef<number>(0);
  const lastHrRef = useRef<number | null>(null);
  const minUpdateIntervalRef = useRef<number>(50); // ms - limit state updates to 20Hz by default
  const weightRef = useRef<number>(0);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [scanning, setScanning] = useState(false);

  const updateStatus = (keyOrLabel: string, name?: string) => {
    const key = (keyOrLabel || '').toLowerCase();
    if (statusMap[key]) {
      setStatus(statusMap[key]);
    }
    if (name) {
      setStatus({ label: statusMap[key].label.replace('{}', name) });
    }
  };


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

/**
 * Request Android permissions for BLE scanning, connection and fine location.
 * Note that BLE requires location permission on Android (API level < 31).
 * On iOS, permissions are handled automatically and this function returns true.
 * @returns {Promise<boolean>} True if all permissions are granted, false otherwise.
 */
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

/**
 * Scans for nearby BLE devices and connects to the first device that is discovered.
 * Checks for required permissions before starting the scan.
 * If no devices are discovered, sets `scanning` to false and `status` to 'Scan Failed'.
 * If a device is discovered, adds it to the `devices` array and sets `scanning` to false.
 * If BLE is not available (web), shows an alert to the user.
 */
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
    updateStatus('scanning');
    discoveryRef.current = true;

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('SCAN ERROR:', error.message);
        setScanning(false);
        updateStatus('scan_failed');
        return;
      }

      if (!device) return;
      if (!discoveryRef.current) return; // Ignore discoveries after stop

      // Filter out devices without a name
      if (!device.name && !device.localName) return;

      const displayName = device.name || device.localName || device.id;

      setDevices((prev) => {
        if (prev.find((d) => d.id === device.id)) return prev;

        const newList = [...prev, { id: device.id, name: displayName, device }];

        // Promote devices whose name starts with "IF_"
        newList.sort((a, b) => {
          const aPriority = /^IF_/i.test(a.name) ? 0 : 1;
          const bPriority = /^IF_/i.test(b.name) ? 0 : 1;
          if (aPriority !== bPriority) return aPriority - bPriority;

          // If names are the same, do not change the order
          return 0;          
          // return a.name.localeCompare(b.name); // Alphabetical order
        });

        return newList;
      });
    });
  };

/**
 * Connect to a BLE device and start listening for its broadcasts to receive weight data.
 * @param {any} device - The BLE device to connect to.
 * @returns {Promise<void>} - A promise that resolves when the device is connected and broadcasts are being received.
 * @throws {Error} - If there was an error connecting to the device or setting up the broadcast listener.
 */
  const connectToScale = async (device: any): Promise<void> => {
    try {
      updateStatus('connected', device.name || device.id)

      // Clear the device list and mark as connected BEFORE starting new scan
      setDevices([]);
      setScanning(false);
      discoveryRef.current = false;
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
            const wallNow = Date.now();
            const perf = (global as any).performance;
            const hrNow = perf && typeof perf.now === 'function' ? perf.now() : Date.now();

            // precise delta in milliseconds between packets
            const delta = lastHrRef.current != null ? hrNow - lastHrRef.current : 0;
            lastHrRef.current = hrNow;

            const weightValue = parseWeightData(scannedDevice.manufacturerData);
            if (!isNaN(weightValue)) {
              // Log ISO timestamp plus high-resolution delta (ms)
              console.log('Received broadcast at', new Date(wallNow).toISOString(), 'delta_ms:', delta.toFixed(3));

              // Throttle UI updates to avoid flooding React renders
              const since = wallNow - lastUpdateRef.current;
              if (since >= minUpdateIntervalRef.current || weightValue !== weightRef.current) {
                setWeight(weightValue);
                weightRef.current = weightValue;
                lastUpdateRef.current = wallNow;
              }
            }
          } catch (e: any) {
            console.log('Error parsing broadcast data:', e.message);
          }
        }
      });
    } catch (e: any) {
      console.log('Error setting up broadcast listener:', e.message);
      updateStatus('unknown_data');
    }
  };

/**
 * Disconnects the connected BLE device, stops any ongoing scan, and resets the UI state.
 * @returns {Promise<void>} - A promise that resolves when the device is disconnected.
 * @throws {Error} - If an error occurs while disconnecting the device.
 */
  const disconnectDevice = async (): Promise<void> => {
    try {
      try {
        manager?.stopDeviceScan();
      } catch (e) {}

      setConnectedDevice(null);
      setWeight(0.0);
      updateStatus('disconnected');
    } catch (e: any) {
      console.log('Error disconnecting:', e.message);
    }
  };

/**
 * Stop BLE device scanning and cancel any ongoing scan.
 * @returns {void} Does not return a value.
 * @throws {any} If there was an error stopping the device scan.
 */
  const stopScanning = (): void => {
    try {
      manager?.stopDeviceScan();
    } catch (e) {}
    setScanning(false);
    updateStatus('disconnected');
    setDevices([]);
    discoveryRef.current = false;
  };

  return {
    weight,
    maxPull,
    setMaxPull,
    status: status.label,
    connectedDevice,
    devices,
    scanning,
    scanAndConnect,
    connectToScale,
    disconnectDevice,
    stopScanning,
    updateStatus
  };
};
