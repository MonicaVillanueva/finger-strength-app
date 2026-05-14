// Setup that requires the Jest environment (beforeEach, afterEach, etc.)
const AsyncStorage = require('@react-native-async-storage/async-storage');

beforeEach(async () => {
  if (AsyncStorage && AsyncStorage.clear) await AsyncStorage.clear();
});
