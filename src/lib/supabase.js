import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function uploadPaper(file, userId, projectId) {
  const path = `${userId}/${projectId}/${Date.now()}_${file.name}`
  const { error: storageError } = await supabase.storage.from('papers').upload(path, file)
  if (storageError) throw storageError
  const { data, error } = await supabase.from('papers').insert({
    project_id: projectId, user_id: userId, filename: file.name, storage_path: path,
    file_size_bytes: file.size, status: 'uploaded'
  }).select().single()
  if (error) throw error
  return data
}

export async function getPapers(projectId) {
  const { data, error } = await supabase.from('papers').select(`*, extractions_structured(*), verifications(accuracy_rate, verified_count, total_fields)`).eq('project_id', projectId).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updatePaperStatus(paperId, status, errorMessage = null) {
  const { error } = await supabase.from('papers').update({ status, error_message: errorMessage, updated_at: new Date().toISOString() }).eq('id', paperId)
  if (error) throw error
}

export async function getExtraction(paperId) {
  const { data, error } = await supabase.from('extractions_structured').select('*').eq('paper_id', paperId).single()
  if (error) throw error
  return data
}

export async function saveCorrection(paperId, userId, fieldName, originalValue, correctedValue) {
  const { error } = await supabase.from('corrections').insert({ paper_id: paperId, user_id: userId, field_name: fieldName, original_value: originalValue, corrected_value: correctedValue })
  if (error) throw error
  const { error: updateError } = await supabase.from('extractions_structured').update({ [fieldName]: correctedValue, updated_at: new Date().toISOString() }).eq('paper_id', paperId)
  if (updateError) throw updateError
}

export async function getProjects(userId) {
  const { data, error } = await supabase.from('projects').select('*, papers(count)').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createProject(userId, name, description, topic) {
  const { data, error } = await supabase.from('projects').insert({ user_id: userId, name, description, topic }).select().single()
  if (error) throw error
  return data
}

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function checkPaperLimit(userId) {
  const profile = await getProfile(userId)
  return { used: profile.papers_used, limit: profile.papers_limit, remaining: profile.papers_limit - profile.papers_used, canUpload: profile.papers_used < profile.papers_limit || profile.plan !== 'free' }
}
