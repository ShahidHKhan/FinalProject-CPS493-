import data from '../data/stretches.json';

export type Stretch = {
  id: number;
  name: string;
  category: string;
  status: string;
  targetMuscles: string[];
};

const stretches = data as Stretch[];

export function getAll(): { stretches: Stretch[]; count: number } {
  return {
    stretches,
    count: stretches.length,
  };
}

export function get(id: number): Stretch {
  const foundStretch = stretches.find((stretch) => stretch.id === id);

  if (!foundStretch) {
    throw new Error(`Stretch with ID ${id} not found`);
  }

  return foundStretch;
}