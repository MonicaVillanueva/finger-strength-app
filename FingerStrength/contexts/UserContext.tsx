/**
 * contexts/UserContext.tsx
 * Brief: Context for managing user profiles.
 * Exports: `UserContext`, `useUserContext`.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../models/user';
import * as storage from '../utils/userStorage';

type UserContextValue = {
  users: User[];
  activeUser: User | null;
  loading: boolean;
  createUser: (name: string, bodyWeightKg?: number) => Promise<User>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  setActiveUserId: (id: string | null) => Promise<void>;
};

const defaultValue: UserContextValue = {
  users: [],
  activeUser: null,
  loading: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  createUser: async () => { throw new Error('UserContext not initialized'); },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateUser: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  deleteUser: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setActiveUserId: async () => {},
};

const UserContext = createContext<UserContextValue>(defaultValue);

export const useUserContext = () => useContext(UserContext);

/**
 * UserProvider component that wraps the UserContext and manages the user profiles.
 * @param {Object} props
 * @param {ReactNode} props.children The children components to render.
 * @returns {JSX.Element} The UserProvider component.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const u = await storage.getUsers();
      const activeId = await storage.getActiveUserId();
      const active = activeId ? u.find((x) => x.id === activeId) ?? null : null;
      if (!mounted) return;
      setUsers(u);
      setActiveUser(active);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

/**
 * Creates a new User object with the given name and optional bodyWeightKg.
 * The newly created user is added to the list of all users, and set as the active user.
 * @param {string} name The user's name.
 * @param {number} [bodyWeightKg] The user's body weight in kilograms.
 * @returns {Promise<User>} A promise that resolves with the newly created User object.
 */
  const createUser = async (name: string, bodyWeightKg?: number) => {
    const created = await storage.createUser(name, bodyWeightKg);
    const updated = await storage.getUsers();
    setUsers(updated);
    await storage.setActiveUserId(created.id);
    setActiveUser(created);
    return created;
  };

/**
 * Updates an existing User object with the given data.
 * The updated user is stored in AsyncStorage, replacing the existing user with the same id.
 * If the user does not exist, this function does nothing.
 * @param {User} updated The updated User object.
 * @returns {Promise<void>} A promise that resolves when the update operation is complete.
 * @throws {Error} If an error occurs while writing to AsyncStorage.
 */
  const updateUser = async (user: User) => {
    await storage.updateUser(user);
    const updated = await storage.getUsers();
    setUsers(updated);
    if (activeUser?.id === user.id) {
      const refreshed = updated.find((u) => u.id === user.id) ?? null;
      setActiveUser(refreshed);
    }
  };

/**
 * Deletes a User object with the given id from AsyncStorage.
 * If the user is currently active, it is also deactivated.
 * @param {string} userId The id of the User object to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion operation is complete.
 * @throws {Error} If an error occurs while reading or writing to AsyncStorage.
 */
  const deleteUser = async (userId: string) => {
    await storage.deleteUser(userId);
    const updated = await storage.getUsers();
    setUsers(updated);
    const activeId = await storage.getActiveUserId();
    const active = activeId ? updated.find((u) => u.id === activeId) ?? null : null;
    setActiveUser(active);
  };

/**
 * Sets the id of the currently active user to AsyncStorage.
 * If the id is null, the currently active user is deactivated.
 * @param {string | null} id The id of the User object to set as active, or null to deactivate the currently active user.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} If an error occurs while writing to AsyncStorage.
 */
  const setActiveUserId = async (id: string | null) => {
    await storage.setActiveUserId(id);
    const active = id ? (await storage.getUsers()).find((u) => u.id === id) ?? null : null;
    setActiveUser(active);
  };

  return (
    <UserContext.Provider value={{ users, activeUser, loading, createUser, updateUser, deleteUser, setActiveUserId }}>
      {children}
    </UserContext.Provider>
  );
}
