/**
 * models/user.ts
 * Brief: User model and utility functions.
 * Exports: `User`, `makeUser`, `GuestUser`. 
 */

export type User = {
  id: string;
  name: string;
  bodyWeightKg?: number;
  maxPull?: number;
  maxPullDate?: string; // ISO date string
  createdAt: string; // ISO date string
};

export const createId = () => `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

/**
 * Creates a new User object with the given name and optional bodyWeightKg.
 * The id is automatically generated using createId().
 * The createdAt field is automatically set to the current ISO date string.
 * If no name is provided, 'User' is used as the default name.
 * @param {string} name The user's name.
 * @param {number} [bodyWeightKg] The user's body weight in kilograms.
 * @returns {User} The newly created User object.
 */
export const makeUser = (name: string, bodyWeightKg?: number): User => ({
  id: createId(),
  name: name || 'User',
  bodyWeightKg,
  createdAt: new Date().toISOString(),
});

export const GuestUser: User = {
  id: 'guest',
  name: 'Guest',
  createdAt: new Date().toISOString(),
};
