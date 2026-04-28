import type { PagingRequest } from '../types';
import data1 from '../data/workouts.json';
import { connect, filterKeys, toSnakeCase } from './supabase';

export const TABLE_NAME = 'workouts';
const WORKOUT_STRETCHES_TABLE_NAME = 'workout_stretches';

export type Workout = {
  id: number;
  userId: number;
  title: string;
  workoutTimeMinutes: number;
  stretchIds: number[];
  publishedAt: string;
};

type WorkoutRow = {
  id: number;
  user_id: number;
  title: string;
  workout_time_minutes: number;
  published_at: string;
};

type WorkoutStretchRow = {
  workout_id: number;
  stretch_id: number;
  sort_order: number;
};

type WorkoutCreateInput = {
  userId: number;
  title: string;
  workoutTimeMinutes: number;
  stretchIds: number[];
  publishedAt?: string;
};

type WorkoutUpdateInput = Partial<WorkoutCreateInput>;

async function getStretchIdsByWorkoutIds(workoutIds: number[]) {
  if (workoutIds.length === 0) {
    return new Map<number, number[]>();
  }

  const db = connect();
  const response = await db
    .from(WORKOUT_STRETCHES_TABLE_NAME)
    .select('workout_id, stretch_id, sort_order')
    .in('workout_id', workoutIds)
    .order('sort_order', { ascending: true });

  if (response.error) {
    throw response.error;
  }

  const grouped = new Map<number, number[]>();

  (response.data as WorkoutStretchRow[] | null)?.forEach((row) => {
    const existing = grouped.get(row.workout_id) ?? [];
    existing.push(row.stretch_id);
    grouped.set(row.workout_id, existing);
  });

  return grouped;
}

function toWorkout(row: WorkoutRow, stretchIdsByWorkoutId: Map<number, number[]>): Workout {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    workoutTimeMinutes: row.workout_time_minutes,
    stretchIds: stretchIdsByWorkoutId.get(row.id) ?? [],
    publishedAt: row.published_at,
  };
}

