import type { PagingRequest, simpleUser } from '../types';
import { connect, filterKeys, toSnakeCase } from './supabase';
import data1 from '../data/users.json';

export const TABLE_NAME = 'users';

type ItemType = simpleUser;

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
    email: user.email,
    role: user.role,
    preferredMuscleGroups: user.preferred_muscle_groups ?? [],
  })) as ItemType[];
  const count = result.count ?? 0;

  return { list, count };
}

export async function get(id: number): Promise<ItemType> {
  const db = connect();
  const result = await db.from(TABLE_NAME).select('*').eq('id', id).single();

  if (result.error) {
    const error = { status: 404, message: 'User not found' };
    throw error;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    email: result.data.email,
    role: result.data.role,
    preferredMuscleGroups: result.data.preferred_muscle_groups ?? [],
  };
}

export async function create(userInput: Omit<ItemType, 'id'>): Promise<ItemType> {
  const db = connect();
  const payload = toSnakeCase(filterKeys(userInput as any, ['name', 'email', 'role', 'preferredMuscleGroups']));
  const result = await db.from(TABLE_NAME).insert(payload).select().single();

  if (result.error) {
    throw result.error;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    email: result.data.email,
    role: result.data.role,
    preferredMuscleGroups: result.data.preferred_muscle_groups ?? [],
  };
}

export async function update(id: number, userPatch: Partial<ItemType>): Promise<ItemType> {
  const db = connect();
  const payload = toSnakeCase(filterKeys(userPatch as any, ['name', 'email', 'role', 'preferredMuscleGroups']));
  const result = await db.from(TABLE_NAME).update(payload).eq('id', id).select().single();

  if (result.error) {
    throw result.error;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    email: result.data.email,
    role: result.data.role,
    preferredMuscleGroups: result.data.preferred_muscle_groups ?? [],
  };
}

export async function updatePreferredMuscleGroups(id: number, preferredMuscleGroups: string[]): Promise<ItemType> {
  const db = connect();
  const result = await db
    .from(TABLE_NAME)
    .update({ preferred_muscle_groups: preferredMuscleGroups })
    .eq('id', id)
    .select()
    .single();

  if (result.error) {
    throw result.error;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    email: result.data.email,
    role: result.data.role,
    preferredMuscleGroups: result.data.preferred_muscle_groups ?? [],
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
    email: result.data.email,
    role: result.data.role,
    preferredMuscleGroups: result.data.preferred_muscle_groups ?? [],
  };
}

export async function seed() {
  const db = connect();
  const data = {
    items: data1 as ItemType[],
  };

  const cleared = await db.from(TABLE_NAME).delete().gte('id', 1);

  if (cleared.error) {
    throw cleared.error;
  }

  const items = data.items.map((item) =>
    toSnakeCase(filterKeys(item as any, ['name', 'email', 'role', 'preferredMuscleGroups'])),
  );
  const result = await db.from(TABLE_NAME).insert(items);

  if (result.error) {
    throw result.error;
  }

  return result.count ?? items.length;
}