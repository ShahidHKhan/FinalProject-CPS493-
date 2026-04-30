import { config } from 'dotenv'
config()

import { seed as seedUsers } from './users'
import { seed as seedStretches } from './stretches'
import { seed as seedPresets } from './workoutPresets'
import { seed as seedWorkouts } from './workouts'

async function run() {
  try {
    const [usersCount, stretchesCount] = await Promise.all([seedUsers(), seedStretches()])
    const [presetsCount, workoutsCount] = await Promise.all([seedPresets(), seedWorkouts()])

    console.log(`Users seeded: ${usersCount}`)
    console.log(`Stretches seeded: ${stretchesCount}`)
    console.log(`Presets seeded: ${presetsCount}`)
    console.log(`Workouts seeded: ${workoutsCount}`)

    console.log('Seeding complete')
    process.exit(0)
  } catch (err) {
    console.error('Error seeding data:', err)
    process.exit(1)
  }
}

console.log('Starting seed...')
void run()

export { run as seed }
