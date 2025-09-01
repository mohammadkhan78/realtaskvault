import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function submitProof(file: File, offerId: string, userId: string) {
  const filePath = `proofs/${userId}-${Date.now()}-${file.name}`

  // Upload file to bucket
  const { error: uploadErr } = await supabase.storage
    .from("proofs")
    .upload(filePath, file, { upsert: true })

  if (uploadErr) {
    console.error("Upload failed:", uploadErr.message)
    throw uploadErr
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("proofs")
    .getPublicUrl(filePath)

  const proofUrl = urlData.publicUrl

  // Save submission row
  const { error: dbErr } = await supabase.from("submissions").insert({
    user_id: userId,
    offer_id: offerId,
    proof_url: proofUrl,
    status: "pending",
  })

  if (dbErr) {
    console.error("Submission DB insert failed:", dbErr.message)
    throw dbErr
  }

  return proofUrl
}
