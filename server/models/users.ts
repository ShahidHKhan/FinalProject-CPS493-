import data from '../data/users.json';
import type { PagingRequest, simpleUser } from '../types';

const users = data as simpleUser[];

export function getAll(params: PagingRequest): { users: simpleUser[]; count: number } {
  let filteredUsers = [...users];
  const count = filteredUsers.length;

  if (params?.search) {
    const search = params.search.toLowerCase();
    filteredUsers = filteredUsers.filter((currentUser) =>
      `${currentUser.name} ${currentUser.role}`.toLowerCase().includes(search),
    );
  }

  if (params?.sortBy) {
    filteredUsers.sort((a, b) => {
      const aValue = a[params.sortBy as keyof simpleUser];
      const bValue = b[params.sortBy as keyof simpleUser];

      if (aValue < bValue) {
        return params.descending ? 1 : -1;
      }

      if (aValue > bValue) {
        return params.descending ? -1 : 1;
      }

      return 0;
    });
  }

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const start = (page - 1) * pageSize;
  filteredUsers = filteredUsers.slice(start, start + pageSize);

  return { users: filteredUsers, count };
}

export function get(id: number): simpleUser {
  const foundUser = users.find((currentUser) => currentUser.id === id);

  if (!foundUser) {
    throw new Error(`User with ID ${id} not found`);
  }

  return foundUser;
}

export function create(userInput: Omit<simpleUser, 'id'>): simpleUser {
  const createdUser: simpleUser = {
    id: users.length + 1,
    ...userInput,
  };

  users.push(createdUser);

  return createdUser;
}

export function update(id: number, userPatch: Partial<simpleUser>): simpleUser {
  const userIndex = users.findIndex((currentUser) => currentUser.id === id);

  if (userIndex === -1) {
    throw new Error(`User with ID ${id} not found`);
  }

  users[userIndex] = { ...users[userIndex], ...userPatch };

  return users[userIndex];
}

export function remove(id: number): simpleUser {
  const userIndex = users.findIndex((currentUser) => currentUser.id === id);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const removedUser = users.splice(userIndex, 1);

  return removedUser[0];
}