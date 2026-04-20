import data from '../data/stretches.json';
import type { PagingRequest } from '../types';

export type Stretch = {
  id: number;
  name: string;
  category: string;
  status: string;
  targetMuscles: string[];
};

const stretches = data as Stretch[];

export function getAll(params: PagingRequest): { stretches: Stretch[]; count: number } {
  let filteredStretches = [...stretches];

  if (params?.search) {
    const search = params.search.toLowerCase();
    filteredStretches = filteredStretches.filter((stretch) =>
      `${stretch.name} ${stretch.category} ${stretch.status} ${stretch.targetMuscles.join(' ')}`
        .toLowerCase()
        .includes(search),
    );
  }

  if (params?.sortBy) {
    filteredStretches.sort((a, b) => {
      const aValue = a[params.sortBy as keyof Stretch];
      const bValue = b[params.sortBy as keyof Stretch];

      const normalizedA = Array.isArray(aValue) ? aValue.join(', ') : aValue;
      const normalizedB = Array.isArray(bValue) ? bValue.join(', ') : bValue;

      if (normalizedA < normalizedB) {
        return params.descending ? 1 : -1;
      }

      if (normalizedA > normalizedB) {
        return params.descending ? -1 : 1;
      }

      return 0;
    });
  }

  const count = filteredStretches.length;
  const page = Number(params?.page) || 1;
  const pageSize = Number(params?.pageSize) || 10;
  const start = (page - 1) * pageSize;
  filteredStretches = filteredStretches.slice(start, start + pageSize);

  return {
    stretches: filteredStretches,
    count,
  };
}

export function get(id: number): Stretch {
  const foundStretch = stretches.find((stretch) => stretch.id === id);

  if (!foundStretch) {
    throw new Error(`Stretch with ID ${id} not found`);
  }

  return foundStretch;
}

export function create(stretchInput: Omit<Stretch, 'id'>): Stretch {
  const nextId = stretches.length > 0 ? Math.max(...stretches.map((stretch) => stretch.id)) + 1 : 1;

  const createdStretch: Stretch = {
    id: nextId,
    ...stretchInput,
  };

  stretches.push(createdStretch);

  return createdStretch;
}

export function update(id: number, stretchPatch: Partial<Omit<Stretch, 'id'>>): Stretch {
  const stretchIndex = stretches.findIndex((stretch) => stretch.id === id);

  if (stretchIndex === -1) {
    throw new Error(`Stretch with ID ${id} not found`);
  }

  stretches[stretchIndex] = {
    ...stretches[stretchIndex],
    ...stretchPatch,
    id,
  };

  return stretches[stretchIndex];
}

export function remove(id: number): Stretch {
  const stretchIndex = stretches.findIndex((stretch) => stretch.id === id);

  if (stretchIndex === -1) {
    throw new Error(`Stretch with ID ${id} not found`);
  }

  const removedStretch = stretches.splice(stretchIndex, 1);

  return removedStretch[0];
}