import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useBluetooth } from '@/hooks/useBluetooth';
import { DisplayRing } from '@/components/DisplayRing';
import { ControlButtons } from '@/components/ControlButtons';
import { DeviceModal } from '@/components/DeviceModal';
import { UserDropDown } from '@/components/UserDropDown';
import { StatsSection } from '@/components/StatsSection';
import { useUserContext } from '@/contexts/UserContext';
import { COLORS } from '@/constants/colors';

/**
 * The main tab entry — wires BLE hook to UI components used on the primary tab.
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

  const { activeUser, updateUser } = useUserContext();

  // Initialize maxPull from activeUser when activeUser changes
  useEffect(() => {
    if (activeUser && activeUser.maxPull) {
      setMaxPull(activeUser.maxPull);
    } else {
      setMaxPull(0.0); // Default if no user or no maxPull
    }
  }, [activeUser?.id, setMaxPull]);

  // Real-time Max Pull Update (UI only)
  useEffect(() => {
    if (weight > maxPull) {
      setMaxPull(weight);
    }
  }, [weight, maxPull, setMaxPull]);

  // Debounced persistence to User Profile
  useEffect(() => {
    if (!activeUser) return;
    
    // Only persist if the current maxPull is significantly higher than what's saved
    // or if we haven't updated in a while. 
    // We use a 2-second debounce to avoid slamming storage during a pull.
    if (maxPull > (activeUser.maxPull || 0)) {
      const timer = setTimeout(() => {
        updateUser({
          ...activeUser,
          maxPull: maxPull,
          maxPullDate: new Date().toISOString()
        }).catch(e => console.error('Failed to auto-update max pull:', e));
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [maxPull, activeUser?.id, updateUser]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>FingerStrength</Text>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <UserDropDown />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.mainContent}>
          <DisplayRing weight={weight} maxPull={maxPull} />
          <StatsSection weight={weight} maxPull={maxPull} />
        </View>

        <ControlButtons
          connectedDevice={connectedDevice}
          scanning={scanning}
          weight={weight}
          onConnectPress={scanAndConnect}
          onDisconnectPress={disconnectDevice}
          onCancelScan={stopScanning}
        />
      </ScrollView>

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
    paddingHorizontal: 20,
    paddingTop: 50, // Slightly reduced top padding
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 15, // Reduced margin
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginVertical: 10,
  },
  title: {
    fontSize: 26, // Slightly smaller title
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  statusText: {
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
    fontSize: 13,
  },
});