export async function getAll(params: PagingRequest): Promise<{ list: Workout[]; count: number }> {
  const db = connect();
  let query = db.from(TABLE_NAME).select('*', { count: 'estimated' });

  if (params?.search) {
    query = query.ilike('title', `%${params.search}%`);
  }

  if (params?.sortBy) {
    query = query.order(params.sortBy as keyof WorkoutRow, { ascending: !params.descending });
  } else {
    query = query.order('published_at', { ascending: false });
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

  const rows = (response.data ?? []) as WorkoutRow[];
  const stretchIdsByWorkoutId = await getStretchIdsByWorkoutIds(rows.map((row) => row.id));
  const list = rows.map((row) => toWorkout(row, stretchIdsByWorkoutId));

  return {
    list,
    count: response.count ?? 0,
  };
}

export async function get(id: number): Promise<Workout> {
  const db = connect();
  const response = await db.from(TABLE_NAME).select('*').eq('id', id).single();

  if (response.error) {
    throw response.error;
  }

  const row = response.data as WorkoutRow;
  const stretchIdsByWorkoutId = await getStretchIdsByWorkoutIds([id]);
  return toWorkout(row, stretchIdsByWorkoutId);
}

export async function create(input: WorkoutCreateInput): Promise<Workout> {
  const db = connect();
  const rowToInsert = {
    user_id: input.userId,
    title: input.title,
    workout_time_minutes: input.workoutTimeMinutes,
    published_at: input.publishedAt ?? new Date().toISOString(),
  };

  const inserted = await db.from(TABLE_NAME).insert(rowToInsert).select('*').single();

  if (inserted.error) {
    throw inserted.error;
  }

  const created = inserted.data as WorkoutRow;

  if (input.stretchIds.length > 0) {
    const stretchRows = input.stretchIds.map((stretchId, index) => ({
      workout_id: created.id,
      stretch_id: stretchId,
      sort_order: index + 1,
    }));

    const insertedStretches = await db.from(WORKOUT_STRETCHES_TABLE_NAME).insert(stretchRows);

    if (insertedStretches.error) {
      throw insertedStretches.error;
    }
  }

  const stretchIdsByWorkoutId = await getStretchIdsByWorkoutIds([created.id]);
  return toWorkout(created, stretchIdsByWorkoutId);
}

export async function update(id: number, patch: WorkoutUpdateInput): Promise<Workout> {
  const db = connect();

  const updateRow: Record<string, unknown> = {};

  if (patch.userId !== undefined) {
    updateRow.user_id = patch.userId;
  }

  if (patch.title !== undefined) {
    updateRow.title = patch.title;
  }

  if (patch.workoutTimeMinutes !== undefined) {
    updateRow.workout_time_minutes = patch.workoutTimeMinutes;
  }

  if (patch.publishedAt !== undefined) {
    updateRow.published_at = patch.publishedAt;
  }

  if (Object.keys(updateRow).length > 0) {
    const updated = await db.from(TABLE_NAME).update(updateRow).eq('id', id).select('*').single();

    if (updated.error) {
      throw updated.error;
    }
  }

  if (patch.stretchIds !== undefined) {
    const deletedStretches = await db.from(WORKOUT_STRETCHES_TABLE_NAME).delete().eq('workout_id', id);

    if (deletedStretches.error) {
      throw deletedStretches.error;
    }

    if (patch.stretchIds.length > 0) {
      const stretchRows = patch.stretchIds.map((stretchId, index) => ({
        workout_id: id,
        stretch_id: stretchId,
        sort_order: index + 1,
      }));

      const insertedStretches = await db.from(WORKOUT_STRETCHES_TABLE_NAME).insert(stretchRows);

      if (insertedStretches.error) {
        throw insertedStretches.error;
      }
    }
  }

  return get(id);
}

export async function remove(id: number): Promise<Workout> {
  const existing = await get(id);
  const db = connect();
  const response = await db.from(TABLE_NAME).delete().eq('id', id);

  if (response.error) {
    throw response.error;
  }

  return existing;
}

export async function seed(): Promise<number> {
  const db = connect();

  const data = {
    items: data1 as Array<Record<string, any>>,
  };

  // prepare items for insert
  const workoutKeys = ['userId', 'title', 'workoutTimeMinutes'];
  const items = data.items.map((item) => {
    const snake = toSnakeCase(filterKeys(item, workoutKeys));
    // ensure published_at
    return { ...snake, published_at: new Date().toISOString() };
  });

  const existingRes = await db.from(TABLE_NAME).select('id, title');
  if (existingRes.error) throw existingRes.error;
  const existingTitles = new Set((existingRes.data ?? []).map((r: any) => r.title));

  const toCreate = items.filter((i: any) => !existingTitles.has(i.title));
  if (toCreate.length === 0) return 0;

  const inserted = await db.from(TABLE_NAME).insert(toCreate).select('*');
  if (inserted.error) throw inserted.error;

  // map stretches by name
  const allStretchNames = data.items.flatMap((w: any) => w.stretches || []);
  const stretchRows = await db.from('stretches').select('id, name').in('name', allStretchNames);
  if (stretchRows.error) throw stretchRows.error;
  const stretchByName = new Map<string, number>();
  (stretchRows.data ?? []).forEach((r: any) => stretchByName.set(r.name, r.id));

  for (const created of inserted.data ?? []) {
    const original = data.items.find((w: any) => w.title === created.title);
    if (!original) continue;
    const stretchIds = (original.stretches || []).map((n: string) => stretchByName.get(n)).filter(Boolean) as number[];
    if (stretchIds.length === 0) continue;
    const rows = stretchIds.map((sId, idx) => ({ workout_id: created.id, stretch_id: sId, sort_order: idx + 1 }));
    const r = await db.from(WORKOUT_STRETCHES_TABLE_NAME).insert(rows);
    if (r.error) throw r.error;
  }

  return inserted.data?.length ?? toCreate.length;
}
