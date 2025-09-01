// app/api/withdrawals/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_handle, method, amount, upi_id = null, email = null, phone = null } = body

    if (!user_handle || !method || !amount) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 })
    }

    // Call the DB function to atomically deduct & insert
    const { data, error } = await supabaseAdmin.rpc('request_withdrawal_handle', {
      p_handle: user_handle,
      p_method: method,
      p_amount: amount,
      p_upi: upi_id,
      p_email: email,
      p_phone: phone
    })

    if (error) {
      console.error('rpc error', error)
      // Interpret common Postgres exceptions
      if (error.message?.includes('insufficient_balance')) {
        return NextResponse.json({ error: 'insufficient_balance' }, { status: 400 })
      }
      if (error.message?.includes('profile_not_found')) {
        return NextResponse.json({ error: 'profile_not_found' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('server error', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
