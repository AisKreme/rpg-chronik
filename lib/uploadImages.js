import { supabase } from './supabaseClient'

export async function uploadImages(files, entryId) {
  const uploadedUrls = []

  if (!Array.isArray(files)) {
    files = Array.from(files) // absichern gegen FileList
  }

  for (const file of files) {
    if (!file?.name) continue

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${entryId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('chronik-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('❌ Fehler beim Hochladen:', uploadError.message)
      continue
    }

    const { data } = supabase.storage
      .from('chronik-images')
      .getPublicUrl(filePath)

    if (data?.publicUrl) {
      uploadedUrls.push(data.publicUrl)
    }
  }

  return uploadedUrls
}