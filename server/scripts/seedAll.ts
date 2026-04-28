import { connect } from '../models/supabase'
import usersData from '../data/users.json'
import stretchesData from '../data/stretches.json'

async function seed() {
  const db = connect()

  console.log('Seeding users...')
  // Avoid inserting duplicate users if script is run multiple times.
  const existingRes = await db.from('users').select('id, name, role')
  if (existingRes.error) {
    console.error('Failed to read existing users:', existingRes.error)
  }

  const existingNames = new Set((existingRes.data ?? []).map((u: any) => `${u.name}||${u.role}`))
  const usersToInsert = usersData
    .map((u: any) => ({ name: u.name, role: u.role }))
    .filter((u: any) => !existingNames.has(`${u.name}||${u.role}`))

  if (usersToInsert.length > 0) {
    const usersRes = await db.from('users').insert(usersToInsert).select()
    if (usersRes.error) {
      console.error('Users seed error:', usersRes.error)
    } else {
      console.log('Inserted users:', usersRes.data?.length ?? 0)
    }
  } else {
    console.log('No new users to insert')
  }

  console.log('Seeding stretches...')
  const stretches = stretchesData.map((s: any) => ({
    name: s.name,
    category: s.category,
    // Map incoming status values to the enum used in schema
    status: ['draft', 'published', 'archived'].includes(s.status?.toLowerCase?.() ?? '')
      ? s.status.toLowerCase()
      : 'published',
    target_muscles: s.targetMuscles || s.target_muscles || [],
  }))

  const chunkSize = 50
  for (let i = 0; i < stretches.length; i += chunkSize) {
    const chunk = stretches.slice(i, i + chunkSize)
    const res = await db.from('stretches').insert(chunk).select()
    if (res.error) {
      console.error('Stretches seed error (chunk', i, '):', res.error)
      break
    } else {
      console.log('Inserted stretches chunk:', res.data?.length ?? 0)
    }
  }

  console.log('Seeding workout_presets...')
  const presets = [
    {
      name: 'Upper Body Quick',
      description: 'Quick upper body routine',
      is_system_preset: true,
      created_by_user_id: 1,
    },
    {
      name: 'Lower Body Basic',
      description: 'Foundational lower-body stretches',
      is_system_preset: true,
      created_by_user_id: 1,
    },
    {
      name: 'Full Body Flow',
      description: 'Flow through full body mobility',
      is_system_preset: true,
      created_by_user_id: 1,
    },
  ]

  const presetRes = await db.from('workout_presets').insert(presets).select()
  if (presetRes.error) {
    console.error('Presets seed error:', presetRes.error)
  } else {
    console.log('Inserted presets:', presetRes.data?.length ?? 0)

    const presetStretchMap = [
      [1, 2, 5, 6], // Upper Body Quick
      [12, 13, 14, 15], // Lower Body Basic
      [19, 20, 21], // Full Body Flow
    ]

    for (let i = 0; i < (presetRes.data?.length ?? 0); i++) {
      const created = presetRes.data![i]
      const stretchIds = presetStretchMap[i] ?? []
      if (stretchIds.length > 0) {
        const rows = stretchIds.map((sId: number, idx: number) => ({ preset_id: created.id, stretch_id: sId, sort_order: idx + 1 }))
        const r = await db.from('workout_preset_stretches').insert(rows)
        if (r.error) {
          console.error('Preset stretches insert error for preset', created.id, r.error)
        }
      }
    }
  }

  console.log('Seeding workouts...')
  const workouts = [
    { user_id: 2, title: "Bob's Morning", workout_time_minutes: 15, published_at: new Date().toISOString() },
    { user_id: 3, title: "Charlie's Quick Warmup", workout_time_minutes: 10, published_at: new Date().toISOString() },
  ]

  const workoutsRes = await db.from('workouts').insert(workouts).select()
  if (workoutsRes.error) {
    console.error('Workouts seed error:', workoutsRes.error)
  } else {
    console.log('Inserted workouts:', workoutsRes.data?.length ?? 0)

    const workoutStretchMap = [
      [9, 10, 11], // Bob's Morning
      [1, 7, 19], // Charlie's Quick Warmup
    ]

    for (let i = 0; i < (workoutsRes.data?.length ?? 0); i++) {
      const created = workoutsRes.data![i]
      const stretchIds = workoutStretchMap[i] ?? []
      if (stretchIds.length > 0) {
        const rows = stretchIds.map((sId: number, idx: number) => ({ workout_id: created.id, stretch_id: sId, sort_order: idx + 1 }))
        const r = await db.from('workout_stretches').insert(rows)
        if (r.error) {
          console.error('Workout stretches insert error for workout', created.id, r.error)
        }
      }
    }
  }

  console.log('Seeding complete')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
