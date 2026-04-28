import { connect } from '../models/supabase'

async function cleanup() {
  const db = connect()

  console.log('Fetching users...')
  const res = await db.from('users').select('id, name, role').order('id', { ascending: true })
  if (res.error) {
    console.error('Failed to fetch users:', res.error)
    process.exit(1)
  }

  const rows = res.data as Array<{ id: number; name: string; role: string }>
  const seen = new Map<string, number>()
  const idsToDelete: number[] = []

  for (const row of rows) {
    const key = `${row.name}||${row.role}`
    if (!seen.has(key)) {
      seen.set(key, row.id)
    } else {
      idsToDelete.push(row.id)
    }
  }

  if (idsToDelete.length === 0) {
    console.log('No duplicate users found')
    return
  }

  console.log('Deleting duplicate user ids:', idsToDelete)
  const del = await db.from('users').delete().in('id', idsToDelete)
  if (del.error) {
    console.error('Error deleting duplicates:', del.error)
    process.exit(1)
  }

  console.log('Deleted', del.data?.length ?? idsToDelete.length, 'duplicates')
}

cleanup().catch((err) => {
  console.error(err)
  process.exit(1)
})
