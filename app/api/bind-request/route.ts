// app/api/bind-request/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use SERVICE_ROLE key here (server-only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_handle, username, password } = body
    if (!user_handle || !username || !password) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    // === Plaintext storage (you asked for plain text) ===
    const insertRow = {
      user_handle,
      username,
      hashed_password: password, // storing plain text in this column
      status: 'pending',
      step: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // --- If you want to HASH instead (recommended), comment the above and uncomment below ---
    // import bcrypt from 'bcryptjs'
    // const hashed = await bcrypt.hash(password, 10)
    // const insertRow = { user_handle, username, hashed_password: hashed, status: 'pending', step: 1 }

    const { data, error } = await supabase
      .from('account_binds')
      .insert([insertRow])
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'unknown' }, { status: 500 })
  }
}

