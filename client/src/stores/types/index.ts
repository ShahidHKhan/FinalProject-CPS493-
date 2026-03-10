export interface Stretch {
  id: number
  name: string
  category: 'Upper Body' | 'Lower Body' | 'Full Body' | 'Core'
  status: 'Static' | 'Dynamic'
  targetMuscles: string[]
}
