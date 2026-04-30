export type { DataEnvelope, DataListEnvelope, PagingRequest } from './dataEnvelopes';

export type product = {
  id: number;
  name: string;
  price: number;
  description: string;
};

export type userRole = 'admin' | 'moderator' | 'user';

export type userAddress = {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
};

export type user = {
  id?: number;
  firstname?: string;
  lastname?: string;
  gender?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  image?: string;
  address?: userAddress;
  role?: userRole;
};

export type simpleUser = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  preferredMuscleGroups?: string[];
};