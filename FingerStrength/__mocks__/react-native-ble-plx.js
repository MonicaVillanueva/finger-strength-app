class BleManager {
  constructor() {
    this._scanCallback = null;
    this._isScanning = false;
  }

  startDeviceScan(_uuids, _options, callback) {
    this._scanCallback = callback;
    this._isScanning = true;
  }

  stopDeviceScan() {
    this._isScanning = false;
    this._scanCallback = null;
  }

  destroy() {
    this.stopDeviceScan();
  }

  // Test helper: simulate a discovered device
  _simulateDevice(device) {
    if (this._scanCallback) {
      this._scanCallback(null, device);
    }
  }
}

// Export the BleManager and a factory so tests can access the last created instance
const last = { instance: null };
function createBleManager() {
  last.instance = new BleManager();
  return last.instance;
}

module.exports = {
  BleManager: createBleManager,
  __lastBleManager: last,
};
