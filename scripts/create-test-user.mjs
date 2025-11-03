import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD

if (!url || !serviceKey) {
  console.error('[create-test-user] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}
if (!email || !password) {
  console.error('[create-test-user] Missing TEST_EMAIL or TEST_PASSWORD in env')
  process.exit(1)
}

const admin = createClient(url, serviceKey)

async function main() {
  try {
    // Check if user exists
    const { data: list, error: listErr } = await admin.auth.admin.listUsers()
    if (listErr) throw listErr
    const exists = list.users.find(u => u.email === email)
    if (exists) {
      console.log(`[create-test-user] User already exists: ${email}`)
      process.exit(0)
    }

    // Create user with email confirmed
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) throw error
    console.log(`[create-test-user] Created user: ${data.user?.id}`)
  } catch (e) {
    console.error('[create-test-user] Failed:', e)
    process.exit(1)
  }
}

main()

