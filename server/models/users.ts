import data1 from '../data/users.json';
import type { PagingRequest, simpleUser } from '../types';
import { connect } from './supabase';


export const TABLE_NAME = 'users';

type ItemType = simpleUser;

const data = {
  items: data1 as ItemType[],
};

export async function getAll(params: PagingRequest): Promise<{ list: ItemType[]; count: number }> {
  const db = connect();
  let query = db.from(TABLE_NAME).select('*', { count: 'estimated' });

  if (params?.search) {
    const search = params.search.toLowerCase();
    query = query.or(`name.ilike.%${search}%,role.ilike.%${search}%`);
  }

  if (params?.sortBy) {
    query = query.order(params.sortBy, { ascending: !params.descending });
  }

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const start = (page - 1) * pageSize;

  const result = await query.range(start, start + pageSize - 1);

  if (result.error) {
    throw result.error;
  }

  const list = (result.data ?? []).map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
  })) as ItemType[];
  const count = result.count ?? 0;

  return { list, count };
}

export async function get(id: number): Promise<ItemType> {
  const db = connect();
  const result = await db.from(TABLE_NAME).select('*').eq('id', id).single();

  if (result.error) {
    const foundUser = data.items.find((currentUser) => currentUser.id === id);

    if (!foundUser) {
      const error = { status: 404, message: 'User not found' };
      throw error;
    }

    return foundUser;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    role: result.data.role,
  };
}

export async function create(userInput: Omit<ItemType, 'id'>): Promise<ItemType> {
  const db = connect();
  const result = await db.from(TABLE_NAME).insert(userInput).select().single();

  if (result.error) {
    throw result.error;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    role: result.data.role,
  };
}

export async function update(id: number, userPatch: Partial<ItemType>): Promise<ItemType> {
  const db = connect();
  const result = await db.from(TABLE_NAME).update(userPatch).eq('id', id).select().single();

  if (result.error) {
    throw result.error;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    role: result.data.role,
  };
}

export async function remove(id: number): Promise<ItemType> {
  const db = connect();
  const result = await db.from(TABLE_NAME).delete().eq('id', id).select().single();

  if (result.error) {
    throw result.error;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    role: result.data.role,
  };
}

export async function seed() {
  const db = connect();
  const items = data.items.map((item) => ({
    name: item.name,
    role: item.role,
  }));
  const result = await db.from(TABLE_NAME).insert(items);

  if (result.error) {
    throw result.error;
  }

  return result.count ?? items.length;
}