const AsyncStorageModule = require('@react-native-async-storage/async-storage');
const AsyncStorage = AsyncStorageModule.default ?? AsyncStorageModule;

describe('AsyncStorage persistence', () => {
  beforeAll(async () => {
    await AsyncStorage.clear();
  });

  test('data persists across module reload (simulated restart)', async () => {
    // require module and create user (CommonJS require avoids dynamic ESM import)
    const userStorage1 = require('../../utils/userStorage');
    await userStorage1.createUser('PersistentUser', 72);

    // read the raw storage payload so we can restore it after resetting modules
    const USERS_KEY = '@fs_users_v1';
    const raw = await AsyncStorage.getItem(USERS_KEY);

    // simulate app restart by clearing module cache
    jest.resetModules();

    // after module reset, re-require the AsyncStorage mock and restore the raw payload
    const AsyncStorageModule2 = require('@react-native-async-storage/async-storage');
    const AsyncStorage2 = AsyncStorageModule2.default ?? AsyncStorageModule2;
    if (raw) await AsyncStorage2.setItem(USERS_KEY, raw);

    // re-require fresh module instance and read users
    const userStorage2 = require('../../utils/userStorage');
    const users = await userStorage2.getUsers();

    expect(users.length).toBe(1);
    expect(users[0].name).toBe('PersistentUser');
  });

  afterAll(async () => {
    await AsyncStorage.clear();
  });
});