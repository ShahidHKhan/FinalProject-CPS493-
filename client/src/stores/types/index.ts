export interface Stretch {
  id: number
  name: string
  category: 'Upper Body' | 'Lower Body' | 'Full Body' | 'Core'
  status: 'Static' | 'Dynamic'
  targetMuscles: string[]
}

export interface Workout {
  id: number
  userId: number
  title: string
  workoutTimeMinutes: number
  stretchIds: number[]
  publishedAt: string
}

export type UserRole = 'admin' | 'regular'

export interface User {
  id: number
  name: string
  role: UserRole
  preferredMuscleGroups: string[]
}
