'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import UploadZone from '@/components/UploadZone'
import ExtractionDossier from '@/components/ExtractionDossier'
import AuthGate from '@/components/AuthGate'
import { getProjects, getPapers, uploadPaper, checkPaperLimit, createProject, deletePaper, deleteProject, updatePaperStatus, supabase } from '@/lib/supabase'
import { exportToExcel } from '@/lib/export'

function Dashboard({ user }) {
  const userId = user.id
  const [projects, setProjects] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [papers, setPapers] = useState([])
  const [usage, setUsage] = useState({ used: 0, limit: 5 })
  const [loading, setLoading] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  useEffect(() => {
    getProjects(userId).then(setProjects).catch(() => {})
    checkPaperLimit(userId).then(setUsage).catch(() => {})
  }, [userId])

 useEffect(() => {
  if (!activeProjectId) return
  setLoading(true)
  getPapers(activeProjectId)
    .then(setPapers)
    .catch(() => {})
    .finally(() => setLoading(false))

  const interval = setInterval(() => {
    getPapers(activeProjectId).then((updated) => {
      setPapers(updated)
      const stillWorking = updated.some(p => !['complete', 'error'].includes(p.status))
      if (!stillWorking) clearInterval(interval)
    }).catch(() => {})
  }, 4000)

  return () => clearInterval(interval)
}, [activeProjectId])

  const activeProject = projects.find(p => p.id === activeProjectId)

async function runExtractionPipeline(paperId) {
  const { data: { session } } = await supabase.auth.getSession()
  await fetch('/api/extract/trigger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ paperId })
  })
  // Inngest now owns the pipeline — polling picks up status changes as usual
}
async function handleFilesSelected(files) {
  for (const file of files) {
    const paper = await uploadPaper(file, userId, activeProjectId)
    setPapers(prev => [paper, ...prev])
    runExtractionPipeline(paper.id) // fire and forget — polling picks up status changes
  }
}

async function handleDeletePaper(paperId) {
  if (!confirm('Delete this paper and its extraction? This cannot be undone.')) return
  await deletePaper(paperId)
  setPapers(prev => prev.filter(p => p.id !== paperId))
}

async function handleRetryPaper(paperId) {
  await updatePaperStatus(paperId, 'uploaded')
  runExtractionPipeline(paperId)
}
  
async function handleDeleteProject(projectId) {
  if (!confirm('Delete this project and all its papers? This cannot be undone.')) return
  await deleteProject(projectId)
  setProjects(prev => prev.filter(p => p.id !== projectId))
  if (activeProjectId === projectId) setActiveProjectId(null)
}
  
  async function handleCreateProject() {
    if (!newProjectName.trim()) return
    const project = await createProject(userId, newProjectName.trim(), '', '')
    setProjects(prev => [project, ...prev])
    setActiveProjectId(project.id)
    setNewProjectName('')
    setShowNewProject(false)
  }

  function handleExport() {
    const extractions = papers
      .map(p => p.extractions_structured)
      .filter(Boolean)
    if (extractions.length === 0) return
    exportToExcel(extractions, `${activeProject?.name || 'evidorax'}_extraction.xlsx`)
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onNewProject={() => setShowNewProject(true)}
        papersUsed={usage.used}
        papersLimit={usage.limit}
        userEmail={user.email}
        onDeleteProject={handleDeleteProject}
        onSignOut={() => supabase.auth.signOut()}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          projectName={activeProject?.name}
          paperCount={papers.length}
          onExport={handleExport}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {activeProjectId ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <UploadZone onFilesSelected={handleFilesSelected} />
              </div>
              {loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '24px 0' }}>Loading dossier…</div>
              ) : (
                <ExtractionDossier papers={papers} 
                  onDeletePaper={handleDeletePaper}
                  onRetryPaper={handleRetryPaper}
                  />
              )}
            </>
          ) : (
            <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Select or create a project to begin
              </div>
              <div style={{ fontSize: 13 }}>Each project holds the papers for one review or one guideline topic.</div>
            </div>
          )}
        </div>
      </div>

      {showNewProject && (
        <div
          onClick={() => setShowNewProject(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(22,25,28,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 340, background: 'var(--paper)', borderRadius: 'var(--radius)', padding: 22 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 14 }}>New project</div>
            <input
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              placeholder="e.g. BCG Vaccine TB Prevention"
              style={{ width: '100%', padding: '9px 10px', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius)', fontSize: 13, marginBottom: 14, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNewProject(false)} style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--text-secondary)', padding: '8px 12px' }}>
                Cancel
              </button>
              <button onClick={handleCreateProject} style={{ background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', fontSize: 13, padding: '8px 14px' }}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return <AuthGate>{(user) => <Dashboard user={user} />}</AuthGate>
}
