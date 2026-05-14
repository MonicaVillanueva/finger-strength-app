import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUsers,
  createUser,
  saveUsers,
  saveMaxPullForUser,
  getActiveUserId,
  setActiveUserId,
  getActiveUser,
} from '../../../utils/userStorage';
import { makeUser } from '../../../models/user';

describe('userStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('getUsers returns empty array when no users', async () => {
    const users = await getUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(0);
  });

  test('createUser adds a new user and can be read back', async () => {
    const u = await createUser('Alice', 65);
    const users = await getUsers();
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Alice');
    expect(users[0].bodyWeightKg).toBe(65);
    expect(users[0].id).toBeDefined();
  });

  test('saveMaxPullForUser updates maxPull only when greater', async () => {
    const user = makeUser('Bob', 80);
    await saveUsers([user]);
    await saveMaxPullForUser(user.id, 50);
    let users = await getUsers();
    expect(users[0].maxPull).toBe(50);

    // attempt to save smaller value; should not overwrite
    await saveMaxPullForUser(user.id, 40);
    users = await getUsers();
    expect(users[0].maxPull).toBe(50);

    // attempt to save larger value; should overwrite
    await saveMaxPullForUser(user.id, 60);
    users = await getUsers();
    expect(users[0].maxPull).toBe(60);
  });

  test('active user id can be set and retrieved', async () => {
    const user = makeUser('Cathy', 70);
    await saveUsers([user]);
    await setActiveUserId(user.id);
    const id = await getActiveUserId();
    expect(id).toBe(user.id);
    const active = await getActiveUser();
    expect(active?.id).toBe(user.id);
  });
});
