import { config } from 'dotenv'
config()

import { fileURLToPath } from 'url'
import { seed as seedUsers } from './users'
import { seed as seedStretches } from './stretches'
import { seed as seedPresets } from './workoutPresets'
import { seed as seedWorkouts } from './workouts'

async function run() {
  try {
    // seed order: users -> stretches -> presets -> workouts
    await seedUsers()
    await seedStretches()
    await seedPresets()
    await seedWorkouts()

    console.log('Seeding complete')
    process.exit(0)
  } catch (err) {
    console.error('Error seeding data:', err)
    process.exit(1)
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  void run()
}

export { run as seed }
