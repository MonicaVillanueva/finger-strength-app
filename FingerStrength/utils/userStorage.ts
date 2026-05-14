/**
 * utils/userStorage.ts
 * Brief: Utility functions for storing and retrieving user data.
 * 
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, makeUser } from '../models/user';

const USERS_KEY = '@fs_users_v1';
const ACTIVE_USER_KEY = '@fs_active_user_v1';

/**
 * Reads a JSON-parsed value from AsyncStorage.
 * @param {string} key The key to read from AsyncStorage.
 * @returns {Promise<T | null>} The parsed JSON value, or null if the key does not exist or an error occurred.
 * @throws {Error} If an error occurs while reading from AsyncStorage.
 */
async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn('userStorage: readJson error', e);
    return null;
  }
}

/**
 * Writes a JSON-parsed value to AsyncStorage.
 * @param {string} key The key to write to AsyncStorage.
 * @param {T | null} value The value to write to AsyncStorage. If null, the key will be removed from AsyncStorage.
 * @returns {Promise<void>} A promise that resolves when the write operation is complete.
 * @throws {Error} If an error occurs while writing to AsyncStorage.
 */
async function writeJson<T>(key: string, value: T | null): Promise<void> {
  try {
    if (value === null) {
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn('userStorage: writeJson error', e);
  }
}

/**
 * Retrieves an array of User objects from AsyncStorage, or an empty array if no users are stored.
 * @returns {Promise<User[]>} A promise that resolves with an array of User objects.
 */
export async function getUsers(): Promise<User[]> {
  const data = await readJson<User[]>(USERS_KEY);
  return data ?? [];
}

/**
 * Saves an array of User objects to AsyncStorage.
 * @param {User[]} users The array of User objects to save.
 * @returns {Promise<void>} A promise that resolves when the save operation is complete.
 * @throws {Error} If an error occurs while writing to AsyncStorage.
 */
export async function saveUsers(users: User[]): Promise<void> {
  await writeJson(USERS_KEY, users);
}

/**
 * Creates a new User object with the given name and optional bodyWeightKg.
 * The created user is appended to the list of all users and saved to AsyncStorage.
 * @param {string} name The user's name.
 * @param {number} [bodyWeightKg] The user's body weight in kilograms.
 * @returns {Promise<User>} A promise that resolves with the created User object.
 */

export async function createUser(name: string, bodyWeightKg?: number): Promise<User> {
  const users = await getUsers();
  const user = makeUser(name, bodyWeightKg);
  users.push(user);
  await saveUsers(users);
  return user;
}

/**
 * Updates an existing User object with the given data.
 * The updated user is stored in AsyncStorage, replacing the existing user with the same id.
 * If the user does not exist, this function does nothing.
 * @param {User} updated The updated User object.
 * @returns {Promise<void>} A promise that resolves when the update operation is complete.
 */
export async function updateUser(updated: User): Promise<void> {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updated };
    await saveUsers(users);
  }
}

/**
 * Deletes a User object with the given id from AsyncStorage.
 * If the user is currently active, it is also deactivated.
 * @param {string} userId The id of the User object to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion operation is complete.
 * @throws {Error} If an error occurs while reading or writing to AsyncStorage.
 */
export async function deleteUser(userId: string): Promise<void> {
  const users = await getUsers();
  const remaining = users.filter((u) => u.id !== userId);
  await saveUsers(remaining);
  const active = await getActiveUserId();
  if (active === userId) {
    await setActiveUserId(null);
  }
}

/**
 * Retrieves the id of the currently active user from AsyncStorage, or null if no active user is set.
 * @returns {Promise<string | null>} A promise that resolves with the id of the currently active user, or null if no active user is set.
 */
export async function getActiveUserId(): Promise<string | null> {
  return await readJson<string>(ACTIVE_USER_KEY);
}

/**
 * Sets the id of the currently active user to AsyncStorage.
 * If the id is null, the currently active user is deactivated.
 * @param {string | null} id The id of the User object to set as active, or null to deactivate the currently active user.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} If an error occurs while writing to AsyncStorage.
 */
export async function setActiveUserId(id: string | null): Promise<void> {
  await writeJson(ACTIVE_USER_KEY, id);
}

/**
 * Retrieves the User object associated with the currently active user id, or null if no active user is set.
 * @returns {Promise<User | null>} A promise that resolves with the User object associated with the currently active user id, or null if no active user is set.
 */
export async function getActiveUser(): Promise<User | null> {
  const id = await getActiveUserId();
  if (!id) return null;
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

/**
 * Saves a new maximum pull weight for the given user.
 * If the given weight is greater than the current maximum for the user, it updates the user's maximum pull and sets the current date as the maximum pull date.
 * @param {string} userId The id of the User object to update.
 * @param {number} maxPull The new maximum pull weight to save for the user.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} If an error occurs while writing to AsyncStorage.
 */
export async function saveMaxPullForUser(userId: string, maxPull: number): Promise<void> {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  const current = users[idx].maxPull ?? 0;
  if (maxPull > current) {
    users[idx].maxPull = maxPull;
    users[idx].maxPullDate = new Date().toISOString();
    await saveUsers(users);
  }
}
