import type { PagingRequest } from '../types';
import data1 from '../data/stretches.json';
import { connect, filterKeys, toSnakeCase } from './supabase';

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

type StretchInput = Omit<ItemType, 'id'>;

function toDbRow(stretch: StretchInput) {
  return {
    name: stretch.name,
    category: stretch.category,
    status: stretch.status.toLowerCase(),
    target_muscles: stretch.targetMuscles,
  };
}

function fromDbRow(stretch: StretchRow): ItemType {
  return {
    id: stretch.id,
    name: stretch.name,
    category: stretch.category,
    status: stretch.status,
    targetMuscles: stretch.target_muscles,
  };
}

export async function getAll(params: PagingRequest): Promise<{ list: ItemType[]; count: number }> {
  const db = connect();

  let query = db.from(TABLE_NAME).select('*', { count: 'estimated' });

  if (params?.search) {
    query = query.or(`name.ilike.%${params.search}%,category.ilike.%${params.search}%,status.ilike.%${params.search}%`);
  }

  if (params?.sortBy) {
    query = query.order(params.sortBy as keyof StretchRow, { ascending: !params.descending });
  }

  // When no paging is requested by the client, return the full list (Supabase default cap still applies).
  if (params?.page !== undefined || params?.pageSize !== undefined) {
    const parsedPage = Number(params?.page);
    const parsedPageSize = Number(params?.pageSize);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const pageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : 10;
    const start = (page - 1) * pageSize;

    query = query.range(start, start + pageSize - 1);
  }

  const result = await query;

  if (result.error) {
    throw result.error;
  }

  const list = (result.data ?? []).map((stretch) => fromDbRow(stretch as StretchRow));

  const count = result.count ?? 0;

  return { list, count };
}

export async function get(id: number): Promise<ItemType> {
  const db = connect();
  const result = await db.from(TABLE_NAME).select('*').eq('id', id).single();

  if (result.error) {
    const error = { status: 404, message: 'Stretch not found' };
    throw error;
  }

  return fromDbRow(result.data as StretchRow);
}

export async function create(stretchInput: StretchInput): Promise<ItemType> {
  const db = connect();
  const result = await db.from(TABLE_NAME).insert(toDbRow(stretchInput)).select('*').single();

  if (result.error) {
    throw result.error;
  }

  return fromDbRow(result.data as StretchRow);
}

export async function update(id: number, stretchPatch: Partial<ItemType>): Promise<ItemType> {
  const db = connect();
  const updateRow: Record<string, unknown> = {};

  if (stretchPatch.name !== undefined) {
    updateRow.name = stretchPatch.name;
  }

  if (stretchPatch.category !== undefined) {
    updateRow.category = stretchPatch.category;
  }

  if (stretchPatch.status !== undefined) {
    updateRow.status = stretchPatch.status.toLowerCase();
  }

  if (stretchPatch.targetMuscles !== undefined) {
    updateRow.target_muscles = stretchPatch.targetMuscles;
  }

  if (Object.keys(updateRow).length === 0) {
    return get(id);
  }

  const result = await db.from(TABLE_NAME).update(updateRow).eq('id', id).select('*').single();

  if (result.error) {
    throw result.error;
  }

  return fromDbRow(result.data as StretchRow);
}

export async function remove(id: number): Promise<ItemType> {
  const existing = await get(id);
  const db = connect();
  const result = await db.from(TABLE_NAME).delete().eq('id', id);

  if (result.error) {
    throw result.error;
  }

  return existing;
}

export async function seed(): Promise<number> {
  const db = connect();

  const data = {
    items: data1 as Stretch[],
  };

  const stretchKeys = ['name', 'category', 'status', 'targetMuscles'];

  const items = data.items.map((item) => toSnakeCase(filterKeys(item as any, stretchKeys)));
  const result = await db.from(TABLE_NAME).insert(items);

  if (result.error) {
    throw result.error;
  }

  return result.count ?? 0;
}