import type { PagingRequest } from '../types';
import { connect } from './supabase';

export const TABLE_NAME = 'workout_presets';
const PRESET_STRETCHES_TABLE_NAME = 'workout_preset_stretches';

export type WorkoutPreset = {
  id: number;
  name: string;
  description: string | null;
  isSystemPreset: boolean;
  createdByUserId: number | null;
  stretchIds: number[];
};

type WorkoutPresetRow = {
  id: number;
  name: string;
  description: string | null;
  is_system_preset: boolean;
  created_by_user_id: number | null;
};

type WorkoutPresetStretchRow = {
  preset_id: number;
  stretch_id: number;
  sort_order: number;
};

type WorkoutPresetCreateInput = {
  name: string;
  description?: string | null;
  isSystemPreset?: boolean;
  createdByUserId?: number | null;
  stretchIds: number[];
};

type WorkoutPresetUpdateInput = Partial<WorkoutPresetCreateInput>;

async function getStretchIdsByPresetIds(presetIds: number[]) {
  if (presetIds.length === 0) {
    return new Map<number, number[]>();
  }

  const db = connect();
  const response = await db
    .from(PRESET_STRETCHES_TABLE_NAME)
    .select('preset_id, stretch_id, sort_order')
    .in('preset_id', presetIds)
    .order('sort_order', { ascending: true });

  if (response.error) {
    throw response.error;
  }

  const grouped = new Map<number, number[]>();

  (response.data as WorkoutPresetStretchRow[] | null)?.forEach((row) => {
    const existing = grouped.get(row.preset_id) ?? [];
    existing.push(row.stretch_id);
    grouped.set(row.preset_id, existing);
  });

  return grouped;
}

function toWorkoutPreset(row: WorkoutPresetRow, stretchIdsByPresetId: Map<number, number[]>): WorkoutPreset {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isSystemPreset: row.is_system_preset,
    createdByUserId: row.created_by_user_id,
    stretchIds: stretchIdsByPresetId.get(row.id) ?? [],
  };
}

export async function getAll(params: PagingRequest): Promise<{ list: WorkoutPreset[]; count: number }> {
  const db = connect();
  let query = db.from(TABLE_NAME).select('*', { count: 'estimated' });

  if (params?.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  if (params?.sortBy) {
    query = query.order(params.sortBy as keyof WorkoutPresetRow, { ascending: !params.descending });
  } else {
    query = query.order('id', { ascending: true });
  }

  if (params?.page !== undefined || params?.pageSize !== undefined) {
    const parsedPage = Number(params?.page);
    const parsedPageSize = Number(params?.pageSize);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const pageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : 10;
    const start = (page - 1) * pageSize;

    query = query.range(start, start + pageSize - 1);
  }

  const response = await query;

  if (response.error) {
    throw response.error;
  }

  const rows = (response.data ?? []) as WorkoutPresetRow[];
  const stretchIdsByPresetId = await getStretchIdsByPresetIds(rows.map((row) => row.id));
  const list = rows.map((row) => toWorkoutPreset(row, stretchIdsByPresetId));

  return {
    list,
    count: response.count ?? 0,
  };
}

export async function get(id: number): Promise<WorkoutPreset> {
  const db = connect();
  const response = await db.from(TABLE_NAME).select('*').eq('id', id).single();

  if (response.error) {
    throw response.error;
  }

  const row = response.data as WorkoutPresetRow;
  const stretchIdsByPresetId = await getStretchIdsByPresetIds([id]);
  return toWorkoutPreset(row, stretchIdsByPresetId);
}

export async function create(input: WorkoutPresetCreateInput): Promise<WorkoutPreset> {
  const db = connect();
  const rowToInsert = {
    name: input.name,
    description: input.description ?? null,
    is_system_preset: input.isSystemPreset ?? false,
    created_by_user_id: input.createdByUserId ?? null,
  };

  const inserted = await db.from(TABLE_NAME).insert(rowToInsert).select('*').single();

  if (inserted.error) {
    throw inserted.error;
  }

  const created = inserted.data as WorkoutPresetRow;

  if (input.stretchIds.length > 0) {
    const stretchRows = input.stretchIds.map((stretchId, index) => ({
      preset_id: created.id,
      stretch_id: stretchId,
      sort_order: index + 1,
    }));

    const insertedStretches = await db.from(PRESET_STRETCHES_TABLE_NAME).insert(stretchRows);

    if (insertedStretches.error) {
      throw insertedStretches.error;
    }
  }

  const stretchIdsByPresetId = await getStretchIdsByPresetIds([created.id]);
  return toWorkoutPreset(created, stretchIdsByPresetId);
}

export async function update(id: number, patch: WorkoutPresetUpdateInput): Promise<WorkoutPreset> {
  const db = connect();

  const updateRow: Record<string, unknown> = {};

  if (patch.name !== undefined) {
    updateRow.name = patch.name;
  }

  if (patch.description !== undefined) {
    updateRow.description = patch.description;
  }

  if (patch.isSystemPreset !== undefined) {
    updateRow.is_system_preset = patch.isSystemPreset;
  }

  if (patch.createdByUserId !== undefined) {
    updateRow.created_by_user_id = patch.createdByUserId;
  }

  if (Object.keys(updateRow).length > 0) {
    const updated = await db.from(TABLE_NAME).update(updateRow).eq('id', id).select('*').single();

    if (updated.error) {
      throw updated.error;
    }
  }

  if (patch.stretchIds !== undefined) {
    const deletedStretches = await db.from(PRESET_STRETCHES_TABLE_NAME).delete().eq('preset_id', id);

    if (deletedStretches.error) {
      throw deletedStretches.error;
    }

    if (patch.stretchIds.length > 0) {
      const stretchRows = patch.stretchIds.map((stretchId, index) => ({
        preset_id: id,
        stretch_id: stretchId,
        sort_order: index + 1,
      }));

      const insertedStretches = await db.from(PRESET_STRETCHES_TABLE_NAME).insert(stretchRows);

      if (insertedStretches.error) {
        throw insertedStretches.error;
      }
    }
  }

  return get(id);
}

export async function remove(id: number): Promise<WorkoutPreset> {
  const existing = await get(id);
  const db = connect();
  const response = await db.from(TABLE_NAME).delete().eq('id', id);

  if (response.error) {
    throw response.error;
  }

  return existing;
}
