import data1 from '../data/stretches.json';
import type { PagingRequest } from '../types';
import { connect } from './supabase';

export const TABLE_NAME = 'stretches';

export type Stretch = {
  id: number;
  name: string;
  category: string;
  status: string;
  targetMuscles: string[];
};

type StretchRow = {
  id: number;
  name: string;
  category: string;
  status: string;
  target_muscles: string[];
};

type ItemType = Stretch;

const data = {
  items: data1 as Stretch[],
};

export async function getAll(params: PagingRequest): Promise<{ list: ItemType[]; count: number }> {
  const db = connect();

  let query = db.from(TABLE_NAME).select('*', { count: 'estimated' });

  if (params?.search) {
    query = query.or(`name.ilike.%${params.search}%,category.ilike.%${params.search}%,status.ilike.%${params.search}%`);
  }

  if (params?.sortBy) {
    query = query.order(params.sortBy as keyof StretchRow, { ascending: !params.descending });
  }

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const start = (page - 1) * pageSize;

  const result = await query.range(start, start + pageSize - 1);

  if (result.error) {
    throw result.error;
  }

  const list = (result.data ?? []).map((stretch) => ({
    id: stretch.id,
    name: stretch.name,
    category: stretch.category,
    status: stretch.status,
    targetMuscles: stretch.target_muscles,
  })) as ItemType[];

  const count = result.count ?? 0;

  return { list, count };
}

export async function get(id: number): Promise<ItemType> {
  const db = connect();
  const result = await db.from(TABLE_NAME).select('*').eq('id', id).single();

  if (result.error) {
    const item = data.items.find((stretch) => stretch.id === id);

    if (!item) {
      const error = { status: 404, message: 'Stretch not found' };
      throw error;
    }

    return item as ItemType;
  }

  return {
    id: result.data.id,
    name: result.data.name,
    category: result.data.category,
    status: result.data.status,
    targetMuscles: result.data.target_muscles,
  };
}

export function create(stretchInput: Omit<ItemType, 'id'>) {
  const newStretch = {
    ...stretchInput,
    id: data.items.length + 1,
  };

  data.items.push(newStretch as ItemType);
  return newStretch;
}

export function update(id: number, stretchPatch: Partial<ItemType>) {
  const index = data.items.findIndex((stretch) => stretch.id === id);

  if (index === -1) {
    const error = { status: 404, message: 'Stretch not found' };
    throw error;
  }

  const updatedStretch = {
    ...data.items[index],
    ...stretchPatch,
  };

  data.items[index] = updatedStretch as ItemType;
  return updatedStretch;
}

export function remove(id: number) {
  const index = data.items.findIndex((stretch) => stretch.id === id);

  if (index === -1) {
    const error = { status: 404, message: 'Stretch not found' };
    throw error;
  }

  const removedStretch = data.items.splice(index, 1)[0];
  return removedStretch as ItemType;
}